# Panel & Phase Lab — README

**Module ID:** `panel-phase-lab`
**Sits next to:** `panel-phase-lab.html`

## What this is
A tool that separates three commonly-confused electrical concepts: split-phase 120/240V
residential power, genuine three-phase power (WYE and Delta), and grounding vs. neutral —
with a tap-two-points-to-measure interaction and real animated waveform visuals for each.

## What we want a learner to walk away knowing
- **Split-phase 120/240V is one AC phase, split by a center-tapped transformer** — not two
  phases added together. L1 and L2 are mirror images of the same waveform, which is why
  L1-to-L2 gives double the voltage instead of "two phases combining."
- **Three-phase is genuinely different** — three separate waveforms 120° apart, which is
  *why* an AC induction motor can self-start without a capacitor (three coils spaced 120°
  apart naturally create a rotating magnetic field on their own).
- The real math behind WYE (phase-to-phase = √3 × phase-to-neutral) and Delta (every leg
  pair reads the same voltage) configurations.
- The **high-leg delta danger** — in a center-tapped 240V delta system, the "wild leg"
  measures roughly 208V to neutral, not 120V, which is exactly why code requires that
  conductor marked (commonly orange).
- **Grounding is a separate question from phase count entirely** — neutral carries current
  normally and bonds to ground at exactly one point (the main panel); ground carries
  nothing until something's wrong, then gives fault current a fast path home.

## How to use it, completely
1. Pick a **mode**: Split-Phase (house), 3-Phase WYE, or 3-Phase Delta.
2. Watch the **animated waveform panel** — split-phase shows two mirror-image sine waves
   (180° apart); WYE and Delta show three waves genuinely 120° apart.
3. Adjust the relevant **voltage slider** for that mode.
4. **Tap two points** on the circuit diagram (L1/N/L2, or A/B/C/N) to measure the voltage
   between them — the readout explains *why* that number came out the way it did, not just
   what it is.
5. In Delta mode, toggle **High-Leg Delta** to add the center-tapped neutral point and tap
   the wild leg (C-N) to see the ~208V warning in context.
6. Read the **Grounding vs. Neutral** panel at the bottom — deliberately not tied to the
   mode switch, since it's a separate axis from everything above it.

## Big ideas (for cross-module connection-finding — not ledger tags)
- **AC voltage is a wave, and phase is just a timing offset between waves.** This is the
  same underlying math as sound: two guitar strings slightly out of tune produce an
  audible "beat" from their frequencies drifting in and out of phase with each other.
  Stereo speakers wired out of phase cancel bass instead of reinforcing it. Ocean waves
  interfere constructively or destructively depending on their timing offset. **Electricity
  is vibration, the same way a guitar string or a sound wave is vibration — different
  medium, identical wave math.** This is the strongest cross-domain link in the entire
  Electric Forge set — genuinely worth surfacing whenever a learner is in a music, sound,
  or wave-physics module and this one shares a tag.
- **Naming conventions exist to prevent real, dangerous assumptions** — the orange-taped
  wild leg is the same instinct as any hazard label: someone already made this mistake
  once, so the system was changed to stop the next person from making it blind.

## Technical concept tags (ledger-facing, normalized)
`["split-phase-power","three-phase-power","neutral-vs-ground"]`

## Subjects
`["physics","engineering"]`

## Cross-referral flag
Explicitly check this module's `bigIdeas` against any future Guild Music School / sound /
wave-physics module's `bigIdeas` — "vibration," "phase," "interference," and "timing
offset between repeating cycles" should all match. This is the concrete case the
guitar-and-electricity connection idea was built around.
