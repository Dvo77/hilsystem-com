## Natural Sciences

**File:** index.html
**URL:** hilsystem.com/tools/natural-sciences/
**Status:** Live

**Purpose:** Guild hub for chemistry, earth science, and biology — mirrors the Electric Forge hub pattern (a landing page linking out to individual labs, with a shared progress strip reading real Ledger data). Currently one live lab (Periodic Table Lab) with Earth Science and Biology stubbed as "coming soon."

**Core Features:**
- Lab grid linking to each science module, styled per-lab accent color same as Electric Forge's lab cards
- Progress strip reading real Session Log Entry counts for the resolved household member ("N / [total] labs wrapped up")
- Breadcrumb nav back to Guild root
- Coming-soon stub cards for Earth Science and Biology, so the hub's growth path is visible even before those modules exist

**How it connects:**
- Reads from: `users/{uid}/team_members/{memberId}/session_log_entries`, filtered by each live lab's `moduleId` (currently just `periodic-table-lab`)
- Writes to: nothing directly — the hub page itself has no writes; each lab underneath it owns its own Wrap Up write
- Entry points: Guild root (`hil-guild.html`) → "Open Natural Sciences" card
- Cross-tool data flows: hub's own progress tracker and the Guild root's "Time by Category" tracker both read off `guild-module-registry.js`'s `GUILD_HUBS` entry for this hub (`id: 'natural-sciences'`) — adding a new lab here means updating that registry's `moduleIds` array, not just linking the new lab from this page

**Known limitations / not yet live:**
- Earth Science and Biology cards are visual stubs only — no files exist yet, `href` intentionally omitted so they're non-clickable
- `hil-shell.js` `NAV_TOOLS` entry not yet added, so this hub isn't reachable from the top nav bar — only from the Guild root grid
- Same open item as Electric Forge's hub: links from this page to `periodic-table-lab.html` don't pass a `?member=` param, so the lab falls back to auto-selecting a household member on load rather than inheriting the one already active here

**Common questions this tool answers:**
- "Where's the chemistry stuff?" → Natural Sciences hub, currently just Periodic Table Lab, more coming.
- "Is there an earth science module yet?" → Not yet — it's on the hub as a coming-soon card so it's clear it's planned, not forgotten.
- "How do I know how much time I've spent on science this week?" → The hub's progress strip and the Guild root's Time by Category tracker both pull from the same real logged sessions.
