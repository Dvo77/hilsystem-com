# Wire Lab — README

**Module ID:** `wire-lab`
**Sits next to:** `wire-lab.html`

## What this is
An interactive tool for sizing a wire safely — given a voltage, current (or watts), wire
gauge, run length, and material (copper/aluminum), it tells you whether that wire will run
safely, marginally, or dangerously hot, with a live formula breakdown and a full gauge
comparison table.

## What we want a learner to walk away knowing
- Ohm's Law (V = I × R) isn't abstract — it's the exact math behind "why does this wire
  get hot."
- **Current, not voltage, is what drives overheating risk.** This is the single most common
  wrong intuition adults carry into this topic.
- Every wire gauge has a real, finite current-carrying capacity (ampacity) — it's not a
  vague safety margin, it's a specific number you can look up or calculate toward.
- Longer wire runs lose more voltage along the way (voltage drop), which is a separate
  problem from overheating and needs its own check.

## How to use it, completely
1. Set the **voltage** (slider or presets: 12/24/48/120/240V — covers both low-voltage DC
   systems and standard household AC).
2. Toggle **Set Amps** or **Set Watts** — pick whichever you actually know, the other is
   computed live via P = V × I.
3. Pick a **wire gauge** from the dropdown (#18 up to 4/0 AWG).
4. Set the **run length** (one-way feet — the tool doubles it automatically for the return
   conductor) and choose **copper or aluminum**.
5. Watch the live readout: total watts, wire resistance, voltage drop (volts and %), and a
   SAFE / CAUTION / OVERLOADED banner.
6. Patch and Scratch react in character to the load state — Scratch visibly distressed and
   glowing red at overload, Patch staying calm and narrating the "controlled vs. uncontrolled
   current" distinction.
7. Scroll to the **gauge comparison table** to see how every other wire size would have
   handled the exact same voltage/amps/length — this is the real teaching moment, seeing
   where #18 fails and where #10 becomes safe, side by side.

## Big ideas (for cross-module connection-finding — not ledger tags)
- **Flow under constraint.** Any system where something moves through a limited channel
  runs into this same problem: too much flow, too narrow a channel, heat/pressure/backup
  builds up. Water through pipes, traffic through a road, blood through a vessel, even
  attention through a limited span — same shape of problem, different medium.
- **Safety margins are calculable, not vibes.** The whole tool exists to replace "that
  seems like enough wire" with an actual number you can defend.

## Technical concept tags (ledger-facing, normalized)
`["ohms-law","voltage-drop","ampacity","wire-gauge"]`

## Subjects
`["physics","engineering"]`
