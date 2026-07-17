## HL Backend Architecture & Write Pipeline (Core Doctrine — Not a Tool Page)

**File:** N/A — this is the platform's backend architecture reference, not a live tool. No URL to send a user to.
**Status:** Canonical, locked

**Purpose:** This is how data actually moves through the HIL System — which writes are allowed, which are blocked, and where they really go. PATCH should treat this as ground truth when anyone (including Dan) asks "why didn't my save work," "how does Vault actually save an item," "can I write directly to X," or any backend/architecture troubleshooting question.

---

## The Core Rule (Authority Layer Doctrine)

**"If it tells a story, frontend can save it; if it becomes inventory truth, backend must commit it."**

`item_records` — the canonical inventory collection — is `allow write: if false` in Firestore rules. **Unconditionally.** No frontend code, no matter how it's written, can write directly to `item_records`. This is not a bug. It is the single hardest rule in the platform.

The one narrow, explicitly approved exception: the `room_position` field, for Room Visualizer only, allowed as a field-level write exception.

Everything else that becomes real inventory truth has to go through `hil-admin-action` — a Cloud Run service using the Firebase Admin SDK, which is the only thing with permission to write `item_records`.

## What Frontend CAN Write Directly

These collections are frontend-writable, no backend round-trip required, because they don't carry the weight of being "official inventory truth":

- `museum_items` — private Museum pushes
- `staged_items` — items waiting to be reviewed/committed (drafts, not yet real inventory)
- Badges / milestones — gamification layer
- `exchange_listings` — HIL Exchange listings
- `properties/zones` geometry — Room Visualizer's zone shapes

## What Frontend CANNOT Write Directly — Must Route Through Backend

- Anything touching `item_records` (except the `room_position` field exception noted above)
- Committing a `staged_items` draft into real inventory
- Archiving/soft-deleting an item
- Editing an existing item's fields

## The Vault Save Pipeline — Step by Step

This is the answer to "how does saving an item in Vault actually work":

1. User edits/creates an item in the Vault UI (`hl-vault-cloud.html`)
2. Vault does **NOT** write to Firestore directly anymore. Old code that did `db.collection('users').doc(uid).collection('item_records').doc(id).set(...)` will always fail now — that path is blocked by the rules.
3. Instead, Vault calls into `vault-item-client.js` — a small ES module loaded via dynamic `import()` (must use ES module `export` syntax, not `window.X` — dynamic import silently yields undefined otherwise)
4. `vault-item-client.js` reads the signed-in user from `window.currentUser` (set by `hil-shell.js`'s modular-SDK `onAuthStateChanged` — there is no global `firebase` namespace on these pages, so you can't call `firebase.auth().currentUser`, only the modular SDK pattern)
5. It grabs that user's Firebase ID token (`user.getIdToken()`)
6. It POSTs to `hil-admin-action` at `https://hil-admin-action-937314472168.us-central1.run.app`, with `Authorization: Bearer <token>` and a JSON body
7. `hil-admin-action` verifies the token server-side (Firebase Admin SDK), checks the fields against a whitelist, and only then writes to `item_records`

### The three client functions

```javascript
vaultUpdateItem(itemId, fields)   // POST /update-item  — owner-only field edits against a whitelist
vaultArchiveItem(itemId, reason)  // POST /archive-item  — soft-delete only, writes a provenance log entry, never a hard delete
vaultCommitStaged(stagedItemId)   // POST /commit-staged — promotes a staged_items draft into real item_records
```

### `/commit-staged` has two branches

- `source: "manual"` — the item was staged by the owner directly in the UI, requires owner-confirm
- `source: "email_ingest"` — the item came from the email-forwarding receipt pipeline, requires admin-approval before it becomes real inventory

## The Email Ingestion Pipeline (context for how staged_items gets populated)

Users forward purchase receipts to `username@hilsystem.com`. A Cloudflare Worker (`hil-email-ingest`) parses the email (handles RFC 2047 encoded subjects, Amazon multi-order digest format, Harbor Freight per-unit repetition collapsed into one record per SKU with summed quantity) and POSTs the parsed result to `hil-admin-action`'s `/webhook/ingest` endpoint, authenticated via an `X-Worker-Secret` header. This creates a `staged_items` draft with `source: "email_ingest"` — it does NOT touch `item_records` directly. A human still has to review and commit it. No auto-scraping, no bypassing the human-in-loop review.

## Containment Model (relevant to any "where does X live" backend question)

Containment is universal — not restricted to container-shaped objects. A chair, a cushion, a couch can all be valid `parent_ref` targets, same as a bin or a drawer. This is AI-context infrastructure (so an AI assistant can reason about "what's on/in what"), not just a UI nesting convenience. Vessel-to-vessel nesting uses `containment.parent_ref`.

## Museum / History Wall — the naming rule

"Museum" = the private, per-user tool. Items get pushed from Vault into Museum along with their story/provenance.
"History Wall" = the **public surface** of that exact same tool, reached via an explicit per-item opt-in push.

It is one tool with two surfaces, not two separate systems. There is no separate global `history_wall` collection, and there's no "Wunderkammer / cabinet of curiosities" concept — both of those were considered and explicitly deprecated in favor of the single Museum-with-a-public-surface model.

## The Stack, For Reference

- **Frontend hosting:** Cloudflare Pages, auto-deploys from GitHub `main`
- **Database:** Firebase / Firestore (`us-central1`)
- **Auth:** Firebase Auth — Google, GitHub, and Email/Password
- **File storage:** Cloudflare R2 (`hilsystem-assets` bucket), served via `assets.hilsystem.com`
- **Backend write authority:** Google Cloud Run — `hil-admin-action` is the primary inventory writer
- **AI backend:** Cloudflare Worker `hil-patch-agent`, using Gemini 2.5 Flash
- **Email routing:** Cloudflare Email Routing (`*@hilsystem.com`) → `hil-email-ingest` Worker

---

**Common questions this doc answers (for PATCH):**
- "Why did my save fail / why can't I edit this item directly?" → `item_records` blocks all direct frontend writes except the `room_position` field. Every real save has to go through `hil-admin-action` using the signed-in user's ID token.
- "How does an item get from 'staged' to 'real inventory'?" → It sits in `staged_items` until `/commit-staged` is called, which branches based on whether it came from manual entry (owner-confirm) or email ingestion (admin-approval).
- "Can I write directly to museum_items / staged_items / exchange_listings?" → Yes — these are explicitly frontend-writable, no backend round-trip needed.
- "What's the difference between Museum and History Wall?" → Same tool, two surfaces. Museum is private-by-default; History Wall is the public view after an explicit opt-in push per item.
- "Can a couch or chair be a container for other items?" → Yes — containment is universal, any object can be a `parent_ref` target, not just container-shaped things.

*HL Backend Architecture Doc v1.0 — July 2026*
