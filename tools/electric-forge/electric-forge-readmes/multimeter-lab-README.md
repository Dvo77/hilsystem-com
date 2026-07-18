# Multimeter Lab — README

**Module ID:** `multimeter-lab`
**Sits next to:** `multimeter-lab.html`

## What this is
A hands-on simulator for correct multimeter technique — a real series circuit (battery +
two resistors) where the learner has to place probes correctly for DC Volts, DC Amps, or
Ohms mode, with real consequences (including a blown fuse) for the classic real-world
mistakes.

## What we want a learner to walk away knowing
- **Voltmeters go in parallel** — touch two points, don't break anything, safe regardless
  of whether the circuit is powered.
- **Ammeters go in series** — the circuit has to be physically broken and routed through
  the meter. Touching an ammeter across two points like a voltmeter creates a dead short
  and blows the fuse — this is the single most common real-world multimeter mistake, and
  this module lets it happen safely, in simulation, with a clear explanation of why.
- **Ohmmeters require the circuit to be powered off** — the meter supplies its own test
  current, and an outside voltage source fighting that gives a false or damaging reading.
- Current is identical everywhere in a series circuit — provable directly, by inserting
  the ammeter at three different points and getting the same reading every time.
- How to read basic schematic symbols (battery, resistor, junction dot, switch) — the same
  conventions used on any real circuit diagram.

## How to use it, completely
1. Pick a **mode**: DC Volts, DC Amps, or Ω Ohms.
2. Adjust **battery voltage** and the **R1/R2** dropdowns to change the circuit.
3. In Volts or Ohms mode, **tap two of the three circuit nodes** (battery+, the junction
   between R1/R2, battery−) to place both probes and see the reading.
4. In Amps mode, either **tap one dashed wire segment** (correct — inserts the meter in
   series) or **tap two nodes** (incorrect — simulates the short-circuit mistake and blows
   the fuse, with a "Replace Fuse" button to reset).
5. For Ohms mode, **flip the power switch off first** — leaving it on returns an explicit
   "invalid" warning instead of a number.
6. Scroll to the **schematic symbol legend** to see the same four symbols used in the
   diagram, named and explained on their own.

## Big ideas (for cross-module connection-finding — not ledger tags)
- **The tool has to match how you're observing the thing.** A microscope, a telescope, a
  stethoscope, a multimeter — each one only works correctly when it's positioned according
  to what it's actually measuring. Wrong placement doesn't just give an imprecise answer,
  it can give a false one, or break the tool.
- **Reading a diagram is its own literacy**, transferable the moment you learn the
  convention — the same zigzag, the same battery symbol, shows up on every real schematic
  a learner will ever encounter.

## Technical concept tags (ledger-facing, normalized)
`["ohms-law","voltmeter-placement","ammeter-placement","schematic-reading"]`

## Subjects
`["physics","engineering"]`

## Note for logging
This is the one Electric Forge module with a genuine pass/fail interaction — see the
Outcome Credit Table in the session-logging build prompt. `accuracy` stays null (no
predict-then-reveal numeric mechanic), but `outcome: "success" | "mistake"` applies here.
