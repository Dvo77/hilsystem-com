## Family Ledger

**File:** `hil-family-ledger.html`
**URL:** `hilsystem.com/tools/hil-family-ledger.html`
**Status:** Beta — core tabs are live; several newer features below are written but not yet pushed/deployed (see Known Limitations)

**Purpose:** The household's per-member hub — tracks inventory, financial portfolio, trades, donations, trust/audit history, a household-wide wishlist, and (for pets) a dedicated fun-but-useful profile. One member at a time, selected from the sidebar.

**Core Features:**
- Add any household member as either a Human or a Pet — the form and everything downstream adapts to the type
- **Humans:** Name, Role (family/child/employee/client/partner/other), Age, Email, Notes
- **Pets:** Name, Species (Cat/Dog/Bird/Fish/Reptile/Small Mammal/Horse/Other), Age, Treat Time, Quirks, History, and a repeatable Vaccinations list (name + date given + next due, with overdue ones flagged automatically)
- **Pet Profile tab** (auto-appears only when a pet is selected) — shows a fixed, jokey "Abilities" card auto-generated per species (e.g. a cat gets "Selective Hearing (Legendary)," a dog gets "Treat Radar (Hearing +100)") alongside the real Quirks/History/Treat Time/Vaccinations data
- **Inventory tab** — items assigned to the selected member from the Vault
- **Portfolio tab** — manual investment/savings account tracking per member
- **Marketplace tab** — propose trades between household members
- **Donations tab** — logged donations with a running 30% credit calculation
- **Audit tab** — Trust Score display and spot-check flow (see Known Limitations — backend not live yet)
- **Wishlist tab** — household-wide (not scoped to the selected member) list of needs/wants, grouped by House or by member; supports manual entries and PATCH-suggested items (suggestions require explicit confirm before appearing as active); a Copy/Email List button formats active items and opens a pre-filled `mailto:` — no backend send pipeline, this is manual sharing by design
- **Guild teaser card** — shows a live badge count for the selected member and links out to `hil-guild.html`; the full badge grid and milestone tracking live in Guild itself, not here — Ledger only needs a count
- **Badge-earning triggers live here** — adding a first item, logging a first donation, completing a first trade, and viewing the Portfolio tab all silently award a cosmetic badge the moment the action happens (via `awardBadge()`, checked against `BADGE_CATALOG`)
- Hero image (`ledger-hero.png`) shown in place of a plain empty state when no member is selected yet, with a real "+ Add a New Member" button wired to the same modal as the sidebar button

**How it connects:**
- Reads/writes: `users/{uid}/team_members/{memberId}` (all member fields, human and pet)
- Reads/writes: `users/{uid}/team_members/{memberId}/portfolio`, `/donations`, `/trades`, `/badges` (per-member subcollections)
- Reads: `users/{uid}/item_records` (for inventory assignment/unassignment)
- Reads/writes: `users/{uid}/wishlist_items` — top-level, household-wide, fully isolated from `item_records`; frontend-writable directly, no Cloud Run gate
- Reads/writes: `users/{uid}/audit_events` (Audit tab — depends on backend, see below)
- **Two distinct badge-write paths on the same `/badges` subcollection:** cosmetic badges (this file's `awardBadge()`) stay frontend-writable and never set `source_event_id`/`redeemable_for`; audit-issued badges carry those two fields and are written only by `hil-admin-action` via `/submit-audit`. A Firestore rule is planned to enforce this split at the field level — client writes only permitted when both fields are absent.
- Entry points: sidebar member list; deep link from Vault's post-save "confirm the rest" bar (`?member=...&scope_type=...&scope_id=...&source=putaway_confirm`), which currently routes to the Audit tab
- PATCH suggestion writes land in `wishlist_items` with `status: "suggested"` under the owner's own uid — same write path as manual entries, no separate backend

**Known limitations / not yet live:**
- **Audit tab / Trust Score is written but not deployed** — depends on `/trigger-audit` and `/submit-audit` being live on `hil-admin-action`, which they are not yet. The tab renders but a spot check cannot currently be completed end-to-end.
- **Wishlist tab is built but not yet pushed to `main`** — also depends on the `wishlist_items` Firestore rules being deployed (owner-read/write only), which hasn't happened yet. Add/Edit will fail with permission-denied until the rules land.
- **Pet Profile tab is built but not yet pushed to `main`.** No Firestore rules dependency — pet fields live directly on the existing `team_members` doc, which is already frontend-writable — so once the file is pushed, this works immediately.
- **PATCH cannot currently suggest wishlist items or comment on pets** — the ability for PATCH to write `wishlist_items` suggestions, and the ability for PATCH to read `team_members` for pet grounding, are both designed but not yet deployed on the `hil-patch-agent` Worker side. This is a separate deploy from the Family Ledger file itself.
- No edit entry point exists for human members yet — only pets have an EDIT button (on the Pet Profile tab). Editing a human member's details currently requires re-adding them.
- Wishlist sharing is manual only by design — Copy/Email List, no in-app claim links, no recipient accounts. This is a deliberate v1 scope decision, not a bug.
- Hero image (`ledger-hero.png`) is 2.6MB — not urgent, but a compressed version would help load time if this page starts feeling slow.
- **Item detail overlay does NOT currently have Hold/Trade/Donate/Sell actions.** This is the locked target design per the HIL Exchange spec (Family Ledger's item overlay is meant to be the entry point into Barter/Trade/Sell/Auction), but as of this file, `openItemDetail()` only renders read-only identity/financial info with UNASSIGN/CLOSE buttons — no Exchange handoff exists yet. Flagging explicitly since an earlier draft of this README described it as already built.
- **Guild tab (`#tab-guild`) has been fully removed**, replaced by the teaser card — if a user asks "where did the Guild tab go," the answer is it moved to `hil-guild.html`, not that it was deleted.
- **`BADGE_CATALOG` may be duplicated across this file, Guild, and Weather School** with no shared source of truth — unverified from this session (only confirmed the 10-badge catalog exists here, including `weather-watcher`/`junior-meteorologist` entries tied to Weather School). Worth a direct check before trusting badge parity across tools; a badge added in one place may be earnable-but-invisible elsewhere if the catalogs drift.

**Common questions this tool answers:**
- "What does my cat need for the vet this year?" → Once Pet Profile is deployed, the Vaccinations list on that pet's profile shows next-due dates and flags anything overdue in red.
- "What's on the family wishlist?" → Once deployed, the Wishlist tab shows everyone's active items grouped by House or by person, regardless of which member is selected in the sidebar.
- "Can grandma see the wishlist without a HIL account?" → Not yet — current design requires a free HIL sign-in to view in-app; sharing today is via Copy/Email List sent manually.
- "Why don't I see a Wishlist or Pet Profile tab yet?" → Both are built but not yet pushed live — check `DEPLOY_STATE.md` for current push/rules status before assuming something's broken.
- "How is my trust score calculated?" → Not answerable yet — the Audit backend isn't live, so no score has ever actually been generated.
- "Where do I add a new family member?" → Sidebar "+ ADD MEMBER" button, or the same button surfaced in the hero image when no member is selected yet.
- "Why don't I see badges here anymore?" → The full badge grid now displays inside Guild; Ledger only shows a running count on the teaser card with a link over.
- "Can I trade an item from here?" → Not yet, despite being the intended design — see Known Limitations.
