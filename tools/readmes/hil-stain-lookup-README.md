# HIL Stain Lookup — Tool Documentation

**File:** `tools/hil-stain-lookup.html`
**URL:** `hilsystem.com/tools/hil-stain-lookup.html`
**Status:** Live (Beta — recipe library incomplete)

**Purpose:** Two-click stain removal reference. User selects stain type and surface — tool returns the correct chemistry, dwell time, step-by-step procedure, honest removal odds, material-specific warnings, and proven commercial alternatives. No account. No install. Works offline.

---

## Core Features

- **Two-step chip selector** — Step 1: stain type. Step 2: surface. Result renders instantly
- **Removal Odds indicator** — HIGH / MODERATE / LOW — honest assessment, not marketing. Low odds are stated plainly
- **Chemistry label** — one-line description of the active principle (e.g. ENZYME / COLD WATER, CITRIC ACID CHELATION, ABSORPTION POULTICE)
- **Minimum Dwell Time** — stated in the stats bar so users know before they start
- **Patience Dots** — 1–5 dot visual showing how much waiting is required. Core teaching tool
- **Dwell Curve** — bar chart: time on X, effort required on Y. Shows that waiting replaces scrubbing. Each point has a timestamp and note
- **Warranty Check block** — appears on every recipe, every time. Tells users to check manufacturer guidance before doing anything that could void coverage
- **Why It Works** — plain-language chemistry explanation for each recipe
- **Procedure** — numbered steps with em-highlighted key terms (cold, dwell, do not rub, etc.)
- **Surface Note** — per-surface callout explaining what's different about this specific surface for this specific stain
- **What You Need** — ingredient list with amounts and purpose notes
- **Do Not section** — warnings with danger/caution levels. Danger = red, Caution = orange
- **Proven Commercial Alternatives** — honest product callouts with plain reason why they work
- **Material / Manufacturer Notes** — specific callouts per material type (wool, marble, veneer, Chrome, etc.)
- **ENV rating** — disposal impact per recipe
- **Suggestion Form** — collapsible panel. User submits missing stain/surface combinations. Stores to localStorage. No backend yet
- **"In Research Queue" state** — unwritten combinations show a useful placeholder instead of an error

---

## Recipe Schema (for PATCH reference)

Every recipe contains:

```
title         — full stain + surface name
odds          — high / med / low
chemistry     — one-line active principle
dwell         — minimum time string
patience      — 1-5 integer (dot display)
why           — plain language chemistry explanation
dwell_curve   — array of {t, eg, note} — time / effort / description
steps         — array of strings (HTML allowed for <em> highlights)
surfaceNote   — surface-specific guidance
ingredients   — array of {name, amt, note}
warnings      — array of {icon, text, level} — level: danger / caution
alts          — array of {name, why}
material_specs— array of {material, note}
env           — string (LOW IMPACT / MEDIUM / ZERO IMPACT)
```

---

## Current Recipe Library (11 of 49)

| Key | Status |
|---|---|
| protein:textile | ✓ Live |
| protein:hardfloor | ✓ Live |
| protein:wood | ✓ Live |
| protein:grout | ✓ Live |
| protein:stone | ✓ Live |
| protein:paint | ✓ Live |
| oil:textile | ✓ Live |
| oil:wood | ✓ Live |
| dye_ink:textile | ✓ Live |
| rust:metal | ✓ Live |
| rust:stone | ✓ Live |
| mold:grout | ✓ Live |
| *(37 others)* | Research Queue |

Full 7×7 matrix = 49 combinations. Remaining 38 show research queue state.

---

## How It Connects

- **Reads from:** Hardcoded `RECIPES` object in the HTML file. No Firestore. No network call required after page load
- **Writes to:** `localStorage` only (suggestion queue)
- **Entry points:** HIL Clean landing page (`clean/index.html`), Library Hub (`hil-library-hub.html`), Shell nav (`HIL Clean` link)
- **Shell:** Does NOT use `hil-shell.js`. Standalone public tool — no auth gate, no nav bar. Has its own consistent HIL design (dark theme, `#00cc66`, Space Mono, Barlow Condensed)
- **Planned:** Recipe data migrated to `stain-recipes.json` in repo root, fetched on load. This decouples content from tool code — Dan can add a recipe by adding a JSON block without touching the HTML

---

