/**
 * email-parsers.js
 * Turns rawEmail (as forwarded by hil-email-ingest Worker) into a structured
 * payload suitable for staged_items docs with source: "email_ingest".
 *
 * Rewritten against real captured samples (Amazon + Harbor Freight,
 * July 2026). Key findings from the real files that the first draft
 * got wrong or guessed at:
 *
 *  - Amazon subject lines are RFC 2047 encoded-word ("=?UTF-8?B?...?=",
 *    folded across header lines). Must decode before checking the
 *    "Ordered:" prefix — a raw .startsWith() check silently failed
 *    against every real Amazon email.
 *  - Amazon has a genuinely easier text/plain MIME part alongside the
 *    HTML — parse that instead of regexing the HTML.
 *  - A single Amazon digest email can contain MULTIPLE orders, each
 *    with its own Order #, item(s), and Grand Total. The old parser
 *    assumed one item per email; that's wrong.
 *  - Harbor Freight has no text/plain part — HTML only, quoted-printable
 *    encoded. Confirmed pattern: name="Item Name" anchor -> SKU ->
 *    price -> × qty -> Item Subtotal, repeating per unit (buying 4 of
 *    the same SKU produces 4 separate identical-looking blocks, not
 *    one block with quantity:4 — this is real receipt behavior, not
 *    a template duplication bug, confirmed against the sample).
 *  - Harbor Freight order-level Subtotal / Sales Tax / Total live in a
 *    label-div + value-div pair near the end of the HTML, distinct
 *    from the per-item "Item Subtotal:" labels.
 *
 * Home Depot / Lowes / Temu: no samples captured — detectVendor()
 * returns null for these, pass-through un-parsed rather than erroring.
 * VEVOR: intentionally unparsed — order confirmation (not a paid
 * receipt) with embedded PII, flagged for a PII-handling decision
 * that hasn't been made yet.
 */

// ── MIME helpers ────────────────────────────────────────────────

// Decodes quoted-printable body text to a UTF-8 string.
function decodeQuotedPrintable(input) {
  const noSoftBreaks = input.replace(/=\r\n/g, "").replace(/=\n/g, "");
  const bytes = [];
  for (let i = 0; i < noSoftBreaks.length; i++) {
    const ch = noSoftBreaks[i];
    if (ch === "=" && /^[0-9A-Fa-f]{2}$/.test(noSoftBreaks.substr(i + 1, 2))) {
      bytes.push(parseInt(noSoftBreaks.substr(i + 1, 2), 16));
      i += 2;
    } else {
      bytes.push(ch.charCodeAt(0) & 0xff);
    }
  }
  return Buffer.from(bytes).toString("utf8");
}

// Decodes an RFC 2047 encoded-word subject header (e.g. Amazon's
// "=?UTF-8?B?...?=" folded across lines). Falls back to the raw
// string if no encoded-words are present (e.g. Harbor Freight's
// plain-ASCII subject).
function decodeRFC2047Subject(subjectRaw) {
  if (!subjectRaw) return "";
  const cleaned = subjectRaw.replace(/\r?\n\s+/g, " "); // unfold header
  const tokenRe = /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g;
  const tokens = [...cleaned.matchAll(tokenRe)];
  if (tokens.length === 0) return cleaned.trim();

  const buffers = tokens.map(([, , enc, data]) => {
    if (enc.toUpperCase() === "B") {
      return Buffer.from(data, "base64");
    }
    const qDecoded = data
      .replace(/_/g, " ")
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    return Buffer.from(qDecoded, "latin1");
  });
  return Buffer.concat(buffers).toString("utf8").trim();
}

