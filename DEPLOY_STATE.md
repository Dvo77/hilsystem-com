DEPLOY_STATE.md

Purpose: what's actually live right now, where its source lives, and what's been written but NOT yet deployed. This is operational status, not architecture — architecture doctrine lives in the other SSOT docs.

Workflow: At the start of any session touching Cloudflare Workers, Firestore rules, Cloud Run, or deploy status generally — read this file first (fetched via raw.githubusercontent.com/Dvo77/hilsystem-com/main/DEPLOY_STATE.md). At the end of a session with deploy changes — update ONLY the section(s) that changed, leave everything else untouched, and append one line to the Changelog at the bottom. Do not regenerate the whole file.

FILE INTEGRITY WARNING (Aug 2, 2026, second occurrence): this file has now been found truncated mid-sentence at exactly 19999 bytes TWICE — once discovered and "fixed" earlier on Aug 2, but that fix never actually made it to GitHub, so the file fetched at the start of this session was the same stale, truncated Aug-1-era copy, missing the entire Global Tag Store Phase 1 session's updates. Whatever tool/step is used to push this file to GitHub appears to have a ~20KB ceiling that silently truncates instead of erroring. Until that's diagnosed, treat any "Last updated" date on this file with suspicion and consider asking for the file to be spot-checked (byte count, does it end on a complete sentence) immediately after each push, not just trusted.

Last updated: August 2, 2026 (session: Tag Manager tool built, hil-shell.js nav bug fixed, Tag Taxonomy Lab shipped, tag_registry rules confirmed live)

Status legend
✅ CONFIRMED LIVE (VERIFIED DIRECTLY) — checked against the actual service/site this session
✅ CONFIRMED LIVE (per Dan) — Dan confirmed directly in-session, not independently re-tested
✅ CONFIRMED LIVE (CARRIED OVER) — reported live by a prior session, not re-checked this session
🟡 WRITTEN, NOT DEPLOYED — code exists, not yet pushed to the live service
🔴 OPEN QUESTION — genuinely unknown, needs resolution
⚠️ KNOWN BROKEN — confirmed live but confirmed wrong

firestore.rules
Status: ✅ CONFIRMED LIVE (per Dan, July 16 pass) — with one addition pending publish as of the Aug 1 session.
fixed_points subcollection (users/{uid}/properties/{propertyId}/fixed_points/{pointId}): 🟡 WRITTEN, NOT YET PUBLISHED — carried over from Aug 1, still unconfirmed.
item_records base rule + room_position field exception: ✅ CONFIRMED LIVE (CARRIED OVER from July 16).
properties/zones, properties/openings: ✅ CONFIRMED LIVE (CARRIED OVER).
Avatar/League FS pass: ✅ CONFIRMED LIVE (CARRIED OVER, per in-file comments dated July 18).
guild_media admin-direct-write: ✅ CONFIRMED LIVE (CARRIED OVER, per in-file comment dated July 18).
Gamification/Audit locks: ✅ CONFIRMED LIVE (CARRIED OVER from July 16).
tag_registry (users/{uid}/tag_registry/{tagId}): ✅ CONFIRMED LIVE (VERIFIED DIRECTLY, Aug 2) — owner-direct create/read/update, delete blocked at rules level. Confirmed live by direct evidence this session: Tag Manager tool (see below) successfully created, edited, and re-parented multiple tag_registry docs (lawn care, MAX-NET, servers) against the real deployed rules — this would 403 if the rule hadn't actually been published. Upgraded from the prior 🟡 WRITTEN status.
Rules Playground verification: 🔴 OPEN QUESTION — none of the field-lock rules, fixed_points, or tag_registry have been run through Rules Playground. Still not done.

