## HIL Shell

**File:** `tools/hil-shell.js`
**URL:** Loaded by every tool at `hilsystem.com/tools/`
**Version:** v2.4
**Status:** Live

**Purpose:** The universal app shell for all HIL System tools. Provides Firebase auth, Firestore user record initialization, fixed header, tool nav bar, auth gate overlay, toast notifications, design tokens, CSS variables, and the PATCH AI chat bubble — all in a single drop-in script. Every tool on hilsystem.com loads this file. Nothing ships without it.

**Core Features:**
- Google, GitHub, and email/password authentication (Firebase Auth)
- Firestore user record auto-created on first login (`users/{uid}`)
- Fixed header with HIL logo, tool name, user avatar, and sign-out button
- Horizontal scrollable tool nav bar with active state per tool
- Auth gate overlay — blocks tool access until signed in (configurable)
- Toast notification system (success / error / warning / info)
- PATCH AI chat bubble — floating, persistent, available on every tool page
- PATCH persistent cross-session memory (reads/writes `users/{uid}/patch_memory/session`)
- PATCH multi-turn conversation history (full session thread sent to Gemini each call)
- `!!BUG` / `!!TODO` / `!!IDEA` prefix detection → logs to `platform/owner_issues` in Firestore
- Full HIL design token system (CSS variables, fonts, colors) injected globally

**Drop-in pattern (3 lines per tool):**
```html
<script src="./hil-shell.js"></script>
<script>
  HILShell.init({
    toolId:      'vault',
    toolName:    'HL Vault',
    requireAuth: true,
    onAuth: (user) => { /* tool boot logic here */ }
  });
</script>
```

**How it connects:**
- Reads from: `users/{uid}` (user record), `users/{uid}/patch_memory/session` (PATCH memory)
- Writes to: `users/{uid}` (user record init on login), `users/{uid}/patch_memory/session` (PATCH memory after each response), `platform/owner_issues` (!! issue logging via Worker)
- Calls: `hil-patch-agent.dvo77.workers.dev/ask` (PATCH Worker) on every chat message
- Entry points: loaded directly by every tool HTML file via `<script src="./hil-shell.js">`
- Cross-tool: shell state (`currentUser`, `db`, `auth`) exposed on `window` — all tools reference `window.currentUser` for uid

**Design tokens (CSS variables injected globally):**
- Colors: `--hil-green` `#00cc66`, `--hil-amber` `#cc8800`, `--hil-danger` `#cc3333`, `--hil-bg` `#0a0c0b`
- Fonts: `--font-display` Orbitron, `--font-mono` Space Mono, `--font-ui` Barlow Condensed, `--font-body` Barlow
- Layout: `--hil-shell-h` 56px header, `--hil-nav-h` 40px nav, `--hil-offset` 96px body padding-top

**Public API (`window.HILShell`):**
- `HILShell.init(config)` — boots the shell, call once per tool
- `HILShell.toast(message, type, duration)` — show a toast from any tool
- `HILShell.getUser()` — returns current Firebase user or null
- `HILShell.getDb()` — returns Firestore instance
- `HILShell.getAuth()` — returns Firebase Auth instance

**Known limitations / not yet live:**
- `requireAuth: false` option exists but most tools don't use it — all tools currently require sign-in
- PATCH memory compression uses a second Gemini call per response (minor token cost per exchange)
- Chat session history clears on page reload — only the compressed summary persists across sessions
- `platform/owner_issues` write is owner-only by convention, not yet enforced by Firestore rules (dev mode rules still open)
- Shell migration debt: `hil-admin`, `hil-incubator-generator`, `hil-stain-lookup`, Library Hub, and general Hub not yet on Shell v2.4 — still on older shell versions

**Tools confirmed on this shell (v2.4):**
HL Vault, Museum, Family Ledger, Exchange, Field Tool, Label Studio, Library Hub, HIL Organize, HIL Restore, HIL Supply, Room Code Generator, Import/Export, HIL Hub

**Intentional exception:**
`hil-field-tool` uses purpose-built mobile bottom-tab nav — does not use shell nav bar but does use shell auth and PATCH bubble.

**Common questions this tool answers:**
- "Why do I have to sign in every time?" → You don't — auth persists via Firebase session. If it's asking again, try clearing your browser cache or check if you're in incognito mode.
- "PATCH keeps forgetting who I am" → PATCH memory is stored in Firestore and loads on sign-in. If it's not remembering, check that you're signed into the same account and that `patch_memory/session` exists in your Firestore user record.
- "How do I log a bug from the chat?" → Type `!!BUG` followed by your description in the PATCH chat box. It logs automatically and confirms with an issue ID.
- "Can I use HIL tools without signing in?" → Not currently — all tools require auth. A limited public view is planned for future.
- "The nav bar doesn't show my tool as active" → Make sure `toolId` in `HILShell.init()` matches the `id` in the NAV_TOOLS list inside the shell.

**Firestore rules needed:**
```javascript
// patch_memory — user-scoped read/write
match /users/{uid}/patch_memory/session {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```
*(Currently covered by dev-mode wildcard rule — needs explicit rule before security lockdown)*

**Change log:**
- v2.4 — Persistent PATCH memory (Firestore), multi-turn history, !! issue logging
- v2.3 — Added PATCH AI chat bubble (Gemini 2.5 Flash, session history)
- v2.2 — Corrected nav filenames, added Exchange, Import/Export, Library Hub, Organize, Restore, Supply, Stain Lookup
- v2.1 — Added Family Ledger and HIL Hub to nav
- v2.0 — Google + GitHub + Email auth, Firestore user record init
