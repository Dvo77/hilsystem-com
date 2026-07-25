## HIL Landing Page

**File:** index.html
**URL:** hilsystem.com
**Status:** Live

**Purpose:** The public front door to HIL. Explains what HIL is, what's public
vs. what requires an account, and routes visitors into the right area —
without requiring sign-in to understand or browse the platform.

**Core Features:**
- **Hero** — plain-language positioning ("Know what you have. Know where it
  is. Know what it means.") with two entry points: Enter HIL (sign in/hub)
  and Explore the System (scrolls down, no account needed)
- **What HIL Does** — four-card overview: Organize, Preserve, Learn & Build,
  Connect & Use — the top-level mental model for the whole platform
- **One Object Across HIL** — a single example item (cordless drill) shown
  connected to location, vessel, kit, owner, receipt, maintenance, insurance,
  a Guild project, and a possible Exchange listing — demonstrates that one
  object can carry many kinds of records at once
- **Explore the System** — six cards linking to the real tools: Vault &
  Spatial System, Family Ledger, Museum & History, HIL Guild, HIL Exchange,
  Reports & Household Systems
- **Public or Private** — explicit two-column breakdown of what's private by
  default vs. shared deliberately, plus the "no advertising-driven household
  profiling" statement
- **Browse First** — public-browse cards for Exchange, History Wall, and
  Museum, with correct wording: browsing is open, posting/creating requires
  registration
- **HIL Guild overview** — observe/predict/test/measure/reflect/iterate loop,
  three example modules (Electric Forge, Foundations, Weather Spotters), and
  an explicit "not just for kids" clarification
- **Open HL System** — explains the HL address grammar as separable from the
  HIL platform, with a live example address and a link out to hlsystem.org
- **The Story** — shortened Dr. Piper / Old Granddad Cabinet origin story
- **Pricing & Participation** — placeholder-safe language (no hard-coded
  price), states core tools are included and terms are shown before
  registration
- **Final CTA** — Enter HIL / Browse Public HIL / link to the HL grammar docs

**How it connects:**
- Reads from: nothing — fully static HTML/CSS, no Firestore calls
- Writes to: nothing
- Entry points: this IS the entry point — every link routes to a real tool
  page (`tools/hil-hub.html`, `tools/hil-exchange.html`,
  `tools/history-wall.html`, `tools/hil-museum.html`, `tools/hil-guild.html`,
  `tools/hil-family-ledger.html`, `tools/hil-insurance-report.html`,
  `tools/hil-smart-home.html`, `tools/hl-vault-cloud.html`,
  `tools/hil-room-visualizer.html`, `tools/hil-kit-builder.html`,
  `tools/hil-vessel-builder.html`, `tools/hil-label-studio.html`)
- Sign In and Enter HIL both currently point to `tools/hil-hub.html` — there
  is no separate dedicated sign-in page; the hub's own auth gate handles it
- Does not use `HILShell.init()` — this page intentionally has no auth gate,
  since it must be readable by signed-out visitors

**Known limitations / not yet live:**
- "HIL Vault" as a labeled concept links to `hl-vault-cloud.html` — the file
  itself isn't named `hil-vault.html`; if the product name ever changes on
  this page, the link target needs to move with it
- Room Detail, Vessel Builder, and Smart Home each have a duplicate `-v1`
  file still in the repo alongside the canonical version — landing page
  links to the non-`-v1` file in each case; confirm this is still correct
  if either tool gets rebuilt
- Public Museum card assumes a public-facing surface exists and is stable —
  `hil-museum.html` has no README yet, so this can't be independently
  confirmed as fully live
- No pricing figure is shown anywhere on the page (Lemon Squeezy store is
  still in Test Mode) — page intentionally uses placeholder language
  ("clear limits and costs shown before registration") until pricing and
  billing are both confirmed live
- League/Sports tools are not linked anywhere on this page — not shipped yet

**Common questions this tool answers:**
- "Do I need an account to use HIL?" → No, not to browse. Public areas
  (Exchange listings, History Wall, public Museum pages) can be viewed by
  anyone. An account is required to create, save, post, list, join, or
  participate.
- "What is HIL, in plain terms?" → A household operating system that
  connects objects, locations, people, projects, and stories — not just an
  inventory app.
- "What does HIL stand for?" → Home Inventory Locator.
- "Is my inventory private?" → Yes, by default. Rooms, item records, kits,
  vessels, receipts, insurance info, and learning evidence are private to
  your account unless you deliberately share something (a Museum entry, a
  History Wall post, an Exchange listing).
- "Can anyone post on the History Wall?" → Anyone can browse approved public
  entries. Submitting or publishing an entry requires registration.
- "Is HIL Guild just for kids?" → No — it's age-agnostic and project-based,
  and it doesn't replace professional educational, trade, or safety
  instruction.
- "What's the difference between HL and HIL?" → HL is the underlying spatial
  address grammar (e.g. `MH-KT-N3-A0`) and can be used on its own. HIL is the
  full platform — accounts, tools, and services — built around it.
- "How much does HIL cost?" → Not yet published on the landing page; pricing
  and billing are still being finalized.