hil-admin-action (Google Cloud Run)
Live URL: ✅ CONFIRMED LIVE (CARRIED OVER) — https://hil-admin-action-937314472168.us-central1.run.app
Live revision: ✅ CONFIRMED LIVE (per Dan, Aug 1 evening) — exact revision string still not captured; run gcloud run services describe hil-admin-action --region us-central1 to confirm and update this line. Still outstanding across multiple sessions now.
Source location: ✅ RE-CONFIRMED DIRECTLY (Aug 1) — still Cloud-Shell-only, ~/admin-action-service/admin-action-service/server.js. Still NOT in GitHub — open migration item, unresolved.
Self-service endpoints (/update-item, /archive-item, /commit-staged, /link-related-item, /health): ✅ CONFIRMED LIVE (CARRIED OVER, per Dan, Aug 1).
/webhook/ingest, WORKER_SECRET, /trigger-audit, /submit-audit: 🔴 OPEN QUESTION — carried over unresolved from prior sessions, not touched this session.
/merge-tag (Global Tag Store): 🟡 WRITTEN, NOT YET CONFIRMED DEPLOYED — written and verified (598-line server.js, node -c clean, single app.listen, all 8 routes present) on Aug 2 morning, handed to Dan as a file. Not yet confirmed pasted into Cloud Shell server.js or redeployed. Tag Manager's MERGE button calls this endpoint via vaultMergeTag() — until this is actually deployed, clicking MERGE in Tag Manager will fail. Dan was about to test this (merging "servers" into "MAX-NET") as of this session's end — outcome not yet confirmed, check first thing next session.

Vault frontend (hl-vault-cloud.html + vault-item-client.js)
Core save/edit/archive/photo-upload: ✅ CONFIRMED LIVE (CARRIED OVER, July 12 direct end-to-end test) — not re-verified since.
Expanded category list, Archived-items view: 🟡 WRITTEN, NOT YET CONFIRMED DEPLOYED (carried over from Aug 1).
Related Items (vaultLinkRelatedItem, /link-related-item): 🟡 WRITTEN, NOT YET CONFIRMED DEPLOYED (carried over from Aug 2 morning session).
Global Tag Store (subcategory autocomplete): 🟡 WRITTEN, NOT YET CONFIRMED DEPLOYED (carried over from Aug 2 morning) — subcategory field rebuilt on a tag_registry real-time listener with autocomplete, inline tag creation, usage_count tracking. Given tag_registry itself is now confirmed live (see firestore.rules above), this should work once hl-vault-cloud.html is actually pushed — not yet confirmed that it has been.
Vessel bridge: DESIGNED, NOT BUILT — carried over, unchanged.

Tag Manager (hil-tag-manager.html) — NEW this session (Aug 2)
Status: ✅ CONFIRMED LIVE (VERIFIED DIRECTLY) — Dan screenshotted the tool working end-to-end: tag tree rendering, new tag creation (lawn care, MAX-NET), parent assignment via the edit panel, expand/collapse. This is the strongest confirmation level in this file — actual usage evidence, not just a claim.
Location: tools/hil-tag-manager.html (root level, alongside Vault/Kit Builder/Vessel Builder — NOT under tools/foundations/, which was an early deploy mix-up, corrected this session).
Nav entry: ✅ CONFIRMED LIVE — "Tags" (🏬) added to hil-shell.js NAV_TOOLS, between Kits and Labels & Signs, confirmed rendering and highlighting correctly in Dan's screenshot.
Core features confirmed working: real-time tree from tag_registry.parent_tag_id, create-tag toolbar, per-tag edit panel (parent reassignment, type, description), cycle prevention (parent dropdown excludes self + descendants).
MERGE button: 🟡 PRESENT, NOT YET CONFIRMED WORKING — calls the not-yet-deployed /merge-tag endpoint (see hil-admin-action section above). Will error until that's pushed.
README: ✅ WRITTEN this session, following the base HIL-Tool-Doc-Schema-README.md template (no Guild extension — this is platform infrastructure, not a learning module).

