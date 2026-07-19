## Insurance Report

**File:** hil-insurance-report.html
**URL:** hilsystem.com/tools/hil-insurance-report.html (linked from Family Ledger sidebar)
**Status:** Live — deployed to `tools/`, confirmed generating a real report against live item data.

**Purpose:** Turns your existing item catalog into an insurance-agent-ready replacement value report — photo, location, purchase price, adjusted market value, requested coverage, and a rider flag per item — grouped by room, with subtotals and a grand total. Built so you can hand an agent one document and they can process a claim or set up a rider without back-and-forth.

**Core Features:**
- Property picker, so it works even once you have more than one property
- Groups items by room using the same zone label resolution every other HIL tool uses
- Computes an "eBay Adjusted Value" — takes the raw eBay comp and knocks off a fee/shipping percentage (defaults to 20%) to estimate what you'd actually net, not just what it sold for
- Fee adjustment % is editable right on the report, with an optional "save as default" so it doesn't reset every time
- Flags items where requested coverage significantly outpaces adjusted value (>20% over) — the visual cue that an item might need a scheduled/agreed-value rider instead of relying on blanket coverage
- Separately flags items with no eBay comp on file at all, so those get a manual look instead of silently being treated as fine
- Room subtotals and a grand total, shown both at the top and bottom of the report
- Print button with dedicated print styling — strips the nav/header/toasts so what prints is just the report
- Items with no `current_value` or `insured_value` set are automatically left out, so the report doesn't pad itself with blanks

**How it connects:**
- Reads from: `item_records` (financial, hero_photo, hl_address, exchange.ebay_baseline), `properties/{id}` and `properties/{id}/zones/{code}` for room labels, `users/{uid}` for the saved fee % preference
- Writes to: `users/{uid}.prefs.insurance_fee_adjustment_pct` — only when you explicitly check "save as default." Nothing else. Rider flags are computed at print time only, never written back to `item_records`.
- Entry points: Insurance Report link in the Family Ledger section of the Admin sidebar (opens in a new tab); can also be linked directly from a Family Ledger item view later if you want that
- Cross-tool data flows: entirely read-only against the Universal Item Record — it's a query + render layer, no new schema, no new collection

**Known limitations / not yet live:**
- No PDF export yet — v1 is browser print-to-PDF, which covers the same need but isn't a native PDF generation pipeline
- No live eBay repricing — uses whatever `ebay_baseline` is already stored on the item; refreshing that number is Exchange's job, not this report's
- Fee adjustment is global only, not per-category (records/apparel/electronics may realistically have different real-world margins)
- Rider flag doesn't persist — it recalculates fresh every time you generate the report, so there's no history of "this item has been flagged three reports running"
- No heirloom/heritage exclusion flag — every item with a value set will appear in the report, even ones you might not want a dollar figure attached to in a shareable document
- Assumes single-property use for now, though the property picker is already there for when that changes

**Common questions this tool answers:**
- "Can I hand this straight to my insurance agent?" — Yes, that's the point. Print or save as PDF from the browser and it's ready to go.
- "Why is the value shown lower than what I see on eBay?" — That's the adjusted value — it backs out fees, promoted listing costs, and shipping (20% by default) to estimate what you'd actually net, not the raw sold price.
- "What does the rider flag mean?" — It means your requested coverage is running meaningfully ahead of what the item would likely fetch, which is usually the sign to talk to your agent about a scheduled/agreed-value rider instead of leaning on blanket coverage.
- "Why isn't an item showing up in the report?" — It needs either a current value or an insured value set on the record. No value, no row.
- "Does this change anything on my actual inventory records?" — No. It only reads. The one exception is if you explicitly save a new default fee percentage, which writes to your own user prefs, not to any item.

---

### Upgrade ideas (not built — future session candidates)

- **PDF export via the pdf skill** — fast-follow already called out in the spec; browser print-to-PDF works fine today but a native PDF pipeline would look more polished and let you batch-generate reports for multiple properties at once
- **Per-category fee adjustment** — e.g. vinyl records net differently than electronics; would need a small mapping table (category → fee %) instead of one global number
- **Heirloom/heritage exclusion flag** — `display.insurance_report: boolean` mirroring the existing `display.*` pattern, defaulting to true, so you can pull sentimental items out of a document you might hand to a third party
- **Persisted rider-flag history** — write `financial.rider_flag` back to the item record so PATCH could eventually nudge you ("this item's been flagged for a rider three reports running — want to look into that?")
- **Multi-property batch export** — generate one combined report across all properties instead of picking one at a time
- **Direct entry point from Family Ledger item view** — right now it's a standalone tool reached from the Admin sidebar; could add a "generate insurance report" action right on an item's detail overlay
