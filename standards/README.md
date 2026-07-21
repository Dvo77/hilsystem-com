# HIL STANDARDS INDEX
**Single source of truth for every locked standard, protocol, and template across the HIL ecosystem.**
**Owner:** Daniel Ray DeVoy
**Index Version:** 1.1 — July 2026
**Canonical home:** `Dvo77/hilsystem-com` repo root (GitHub)
**Mirror:** HIL Guild Incubator Wiki.js (community/shared section)

---

## HOW TO USE THIS INDEX

1. Find the category below matching your question.
2. Go to the named source document/location — don't infer from memory or old chats.
3. If a standard isn't listed here, it's either undocumented or lives only in chat history — flag it, don't guess.
4. Update this file only after a standard is confirmed locked, same discipline as `DEPLOY_STATE.md`.

**Adding a new standard (workflow):**
1. Save the new standard as its own file directly in `standards/` — don't wait for permission to add the file itself.
2. Let a few accumulate. This index does not need to be updated after every single addition.
3. Periodically, reconcile: add a row to the relevant category table below, mark it with the correct status (🔒/🟡/🔴), and clear any 🔴 GAP line it fills.
4. Same append-then-reconcile rhythm as `DEPLOY_STATE.md` — work happens continuously, this file gets updated in batches once things are confirmed, not mid-flight.

---

## STATUS LEGEND

| Status | Meaning |
|---|---|
| 🔒 LOCKED | Confirmed standard, in active use, don't change without explicit re-approval |
| 🟡 DRAFTED | Spec written, not fully deployed/enforced everywhere yet |
| 🔴 GAP | Referenced repeatedly but never formally written down — candidate for next standards doc |

---

## 1. SPATIAL / ADDRESS GRAMMAR

| Standard | Status | Location | Governs |
|---|---|---|---|
| HL Address Grammar | 🔒 | `HL-System-Grammar-v1_0.md` (GitHub + project knowledge) | `[STRUCT]-[ZONE]-[WALL+POS]-[LEVEL+SLOT]` format, counting rules, Sub-Zone `+C` rule, display tiers, Noun-First item naming, Five Root Nouns, color coding, Scan-Scan workflow, Vessel Registry prefixes |
| HL Master RAG Index | 🔒 | `HL_MASTER_INDEX.md` (project knowledge) | Router for which grammar/platform doc governs which query — meta-index for the grammar layer specifically, narrower scope than this document |
| Full Property Prefix Table | 🔒 | Wiki.js: "HIL Prefix Table" | Every zone prefix in use (B, A, M, G, SH, MM, VAN, O, MOB, MB, MS, GAR + sub-codes) |

---

## 2. PLATFORM / PRODUCT

| Standard | Status | Location | Governs |
|---|---|---|---|
| HIL Platform Concept | 🔒 | `HIL_Platform_Concept_v1.md` | Core Loop, Five Core Tenets, Flip Switch (Sell/Barter/Hold), Provenance Engine, deployment options |
| HIL Exchange Spec | 🔒 | Memory / this project's chat history — **not yet a standalone doc** | Barter/Trade/Sell/Auction modes, Ring system (1/2/3), eBay baseline |
| Business Model / Tiering | 🔒 | Memory — **not yet a standalone doc** | Free/Paid Tier 1/Paid Tier 2 feature split, Lemon Squeezy pricing anchor |

🔴 **GAP:** Exchange Spec and Tier/Pricing model are locked in principle but have no canonical file — both are candidates for formal write-ups.

---

## 3. DATA SCHEMA

| Standard | Status | Location | Governs |
|---|---|---|---|
| Firestore Canonical Schema | 🔒 | `__HIL_PLATFORM___FIRESTORE_SCHEMA____Canonical_Data_Model_v1.4` (supersedes `HIL_Firestore_Schema_v1.md`) | Collection structure, field shapes for `item_records`, `staged_items`, `museum_items`, `exchange_listings`, `properties/zones` |
| Firestore Security Rules | 🔒 | Published rules (Firebase console — not in repo) | `item_records` = `allow write: if false`; `admins/{uid}` existence-check gating; frontend-writable collections whitelist |
| Authority Layer Doctrine | 🔒 | Memory / architecture doctrine, referenced across specs | "If it tells a story, frontend can save it; if it becomes inventory truth, backend must commit it" — all `item_records` writes route through `hil-admin-action` |

