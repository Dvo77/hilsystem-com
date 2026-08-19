DEPLOY_STATE.md

Purpose: what's actually live right now, where its source lives, and what's been written but NOT yet deployed. This is operational status, not architecture — architecture doctrine lives in the other SSOT docs.

Workflow: At the start of any session touching Cloudflare Workers, Firestore rules, Cloud Run, or deploy status generally — read this file first (fetched via raw.githubusercontent.com/Dvo77/hilsystem-com/main/DEPLOY_STATE.md). At the end of a session with deploy changes — update ONLY the section(s) that changed, leave everything else untouched, and append one line to the Changelog at the bottom. Do not regenerate the whole file.

FILE INTEGRITY WARNING (carried over, unresolved): this file has been found truncated mid-sentence at exactly 19999 bytes at least twice (Aug 1–2). Root cause never diagnosed. Spot-check byte count and confirm the file ends on a complete sentence immediately after every push — do not trust "Last updated" alone.

REBUILD NOTE (Aug 19, 2026): stale since Aug 2 — 8+ real sessions (nav consolidation, containment/placements architecture, Maintenance Calendar, Room Visualizer, kit v1.7, rack editor, account handles, Wiki.js/MCP/Tunnel infra) happened with zero updates. Everything below was reconstructed from chat history, not re-verified live this session — treat as CARRIED OVER until spot-checked. New infra section added at bottom (hil-truenas / Wiki.js / MCP bridge / Tunnel) — never tracked here before despite being live since Aug 10.

Status legend
✅ CONFIRMED LIVE (VERIFIED DIRECTLY) — checked against the actual service/site this session
✅ CONFIRMED LIVE (per Dan) — Dan confirmed directly in-session, not independently re-tested
✅ CONFIRMED LIVE (CARRIED OVER) — reported live by a prior session, not re-checked this session
🟡 WRITTEN, NOT DEPLOYED — code exists, not yet pushed to the live service
🔴 OPEN QUESTION — genuinely unknown, needs resolution
⚠️ KNOWN BROKEN — confirmed live but confirmed wrong

---

## firestore.rules

- Base rules (Guild, Vessel Registry, Fixed Points room_position exception, Gamification/Audit, Avatar/League, tag_registry, response_submissions): ✅ CONFIRMED LIVE (CARRIED OVER; response_submissions + composite index confirmed working end-to-end Aug 14).
- rack_position, panel_connection, peripheral_connections field exceptions: ✅ CONFIRMED LIVE (per Aug 13 session — three separate deployments, not just written).
- rooms subcollection (properties/{propertyId}/rooms/{roomId}): 🟡 WRITTEN, NOT CONFIRMED — delivered Aug 16 with the three-tier Room Visualizer hierarchy, no live confirmation captured since.
- placements + kit_memberships (Phase 0, backend-write-only, allow write: if false): 🟡 WRITTEN, NOT CONFIRMED — built and brace-verified (119/119) Aug 15 during the containment reconciliation. PRIORITY to confirm — hil-slot-generator.js (see Vault section) assumes these are live.
- fixed_points subcollection rules: 🔴 OPEN QUESTION — 🟡 since Aug 1, untouched since.
- kits collection (v1.7 HK prefix): confirmed NO rules change needed — no server-side prefix enum exists, v1.7 was UI-only (Aug 12).
- Rules Playground verification: 🔴 OPEN QUESTION — still never run.

---

## hil-admin-action (Google Cloud Run)