// Recursively walks a MIME multipart structure and returns the decoded
// body text of the first part matching wantedContentType, or null.
function extractMimePart(rawEmail, wantedContentType) {
  const ctMatch = rawEmail.match(
    /Content-Type:\s*multipart\/[^;]+;\s*[\r\n\s]*boundary="?([^"\r\n]+)"?/i
  );
  if (!ctMatch) return null;

  const boundary = ctMatch[1];
  const parts = rawEmail.split(`--${boundary}`);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed || trimmed === "--") continue;

    const typeRe = new RegExp(`Content-Type:\\s*${wantedContentType.replace("/", "\\/")}`, "i");
    if (typeRe.test(part) && !/Content-Type:\s*multipart\//i.test(part)) {
      const splitIdx = part.indexOf("\r\n\r\n") !== -1
        ? part.indexOf("\r\n\r\n") + 4
        : part.indexOf("\n\n") + 2;
      const headers = part.slice(0, splitIdx);
      const body = part.slice(splitIdx);
      const isQP = /Content-Transfer-Encoding:\s*quoted-printable/i.test(headers);
      return isQP ? decodeQuotedPrintable(body) : body;
    }
  }

  // Not found at this level — recurse into any nested multipart parts.
  // parts[0] is always the MIME preamble (text before the first boundary
  // marker), which still contains the OUTER Content-Type header we just
  // matched against — recursing into it re-matches the same boundary
  // forever. Skip it; only real parts (index 1+) can contain nested
  // multipart sections.
  for (const part of parts.slice(1)) {
    if (/Content-Type:\s*multipart\//i.test(part)) {
      const nested = extractMimePart(part, wantedContentType);
      if (nested) return nested;
    }
  }
  return null;
}

function getHeader(rawEmail, name) {
  const re = new RegExp(`^${name}:\\s*(.+?)(?:\\r?\\n(?!\\s)|$)`, "ims");
  const m = rawEmail.match(re);
  return m ? m[1].replace(/\r?\n\s+/g, " ").trim() : null;
}

// ── vendor detection ─────────────────────────────────────────────
function detectVendor(from) {
  const fromLower = (from || "").toLowerCase();
  if (fromLower.includes("amazon.com") || fromLower.includes("amazonses.com")) return "amazon";
  if (fromLower.includes("harborfreight.com")) return "harbor_freight";
  if (fromLower.includes("vevor.com")) return "vevor";
  return null;
}

// ── dispatcher ────────────────────────────────────────────────────
// Returns null (drop) or { vendor, orders: [...] } — always a list of
// order-groups, even for vendors that only ever produce one, so the
// caller has one shape to fan out into staged_items.
function parseReceiptEmail(rawEmail) {
  const from = getHeader(rawEmail, "From");
  const subjectRaw = getHeader(rawEmail, "Subject");
  const vendor = detectVendor(from);
  if (!vendor) return null;

  switch (vendor) {
    case "amazon":
      return parseAmazon(rawEmail, subjectRaw);
    case "harbor_freight":
      return parseHarborFreight(rawEmail, subjectRaw);
    case "vevor":
      return null; // PII + not-yet-paid confirmation — see header note
    default:
      return null;
  }
}

