## Bin Tag

**File:** `tools/bin-tag.html`
**URL:** `hilsystem.com/tools/bin-tag.html` (behind Cloudflare Access — not publicly reachable)
**Status:** Live

**Purpose:** Fast field cataloging for a large, disorganized pile of items — an estate cleanout, a storage unit, a room you're finally clearing out — where the goal is to log everything quickly, then decide what's actually worth selling individually, worth lotting together, worth keeping forever, or just worth donating/dumping, without wasting real effort on things that don't deserve it.

**Core Features:**
- Location logging in three modes: a real HL address, a freeform tape-color/table-number tag for unmapped spaces, or a temporary `ES-{code}-P{n}-A0` estate address that gives every item a permanent, searchable receipt number even after the physical object is gone
- Reusable Provenance tags — write a person's story once ("Harry Ames — built the farm, worked Walworth County his whole life"), attach it to as many items as apply, no retyping
- Quick tags (Material/Origin) — tap-to-attach category chips (Glass, Textiles, Corporate Surplus, Collectible, etc.) that speed up both human scanning and the AI passes below
- AI Assess — photo + description in, a realistic resale value range and condition grade out, with a markup factored in when real provenance is attached
- AI Triage pass — one batch call sorts everything still "Unsorted" into Individual / Lot / Keep / Donate / Rummage, so full photo assessment only happens on things flagged worth it
- AI Lot suggestion — groups similar or thematically-linked items into sellable lots
- Disposition-driven Push — each item's disposition routes it to where it actually needs to go (see "How it connects" below); disposition itself is free and reversible, Push is the explicit, confirmed action with real consequences
- Manual "Merge into lot" — fold individually-logged items into a new or existing lot after the fact, not just via AI suggestion
- QR codes — per-item and per-lot, printable as a label sheet, scan to jump straight back to that record (or, for a lot, to every item in it)

**How it connects:**
- Reads from: `staged_items` (its own working set, `source: 'bintag'`), `users/{uid}/bintag_tags` (provenance tag library), `users/{uid}/tag_registry` (shared Material/Origin quick tags — same registry Tag Manager reads/writes)
- Writes to: `staged_items` (create/update, all logged items start here), `users/{uid}/bintag_tags`, `users/{uid}/tag_registry` (creates new quick tags, bumps `usage_count` on push), and — only on Push — real `item_records` (via `hil-admin-action` `/commit-staged` then `/update-item`), `exchange_listings`, or `museum_items`
- Entry points: direct URL only right now — not yet added to `hil-shell.js`'s `NAV_TOOLS`, so it doesn't appear in the site nav. Bookmark or link it manually until that's added.
- Cross-tool data flows: items dispositioned **Individual** or **Lot** become real `item_records` and show up in Vault, then get a live `exchange_listings` entry automatically — no separate listing step in Exchange itself. Items dispositioned **Keep** go straight to Museum as a permanent story record, no `item_record` required. Items dispositioned **Donate** or **Rummage** never become inventory — they stay a permanent `staged_items` record (name, photo, provenance, disposition) so the item is still searchable years later, even though it's long gone from the house.

**Known limitations / not yet live:**
- **AI features depend on a Worker URL being set correctly** — `AI_WORKER_URL` in the file must point at the deployed `hil-bintag-agent` Worker. If Assess/Triage/Suggest Lots silently fail, check that constant first.
- **Lots aren't bundled Exchange listings.** Exchange has no native multi-item-listing concept, so a Lot's items each get their own `exchange_listings` doc, tied together only by a shared `lot_code`/`lot_label`, not one combined listing a buyer sees as a single unit.
- **QR codes only work for the signed-in owner.** They link back into Bin Tag itself, which is owner-only under Firestore rules — a stranger scanning a tag on a donated or rummage-sale item won't see anything without logging in. A public-facing QR (pointing at the live Exchange listing instead) is a natural follow-up once Exchange's listing-detail URL convention is confirmed.
- **Tag selections don't persist between items yet.** Provenance and Quick tags clear after every "Log item" — cataloging a run of similar items means re-tapping the same tags each time. A "keep tags for next item" toggle is the identified fix, not yet built.
- **Only Condition and Price are inline-editable** in the logged-items table; fixing a typo in Name, Category, or Qty currently means delete-and-relog.
- **No bulk retroactive tag application** — if you realize five already-logged items should carry a provenance tag you just created, there's no multi-select "apply tag to selection" action yet; only new items get the picker.
- **`usage_count` incrementing on quick tags is inferred, not confirmed** against Vault's actual tag-attachment behavior — worth spot-checking in Tag Manager after your first real push.

**Common questions this tool answers:**
- "Can you help me catalog my dad's shed before the estate sale?" → Yes, that's exactly what Bin Tag is for — log fast, sort by value afterward, at `hilsystem.com/tools/bin-tag.html`.
- "What's the difference between an Individual listing and a Lot in Bin Tag?" → Individual means it's distinctive enough to sell and photograph on its own; Lot means it sells better grouped with similar items — both end up live on Exchange, Individual as its own listing.
- "If I donate something through Bin Tag, do I lose the record of it?" → No — Donate and Rummage items stay permanently searchable, they just never become active inventory or a listing.
- "Does it matter if I know an item's real address?" → No — use a freeform tag for an unmapped space, or a temporary estate address if you're clearing someone else's house and there's no real HL property involved.
- "Can I print something to stick on a box of items I'm selling as a group?" → Yes — approve or manually merge a lot, then use "Print lot QR" for one QR covering the whole group.
