## Calculator Explorer

**File:** hil-calculator-explorer.html
**URL:** hilsystem.com/tools/hil-calculator-explorer.html
**Status:** Beta

**Purpose:** Teaches every button on a physical scientific calculator by
coordinate (rows A–H bottom-to-top, columns 1–5 left-to-right), then lets
that same knowledge be used two more ways — as a real working calculator,
and as a graded practice drill. Doubles as shared infrastructure other
Guild modules plug into without needing to know it exists.

**Core Features:**
- **Learn mode** — tap any key to see a plain explanation, a worked
  example, and its common real-world uses. Green-bordered keys have their
  own lesson; gray keys get a one-line tooltip only.
- **"Go deeper" pages** — a handful of keys (π, √ so far) have an optional
  expanded panel: what it actually is, why it matters, where it connects
  across other HIL modules, and a fun fact. Collapsed by default, opened
  only on request.
- **Calculate mode** — the same key grid becomes a real working
  calculator. Runs on a hand-rolled tokenizer/parser (not `eval()`),
  supporting +, −, ×, ÷, parentheses, exponents, sin/cos/tan, log/ln, √,
  percent, reciprocal, sign change, and scientific notation.
- **Practice mode** — graded questions, checked live against the same
  calculation engine so answers can never drift out of sync with what the
  calculator itself would produce. Optional step-by-step hints per
  question.
- **External practice sets** — any other module can send someone straight
  into Practice mode with its own formulas via a URL parameter
  (`?practiceSet=`), without this file needing to know that module exists.
  A malformed or missing set silently falls back to the built-in question
  bank rather than breaking.
- **Deep link support** — `?addr=C4` opens straight to a specific key's
  lesson, for modules that want to send someone to one exact button.
- **Module Recipes** — the reverse direction from practice sets: a small
  built-in set of sample sequences (Track Oval Lab, Send It Lab, Solar &
  Battery Lab, GED, Fluid Dynamics, Hairdressing) showing "press these keys
  in this order for this real task." Currently sample/reference data, not
  yet each module's own live recipe — see Known Limitations.
- **Printable reference card** — generated from the same on-screen data,
  so the print version can't drift out of sync with the live tool.
- **Session logging (fixed this session)** — Wrap Up writes a real entry to
  the Ledger via the shared `session-logger.js`. Includes a per-key
  anti-gaming time credit: a key must be open at least 60 seconds session-
  wide before any time counts, and no single key can bank more than 3
  minutes of credit regardless of how long it's left open — closes both
  the "click through everything fast" and "walk away with one key open"
  cheats.
- **Calculate mode never logs anything (locked decision).** It's treated
  as a pure utility, not a learning activity. Only Learn mode (key dwell
  time) and Practice mode (graded accuracy) produce a loggable session —
  Wrap Up on a Calculate-only session shows a toast and writes nothing,
  rather than logging a hollow zero-credit entry.

**How it connects:**
- Reads from: `guild_media/{assetId}` (Firestore) — resolves an asset ID
  like `HERO-004` into a CDN image URL for a deep-dive hero image. Scoped
  narrowly to media resolution; every other part of the tool is in-memory
  only.
- Reads from: `users/{uid}/team_members` — resolves which household member
  is active for logging, via the shared `resolveActiveMember()` helper.
- Writes to: `users/{uid}/team_members/{memberId}/session_log_entries` via
  the shared `session-logger.js` `writeSessionLogEntry()` — frontend-
  writable, same tier as badges/milestones.
- Imports: `./session-logger.js` (shared across all Guild modules) and
  `./hil-shell.js` (shared shell — header, nav, auth gate, design tokens).
- Entry points: standalone from the Guild dashboard, or deep-linked from
  any module via `?addr=` or `?practiceSet=`.
- Cross-tool data flow: this file owns the calculator engine, grading
  logic, and UI; a module owns its own formulas and supplies them as data.
  Solar & Battery Lab is the first module using this live.

**Known limitations / not yet live:**
- **Module Recipes are still sample data.** The six recipes shown
  (Track Oval, Send It, Solar & Battery, GED, Fluid Dynamics,
  Hairdressing) were written as proof-of-concept before the `practiceSet`
  pattern was locked — not yet each module's own real, maintained recipe.
  Needs a decision: strip to only genuinely-owned recipes, or keep as
  reference scaffolding.
- **Dwell-tracking granularity differs from the original spec addendum.**
  The addendum described a strict per-button 60-second floor; what's
  shipped is a session-wide 60-second floor plus a 3-minute cap per key.
  Both close the same cheats, but the two documents currently disagree —
  flagging so the spec gets reconciled, not silently drifted.
- **No hero image on the module's own Guild dashboard card yet.**
- **Physical key-to-coordinate mapping is still an approximation** — not
  yet traced against a real physical calculator.