hil-shell.js — NAV BUG FIX (v2.17 → v2.19), Aug 2
Bug found: every NAV_TOOLS href was same-directory-relative ('./hil-vault-cloud.html' style). This only resolves correctly when the CURRENT page also lives in tools/ root. Any page in a hub subfolder (tools/foundations/, tools/electric-forge/, tools/natural-sciences/, tools/weights-measures/) rendered the identical shared nav bar, so clicking any nav link FROM inside a hub subfolder TO a tools/-root tool resolved against the wrong directory. This is how Tag Manager ended up mistakenly deployed to tools/foundations/hil-tag-manager.html initially — Dan followed the (broken) link.
Status: ✅ CONFIRMED LIVE (VERIFIED DIRECTLY) — Dan's second screenshot shows the corrected root-relative URL (.../tools/hil-tag-manager.html) working, nav bar rendering with the fix applied.
Fix: all 15 NAV_TOOLS entries changed from './file.html' to '/tools/file.html' (root-relative), so they resolve identically regardless of which folder the current page is in.
Scope note: this was a PRE-EXISTING platform-wide bug, not something Tag Manager introduced — any nav click from inside a hub subfolder to a tools/-root tool was already broken before today; nobody had happened to test that specific click path until this session. Worth a spot-check: click a root-level nav item (e.g. Vault) from inside Periodic Table Lab or Noun First Lab to confirm the fix holds there too — not independently re-verified this session, only the Tag Manager path was directly observed.
Version bump also includes the v2.18 Tag Manager nav addition — both landed in the same file, same session.

Guild Foundations hub — Tag Taxonomy Lab added (Aug 2)
Status: 🟡 WRITTEN, NOT YET CONFIRMED DEPLOYED — new module (tools/foundations/tag-taxonomy-lab.html), Explore (5 concept cards) + Practice (8 scenario questions, accuracy-scored) pattern, matching Periodic Table Lab's proven session-logger.js wiring exactly. Added to foundations/index.html's module grid (real card, no "pending" badge — fully wired from first deploy) and to guild-module-registry.js's foundations moduleIds array. None of these three file changes confirmed pushed yet.
Deliberately does NOT use Three-Prong Scoring (scoringMode: 'time+proof') — ships on plain scoringPath: 'accuracy' (v3.0/3.1), same tier as Periodic Table Lab. Not blocked on the hil-patch-agent Worker rewire that's holding up Noun First Lab, because it doesn't need Proof-prong PATCH scoring to work.
README: ✅ WRITTEN this session, base template + Guild Proctoring & Tutoring Extension (Module Logging Standard v3.5 Part 9).

Seasonal Flare, Insurance Report export, Natural Sciences hub + Periodic Table Lab: unchanged, carried over from Aug 1 — see prior Changelog entries for detail, not touched this session.

Immediate next steps, in dependency order
Push this corrected DEPLOY_STATE.md to the GitHub repo root and IMMEDIATELY verify byte count / ending sentence — the truncation bug has now hit twice, don't trust it silently.
Paste /merge-tag into Cloud Shell server.js and redeploy hil-admin-action — Tag Manager's MERGE button is live but non-functional until this lands.
Confirm the pending merge (servers → MAX-NET) that Dan was about to attempt actually succeeded once /merge-tag is deployed.
Deploy hl-vault-cloud.html, vault-item-client.js (Related Items + Tag Store autocomplete), foundations/index.html, guild-module-registry.js, tag-taxonomy-lab.html — all written, none confirmed pushed.
Spot-check the hil-shell.js nav fix from inside at least one other hub subfolder (Electric Forge or Natural Sciences), not just Foundations.
Confirm the new hil-admin-action revision string via gcloud run services describe — outstanding across multiple sessions now.
Publish the fixed_points rules addition — still carried over unconfirmed since July 31.
Diagnose the DEPLOY_STATE.md 19999-byte truncation ceiling itself — this is now a recurring, confirmed-twice problem, not a one-off.

Changelog

(append one line per session — never edit or remove past entries, even if later superseded; the section above should reflect current truth, this log reflects history)