// ── AMAZON ──────────────────────────────────────────────────────
// Only "Ordered: ..." emails carry pricing. "Shipped:"/"Delivered:"
// are status-only and must be dropped, not parsed as zero-cost receipts.
// A single email can bundle multiple orders — split on "Order #" markers.
function parseAmazon(rawEmail, subjectRaw) {
  const subject = decodeRFC2047Subject(subjectRaw);
  if (!subject.startsWith("Ordered:")) {
    return null; // Shipped/Delivered/etc — no pricing data, drop silently
  }

  const plainText = extractMimePart(rawEmail, "text/plain");
  if (!plainText) return null; // couldn't find the part we know how to parse

  // The real template repeats the "Arriving.../Daniel.../Order #.../View
  // or edit order" header block once PER ITEM, not once per order — so
  // splitting on "Order #" produces one phantom chunk per item instead
  // of one per order. The actual order boundary is "Grand Total:", which
  // appears exactly once per order, after all of that order's items.
  // Segment on Grand Total instead; grab the order number (it repeats
  // identically within the segment, so any match works) and every item
  // bullet within that segment.
  const totalRe = /Grand Total:\s*\n\s*([\d.]+)\s*USD/g;
  const orders = [];
  let segmentStart = 0;
  let m;
  while ((m = totalRe.exec(plainText)) !== null) {
    const segment = plainText.slice(segmentStart, m.index);
    segmentStart = totalRe.lastIndex;

    const orderNumMatch = segment.match(/Order #\s*\n\s*(\d{3}-\d{7}-\d{7})/);
    if (!orderNumMatch) continue;
    const orderNumber = orderNumMatch[1];

    const itemRe = /\*\s*(.+?)\s*\n\s*Quantity:\s*(\d+)\s*\n\s*([\d.]+)\s*USD/g;
    const items = [];
    let im;
    while ((im = itemRe.exec(segment)) !== null) {
      items.push({
        name: im[1].trim(),
        quantity: parseInt(im[2], 10),
        price: parseFloat(im[3]),
      });
    }

    if (items.length > 0) {
      orders.push({ order_number: orderNumber, items, grand_total: parseFloat(m[1]) });
    }
  }

  if (orders.length === 0) return null;

  return { vendor: "Amazon", orders };
}

// ── HARBOR FREIGHT ──────────────────────────────────────────────
// No text/plain part — HTML only. X-FR-RECEIPT-ID header gives a
// clean unique ID per receipt. Repeating per-unit item blocks:
// name="Item Name" anchor -> SKU -> price -> × qty -> Item Subtotal.
// Order-level Subtotal / Sales Tax / Total are separate label/value
// div pairs near the end, distinguished from "Item Subtotal:" by not
// having the "Item" prefix.
function parseHarborFreight(rawEmail, subjectRaw) {
  const receiptId = getHeader(rawEmail, "X-FR-RECEIPT-ID");

  const html = extractMimePart(rawEmail, "text/html");
  if (!html) return null;

  // e.g. "Your receipt from Harbor Freight | MARSHFIELD  WI #03316"
  const subject = subjectRaw || "";
  const storeMatch = subject.match(/\|\s*(.+?)\s*#(\d+)\s*$/);
  const store = storeMatch
    ? { name: storeMatch[1].trim(), store_number: storeMatch[2] }
    : null;

  const itemRe =
    /name="Item Name"[^>]*>([^<]+)<\/a>[\s\S]{0,600}?SKU\s*(\d+)[\s\S]{0,900}?\$\s*([\d.]+)\s*<\/div>\s*<div[^>]*>\s*×\s*(\d+)/g;
  const rawItems = [];
  let m;
  while ((m = itemRe.exec(html)) !== null) {
    rawItems.push({
      name: m[1].trim(),
      sku: m[2].trim(),
      price: parseFloat(m[3]),
      quantity: parseInt(m[4], 10),
    });
  }

  if (rawItems.length === 0) return null;

  // Harbor Freight lists one block per physical unit (buying 4 of the
  // same SKU produces 4 identical blocks, each "× 1"), confirmed against
  // the real sample — not a template bug. Per Dan's decision (July 2026):
  // collapse into ONE item_record per SKU with quantity summed, not one
  // record per unit.
  const bySku = new Map();
  for (const item of rawItems) {
    const existing = bySku.get(item.sku);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      bySku.set(item.sku, { ...item });
    }
  }
  const items = [...bySku.values()];

  // ">\s*Subtotal:" (not ">\s*Item Subtotal:") isolates the order-level
  // line from the seven-times-repeated per-item "Item Subtotal:" labels.
  const subtotalMatch = html.match(/>\s*Subtotal:\s*<\/div>[\s\S]{0,300}?\$\s*([\d.]+)\s*<\/div>/);
  const taxMatch = html.match(/>\s*Sales Tax:\s*<\/div>[\s\S]{0,300}?\$\s*([\d.]+)\s*<\/div>/);
  const totalMatch = html.match(/>\s*Total:\s*<\/div>[\s\S]{0,300}?\$\s*([\d.]+)\s*<\/div>/);

  return {
    vendor: "Harbor Freight",
    orders: [
      {
        receipt_id: receiptId,
        store,
        items,
        subtotal: subtotalMatch ? parseFloat(subtotalMatch[1]) : null,
        tax: taxMatch ? parseFloat(taxMatch[1]) : null,
        grand_total: totalMatch ? parseFloat(totalMatch[1]) : null,
      },
    ],
  };
}

module.exports = {
  decodeQuotedPrintable,
  decodeRFC2047Subject,
  extractMimePart,
  detectVendor,
  parseReceiptEmail,
  parseAmazon,
  parseHarborFreight,
};