- Live URL: ✅ CONFIRMED LIVE (CARRIED OVER) — https://hil-admin-action-937314472168.us-central1.run.app
- Live revision string: 🔴 OPEN QUESTION — never captured. Run `gcloud run services describe hil-admin-action --region us-central1` first thing next infra session — outstanding 5+ sessions now.
- Source location: ✅ RE-CONFIRMED — Cloud-Shell-only, `~/admin-action-service/admin-action-service/server.js`. Still not in GitHub.
- Core endpoints (/update-item, /archive-item, /commit-staged, /link-related-item, /health): ✅ CONFIRMED LIVE (CARRIED OVER).
- /log-maintenance-service (new Aug 14): ✅ CONFIRMED LIVE (per Dan) — tested end-to-end, both read and write-through paths confirmed working.
- /merge-tag (Global Tag Store): 🔴 OPEN QUESTION — last known status Aug 2 was written/handed off, never confirmed deployed or tested since. Genuinely unknown whether Tag Manager's MERGE button works today.
- /webhook/ingest, WORKER_SECRET, /trigger-audit, /submit-audit: 🔴 OPEN QUESTION — unresolved for multiple sessions.
- commit-staged field-shape extension (containment/room_position/zone_code/shape/color/kit/rack_position): 🔴 OPEN QUESTION — endpoint doesn't know about newer staged_items shapes; no confirmed extension.

---

## Vault / Vessel / Kit tools (hl-vault-cloud.html, hil-vessel-builder.html, hil-kit-builder.html)

- Core save/edit/archive/photo-upload: ✅ CONFIRMED LIVE (CARRIED OVER, last direct end-to-end test July 12).
- Duplicate button, vessel nesting (vessel_types templates, parent_ref, slot_position), Connectivity/peripheral_connections: 🟡 WRITTEN — delivered Aug 13, no later confirmation captured.
- Vessel card visual pass, Existing Vessel picker (Room Detail New Container modal): 🟡 WRITTEN — delivered Aug 16, no later confirmation.
- bin_slots fourth vessel content mode (fastener/hardware compartments): 🟡 WRITTEN — delivered Aug 15, no later confirmation.
- hil-slot-generator.js (Cowork-built, Phase 1 canonical slot generation for the placements migration): 🟡 WRITTEN AND INTEGRATED, NOT RUN AGAINST PRODUCTION — verified correctly wired into hl-vault-cloud.html and hil-vessel-builder.html (uses setDoc merge:true to protect occupancy fields), but a sandbox migration attempt was blocked before execution. ⚠️ Do not assume any production items/vessels have gone through this migration. Next session should establish exactly why the sandbox run was blocked before trying again.
- Kit taxonomy v1.7 (HK prefix added, CK redefined, no new domain): 🟡 WRITTEN — UI dropdown change in hil-kit-builder.html, no rules dependency, no explicit deploy confirmation captured.
- Vessel bridge: DESIGNED, NOT BUILT — unchanged, carried over from Aug 1.

---

## hil-shell.js — nav consolidation

- Version: v2.21 (up from v2.19 as of Aug 2).
- 9-tab nav (Hub, Inventory, People, Ledger, Exchange, Museum, Guild, Field, Admin), Smart Home/Library unlisted-not-deleted: ✅ CONFIRMED LIVE (per Dan, Aug 16) — "all changes confirmed fully deployed and working by end of session."
- hil-inventory.html (new landing page, absorbed old Room Code Generator address-builder logic): ✅ CONFIRMED LIVE (per Dan, Aug 16).
- hil-hub.html (rewritten as lightweight dashboard): ✅ CONFIRMED LIVE (per Dan, Aug 16).
- "Bin Tag" renamed to "Sweep" (display-only, internal IDs bintag_tags/source:'bintag'/bintag_disposition/hil-bintag-agent untouched): ✅ CONFIRMED LIVE (per Dan, Aug 16).
- Import/Export moved into Inventory (not Admin): ✅ CONFIRMED LIVE (per Dan, Aug 16).
- Standalone Room Code Generator: retired, archived manually by Dan rather than deleted.
- Root-relative nav href fix (v2.17→v2.19): ✅ CONFIRMED LIVE (CARRIED OVER from Aug 2), only spot-checked from one hub subfolder — still worth re-checking from Electric Forge or Natural Sciences per the original Aug 2 note.

---

## Room Visualizer (hil-room-visualizer.html)

- Three-tier spatial hierarchy (footprint / rooms / zones), Draw Room, Draw Zone, Edit Structure bug fix, Openings Manager modal (re-snap/edit/delete): 🟡 WRITTEN, NOT CONFIRMED DEPLOYED — full replacement file delivered Aug 16, matching rooms rules delivered same session (see firestore.rules above). No explicit later confirmation this shipped.

