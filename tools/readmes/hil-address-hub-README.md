## Address Hub

**File:** hil-address-hub.html
**URL:** hilsystem.com/tools/hil-address-hub.html
**Status:** Live

**Purpose:** Fast, dense text-entry for assigning full HL addresses one at a time — built for spots where drawing in Room Visualizer would be the wrong tool: fastener bins, drawers, pegboard walls, anywhere with dozens of near-identical slots to address quickly by keyboard rather than by mouse-drag.

**Core Features:**
- Full canonical address builder — `[STRUCT]-[ZONE]-[ANCHOR][COL]-[LEVEL][DEPTH]`, matching `HL-System-Grammar-v1.0.md` exactly (ANCHOR+COL fused as one segment, LEVEL as a letter A–T bottom-up, DEPTH digit for nesting)
- Live address preview with per-segment breakdown, copy-to-clipboard
- Structure and zone pickers read live from Firestore — the same `zones`/`struct_codes` data Room Visualizer and Room Code Generator write to. No hardcoded property-specific data; if nothing exists yet, it says so and links to those tools instead of guessing
- Home Assistant export block — YAML snippet + entity ID, updates live as the address is built
- Item/location descriptor fields (name, notes) alongside the address itself
- Save to Vault — queues a fully-addressed entry to `staged_items`

**How it connects:**
- Reads from: `users/{uid}/properties/{propertyId}` (struct_codes), `zones/{zoneCode}` subcollection (filtered by active structure)
- Writes to: `staged_items` (`owner_uid`, `status: 'pending_review'` — matches Room Visualizer's shape, not a separate convention)
- Entry points: Quick Links panel on Room Visualizer and vice versa; standalone tool link
- Cross-tool data flows: does not create zones itself — depends on Room Code Generator or Room Visualizer having created them first. Everything staged here feeds the same eventual commit pipeline as Room Detail's pending items.

**Known limitations / not yet live:**
- One address at a time — no batch/bulk entry mode yet (relevant for something like a 99-bin fastener cabinet, still one-by-one for now)
- Rebuilt from an earlier version that used an outdated 5-segment address format and hardcoded property-specific zone data — if anything references the old `hil-hub.html` grammar (STRUCT-ZONE-WALL-POS-LEVEL, numeric level), that's stale and superseded by this tool
- Like everything touching `staged_items`, entries made here stay pending until the `hil-admin-action` commit-staged pipeline is extended

**Common questions this tool answers:**
- "I have 99 bins to address in my fastener cabinet, do I really have to draw each one?" → No — this is exactly the tool for that. Pick the zone once, then rip through ANCHOR-COL-LEVEL-DEPTH combos by keyboard.
- "What's the actual format for an HL address?" → `STRUCT-ZONE-ANCHORCOL-LEVELDEPTH`, e.g. `SH-MM-S3-A1` — the Grammar Reference panel on this page shows it live.
- "Can I address something without drawing the room first?" → The zone still needs to exist (named in Room Code Generator or Room Visualizer) — this tool doesn't create rooms, just addresses within them.
- "How do I get this address into Home Assistant?" → The HA Export panel generates the YAML and entity ID automatically as you build the address.
