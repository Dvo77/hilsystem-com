## HL System Grammar (Core Doctrine — Not a Tool Page)

**File:** N/A — this is the platform's core addressing spec, not a live tool. No URL to send a user to.
**Status:** Canonical, locked

**Purpose:** This is the actual rulebook for how every physical location and item in the HIL System gets its address. PATCH should treat this as ground truth whenever a user asks "how do addresses work," "what does this code mean," or asks for help building/reading an HL address.

---

# HL — Human Layer System Grammar v1.2

*A spatial grammar for making any physical environment machine-readable and human-navigable.*

## Purpose

**"I just want to know where my shit is."**

That's it. That's the whole problem this solves.

HL is not an app. It is not a platform. It is a grammar — a set of rules for assigning addresses to physical spaces and the things inside them. Once you speak the grammar, any human, any AI, any scanner, any automation system can understand your space without a manual, without onboarding, and without a proprietary database.

If you know a street address, you already understand HL.

## Core Philosophy

**Human-first. AI-assisted. Recoverability over perfection.**

The system must work when the power is out, when the app doesn't load, when you hand a printed card to a first responder. A photo, a printed label, and a working brain are the minimum viable tools. Everything digital is an enhancement, not a dependency.

Three principles that never bend:

1. **The physical label is the source of truth.** If the database disagrees with the label on the wall, the label wins until a human decides otherwise.
2. **Friction is the enemy.** Any rule that makes the system harder to use than no system is a bad rule.
3. **You can only drop from the left.** Shortening is allowed. Skipping the middle is not.

## The Address Format

Every location in your environment gets one address. The format is:

```
[STRUCT]-[ZONE]-[ANCHOR][COL]-[LEVEL][DEPTH]
```

That's it. Six segments. Read left to right, broad to specific.

### Segment Reference

| Segment | What It Means | Example | Rule |
|---|---|---|---|
| **STRUCT** | The building or structure | `SH` = Shop, `BM` = Basement, `GR` = Garage | 2 letters |
| **ZONE** | The room or sub-area | `MM` = MaxOMess, `OF` = Office, `KTC` = Kitchen Closet | 2–3 letters |
| **ANCHOR** | Which wall or reference point | `N` `S` `E` `W` `M` `F` `C` | 1 letter |
| **COL** | Column number, left to right | `1` = far left, counts right | 1–9 |
| **LEVEL** | Which tier/row — see LEVEL + DEPTH below | `A` = bottom or front, counts up/back | A–T |
| **DEPTH** | Position across that tier — see LEVEL + DEPTH below | `0` = lone item, `1–9` = position left→right | 0–9 |

### Anchor Key

| Code | Meaning |
|---|---|
| `N` `S` `E` `W` | Cardinal wall directions |
| `M` | Movable cart or bench |
| `F` | Floor zone |
| `C` | Ceiling / overhead |

### Full Example

`SH-MM-S3-A1`

Decoded: Shop → MaxOMess zone → South wall → Column 3 → Bottom tier → Position 1 (leftmost item on that tier)

### Regex Validator

```
^([A-Z]{2})-([A-Z]{2,3})-([NSEWMFC][1-9])-([A-T])([0-9])$
```

## LEVEL + DEPTH (v1.2, locked Aug 24 2026)

`[LEVEL][DEPTH]` are always **two independent segments, both always present.** They are never collapsed into one overloaded character.

| Segment | Meaning | Counting |
|---|---|---|
| **LEVEL** (letter) | Which tier/row/drawer. On a vertical stack (shelves, drawers): bottom-up, `A` = first/bottom. On a flat surface with a front/back distinction (workbench top, cabinet top): `A` = front row, `B` = back row, continuing back. | Bottom→top, or front→back |
| **DEPTH** (digit) | Position **across** that tier, left to right. | Left→right: `1`, `2`, `3`... |
| **`0`** | Reserved. Means "no real array to place this in" — a single item sitting alone on its tier, not part of a left-to-right lineup. | — |

**Drawer stacks:** first (bottom) drawer = LEVEL `A`, second = `B`, third = `C`, fourth = `D`, etc. Once a drawer is opened, DEPTH addresses position across the front of that drawer (left-to-right), or `0` if there's just one thing in there. Dense drawers with lots of small parts graduate to a real slot/grid system (WOS-style) instead of guessing at DEPTH.

**Flat tops (workbench, cabinet top, no vertical shelf structure):** LEVEL becomes front-to-back row (`A` = front, `B` = back), DEPTH is left-to-right position within that row, `0` for a lone item with nothing beside it.

### Worked example

Workbench top at `BM-OF-E2`, cabinet-top surface:
- Cricut machine — sits toward the back, alone in that row → `BM-OF-E2-B0`
- Money/stapler — front row, one of a couple items → `BM-OF-E2-A1`