---

## Maintenance Calendar (hil-maintenance-calendar.html)

- maintenance_events collection, /log-maintenance-service endpoint, item/zone pickers, recurrence, overdue-collapsing, deferral metadata shape (originalDueDate/deferredAt/deferredReason/deferredCount, no misleading "deferred" status): ✅ CONFIRMED LIVE (per Dan, Aug 14) — tested end-to-end, both read and write paths confirmed working live.
- Immutable completions model (maintenance_events/{taskId}/completions/{completionId} canonical + item_records/{itemId}/maintenance_history/{completionId} projection): architecture locked Aug 15, consistent with the Aug 14 build — no conflict, but worth confirming the projection-write side specifically was included in what Dan tested.

---

## Account / Handles (hil-account.html)

- Handle editor (claim/update flow, handles/{handle} collection, create-only uniqueness): 🟡 WRITTEN — delivered Aug 14, no explicit later confirmation.
- ⚠️ KNOWN GAP: hil-email-ingest Worker still routes on raw uid, not the new handle — inbox forward addresses still display the ugly uid string until the Worker-side lookup ships. Not yet built.
- response_submissions Firestore rules + composite index: ✅ CONFIRMED LIVE (per Dan, Aug 14) — permission-denied error traced and fixed, index created via Firebase Console link, confirmed resolved.

---

## Email receipt parsing pipeline

- hil-email-ingest routing, EMAIL_DEDUP KV, Harbor Freight parser: ✅ CONFIRMED LIVE (CARRIED OVER) — verified against a real captured email earlier (SKU anchor, search-window widening, Yahoo RFC-2047 subject decoding, two-pass From-header dispatcher all fixed).
- Amazon parser: 🔴 OPEN QUESTION — not yet verified against a real captured order-forward email. Still blocked on Dan providing a raw sample.
- Note: Dan's actual current workflow bypasses this entirely (manual photo+description → CSV → Import/Export) — email parsing is a nice-to-have, not depended on day to day.

---

## Seasonal Flare, Insurance Report, Natural Sciences hub, Guild Foundations / Tag Manager / Tag Taxonomy Lab

Unchanged from Aug 2 entries — not touched in any Aug 12–18 session, carry forward as-is. See prior Changelog for detail.

---

## NEW: hil-truenas / Wiki.js / MCP bridge / Cloudflare Tunnel

This infrastructure was built (Jul 20 – Aug 10) but has never been tracked in this file before. Adding it now.

