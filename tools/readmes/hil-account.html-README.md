## HIL Account

**File:** hil-account.html
**URL:** hilsystem.com/tools/hil-account.html
**Status:** Live (v1 — August 2026 launch)
**Audience:** Every signed-in HIL user. This is the user-facing account panel.

**Purpose:** The personal account hub for any HIL user. Shows their account details,
HIL inbox address, email ingestion history, subscription plan, full platform privacy
disclosure, and data controls. This is NOT the admin panel — it has no ability to
see other users' data, approve staged items, or manage platform assets.

**How it differs from hil-admin.html:**
- Auth gate: any authenticated user — no is_admin check required
- Shows only the signed-in user's own data — no cross-user visibility
- Has subscription/billing management (Lemon Squeezy, when integrated)
- Has Full Disclosure section — plain-language privacy statement
- Has My Data section — export, notification prefs, account deletion
- Has HIL Inbox section — ingestion address, how-it-works guide, ingestion history
- Does NOT have: Staged Items review queue, Owner Issues, Guild Media management,
  Financial Overview across all users, or any platform-level controls

**Core Sections:**

**My Account (Overview)**
- Name, email, member since, current plan tier
- HIL inbox address displayed with one-tap copy button
- Recent ingestion activity (last 3 emails received)

**HIL Inbox**
- `{uid}@hilsystem.com` address prominently displayed with copy button
- 4-step how-it-works guide (forward receipt → staged items → 2-tap confirm → done)
- Full ingestion history from `staged_items` (source: email_ingest), last 50 entries
- Status dots: pending (amber) / merged (grey) / active (green)
- Sidebar badge shows live count of pending (unconfirmed) ingested emails

**Plan & Billing**
- Current tier badge (Free / Paid)
- Feature checklist per tier — HIL Inbox and PATCH are paid-only
- Upgrade CTA (placeholder until Lemon Squeezy integration is complete)
- Billing history (placeholder)
- Reads `users/{uid}.tier` to determine current plan

**Full Disclosure**
- Plain-language privacy statement in HIL brand voice
- What HIL collects, what we do with it, what we never do
- Staff access policy: "we built it so we don't have to look at your stuff"
- Government request policy
- No legal boilerplate — written to be read, not to be avoided

**My Data**
- Export my data button (coming soon — JSON download of all user records)
- Notification preferences (ingestion confirmations, exchange activity, platform updates)
  stored as toggles — persistence to Firestore TBD
- Danger Zone: account deletion with double-confirmation (confirm dialog + type DELETE)
  — currently sends a toast acknowledging the request; actual deletion pipeline TBD

**Auth model:**
```
HILShell.init({ toolId: 'account', requireAuth: true, onAuth: (user) => { ... } })
  → any authenticated user reaches onAuth
  → no is_admin check — regular users, paid users, and admins all see the same panel
  → data is always scoped to user.uid — no cross-user reads
```

**How it connects:**
- Reads from:
  - Firebase Auth (user.displayName, user.email, user.metadata.creationTime)
  - `users/{uid}` — tier field for subscription status
  - `staged_items` — filtered by owner_uid + source: "email_ingest" for ingestion history
- Writes to:
  - Nothing currently — all buttons are placeholders for future Lemon Squeezy /
    export pipeline / notification prefs integration
- Uses HILShell.init() — inherits Google + GitHub + Email auth, header/nav, toast system,
  design tokens, and Seasonal Flair automatically
- Firestore queries on staged_items require a composite index:
  `owner_uid ASC + source ASC + created_at DESC` — create via Firebase Console if missing

**Firestore index required:**
The ingestion history query needs this composite index or it will error:
```
Collection: staged_items
Fields: owner_uid (ASC), source (ASC), created_at (DESC)
```
Firebase Console will show a clickable link to create it automatically on first load error.

**Subscription tier gating (future):**
When Lemon Squeezy is integrated:
- `users/{uid}.tier` = "free" | "paid_1" | "paid_2"
- This panel reads that field and adjusts the feature checklist and upgrade CTA
- HIL Inbox and PATCH features shown as "Active" for paid tiers
- No tier logic is enforced here — enforcement lives in Cloud Run and Firestore rules

**NAV_TOOLS entry (hil-shell.js):**
```javascript
{ id: 'account', label: 'Account', icon: '👤', href: './hil-account.html' },
```
Add before the 'admin' entry so it appears in the main nav for all signed-in users.

**Known limitations / not yet built:**
- Data export button shows a toast — actual JSON export pipeline not built
- Notification preference toggles are UI-only — not persisted to Firestore yet
- Account deletion sends a toast — actual deletion pipeline (Cloud Run endpoint) not built
- Upgrade button links to coming-soon toast — Lemon Squeezy integration pending
- Billing history section is empty placeholder
- Staff access log (showing when HIL staff accessed the account) not yet built —
  depends on the audit logging infrastructure from the security/privacy policy

**Common questions:**
- "Where does a user go to manage their subscription?" → hil-account.html → Plan & Billing
- "Where does a user see their HIL inbox address?" → hil-account.html → HIL Inbox,
  also shown on the Overview tab
- "Where is the privacy policy?" → hil-account.html → Full Disclosure tab —
  plain language, not a separate legal page
- "Can a user see other users' staged items?" → No. Every Firestore query is scoped
  to `where("owner_uid", "==", user.uid)` — no cross-user data is ever returned
- "Why is the ingestion history empty even though emails were forwarded?" → Check that
  the composite Firestore index exists (owner_uid + source + created_at). Firebase
  Console will show a direct link to create it on first error.
- "Is this the admin panel?" → No. hil-admin.html is the admin panel. This panel
  has no platform-level controls — it's the user's own account home base.
