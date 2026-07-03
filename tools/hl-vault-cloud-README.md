## HL Vault

**File:** `hl-vault-cloud.html`
**URL:** `hlsystem.org/tools/hl-vault-cloud.html`
**Status:** Beta

**Purpose:** The user's private inventory record — every physical object they own, tagged with an HL address, stored in their personal Firestore collection. The Vault is the write surface for `item_records`, which is the authoritative data layer the entire HIL platform reads from.

**Core Features:**
- Google Sign-In auth gate — no content visible until authenticated
- Add, edit, and delete item records with full HL address builder (Structure / Zone / Section / Shelf)
- Filter by category (Tool, Fastener, Appliance, Heirloom, Zone, Container, Electrical, Supply, Other)
- Filter by structure prefix and by high-value / estate flag
- Sort by newest, oldest, address, item name, or highest value
- Full-text search across address, item name, human name, make, model, notes, category
- Stats bar: total records, total estimated value, heirloom count, zones mapped, showing count
- Kit Memberships field on each item — links items to kit definitions in the Kits tab
- Kits tab: browses the user's kit collection, capability drill-down shows which items belong to each kit
- Kit edit modal for updating kit name, address, description, contents notes, provenance note, capabilities, linked kits
- Export to JSON (full backup), CSV (spreadsheet), Markdown (wiki paste), Estate Package (plain text for estate handling)
- Import JSON: Merge (adds new records only) or Replace All (overwrites everything)
- Real-time Firestore sync — sync dot in header shows live connection status
- Dashboard tab: category breakdown bar chart, top 5 items by value

**How it connects:**
- Reads from: `users/{uid}/item_records` (live snapshot listener — no page refresh needed)
- Reads from: `users/{uid}/kits` (live snapshot listener for Kits tab)
- Writes to: `users/{uid}/item_records` (Add Record, Edit Record, Import, Clear All)
- Writes to: `users/{uid}/kits` (Kit Edit modal)
- Entry points: direct URL — no cross-tool entry point yet
- Cross-tool note: item_records written here are the source of truth for HIL Exchange listings, PATCH agent context, and the Capability Analyzer. Do not duplicate content — always reference item_records.

**Known limitations / not yet live:**
- `authDomain` in the live file was set to the wrong Firebase project string — this caused silent sign-in failure. Fix is in the corrected file pending deployment.
- Date sorting (Newest/Oldest) handles both `created` (epoch ms, written by Vault) and `created_at` (Firestore serverTimestamp, written by Museum Builder) — items from Museum Builder will sort correctly once the fixed file is deployed.
- No photo upload — photos are planned to go through the `hilsystem-r2-signer` Cloudflare Worker but that Worker has a known CORS/fetch blocker as of June 2026.
- No entry point from other tools yet — Family Ledger and HIL Hub will eventually deep-link into Vault item detail.
- Offline / localStorage version exists as `hl-vault-offline.html` — useful no-account onboarding tool but does not sync to Firestore.
- Firestore security rules not yet fully locked down — multi-user isolation testing pending before beta launch.

**Common questions this tool answers:**
- "Where is my item stored?" → Search the address or item name — the HL address tells you the exact physical location.
- "Can I see everything I own in one place?" → Yes, the Records tab shows every item in your vault. Filter by category or structure to narrow it down.
- "How do I back up my inventory?" → Export → JSON Backup downloads a complete copy you can re-import on any device.
- "What's my stuff worth?" → The stats bar shows total estimated value. Dashboard → Top 5 by Value shows your highest-value items.
- "I added items in the Museum Builder — why aren't they showing in the Vault?" → They write to the same `item_records` collection and will appear automatically once the fixed Vault file is deployed (the current live file has a broken snapshot listener).
- "How do I link an item to a kit?" → Open the item, click Edit, and add the kit ID (e.g. `TK-CALIBRATION-01`) to the Kit Memberships field. It will appear in the Kits tab drill-down.
- "Can I use the Vault without a Google account?" → The cloud version requires Google Sign-In. The offline version (`hl-vault-offline.html`) works without an account but doesn't sync.
