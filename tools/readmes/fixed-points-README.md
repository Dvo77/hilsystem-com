## Fixed Points — Electrical

**File:** hil-fixed-points.html
**URL:** hilsystem.com/tools/hil-fixed-points.html (linked from Smart Home hub)
**Status:** Live. Firestore rule for `fixed_points` published and confirmed working. Functional end-to-end — Dan-confirmed as of this pass. UX is a known rough edge (see Known limitations); still on the SVG-based rendering approach, which is fine for now but not the final word on interaction polish.

**Purpose:** Maps the electrical infrastructure of a home — outlets, switches, GFCIs, data/keystone jacks, light fixtures, breaker panels, and network racks — as an overlay on the same floor plan built in Room Visualizer. Answers "what breaker feeds this?", "what else is on this circuit?", and "what's this port on the rack wired to?" without opening the panel.

**Core Features:**
- Place electrical points directly on a room's floor plan (reuses Room Visualizer's drawn polygon, wall detection, and compass)
- 9 object types: Outlet, Switch, GFCI, Data/Keystone, Breaker Panel, Light Fixture, Chandelier, Wall Sconce, Rack/Patch Panel
- Address auto-computed from wall position using canonical HL Grammar v1.0 (`[STRUCT]-[ZONE]-[ANCHOR][COL]-[LEVEL][DEPTH]`) — no manual address entry
- **Persistent room sidebar** — every room on the property listed and always visible; click to switch rooms instantly, no page reload. Jumping to a related point in another room (via "also on this circuit" or "Controls") switches in place too.
- **Legend** — a Legend button opens a modal listing all 9 type codes (OT, SW, GFCI, KS, PL, LT, CH, SC, RK) with color and label, pulled straight from the type definitions
- Breaker Panel objects hold a visual breaker grid (columns 1/2/center, rows A=bottom to H=top, tandem `-T`, double-pole `-2P` suffixes) matching the HIL Breaker Address Schema
- **Rack/Patch Panel objects** hold the same style of grid, reused directly from the breaker panel pattern — configurable height in RU (rack units, bottom-up, matching the same position rule as everything else in HIL), each port carrying a port type (RJ45/USB/HDMI/Power/etc.), label, and "terminates at" free-text field. Address format: `{rack_code}-RU{n}-{col}`. Reuse a Breaker Panel object for network/server-rack circuit tracking where relevant — same underlying mechanism.
- Outlets, switches, GFCIs, and light fixtures link to a specific panel + breaker slot — this computes the real circuit address (e.g. `EL-UZ-S2-1H`) instead of a typed-in guess
- "Also on this circuit" — clicking a point shows every other point wired to the same breaker, across rooms, with a jump-to-room link (in-place, no reload)
- Light fixtures link to the switch that controls them (`controlled_by`); switches show a reverse "Controls" list of every fixture they operate
- Duplex outlets/GFCIs carry separate HA entity slots for top and bottom receptacle
- Notes field on every point — free text for anything worth remembering about that outlet/switch/device
- **Openings (doors/windows) are now click-to-edit/delete directly on this page** — no need to leave for Room Visualizer just to fix a door. Click a door or window on the canvas, adjust width (presets or custom) or delete it.
- Drag-to-reposition, with address recomputing live
- Filter chips to isolate one object type at a time on crowded rooms

**How it connects:**
- Reads from: `properties/{propertyId}/zones/{zoneCode}` (room polygon, wall/opening data, struct scale) — same source Room Visualizer and Room Detail draw from
- Reads openings from: `properties/{propertyId}/openings/{openingId}` (structure-level, shared across rooms since a wall can border two zones) — **this was previously reading a dead `zone.openings` field that Room Visualizer never actually wrote to, so doors/windows likely never rendered correctly before this pass. Fixed.**
- Also reads/subscribes to: `properties/{propertyId}/zones` (full collection, for the room sidebar)
- Writes to: `users/{uid}/properties/{propertyId}/fixed_points/{pointId}` — frontend-writable directly, same doctrine as `museum_items`/`exchange_listings` (documentation layer, not inventory truth, so it does not go through hil-admin-action). Firestore rule confirmed live.
- Writes opening edits/deletes to: `properties/{propertyId}/openings/{openingId}` — same collection Room Visualizer uses, so edits made here show up there too
- Entry points: Smart Home hub card ("Fixed Points"); no zone in the URL falls back to a property/room picker rather than assuming context
- Cross-tool data flows: `ha_entity` and `installed_item_id` fields are designed for the Home Assistant Bridge to read; `installed_item_id` optionally references an `item_records` document for a smart device physically installed at that point (e.g. a smart outlet) — this is separate from `panel_ref`/`breaker_id`, which is the circuit-wiring link, not a device link

