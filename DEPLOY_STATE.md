# DEPLOY_STATE.md
**Purpose:** what's actually live right now, where its source lives, and what's been written but NOT yet deployed. This is operational status, not architecture — architecture doctrine lives in the other SSOT docs.

**Workflow:** At the start of any session touching Cloudflare Workers, Firestore rules, Cloud Run, or deploy status generally — read this file first (fetched via raw.githubusercontent.com/Dvo77/hilsystem-com/main/DEPLOY_STATE.md). At the end of a session with deploy changes — update ONLY the section(s) that changed, leave everything else untouched, and append one line to the Changelog at the bottom. Do not regenerate the whole file.

**Correction this rebuild:** the prior version of this file (dated July 17) was never actually committed to GitHub — it only ever existed as a chat artifact / project-knowledge upload, so every session since has been re-deriving state from scratch instead of reading it. This copy needs to be manually added to the repo root to close that gap for good.

**Last updated:** July 31, 2026 (session: Fixed Points permissions fix)

---

## Status legend
- ✅ CONFIRMED LIVE (VERIFIED DIRECTLY) — checked against the actual service/site this session
- ✅ CONFIRMED LIVE (per Dan) — Dan confirmed directly in-session, not independently re-tested
- ✅ CONFIRMED LIVE (CARRIED OVER) — reported live by a prior session, not re-checked this session
- 🟡 WRITTEN, NOT DEPLOYED — code exists, not yet pushed to the live service
- 🔴 OPEN QUESTION — genuinely unknown, needs resolution
- ⚠️ KNOWN BROKEN — confirmed live but confirmed wrong

---

## firestore.rules

- **Status:** ✅ CONFIRMED LIVE (per Dan, July 16 pass) — with one addition pending publish as of this session.
- **`fixed_points` subcollection (`users/{uid}/properties/{propertyId}/fixed_points/{pointId}`):** 🟡 WRITTEN, NOT YET PUBLISHED — was missing entirely from the live rules (only `zones` and `openings` existed under `properties/{propertyId}`). Rule drafted this session as owner-direct-read/write, matching the `zones` pattern (Dan's call: Fixed Points is non-inventory infrastructure metadata, doesn't need `hil-admin-action` gating). Full corrected rules file handed to Dan for paste-and-publish this session — mark ✅ once he confirms Publish clicked.
- **`item_records` base rule + `room_position` field exception:** ✅ CONFIRMED LIVE (CARRIED OVER from July 16) — `allow write: if false` baseline, narrow exception for `room_position`/`updated_at` only.
- **`properties/zones`, `properties/openings`:** ✅ CONFIRMED LIVE (CARRIED OVER).
- **Avatar/League FS pass (`avatar_profile`, `avatar_unlocks`, `avatar_catalog`, `leagues` + `roster` claim-slot logic):** ✅ CONFIRMED LIVE (CARRIED OVER, per in-file comments dated July 18) — not independently re-verified this session, but present in the live rules file Dan pasted in.
- **`guild_media` admin-direct-write:** ✅ CONFIRMED LIVE (CARRIED OVER, per in-file comment dated July 18).
- **Gamification/Audit locks (`users.stats.trust_score`, `team_members` trust fields, `audit_events`, account-level `badges`):** ✅ CONFIRMED LIVE (CARRIED OVER from July 16).
- **Rules Playground verification:** 🔴 OPEN QUESTION — none of the field-lock rules or the new `fixed_points` rule have been run through Rules Playground. Worth doing once `fixed_points` publishes.

## hil-admin-action (Google Cloud Run)

- **Live URL:** ✅ CONFIRMED LIVE (CARRIED OVER) — `https://hil-admin-action-937314472168.us-central1.run.app`
- **Live revision:** ✅ CONFIRMED LIVE (CARRIED OVER, July 12) — `hil-admin-action-00004-qqx`. Not re-verified since.
- **Source location:** 🔴 OPEN QUESTION — last confirmed living only in Google Cloud Shell (`~/admin-action-service/admin-action-service/server.js`), NOT in GitHub. Never resolved whether this ever got moved into version control. Treat as unresolved until checked.
- **Self-service endpoints (`/update-item`, `/archive-item`, `/commit-staged`, `/health`):** ✅ CONFIRMED LIVE (CARRIED OVER, July 12 direct curl test) — not re-verified since.
- **`/webhook/ingest` (email-ingestion receiver):** 🔴 OPEN QUESTION — reported written, never independently confirmed live via direct check.
- **`WORKER_SECRET` env var:** 🔴 OPEN QUESTION — never confirmed set/matched against `hil-email-ingest`'s Cloudflare binding.
- **`/trigger-audit`, `/submit-audit`:** 🔴 OPEN QUESTION — last known state (July 16) was written but not pasted into the live Cloud Shell `server.js`. Never followed up on.

## hil-email-ingest (Cloudflare Worker)

- **Status:** 🔴 OPEN QUESTION / UNVERIFIED — last known state: confirmed broken, posting to a dead `api.hilsystem.com` hostname with no DNS record. A fix (`hil-email-ingest-FIXED.js`) was written pointing directly at the Cloud Run URL, but deployment of that fix was never confirmed. Treat every email ingested since as silently failed until this is checked.

