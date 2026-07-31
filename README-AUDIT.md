# README-AUDIT.md
**Purpose:** tracks which live tools have READMEs, which READMEs are orphaned (no matching tool), and which tools still need one written. Companion to `DEPLOY_STATE.md` — that file tracks deploy/infra status, this one tracks documentation coverage.

**Workflow:** At the start of any session doing README work — read this file first (`raw.githubusercontent.com/Dvo77/hilsystem-com/main/README-AUDIT.md`). Work one item at a time: pick a tool, pull its live source, compare against its README (or draft a new one), update its status here, commit. At the end of a session — update ONLY the item(s) touched, append one Changelog line. Do not regenerate the whole file.

**Last updated:** July 31, 2026 (initial audit, full repo scan via codeload tarball)

---

## Status legend
- ✅ MATCHED — live tool exists, README exists, content believed current (not yet line-by-line verified against source unless noted)
- 🔍 MATCHED, NOT VERIFIED — both exist, but README content hasn't been checked against current live behavior yet (this is most of the ✅-adjacent list below until proven otherwise — treat "matched" as "paired," not "audited")
- ⚠️ NEEDS README — tool is live, no README exists
- 🔴 ORPHANED README — README exists, no matching tool file found anywhere in repo
- 🟡 MANIFEST DRIFT — `README-MANIFEST.json` entry is wrong (missing or references a ghost file)
- 🗑️ CLEANUP CANDIDATE — stale/duplicate tool file, not a README problem but blocks knowing what's actually "live"

---

## Tools with a matched README (pair exists — not yet content-verified)

hil-admin, hil-calculator-explorer, hil-exchange, hil-family-ledger, hil-fixed-points (README file named `fixed-points-README.md`), hil-guild, hil-ha-bridge, hil-import-export, hil-insurance-report, hil-label-studio, hil-library-hub, hil-room-detail, hil-room-visualizer, hil-smart-home, hil-stain-lookup, history-wall, hl-vault-cloud, hil-shell

**Note:** `hil-ha-bridge.html` + README already exist live — the queued "HA bridge end-to-end test" is a verification pass on an existing tool, not a from-scratch build.

## Tools needing a README (live, none exists)

- [ ] hil-field-tool
- [ ] hil-guild-scores
- [ ] hil-history-wall-admin
- [ ] hil-hub
- [ ] hil-kit-builder
- [ ] hil-media-admin
- [ ] hil-museum
- [ ] hil-organize
- [ ] hil-restore
- [ ] hil-supply
- [ ] hil-vessel-builder
- [ ] hil-avatar-fitter (and/or `-v1` — resolve which version is live first, see cleanup section)

## Orphaned READMEs (no matching tool file anywhere in repo)

- [ ] `hil-address-hub-README.md` — no `hil-address-hub.html` exists. Resolve: retired, renamed, or folded into another tool (Hub?)
- [ ] `hil-weather-school-README.md` — no `hil-weather-school.html` exists. Resolve: check if folded into Guild before deleting the README
- [ ] `hil-clean-README.md` — no `hil-clean.html` exists, only a `/clean/` image asset folder. Resolve: was HIL Clean ever built as its own page, or does it live inside Library Hub?
- [ ] `Guild Media Library-README.mc` — wrong extension (`.mc`, not `.md`) AND no standalone tool file (guild_media is a Firestore collection). Resolve: fix extension if kept, or confirm it documents the collection/admin panel rather than a page

## Manifest drift (`tools/readmes/README-MANIFEST.json`)

- [ ] Remove ghost entry: `hil-incubator-generator-README.md` (doesn't exist in the folder — actual incubator generator README lives at `tools/guild-incubator/readmes/`, different path, separate scope)
- [ ] Add missing entries: `HIL-Landing-Page-README.md`, `hil-Wiki Generator.README.md`, `hil-account.html-README.md`, `hil-calculator-explorer-README.md`, `Guild Media Library-README.mc`

## Cleanup candidates (stale/duplicate files — resolve before writing new READMEs for these areas)

- [ ] `hil-account-v1.html`, `hil-account-v5.html`, `hil-account-v6.html`, `hil-user-account-v1.html`, `hil-user-admin-v.html`, `hil-user-admin-v7.html`, `hil-user-admin.html` — 7 files, unclear which is actually linked/live. `hil-account.html-README.md` exists but matches none of them exactly.
- [ ] `hil-shell-v2.js`, `hil-shell-v4.js` — stale duplicates sitting alongside the real live `hil-shell.js` (v2.9+)
- [ ] `hl-room-code-generator.html` — the tool already agreed retired, still sitting in `tools/`
- [ ] top-level `multimeter-lab.html` — duplicates `electric-forge/multimeter-lab.html`

## Out of scope for this pass (own subfolder, own readmes, reasonably in sync already)

`electric-forge/` (6 Lab tools ↔ 6 matching READMEs in `electric-forge-readmes/`), `guild-incubator/`, `foundations/`, `weights-measures/` — Guild Send It Lab territory, worth a dedicated pass later rather than folding into this one.

## Non-tool READMEs (reference/doctrine docs, not page documentation — no action needed unless content is stale)

`HIL-Landing-Page-README.md`, `HL-System-Grammar-README.md`, `HL-Onboarding-Prompt-README.md`, `HL-Backend-Architecture-README.md`, `PATCH-SCRATCH-Doctrine-README.md`, `The-Index-README.md`, `Seasonal-Flare-README.md` (shell module, not a standalone page), `hil-gamification-audit-layer-README.md` (feature layer, not a page)

---

## Changelog
*(append one line per session — never edit or remove past entries)*

- **July 31, 2026** — Initial full audit via codeload tarball pull of `Dvo77/hilsystem-com`. Catalogued 18 matched pairs, 12 tools needing READMEs, 4 orphaned READMEs, manifest drift (1 ghost entry, 5 missing), 4 cleanup-candidate file clusters. File created to replace ad-hoc re-derivation each session.