- **`guild_media` CDN URL construction is inferred, not confirmed** against
  the R2 signer Worker's actual source. First thing to check if a
  deep-dive hero image fails to load.
- **Zero persistence for Learn-mode "viewed" state** — resets on reload.
  Not yet decided whether this should tie into a completion checkmark on
  the Scoreboard the way other modules track progress.

**Common questions this tool answers:**
- "What does this button on my calculator do?" → Tap it in Learn mode —
  every key has at least a one-line explanation, and the important ones
  have a full example.
- "Can I actually use this as a calculator?" → Yes, switch to Calculate
  mode — it's a real working calculator, not just a diagram.
- "How do I know if I'm getting these right?" → Practice mode grades your
  answer against the real calculation live, with optional step-by-step
  hints if you get stuck.
- "Why isn't my time on this page counting toward my Guild credit?" →
  Time only counts after 60 seconds on a key, and caps at 3 minutes per
  key — parking on one button or clicking through fast won't bank extra
  credit; genuinely spending time reading does.
- "I hit Wrap Up and it said to select a user — what happened?" → That
  meant no household member was resolved for your account; make sure at
  least one team member exists under your profile. (Historical note: an
  earlier build-time bug could also cause this regardless of setup —
  fixed as of this session, see Changelog.)

---

### Guild Proctoring & Tutoring Extension
*(Beyond the base HIL-Tool-Doc-Schema-README.md template — Guild-specific.)*

**Module ID:** `hil-calculator-explorer`
**Scoring path:** `accuracy` — Practice mode is a real predict-then-check
moment (user commits an answer, it's graded against the live-computed
correct value), which is the Path A shape. Learn-only sessions (no
practice attempted) simply write `accuracy: null`, consistent with "stays
null when not scored."
**Subjects:** `math`
**Concept tags (ledger-facing, normalized):** `order-of-operations`,
`percent`, `trig-basics`, `exponents`, `reciprocal`

**What we want a learner to walk away knowing:**
- Every key on a scientific calculator has a real purpose, not just the
  number pad — including ones that look intimidating (log, EE, 1/x)
- Parentheses and order of operations aren't calculator trivia — they're
  the difference between a right and wrong real-world answer
- The negative-sign key and the subtract key are genuinely different
  operations, and mixing them up is the single most common calculator
  mistake
- Reading a formula off a page and correctly translating it into calculator
  keystrokes is its own skill, separate from understanding the math itself

**Big ideas (for PATCH's cross-module connection-finding — not ledger
tags):**
- A calculator key only means something once it's tied to a real formula —
  this is the same idea as a multimeter reading being meaningless without
  circuit context. The calculator itself is Literacy-hub infrastructure;
  what makes any of it matter is the Domain hub problem it's solving.
- Square and square root are inverses the same way multiplying and
  dividing are — one turns a length into an area, the other turns an area
  back into a length. Any module that goes from "how much material" to
  "what size to cut" is doing this exact move.
- π shows up anywhere something is round — pipe cross-sections in Fluid
  Dynamics, track curves in Track Oval Lab, trunk diameter in tree growth
  — it's the same ratio every time, just attached to a different real
  object.

**Socratic proctoring angle (for Master Patch Proctoring, Path C):**
- "If I gave you the area of a square room and asked for the length of one
  wall, which button would get you there, and why?"
- "What's the difference between pressing the minus key and the
  negative-sign key? Show me an example where mixing them up gives you the
  wrong answer."
- "Why does a calculator need parentheses at all — couldn't you just do
  the multiplication first?"
- "If a recipe or a module told you to use π and then square a number,
  which order would you actually press those keys in, and does the order
  matter here?"

---

## Changelog

- **This session:** Added real Calculate mode (hand-rolled parser, not
  `eval()`) and real Practice mode with the `practiceSet` external-data
  contract. Wired actual Ledger writes via `session-logger.js` (previously
  wrote nothing). Fixed three bugs found during that wiring: (1)
  `scoringPath` was set to an unrecognized value and silently forced
  `accuracy` to always be `null`; (2) the per-key anti-gaming time credit
  was computed but never reached the actual Ledger entry — added
  `activeMinutesOverride` support to `session-logger.js` (additive,
  backward-compatible) to fix this; (3) exponent/unary-minus precedence
  bug where `-2^2` evaluated to `4` instead of the correct `-4`. Fixed a
  fourth, more serious bug found after deploy: `HILShell.init()`'s
  `onAuth` callback had captured a stale reference to the original
  `handleAuth` function before a later script wrapped it to also resolve
  the active household member — meaning member resolution never actually
  ran, and every Wrap Up failed with a "select a user" error regardless of
  account setup. Fixed by indirecting through `window.handleAuth` at call
  time instead of passing the function by direct reference. Locked a
  decision that had been an open question: Calculate mode never logs to
  the Ledger — Wrap Up on a Calculate-only session now shows a toast and
  writes nothing instead of a hollow zero-credit entry.
