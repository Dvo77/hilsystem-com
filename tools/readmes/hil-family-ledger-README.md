## Family Ledger

**File:** hil-family-ledger.html
**URL:** hilsystem.com/tools/hil-family-ledger.html
**Status:** Live

**Purpose:** Tracks household members and their relationship to the inventory —
what each person owns or is responsible for, donations and trades they've made,
and (as of this update) a lightweight teaser pointing to their Guild progress.

**Core Features:**
- Per-member view (member switcher sidebar) covering Inventory, Portfolio,
  Marketplace, and Donations tabs
- Badge-earning triggers live here: adding a first item, logging a first
  donation, completing a first trade, and viewing the portfolio tracker all
  award badges automatically as the underlying action happens
- Guild teaser card: shows a live badge count for the selected member and
  links out to the full Guild tool — Guild itself is no longer a tab here
- Item detail overlay includes Hold/Trade/Donate/Sell actions that hand off
  to HIL Exchange

**How it connects:**
- Reads from: `users/{uid}/team_members/{memberId}` and its subcollections
  (`badges`, `donations`, `trades`, `portfolio`)
- Writes to: `badges` subcollection directly (frontend-writable — badges are
  a gamification layer, not inventory truth, so this doesn't go through the
  backend commit pipeline)
- Entry points: main nav ("Ledger"); Guild's own module cards also assume
  Ledger is where members get added/edited in the first place
- Cross-tool data flow: badge-earning logic lives here, but the actual badge
  grid/milestone list display was moved to the Guild tool — Ledger only shows
  a count, not the full grid, as of this session

**Known limitations / not yet live:**
- The Guild tab that used to live here (`#tab-guild`) has been fully removed
  and replaced with the teaser card — if a user asks "where did the Guild tab
  go," the answer is it moved to its own tool, not that it was deleted
- Badge catalog (`BADGE_CATALOG`) is duplicated between this file, Guild, and
  Weather School — there's no shared source of truth yet, so a badge added
  in one place needs to be manually added to the others or it becomes
  earnable-but-invisible in Guild's badge grid

**Common questions this tool answers:**
- "Where do I add a new family member?" → Family Ledger — member switcher in
  the sidebar has an add option.
- "Why don't I see badges here anymore?" → Badges now display in full inside
  Guild; Ledger just shows a running count and a link over.
- "How do I log a donation?" → Donations tab, per selected member.
- "Can I trade an item from here?" → Yes — the item detail overlay has a
  Trade action that opens HIL Exchange.