- Hardware/OS: Beelink Mini S13 (N150, 12GB RAM), TrueNAS SCALE, 1.82TiB single-disk ZFS pool (`hil-data`), Dockge for container management: ✅ CONFIRMED LIVE (per Dan, Aug 10 — hands-on deployment session, each step pasted/verified live).
- Postgres 16 (with healthcheck): ✅ CONFIRMED LIVE (per Dan, Aug 10).
- Wiki.js v2 (setup wizard completed, admin account created): ✅ CONFIRMED LIVE (per Dan, Aug 10) — publicly reachable at wiki.hilsystem.com.
- API key (`hil-patch`, 3-year expiry, Full Access) saved to Google Drive doc "wikiapi": ✅ CONFIRMED, Aug 10.
- Custom MCP bridge (`hil-wikijs-mcp-bridge`, MIT-licensed public repo, v2 SDK): ✅ CONFIRMED LIVE (per Dan, Aug 10). Reads (wiki_search, wiki_get_page, wiki_status) unrestricted; writes (wiki_create_page, wiki_update_page) gated by HIL_WRITE_ENABLED env var + confirmed:true per call.
- Cloudflare Tunnel (`hil-truenas`) routing wiki.hilsystem.com: ✅ CONFIRMED LIVE (per Dan, Aug 10).
- Portainer / Uptime Kuma (recommended monitoring layer): 🔴 OPEN QUESTION — recommended in the Jul 20 planning session, never confirmed actually deployed in the Aug 10 build session. Check next infra session.
- Tailscale ACL hardening: ✅ CONFIRMED (per Dan, Aug 10) — hil-truenas tagged tag:public with default-deny outbound; tag:trusted↔tag:trusted explicitly allowed. Intentional full isolation — cross-box data sharing only via explicit Wiki.js page writes, not network routes. This is a locked design decision, not a gap.
- PATCH write-back behavior (confirm-gated vs. automatic): 🔴 OPEN QUESTION, EXPLICITLY UNRESOLVED — two contradictory descriptions exist from the same day (Jul 19) in earlier sessions. Dan explicitly deferred deciding until he'd seen the MCP mechanics in practice. Do not build against either assumption until Dan locks this.
- Efficiency Engine content (STD-WIKI-002 pages): 🟡 IN PROGRESS — 6 core method pages (Functional Grouping, ABC Analysis, Four-Box, 5S, POUS, Pareto) plus 16 more across Organizing/Sorting, Prioritization, Workspace/Workflow, Ergonomics/Environment drafted with trait-tag vocabulary. Some content sourced via Cowork research (ergonomics/OSHA citations) — ⚠️ link-verification of those citations not yet done by Dan before treating as "verified" tier, which matters because PATCH's 4-stage escalation ladder treats verified Wiki.js content as authoritative (stage 2) vs. flagged-unverified (stage 3, "SCRATCH's Homework — Ungraded").
- Kit pages `resources.wiki_url` field / "Full Guide" button link-up: 🔴 NOT BUILT — identified as a gap, not yet scheduled.

---

## Immediate next steps, in dependency order

1. Push this file to GitHub root, then immediately re-fetch and check byte count / that it ends on a complete sentence — the truncation bug has hit twice before.
2. Confirm placements + kit_memberships rules are actually live (Console or a direct write-attempt test) — hil-slot-generator.js and the whole containment migration depend on this being true.
3. Diagnose why the hil-slot-generator.js sandbox migration was blocked, before attempting it again against anything real.
4. Capture the current hil-admin-action revision string via `gcloud run services describe` — outstanding across 5+ sessions.
5. Resolve /merge-tag's actual deploy status — genuinely unknown whether Tag Manager's MERGE button works.
6. Confirm Room Visualizer three-tier hierarchy + rooms rules actually shipped.
7. Confirm Portainer/Uptime Kuma deployed on hil-truenas, or decide to skip them.
8. Lock PATCH's Wiki.js write-back behavior (confirm-gated vs. automatic) — explicitly deferred, still open.
9. Get a raw Amazon order-forward email from Dan to verify the Amazon receipt parser.
10. Security review session (Firestore rules + hil-admin-action auth) — flagged as needed, not yet scheduled. Should be its own dedicated session, not folded into a build session.

---

## Changelog

(append one line per session — never edit or remove past entries, even if later superseded; the section above should reflect current truth, this log reflects history)

