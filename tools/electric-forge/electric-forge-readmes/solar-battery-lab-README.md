# Solar & Battery Lab — README

**Module ID:** `solar-battery-lab`
**Sits next to:** `solar-battery-lab.html`

## What this is
A model of a real off-grid solar + battery system — battery capacity, state of charge, a
device load, a solar array, real-world sun conditions, and a charge controller — that
computes actual runtime, charge time, and flags unsafe charge/discharge rates.

## What we want a learner to walk away knowing
- **Ah × V = Wh** — a battery's real stored energy depends on both its amp-hour rating
  and its voltage, not amp-hours alone.
- A solar panel's wattage rating is a best-case number — actual output depends on real
  sun conditions and controller efficiency, and is often well below the rated figure.
- **C-rate** is the real safety concept behind "don't charge or discharge a battery too
  fast" — it's a specific, calculable ratio (current ÷ capacity), not a vague caution.
- MPPT and PWM charge controllers aren't interchangeable — MPPT is meaningfully more
  efficient (especially in non-ideal conditions), which is a real reason to spend more on
  one over the other.
- How to compute whether a system is net charging or net discharging, and how long until
  it's full or empty at the current rate.

## How to use it, completely
1. Set **battery capacity** (Ah) and **system voltage** (12/24/48V presets).
2. Set the **current state of charge** (%).
3. Set the **load** — how much the connected device is drawing.
4. Set the **solar array rating** and **sun conditions** (0–100%, standing in for
   clouds/time of day).
5. Toggle the **charge controller type** — MPPT vs. PWM — and watch the efficiency
   difference change the actual solar output.
6. Read the **battery bar** (color-coded by charge level), the **solar output / net power
   flow** stat cards, and the **status banner** — which reports time to full, time to
   empty, or a safety warning if the C-rate exceeds a safe continuous limit.

## Big ideas (for cross-module connection-finding — not ledger tags)
- **Storing something now to use later always has a rate limit.** Filling or draining a
  container too fast breaks it, whichever container it is — a battery, a bathtub, a body
  absorbing nutrients, a bank account with withdrawal limits.
- **Rated capacity and real-world output are two different numbers**, and the gap between
  them is usually where the interesting engineering lives.

## Technical concept tags (ledger-facing, normalized)
`["wh-capacity","c-rate","charge-controller-efficiency"]`

## Subjects
`["physics","engineering"]`

## Note
This module directly mirrors a real home DC microgrid setup — a strong real-world hook
for a learner who has (or knows someone with) an actual off-grid or backup power system.