July 11, 2026 — Built owner-confirm commit path (/commit-staged, /archive-item, /update-item) and email webhook receiver (/webhook/ingest) for hil-admin-action; wrote email-parsers.js and vault-item-client.js. Diagnosed hil-email-ingest as broken (dead DNS target). Nothing confirmed deployed at time of writing.
July 12, 2026 — Direct verification session. Confirmed live revision hil-admin-action-00004-qqx. Confirmed self-service endpoints live and auth-gated. Confirmed Vault edit/save/photo-upload working end-to-end on the live site. /webhook/ingest and WORKER_SECRET sync remained unverified.
July 16, 2026 — Compiled and published a combined firestore.rules pass: Guild (session_log_entries), Vessel Registry (vessel_types, vessels/slots), Fixed Points (item_records.room_position exception only), and Gamification/Audit (audit_events, account-level badges, trust-field locks). /trigger-audit and /submit-audit written but not pasted into live server.js.
July 18, 2026 — Avatar/League Firestore pass: avatar_profile, avatar_unlocks, avatar_catalog, leagues + claim-slot roster rules added. guild_media changed from fully-backend-only to admin-direct-write.
July 19, 2026 — Insurance Report export shipped and confirmed live (Family Ledger export mode).
July 31, 2026 — Discovered fixed_points subcollection had zero rules coverage. Drafted and handed off owner-direct-write rule matching the zones pattern. Rebuilt this file from the stale project-knowledge copy since the July 16 version never actually made it into GitHub.
August 1, 2026 (afternoon) — Built and shipped the Natural Sciences Guild hub plus Periodic Table Lab, with real Explore/Practice session logging through session-logger.js. Added the Guild root card and guild-module-registry.js entry. Fixed a temporal-dead-zone bug and decoupled HILShell.init() from the session-logger import. Wrote READMEs for both.
August 1, 2026 (evening) — Fixed commitStagedItem()'s field-shape bug (CSV/manual-import staged items were committing with no real data). Restored email-parsers.js. Added purchase_price/purchase_date/purchase_source to hil-import-export.html's HIL_FIELDS. Fixed hil-user-admin.html's "(no subject)" Staged Items bug. Expanded Vault's category list and added an Archived-items toggle. Vessel-bridge designed, not built. This entry was found truncated mid-sentence on the live file at the start of the following session (Aug 2) — closed out honestly at that point rather than left broken.
August 2, 2026 (morning) — Global Tag Store Phase 1: new tag_registry collection (rules, self-registry pattern), hil-admin-action's /merge-tag endpoint written, vaultMergeTag() added to vault-item-client.js, hl-vault-cloud.html's subcategory field rebuilt into a registry-backed autocomplete with inline tag creation. Also built and shipped Related Items (bidirectional pairwise linking, /link-related-item) and subcategory chip-to-array migration in the same session window. DEPLOY_STATE.md found truncated at 19999 bytes for the first time — corrected in that session, but the correction never actually reached GitHub (see next entry).
August 2, 2026 (afternoon/evening) — Designed and built the Tag Taxonomy Lab Guild module (Foundations hub) plus Tag Manager, a new standalone tool for browsing/editing the tag_registry hierarchy (parent/child category grouping, cycle-safe re-parenting, merge). Found and fixed a platform-wide hil-shell.js bug: every nav link was same-directory-relative, breaking any nav click FROM a hub subfolder (foundations/, electric-forge/, natural-sciences/, weights-measures/) TO a tools/-root tool — fixed by making all NAV_TOOLS hrefs root-relative. Tag Manager confirmed working end-to-end via direct screenshots from Dan: tag_registry rules confirmed live (upgraded from 🟡 to ✅), tree/create/edit/re-parent all confirmed working live. MERGE button present but not yet functional pending /merge-tag's actual deployment. Wrote READMEs for both Tag Taxonomy Lab (with Guild Proctoring extension) and Tag Manager. DEPLOY_STATE.md found truncated at 19999 bytes AGAIN — the Aug 2 morning fix never reached GitHub, meaning this file entering this session was still the stale Aug-1 version with none of the morning's Tag Store work reflected. Rebuilt again this session, flagged the truncation as a now-recurring, unresolved infrastructure problem rather than a one-off.
