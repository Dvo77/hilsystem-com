## History Wall (Standalone Community Stories)

**File:** history-wall.html
**URL:** TBD — standalone public page, not yet assigned a subdomain/path
**Status:** Beta

**Purpose:** A public, open-submission board where anyone can share the story behind a heritage object (30+ years old or two generations removed) — no account required to browse, a name and email required to submit.

**⚠️ Naming note:** This is a different concept from the "History Wall" defined in the locked platform doctrine, where History Wall = the public opt-in surface of a Museum item already inventoried in someone's Vault (one tool, two surfaces). This page is a standalone, anonymous-submission community board with no link back to any Vault `item_record`. Worth renaming this to something like "Community Stories" before it's linked from the main site, to avoid confusing PATCH or users about which "History Wall" is being referenced.

**Core Features:**
- Fully public browsing — no login, no Shell, no header/nav injection from `hil-shell.js`
- Submission form requires Item Name, the Story text, Submitter Name, and Submitter Email — all four are required before the form will submit
- Submitted stories go to a moderation queue (`status: 'pending'`) rather than appearing instantly
- Only `status: 'approved'` stories show on the public feed; until any exist, sample/demo stories display instead, clearly labeled as samples
- Category filter bar and a sort toggle (Top Voted / Newest)
- Optional HL address field — if provided, links the story to a physical HIL address, though nothing currently verifies the address is real or owned by the submitter
- Submitter email is captured for contact purposes only and is never rendered on the public page

**How it connects:**
- Reads from: `history_wall_submissions` (top-level Firestore collection, filtered to `status == 'approved'`)
- Writes to: `history_wall_submissions` (new document per submission, always `status: 'pending'` on create)
- Entry points: standalone page, linked from the main site; not currently reachable from inside the authenticated Shell tools
- Cross-tool data flow: none currently — an HL address entered here is free text, not validated against or linked to the actual `item_records` in Vault

**Known limitations / not yet live:**
- No moderation UI — approving a submission currently means manually editing `status` to `'approved'` in the Firestore console; no admin review screen exists yet
- Voting is client-side only — resets on page reload, no per-person dedup, not persisted to Firestore. Someone could refresh and vote repeatedly today.
- Firestore security rules for `history_wall_submissions` need to be added before this goes live publicly — client should be able to `create` with `status == 'pending'` only, `read` only where `status == 'approved'`, and never `update`/`delete`
- "Story of the Week" featured card is hardcoded, not pulled from real submissions or an editorial-curation flag
- HL address field is free text with no validation against real Vault records — someone could enter any address, real or not
- No connection to the doctrine-defined History Wall/Museum surface — see naming note above

**Common questions this tool answers:**
- "Do I need an account to read the stories?" → No — browsing is completely open, no sign-in required.
- "Do I need an account to submit a story?" → No account, but a name and a working email are required so the story can be reached about before it's approved.
- "Will my email show up publicly?" → No — it's collected for contact purposes only and is never displayed.
- "Why isn't my story showing up yet?" → Submissions go into a review queue first; it'll appear once approved, not immediately.
- "Can I use this to sell or get an appraisal on my item?" → No — this is a record of provenance and story, not a marketplace. Use HIL Exchange for that.
