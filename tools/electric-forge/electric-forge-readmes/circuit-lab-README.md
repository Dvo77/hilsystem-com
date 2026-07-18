# Circuit Lab — README

**Module ID:** `circuit-lab`
**Sits next to:** `circuit-lab.html`

## What this is
A live explorer for how resistors combine in series, parallel, and series-parallel
topologies — adjust resistor values and battery voltage, and see a full per-component
breakdown of voltage, current, and power update in real time.

## What we want a learner to walk away knowing
- In **series**, resistance simply adds (R_eq = R1 + R2), and the same current flows
  through every component — voltage splits proportionally.
- In **parallel**, resistance combines by reciprocal addition, and the result is *less*
  than even the smallest individual resistor — this is the genuinely counterintuitive part
  most people don't believe until they see the number computed from their own values.
- In a **series-parallel** combination, the two rules apply to different parts of the same
  circuit at once — R1's current is the total current, which then splits between R2 and R3
  before recombining.
- How to actually compute equivalent resistance for all three cases, not just recite the
  formulas.

## How to use it, completely
1. Pick a **topology**: Series, Parallel, or Series-Parallel.
2. Adjust **R1, R2** (and **R3**, which appears only in Series-Parallel mode) via the
   dropdowns, and set the **battery voltage**.
3. Read the **results table** — voltage, current, and power for every component, live.
4. Check the **summary cards** — total equivalent resistance, total current, total power.
5. Read the **callout box** — a plain-language explanation of what's actually happening in
   the current topology, including the "smaller than the smallest resistor" surprise when
   in Parallel mode.
6. Watch the **circuit diagram** redraw itself to match the selected topology — series as
   a straight chain, parallel as two rails with vertical branches, combo as a hybrid.

## Big ideas (for cross-module connection-finding — not ledger tags)
- **How parts are arranged changes what the whole system can do — arrangement isn't just
  bookkeeping.** Opening a second checkout lane doesn't add to the wait, it removes from
  it. The same "more paths = easier flow, arranged differently = different outcome" logic
  shows up in blood vessels branching, river deltas, crowds moving through multiple doors.
- **Some combinations are additive, some aren't — and knowing which is which matters.**

## Technical concept tags (ledger-facing, normalized)
`["series-circuits","parallel-circuits","equivalent-resistance"]`

## Subjects
`["physics","math"]`