July 11, 2026 — Built owner-confirm commit path and /webhook/ingest for hil-admin-action; wrote email-parsers.js, vault-item-client.js. Diagnosed hil-email-ingest as broken (dead DNS). Nothing confirmed deployed yet.
July 12, 2026 — Direct verification: confirmed revision hil-admin-action-00004-qqx, self-service endpoints live/auth-gated, Vault edit/save/photo-upload working end-to-end live.
July 16, 2026 — Published combined firestore.rules pass: Guild, Vessel Registry, Fixed Points (room_position only), Gamification/Audit.
July 18, 2026 — Avatar/League Firestore pass. guild_media → admin-direct-write.
July 19, 2026 — Insurance Report export shipped/confirmed live. Wiki.js/PATCH MCP direction scoped (write-back confirm-vs-automatic left unresolved).
July 20, 2026 — hil-truenas stack/deploy order locked (Portainer→Postgres→Wiki.js→key→MCP bridge→Tunnel→Uptime Kuma).
July 21, 2026 — Standards Index + PATCH/SCRATCH Brand Canon published. Guild Incubator curriculum, STD-WIKI-001/002 templates locked.
July 31, 2026 — Found fixed_points had zero rules coverage, drafted fix. Rebuilt DEPLOY_STATE.md from stale copy.
August 1, 2026 — Natural Sciences hub + Periodic Table Lab shipped/live. commitStagedItem() bug fixed. Vault categories expanded, Archived toggle added.
August 2, 2026 — Global Tag Store Phase 1 (tag_registry, /merge-tag written), Tag Manager shipped/confirmed live, Tag Taxonomy Lab built, platform-wide nav href bug fixed (v2.19). File found truncated at 19999 bytes 2nd time.
August 10, 2026 — hil-truenas physically deployed end-to-end: TrueNAS SCALE, ZFS pool, Postgres 16, Wiki.js v2, custom hil-wikijs-mcp-bridge (public MIT repo), Cloudflare Tunnel to wiki.hilsystem.com. Tailscale ACL hardened for full network isolation (tag:public default-deny, cross-box sharing via Wiki.js writes only, never network routes). This work was never logged in DEPLOY_STATE.md until the Aug 19 rebuild below.
August 12, 2026 — Kit taxonomy bumped to v1.7: HK (Hardware Kit) prefix added, CK (Care Kit) formally scoped, no new domain added. UI-only change, confirmed no rules dependency.
August 13, 2026 — Rack elevation editor (drag-drop, device config modal, USB Hub role, tandem/double-pole breaker support, configurable panel row count) shipped in hil-fixed-points.html. Vault: Duplicate button, full vessel nesting (vessel_types, parent_ref, slot_position), Connectivity/peripheral_connections section shipped. rack_position, panel_connection, peripheral_connections field-level write exceptions deployed to firestore.rules (three separate deployments). Room Code Generator zone-pill delete bug fixed.
August 14, 2026 — Universal Maintenance Calendar built and tested end-to-end (maintenance_events collection, /log-maintenance-service endpoint, deferral metadata shape locked, overdue-collapsing) — confirmed live by Dan via direct testing. response_submissions permission-denied bug fixed (missing rules block + composite index), confirmed resolved. hil-account.html handle editor built (handles/{handle} collection) — Worker-side email routing NOT yet updated to use it, flagged as a known gap.
August 15, 2026 ("hil-regroup") — Major containment model reconciliation: placements becomes single current-location authority for items/vessels/kits (backend-write-only), kit_memberships formalizes the item-kit join. Firestore Phase 0 rules for both delivered (brace-verified, not confirmed pushed). bin_slots fourth vessel content mode shipped to hl-vault-cloud.html. Cowork independently built hil-slot-generator.js (Phase 1 slot generation), verified correctly integrated but a sandbox migration attempt against production was blocked before execution — not run yet. Maintenance Calendar completion-handler architecture formalized (immutable completions + item-scoped projections, amendment-not-edit correction model).
August 16, 2026 — Two sessions: (1) Shell nav consolidated to 9 tabs, v2.21, hil-inventory.html and rewritten hil-hub.html shipped, Bin Tag renamed to Sweep, Import/Export moved into Inventory — all confirmed fully deployed and working by end of session. (2) Room Visualizer three-tier hierarchy (footprint/rooms/zones) built, Openings Manager modal added, rooms Firestore rules delivered, vessel card visual pass shipped across Vault/Vessel Builder, Existing Vessel picker added to Room Detail — delivered as replacement files, no explicit later confirmation of live deploy status.
August 17, 2026 — Discussion/planning session on AI-generated code security risk; no code shipped. Established that a dedicated adversarial security review (Firestore rules + hil-admin-action auth) is needed and has not yet happened.
August 19, 2026 — DEPLOY_STATE.md rebuilt after a 17-day gap. Reconstructed Aug 2–18 status from chat history (not independently re-verified against live services this session — see REBUILD NOTE at top). Added new infrastructure section for hil-truenas / Wiki.js / MCP bridge / Cloudflare Tunnel, which had never been tracked in this file despite being live since Aug 10. Flagged the placements/kit_memberships rules deploy status and the hil-slot-generator.js unrun migration as the two highest-priority open items to resolve next.
