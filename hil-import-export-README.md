## Import / Export

**File:** hil-import-export.html
**URL:** hilsystem.com/tools/hil-import-export.html
**Status:** Beta — shell overhaul and bug fixes just built, not yet deployed/confirmed live. Flip to Live once pushed and a real import → Admin → Staged Items round trip has been tested.

**Purpose:** Two-way data door for the Vault — bring inventory in from other apps (or a spreadsheet), and take your HIL data back out anytime in a format that's usable elsewhere. Also hosts quick downloads (CSV/JSON templates, the HL grammar spec, an HA YAML starter) that don't require sign-in.

**Core Features:**
- Import from HIL Backup, HomeBox, generic CSV, or JSON, with column auto-mapping to HIL fields (address, item_name, zone_code, etc.) and a manual override dropdown per field
- Drag-and-drop or click-to-browse file input, live preview of the first 5 parsed rows before committing
- Import writes to `staged_items` for review — never touches `item_records` directly, consistent with the Authority Layer doctrine
- Export in four formats: JSON (full fidelity, re-importable), CSV (spreadsheet), Markdown (wiki-paste), and an "Estate Package" (narrative Markdown write-up per item — descriptions, condition, value — built for handoff/inheritance scenarios)
- Export scope: All Items, Staged Only, or filtered by zone code
- Quick Downloads panel: blank CSV/JSON import templates, the full HL Spatial Vector Grammar spec as plain text, and a Home Assistant YAML starter — all work without signing in
- Converter status list showing which source apps are live (HomeBox) vs. coming soon (Sortly, Grocy, Snipe-IT)

**How it connects:**
- Reads from: `users/{uid}/item_records` (export), `staged_items` filtered by `owner_uid` (export scope: staged)
- Writes to: `staged_items` only (import), with `owner_uid` and `status: 'pending'` set from the real signed-in user — never trusts a uid/status from the imported file itself
- Entry points: shell nav (Import/Export tab); Quick Downloads are reachable without auth
- Cross-tool data flows: imported rows land in `staged_items` and get picked up by the same approval pipeline as email-ingested receipts — they show up in Admin → Staged Items for approve/reject like anything else in that queue

**Known limitations / not yet live:**
- Not yet deployed — needs to be pushed to `tools/` and confirmed against a real account
- Import approval still depends on the Cloud Run commit service (`hil-admin-action`) being live to actually promote a staged item into `item_records` — this tool only gets items into the staging queue, same as every other ingestion path
- HomeBox listed as "LIVE" in the converter list, but there's no HomeBox-specific field mapping logic yet — it currently routes through the same generic CSV/JSON path as everything else. Worth relabeling or building real HomeBox-aware mapping before calling it live
- CSV parser is a simple split-on-comma — doesn't handle quoted fields containing commas or embedded newlines. Fine for simple exports, will break on more complex spreadsheets
- No per-row validation against the HL address grammar on import — a malformed address will get staged as-is and only get caught (or not) at approval time

**Common questions this tool answers:**
- "Can I get my data out of HIL if I ever want to leave?" — Yes, export to JSON or CSV any time, no login gate on the templates, no lock-in.
- "I have stuff in HomeBox / a spreadsheet — can I bring it in?" — Yes, generic CSV and JSON import both work today with column mapping; direct app-specific converters for other tools are marked "soon."
- "Does importing overwrite anything in my Vault?" — No. Imported rows go to a staging queue, not directly into your inventory — you review and approve them in Admin before they become real item records.
- "What's the Estate Package export for?" — A narrative, printable Markdown write-up of your whole inventory (or a filtered subset) — built for situations like settling an estate or documenting for insurance/family, where a plain data dump isn't as useful as readable descriptions.
- "Why didn't my imported items show up anywhere?" — If you imported before this session's fix, they were staged with a status field the Admin panel wasn't looking for and would've been invisible. That's fixed now — re-import if you ran into this.

---

### Upgrade ideas (not built — future session candidates)

- Real HomeBox-specific field mapping instead of routing it through the generic CSV path under a "LIVE" label
- Proper CSV parsing (quoted fields, embedded commas/newlines) instead of a naive comma split
- HL address grammar validation at import time, flagging malformed addresses before they hit the staging queue instead of after
- Sortly / Grocy / Snipe-IT converters, once there's real demand
- Batch approve/reject for staged imports from within this tool, instead of routing everyone through Admin → Staged Items one at a time
