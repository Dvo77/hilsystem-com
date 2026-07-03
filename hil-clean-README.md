# HIL Clean — Tool Documentation

**File:** `clean/index.html` (landing page) + `tools/hil-stain-lookup.html` (primary tool)
**URL:** `hilsystem.com/clean/`
**Status:** Live

**Purpose:** Domestic science library. Teaches users the chemistry behind cleaning so they can solve any household stain or maintenance problem with 8–10 raw ingredients instead of a cabinet full of branded products. Inspired by Ellen Swallow Richards, 1882. Free forever.

---

## Core Features

- **Stain Lookup Tool** — select stain type + surface → get correct chemistry, minimum dwell time, step-by-step procedure, disposal guidance, and honest removal odds
- **Dwell Curve** — visual bar chart showing effort required over time. Teaches the core principle: patience replaces scrubbing
- **Warranty Check block** — built into every recipe. Reminds users to check manufacturer guidance before attempting any method that could void coverage
- **Why It Works section** — explains the chemistry behind each recipe in plain language. Not just what to do — why it works
- **Material/Manufacturer Specs** — per-recipe callouts for specific materials (wool, marble, laminate, etc.) that need different treatment
- **Proven Commercial Alternatives** — honest acknowledgment of products that work, with plain language on why
- **Suggestion Form** — users can submit missing stain/surface combinations for the research queue. Submissions stored in localStorage. No account required
- **Coverage Map** — collapsible panel showing which stain/surface combinations are in the library vs. still being researched
- **Environment rating** — each recipe includes disposal impact (LOW IMPACT / MEDIUM / ZERO IMPACT)

---

## Stain/Surface Matrix

**7 stain categories:**
- Protein (blood, egg, dairy, sweat, pet)
- Oil / Grease
- Dye / Ink / Marker
- Rust / Mineral
- Mold / Mildew
- Solvent / Paint / Adhesive
- Hard Water / White Ring

**7 surface categories:**
- Textile (fabric, carpet, upholstery — unified)
- Hard Floor (tile, LVP, hardwood, laminate)
- Wood (furniture, trim, floor)
- Grout / Tile
- Stone / Concrete
- Metal
- Painted Surface

**49 total combinations.** Currently 11 fully documented recipes. Remaining combinations show a "research queue" state with the suggestion form.

---

## The Ten Raw Ingredients

The philosophy behind HIL Clean — 10 ingredients replace 40+ branded products:

| Ingredient | Chemistry Role |
|---|---|
| Citric acid | Chelating agent — rust, descaling, mineral deposits |
| Oxalic acid | Iron chelator — rust stains on surfaces |
| White vinegar | Acetic acid 5% — glass, mineral scale, general acid cleaning |
| Baking soda | Sodium bicarbonate — mild abrasive, alkaline agent, odor |
| Washing soda | Sodium carbonate — heavy grease, laundry booster |
| Hydrogen peroxide | Oxidizing agent 3% — mold, mildew, disinfection |
| Isopropyl alcohol | Solvent/disinfectant — ink, marker, adhesive residue |
| Dish soap | Surfactant — emulsifies oil so water can carry it away |
| Powdered silica | Micro-abrasive — mechanical scrubbing at microscopic level |
| Enzyme cleaner | Biological agent — protein stains, breaks peptide bonds |

Plus: water. The most underrated cleaner in any household.

---

## How It Connects

- **Reads from:** No Firestore dependency. Fully static — no auth, no backend, no account required
- **Writes to:** `localStorage` only (suggestion queue submissions)
- **Entry points:** `hilsystem.com/clean/` marketing page, Library section on `hilsystem.com`, Library Hub (`hil-library-hub.html`)
- **Shell:** Does NOT use `hil-shell.js` — intentional. HIL Clean is a free public library tool with no auth requirement. It uses its own standalone design (dark theme, `#00cc66`, Orbitron/Space Mono/Barlow) consistent with HIL brand but no nav or auth gate
- **Cross-tool data flows:** None currently. Kit Builder (planned) will eventually link cleaning kit contents to HIL Clean recipes via HL address

---

## Known Limitations / Not Yet Live

- 38 of 49 stain/surface combinations are not yet written. Unresearched combinations show a "research queue" state with the suggestion form
- Suggestion form stores to `localStorage` only — no backend pipeline yet to route suggestions to Dan for review
- Recipe expansion planned as modular JSON file (`stain-recipes.json`) fetched on load — allows adding recipes without touching the tool HTML
- Coverage Map panel exists but is not yet populated with the full matrix visualization
- No search/filter — users must select from chips. Fine at current scale, will need addressing at 49+ recipes

---

## Design Decisions (Locked)

- **Textile = unified category** (fabric + carpet + upholstery). Notes inside each recipe call out differences per material
- **Tannin removed as a stain category** — absorbed into Dye/Ink/Marker for practical user purposes
- **Water-based renamed to Hard Water / White Ring** — more descriptive of the actual problem users search for
- **No Shell** — HIL Clean is intentionally accessible without login. It lives in the Library tier, not the platform tier

---

## Common Questions PATCH Should Answer

**"What do I use on a blood stain?"**
→ Blood is a protein stain. Cold water + enzyme cleaner. NEVER hot water — heat cooks protein into fiber permanently. Blot, don't rub. Don't put it in the dryer until it's fully gone.

**"I spilled coffee on my carpet, what do I do?"**
→ That's a tannin-type stain under Dye/Ink/Marker or use the Protein path if it had milk. Blot immediately, cold water, baking soda paste or dish soap, work outside-in. The overnight weighted cloth trick prevents the stain from wicking back up from the backing.

**"What's the difference between baking soda and washing soda?"**
→ Both are alkaline but washing soda (sodium carbonate) is significantly stronger. Baking soda (sodium bicarbonate) for mild abrasive and light alkaline work. Washing soda for heavy grease and drain cleaning. Don't swap them without adjusting quantity.

**"Will vinegar damage my marble countertop?"**
→ Yes. Never use acid (vinegar, citric acid, oxalic acid) on marble, travertine, or limestone. These are calcium carbonate — acid etches them permanently. pH-neutral cleaners only on those surfaces.

**"Why does HIL Clean say to wait before scrubbing?"**
→ Dwell time is the active ingredient. Every cleaner needs time to break the chemical bond before your arm has to do it mechanically. The commercial version is watered down because they can't trust you to wait. The concentrated version works better and requires less effort — if you let it work.

**"I have 19 cleaning products under my sink. Can I replace them?"**
→ Most of them, yes. The HIL Clean philosophy: 8 raw ingredients at ~$30/year outperform 19 branded products at ~$180/year. The difference is knowing what you're doing. That's what the library is for.

**"Is HIL Clean free?"**
→ Yes. Free forever. No account. No login. Open it on any device, including one with no signal.

---

## The Founding Philosophy

Ellen Swallow Richards, 1882 — first woman admitted to MIT — published *The Chemistry of Cooking and Cleaning*. Her argument: teach people the principles, not the recipes. A bag of washing soda and a bottle of vinegar outperforms a cabinet of branded products — if you know why.

The consumer goods industry replaced her principles with brand names and her raw materials with proprietary formulas.

HIL Clean finishes her argument.

*"Act from principles, not from recipes alone." — E.S. Richards, 1882*

---

*Last updated: June 2026 | Maintained by: Dan DeVoy (Dvo77) | Part of the HIL System Library*
