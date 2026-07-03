# HIL System — Tool Documentation

## HIL Smart Home Hub

**File:** `hil-smart-home.html`
**URL:** `https://hilsystem.com/tools/hil-smart-home.html`
**Status:** Live (hub page) — Bridge tool in Beta pending Worker deploy

**Purpose:** The Smart Home hub is the routing page for all home automation tools in HIL System. It connects the HIL knowledge graph (what things are, where they are, what they mean) to Home Assistant's live sensor state — turning a basic smart home into one that can reason about itself spatially.

---

**Core Features:**
- Card grid routing to HA Bridge and Room Code Generator (live), plus four roadmap cards (coming soon)
- Live status strip at the top shows HA connection state, mapped entity count, and last sync time — populated from Firestore on load, goes green when connected
- Vision block at the bottom explains the "home brain" concept for new users
- Shell-integrated: inherits auth, nav, PATCH bubble, and design tokens from `hil-shell.js`
- requireAuth: false — public browse, sign in to connect

**Routed Tools:**

| Tool | File | Status |
|------|------|--------|
| HA Bridge | `hil-ha-bridge.html` | Beta — Worker deploy pending |
| Room Code Generator | `hl-room-code-generator.html` | Live |
| Fixed Points | — | Planned |
| Floor Plan Viewer | — | Planned |
| Energy Dashboard | — | Planned |
| HIL Maintain | `hil-maintain.html` | Parked — schema lockdown required first |

---

**How it connects:**
- Reads from: `users/{uid}/integrations/home_assistant` (Firestore) to populate status strip
- Writes to: Nothing directly — routes to child tools
- Entry points: Shell nav → Smart Home, direct URL
- The status strip checks Firestore on auth and updates dots live — no HA API call from this page
- HA Bridge child tool handles all HA communication

---

**Known limitations:**
- Status strip requires auth to show real data; shows dashes when signed out
- Roadmap cards are visual only — not clickable

---

---

## HIL Home Assistant Bridge

**File:** `hil-ha-bridge.html`
**URL:** `https://hilsystem.com/tools/hil-ha-bridge.html`
**Status:** Beta — frontend live, Cloudflare Worker (`hil-ha-bridge`) deploy pending

**Purpose:** Connects a user's Home Assistant instance to HIL System via the HA REST API. Maps HA entities to HL addresses so PATCH can answer live questions about the home ("are the bathroom lights on?", "how much solar are we generating?") grounded in spatial context from the HIL knowledge graph.

---

**Core Features:**

**Three-phase setup wizard:**
1. **Connect** — Enter HA external URL + long-lived access token. Test button verifies connection and returns entity count and HA version.
2. **Map Entities** — Full entity list from HA grouped by category (Lights, Climate, Sensors, etc.). Each entity can be mapped to either a fixed point (by HL address) or a Vault item (by Firestore document ID). Entity state dot shows live on/off/unavailable status during mapping.
3. **Sync** — Saves config and runs first sync. Shows synced count, errors, and timestamp.

**Entity categories surfaced:** Lights, Switches, Sensors, Binary Sensors, Climate/HVAC, Covers/Blinds, Locks, Fans, Media Players, Weather, Energy/Solar, People, Security, Automations.

**Two mapping types:**
- `fixed_point` — maps to an HL address (outlet, switch, light fixture, circuit). Writes `live_state` and `live_attributes` to the `fixed_points` document.
- `item_record` — maps to a Vault item (appliance, device). Writes `maintenance.last_known_state` and `last_state_change` to the `item_records` document.

**HL grammar naming standard:** HA entity IDs follow the HL grammar when named correctly: `light.sh_lr_s2_a1` = Structure SH, Zone LR, Wall S, Position 2, Level A. This is the same standard published at `hlsystem.org` as a free open standard.

---

