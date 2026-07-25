## HIL Account

**File:** hil-account.html
**URL:** hilsystem.com/tools/hil-account.html
**Status:** Beta

**Purpose:** The personal account hub for any signed-in HIL user. Shows account
details, HIL inbox address, email ingestion history, subscription plan and
billing, full platform privacy disclosure, and data controls. This is NOT the
admin panel — it has no ability to see other users' data, approve staged
items, or manage platform assets.

**Core Features:**
- **Overview** — name, email, member since, current plan tier; HIL inbox
  address with one-tap copy; recent ingestion activity (last 3 emails)
- **HIL Inbox** — personal `{uid}@hilsystem.com` forwarding address, 4-step
  how-it-works guide, full ingestion history (last 50 entries) with status
  dots (pending / merged / active), sidebar badge showing live pending count
- **Plan & Billing** — current tier badge, feature checklist per tier (HIL
  Inbox and PATCH are paid-only), Upgrade button that opens a real Lemon
  Squeezy checkout, billing history section (placeholder)
- **Full Disclosure** — plain-language privacy statement in HIL brand voice:
  what HIL collects, what it does with it, what it never does, staff access
  policy, government request policy — written to be read, not avoided
- **My Data** — export button (coming soon), notification preference toggles,
  Danger Zone account deletion with double-confirmation

**How it differs from hil-admin.html:**
- Auth gate: any authenticated user — no `is_admin` check required
- Shows only the signed-in user's own data — zero cross-user visibility
- Does NOT have: Staged Items review queue, Owner Issues, Guild Media
  management, Financial Overview across all users, or any platform-level
  controls

**How it connects:**
- Reads from:
  - Firebase Auth (`user.displayName`, `user.email`, `user.metadata.creationTime`)
  - `users/{uid}` — `tier` field for subscription status
  - `staged_items` — filtered by `owner_uid` + `source: "email_ingest"` for
    ingestion history
- Writes to:
  - Nothing currently — export / notification prefs / account deletion
    buttons are still placeholders (see Known limitations)
- Entry points: main HIL nav (`Account`), HILShell auth flow lands
  authenticated users here on request
- Uses `HILShell.init()` — inherits Google + GitHub + Email auth, header/nav,
  toast system, design tokens, and Seasonal Flare automatically

**Known limitations / not yet live:**
- **Billing button is live but incomplete end-to-end.** As of July 25, 2026
  the Upgrade CTA correctly opens Lemon Squeezy checkout (variant
  `2f3cdefe-a978-4e5c-b57c-705121c79409` — replaces a stale numeric product ID
  that was 404ing). A user can complete a purchase, but the Lemon Squeezy
  store is still in **Test Mode**, and no webhook exists yet to write the
  purchase back to `users/{uid}.tier` — so a completed checkout does not
  currently unlock paid features
- Data export button shows a toast — actual JSON export pipeline not built
- Notification preference toggles are UI-only — not persisted to Firestore
- Account deletion sends a toast — actual deletion pipeline (Cloud Run
  endpoint) not built
- Billing history section is empty placeholder
- Staff access log (showing when HIL staff accessed the account) not yet
  built — depends on audit logging infrastructure from the security/privacy
  policy
- No tier logic is enforced from this panel — enforcement lives in Cloud Run
  and Firestore rules once built

**Common questions this tool answers:**
- "Where does a user go to manage their subscription?" → hil-account.html →
  Plan & Billing
- "Where does a user see their HIL inbox address?" → hil-account.html → HIL
  Inbox, also shown on the Overview tab
- "Where is the privacy policy?" → hil-account.html → Full Disclosure tab —
  plain language, not a separate legal page
- "Can a user see other users' staged items?" → No. Every Firestore query is
  scoped to `where("owner_uid", "==", user.uid)` — no cross-user data is ever
  returned
- "I upgraded but I still don't have paid features — why?" → The checkout
  itself works, but the purchase isn't wired back to the account yet (no
  webhook, and the store is in Test Mode). This is a known gap, not user
  error.
- "Why is the ingestion history empty even though emails were forwarded?" →
  Check that the composite Firestore index exists (`owner_uid` + `source` +
  `created_at`). Firebase Console shows a direct link to create it on first
  error.
- "Is this the admin panel?" → No. `hil-admin.html` is the admin panel. This
  panel has no platform-level controls — it's the user's own account home
  base.

---

### Technical notes (beyond base schema — implementation detail for dev/AI collaborators)

**Auth model:**
```
HILShell.init({ toolId: 'account', requireAuth: true, onAuth: (user) => { ... } })
  → any authenticated user reaches onAuth
  → no is_admin check — regular users, paid users, and admins all see the same panel
  → data is always scoped to user.uid — no cross-user reads
```

**Firestore index required:**
The ingestion history query needs this composite index or it will error:
```
Collection: staged_items
Fields: owner_uid (ASC), source (ASC), created_at (DESC)
```

**Checkout link (Plan & Billing → Upgrade):**
```js
window.open('https://hilsystem.lemonsqueezy.com/checkout/buy/2f3cdefe-a978-4e5c-b57c-705121c79409?embed=1&media=0&logo=0&desc=1&discount=0&checkout[custom][uid]=' + user.uid, '_blank');
```
`checkout[custom][uid]` passes the Firestore uid through to Lemon Squeezy so a
future webhook can match a completed purchase back to the right user doc —
that webhook is not built yet.

**Subscription tier gating (future):**
When Lemon Squeezy integration is complete:
- `users/{uid}.tier` = `"free" | "paid_1" | "paid_2"`
- This panel reads that field and adjusts the feature checklist and upgrade CTA
- HIL Inbox and PATCH features shown as "Active" for paid tiers
- No tier logic is enforced here — enforcement lives in Cloud Run and
  Firestore rules

**NAV_TOOLS entry (hil-shell.js):**
```javascript
{ id: 'account', label: 'Account', icon: '👤', href: './hil-account.html' },
```
Add before the `'admin'` entry so it appears in the main nav for all
signed-in users.