## HA Bridge / Home Assistant integration

- **Status:** 🔴 OPEN QUESTION — schema support exists (`ha_entity` field on `fixed_points` and on `item_records.maintenance`), and the HL→HA naming convention is documented (e.g. `switch.g_s_3e_receptacle`), but no live bridge to an actual Home Assistant instance has ever been confirmed working end-to-end. Next session on this needs to start by confirming what (if anything) already exists as a bridge tool/Worker versus what needs to be built from scratch.

## hil-import-export.html (HL Bridge / HomeBox etc.)

- **Status:** 🟡 WRITTEN, NOT CONFIRMED DEPLOYED (carried over, July 20) — needs a live check against `hilsystem.com/tools/`.
- **HomeBox converter:** ⚠️ KNOWN INCOMPLETE — listed as "LIVE" in the tool's own converter-status UI, but there is no HomeBox-specific field-mapping logic. It currently routes through the generic CSV/JSON path. Needs relabeling or real mapping before the "LIVE" tag is honest.
- **CSV parser:** ⚠️ KNOWN LIMITATION — simple split-on-comma, doesn't handle quoted fields with embedded commas/newlines.
- **Import destination:** ✅ BY DESIGN — writes only to `staged_items`, never direct to `item_records`, consistent with Authority Layer doctrine.

## Vault frontend (hl-vault-cloud.html + vault-item-client.js)

- **Status:** ✅ CONFIRMED LIVE (CARRIED OVER, July 12 direct end-to-end test) — save/edit/archive/photo-upload all confirmed working at that time. Not re-verified since.

## Seasonal Flare (hil-shell.js module)

- **Status:** ✅ CONFIRMED LIVE (per Dan, July 16) — fires automatically via `HILShell.init()` on every tool.
- **Known gaps:** no platform-wide kill-switch UI (backend flag exists, no button), no year stored with birthday, no shared/linked household accounts.

## Insurance Report export

- **Status:** ✅ CONFIRMED LIVE (per Dan, July 19) — Family Ledger export mode, lives under Financial in the admin panel.

---

## Immediate next steps, in dependency order

1. Publish the `fixed_points` rules addition (this session) — confirm and mark ✅ above.
2. Push this file itself to the repo root (`Dvo77/hilsystem-com/DEPLOY_STATE.md`) — it has never actually lived in GitHub despite the protocol being agreed on July 16.
3. HA Bridge: scope what currently exists (if anything) before attempting an end-to-end test.
4. `hil-import-export.html`: confirm live deployment status, then either build real HomeBox field-mapping or relabel it as CSV/JSON-only until that's done.
5. Resolve `hil-admin-action` source-of-truth location (GitHub vs. Cloud-Shell-only) — this has been an open question across multiple sessions and should get closed out.
6. Directly re-verify `/webhook/ingest`, `WORKER_SECRET`, and whether `hil-email-ingest-FIXED.js` was ever actually pasted into the Workers editor — every email since deployment may still be silently failing.

---

## Changelog
*(append one line per session — never edit or remove past entries, even if later superseded; the section above should reflect current truth, this log reflects history)*

- **July 11, 2026** — Built owner-confirm commit path (`/commit-staged`, `/archive-item`, `/update-item`) and email webhook receiver (`/webhook/ingest`) for hil-admin-action; wrote `email-parsers.js` and `vault-item-client.js`. Diagnosed hil-email-ingest as broken (dead DNS target). Nothing confirmed deployed at time of writing.
- **July 12, 2026** — Direct verification session. Confirmed live revision `hil-admin-action-00004-qqx`. Confirmed self-service endpoints live and auth-gated. Confirmed Vault edit/save/photo-upload working end-to-end on the live site. `/webhook/ingest` and `WORKER_SECRET` sync remained unverified.
- **July 16, 2026** — Compiled and published a combined firestore.rules pass: Guild (`session_log_entries`), Vessel Registry (`vessel_types`, `vessels/slots`), Fixed Points (`item_records.room_position` exception only — the `fixed_points` subcollection itself was NOT covered in this pass, a gap that went unnoticed until July 31), and Gamification/Audit (`audit_events`, account-level `badges`, trust-field locks). `/trigger-audit` and `/submit-audit` written but not pasted into live `server.js`.
- **July 18, 2026** — Avatar/League Firestore pass: `avatar_profile`, `avatar_unlocks`, `avatar_catalog`, `leagues` + claim-slot `roster` rules added. `guild_media` changed from fully-backend-only to admin-direct-write.
- **July 19, 2026** — Insurance Report export shipped and confirmed live (Family Ledger export mode).
- **July 31, 2026** — Discovered `fixed_points` subcollection had zero rules coverage (not caught in the July 16 pass, which only added the `item_records.room_position` exception under the Fixed Points banner and missed the collection itself). Drafted and handed off owner-direct-write rule matching the `zones` pattern, per Dan's confirmation that Fixed Points doesn't need `hil-admin-action` gating. Rebuilt this file from the stale project-knowledge copy since the July 16 version never actually made it into GitHub — flagged as the reason session-start state has been getting re-derived from scratch repeatedly.
