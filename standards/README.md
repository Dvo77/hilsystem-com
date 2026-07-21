# HIL STANDARDS INDEX
**Single source of truth for every locked standard, protocol, and template across the HIL ecosystem.**
**Owner:** Daniel Ray DeVoy
**Index Version:** 1.4 — July 2026
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
| 💡 PATTERN | Recognized best practice — what we currently do, recommended as the default, but not enforced or immutable. Follow it unless there's a real reason not to; if a better approach emerges, this can change without "breaking" anything. |

---

## 1. FOUNDATIONAL DOCTRINE

The root layer everything else answers to — the *why* behind the architecture, not a specific spec. Every other section describes *how* something is built; this describes *why it's built that way.*

| Standard | Status | Location | Governs |
|---|---|---|---|
| HIL Sovereign Efficiency Doctrine | 🔒 | `standards/HIL-Sovereign-Efficiency-Doctrine-v1.md` | Core philosophy: maximum sovereignty with minimum waste. Lean Infrastructure, Green-Edge Architecture (durable knowledge local), Sovereignty by Direction not Purity, Right Workload/Right Place (local vs. cloud split), Knowledge Compounds (verified Wiki.js content reduces AI/API/web-search cost over time), Cloud is Scaffolding Not Ownership, Human Authority (AI retrieves/proposes, humans approve what becomes canonical) |

**Why this matters for every other section below:** the Local-vs-Cloud workload split explains the Guild Incubator hosting decision (§7). "Knowledge Compounds" is the design intent behind the PATCH Query Escalation Ladder (§7). The PATCH + Wiki.js Write-Back Flow (§7) is related in spirit to "Human Authority" but is **explicitly deferred, not resolved** — Dan needs to see the Wiki pipeline mechanics in practice before deciding the rule; don't infer an answer from doctrine language.

---

## 2. SPATIAL / ADDRESS GRAMMAR

| Standard | Status | Location | Governs |
|---|---|---|---|
| HL Address Grammar | 🔒 | `HL-System-Grammar-v1_0.md` (GitHub + project knowledge) | `[STRUCT]-[ZONE]-[WALL+POS]-[LEVEL+SLOT]` format, counting rules, Sub-Zone `+C` rule, display tiers, Noun-First item naming, Five Root Nouns, color coding, Scan-Scan workflow, Vessel Registry prefixes |
| HL Master RAG Index | 🔒 | `HL_MASTER_INDEX.md` (project knowledge) | Router for which grammar/platform doc governs which query — meta-index for the grammar layer specifically, narrower scope than this document |
| Full Property Prefix Table | 🔒 | Wiki.js: "HIL Prefix Table" | Every zone prefix in use (B, A, M, G, SH, MM, VAN, O, MOB, MB, MS, GAR + sub-codes) |

---

## 3. PLATFORM / PRODUCT

