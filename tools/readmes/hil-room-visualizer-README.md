## Room Visualizer

**File:** hil-room-visualizer.html
**URL:** hilsystem.com/tools/hil-room-visualizer.html
**Status:** Live

**Purpose:** Draw a property's floor plan room by room — click to trace each shape, name it, and it becomes a real HL zone. Replaces typing HL zone addresses by hand with visual placement.

**Core Features:**
- Freeform polygon room drawing — click to place corners, click near the start (or press Close Shape) to finish, light grid snap for clean edges
- Quick Rectangle tool — type a width and depth in feet instead of hand-clicking four corners
- Drag-to-reshape — select any drawn room, drag any corner to adjust it after the fact
- Per-structure scale ("1 square = __ ft"), set independently for each structure (shop vs. house can differ) — shows approximate room dimensions live while drawing
- Structure tabs (HM/GR/SH/etc.) — each structure gets its own canvas view and its own scale
- Doors, windows, and plain openings (archways/open-concept gaps) — click near any wall in the active structure and it snaps to the nearest edge, sized by real width (28"/30"/32"/36" door presets, 24"/30"/36"/48" window presets, custom width for anything). These are structure-level, not owned by any single room — a door on a shared wall between two rooms is one object, editable from either side, not duplicated
- "Fit All Rooms" — auto-sizes the visible canvas to whatever's actually drawn, so large properties aren't stuck showing one corner
- "Assign Shape to Existing Zone" — if a room was already named/coded in Room Code Generator but has no shape yet, finishing a new drawn shape offers to attach it to that existing zone instead of always force-creating a new one
- Compass reference on the connected Room Detail canvas (not this file directly) — assumes screen-up = North, matching how the floor plan is drawn

**How it connects:**
- Reads from: `users/{uid}/properties/{propertyId}` (single property per user, auto-created on first use), `zones/{zoneCode}` subcollection
- Writes to: `zones/{zoneCode}` (polygon, code, label, color, canonical_type, struct_code — frontend-writable, not inventory truth), `properties/{propertyId}/openings/{openingId}` (structure-level door/window/opening markers), `properties/{propertyId}` (struct_codes, floorplan.struct_scale)
- Entry points: Smart Home tool card ("Room Visualizer"), or direct URL
- Cross-tool data flows: shares the same `zones` collection with Room Code Generator (bulk text-based zone naming) — either tool can create a zone, the other can finish it. Zone selection links directly into Room Detail (`hil-room-detail.html?property={id}&zone={code}`) for placing vessels/items inside a drawn room.

**Known limitations / not yet live:**
- Firestore rules coverage for `properties/zones` and the new `openings` subcollection should be reconfirmed against live rules — this was an open item throughout the build and is the most likely cause if a save silently fails
- Base canvas is 3000×2000 grid units — comfortably covers a large single house but hasn't been stress-tested against multi-acre properties with many outbuildings at once
- No manual pan/zoom controls — "Fit All Rooms" (auto-fit to content) is the only navigation aid right now
- Doors/windows placed before the structure-level rework (in the old per-zone storage model) are orphaned and won't appear — need to be re-placed
- Room deletion doesn't cascade — deleting a zone doesn't move or warn about items already addressed to it

**Common questions this tool answers:**
- "How do I set up the rooms in my house?" → Draw each room's shape by clicking its corners, name it, and it's saved as a real zone — no manual address typing.
- "I already typed out my room names in Room Code Generator, do I have to redraw everything?" → No — draw a shape and it'll offer to attach to an already-named room instead of creating a new one.
- "Two rooms share a doorway, do I have to add the door twice?" → No — doors/windows belong to the structure, not one room, so placing it once covers both sides.
- "My house is too big, I can't see all of it." → Use "Fit All Rooms" to zoom out to everything drawn so far in that structure.
- "How wide is my front door in the system?" → Doors store a real width in inches (28"–36" presets or custom) — click an existing door to see or change it.
