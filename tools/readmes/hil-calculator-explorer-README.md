## Calculator Explorer

**File:** hil-calculator-explorer.html
**URL:** hilsystem.com/tools/hil-calculator-explorer.html (pending deploy)
**Status:** Beta — functional, linked from Guild dashboard, content not yet verified

**Purpose:** Teaches what every button on a standard scientific calculator
actually does, addressed by physical coordinate, so any Guild module can
point someone at a specific key ("press E5") instead of re-explaining
calculator basics from scratch every time.

**Core Features:**
- Physical keypad grid (8 rows × 5 columns) matching a real calculator's
  layout, addressed A (bottom) through H (top) per the HL Level convention
- Tap any key to see a plain-language explanation and worked example
- Keys are marked simple (quick tooltip) or complex (full page) — not
  ranked by module or difficulty tier
- **Deep-dive pages** for select keys (currently: π) — an optional expandable
  section covering what the function actually is, why it matters, real
  connections to other HIL modules (Fluid Dynamics, Welding, etc.), and a
  memorable fact. Most keys don't have one; added selectively where the
  depth is genuinely worth it, not applied uniformly
- Sample "Module Recipes" section demonstrating how another module (GED,
  Fluid Dynamics, Hairdressing, etc.) would reference this tool: an ordered
  list of coordinates with plain instructions, no calculator-side knowledge
  of the module required

**How it connects:**
- Reads from: nothing yet (all data is inline in the file)
- Writes to: nothing yet — no persistence; progress resets on reload
- Entry points: linked from the Guild dashboard module grid
  (hil-guild-v1.html), between Scoreboard and Guild Music School
- Runs through hil-shell.js — HILShell.init() uses the confirmed real API
  (toolId, toolName, requireAuth, onAuth). No custom header; defers to the
  shell's injected chrome, matching the pattern used across other tools
- Cross-tool data flows: designed so other Guild modules can write their own
  recipe content referencing this tool's coordinates, without this tool
  needing to know those modules exist

**Known limitations / not yet live:**
- Content (explanations, examples, recipe steps) is a first draft — not
  checked against real GED material or trade-specific accuracy
- Physical key-to-coordinate mapping is approximated, not traced from an
  actual unit
- No Firestore persistence — viewed/understood state does not survive a
  page reload
- **Not wired into the Session Log / credit-hours system** — time spent in
  this tool doesn't write to session_log_entries and won't show up on the
  Scoreboard yet. Same pattern as Custom Goals' Start Session/Wrap Up timer
  would need to be added here
- No arithmetic function — button taps display the label but don't compute
- Only one key (π) has a deep-dive page so far; sin/cos/tan and log are
  flagged as good next candidates but not yet written

**Common questions this tool answers:**
- "What does the √ button actually do?" → Full explanation plus a worked
  example, addressed by its physical coordinate.
- "Which calculator keys do I actually need for the GED?" → Answered by
  whichever module (e.g. a GED pathway) builds a recipe pointing at this
  tool — not by the calculator itself.
- "I don't know what HYP means" → Tap the key, read the plain explanation.
