## HIL Admin

**File:** hil-admin.html
**URL:** hilsystem.com/tools/hil-admin.html
**Status:** Live
**Audience:** Platform owner/admin only (Dan). No regular user ever reaches this panel.

**Purpose:** The platform operations center for the HIL System owner. Reviews and approves
incoming staged items, manages household people and pets, monitors financial overview,
tracks open owner issues, manages Guild Media assets, and controls seasonal effects —
all from one authenticated dashboard.

**How it differs from hil-account.html:**
- Requires `is_admin: true` on `team_members` doc — regular users are denied at the door
- Has Staged Items review queue (approve/reject/match receipts from the email pipeline)
- Has Owner Issues feed (bugs, todos, ideas from PATCH or manual entry)
- Has Guild Media management (upload/manage hero illustrations, whiteboards, diagrams, etc.)
- Does NOT have subscription management, Full Disclosure page, or data export — those
  live in hil-account.html which is the user-facing panel
- Has a sidebar link to hil-account.html so Dan can preview the user panel while staying
  in his own admin context

**Core Features:**
- Auth gate: `is_admin: true` on `users/{uid}/team_members/{uid}` — denied otherwise
- Dashboard: modular grid of all sections; modules can be hidden/restored per admin user
- People & Pets: view, add, edit household members including pet fields, admin flag toggles
- Financial Overview: aggregated read across item_records — total value, insured value,
  items pending valuation, highest-value zone
- Insurance Report: external link to hil-insurance-report.html (opens in new tab)
- Staged Items: review pending items from email ingestion pipeline — approve (routes
  through Cloud Run), reject, or match unowned receipts to a specific user
- Owner Issues: live feed from `platform/owner_issues/items` — BUG / TODO / IDEA tags
- Seasonal Flair: per-user toggle for 30-second sign-in particle effect
- Guild Media: upload and manage platform media assets (hero illustrations, whiteboards,
  diagrams, animations, shorts, photos, SVGs, charts, PDFs, sims) to R2 via signed URL
- Account Panel link: opens hil-account.html in a new tab for admin preview

**How it connects:**
- Reads from: `users/{uid}/team_members`, `staged_items`, `users/{uid}/item_records`,
  `platform/owner_issues/items`, `users/{uid}` (preferences), `guild_media`
- Writes to:
  - `users/{uid}/team_members` — add/edit people and pets (frontend write, allowed)
  - `staged_items` — reject action only (frontend write, allowed)
  - `users/{uid}.preferences.seasonal_flair_enabled` — flair toggle (frontend write)
  - `users/{uid}/admin_prefs/dashboard_layout` — module visibility preferences
  - `guild_media` — media asset records (frontend write, gated by admins/{uid} existence)
  - R2 via `hilsystem-r2-signer` Worker — photo/file uploads
  - `users/{uid}/item_records` — **NEVER written directly from this tool**
- Approve action routes through: Cloud Run `hil-admin-action` at
  `hil-admin-action-937314472168.us-central1.run.app/webhook/admin-action`
- Entry points: direct URL only; sidebar link from any tool for admin users
- Related tools: hil-account.html (user-facing counterpart)

**Auth model:**
```
onAuthStateChanged → check users/{uid}/team_members/{uid}.is_admin === true
  → true: show dashboard
  → false / missing: show "access denied" gate
  → not signed in: show sign-in gate
```

**Known limitations:**
- Financial Overview is a one-time aggregation on page load — refresh to reflect
  newly approved items (not a live listener)
- Staged Items "match" action requires manual entry of owner UID — no lookup UI
- No audit log — admin actions (approve/reject/edit) are not logged with actor + timestamp
  (candidate for a future `admin_log` collection per the security/privacy policy)
- Carrie's team_members doc needs `is_admin: true` and `linked_uid` before she
  can access this panel

**Common questions:**
- "How do I approve a receipt?" → Staged Items tab → find pending item → Approve.
  Routes through Cloud Run, lands in Vault automatically.
- "A receipt came in with no owner — what do I do?" → Shows as owner_uid: null.
  Hit Match and supply the correct owner UID.
- "Can regular users see this?" → No. is_admin check fires before anything renders.
- "Why doesn't my newly approved item show in Financial Overview?" → Aggregation runs
  once on load. Refresh the page.
- "Where do users manage their account, subscription, and privacy?" → hil-account.html.
  That's the user-facing panel. This panel is ops-only.