**Known limitations / not yet live:**
- General interaction polish — functional and correct, but acknowledged as a bit clunky (SVG-based click/drag interactions). Works, not refined. Worth a dedicated UX pass later rather than folding into feature work.
- `hil-shell.js` NAV_TOOLS entry not yet confirmed added
- Circuit and `controlled_by` links are reference-only, not validated — nothing prevents linking an outlet to a breaker in an unrelated structure, or a light to a switch several rooms away
- Plumbing, HVAC, network, and security overlay layers are not built as their own tabs yet — Fixed Points currently covers electrical (with the Rack type extending into network/data), though the same UI pattern (tabs per layer) is the intended direction. Note: a full locked HVAC Position & Path Standard v1.0 already exists as a spec — worth building against directly when that layer gets picked up, not re-deriving.
- No real electrical symbol library yet — object types use simple placeholder shapes, not standard schematic symbols
- Breaker grid does not visually block double-occupancy for double-pole breakers spanning two rows — it's tracked as a flag/label, not enforced on the grid
- Rack ports are capped at 3 columns per RU level (same limit as the breaker grid) — fine for patch panels, won't cleanly fit a 24-port switch spanning 1U without spreading it across multiple point entries
- Openings have no notes/description field — width edit and delete only. Known gap, low priority (Dan: "I can live without it")

**Common questions this tool answers:**
- "What breaker is this outlet on?" → Click the outlet — its linked panel and breaker slot show the computed circuit address directly.
- "What else will go dark if I flip this breaker?" → Click any point on that circuit, check "Also on this circuit" for everything else wired to the same breaker.
- "Which switch controls this light?" → Click the fixture — "Controlled By" shows the linked switch; click the switch to see everything it controls.
- "Can I place things without knowing the exact address?" → Yes — tap a spot on the room's floor plan and the address computes automatically from wall position.
- "Does this replace my breaker panel labels?" → No — it documents what you already have; it doesn't control or reconfigure anything electrical.
- "How do I check another room without losing my place?" → Use the room sidebar — every room on the property is listed, click to switch instantly.
- "What do the type codes (OT, SW, GFCI...) mean?" → Click the Legend button for the full key.
- "Can I fix a door or window from here?" → Yes — click it directly on the canvas to edit width or delete it, no need to open Room Visualizer.
- "Can I track a server rack or patch panel the same way as an electrical panel?" → Yes — the Rack/Patch Panel type reuses the exact same breaker-grid mechanism, addressed by RU (rack unit) instead of breaker row.

---

## Changelog
*(append one line per session — never edit or remove past entries)*

- **July 31, 2026** — Firestore rule for `fixed_points` written and published (was entirely uncovered before this — zero read/write access existed). Added persistent room sidebar (replaces reload-based room switching). Added Legend modal. Fixed a real bug where openings were read from a dead `zone.openings` field instead of the live `properties/{id}/openings` collection — doors/windows likely never rendered correctly before this fix. Added click-to-edit/delete for openings directly on this page. Added Rack/Patch Panel as a 9th object type, reusing the breaker-panel grid mechanism, addressed by RU per the existing HIL Position Standard (confirmed already covers rack units — not new scope, same grammar applied to a new object). Dan confirmed all of the above working end-to-end; noted general UX as "a bit clunky" but functional — flagged as a future polish pass, not blocking.
