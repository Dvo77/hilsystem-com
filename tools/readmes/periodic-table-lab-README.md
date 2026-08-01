## Periodic Table Lab

**File:** periodic-table-lab.html
**URL:** hilsystem.com/tools/natural-sciences/periodic-table-lab.html
**Status:** Live

**Purpose:** Explore every element's category, electron configuration, and real-world uses, then test what stuck with a short practice quiz — first module in the Natural Sciences hub.

**Core Features:**
- Full periodic table grid (all 118 elements), click any element for name, category, atomic number, mass, electron configuration, and a plain-language "where it shows up" real-world use
- Category filters (alkali metal, transition metal, noble gas, etc.) each pop a plain-English explainer of what actually makes that category distinct chemically — not textbook jargon
- "Plant & soil elements" toggle highlights the macro/micronutrients relevant to plant biology and soil chemistry (N, P, K, Ca, Mg, S, Fe, Mn, Zn, Cu, B, Mo, Cl, Ni, plus C/O/H) — the Carrie/Hollow Moon Botanicals tie-in
- Explore mode: dwell-time credit, flat per unique element viewed, anti-gaming floor/cap same shape as Calculator Explorer's per-key credit
- Practice mode: 8-question randomized quiz (category / symbol / atomic number), each answer credits time based on actual seconds spent, floored and capped
- Wrap Up writes a real Session Log Entry through the shared `session-logger.js`, combining Explore + Practice credit into one `activeMinutesOverride`

**How it connects:**
- Reads from: `users/{uid}/team_members/{memberId}/session_log_entries` (via `resolveActiveMember`, for the active-member resolution only — no read of prior scores)
- Writes to: `users/{uid}/team_members/{memberId}/session_log_entries` via `writeSessionLogEntry()`, `moduleId: 'periodic-table-lab'`
- Entry points: Natural Sciences hub → "Open Periodic Table Lab"
- Cross-tool data flows: logged sessions feed both the Natural Sciences hub's progress strip and the Guild root's Time by Category tracker, via `guild-module-registry.js`'s `natural-sciences` entry

**Known limitations / not yet live:**
- No `?member=` handoff from the hub — falls back to auto-selecting a household member on load, same known gap as every other Guild module launched from a hub card
- Element content (uses, electron configs) is static/hardcoded in the file, not pulled from any shared reference collection — updating an element's facts means editing this file directly
- No hint/retry mechanic in Practice mode — wrong answers reveal the correct one immediately and move on, no second attempt

**Common questions this tool answers:**
- "What's the difference between a metal and a metalloid?" → Category filter explainer covers this in plain language when you tap the Metalloid filter.
- "Which elements actually matter for plants?" → Plant & soil elements toggle highlights them directly on the table.
- "Do I get credit just for looking around, or do I have to take a quiz?" → Both — Explore mode credits time per element viewed, Practice mode credits time plus scores accuracy; Wrap Up logs whichever (or both) you did.
- "Why did my score reset when I switched modes?" → Practice mode's score is per-round; switching back to Explore doesn't erase it, but starting a new Practice round does.

### Guild Proctoring & Tutoring Extension
*(Beyond the base HIL-Tool-Doc-Schema-README.md template — Guild-specific.)*

**Module ID:** periodic-table-lab
**Scoring path:** accuracy — Practice mode's quiz produces a real correct/attempted ratio; Explore-only sessions leave `accuracy: null` and `outcome: 'explored'`, same honest-time-no-score path as Solar & Battery Lab / Circuit Lab.
**Subjects:** chemistry, science
**Concept tags (ledger-facing, normalized):** periodic-table, element-categories, electron-configuration

**What we want a learner to walk away knowing:**
- The periodic table isn't arbitrary — position tells you real chemical behavior (reactivity, electron count, metal vs. nonmetal character)
- Every element shows up somewhere real — batteries, bones, computer chips, fireworks — not just in a classroom
- A handful of elements (N, P, K, Ca, Mg, and a few trace ones) are the actual building blocks of plant and soil biology

**Big ideas (for PATCH's cross-module connection-finding — not ledger tags):**
- Electron configuration here is the same underlying idea as Electric Forge's Circuit Lab — both are about how something is "wired" internally driving its outward behavior
- The plant/soil element set is a direct bridge to any future Biology or Hollow Moon Botanicals-adjacent module — PATCH can point a learner from "why do plants need nitrogen" here without needing a dedicated botany module to exist yet

**Socratic proctoring angle (for Master Patch Proctoring, Path C):**
- "You said noble gases don't react — why not, in terms of what's happening with their electrons?"
- "Sodium and potassium are both alkali metals. What would you predict happens if you dropped potassium in water, based on what you saw for sodium's group?"
- "Why do you think fertilizer bags list N-P-K numbers instead of just one number?"
