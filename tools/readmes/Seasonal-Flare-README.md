## Seasonal Flare

**File:** hil-shell.js (shell-level feature, not a standalone tool) — admin controls live in hil-admin.html
**URL:** N/A — no dedicated page; fires automatically on sign-in across every Shell-wrapped tool
**Status:** Live

**Purpose:** A 30-second decorative particle effect that plays once per day on sign-in, keyed to the calendar — snow in winter, falling leaves in fall, hearts for Valentine's, shamrocks for St. Patrick's Day, fireworks for July 4th, and balloons on a stored birthday (the signed-in user's own, or any household team member's). Meant to feel like a small surprise, not a persistent decoration.

**Core Features:**
- Calendar-based effect lookup — no weather API involved:
  - Birthday match (signed-in user or any household team member) → balloons 🎈
  - St. Patrick's Day (Mar 17) → shamrocks 🍀
  - July 4th (Jul 4) → fireworks 🎆🎇✨
  - Valentine's window (Feb 10–14) → hearts 💚💛
  - Winter (Dec–Jan) → snow ❄
  - Fall (Sep 22–Nov 30) → leaves 🍁🍂
- Renders as a full-screen canvas overlay (click-through, doesn't block the page), particles drift up or down with sway motion, effect self-removes after exactly 30 seconds
- Fires at most once per calendar day per browser tab session (won't replay if you navigate between tools, but will fire again the next day or in a fresh tab)
- If it's a team member's birthday (not the signed-in user's own), shows a "🎈 Happy Birthday, {name}!" toast alongside the balloons
- Platform-wide kill switch and per-user opt-out (see below)

**How it connects:**
- Reads from:
  - `users/{uid}.birthday` — signed-in user's own birthday, MM-DD string (e.g. "07-04")
  - `users/{uid}.preferences.seasonal_flair_enabled` — per-user opt-out, default true
  - `users/{uid}/team_members/{memberId}.birthday` — household member (family + pet) birthdays, MM-DD string
  - `platform/config.seasonal_flare_enabled` — platform-wide kill switch; any value other than exactly `false` (including the field not existing) is treated as on
- Writes to:
  - `users/{uid}.birthday` — set to `null` on first account creation only; never overwritten by the shell on later logins (only a human editing it in Admin changes it after that)
  - `users/{uid}.preferences.seasonal_flair_enabled` — set to `true` on first creation only if not already present, so an opt-out sticks
  - Both fields are also editable directly in hil-admin.html's Seasonal Flair module (own birthday + toggle) and the Edit Team Member modal (birthday for family/pets)
- Entry points: no user-facing entry point — it's a side effect of `HILShell.init()` firing on any tool after successful sign-in. The only visible UI is the Seasonal Flair module in Admin (toggle + birthday field) and the Birthday field in Edit Team Member.
- Cross-tool data flow: because this lives in `hil-shell.js` itself, every tool that uses the standard shell drop-in gets this automatically — no per-tool wiring needed.

**Known limitations / not yet live:**
- No platform-wide kill switch UI exists yet in hil-admin.html — the shell reads `platform/config.seasonal_flare_enabled` and will respect it if set, but there's currently no button to flip it. Queued.
- Birthday only stores month/day, never a year — there's no "how old are they turning" logic, just a yes/no match against today's date.
- Household team member birthdays only fire for whoever is actually signed in and viewing their own `team_members` subcollection — if two people have separate HIL accounts, they don't see each other's team member lists (no linked/shared household accounts yet — this is an open architectural question, not yet scoped).
- The admin panel's "current season effect" preview (`currentSeasonLabel()` in hil-admin.html) is a hand-mirrored copy of the real effect logic (`resolveSeasonalEffect()` in hil-shell.js) — if a new holiday/effect is added to one, it must be manually added to the other or the preview will drift out of sync with actual behavior.
- No UI exists for a user to set their own birthday outside the Admin panel (e.g. no profile/settings page) — right now Admin is the only place to set it.

**Common questions this tool answers:**
- "Why did I get balloons/confetti when I signed in?" → It's your birthday (or a household member's), or a holiday like July 4th or St. Patrick's Day — Seasonal Flare plays a short 30-second effect once a day based on the calendar.
- "Can I turn that off?" → Yes, there's a per-user toggle in Admin (Seasonal Flair section) — flipping it off stops the effect for just your account.
- "How do I get my kid's birthday to show balloons?" → Add their birthday in the Edit Team Member modal in Admin — the day and month are what matter, not the year.
- "I signed in again and didn't see the effect the second time — is it broken?" → No, it only plays once per day per browser session so it doesn't get repetitive. It'll show again tomorrow, or in a new tab today.
- "Does this use real weather data for snow?" → No — it's calendar-based only (Dec–Jan triggers snow, for example), not tied to your actual local weather.