🔴 **GAP:** Firestore Security Rules are confirmed-live but not mirrored into any doc Claude can read directly — console-only.

---

## 4. INFRASTRUCTURE / DEVOPS

| Standard | Status | Location | Governs |
|---|---|---|---|
| GitHub SSOT | 🔒 | `HIL-GitHub-SSOT-v2.md` | Git workflow (edit → add → commit → push), naming convention (`filename` / `filename-v1` / `filename-wip`), build/edit rules, connected services table |
| Cloudflare SSOT | 🔒 | `HIL-Cloudflare-SSOT-v2_2.md` (supersedes `v2_1.md`) | Workers/Pages/R2/KV/Email Routing inventory and config |
| Deploy State Protocol | 🔒 | `DEPLOY_STATE.md` (repo root) | Status legend (✅/🟡/🔴/⚠️), append-only changelog, Claude fetches first for any Cloudflare/Firestore/Cloud Run session |
| hil-shell.js Universal Shell | 🔒 | Repo: `hil-shell.js` (currently v2.15) — added since v2.9: Patch & Scratch bot component (v2.9, see §5), Guild Media Viewer + Library panel + `renderForConcept()` (v2.12–v2.15) | Firebase init, Google Auth, shared globals, header/nav, auth gate, toast system, design tokens, `HILShell.init()` 3-line drop-in |
| Design Tokens | 🔒 | Enforced via `hil-shell.js` | Dark `#0a0c0b` bg, `#00cc66` green, `#cc8800` amber; Orbitron/Space Mono/Barlow Condensed fonts; hex compass logo |
| Tool Doc / README Schema | 🔒 | `HIL-Tool-Doc-Schema-README.md` | Format every tool's README must follow |

---

## 5. BRAND & CONTENT

| Standard | Status | Location | Governs |
|---|---|---|---|
| Patch & Scratch Bot Component (visual mood-card) | 🔒 | `hil-shell.js` v2.9+ (confirmed live in GitHub), README documented | Shared `.bot` CSS + `HILShell.bot.render/setState/setLine` JS API for safe/caution/danger mood cards. **Purely decorative — not the AI assistant.** |
| PATCH / SCRATCH Brand Canon | 🔒 (⚠️ 1 open conflict inside) | `standards/PATCH-SCRATCH-Brand-Canon.md` | Character identity, full visual spec (hex codes, antenna colors — Scratch red, Patch green — expressions, poses, do's/don'ts), locked catchphrase, PATCH AI Assistant behavior, open write-back conflict flagged for Dan to resolve |
| Send It Lab Palette | 🔒 | Memory — **not yet a standalone doc** | Black/navy + orange + white + gold (no teal). Unrelated to Patch/Scratch character colors — separate module palette |

⚠️ **KNOWN MISMATCH (confirmed in GitHub, not yet fixed):** `hil-shell.js` line 395 — `.bot--scratch .bot__name { color: var(--hil-amber); }`. Canon says Scratch = green. Full detail in `PATCH-SCRATCH-Brand-Canon.md` §3.

🔴 **GAP:** Send It Lab Palette still has no standalone file.

---

## 6. WIKI.JS / GUILD STANDARDS