**How it connects:**
- Reads from: User's Home Assistant instance via HA REST API (`/api/states`, `/api/config`)
- Reads from: `users/{uid}/integrations/home_assistant` (Firestore) — loads saved config on open
- Writes to: `users/{uid}/integrations/home_assistant` — connection config, entity map (JSON), last sync timestamp
- Writes to: `users/{uid}/item_records/{itemId}` — `maintenance.last_known_state`, `last_state_change`
- Writes to: `users/{uid}/properties/{propId}/fixed_points/{pointId}` — `live_state`, `live_attributes`
- Writes to: `ha_linked_users/{uid}` — platform-level index so cron can find linked users
- Backend: `hil-ha-bridge` Cloudflare Worker proxies all HA API calls (avoids CORS, keeps HA token server-side)
- PATCH integration: Worker `/query-entity` endpoint lets PATCH query live entity state by entity ID or HL address

**Entry points:** Shell nav → Smart Home → HA Bridge card, direct URL.

---

**Backend Worker — `hil-ha-bridge` (Cloudflare Worker):**

**Endpoints:**
- `POST /test-connection` — verifies HA URL + token, returns entity count and HA version
- `POST /fetch-entities` — returns full entity list filtered to relevant domains, shaped for mapping UI
- `POST /save-config` — writes HA config + entity map to Firestore, registers user in `ha_linked_users` index
- `POST /sync` — loads saved config, fetches all HA states, writes live state to mapped Firestore documents
- `POST /query-entity` — PATCH-facing endpoint: returns live state of a specific entity by ID or HL address
- `GET /health` — worker health check

**Scheduled cron:** Optional cron trigger (every 6 hours) syncs all linked users automatically.

**Required Worker secrets:**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (same service account as `hil-patch-agent`)
- `WORKER_SECRET` (shared secret for frontend auth)

---

**Known limitations / not yet live:**
- Worker is built but not yet deployed — frontend points to `hil-ha-bridge.dvo77.workers.dev` which doesn't exist until Worker is created in Cloudflare dashboard
- `WORKER_SECRET` placeholder in the HTML must be replaced with actual secret before use
- HA instance must be reachable from the internet (not just local network) for the Worker to reach it — requires Nabu Casa, DDNS, or reverse proxy
- HA token is stored in Firestore as plaintext — encryption planned for v2
- Sync is one-directional (HIL reads HA state) — bidirectional control (PATCH turning lights on/off) is planned but not built
- HACS (Home Assistant Community Store) integration is on the roadmap — would push state proactively from HA rather than HIL polling

---

**Common questions this tool answers:**

- "Can PATCH tell me if my lights are on?" → Yes, once the HA Bridge is connected and entities are mapped. PATCH queries the `/query-entity` endpoint on the bridge Worker for live state.
- "Do I need Nabu Casa for this to work?" → You need your HA instance reachable from the internet. Nabu Casa is the easiest path. DDNS + port forward or Tailscale also work.
- "Where do I get the long-lived access token?" → In Home Assistant: Profile → Security → Long-Lived Access Tokens → Create Token.
- "What's the difference between mapping to a fixed point vs a Vault item?" → Fixed point = the physical location (the outlet, the switch, the fixture). Vault item = the thing plugged in or installed there (the dishwasher, the lamp). Map the entity to whichever makes more sense for how you'll query it.
- "Can PATCH turn my lights on?" → Not yet. The current bridge is read-only — it can tell you state but can't send commands. Write/control capability is on the roadmap.
- "Will this work with my solar system?" → Yes if HA has your solar inverter integrated (Victron, Enphase, SolarEdge all have HA integrations). Map the relevant sensor entities to HIL items or fixed points and PATCH can answer questions about solar yield, battery state, and grid draw.
- "How often does it sync?" → On-demand when you click Sync Now, or automatically every 6 hours if the cron trigger is enabled on the Worker.
- "Is my HA token safe?" → It's stored in your Firestore document (protected by your HIL auth). It's not exposed in the frontend. Encryption at rest is planned for v2.
