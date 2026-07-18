# AC vs DC vs Brushless — Motor Efficiency Lab — README

**Module ID:** `motor-efficiency-lab`
**Sits next to:** `ac-dc-motor-lab.html`

## What this is
A side-by-side comparison of three motor types — brushed DC, AC induction, and brushless
DC (BLDC) — showing how their efficiency changes across load, and *why* each one loses
power through a different mechanism.

## What we want a learner to walk away knowing
- Efficiency isn't a single fixed number for a motor — it changes with how loaded the
  motor is, and different motor types have different-shaped efficiency curves.
- Every motor loses some power as heat, always — the real question is always "how much,
  and through what mechanism," never "does it lose any."
- Brushed DC loses power to physical friction (brushes on a commutator).
- AC induction loses power to core losses (alternating magnetic field) and needs a
  constant magnetizing current regardless of load — which is *why* it gets worse
  proportionally at light load (poor power factor).
- Brushless DC avoids both of those penalties (no brushes, no slip, no continuous
  magnetizing draw) — which is the actual engineering reason it's in cordless tools and
  modern fans, not just "newer is better."

## How to use it, completely
1. Pick a **motor size** (1/4 HP to 5 HP) and a **supply voltage** (12–240V presets).
2. Drag the **load slider** (10%–150% of rated) and watch all three efficiency curves
   respond at once on the chart.
3. Read the **winner banner** — it names whichever motor type is most efficient at the
   *current* load, since the "winner" changes depending on where you are on the curve.
4. Check the three **stat cards** below the chart for exact numbers per motor type:
   output power, input power, efficiency, current drawn, and (for AC) power factor and
   apparent power.
5. Read the **loss breakdown bars** — each card shows fixed loss (doesn't care about load)
   vs. variable loss (grows with load squared) as a visual segmented bar.
6. Scroll to **"Why they lose power differently"** for the plain-language mechanism behind
   each motor type's loss profile.

## Big ideas (for cross-module connection-finding — not ledger tags)
- **Energy conversion always leaks.** Every time energy changes form — electrical to
  mechanical, chemical to mechanical, light to electrical — something is lost as heat.
  This shows up identically in engines, digestion, even a phone charger getting warm.
- **The "best" option depends on the operating condition, not a fixed ranking.** A motor
  that wins at full load can lose badly at light load — same logic as comparing car
  engines on highway mileage alone while ignoring city driving.

## Technical concept tags (ledger-facing, normalized)
`["motor-efficiency","power-factor"]`

## Subjects
`["physics","engineering"]`