| Standard | Status | Location | Governs |
|---|---|---|---|
| Universal Scoring & Session Logging Spec | 🔒 | `__HIL_Guild___Universal_Scoring___Session_Logging_Spec_v2.0` | How Guild sessions are scored/logged |
| Module Logging Standard | 🔒 | `__HIL_Guild___Module_Logging_Standard_v3.5` (supersedes v3.0) | Format for logging individual Guild module activity |
| Efficiency Engine Template (STD-WIKI-002) | 🔒 | Wiki.js (not mirrored to GitHub) | Uniform article format for cross-domain technique retrieval; production pipeline is Dan researches → formats to template → GPT verifies/writes to Wiki.js |
| PATCH Query Escalation Ladder | 🔒 | Memory — **not yet a standalone doc** | 4-stage lookup order: tool READMEs → verified Efficiency Engine → community Wiki.js → web search; honest "no answer" if all fail |
| PATCH + Wiki.js Write-Back Flow | ⚠️ CONFLICTING | Memory (flagged unresolved July 19, 2026) | One description says confirm-gated (PATCH proposes/diffs, user confirms); another same-day summary says automatic. **Needs Dan's explicit reconciliation before either is treated as authoritative.** |
| Guild Incubator Hosting Model | 🔒 | Memory — **not yet a standalone doc** | Wiki.js on N100/TrueNAS, Docker Compose via Dockge, 24-month tenancy, per-user GitHub repo backup, graduation mechanics |

---

## 7. TOOL/BUILD SPECS (feature-specific, not platform-wide)

These are locked specs for individual features — listed for completeness, not duplicated here in full.

| Spec | Status | Location |
|---|---|---|
| Fixed Points Overlay Spec | 🟡 DRAFTED | `HIL-Fixed-Points-Spec-v1.md` |
| House Brain / Smart Home Concept | 🔒 | `house-brain.md` / `HL-House-OS-Concept-v1.md` |
| Mobile Asset Tracking Logic | 🔒 | `Mobile_asset_assumption` |

---

## 8. GUILD MEDIA / CONTENT LIBRARY

| Standard | Status | Location | Governs |
|---|---|---|---|
| Guild Media Asset Schema | 🔒 | `Guild-Media-README.md` (`tools/readmes/`) | `guild_media` Firestore collection field shapes, asset ID scheme (`{TYPE-PREFIX}-{NNN}`, e.g. `HERO-001`), R2 storage path convention (`guild-media/{type-folder}/{assetId}.{ext}`) |
| Concept Tagging Rule | 🔒 | `Guild-Media-README.md` | `related_concepts` must use the same slug vocabulary as the Guild Concept Index — never free text; this is what makes tag-driven auto-display (`HILShell.media.renderForConcept()`) work platform-wide |
| Media Display Rule | 🔒 | `Guild-Media-README.md` | Media never renders inline in chat or inline unprompted in a page — always opens through the shared popup viewer (`HILShell.media.open()`). One viewer, one place it's styled. |
| HIL Whiteboard Style Guide | 🔒 | `Guild-Media-README.md` | Colors (`#0a0c0b` bg / `#00cc66` primary / `#cc8800` example-values / `#dde8e2` labels / `#8a948e` muted / `#0a2614` fill), type scale (28/18/18/22/14px), camera size (800×600 default), critical export-bounds rule for Excalidraw-drawn assets |

🔴 **GAP:** PATCH-side integration (PATCH's own chat responses deciding to surface a media asset) is designed for (`cardHTML()` exists) but not built — nothing on the PATCH agent Worker side queries `guild_media` yet.

---

## 9. OPEN GAPS SUMMARY (candidates for next standards write-up)

1. **HIL Exchange Spec** — locked in principle, no file
2. **Business Model / Tiering** — locked in principle, no file
3. **PATCH Query Escalation Ladder** — locked in principle, no file
4. **PATCH + Wiki.js Write-Back Flow** — actively conflicting, needs resolution before documenting
5. **Firestore Security Rules** — live but console-only, never mirrored to a readable doc
6. **Send It Lab Palette** — locked in principle, no standalone file
7. **PATCH-side Guild Media surfacing** — the visual-aid-during-tutoring vision this feature was built for isn't wired up yet; `HILShell.media.cardHTML()` is ready for PATCH's agent to use, but the agent doesn't call `guild_media` or include a suggested asset in its responses

---

*HIL Standards Index v1.1 — July 2026*
*Maintained alongside `DEPLOY_STATE.md` — update only after a standard is confirmed locked, not mid-discussion.*
