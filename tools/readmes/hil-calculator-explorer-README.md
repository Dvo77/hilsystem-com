Calculator Explorer

File: hil-calculator-explorer.html
URL: hilsystem.com/tools/hil-calculator-explorer.html (pending deploy)
Status: Beta — functional, linked from Guild dashboard, content not yet verified

Purpose: Teaches what every button on a standard scientific calculator
actually does, addressed by physical coordinate, so any Guild module can
point someone at a specific key ("press E5") instead of re-explaining
calculator basics from scratch every time. Now also functions as a real
calculator, a graded practice tool, and shared infrastructure other modules
can plug their own formulas into.

Core Features:

Physical keypad grid (8 rows × 5 columns) matching a real calculator's
layout, addressed A (bottom) through H (top) per the HL Level convention
Three modes, same grid: Learn (tap a key for a plain-language
explanation and worked example), Calculate (the grid becomes a real
working calculator), Practice (graded questions against the same math)
Calculate mode runs on a hand-rolled expression parser — not eval() or
Function() — so arbitrary input can never execute arbitrary JS. Supports
order of operations, parentheses, trig in degrees, √, x², 1/x, %, negative
sign, and scientific notation
Practice mode: 10 built-in questions drawn from real button functions,
shuffled order, running score. Answers are graded by evaluating the
question's solution expression through the same parser the student's
input goes through — never a hand-typed "correct answer," so grading can't
drift out of sync with what the calculator itself would compute. Some
questions include an optional step-by-step key sequence breakdown
External practice sets — the infrastructure/module split: another
module can hand this tool a custom question list via a URL parameter
(?practiceSet=) without this tool ever needing built-in knowledge of
that module. Live and proven working with Solar & Battery Lab, which
builds its own practice questions from whatever its sliders are currently
set to and hands them off
Deep-link support (?addr=) opens straight to one key's lesson — used by
other modules' "Calculator Keys" sections to link a specific button
Deep-dive pages for select keys (currently: π) — an optional expandable
section covering what the function actually is, why it matters, real
connections to other HIL modules (Fluid Dynamics, Welding, etc.), and a
memorable fact. Most keys don't have one; added selectively where the
depth is genuinely worth it, not applied uniformly
"Module Recipes" section demonstrating how another module (GED, Fluid
Dynamics, Hairdressing, Solar & Battery Lab, etc.) references this tool:
an ordered list of coordinates with plain instructions, no calculator-side
knowledge of the module required
Printable field reference (print-only page, triggered by an on-screen
button) — full key map plus every Module Recipe, generated live from the
same data the on-screen tool uses so the printed card can't drift out of
sync with it. Follows the same print-page visual conventions as Label
Studio's Starter Pack

How it connects:

Reads from: nothing yet — all button/lesson content is still inline in
the file
Writes to: session_log_entries, via the same SessionLogger pattern
confirmed working in Solar & Battery Lab. Caveat: only the
description field is confirmed accepted by the real wrapUp() — this
tool also sends accuracy and outcome based on Practice mode's score,
which is inferred from the Ledger preview's own expected field names, not
confirmed against session-logger.js's actual source
Entry points: linked from the Guild dashboard module grid
(hil-guild-v1.html), between Scoreboard and Guild Music School; also
linked from Import/Export's Quick Downloads (for the printable reference)
Runs through hil-shell.js — HILShell.init() uses the confirmed real API
(toolId, toolName, requireAuth, onAuth). No custom header; defers to the
shell's injected chrome, matching the pattern used across other tools
Cross-tool data flows: now real, not just designed. The practiceSet
contract is implemented and live-tested end to end against Solar &
Battery Lab

Known limitations / not yet live:

Content (explanations, examples, recipe steps) is a first draft — not
checked against real GED material or trade-specific accuracy
Physical key-to-coordinate mapping is approximated, not traced from an
actual unit
No Firestore persistence — Learn-mode viewed state and Practice scores
don't survive a page reload; only a Wrap Up snapshot gets logged, not
continuous progress
Session Log wiring exists but the richer fields (accuracy, outcome)
are unconfirmed against the real session-logger.js contract — verify
before relying on them showing up correctly in the actual Ledger UI
Only one key (π) has a deep-dive page so far; sin/cos/tan and % are good
next candidates — now that Practice mode exists, a deep-dive can end with
an actual "try it yourself" instead of just a fun fact
Practice mode's question bank is small (10) and hand-curated, not
auto-generated from the loose example text already sitting on most
buttons — that prose wasn't written to be machine-parsed, so growing the
bank means writing more {prompt, solutionExpr} pairs by hand
Only 5 of the 10 built-in Practice questions have a step-by-step
breakdown written yet
The printable reference card only includes static content (key map,
Module Recipes) — Practice mode's live, slider-dependent module formulas
(like Solar Lab's) aren't captured on paper

Common questions this tool answers:

"What does the √ button actually do?" → Full explanation plus a worked
example, addressed by its physical coordinate.
"Which calculator keys do I actually need for the GED?" → Answered by
whichever module (e.g. a GED pathway) builds a recipe pointing at this
tool — not by the calculator itself.
"I don't know what HYP means" → Tap the key, read the plain explanation.
"Can I actually calculate with this, not just learn about it?" → Yes —
switch to Calculate mode for a real working calculator with proper order
of operations.
"How do I practice what I just learned?" → Practice mode grades answers
against the same math engine, tracks a running score, and can reveal the
key-by-key procedure on request.
"How does [a module] plug its own formulas into this calculator?" → Via
the practiceSet URL contract — the module supplies the questions, this
tool supplies the grading and UI, and neither side needs to know the
other's internals.
