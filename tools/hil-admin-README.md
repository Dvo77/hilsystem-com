## HIL Admin

**File:** hil-admin.html
**URL:** hilsystem.com/tools/hil-admin.html
**Status:** Beta

**Purpose:** The platform control panel for the HIL System owner/admin. Lets the admin
review and approve incoming staged items, manage people and pets in the household,
monitor financial overview across all catalogued inventory, track open owner issues,
and toggle per-user seasonal effects — all from one authenticated dashboard.

**Core Features:**
- Auth gate: only accounts with `is_admin: true` on their `team_members` doc can enter —
  everyone else is denied at the door regardless of sign-in status
- People & Pets module: view, add, and edit all household members including pet-specific
  fields (species, breed, tricks, vaccination records) and admin flag toggles
- Staged Items module: review pending items from the email ingestion pipeline, approve
  them (routes through Cloud Run commit service — never writes `item_records` directly),
  reject them, or match unmatched receipts to an owner
- Owner Issues module: live feed from `platform/owner_issues` — bugs, todos, and ideas
  logged by PATCH or manually, with type tags (BUG / TODO / IDEA)
- Financial Overview: aggregated read across all `item_records` showing total catalogued
  value, insured value, items pending valuation, and highest-value zone
- Seasonal Flair toggle: per-user switch for the 30-second seasonal sign-in effect
  (snow in winter, etc.) stored at `users/{uid}.preferences.seasonal_flair_enabled`
- Module hide/restore: any dashboard module can be hidden and restored, persisted per
  admin user in `users/{uid}/admin_prefs/dashboard_layout`
- Mobile responsive: sidebar collapses to a hamburger menu on small screens; all modules
  stack to single column

**How it connects:**
- Reads from: `users/{uid}/team_members`, `staged_items`, `users/{uid}/item_records`,
  `platform/owner_issues/items`, `users/{uid}` (preferences)
- Writes to:
  - `users/{uid}/team_members` — add/edit people and pets (direct frontend write, allowed)
  - `staged_items` — reject action only (direct frontend write, allowed — staging collection)
  - `users/{uid}.preferences.seasonal_flair_enabled` — flair toggle (direct frontend write)
  - `users/{uid}/admin_prefs/dashboard_layout` — module visibility preferences
  - `users/{uid}/item_records` — **never written directly from this tool**
- Approve action routes through: Cloud Run `hil-admin-action` service at
  `hil-admin-action-937314472168.us-central1.run.app/webhook/admin-action`
  — the only writer to `item_records` per architecture doctrine
- Entry points: direct URL only — no in-platform nav entry for non-admin users
- Cross-tool data flows: approved staged items land in Vault (`item_records`) with
  `status: "needs_address"` — owner then assigns an HL address through Vault or
  Family Ledger to complete the record

**Known limitations / not yet live:**
- Financial Overview is a one-time aggregation on page load, not a live listener —
  refresh the page to reflect newly approved items
- Owner Issues collection path assumed to be `platform/owner_issues/items` subcollection —
  confirm this matches actual Firestore structure before testing
- Staged Items "match" action (for receipts with no owner_uid) requires the admin to
  supply the correct owner UID manually — no owner lookup UI built yet
- `api.hilsystem.com/webhook/admin-action` custom domain routing not yet configured —
  currently pointing at raw Cloud Run URL; swap one constant when routing is set up
- Carrie's `team_members` doc needs `is_admin: true` and `linked_uid` added before she
  can access the admin panel
- Feature Flags section visible in sidebar nav but not yet built
- No audit log — admin actions (approve/reject/edit) are not currently logged with
  who did what and when (good candidate for a future `admin_log` collection)

**Common questions this tool answers:**
- "How do I approve a receipt that came in?" → Go to Staged Items in the admin panel,
  find the pending item, and hit approve. It routes through the backend and lands in
  your Vault automatically.
- "Someone forwarded a receipt but it didn't attach to their account — what do I do?"
  → In Staged Items it'll show as "owner_uid: null — needs manual match." Hit the match
  button and supply the correct owner's UID to commit it to their inventory.
- "Can Carrie get into the admin panel?" → Yes, but her team_members doc needs
  is_admin: true and her linked_uid added in Firestore first — same two fields that
  were added for Dan.
- "Why can't I see my newly approved item in the Financial Overview?" → The financial
  aggregation runs once when the page loads. Refresh the page and it will include it.
- "What happens if I reject a staged item?" → It stays in staged_items with
  status: "rejected" and disappears from the pending queue. It is not deleted.
- "Is the admin panel accessible to regular users?" → No. The auth gate checks
  is_admin === true server-side on every request — a regular signed-in user gets
  an "access denied" screen, not a blank page.
