# HIL System — Tool Documentation

## HIL Library Hub

**File:** `hil-library-hub.html`
**URL:** `https://hilsystem.com/tools/hil-library-hub.html`
**Status:** Live

**Purpose:** The Library Hub is the knowledge layer of HIL System — six bodies of household science that give users the principles behind owning, maintaining, and restoring a home rather than just tracking things in it. It is a routing page for the six Library tools, not a tool itself.

---

**Core Features:**
- Card grid routing to all six Library tools with live/coming-soon status
- Expand panels on L02 Organize and L03 Restore / L04 Supply show inline content (ingredient lists, capability prompt, DIY matrix) without leaving the page
- Copy-to-clipboard button for the HIL Organize AI Capability Analyzer prompt
- Tool Belt row at the bottom links to every major HIL tool
- Ellen Swallow Richards attribution — sets the academic framing for the Library as applied household science, not branded cleaning advice
- Shell-integrated: inherits auth, nav, PATCH bubble, and design tokens from `hil-shell.js`

**The Six Libraries:**

| # | Name | Status | What it covers |
|---|------|--------|---------------|
| L01 | HIL Clean | Live | 10 raw ingredients replace 40+ branded products. Surfactants, disinfection, abrasives, solvents. |
| L02 | HIL Organize | Live | 28 standard kits, 3 skill tiers. AI Capability Analyzer prompt included. |
| L03 | HIL Restore | Live | 5 base ingredients. Rust, cast iron, leather, wood, tool handles. Pre-1970 tool quality guide. |
| L04 | HIL Supply | Live | 6-tier acquisition guide. $100 full homeowner kit. DIY vs Hire matrix. |
| L05 | HIL Build | Planned | Kit gap finder and capability unlock tree — what you can do with what you own. |
| L06 | HIL Maintain | Planned | Seasonal maintenance schedules tied to HIL addresses. Skip-cost calculator. HA sensor integration (future). |

---

**How it connects:**
- Reads from: Nothing — this is a static routing page with no Firestore reads
- Writes to: Nothing
- Entry points: Shell nav → Library, Hub tool belt, direct URL
- L01 Clean routes to `hil-stain-lookup.html`
- L02 Organize routes to `hil-organize.html`
- L03 Restore routes to `hil-restore.html`
- L04 Supply routes to `hil-supply.html`
- L05 Build and L06 Maintain are coming-soon cards — not clickable
- HIL Maintain (L06) will eventually connect to the HA Bridge for sensor-triggered maintenance reminders

---

**Known limitations / not yet live:**
- L05 HIL Build — not yet built
- L06 HIL Maintain — frontend exists in a separate file but is parked pending Firestore schema lockdown; not linked here yet
- Library Hub itself has no search or filter — it's a flat card grid; scale is currently small enough that this isn't needed
- The Tool Belt row and expand panels are hardcoded — no dynamic data

---

**Common questions this tool answers:**

- "What's in the HIL Library?" → Six knowledge modules covering cleaning chemistry, kit organization, restoration, intentional purchasing, capability analysis, and scheduled maintenance. Four are live, two are in development.
- "Is this like a cleaning product recommendation site?" → No — it's the opposite. It teaches you the 10 raw ingredients that replace 40+ branded products, and explains the science behind why they work.
- "How do I know what I can do with the tools I own?" → Open HIL Organize (L02) and use the AI Capability Analyzer prompt — copy it from the Library Hub and paste into any AI.
- "What's HIL Maintain and when is it coming?" → It's the scheduled care module that ties maintenance reminders to your actual HIL addresses and eventually to Home Assistant sensor triggers. It's in development — parked until the Firestore schema is locked.
- "Does the Library connect to my Vault?" → Not directly — the Library is knowledge content, not inventory data. The tools it routes to (Organize, Restore, Supply) inform how you use your Vault, but there's no live data link.
