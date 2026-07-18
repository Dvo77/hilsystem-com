## HIL Label Studio

**File:** hil-label-studio.html
**URL:** hilsystem.com/tools/hil-label-studio.html
**Status:** Live (core label/sign generation) · Beta (live-data dropdowns added July 17, 2026, not yet verified against real data)

**Purpose:** Generates print-ready physical labels and wall signs for every
part of the HL addressing system — zones, shelf/bin systems, electrical
ports, and full compass-oriented room signs — so a physical space can be
addressed and labeled without needing the app, an account, or an internet
connection.

**Core Features:**
- Three label types, one shared address-preview + output flow:
  - **Zone labels** — Structure + Zone + Wall, with description/kits/notes
  - **Shelf/Bin labels** — System + Unit/ID + Color-coded category + Row/Column,
    for WOS wall bins, MOS drawer cases, and any other vessel system
  - **Electrical labels** — Zone + Wall + Position, Port Type (Electrical /
    Keystone-Data / Power Strip), Sub-port (top/bottom), circuit/breaker,
    "runs to" destination, VLAN/network tag
- **Structure and Zone are now real dropdowns** (when signed in) pulled from
  this user's actual `properties` and `properties/{id}/zones` — no more
  guessing or retyping a structure/zone code from memory. A "+ Custom / not
  listed…" option always falls back to free typing for anything not
  registered yet.
- **Shelf/Bin System dropdown lists real Vessel Types** (built in Vessel
  Builder) above the fixed WOS/MOS/OGD/MX presets — pick a real type (e.g.
  Max Flow Bench) and the Unit/ID field autocompletes from that type's
  actual vessel instances, while still allowing a typed entry for anything
  new
- QR code payload can be the HIL address itself or a linked wiki URL, or
  omitted entirely
- Output as a styled visual label, raw text formatted for RawBT/thermal
  label printers, or both at once — "Copy for RawBT" button on raw output
- **Sign Studio tab** — full room/compass signs, separate from the small
  address labels above: 8 visual themes (Art Deco, Vintage Tin, Industrial,
  Workshop/Chalk, Farmhouse, Kids Room, Space Explorer, Blueprint), a
  compass-rose wall-orientation picker (N/S/E/W/Center), zone name +
  tagline + HIL address fields, and the same QR options as labels
- **Starter Pack tab** — a no-login, no-app onboarding path: 5 printable
  pages (Cardinal Anchor signs, Zone signs, and more) that let someone
  address an entire space with scissors and tape before ever touching the
  digital platform

**How it connects:**
- Reads from (when signed in): `users/{uid}/properties`,
  `users/{uid}/properties/{propertyId}/zones`, `users/{uid}/vessel_types`,
  `users/{uid}/vessels`
- Writes to: nothing — this is a generator/output tool only, it never
  writes to Firestore
- Entry points: Labels & Signs nav item; no cross-tool deep links into it
  yet (nothing hands this tool a pre-filled address from elsewhere)
- Cross-tool data flow: Vessel Types and Vessel instances created in
  Vessel Builder show up automatically in the Shelf/Bin System dropdown and
  Unit/ID autocomplete here — no separate entry needed. Same for
  Structures/Zones set up via Room Code Builder / Room Visualizer.
- Works fully logged-out or before any properties/zones/vessel types exist
  — every live-data field degrades to its Custom/free-text fallback in
  that case. This is by design: labels can be generated and printed with
  zero account, zero internet, matching the Starter Pack's own "no app
  required" philosophy.

**Known limitations / not yet live:**
- The July 17, 2026 live-data dropdowns (Structure/Zone/System/Unit) have
  not yet been tested against real deployed data — built and syntax-checked
  this session, not click-tested end to end
- If a user has multiple properties, Structure and Zone options are pooled
  across all of them rather than scoped to one property at a time — fine
  for a single-property household, could get noisy with several
- Row/Column fields on Shelf/Bin labels are still always free-typed — there's
  no registry of "known" WOS rows/columns to draw from, only vessel
  Unit/IDs are backed by real data
- Sign Studio and Starter Pack have no live-data hookup at all — every
  field on those two tabs is still manually typed, same as before this
  session
- No way to save or recall a previously generated label/sign — each session
  starts blank; "PRINT / SAVE" relies on the browser's own print/screenshot

**Common questions this tool answers:**
- "How do I make a label for my new zone?" → Zone tab: pick Structure and
  Zone from the dropdown (or type a custom code if it's not set up yet),
  pick a wall, generate.
- "Can I print a label for my Max Flow Bench without typing MFB-01 by hand?"
  → Yes — Shelf/Bin tab, pick your vessel type from "Your Vessel Types" in
  the System dropdown, then Unit/ID autocompletes with your real vessel IDs.
- "Do I need to be logged in to make labels?" → No — every field works
  free-typed with no account. Signing in just adds real dropdown data on
  top, it's never required.
- "What's the difference between a label and a sign?" → Labels (Zone/Shelf/
  Electrical tab) are small address stickers. Signs (Sign Studio tab) are
  full decorative room signs with a compass rose and a choice of 8 visual
  themes — meant for a wall, not a bin.
- "How do I print labels for a thermal label printer?" → Choose Raw Text
  (or Both) as the output format, then use the "Copy for RawBT / Thermal
  Printer" button on the generated output.
- "I don't have any zones set up yet — can I still label my shop today?" →
  Yes, use the Starter Pack tab — 5 pre-built printable pages get an entire
  space addressed with scissors and tape, no setup required first.

---
*README generated July 17, 2026, following the HIL Tool Documentation Schema.*
