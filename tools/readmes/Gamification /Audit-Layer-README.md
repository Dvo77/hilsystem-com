## Gamification / Audit Layer

**File:** Spans three files (not a standalone tool) — `hil-admin-action/server.js` (`/trigger-audit`, `/submit-audit`), `hil-family-ledger.html` (AUDIT tab), `hil-vault.html` (post-save confirm bar)
**URL:** Lives inside Family Ledger — no dedicated URL of its own
**Status:** Planned — fully spec'd and written this session, nothing deployed yet (see `DEPLOY_STATE.md` for exact deploy status of each piece)

**Purpose:** Keeps HIL's inventory data honest over time by periodically asking users to confirm what's actually where, and rewarding honest self-reporting — good or bad — instead of letting the Vault quietly drift into fiction.

**Core Features:**
- **Trust Score** (0–100, per household member) — reflects how often a member's spot-check audits match what's actually recorded. Backend-generated only, never client-writable.
- **Spot-check audits** — system (or a person, manually for now) picks a zone or kit, the member reports what's actually present, the system scores the match and updates Trust Score.
- **Put-away confirm flow** — after saving an item in Vault, a one-tap prompt offers to confirm everything else in that zone or kit while the drawer/cabinet is already open. No separate walkthrough needed — piggybacks on things the person is already doing (e.g. putting away a Walmart/Amazon receipt haul into the pantry).
- **Annual "Don't Be a Fool" review** — items untouched for 24+ months get flagged for an explicit keep/let-go decision, routed into existing Museum/History Wall/Exchange pipelines.
- **Two-track badges** — accuracy badges for high scores, wry participation badges for consistent low scores (e.g. "We're Not Gonna Expect It to Be in the Right Place") so honest bad results are never punished, only fabricated ones are treated as a real problem.
- **Last-minute tidying counts as a real win** — if someone scrambles to put everything back right before an audit and gets a clean score, that's genuine effort, not an exploit. The only integrity concern is a score awarded without an actual audit behind it.

**How it connects:**
- Reads from: `users/{uid}/item_records` (to build the expected-items list for a scope), `users/{uid}/team_members` (for the member being audited)
- Writes to: `users/{uid}/audit_events` (one per audit, backend-only), `team_members/{id}.trust_score` (backend-only), `team_members/{id}/badges` (backend-only for audit-issued badges — same subcollection Family Ledger's cosmetic badges already use, distinguished by a `source_event_id` field)
- Entry points: "Run Spot Check" button on Family Ledger's AUDIT tab (manual, any time), or the post-save confirm bar in Vault (appears automatically after saving an item that has a zone or kit)
- Cross-tool data flow: Vault doesn't know which household member owns an item at save time — that assignment only happens in Family Ledger. So the Vault → Family Ledger deep link carries the zone/kit scope but not a member; Family Ledger fires the actual audit against whichever member gets selected next, rather than requiring Vault to guess.

**Known limitations / not yet live:**
- Nothing in this layer is deployed yet — endpoints are written but not pasted into the live `hil-admin-action` source (Cloud Shell), UI is written but not pushed live in Family Ledger or Vault, and the companion Firestore rules aren't merged in either. See `DEPLOY_STATE.md` for the exact per-piece status.
- Spot-check triggering is manual only right now — no scheduled/random-interval firing yet. "Surprise, any interval" cadence was the design intent but isn't wired up.
- Annual review threshold is fixed at 24 months, not yet configurable in any UI.
- Reward layer beyond badges (the `redeemable_for` field, $20 merch credit) is architected but nothing is actually redeemable yet — badges are earned but not yet spendable.
- Generosity Score, Reputation Network, and the HL Sign Art Contest are part of the same overall concept spec but out of scope for this build — not touched this session.

**Common questions this tool answers:**
- "Why does it want me to check the drawer again? I just put something in there." → Since you're already standing there, confirming the rest of the drawer takes a few extra seconds and saves you from a separate audit later.
- "I got a bad score, am I in trouble?" → No — honest bad scores earn a lighthearted participation badge, not a penalty. The only thing that matters is that the check was real.
- "Can I just say everything's fine without looking?" → You can, but there's no upside to it — a fabricated result doesn't help you and the whole point is catching drift, not passing a test.
- "What happens to stuff I haven't touched in years?" → Once a year, items untouched for 24+ months get flagged so you can explicitly decide to keep them or let them go (donate/sell/archive) instead of them just sitting there indefinitely.
- "Does this apply to the kids or just adults?" → Everyone in the household — Trust Score isn't kids-only, it's a universal accuracy reflection for whoever's doing the audit.