**Nesting (informal "behind something"):** not encoded in the address at all. If you need to track "it's behind the blue tote" as real, queryable data, that's the signal to promote the container to a real vessel with a containment/slot relationship instead of trying to squeeze it into an address character.

## Counting Rules (Immutable)

These never change regardless of how the space is oriented or what's in it.

- **Horizontal:** Left → Right. Column 1 is always the far left of the unit or wall.
- **Vertical:** Bottom → Top. Level A is always the lowest tier or, on flat surfaces, the frontmost row.
- **Depth:** Left → Right across a tier. See LEVEL + DEPTH above.
- **Mobile carts:** Position 1 is always the Northwest corner. Count clockwise.

**Why bottom-up?** Because you can always add a shelf on top and continue the alphabet. You cannot add a shelf at the bottom without renumbering everything above it.

## The Sub-Zone Rule

When a smaller space shares walls and access with a parent zone — a closet inside a bedroom, a pantry inside a kitchen — add `C` to the parent code.

| Space | Code | Logic |
|---|---|---|
| Back Bedroom | `BB` | Parent zone |
| Back Bedroom Closet | `BBC` | Same space, enclosed sub-section |
| Kitchen | `KT` | Parent zone |
| Kitchen Pantry | `KTC` | Sub-zone inside kitchen |

Use only for physically connected spaces. Independent rooms get their own 2-letter code.