## Known Limitations / Not Yet Live

- **38 of 49 recipes not written** — "research queue" state is the honest placeholder. User suggestion form exists but no backend pipeline routes submissions anywhere yet
- **No search** — chip selector only. Works at current scale, will need a search input once the library fills out
- **Suggestion queue is localStorage only** — submissions are not sent anywhere. Future: Firestore `stain_suggestions` collection + PATCH agent reads these weekly
- **Coverage Map section exists** in the UI shell but the visual matrix grid is not yet populated
- **Recipe data is hardcoded in HTML** — planned migration to external JSON for easier expansion without touching tool code
- **No sharing/permalink** — selecting a combination doesn't update the URL. Users can't link to a specific recipe

---

## Design Decisions (Locked)

- **Textile = one category** — fabric + carpet + upholstery. Per-material differences handled inside the `material_specs` array, not as separate surface categories. Keeps the matrix manageable
- **Tannin removed** — coffee, tea, wine covered as Dye/Ink/Marker. Users don't search for "tannin" — they search for "coffee stain"
- **Water-based renamed Hard Water / White Ring** — the actual problem name users search for
- **Warranty Check is non-optional** — it appears on every recipe every time. Cannot be dismissed. This is intentional — it's the ethical core of the tool
- **Odds are honest** — LOW odds are stated plainly with "MANAGE EXPECTATIONS." No recipe pretends everything is fixable

---

## Common Questions PATCH Should Answer

**"How do I use the stain lookup?"**
→ Two clicks. Pick your stain type from the top row of chips, then pick your surface from the bottom row. The recipe appears immediately. No account, no login.

**"Why does it say to wait before scrubbing?"**
→ That's the dwell curve. Every cleaner needs time to break the chemical bond before mechanical effort kicks in. The longer you wait, the less you have to scrub. The tool shows this visually — effort drops as time goes up.

**"It says the stain combination I need is in the research queue. What does that mean?"**
→ That specific stain/surface combination hasn't been researched and written yet. Use the suggestion form at the bottom of the page to submit it — that helps prioritize what gets added next.

**"What does 'REMOVAL ODDS: LOW' mean?"**
→ It means the honest assessment is that full removal is unlikely — usually because the stain is set, heat was applied, or the surface absorbed it permanently. The tool still gives you the best known method, but sets expectations accurately rather than overpromising.

**"The warranty check keeps appearing — do I have to see it every time?"**
→ Yes, intentionally. Before you do anything to a warranted item, check the manufacturer's guidance. Using an unapproved method can void coverage. The tool reminds you every time because the stakes are real.

**"Can I use vinegar on my granite countertop?"**
→ Granite yes, marble no. The tool tells you this in the material specs section of any rust or hard water recipe. Acid (vinegar, citric acid, oxalic acid) permanently etches marble, travertine, and limestone. Granite is safe.

**"Is the stain lookup the same as HIL Clean?"**
→ The stain lookup tool is the interactive recipe finder inside HIL Clean. HIL Clean is the full library — it includes the stain lookup, the ten raw ingredients reference, the founding philosophy, and the Ellen Richards context.

---

## Future Expansion Plan

**Phase 1 — Content (next):**
- Write remaining 38 HIGH and MED priority recipes
- Move recipe data to external `stain-recipes.json`
- Tool fetches JSON on load, tool code stays unchanged

**Phase 2 — Backend:**
- Suggestion queue → Firestore `stain_suggestions` collection
- PATCH agent reads weekly, flags most-requested for research
- Recipe additions trigger a toast notification to subscribed users

**Phase 3 — Integration:**
- HIL Clean Kit — stain lookup linked to Kit Builder
- Kit contains the 8 raw ingredients with their HL addresses
- Looking up a recipe shows you which kit items you need and where they live

---

## Placement in the HIL System

HIL Stain Lookup is part of the **HIL Library** — the knowledge tier of the platform. Library tools are:
- Free with no account required
- Offline-capable (load once, works without signal)
- Standalone HTML files with no Shell dependency
- Governed by principles, not products (Ellen Richards doctrine)

Library tier sits alongside but separate from the platform tier (Vault, Exchange, Ledger, etc.) which requires auth and uses the Shell.

---

*Last updated: June 2026 | Maintained by: Dan DeVoy (Dvo77) | Part of the HIL System Library*
