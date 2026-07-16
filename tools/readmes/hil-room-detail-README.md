## Room Detail

**File:** hil-room-detail.html
**URL:** hilsystem.com/tools/hil-room-detail.html?property={propertyId}&zone={zoneCode}
**Status:** Live (Full Container Item commit path pending backend work)

**Purpose:** Place furniture, shelves, and containers inside a room drawn in Room Visualizer, nest containers inside containers (Russian-doll style — nightstand → drawer → valet), and see each item's real HL address computed automatically as it's positioned.

**Core Features:**
- Renders the room's actual drawn polygon shape (not a bounding box) as the placement backdrop, cropped and scaled to fit
- Two container types when placing something: **Quick Shelf** (writes a lightweight `vessels` record instantly, fill-level tracking only) or **Full Container Item** (queued to `staged_items`, becomes a real `item_records` entry once backend commit support exists — shows as a dimmed "pending" icon until then)
- Vessel-to-vessel nesting — any vessel can hold other vessels (a nightstand can contain a drawer, which can contain a valet), toggled per-vessel via "Nested contents." Nested vessels have no canvas icon of their own — they live entirely inside their parent's Contents drill-down, matching how a real drawer isn't a separate piece of furniture in the room
- Contents drill-down — breadcrumb-based navigation into a container's contents, add items (queued to staging) or nested vessels (instant), recursively
- Kit-linking at Quick Shelf creation — link to an existing Kit or create a new one inline; both sides of the link (`vessel.kit_id` ↔ `kit.vessel_id`) are kept in sync so the Capability Analyzer's "where is my kit" lookup stays accurate regardless of which tool created the vessel
- Pending items are clickable — "Add Details" opens a form for name/category/notes/photo, using the same fixed R2 upload pattern as Vault/Museum, so a pending item has real substance by the time it can be committed
- Nine placeholder SVG icons (chair, table, bed, dresser, shelf, box, bag, cart, generic), auto-selected by vessel type, overridable — plus 8-color rings so two of the same furniture type stay visually distinct
- Auto-addressing — every placed container computes and displays its real HL address (`[STRUCT]-[ZONE]-[ANCHOR][COL]-[LEVEL][DEPTH]`) live, based on nearest wall and position among wall-mates; recomputes on every drag
- Read-only door/window/opening markers from Room Visualizer's structure-level `openings`, shown for spatial context while placing furniture

**How it connects:**
- Reads from: `zones/{zoneCode}` (room shape, struct_code), `properties/{propertyId}` (struct_scale for real-world dimensions), `vessels`, `staged_items`, `item_records` (committed containers), `kits`, `properties/{propertyId}/openings`
- Writes to: `vessels/{vesselId}` (frontend-writable, full CRUD), `staged_items` (frontend-writable, full CRUD), `kits/{kitId}` (frontend-writable), `item_records.room_position` only (the one narrow doctrine exception — everything else on a committed item stays backend-only)
- Entry points: "→ Open Room" button in Room Visualizer's room edit panel
- Cross-tool data flows: address computation writes `hl_address` back to `vessels`/`staged_items` automatically — no separate addressing step needed in Address Hub for anything placed here

**Known limitations / not yet live:**
- Full Container Item creation and any nested item added via "Add to Contents → Item" stays pending indefinitely until `hil-admin-action`'s commit-staged endpoint is extended to read `containment`/`room_position`/`zone_code` off a staged doc — this is real backend work, not yet built
- Kit-linking is only available for top-level vessels placed directly in the room, not nested child vessels (drawer/valet level)
- Committed `item_records` containers can have their position dragged (the approved `room_position` exception) but nothing else about them is editable from this tool
- Icon art is placeholder line-work, not final visual design

**Common questions this tool answers:**
- "Where's my phone charger?" → If it was placed and addressed here, its computed HL address shows in the room list and its own detail panel — tap the nightstand, open Contents, there it is.
- "I have a jewelry box inside a dresser drawer, can the system track that?" → Yes — vessels can nest inside vessels at any depth, toggle "Nested contents" on the drawer and add the jewelry box as a child vessel.
- "Can I take a picture of something before it's fully in the Vault?" → Yes — pending items support photo + notes right where you placed them, no separate trip to Vault required.
- "Why does this item still say pending?" → Full Container Items need a backend piece that isn't built yet to become real inventory — this is expected, not a bug.
- "Does the system know my nightstand is against the west wall?" → Yes — every placed item's address is computed from its actual position relative to the room's walls, live, as you drag it.
