## Fixed Points — Electrical

**File:** hil-fixed-points.html
**URL:** hilsystem.com/tools/hil-fixed-points.html (linked from Smart Home hub)
**Status:** Beta — built and functional, not yet deployed. Firestore rule for `fixed_points` is drafted but not confirmed live; nothing writes until that rule is deployed and verified.

**Purpose:** Maps the electrical infrastructure of a home — outlets, switches, GFCIs, data/keystone jacks, light fixtures, and breaker panels — as an overlay on the same floor plan built in Room Visualizer. Answers "what breaker feeds this?" and "what else is on this circuit?" without opening the panel.

**Core Features:**
- Place electrical points directly on a room's floor plan (reuses Room Visualizer's drawn polygon, wall detection, and compass)
- 8 object types: Outlet, Switch, GFCI, Data/Keystone, Breaker Panel, Light Fixture, Chandelier, Wall Sconce
- Address auto-computed from wall position using canonical HL Grammar v1.0 (`[STRUCT]-[ZONE]-[ANCHOR][COL]-[LEVEL][DEPTH]`) — no manual address entry
- Breaker Panel objects hold a visual breaker grid (columns 1/2/center, rows A=bottom to H=top, tandem `-T`, double-pole `-2P` suffixes) matching the HIL Breaker Address Schema
- Outlets, switches, GFCIs, and light fixtures link to a specific panel + breaker slot — this computes the real circuit address (e.g. `EL-UZ-S2-1H`) instead of a typed-in guess
- "Also on this circuit" — clicking a point shows every other point wired to the same breaker, across rooms, with a jump-to-room link
- Light fixtures link to the switch that controls them (`controlled_by`); switches show a reverse "Controls" list of every fixture they operate
- Duplex outlets/GFCIs carry separate HA entity slots for top and bottom receptacle
- Drag-to-reposition, with address recomputing live
- Filter chips to isolate one object type at a time on crowded rooms

**How it connects:**
- Reads from: `properties/{propertyId}/zones/{zoneCode}` (room polygon, wall/opening data, struct scale) — same source Room Visualizer and Room Detail draw from
- Writes to: `users/{uid}/properties/{propertyId}/fixed_points/{pointId}` — frontend-writable directly, same doctrine as `museum_items`/`exchange_listings` (documentation layer, not inventory truth, so it does not go through hil-admin-action)
- Entry points: Smart Home hub card ("Fixed Points"); no zone in the URL falls back to a property/room picker rather than assuming context
- Cross-tool data flows: `ha_entity` and `installed_item_id` fields are designed for the Home Assistant Bridge to read; `installed_item_id` optionally references an `item_records` document for a smart device physically installed at that point (e.g. a smart outlet) — this is separate from `panel_ref`/`breaker_id`, which is the circuit-wiring link, not a device link

**Known limitations / not yet live:**
- Firestore rule for the `fixed_points` collection is written but not yet deployed — the tool will fail to save until this is confirmed live
- `hil-shell.js` NAV_TOOLS entry not yet added
- Circuit and `controlled_by` links are reference-only, not validated — nothing prevents linking an outlet to a breaker in an unrelated structure, or a light to a switch several rooms away
- Plumbing, HVAC, network, and security overlay layers are not built — Fixed Points currently covers electrical only, though the same UI pattern (tabs per layer) is the intended direction
- No real electrical symbol library yet — object types use simple placeholder shapes, not standard schematic symbols
- Breaker grid does not visually block double-occupancy for double-pole breakers spanning two rows — it's tracked as a flag/label, not enforced on the grid

**Common questions this tool answers:**
- "What breaker is this outlet on?" → Click the outlet — its linked panel and breaker slot show the computed circuit address directly.
- "What else will go dark if I flip this breaker?" → Click any point on that circuit, check "Also on this circuit" for everything else wired to the same breaker.
- "Which switch controls this light?" → Click the fixture — "Controlled By" shows the linked switch; click the switch to see everything it controls.
- "Can I place things without knowing the exact address?" → Yes — tap a spot on the room's floor plan and the address computes automatically from wall position.
- "Does this replace my breaker panel labels?" → No — it documents what you already have; it doesn't control or reconfigure anything electrical.
