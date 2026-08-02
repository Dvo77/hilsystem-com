## Tag Manager

**File:** `tools/hil-tag-manager.html`
**URL:** `hilsystem.com/tools/hil-tag-manager.html`
**Status:** Live

**Purpose:** Category tree manager for the Global Tag Store — lets a user group related tags under a parent category (e.g. `lawnmower`, `edger`, `loppers` → `Lawn Care`), re-parent a whole group at once as it grows (`Lawn Care` → `Garden Tools` once vegetable gardening tools exist, without touching the five child tags), edit tag metadata, and merge duplicate/near-duplicate tags into one canonical entry.

**Core Features:**
- Real-time tree view of every tag in `tag_registry`, built from each tag's `parent_tag_id` — no separate "children list" stored anywhere, the tree is computed live from that one field
- Create new tags directly from the top toolbar, optionally assigning a parent at creation time
- Per-tag edit panel: reassign parent, change type (Global/Custom/Expiring), edit description
- Cycle prevention: the parent dropdown on any tag excludes that tag itself and all of its own descendants — a tag physically cannot be set as its own ancestor
- Merge: folds one tag into another via the existing `/merge-tag` `hil-admin-action` endpoint — rewrites every affected item's `subcategories[]` and retires the losing tag, all from the same edit panel
- Orphan detection: if a tag's `parent_tag_id` points at something that no longer exists (e.g. was merged away), it renders with a visible warning instead of silently vanishing from the tree
- Search/filter that keeps a parent visible if any of its descendants match, so filtering for a specific tool still shows you its category

**How it connects:**
- Reads from: `users/{uid}/tag_registry` (real-time listener)
- Writes to: `users/{uid}/tag_registry` directly for create/edit/re-parent (vocabulary, not inventory truth — same write class as `museum_items`, per the Authority Layer doctrine); calls `hil-admin-action`'s `/merge-tag` (via `vaultMergeTag()` from `vault-item-client.js`) for merges, since a merge has to fan out and rewrite other collections' data
- Entry points: top nav bar (`Tags`, between Kits and Labels & Signs)
- Cross-tool data flows: any tag created or edited here is immediately reflected in Vault's subcategory autocomplete (same `tag_registry` collection, same real-time listener pattern) — no separate sync step

**Known limitations / not yet live:**
- No bulk re-tagging of existing items when a flat tag is reorganized into a hierarchy — if items were already tagged `lawn-care` directly before a tree existed, those items keep that exact tag; the tree only governs how tags relate to *each other* going forward, not a retroactive cleanup of what's already on inventory
- No hard delete for a tag with zero usage — retirement only happens via merge, matching the same "no bare delete" rule already enforced at the Firestore rules level for this collection
- No bulk/multi-select operations (e.g. re-parenting five tags at once) — each edit is one tag at a time
- Type promotion (Custom → Global) is a manual field edit here, not a guided/threshold-based flow — matches the platform's existing informal, human-judgment-based moderation pattern rather than automating it

**Common questions this tool answers:**
- "How do I group my lawn tools together without losing the specific tag on each one?" → Give each tool its own specific tag (`lawnmower`, `edger`), then set all of their parents to a shared category tag (`Lawn Care`) here.
- "I made 'mower' and 'lawnmower' by accident — how do I fix it?" → Open either one's edit panel, pick the other in MERGE INTO, and confirm. Every item using the losing tag switches to the winner automatically.
- "If I reorganize my categories later, do I have to redo every tag?" → No — re-parent the category tag itself (e.g. move `Lawn Care` under a new `Garden Tools` parent) and every tag already nested under it moves with it, since they still point at `Lawn Care`, not at the new parent directly.
- "Can two unrelated things share a tag, like cabling for both my network and other projects?" → Yes — a general-purpose tag like `cabling` should stay top-level rather than nested under a specific category like `MAX-NET`; an item just carries both tags (`cabling` + `max-net`) instead of one being forced under the other.