**Fixed grid units are sub-zones, not vessels.** Not every row/column grid in the house is a vessel. Permanently sited units (built into a wall, or heavy furniture that isn't a routine-movement item) are addressed through the spatial grammar using this Sub-Zone Rule, not through the Vessel Registry. Test for fixed vs. mobile: not "can this physically be moved," but "is relocation a normal operational event that needs a live current-location system, or would it be a rare re-zoning event if it ever happened." Fixed units get sub-zone codes (e.g. `MM` + `W` → `MMW` for a Wall O' Sort unit inside Max O' Mess). Mobile grid containers (tool chests, portable cases, totes) are vessels.

## Code Shortening Rules

The full canonical address always lives in the database and the QR code payload. What gets printed on a physical label is a display address — and it can be shortened as long as you only drop from the left.

### Three Display Tiers

| Tier | Format | When To Use |
|---|---|---|
| **Full** | `SH-MM-S3-A1` | Cross-context labels, shared spaces, context cards |
| **Zone-Short** | `MM-S3-A1` | Inside a known structure, zone is obvious |
| **Position-Only** | `S3-A1` | Inside a known zone with a context card present |

**The one hard rule:** You can drop `STRUCT` or `STRUCT-ZONE` from the left. You cannot drop segments from the middle. `S3-A1` is valid. `SH-S3-1` is not.

The address format itself is the identifier. You do not need a prefix or logo mark to signal that an address is an HL address. The structure is unmistakable.

## The Three Identity Layers

Every physical item in the system has three pieces of identity that work together:

| Layer | Answers | Format | Example |
|---|---|---|---|
| **WHERE** | Location | HL address | `SH-MM-S3-A1` |
| **WHAT** | Container | Vessel ID | `MS-013`, `ST-027` |
| **NAME** | Item identity | Noun-First tag | `FASTENER-SCREW-WOOD-PHILLIPS` |

All three together = full traceability. Any one alone = partial traceability. The system works at whatever level of completeness you have — you don't need all three to start.

## Item Naming: The Noun-First Rule

Every item name starts with its root category noun. This is not optional. It is what makes the inventory searchable and AI-parsable without a thesaurus.

**Format:** `ROOT-TYPE-DETAIL-SPEC`

| Valid | Invalid |
|---|---|
| `FASTENER-SCREW-WOOD-PHILLIPS-2IN` | `Phillips Wood Screw 2 inch` |
| `TOOL-DRILL-BIT-1_4IN` | `1/4 inch drill bit` |
| `CONSUMABLE-TAPE-ELECTRICAL-BLACK` | `Black electrical tape` |

### The Five Root Nouns

These are the only five top-level categories. If an item does not map to one of them, the answer is not to add a sixth — it is to figure out which of the five it actually is.

| Root | What Belongs Here |
|---|---|
| **TOOL** | Hand tools, power tools, measuring instruments, jigs |
| **FASTENER** | Screws, bolts, nails, staples, anchors, rivets |
| **MATERIAL** | Lumber, metal stock, pipe, wire, sheet goods, raw stock |
| **CONSUMABLE** | Adhesives, lubricants, tape, spray paint, sandpaper, solder |
| **COMPONENT** | Electronics, fittings, switches, hardware, mechanical parts |

## Color Coding

Color provides instant visual category identification before anyone reads a label.

| Root | Recommended Color | Rationale |
|---|---|---|
| TOOL | Green | Operational / go |
| FASTENER | Gray / Silver | Neutral, metallic |
| MATERIAL | Brown | Raw / natural |
| CONSUMABLE | Yellow | Caution / depletes |
| COMPONENT | Blue | Information / data |

**Hard rule — not overridable:** Red is reserved for POWER, ELECTRICAL, and DANGER across all deployments. This aligns with universal industry standards and keeps people safe.

Everything else is a recommended default. If your environment uses a different color convention, document your local override on your context card. The system stays internally consistent as long as your override is documented.

## The Scan-Scan Workflow

Every location has a QR code. Every vessel has a QR code. The check-in workflow is:

1. **Scan the location** — "I am at `SH-MM-S3-A1`"
2. **Scan the item** — "This is `MS-013`"
3. **Result:** Database records `MS-013` is at `SH-MM-S3-A1`

Two scans. No typing. No app navigation. This is the same logic warehouse management systems use at industrial scale, applied at home scale.

The same workflow works in reverse for check-out. Scan location, scan item, item is marked as removed from that location.

## The Context Card

Every zone should have a printed context card. This is the portable brain of the system.

A context card contains:
- Zone identifier and human-readable name
- Compass orientation diagram
- Column and level reference grid
- QR code linking to the zone's wiki page
- List of vessels currently assigned to this zone

The context card is what makes the system work offline, for visitors, and for first responders. Photo it. Any LLM with vision can parse the entire space from a single image.

**The context card is the viral feature.** Hand it to anyone and they can navigate your space without explanation.

## Vessel Registry

Vessels are physical containers that move. They are not fixed to a location — they travel between HL addresses and carry kits or materials with them.

| Prefix | Type | Example |
|---|---|---|
| `MS-` | MaxOSort portable case | `MS-013` |
| `ST-` | Small tote | `ST-027` |
| `TK-` | Tool kit (logical grouping) | `TK-TAP-DIE-01` |
| `TB-` | Tool box | `TB-002` |

A vessel's current location is a database field, not part of its ID. The ID is permanent. The location updates when it moves.

*Note: `TK-` here refers to a physical tool kit box. The Firestore `kits` collection also uses `TK` as a prefix for Tool Kit capability groups — the same two letters mean two different things depending on context (physical vessel vs. logical kit record). Don't conflate the two.*

## What Does Not Change

These rules are the constitution. They survive software changes, storage layout changes, AI changes, and ten years of use.

- The six-segment address format
- Left-to-right column counting
- Bottom-to-top / front-to-back LEVEL counting
- Left-to-right DEPTH counting across a tier
- Mobile cart Northwest-start orientation
- The five root nouns
- Red = power/danger only
- Drop from the left only
- Physical label wins over database in a conflict

## What Can Change

These are defaults and recommendations. Adapt them to your environment.

- Structure and zone codes — define your own two-letter codes
- Color assignments (except red)
- Display tier in use on labels
- Vessel prefix naming conventions
- Context card visual design
- Wiki page structure and tooling

## The Minimum Viable Deployment

You do not need a server, a scanner, or a QR printer to start. The minimum deployment is:

1. Pick a zone
2. Assign it a code
3. Write the code on a piece of tape
4. Put the tape on the shelf

That's it. The system is running. Everything else — QR codes, wiki pages, Home Assistant integration, AI agents — is an upgrade layer built on top of that foundation.

Start simple. The grammar scales with you.

---

**Common questions this doc answers (for PATCH):**
- "What does this code mean?" → Decode it segment by segment: STRUCT-ZONE-ANCHOR/COL-LEVEL/DEPTH, left to right, broad to specific.
- "How do I name a new item?" → Noun-first: ROOT-TYPE-DETAIL-SPEC, using one of the five root nouns (TOOL, FASTENER, MATERIAL, CONSUMABLE, COMPONENT).
- "Can I shorten an address on a label?" → Yes, but only by dropping segments from the left (STRUCT, then STRUCT-ZONE) — never skip the middle.
- "Do I need an app to start?" → No — a piece of tape and a marker is a fully valid deployment.
- "Why does level counting start at the bottom?" → So a new shelf can always be added on top without renumbering everything above it.
- "What's the difference between LEVEL and DEPTH?" → LEVEL is which tier/row you're on (bottom-up on shelves/drawers, front-to-back on flat tops). DEPTH is where you are left-to-right on that tier. `0` means it's a lone item with nothing beside it.

*HL System Grammar v1.2 — August 2026*
*"Nothing is lost. Everything is logic."*