| Standard | Status | Location | Governs |
|---|---|---|---|
| HIL Platform Concept | 🔒 | `HIL_Platform_Concept_v1.md` | Core Loop, Five Core Tenets, Flip Switch (Sell/Barter/Hold), Provenance Engine, deployment options |
| HIL Exchange Spec | 🔒 | Memory / this project's chat history — **not yet a standalone doc** | Barter/Trade/Sell/Auction modes, Ring system (1/2/3), eBay baseline |
| Business Model / Tiering | 🔒 (⚠️ revises prior model — see note) | Memory — **not yet a standalone doc** | **Simplified to single paid tier**, ~$9.99/month, all-or-nothing (supersedes earlier two-paid-tier split). **Free tier, confirmed concrete:** no login required to browse History Wall + Exchange/Barter listings; minimum email sign-in required to interact (post/respond) — Google, GitHub, and Email all live as sign-in options; all standalone tools (Stain Lookup, HIL Clean/Organize/Supply/Restore) free regardless of tier. **Not yet decided:** connecting free tools to AI + Wiki RAG to make them more powerful while staying free (minimal AI cost via Dan's own Wiki RAG rather than paid API calls) — early idea, not committed |
| eBay API Value Integration | 🔴 GAP | API credentials acquired, not yet wired — no live implementation | Intended to compute a live adjusted baseline value per item, feeding three consumers: Insurance Report export (`exchange.ebay_baseline` field currently placeholder), Barter/Exchange Network pricing, general item valuation. Not built — this is the actual live-price engine behind features that currently reference a static/placeholder value |

🔴 **GAP:** Exchange Spec and Business Model still have no canonical file despite being locked in principle — candidates for formal write-ups.

---

## 4. DATA SCHEMA

| Standard | Status | Location | Governs |
|---|---|---|---|
| Firestore Canonical Schema | 🔒 | `__HIL_PLATFORM___FIRESTORE_SCHEMA____Canonical_Data_Model_v1.4` (supersedes `HIL_Firestore_Schema_v1.md`) | Collection structure, field shapes for `item_records`, `staged_items`, `museum_items`, `exchange_listings`, `properties/zones` |
| Firestore Security Rules | 🔒 | Published rules (Firebase console — not in repo) | `item_records` = `allow write: if false`; `admins/{uid}` existence-check gating; frontend-writable collections whitelist |
| Authority Layer Doctrine | 🔒 | Memory / architecture doctrine, referenced across specs | "If it tells a story, frontend can save it; if it becomes inventory truth, backend must commit it" — all `item_records` writes route through `hil-admin-action` |

🔴 **GAP:** Firestore Security Rules are confirmed-live but not mirrored into any doc Claude can read directly — console-only.

---

## 5. INFRASTRUCTURE / DEVOPS

| Standard | Status | Location | Governs |
|---|---|---|---|
| GitHub SSOT | 🔒 | `HIL-GitHub-SSOT-v2.md` | Git workflow (edit → add → commit → push), naming convention (`filename` / `filename-v1` / `filename-wip`), build/edit rules, connected services table |
| Cloudflare SSOT | 🔒 | `HIL-Cloudflare-SSOT-v2_2.md` (supersedes `v2_1.md`) | Workers/Pages/R2/KV/Email Routing inventory and config |
| Deploy State Protocol | 🔒 | `DEPLOY_STATE.md` (repo root) | Status legend (✅/🟡/🔴/⚠️), append-only changelog, Claude fetches first for any Cloudflare/Firestore/Cloud Run session |
| hil-shell.js Universal Shell | 🔒 | Repo: `hil-shell.js` (currently v2.15) — added since v2.9: Patch & Scratch bot component (v2.9, see §6), Guild Media Viewer + Library panel + `renderForConcept()` (v2.12–v2.15) | Firebase init, Google Auth, shared globals, header/nav, auth gate, toast system, design tokens, `HILShell.init()` 3-line drop-in |
| Design Tokens | 🔒 | Enforced via `hil-shell.js` | Dark `#0a0c0b` bg, `#00cc66` green, `#cc8800` amber; Orbitron/Space Mono/Barlow Condensed fonts; hex compass logo |
| Tool Doc / README Schema | 🔒 | `HIL-Tool-Doc-Schema-README.md` | Format every tool's README must follow |

---

## 6. BRAND & CONTENT

| Standard | Status | Location | Governs |
|---|---|---|---|
| Patch & Scratch Bot Component (visual mood-card) | 🔒 | `hil-shell.js` v2.9+ (confirmed live in GitHub), README documented | Shared `.bot` CSS + `HILShell.bot.render/setState/setLine` JS API for safe/caution/danger mood cards. **Purely decorative — not the AI assistant.** |
| PATCH / SCRATCH Brand Canon | 🔒 (⚠️ 1 open conflict inside) | `standards/PATCH-SCRATCH-Brand-Canon.md` | Character identity, full visual spec (hex codes, antenna colors — Scratch red, Patch green — expressions, poses, do's/don'ts), locked catchphrase, PATCH AI Assistant behavior, open write-back conflict flagged for Dan to resolve |
| Send It Lab Palette | 🔒 | Memory — **not yet a standalone doc** | Black/navy + orange + white + gold (no teal). Unrelated to Patch/Scratch character colors — separate module palette |

⚠️ **KNOWN MISMATCH (confirmed in GitHub, not yet fixed):** `hil-shell.js` line 395 — `.bot--scratch .bot__name { color: var(--hil-amber); }`. Canon says Scratch = green. Full detail in `PATCH-SCRATCH-Brand-Canon.md` §3.

🔴 **GAP:** Send It Lab Palette still has no standalone file.

---

## 7. WIKI.JS / GUILD STANDARDS

| Standard | Status | Location | Governs |
|---|---|---|---|
| Universal Scoring & Session Logging Spec | 🔒 | `__HIL_Guild___Universal_Scoring___Session_Logging_Spec_v2.0` | How Guild sessions are scored/logged |
| Module Logging Standard | 🔒 | `__HIL_Guild___Module_Logging_Standard_v3.5` (supersedes v3.0) | Format for logging individual Guild module activity |
| Efficiency Engine Template (STD-WIKI-002) | 🔒 | Wiki.js (not mirrored to GitHub) | Uniform article format for cross-domain technique retrieval; production pipeline is Dan researches → formats to template → GPT verifies/writes to Wiki.js |
| PATCH Query Escalation Ladder | 🔒 | Memory — **not yet a standalone doc** | 4-stage lookup order: tool READMEs → verified Efficiency Engine → community Wiki.js → web search; honest "no answer" if all fail |
| PATCH + Wiki.js Write-Back Flow | ⚠️ DEFERRED (not conflicting-by-accident — intentionally undecided) | Memory | Two prior descriptions exist (confirm-gated vs. automatic) — Dan has explicitly stated this isn't decidable yet: he needs to see the actual mechanics of the Wiki pipeline / MCP integration in practice before choosing the rule. **Do not resolve this by inference (including doctrine language in §1) — wait for Dan to see the pipeline built, then decide.** |
| Guild Incubator Hosting Model | 🔒 | Memory — **not yet a standalone doc** | Wiki.js on N100/TrueNAS, Docker Compose via Dockge, 24-month tenancy, per-user GitHub repo backup, graduation mechanics |

---

## 8. TOOL/BUILD SPECS (feature-specific, not platform-wide)

These are locked specs for individual features — listed for completeness, not duplicated here in full.

| Spec | Status | Location |
|---|---|---|
| Fixed Points Overlay Spec | 🟡 DRAFTED | `HIL-Fixed-Points-Spec-v1.md` |
| House Brain / Smart Home Concept | 🔒 | `house-brain.md` / `HL-House-OS-Concept-v1.md` |
| Mobile Asset Tracking Logic | 🔒 | `Mobile_asset_assumption` |

---

## 9. GUILD MEDIA / CONTENT LIBRARY

| Standard | Status | Location | Governs |
|---|---|---|---|
| Guild Media Asset Schema | 🔒 | `Guild-Media-README.md` (`tools/readmes/`) | `guild_media` Firestore collection field shapes, asset ID scheme (`{TYPE-PREFIX}-{NNN}`, e.g. `HERO-001`), R2 storage path convention (`guild-media/{type-folder}/{assetId}.{ext}`) |
| Concept Tagging Rule | 🔒 | `Guild-Media-README.md` | `related_concepts` must use the same slug vocabulary as the Guild Concept Index — never free text; this is what makes tag-driven auto-display (`HILShell.media.renderForConcept()`) work platform-wide |
| Media Display Rule | 🔒 | `Guild-Media-README.md` | Media never renders inline in chat or inline unprompted in a page — always opens through the shared popup viewer (`HILShell.media.open()`). One viewer, one place it's styled. |
| HIL Whiteboard Style Guide | 🔒 | `Guild-Media-README.md` | Colors (`#0a0c0b` bg / `#00cc66` primary / `#cc8800` example-values / `#dde8e2` labels / `#8a948e` muted / `#0a2614` fill), type scale (28/18/18/22/14px), camera size (800×600 default), critical export-bounds rule for Excalidraw-drawn assets |

🔴 **GAP:** PATCH-side integration (PATCH's own chat responses deciding to surface a media asset) is designed for (`cardHTML()` exists) but not built — nothing on the PATCH agent Worker side queries `guild_media` yet.

---

## 10. AUTHORING PATTERNS / BEST PRACTICES

Nothing here is "don't touch this without approval" — it's "this is what's worked, default to it, but it's fair game to improve." Codifies the habit without freezing it.

| Pattern | Status | Confirmed against | Governs |
|---|---|---|---|
| Firestore Rules Authoring Pattern | 💡 | Live rules file (confirmed) | One `match /{collection}/{docId}` block per collection, logic delegated to four reusable helpers (`isSignedIn()`, `isOwner(uid)`, `isAdmin()`, `isApprovedTutor(uid)`), collection type decided by the Authority Layer split (frontend-writable "story" vs. backend-only "truth"), two-tier admin never conflated (`isAdmin()` platform-wide vs. `team_members.is_admin` household), default-deny catch-all at the end |
| Cloudflare Worker Authoring Pattern | 💡 | `hilsystem-r2-signer.js` only — not yet checked against `hil-admin-action`/`hil-patch-agent` | CORS preflight (`OPTIONS` → 204) → reject non-POST → shared `json()` response helper → single `context`/route param driving a `switch` statement → specific, named error messages per validation branch (not generic "bad request") |

🔴 **GAP (verification, not missing spec):** Worker pattern only confirmed against one of three live Workers — worth a quick check of `hil-admin-action` and `hil-patch-agent` source to see if they actually match this shape or drifted from it independently.

---

## 11. OPEN GAPS SUMMARY (candidates for next standards write-up)

1. **HIL Exchange Spec** — locked in principle, no file
2. **Business Model / Tiering** — locked in principle (now single-tier, $9.99/mo, free-tier rules concrete), no file yet
3. **PATCH Query Escalation Ladder** — locked in principle, no file
4. **PATCH + Wiki.js Write-Back Flow** — intentionally deferred pending Wiki pipeline mechanics, not a documentation gap so much as a genuine open decision
5. **Firestore Security Rules** — live but console-only, never mirrored to a readable doc
6. **Send It Lab Palette** — locked in principle, no standalone file
7. **PATCH-side Guild Media surfacing** — the visual-aid-during-tutoring vision this feature was built for isn't wired up yet; `HILShell.media.cardHTML()` is ready for PATCH's agent to use, but the agent doesn't call `guild_media` or include a suggested asset in its responses
8. **Cloudflare Worker Authoring Pattern verification** — only confirmed against `hilsystem-r2-signer.js`; `hil-admin-action` and `hil-patch-agent` not yet checked for drift
9. **eBay API Value Integration** — credentials acquired, not yet wired to any live consumer (Insurance Report, Barter Network, general valuation all reference a placeholder value today)
10. **Free tools + Wiki RAG connection** — idea stage only, would make free tools (Stain Lookup, etc.) more powerful using Dan's own Wiki RAG instead of paid AI calls; not committed

---

*HIL Standards Index v1.4 — July 2026*
*Maintained alongside `DEPLOY_STATE.md` — update only after a standard is confirmed locked, not mid-discussion.*
