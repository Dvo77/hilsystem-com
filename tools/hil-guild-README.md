## Guild

**File:** hil-guild.html
**URL:** hilsystem.com/tools/hil-guild.html
**Status:** Beta

**Purpose:** The household's learning and achievement hub — badges, milestones,
and a set of learning modules (Incubator, Weather School, and eventually more)
in one place per household member, instead of buried in Family Ledger.

**Core Features:**
- Per-member view (same member-switcher pattern as Family Ledger)
- Badge grid: shows every badge in the catalog, earned or locked, with earned
  date — badges themselves are actually awarded from Family Ledger and
  Weather School as behavior happens; Guild only displays them
- Milestones: persisted progress tracking (item count, donation count, trade
  count) with a progress bar per milestone — this is new as of this session;
  previously milestones were only computed in memory and didn't persist
- Module cards: Incubator (deep link to the GitHub-backed skills wiki),
  Weather School (deep link, fully functional), Music School (visible but
  disabled — no content loaded yet)

**How it connects:**
- Reads from: `users/{uid}/team_members/{memberId}/badges`,
  `/milestones`, and (for milestone progress calculation) `item_records`
  filtered by member, `/donations`, `/trades`
- Writes to: `milestones` subcollection when a milestone's criteria are met
  (frontend-writable, same doctrine as badges — this is a gamification
  layer, not inventory truth, so it doesn't route through the backend
  commit pipeline the way `item_records` does)
- Entry points: main nav ("Guild"); also reachable from Family Ledger's
  Guild teaser card
- Cross-tool data flow: `learning_projects` subcollection (new schema this
  session) is written by Weather School as observations are logged, and is
  meant to be a generic shape other modules can write into later for the
  same portfolio-documentation purpose

**Known limitations / not yet live:**
- Music School module is a visible card with a disabled button — no tutor
  content has been loaded yet, this is a placeholder only
- Badge catalog is duplicated across this file, Family Ledger, and Weather
  School — no shared source of truth, so keeping them in sync is manual
- No DPI/homeschool-portfolio export view exists yet — `learning_projects`
  records the data, but nothing currently generates a document from it
- Incubator deep link is not member-scoped — it opens the same
  Incubator Generator regardless of which member is selected in Guild

**Common questions this tool answers:**
- "What badges have I earned?" → Full grid shown here, earned ones
  highlighted with the date earned.
- "How do I level up / what do I need to do next?" → Milestones section
  shows progress bars toward the next unlock for each tracked activity.
- "Where's the weather thing?" → Weather School module card, links straight
  there.
- "Is there a music lesson tool?" → Card exists but it's not built yet —
  coming soon, no content loaded.
- "Do I need to go back to Family Ledger to see my badges?" → No, the full
  badge display lives here now; Family Ledger only shows a count.
