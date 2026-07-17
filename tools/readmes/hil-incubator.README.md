## HIL Incubator — Wiki Generator & Onboarding Tool

**File:** `hil-incubator-generator.html`
**URL:** `hilsystem.com/tools/wiki-generator` *(or hosted on Incubator Wiki.js instance)*
**Status:** Beta

**Purpose:** Three-step onboarding flow that collects user identity and tier structure, then generates STD-WIKI-001 compliant markdown pages — starting with the user's personal T-0 master index, then any subsequent wiki pages. Companion to the HIL Incubator (Wiki.js hosted knowledge system for Guild members).

---

**Core Features:**
- Step 1 — Identity: collects name, handle, one-liner, GitHub repo URL, and wiki base URL; all fields flow downstream into every generated page automatically — user never re-enters their name
- Step 2 — Tier Picker: 12 pre-built domain tiles (Workshop, Digital, Projects, Homestead, Collections, Learning, Health, Woodcraft, Research, Fine Arts, Business, Life Manual) plus custom tier builder; unchecked tiers are hidden from output entirely
- Step 3 — Generator with two tabs:
  - **T-0 Home Page tab:** auto-generates the user's personal Mission Control master index immediately on arrival, pre-filled from setup; includes tier navigation table, standards links, HL grammar quick reference, and change log; ready to paste into Wiki.js home page
  - **New Wiki Page tab:** produces STD-WIKI-001 compliant pages for any asset, project, process, location, competency, or reference; tier select is pre-populated from the user's chosen tiers; owner/handle/GitHub pre-filled throughout
- All output is plain markdown with YAML frontmatter — works in Wiki.js, Obsidian, Notion, or a text editor
- Copy-to-clipboard on all output
- Status bar shows tag count, HL address presence, line count, and STD-WIKI-001 compliance signal

**Companion tools:**
- `hil-incubator-wiki-home.html` — the static Wiki.js welcome/orientation page new users see on first login (separate from this generator)
- MaxNet Archival & Deprecation Prompt — companion AI prompt for retiring pages (DEPRECATE / ARCHIVE operations); planned as Tab 3 in this tool

**How it connects:**
- Reads from: nothing — fully self-contained, no Firebase or API calls
- Writes to: nothing — output is markdown the user pastes manually into Wiki.js
- Entry points: linked from the Incubator Wiki.js home page (`/start/first-asset`, `/start/life-manual` etc.), and from HIL Guild onboarding flow
- Cross-tool: generated T-0 pages reference `hilsystem.com/tools/wiki-generator` and `spatialvectorgrammar.org` as standard resources; GitHub repo field links back to user's own backup repo

**Page lifecycle this tool covers:**
- CREATE → this generator (T-0 tab or New Page tab)
- UPDATE → user edits page directly in Wiki.js
- DEPRECATE / ARCHIVE → companion AI prompt (Tab 3, planned)

**Known limitations / not yet built:**
- Tab 3 (Retire a Page) — paste-in existing markdown + DEPRECATE/ARCHIVE operation — designed, not yet coded
- No user accounts or saved state — each session starts fresh; closing the tab loses setup inputs
- T-0 tier table links use a simple slug pattern (`/tier-name-slug`) — user needs to manually correct paths if their Wiki.js structure differs
- No HL address validator — user can enter any string in the HL Address field; grammar enforcement is on the honor system
- No photo upload or R2 integration — page generator is markdown-only; photos are added separately in Wiki.js
- Grammar version hardcoded as v5.3 in output frontmatter — update manually when grammar advances

**Common questions this tool answers:**
- "How do I get started — I don't know what my first page should be?" → Step 2 picks your tiers, Step 3 auto-generates your T-0 home page instantly. That's your first page.
- "Do I have to fill everything in?" → Name, handle, and GitHub repo are required. Everything else — model, serial, HL address, story — is optional and can be added later.
- "What's a T-0?" → Your master index. The root document of your wiki. Every other page links back to it. The generator produces it for you in under two minutes.
- "Can I use this without a Wiki.js account?" → Yes — the generator outputs plain markdown. Paste it anywhere: Wiki.js, Obsidian, Notion, a GitHub repo, a plain text file.
- "What's the difference between DEPRECATE and ARCHIVE?" → Deprecate = still here, might come back, has reference value. Archive = gone permanently, read-only history. Both operations are handled by the companion AI prompt (Tab 3 when built).
- "Will the pages work with AI?" → Yes. Every page includes a structured `ai_summary` field in the frontmatter and follows a consistent section schema. Any RAG system can parse and route from these pages without re-explanation.

---

#### Change Log

| Version | Date | Owner | Description |
|:--:|:--:|:--:|:--|
| **1.0.0** | 2026-07-16 | DVO77 | Initial build — three-step onboarding flow, T-0 generator, New Page generator; 12 preset tiers + custom tier builder; full STD-WIKI-001 output |
