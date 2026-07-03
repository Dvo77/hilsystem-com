## HIL Home Assistant Bridge

**File:** hil-ha-bridge.html (Code/HTML) + hil-ha-bridge.js + patch-ha-addition.js
**URL:** [TBD — Cloudflare Worker endpoint]
**Status:** Beta — core read/write working, deploy blocked on external URL decision (Nabu Casa vs. DDNS/reverse proxy vs. Tailscale) to let the Worker reach the homelab's Home Assistant instance from Cloudflare

**Purpose:** Connects PATCH to a user's Home Assistant instance so entities (lights, switches, sensors, anything HA tracks) can be checked or controlled through chat — "are the living room lights on," and turning them on/off directly from PATCH.

**Core Features:**
- Full read/write access to Home Assistant entities via long-lived access token
- PATCH can check the state of any entity ("are the lights on")
- PATCH can act on entities (turn lights/switches on or off)
- Designed to eventually merge HA's state data with HIL's spatial address data —
  HA knows a light is on, but has no idea where that light physically is;
  HIL's HL address grammar already solves that gap

**How it connects:**
- Reads from / writes to: user's Home Assistant instance via long-lived token,
  bridged through a Cloudflare Worker (patch-ha-addition.js)
- Entry point: PATCH agent conversation — no separate UI, it's a capability
  PATCH gains, not a standalone tool page
- Future cross-tool link: HL addresses (Vault/HIL spatial grammar) could tag
  HA entities with physical location, closing the "HA has no spatial context"
  gap — not yet built, but the natural next step

**Known limitations / not yet live:**
- External URL for the Worker-to-HA connection not yet finalized (Nabu Casa,
  DDNS/reverse proxy, or Tailscale — homelab is capable of any of these, just
  needs the decision confirmed)
- No spatial/HL-address linkage yet between HA entities and physical HIL
  locations — currently just entity state read/write, not location-aware

**Common questions this tool answers:**
- "Are the living room lights on?" → PATCH checks the entity state directly
  from Home Assistant.
- "Turn off the garage lights." → PATCH can act on the entity, not just report it.
- "Can PATCH control my smart home?" → Yes, any entity Home Assistant tracks
  can be checked or controlled through PATCH once the bridge is deployed.
