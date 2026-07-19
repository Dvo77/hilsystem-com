/**
 * HIL SHELL v2.14
 * Universal shell for all HIL/HL tools
 * Provides: Firebase init, Auth (Google + GitHub + Email), Firestore user record,
 *           fixed header, tool nav bar, auth gate overlay, toast system, CSS design tokens,
 *           PATCH AI chat bubble with persistent cross-session memory + !! issue logging,
 *           Seasonal Flare (calendar-based particle overlay on sign-in),
 *           Patch & Scratch shared bot component (mood-state cards any module can drop in),
 *           Guild Media Viewer (single-asset popup) + Guild Media Library
 *           (standing "browse everything" panel, header MEDIA button) +
 *           tag-driven auto-display via HILShell.media.renderForConcept()
 *
 * DROP-IN PATTERN (one line in any tool):
 *   <script src="./hil-shell.js"></script>
 *   <script>
 *     HILShell.init({ toolId: 'vault', toolName: 'HL Vault', requireAuth: true, onAuth: (user) => { ... } });
 *   </script>
 *
 * DEPLOY PATH: hilsystem-com/tools/hil-shell.js
 * LIVE URL:    https://hilsystem.com/tools/hil-shell.js
 *
 * CHANGELOG:
 *   v2.14 — Guild Media Library panel: header "🖼 MEDIA" button (every page,
 *          shell-level, no per-page wiring) opens HILShell.media.openLibrary()
 *          — a standing grid of every active guild_media asset, independent
 *          of any page's concept tags. Click a thumbnail to open the existing
 *          single-asset viewer on top of it. Added as a more robust fallback
 *          entry point after renderForConcept() proved hard to debug live
 *          (network-level request blocking on one user's setup masqueraded
 *          as a permissions error) — the library panel surfaces its own
 *          errors visibly in the panel body instead of failing silently,
 *          unlike renderForConcept() which intentionally stays quiet on zero
 *          matches (now logs to console instead, for debugging).
 *   v2.13 — HILShell.media.renderForConcept(conceptSlug, targetElId, opts):
 *          module pages declare a concept slug once and point at an empty
 *          container; queries guild_media where related_concepts
 *          array-contains that slug and status=='active', renders up to
 *          6 (default) clickable thumbnail cards (.hil-media-strip). New
 *          admin uploads tagged with the same concept appear automatically —
 *          no asset_id ever hardcoded into a module page. Renders nothing
 *          (not an error) if no matches yet. Also fixed HILShell.media.open()
 *          — was calling the namespaced/compat Firestore syntax
 *          (db.collection().doc().get()) against a modular SDK instance,
 *          which would have thrown at runtime; now uses the same dynamic
 *          import(getFirestore/doc/getDoc) pattern as the rest of the file.
 *          Both media.open() and media.renderForConcept() now await
 *          waitForFirebaseApp() first — HILShell.init() boots Firebase
 *          asynchronously without blocking the caller, so a <script> tag
 *          placed right after init() (the documented drop-in pattern, used
 *          e.g. in hil-smart-home.html) could otherwise call either function
 *          before firebaseApp exists and throw.
 *   v2.12 — Guild Media Viewer: shared modal (#hil-media-viewer) + HILShell.media
 *          .open(assetId)/.close()/.cardHTML(assetId,label) API. Fetches
 *          guild_media/{assetId} from Firestore, resolves R2 URL via
 *          assets.hilsystem.com, switches render mode on file.mime_type
 *          (img/video/embed). Click-delegated .hil-media-card trigger so
 *          PATCH's chat can inject "View: [title]" cards dynamically without
 *          per-message event wiring. Does NOT render media inline in chat —
 *          always opens in the popup, per Dan's explicit call.
 *   v2.11 — Added Kit Builder to nav (id: 'kit-builder', ./hil-kit-builder.html),
 *           promoted out of Vault's lightweight Kits tab the same way Vessels was.
 *           Vault's own Kits tab is untouched — still a live, working, frontend-direct
 *           quick-add. Kit Builder is the fuller workflow (item verification, vessel
 *           assignment) — both write to the same users/{uid}/kits collection.
 *   v2.10 — Added Vessel Builder to nav (id: 'vessel-builder', ./hil-vessel-builder.html).
 *   v2.9 — Patch & Scratch shared bot component. One .bot CSS block (safe/
 *          caution/danger reuse existing green/amber/danger tokens) + three
 *          JS helpers: HILShell.bot.render(container, {character, state, line}),
 *          .setState(state, target?), .setLine(target, line). Any module just
 *          calls these — no module ever writes its own Patch/Scratch CSS.
 *          Real sprite art slots into .bot__avatar background-image per
 *          state/character when PNGs are ready (see commented hooks in CSS).
 *   v2.8 — Seasonal Flare: added St. Patrick's Day (shamrocks, Mar 17) and
 *          July 4th (fireworks, Jul 4) as single-day holiday effects. Mirror
 *          the check in hil-admin.html's currentSeasonLabel() if you add more.
 *   v2.7 — Seasonal Flare now also checks household team_members (family + pets,
 *          users/{uid}/team_members) for a birthday match, not just the signed-in
 *          user's own. Triggers balloons + a "Happy Birthday, {name}!" toast for
 *          whoever's birthday it is. Reads only the owner's own subtree — no new
 *          security rules required.
 *   v2.6 — Seasonal Flare: 30s calendar-based particle overlay on sign-in
 *          (snow Dec–Jan, leaves fall, hearts Valentine's, balloons on stored
 *          birthday). Platform kill switch (platform/config.seasonal_flare_enabled)
 *          + per-user opt-out (users/{uid}.preferences.seasonal_flair_enabled,
 *          default true — field path matches the live hil-admin.html toggle).
 *          Adds `birthday` (MM-DD string) field to user doc, populated null on
 *          create, never overwritten once set.
 *   v2.5 — Auth gate is now always built, not just for requireAuth:true tools.
 *           Fixes requireAuth:false tools (public browse, sign in to act — e.g. Exchange)
 *           having no working sign-in trigger at all. Gate still only auto-opens on
 *           load for requireAuth:true tools; requireAuth:false tools open it manually.
 *   v2.4 — Persistent cross-session PATCH memory (Firestore patch_memory/session)
 *           Multi-turn conversation history sent to Gemini each call
 *           !! prefix → logs owner issue to platform/owner_issues in Firestore
 *   v2.3 — Added PATCH AI chat bubble (floating, session history, Gemini 2.5 Flash backend)
 *   v2.2 — Corrected nav filenames, added exchange, import-export, library-hub, etc.
 *   v2.1 — Added Family Ledger and HIL Hub to nav
 *   v2.0 — Google + GitHub + Email auth, Firestore user record init
 */

(function () {
  'use strict';

  // ─── FIREBASE CONFIG ────────────────────────────────────────────────────────
  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyARjQ3kD8iz9rD-2Fl1zNASnlVDmvDeVb4",
    authDomain:        "project-97444efa-3b6f-493b-b96.firebaseapp.com",
    projectId:         "project-97444efa-3b6f-493b-b96",
    storageBucket:     "project-97444efa-3b6f-493b-b96.firebasestorage.app",
    messagingSenderId: "937314472168",
    appId:             "1:937314472168:web:5ad7b916ac01a9e649b95d"
  };

  const FB_VER  = '10.12.0';
  const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VER}`;

  // ─── PATCH AGENT URL ────────────────────────────────────────────────────────
  const PATCH_AGENT_URL = 'https://hil-patch-agent.dvo77.workers.dev/ask';

  // ─── SEASONAL FLARE ─────────────────────────────────────────────────────────
  // Calendar-based only — no weather API. Checked in priority order:
  // birthday (exact match) > single-day holidays > Valentine's window > winter > fall.
  // Each entry: particle glyphs + per-particle motion tuning.
  const SEASONAL_FLARE_DURATION_MS = 30000;

  const SEASONAL_EFFECTS = {
    balloons:  { glyphs: ['🎈'],             count: 22, drift: 'up',   sizeMin: 22, sizeMax: 38, speedMin: 40, speedMax: 90,  sway: 30 },
    hearts:    { glyphs: ['💚', '💛'],       count: 26, drift: 'down', sizeMin: 14, sizeMax: 26, speedMin: 30, speedMax: 70,  sway: 20 },
    snow:      { glyphs: ['❄'],             count: 60, drift: 'down', sizeMin: 8,  sizeMax: 18, speedMin: 20, speedMax: 55,  sway: 40 },
    leaves:    { glyphs: ['🍁', '🍂'],       count: 34, drift: 'down', sizeMin: 14, sizeMax: 24, speedMin: 25, speedMax: 60,  sway: 50 },
    shamrocks: { glyphs: ['🍀'],             count: 30, drift: 'down', sizeMin: 14, sizeMax: 24, speedMin: 25, speedMax: 55, sway: 35 },
    fireworks: { glyphs: ['🎆', '🎇', '✨'], count: 24, drift: 'up',   sizeMin: 16, sizeMax: 30, speedMin: 30, speedMax: 70, sway: 25 },
  };

  // Determine today's calendar effect. `birthdayMMDD` is a "MM-DD" string or null.
  function resolveSeasonalEffect(birthdayMMDD) {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day   = today.getDate();
    const mmdd  = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (birthdayMMDD && birthdayMMDD === mmdd) return 'balloons';
    if (month === 3 && day === 17) return 'shamrocks';   // St. Patrick's Day
    if (month === 7 && day === 4)  return 'fireworks';   // July 4th
    if (month === 2 && day >= 10 && day <= 14) return 'hearts';
    if (month === 12 || month === 1) return 'snow';
    if ((month === 9 && day >= 22) || month === 10 || month === 11) return 'leaves';
    return null;
  }

  // ─── NAV TOOLS LIST ─────────────────────────────────────────────────────────
const NAV_TOOLS = [
  { id: 'hub',           label: 'Hub',          icon: '🧭', href: './hil-hub.html' },
  { id: 'vault',         label: 'Vault',        icon: '🗄',  href: './hl-vault-cloud.html' },
  { id: 'museum',        label: 'Museum',       icon: '🏛',  href: './hil-museum.html' },
  { id: 'family-ledger', label: 'Ledger',       icon: '👥', href: './hil-family-ledger.html' },
  { id: 'exchange',      label: 'Exchange',     icon: '⇄',   href: './hil-exchange.html' },
  { id: 'guild',         label: 'Guild',        icon: '🏅', href: './hil-guild.html' },
  { id: 'field-tool',    label: 'Field',        icon: '📍', href: './hil-field-tool.html' },
  { id: 'vessel-builder',label: 'Vessels',      icon: '📦', href: './hil-vessel-builder.html' },
  { id: 'kit-builder',   label: 'Kits',         icon: '🧰', href: './hil-kit-builder.html' },
  { id: 'labels',        label: 'Labels & Signs', icon: '🏷', href: './hil-label-studio.html' },
  { id: 'library-hub',   label: 'Library',      icon: '📚', href: './hil-library-hub.html' },
  { id: 'smart-home',    label: 'Smart Home',   icon: '🏠', href: './hil-smart-home.html' },
  { id: 'admin',         label: 'Admin',        icon: '⚙',   href: './hil-admin.html' },
  { id: 'import-export', label: 'Import/Export', icon: '📤', href: './hil-import-export.html' },
];
  // ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
  const SHELL_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;400;600;700;900&family=Barlow:wght@300;400;500&display=swap');

    :root {
      --hil-green:        #00cc66;
      --hil-green-dim:    #0a2614;
      --hil-green-glow:   rgba(0,204,102,0.15);
      --hil-amber:        #cc8800;
      --hil-danger:       #cc3333;
      --hil-warning:      #cc8800;
      --hil-bg:           #0a0c0b;
      --hil-surface:      #141816;
      --hil-surface-2:    #1c201e;
      --hil-border:       #2a302c;
      --hil-text:         #dde8e2;
      --hil-text-muted:   #6b7d72;
      --hil-shell-h:      56px;
      --hil-nav-h:        40px;
      --hil-offset:       96px;
      --font-display:     'Orbitron', sans-serif;
      --font-mono:        'Space Mono', monospace;
      --font-ui:          'Barlow Condensed', sans-serif;
      --font-body:        'Barlow', sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--hil-bg);
      color: var(--hil-text);
      font-family: var(--font-ui);
      padding-top: var(--hil-offset);
      min-height: 100vh;
    }

    /* ── HEADER ── */
    #hil-header {
      position: fixed; top: 0; left: 0; right: 0;
      height: var(--hil-shell-h);
      background: #000;
      border-bottom: 2px solid var(--hil-green);
      display: flex; align-items: center;
      padding: 0 16px; gap: 12px; z-index: 1000;
    }
    #hil-logo-wrap { width: 38px; height: 38px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    #hil-wordmark { display: flex; flex-direction: column; line-height: 1; }
    #hil-wordmark .hil-title { font-family: var(--font-display); font-size: 13px; font-weight: 900; color: var(--hil-green); letter-spacing: 3px; }
    #hil-wordmark .hil-subtitle { font-family: var(--font-mono); font-size: 8px; color: var(--hil-text-muted); letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
    #hil-tool-name { margin-left: auto; font-family: var(--font-display); font-size: 10px; color: var(--hil-text-muted); letter-spacing: 2px; text-transform: uppercase; }
    #hil-user-info { display: flex; align-items: center; gap: 8px; margin-left: 16px; }
    #hil-user-avatar { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--hil-green); object-fit: cover; display: none; }
    #hil-signout-btn { font-family: var(--font-mono); font-size: 10px; color: var(--hil-text-muted); background: none; border: 1px solid var(--hil-border); padding: 4px 8px; cursor: pointer; display: none; letter-spacing: 1px; transition: all 0.15s; }
    #hil-signout-btn:hover { border-color: var(--hil-danger); color: var(--hil-danger); }

    /* ── NAV BAR ── */
    #hil-nav {
      position: fixed; top: var(--hil-shell-h); left: 0; right: 0;
      height: var(--hil-nav-h);
      background: var(--hil-surface);
      border-bottom: 1px solid var(--hil-border);
      display: flex; align-items: center;
      padding: 0 8px; gap: 2px;
      overflow-x: auto; z-index: 999; scrollbar-width: none;
    }
    #hil-nav::-webkit-scrollbar { display: none; }
    .hil-nav-link { font-family: var(--font-ui); font-size: 11px; color: var(--hil-text-muted); text-decoration: none; padding: 4px 10px; white-space: nowrap; letter-spacing: 1px; transition: all 0.15s; border: 1px solid transparent; }
    .hil-nav-link:hover { color: var(--hil-text); background: var(--hil-surface-2); border-color: var(--hil-border); }
    .hil-nav-link.active { color: var(--hil-green); border-color: var(--hil-green); }

    /* ── AUTH GATE ── */
    #hil-auth-gate { position: fixed; inset: 0; background: rgba(0,0,0,0.92); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
    #hil-auth-gate.hidden { display: none; }
    #hil-auth-box { background: var(--hil-surface); border: 1px solid var(--hil-green); padding: 40px; width: 360px; max-width: 90vw; text-align: center; }
    #hil-auth-box .auth-logo-wrap { width: 52px; height: 52px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
    #hil-auth-box .auth-title { font-family: var(--font-display); font-size: 18px; color: var(--hil-green); letter-spacing: 4px; margin-bottom: 2px; }
    #hil-auth-box .auth-tool { font-family: var(--font-ui); font-size: 11px; color: var(--hil-text-muted); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 28px; }
    #hil-auth-tabs { display: flex; border-bottom: 1px solid var(--hil-border); margin-bottom: 20px; }
    .hil-auth-tab { flex: 1; padding: 8px; font-family: var(--font-ui); font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--hil-text-muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.15s; }
    .hil-auth-tab.active { color: var(--hil-green); border-bottom-color: var(--hil-green); }
    .hil-auth-panel { display: none; }
    .hil-auth-panel.active { display: block; }
    .hil-social-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px; margin-bottom: 10px; font-family: var(--font-ui); font-size: 13px; letter-spacing: 1px; cursor: pointer; border: 1px solid var(--hil-border); background: var(--hil-surface-2); color: var(--hil-text); transition: all 0.15s; }
    .hil-social-btn:hover { border-color: var(--hil-green); color: var(--hil-green); }
    .hil-social-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
    .hil-input { width: 100%; padding: 10px 12px; margin-bottom: 10px; background: var(--hil-bg); border: 1px solid var(--hil-border); color: var(--hil-text); font-family: var(--font-mono); font-size: 13px; outline: none; transition: border-color 0.15s; }
    .hil-input:focus { border-color: var(--hil-green); }
    .hil-input::placeholder { color: var(--hil-text-muted); }
    .hil-submit-btn { width: 100%; padding: 12px; background: var(--hil-green); color: #000; font-family: var(--font-display); font-size: 11px; letter-spacing: 2px; border: none; cursor: pointer; transition: opacity 0.15s; margin-bottom: 10px; }
    .hil-submit-btn:hover { opacity: 0.85; }
    .hil-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .hil-auth-toggle { font-size: 11px; color: var(--hil-text-muted); margin-top: 8px; }
    .hil-auth-toggle a { color: var(--hil-green); cursor: pointer; text-decoration: underline; }
    .hil-auth-error { color: var(--hil-danger); font-size: 11px; font-family: var(--font-mono); margin-top: 8px; min-height: 16px; text-align: left; }

    /* ── TOAST ── */
    #hil-toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 3000; display: flex; flex-direction: column; gap: 8px; }
    .hil-toast { background: var(--hil-surface); border-left: 3px solid var(--hil-green); color: var(--hil-text); font-family: var(--font-mono); font-size: 12px; padding: 10px 16px; min-width: 240px; max-width: 360px; animation: hil-slide-in 0.2s ease; }
    .hil-toast.error   { border-color: var(--hil-danger); }
    .hil-toast.warning { border-color: var(--hil-warning); }
    .hil-toast.success { border-color: var(--hil-green); }
    @keyframes hil-slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* ── UTILITY CLASSES ── */
    .hil-badge { font-family: var(--font-mono); font-size: 10px; padding: 2px 6px; letter-spacing: 1px; }
    .hil-badge-green  { background: rgba(0,204,102,0.12); color: var(--hil-green);      border: 1px solid var(--hil-green); }
    .hil-badge-gray   { background: var(--hil-surface-2); color: var(--hil-text-muted); border: 1px solid var(--hil-border); }
    .hil-badge-danger { background: rgba(204,51,51,0.12); color: var(--hil-danger);      border: 1px solid var(--hil-danger); }
    .hil-badge-amber  { background: rgba(204,136,0,0.12); color: var(--hil-amber);       border: 1px solid var(--hil-amber); }
    .hil-address { font-family: var(--font-mono); font-size: 11px; color: var(--hil-green); letter-spacing: 2px; }
    .hil-section-header { font-family: var(--font-display); font-size: 10px; color: var(--hil-text-muted); letter-spacing: 3px; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid var(--hil-border); margin-bottom: 12px; }
    .hil-card { background: var(--hil-surface); border: 1px solid var(--hil-border); padding: 16px; }
    .hil-card:hover { border-color: var(--hil-green); }
    .hil-btn { font-family: var(--font-display); font-size: 11px; letter-spacing: 2px; padding: 10px 20px; cursor: pointer; border: none; transition: all 0.15s; }
    .hil-btn-primary { background: var(--hil-green); color: #000; }
    .hil-btn-primary:hover { opacity: 0.85; }
    .hil-btn-secondary { background: none; color: var(--hil-text-muted); border: 1px solid var(--hil-border); }
    .hil-btn-secondary:hover { border-color: var(--hil-green); color: var(--hil-green); }

    /* ── PATCH CHAT BUBBLE ── */
    #patch-bubble {
      position: fixed; bottom: 24px; right: 24px;
      width: 52px; height: 52px; border-radius: 50%;
      background: #000; border: 2px solid var(--hil-green);
      cursor: pointer; z-index: 4000; overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-shadow: 0 0 12px rgba(0,204,102,0.3);
    }
    #patch-bubble:hover { box-shadow: 0 0 20px rgba(0,204,102,0.5); }
    #patch-bubble img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }

    #patch-drawer {
      position: fixed; bottom: 88px; right: 24px;
      width: 360px; max-width: calc(100vw - 32px);
      height: 480px; max-height: calc(100vh - 120px);
      background: var(--hil-surface); border: 1px solid var(--hil-green);
      z-index: 3999; display: flex; flex-direction: column;
      box-shadow: 0 0 30px rgba(0,204,102,0.15);
      transform: translateY(12px); opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #patch-drawer.open { opacity: 1; transform: translateY(0); pointer-events: all; }

    #patch-drawer-header {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-bottom: 1px solid var(--hil-border);
      background: #000; flex-shrink: 0;
    }
    #patch-drawer-header img { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--hil-green); object-fit: cover; object-position: center top; }
    #patch-drawer-header .patch-name { font-family: var(--font-display); font-size: 11px; color: var(--hil-green); letter-spacing: 2px; }
    #patch-drawer-header .patch-status { font-family: var(--font-mono); font-size: 9px; color: var(--hil-text-muted); letter-spacing: 1px; }
    #patch-close-btn { margin-left: auto; background: none; border: none; color: var(--hil-text-muted); cursor: pointer; font-size: 18px; line-height: 1; padding: 2px 4px; transition: color 0.15s; }
    #patch-close-btn:hover { color: var(--hil-text); }

    #patch-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin; scrollbar-color: var(--hil-border) transparent; }

    .patch-msg { display: flex; flex-direction: column; max-width: 85%; }
    .patch-msg.patch { align-self: flex-start; }
    .patch-msg.user  { align-self: flex-end; }
    .patch-msg .bubble { padding: 9px 12px; font-family: var(--font-body); font-size: 13px; line-height: 1.5; border: 1px solid var(--hil-border); }
    .patch-msg.patch .bubble { background: var(--hil-surface-2); color: var(--hil-text); border-left: 2px solid var(--hil-green); }
    .patch-msg.user .bubble  { background: var(--hil-green-dim); border-color: var(--hil-green); color: var(--hil-text); }
    .patch-msg .msg-label { font-family: var(--font-mono); font-size: 9px; color: var(--hil-text-muted); letter-spacing: 1px; margin-bottom: 3px; }
    .patch-msg.user .msg-label { text-align: right; }

    .patch-typing { display: flex; gap: 4px; align-items: center; padding: 10px 12px; }
    .patch-typing span { width: 6px; height: 6px; background: var(--hil-green); border-radius: 50%; animation: patch-bounce 1s infinite; }
    .patch-typing span:nth-child(2) { animation-delay: 0.15s; }
    .patch-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes patch-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }

    #patch-input-row { display: flex; border-top: 1px solid var(--hil-border); flex-shrink: 0; }
    #patch-input { flex: 1; background: var(--hil-bg); border: none; border-right: 1px solid var(--hil-border); color: var(--hil-text); font-family: var(--font-body); font-size: 13px; padding: 12px 14px; outline: none; resize: none; }
    #patch-input::placeholder { color: var(--hil-text-muted); }
    #patch-send-btn { background: none; border: none; color: var(--hil-green); padding: 0 16px; cursor: pointer; font-size: 18px; transition: opacity 0.15s; flex-shrink: 0; }
    #patch-send-btn:hover { opacity: 0.7; }
    #patch-send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* ── PATCH & SCRATCH SHARED BOT COMPONENT ──────────────────────────────────
       One component, one place it's styled. Any module sets:
         document.querySelectorAll('.bot').forEach(el => el.dataset.state = 'danger')
       (or the HILShell.bot.setState() helper below) and both characters react —
       no module ever writes its own Patch/Scratch CSS. --hil-patch-blue is the
       one new token this introduces; safe/caution/danger reuse the existing
       green/amber/danger tokens above so there's a single source of truth for
       what "danger" looks like everywhere on the platform. */
    :root { --hil-patch-blue: #5ac8e8; }

    .bot {
      background: var(--hil-surface);
      border: 1px solid var(--hil-border);
      border-radius: 4px;
      padding: 12px 14px;
      font-family: var(--font-body);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .bot__avatar { width: 40px; height: 40px; background-size: contain; background-repeat: no-repeat; background-position: center; margin-bottom: 6px; }
    .bot__name { font-family: var(--font-ui); font-size: 16px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px; }
    .bot__line { font-family: var(--font-mono); font-size: 12.5px; line-height: 1.5; color: var(--hil-text); }

    /* Character identity (who they are, regardless of mood) */
    .bot--scratch .bot__name { color: var(--hil-amber); }
    .bot--patch { border-color: var(--hil-patch-blue); }
    .bot--patch .bot__name { color: var(--hil-patch-blue); }

    /* Mood states — data-state is the only thing a module ever touches */
    .bot[data-state="danger"] { border-color: var(--hil-danger); }
    .bot--scratch[data-state="danger"] {
      box-shadow: 0 0 14px rgba(204,51,51,0.35);
      animation: bot-zapshake 0.4s ease infinite;
    }
    .bot--scratch[data-state="caution"] { box-shadow: 0 0 8px var(--hil-green-glow); border-color: var(--hil-amber); }
    @keyframes bot-zapshake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-1px); } 75% { transform: translateX(1px); } }

    /* Real Patch/Scratch sprite art slots in here later, per state, still
       defined once and shared by every module — swap the emoji in bot__name
       for a background-image on .bot__avatar instead:
       .bot--scratch[data-state="safe"]    .bot__avatar { background-image: url('https://assets.hilsystem.com/bot/scratch-neutral.png'); }
       .bot--scratch[data-state="caution"] .bot__avatar { background-image: url('https://assets.hilsystem.com/bot/scratch-nervous.png'); }
       .bot--scratch[data-state="danger"]  .bot__avatar { background-image: url('https://assets.hilsystem.com/bot/scratch-zapped.png'); }
       .bot--patch[data-state="danger"]    .bot__avatar { background-image: url('https://assets.hilsystem.com/bot/patch-concerned.png'); }
    */

    /* ── GUILD MEDIA VIEWER ─────────────────────────────────────────────────────
       Modal popup for guild_media assets (illustrations, PATCH & SCRATCH shorts,
       diagrams, printable PDFs, etc). Any tool/module triggers it via
       HILShell.media.open(assetId) — never hand-roll a lightbox per module. */
    #hil-media-viewer {
      position: fixed; inset: 0; z-index: 6000;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(4px);
      display: none; align-items: center; justify-content: center;
      padding: 24px;
    }
    #hil-media-viewer.open { display: flex; }
    #hil-media-viewer .mv-box {
      background: var(--hil-surface); border: 1px solid var(--hil-green);
      max-width: 900px; max-height: 90vh; width: 100%;
      display: flex; flex-direction: column; overflow: hidden;
    }
    #hil-media-viewer .mv-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid var(--hil-border);
      flex-shrink: 0;
    }
    #hil-media-viewer .mv-title { font-family: var(--font-display); font-size: 13px; color: var(--hil-green); letter-spacing: 1.5px; }
    #hil-media-viewer .mv-close {
      background: none; border: none; color: var(--hil-text-muted);
      font-size: 22px; line-height: 1; cursor: pointer; padding: 4px 8px;
    }
    #hil-media-viewer .mv-close:hover { color: var(--hil-green); }
    #hil-media-viewer .mv-body {
      flex: 1; overflow: auto; display: flex; align-items: center;
      justify-content: center; padding: 16px; min-height: 200px;
    }
    #hil-media-viewer .mv-body img,
    #hil-media-viewer .mv-body video { max-width: 100%; max-height: 70vh; object-fit: contain; }
    #hil-media-viewer .mv-body embed { width: 100%; height: 70vh; }
    #hil-media-viewer .mv-desc {
      padding: 10px 16px; border-top: 1px solid var(--hil-border);
      font-family: var(--font-mono); font-size: 12px; color: var(--hil-text-muted);
      flex-shrink: 0;
    }
    /* Small "View: [title]" trigger card PATCH's chat drops in next to a text reply */
    .hil-media-card {
      display: flex; align-items: center; gap: 8px;
      background: var(--hil-surface); border: 1px solid var(--hil-green);
      color: var(--hil-green); font-family: var(--font-mono); font-size: 12px;
      padding: 8px 12px; margin-top: 6px; cursor: pointer;
      transition: background 0.15s ease;
    }
    .hil-media-card:hover { background: var(--hil-green-dim); }

    /* Tag-driven media strip — HILShell.media.renderForConcept() output.
       A horizontal row of small clickable thumbnails, auto-populated by
       matching related_concepts. Renders nothing if no matches (silent). */
    .hil-media-strip {
      display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0;
    }
    .hil-media-strip-loading {
      font-family: var(--font-mono); font-size: 11px; color: var(--hil-text-muted);
    }
    .hil-media-strip-card {
      width: 96px; cursor: pointer; text-align: center;
    }
    .hil-media-strip-card img {
      width: 96px; height: 72px; object-fit: cover; border: 1px solid var(--hil-border);
      display: block; transition: border-color 0.15s ease;
    }
    .hil-media-strip-card:hover img { border-color: var(--hil-green); }
    .hil-media-strip-icon {
      width: 96px; height: 72px; display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--hil-border); font-size: 24px;
    }
    .hil-media-strip-card:hover .hil-media-strip-icon { border-color: var(--hil-green); }
    .hil-media-strip-label {
      font-family: var(--font-mono); font-size: 10px; color: var(--hil-text-muted);
      margin-top: 4px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
    .hil-media-strip-card:hover .hil-media-strip-label { color: var(--hil-green); }

    /* Header MEDIA button — opens the standing library panel, always
       available regardless of which page/module you're on. */
    #hil-media-lib-btn {
      background: none; border: 1px solid var(--hil-border); color: var(--hil-text-muted);
      font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px;
      padding: 6px 12px; cursor: pointer; transition: all 0.15s ease;
      margin-left: 12px;
    }
    #hil-media-lib-btn:hover { border-color: var(--hil-green); color: var(--hil-green); }

    /* Media Library panel — full asset browser, distinct from the single-
       asset viewer. Reuses the same visual language (dark surface, green
       accent) but is its own overlay so it can stay open while browsing. */
    #hil-media-library {
      position: fixed; inset: 0; z-index: 6100;
      background: rgba(0,0,0,0.92); backdrop-filter: blur(4px);
      display: none; align-items: center; justify-content: center;
      padding: 24px;
    }
    #hil-media-library.open { display: flex; }
    #hil-media-library .ml-box {
      background: var(--hil-surface); border: 1px solid var(--hil-green);
      max-width: 720px; max-height: 85vh; width: 100%;
      display: flex; flex-direction: column; overflow: hidden;
    }
    #hil-media-library .ml-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; border-bottom: 1px solid var(--hil-border); flex-shrink: 0;
    }
    #hil-media-library .ml-title {
      font-family: var(--font-display); font-size: 14px; color: var(--hil-green); letter-spacing: 1.5px;
    }
    #hil-media-library .ml-close {
      background: none; border: none; color: var(--hil-text-muted);
      font-size: 22px; line-height: 1; cursor: pointer; padding: 4px 8px;
    }
    #hil-media-library .ml-close:hover { color: var(--hil-green); }
    #hil-media-library .ml-body {
      flex: 1; overflow-y: auto; padding: 18px;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px;
    }
    #hil-media-library .ml-empty {
      grid-column: 1 / -1; text-align: center; padding: 40px 20px;
      font-family: var(--font-mono); font-size: 12px; color: var(--hil-text-muted);
    }
    #hil-media-library .ml-card { cursor: pointer; text-align: center; }
    #hil-media-library .ml-card img {
      width: 100%; height: 100px; object-fit: cover; border: 1px solid var(--hil-border);
      display: block; transition: border-color 0.15s ease;
    }
    #hil-media-library .ml-card-icon {
      width: 100%; height: 100px; display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--hil-border); font-size: 28px;
    }
    #hil-media-library .ml-card:hover img,
    #hil-media-library .ml-card:hover .ml-card-icon { border-color: var(--hil-green); }
    #hil-media-library .ml-card-label {
      font-family: var(--font-mono); font-size: 10px; color: var(--hil-text-muted);
      margin-top: 6px; line-height: 1.3;
    }
    #hil-media-library .ml-card:hover .ml-card-label { color: var(--hil-green); }
  `;

  // ─── HEX LOGO SVG ───────────────────────────────────────────────────────────
  const LOGO_SVG = `
    <svg width="38" height="38" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5"
        fill="#0a0c0b" stroke="#00cc66" stroke-width="1.5"/>
      <text x="21" y="27" text-anchor="middle"
        font-family="Orbitron,sans-serif" font-size="10"
        font-weight="900" fill="#00cc66">HIL</text>
    </svg>`;

  const GOOGLE_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>`;

  const GITHUB_ICON = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>`;

  // ─── INTERNAL STATE ──────────────────────────────────────────────────────────
  let shellConfig  = {};
  let firebaseApp  = null;
  let firebaseAuth = null;
  let firebaseDb   = null;

  // ─── STYLE INJECTION ─────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'hil-shell-styles';
    style.textContent = SHELL_CSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // ─── PATCH & SCRATCH BOT COMPONENT ────────────────────────────────────────────
  // Builds the standard markup for one bot card. Never hand-write this HTML in
  // a module — always go through this (or HILShell.bot.render below) so every
  // instance stays structurally identical and picks up shell CSS correctly.
  function botCardHTML(character, initialState, line) {
    const label = character === 'patch' ? 'PATCH' : 'SCRATCH';
    return `<div class="bot bot--${character}" data-state="${initialState}">
      <div class="bot__avatar"></div>
      <div class="bot__name">🤖 ${label}</div>
      <div class="bot__line">${line || ''}</div>
    </div>`;
  }

  // Accepts either the .bot element itself, its rendered container, or an id
  // string for either — returns the actual .bot element or null.
  function resolveBotEl(target) {
    const node = typeof target === 'string' ? document.getElementById(target) : target;
    if (!node) return null;
    return node.classList.contains('bot') ? node : node.querySelector('.bot');
  }

  // ─── HEADER ──────────────────────────────────────────────────────────────────
  function buildHeader() {
    const header = document.createElement('div');
    header.id = 'hil-header';
    header.innerHTML = `
      <div id="hil-logo-wrap">${LOGO_SVG}</div>
      <div id="hil-wordmark">
        <span class="hil-title">HIL SYSTEM</span>
        <span class="hil-subtitle">Home Inventory Locator</span>
      </div>
      <div id="hil-tool-name">${shellConfig.toolName || ''}</div>
      <button id="hil-media-lib-btn" title="Guild Media Library">🖼 MEDIA</button>
      <div id="hil-user-info">
        <img id="hil-user-avatar" alt="avatar"/>
        <button id="hil-signout-btn">SIGN OUT</button>
      </div>`;
    document.body.insertBefore(header, document.body.firstChild);
    document.getElementById('hil-signout-btn').addEventListener('click', () => {
      if (firebaseAuth) {
        firebaseAuth.signOut();
        HILShell.toast('Signed out');
      }
    });
    document.getElementById('hil-media-lib-btn').addEventListener('click', () => {
      HILShell.media.openLibrary();
    });
  }

  // ─── NAV BAR ─────────────────────────────────────────────────────────────────
  function buildNav() {
    const nav = document.createElement('div');
    nav.id = 'hil-nav';
    nav.innerHTML = NAV_TOOLS.map(t => `
      <a href="${t.href}"
         class="hil-nav-link ${t.id === shellConfig.toolId ? 'active' : ''}"
         title="${t.label}">
        ${t.icon} ${t.label}
      </a>`).join('');
    document.body.insertBefore(nav, document.body.children[1]);
  }

  // ─── AUTH GATE ───────────────────────────────────────────────────────────────
  function buildAuthGate() {
    const gate = document.createElement('div');
    gate.id = 'hil-auth-gate';
    gate.innerHTML = `
      <div id="hil-auth-box">
        <div class="auth-logo-wrap">${LOGO_SVG}</div>
        <div class="auth-title">HIL SYSTEM</div>
        <div class="auth-tool">${shellConfig.toolName || 'Platform'}</div>
        <div id="hil-auth-tabs">
          <button class="hil-auth-tab active" data-tab="social">Social</button>
          <button class="hil-auth-tab" data-tab="email">Email</button>
        </div>
        <div class="hil-auth-panel active" id="hil-panel-social">
          <button class="hil-social-btn" id="hil-google-btn">${GOOGLE_ICON} Continue with Google</button>
          <button class="hil-social-btn" id="hil-github-btn">${GITHUB_ICON} Continue with GitHub</button>
        </div>
        <div class="hil-auth-panel" id="hil-panel-email">
          <div id="hil-email-signin-form">
            <input class="hil-input" id="hil-email-input" type="email" placeholder="Email address" autocomplete="email"/>
            <input class="hil-input" id="hil-password-input" type="password" placeholder="Password" autocomplete="current-password"/>
            <button class="hil-submit-btn" id="hil-email-submit">SIGN IN</button>
            <div class="hil-auth-toggle">No account? <a id="hil-switch-to-register">Create one</a></div>
          </div>
          <div id="hil-email-register-form" style="display:none">
            <input class="hil-input" id="hil-reg-name-input" type="text" placeholder="Display name" autocomplete="name"/>
            <input class="hil-input" id="hil-reg-email-input" type="email" placeholder="Email address" autocomplete="email"/>
            <input class="hil-input" id="hil-reg-password-input" type="password" placeholder="Password (min 6 chars)" autocomplete="new-password"/>
            <button class="hil-submit-btn" id="hil-reg-submit">CREATE ACCOUNT</button>
            <div class="hil-auth-toggle">Have an account? <a id="hil-switch-to-signin">Sign in</a></div>
          </div>
          <div class="hil-auth-error" id="hil-auth-error"></div>
        </div>
      </div>`;
    document.body.appendChild(gate);

    gate.querySelectorAll('.hil-auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        gate.querySelectorAll('.hil-auth-tab').forEach(t => t.classList.remove('active'));
        gate.querySelectorAll('.hil-auth-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`hil-panel-${tab.dataset.tab}`).classList.add('active');
        clearAuthError();
      });
    });

    document.getElementById('hil-switch-to-register').addEventListener('click', () => {
      document.getElementById('hil-email-signin-form').style.display   = 'none';
      document.getElementById('hil-email-register-form').style.display = 'block';
      clearAuthError();
    });
    document.getElementById('hil-switch-to-signin').addEventListener('click', () => {
      document.getElementById('hil-email-register-form').style.display = 'none';
      document.getElementById('hil-email-signin-form').style.display   = 'block';
      clearAuthError();
    });
  }

  function clearAuthError() {
    const el = document.getElementById('hil-auth-error');
    if (el) el.textContent = '';
  }
  function showAuthError(msg) {
    const el = document.getElementById('hil-auth-error');
    if (el) el.textContent = msg;
  }

  // ─── TOAST CONTAINER ─────────────────────────────────────────────────────────
  // ─── GUILD MEDIA VIEWER ────────────────────────────────────────────────────
  // Builds the (hidden) modal shell once at init. HILShell.media.open(assetId)
  // fetches the guild_media doc from Firestore, resolves the R2 URL, and
  // switches render mode on `type`/`mime_type`. Never embeds media inline in
  // chat — this is the one shared viewer every tool/module points to.
  function buildMediaViewer() {
    if (document.getElementById('hil-media-viewer')) return;
    const el = document.createElement('div');
    el.id = 'hil-media-viewer';
    el.innerHTML = `
      <div class="mv-box">
        <div class="mv-header">
          <span class="mv-title" id="mv-title"></span>
          <button class="mv-close" id="mv-close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="mv-body" id="mv-body"></div>
        <div class="mv-desc" id="mv-desc"></div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', (e) => { if (e.target === el) HILShell.media.close(); });
    document.getElementById('mv-close-btn').addEventListener('click', () => HILShell.media.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.classList.contains('open')) HILShell.media.close();
    });
  }

  // R2 CDN base — matches the platform's existing assets.hilsystem.com pattern.
  const R2_MEDIA_BASE = 'https://assets.hilsystem.com/';

  // ─── GUILD MEDIA LIBRARY PANEL ─────────────────────────────────────────────
  // Standing "browse everything" panel, opened from the header MEDIA button.
  // Separate from the single-asset viewer (#hil-media-viewer) — this is the
  // always-available entry point; the viewer is what a card/click opens into.
  function buildMediaLibrary() {
    if (document.getElementById('hil-media-library')) return;
    const el = document.createElement('div');
    el.id = 'hil-media-library';
    el.innerHTML = `
      <div class="ml-box">
        <div class="ml-header">
          <span class="ml-title">GUILD MEDIA LIBRARY</span>
          <button class="ml-close" id="ml-close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="ml-body" id="ml-body"><div class="ml-empty">Loading…</div></div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', (e) => { if (e.target === el) HILShell.media.closeLibrary(); });
    document.getElementById('ml-close-btn').addEventListener('click', () => HILShell.media.closeLibrary());
  }

  function mediaBodyHTML(asset) {
    const url = R2_MEDIA_BASE + asset.file.r2_path;
    switch (asset.file.mime_type.split('/')[0]) {
      case 'image':
        return `<img src="${url}" alt="${asset.title || ''}">`;
      case 'video':
        return `<video src="${url}" controls autoplay playsinline></video>`;
      case 'application': // PDFs etc
        return `<embed src="${url}" type="${asset.file.mime_type}">`;
      default:
        return `<a href="${url}" target="_blank" style="color:var(--hil-green)">Open file</a>`;
    }
  }

  function buildToastContainer() {
    const c = document.createElement('div');
    c.id = 'hil-toast-container';
    document.body.appendChild(c);
  }

  // ─── PATCH CHAT BUBBLE ───────────────────────────────────────────────────────
  // v2.4: persistent cross-session memory + multi-turn + !! issue logging

  let patchHistory = [];   // current session thread (clears on page reload)
  let patchMemory  = '';   // persistent summary loaded from Firestore on login

  // ── Load memory from Firestore (called after auth) ──────────────────────────
  async function loadPatchMemory(uid) {
    if (!uid) return;
    try {
      const { getFirestore, doc, getDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
      const db  = getFirestore(firebaseApp);
      const ref = doc(db, 'users', uid, 'patch_memory', 'session');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        patchMemory = snap.data().memory_summary || '';
        console.log('[PATCH] Memory loaded:', patchMemory.length, 'chars');
      }
    } catch (e) {
      console.warn('[PATCH] Memory load failed (non-fatal):', e.message);
    }
  }

  // ── Save updated memory to Firestore (called after each PATCH response) ─────
  async function savePatchMemory(uid, updatedMemory) {
    if (!uid || !updatedMemory) return;
    try {
      const { getFirestore, doc, setDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
      const db  = getFirestore(firebaseApp);
      const ref = doc(db, 'users', uid, 'patch_memory', 'session');
      await setDoc(ref, {
        memory_summary: updatedMemory,
        updated_at:     new Date(),
      }, { merge: true });
      patchMemory = updatedMemory;
      console.log('[PATCH] Memory saved:', updatedMemory.length, 'chars');
    } catch (e) {
      console.warn('[PATCH] Memory save failed (non-fatal):', e.message);
    }
  }

  function buildPatchBubble() {
    const PATCH_IMG = 'https://hilsystem.com/patch-hero.png';

    const bubble = document.createElement('div');
    bubble.id = 'patch-bubble';
    bubble.title = 'Ask PATCH';
    bubble.innerHTML = `<img src="${PATCH_IMG}" alt="PATCH"/>`;
    document.body.appendChild(bubble);

    const drawer = document.createElement('div');
    drawer.id = 'patch-drawer';
    drawer.innerHTML = `
      <div id="patch-drawer-header">
        <img src="${PATCH_IMG}" alt="PATCH"/>
        <div>
          <div class="patch-name">PATCH</div>
          <div class="patch-status">HIL INVENTORY ASSISTANT</div>
        </div>
        <button id="patch-close-btn" title="Close">✕</button>
      </div>
      <div id="patch-messages"></div>
      <div id="patch-input-row">
        <textarea id="patch-input" rows="1" placeholder="Ask PATCH… or type !!BUG / !!TODO / !!IDEA"></textarea>
        <button id="patch-send-btn" title="Send">↑</button>
      </div>`;
    document.body.appendChild(drawer);

    bubble.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      if (isOpen && patchHistory.length === 0) {
        appendPatchMessage('patch', "Hey — I'm PATCH. I have your inventory loaded. What are you looking for?");
      }
      if (isOpen) setTimeout(() => document.getElementById('patch-input')?.focus(), 200);
    });

    document.getElementById('patch-close-btn').addEventListener('click', () => {
      drawer.classList.remove('open');
    });

    document.getElementById('patch-send-btn').addEventListener('click', sendPatchMessage);
    document.getElementById('patch-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPatchMessage(); }
    });
  }

  function appendPatchMessage(role, text) {
    const messages = document.getElementById('patch-messages');
    if (!messages) return;
    const wrapper = document.createElement('div');
    wrapper.className = `patch-msg ${role}`;
    wrapper.innerHTML = `
      <div class="msg-label">${role === 'patch' ? 'PATCH' : 'YOU'}</div>
      <div class="bubble">${text.replace(/\n/g, '<br>')}</div>`;
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function showPatchTyping() {
    const messages = document.getElementById('patch-messages');
    if (!messages) return null;
    const el = document.createElement('div');
    el.className = 'patch-msg patch';
    el.id = 'patch-typing-indicator';
    el.innerHTML = `<div class="patch-typing"><span></span><span></span><span></span></div>`;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  async function sendPatchMessage() {
    const input   = document.getElementById('patch-input');
    const sendBtn = document.getElementById('patch-send-btn');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    const uid = window.currentUser?.uid;
    if (!uid) {
      appendPatchMessage('patch', 'Please sign in first so I can access your inventory.');
      return;
    }

    // Render user message immediately
    appendPatchMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    input.disabled  = true;
    sendBtn.disabled = true;

    const typingEl = showPatchTyping();

    try {
      const res = await fetch(PATCH_AGENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          message:      text,
          history:      [...patchHistory],   // full session thread for multi-turn
          memory:       patchMemory,         // persistent cross-session summary
          tool_context: {
            active_tool: shellConfig.toolName || 'HIL System',
            tool_id:     shellConfig.toolId   || 'unknown',
          },
        }),
      });

      const data = await res.json();
      typingEl?.remove();

      const reply = data.response || data.error || 'No response from PATCH.';
      appendPatchMessage('patch', reply);

      // Update session history for multi-turn
      patchHistory.push({ role: 'user',  text });
      patchHistory.push({ role: 'patch', text: reply });

      // Save updated memory back to Firestore (non-blocking)
      if (data.updated_memory) {
        savePatchMemory(uid, data.updated_memory);
      }

      // Log confirmation already included in reply if !! was detected
      if (data.issue_logged) {
        console.log('[PATCH] Issue logged:', data.issue_logged);
      }

    } catch (err) {
      typingEl?.remove();
      appendPatchMessage('patch', 'Connection error — check your network and try again.');
      console.error('PATCH agent error:', err);
    } finally {
      input.disabled   = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ─── SEASONAL FLARE: PLATFORM CONFIG ─────────────────────────────────────────
  let platformFlareEnabled = true; // default on; overridden by platform/config read

  async function fetchPlatformFlareEnabled(getDoc, doc) {
    try {
      const ref  = doc(firebaseDb, 'platform', 'config');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const val = snap.data().seasonal_flare_enabled;
        if (val === false) return false;
      }
      return true;
    } catch (e) {
      console.warn('[Seasonal Flare] Platform config read failed (defaulting on):', e.message);
      return true;
    }
  }

  // ─── SEASONAL FLARE: RENDERER ─────────────────────────────────────────────────
  function playSeasonalFlare(effectType) {
    const spec = SEASONAL_EFFECTS[effectType];
    if (!spec) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'hil-seasonal-flare';
    canvas.style.cssText = 'position:fixed;inset:0;z-index:5000;pointer-events:none;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    for (let i = 0; i < spec.count; i++) {
      particles.push(spawnParticle(spec, canvas));
    }

    let rafId;
    const startTime = performance.now();

    function spawnParticle(spec, canvas) {
      const glyph = spec.glyphs[Math.floor(Math.random() * spec.glyphs.length)];
      const size  = spec.sizeMin + Math.random() * (spec.sizeMax - spec.sizeMin);
      const speed = spec.speedMin + Math.random() * (spec.speedMax - spec.speedMin);
      return {
        glyph,
        size,
        speed,
        x: Math.random() * canvas.width,
        y: spec.drift === 'up' ? canvas.height + size + Math.random() * canvas.height * 0.5
                                : -size - Math.random() * canvas.height * 0.5,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.5 + Math.random() * 1.2,
        rotation: Math.random() * 360,
      };
    }

    function tick(now) {
      const elapsed = now - startTime;
      const dt = 1 / 60;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.y += (spec.drift === 'up' ? -p.speed : p.speed) * dt;
        p.swayPhase += p.swaySpeed * dt;
        const swayX = Math.sin(p.swayPhase) * spec.sway;

        // Recycle particles that drift off-screen while the effect is still running
        if (spec.drift === 'down' && p.y > canvas.height + p.size) {
          Object.assign(p, spawnParticle(spec, canvas), { y: -p.size });
        } else if (spec.drift === 'up' && p.y < -p.size) {
          Object.assign(p, spawnParticle(spec, canvas), { y: canvas.height + p.size });
        }

        ctx.save();
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(p.x + swayX, p.y);
        ctx.fillText(p.glyph, 0, 0);
        ctx.restore();
      }

      if (elapsed < SEASONAL_FLARE_DURATION_MS) {
        rafId = requestAnimationFrame(tick);
      } else {
        cleanup();
      }
    }

    function cleanup() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.remove();
    }

    rafId = requestAnimationFrame(tick);
  }

  // Look up whether any household team_member (family or pet) has a birthday
  // today. Lives under the signed-in owner's own subtree, so this only ever
  // reads data the owner is already allowed to read — no new security rules.
  async function findTeamMemberBirthdayToday(ownerUid, fsFns) {
    const { collection, query, where, getDocs } = fsFns;
    try {
      const today = new Date();
      const mmdd  = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const q = query(
        collection(firebaseDb, 'users', ownerUid, 'team_members'),
        where('birthday', '==', mmdd)
      );
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].data()?.name || null;
      return null;
    } catch (e) {
      console.warn('[Seasonal Flare] Team member birthday check failed (non-fatal):', e.message);
      return null;
    }
  }

  // Runs at most once per calendar day per signed-in user (sessionStorage-gated,
  // so re-opening a tool mid-session doesn't replay it, but a new day will).
  // Checks the signed-in user's own birthday first, then falls back to
  // checking household team_members (family + pets) for a birthday match.
  async function maybeRunSeasonalFlare(user, userData, fsFns) {
    try {
      const optedOut = userData?.preferences?.seasonal_flair_enabled === false;
      if (optedOut) return;

      if (!platformFlareEnabled) return;

      const today   = new Date();
      const dateKey = today.toISOString().slice(0, 10);
      const seenKey = `hil_flare_shown_${user.uid}_${dateKey}`;
      if (sessionStorage.getItem(seenKey)) return;

      let effect       = resolveSeasonalEffect(userData?.birthday || null);
      let birthdayName = null;

      if (effect === 'balloons') {
        birthdayName = userData?.display_name || user.displayName || null;
      } else {
        const teamMemberName = await findTeamMemberBirthdayToday(user.uid, fsFns);
        if (teamMemberName) {
          effect       = 'balloons';
          birthdayName = teamMemberName;
        }
      }

      if (!effect) return;

      sessionStorage.setItem(seenKey, '1');
      playSeasonalFlare(effect);
      if (birthdayName) {
        HILShell.toast(`🎈 Happy Birthday, ${birthdayName}!`, 'success', 4000);
      }
    } catch (e) {
      console.warn('[Seasonal Flare] Skipped due to error:', e.message);
    }
  }

  // ─── FIRESTORE USER RECORD ────────────────────────────────────────────────────
  async function initializeUserRecord(user, setDoc, doc, getDoc) {
    try {
      const ref = doc(firebaseDb, 'users', user.uid);

      // Read first so we never clobber `birthday` or an existing
      // `preferences.seasonal_flair_enabled` opt-out with defaults on every login.
      let existing = null;
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) existing = snap.data();
      } catch (e) {
        console.warn('HIL Shell: user record pre-read failed (proceeding with defaults)', e.message);
      }

      const record = {
        uid:          user.uid,
        email:        user.email,
        display_name: user.displayName || user.email.split('@')[0],
        avatar_url:   user.photoURL || null,
        provider:     user.providerData[0]?.providerId || 'unknown',
        plan:         'free',
        account_type: 'personal',
        public:       false,
        stats: { item_count: 0, collection_count: 0, star_count: 0, generosity_score: 0 },
        last_login:  new Date(),
        created_at:  new Date(),
        updated_at:  new Date(),
      };

      // `birthday` (MM-DD string, e.g. "07-04") — new field for Seasonal Flare.
      // Only set on first creation; never overwritten by later logins.
      if (existing?.birthday === undefined) record.birthday = null;

      // `preferences.seasonal_flair_enabled` — per-user opt-out, default true.
      // Field path matches the live hil-admin.html toggle exactly. Only set if
      // the preferences block or the flag doesn't already exist, so an
      // opt-out flipped in the admin panel sticks.
      if (existing?.preferences?.seasonal_flair_enabled === undefined) {
        record.preferences = { ...(existing?.preferences || {}), seasonal_flair_enabled: true };
      }

      await setDoc(ref, record, { merge: true });
      return { ...existing, ...record, preferences: record.preferences || existing?.preferences };
    } catch (err) {
      console.warn('HIL Shell: user record init failed', err);
      return null;
    }
  }

  // ─── AUTH SUCCESS ─────────────────────────────────────────────────────────────
  async function onAuthSuccess(user, setDoc, doc, getDoc, collection, query, where, getDocs) {
    const userData = await initializeUserRecord(user, setDoc, doc, getDoc);

    const avatar  = document.getElementById('hil-user-avatar');
    const signout = document.getElementById('hil-signout-btn');
    if (avatar && user.photoURL) { avatar.src = user.photoURL; avatar.style.display = 'block'; }
    if (signout) signout.style.display = 'block';

    const gate = document.getElementById('hil-auth-gate');
    if (gate) gate.classList.add('hidden');

    window.currentUser = user;
    window.db          = firebaseDb;
    window.auth        = firebaseAuth;

    // ── Load PATCH memory after auth ─────────────────────────────────────────
    loadPatchMemory(user.uid);

    // ── Seasonal Flare: platform kill switch, then per-user/calendar check ───
    platformFlareEnabled = await fetchPlatformFlareEnabled(getDoc, doc);
    maybeRunSeasonalFlare(user, userData, { getDoc, doc, collection, query, where, getDocs });

    HILShell.toast(`Welcome, ${user.displayName || user.email}`, 'success');
    if (typeof shellConfig.onAuth === 'function') shellConfig.onAuth(user);
  }

  // ─── WIRE AUTH BUTTONS ────────────────────────────────────────────────────────
  function wireAuth(
    GoogleAuthProvider, GithubAuthProvider, signInWithPopup,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    updateProfile, setDoc, doc
  ) {
    document.getElementById('hil-google-btn').addEventListener('click', async () => {
      clearAuthError();
      try { await signInWithPopup(firebaseAuth, new GoogleAuthProvider()); }
      catch (err) { showAuthError(friendlyAuthError(err.code)); }
    });

    document.getElementById('hil-github-btn').addEventListener('click', async () => {
      clearAuthError();
      try { await signInWithPopup(firebaseAuth, new GithubAuthProvider()); }
      catch (err) { showAuthError(friendlyAuthError(err.code)); }
    });

    document.getElementById('hil-email-submit').addEventListener('click', async () => {
      clearAuthError();
      const email = document.getElementById('hil-email-input').value.trim();
      const pass  = document.getElementById('hil-password-input').value;
      if (!email || !pass) { showAuthError('Email and password required.'); return; }
      try { await signInWithEmailAndPassword(firebaseAuth, email, pass); }
      catch (err) { showAuthError(friendlyAuthError(err.code)); }
    });

    document.getElementById('hil-reg-submit').addEventListener('click', async () => {
      clearAuthError();
      const name  = document.getElementById('hil-reg-name-input').value.trim();
      const email = document.getElementById('hil-reg-email-input').value.trim();
      const pass  = document.getElementById('hil-reg-password-input').value;
      if (!email || !pass) { showAuthError('Email and password required.'); return; }
      if (pass.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
      try {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
        if (name) await updateProfile(cred.user, { displayName: name });
      } catch (err) { showAuthError(friendlyAuthError(err.code)); }
    });

    ['hil-email-input','hil-password-input'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('hil-email-submit').click();
      });
    });
    ['hil-reg-email-input','hil-reg-password-input','hil-reg-name-input'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('hil-reg-submit').click();
      });
    });
  }

  function friendlyAuthError(code) {
    return ({
      'auth/user-not-found':                          'No account found with that email.',
      'auth/wrong-password':                          'Incorrect password.',
      'auth/invalid-email':                           'Invalid email address.',
      'auth/email-already-in-use':                    'An account with that email already exists.',
      'auth/weak-password':                           'Password must be at least 6 characters.',
      'auth/popup-closed-by-user':                    'Sign-in popup was closed.',
      'auth/cancelled-popup-request':                 'Sign-in cancelled.',
      'auth/account-exists-with-different-credential':'Account exists with a different sign-in method.',
      'auth/popup-blocked':                           'Popup was blocked. Please allow popups for this site.',
    })[code] || `Auth error: ${code}`;
  }

  // ─── FIREBASE BOOT ───────────────────────────────────────────────────────────
  async function loadFirebaseAndBoot() {
    const [
      { initializeApp, getApps },
      { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs },
      {
        getAuth, onAuthStateChanged,
        GoogleAuthProvider, GithubAuthProvider,
        signInWithPopup, signInWithEmailAndPassword,
        createUserWithEmailAndPassword, updateProfile
      }
    ] = await Promise.all([
      import(`${FB_BASE}/firebase-app.js`),
      import(`${FB_BASE}/firebase-firestore.js`),
      import(`${FB_BASE}/firebase-auth.js`),
    ]);

    firebaseApp  = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    firebaseDb   = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    window.db    = firebaseDb;
    window.auth  = firebaseAuth;

    wireAuth(
      GoogleAuthProvider, GithubAuthProvider, signInWithPopup,
      signInWithEmailAndPassword, createUserWithEmailAndPassword,
      updateProfile, setDoc, doc
    );

    onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        await onAuthSuccess(user, setDoc, doc, getDoc, collection, query, where, getDocs);
      } else {
        window.currentUser = null;
        const gate    = document.getElementById('hil-auth-gate');
        const signout = document.getElementById('hil-signout-btn');
        const avatar  = document.getElementById('hil-user-avatar');
        if (gate && shellConfig.requireAuth !== false) gate.classList.remove('hidden');
        if (signout) signout.style.display = 'none';
        if (avatar)  avatar.style.display  = 'none';
        patchHistory = [];
        patchMemory  = '';
      }
    });
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────────────
  // Polls for firebaseApp readiness — HILShell.init() kicks off Firebase boot
  // asynchronously and doesn't block the caller, so a <script> tag placed
  // right after init() (a common pattern, e.g. hil-smart-home.html) can run
  // before firebaseApp exists. Both media.open() and media.renderForConcept()
  // are commonly called that way, so both wait here rather than racing.
  function waitForFirebaseApp(timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      if (firebaseApp) { resolve(firebaseApp); return; }
      const start = Date.now();
      const iv = setInterval(() => {
        if (firebaseApp) {
          clearInterval(iv);
          resolve(firebaseApp);
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(iv);
          reject(new Error('Firebase did not initialize in time'));
        }
      }, 150);
    });
  }

  const HILShell = {
    init(config) {
      shellConfig = config || {};
      ['setMode','setView','setTab','openModal','closeModal'].forEach(fn => {
        if (!window[fn]) window[fn] = () => {};
      });
      injectStyles();
      buildHeader();
      buildNav();
      // Always build the gate — requireAuth:false tools (public browse, sign in to act)
      // still need something for a manual "Sign In" button to open. It only
      // auto-opens on load for requireAuth:true tools (see onAuthStateChanged below).
      buildAuthGate();
      buildToastContainer();
      buildPatchBubble();
      buildMediaViewer();
      buildMediaLibrary();
      loadFirebaseAndBoot().catch(err => {
        console.error('HIL Shell: Firebase load failed', err);
        HILShell.toast('Firebase failed to load — check connection', 'error');
      });
    },

    toast(message, type = 'info', duration = 3000) {
      const container = document.getElementById('hil-toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `hil-toast ${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), duration);
    },

    getUser()  { return window.currentUser || null; },
    getDb()    { return window.db   || null; },
    getAuth()  { return window.auth || null; },

    // ─── PATCH & SCRATCH BOT COMPONENT ─────────────────────────────────────────
    bot: {
      // Renders a Patch or Scratch card into a container (element or id string).
      // e.g. HILShell.bot.render('scratchSlot', { character: 'scratch', state: 'safe', line: 'Huh. Nothing happened.' })
      render(container, { character = 'patch', state = 'safe', line = '' } = {}) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;
        el.innerHTML = botCardHTML(character, state, line);
      },
      // Sets mood ('safe' | 'caution' | 'danger') on one card or every .bot on
      // the page at once. Pass either the .bot element itself or the container
      // you rendered into. This is the only thing a module needs to call to
      // react to something going right or wrong — no per-module CSS, ever.
      setState(state, target) {
        const els = target ? [resolveBotEl(target)].filter(Boolean) : document.querySelectorAll('.bot');
        els.forEach(el => { el.dataset.state = state; });
      },
      // Updates just the dialogue line inside a specific card without touching state.
      setLine(target, line) {
        const el = resolveBotEl(target);
        const lineEl = el && el.querySelector('.bot__line');
        if (lineEl) lineEl.textContent = line;
      },
    },

    // ─── GUILD MEDIA VIEWER ───────────────────────────────────────────────────
    media: {
      // HILShell.media.open('HERO-014') — fetches guild_media/{assetId} from
      // Firestore and shows it in the shared modal. Any tool/module can call
      // this; PATCH's chat drops a .hil-media-card that calls it on click.
      async open(assetId) {
        buildMediaViewer(); // safe no-op if already built
        const el = document.getElementById('hil-media-viewer');
        const body = document.getElementById('mv-body');
        const title = document.getElementById('mv-title');
        const desc = document.getElementById('mv-desc');
        if (!el || !body) return;

        title.textContent = 'Loading…';
        desc.textContent = '';
        body.innerHTML = '';
        el.classList.add('open');

        try {
          await waitForFirebaseApp();
          const { getFirestore, doc, getDoc } = await import(`${FB_BASE}/firebase-firestore.js`);
          const db = getFirestore(firebaseApp);
          const snap = await getDoc(doc(db, 'guild_media', assetId));
          if (!snap.exists()) throw new Error('Asset not found: ' + assetId);
          const asset = snap.data();

          title.textContent = asset.title || assetId;
          desc.textContent = asset.description || '';
          body.innerHTML = mediaBodyHTML(asset);
        } catch (err) {
          console.error('HIL Shell: media viewer failed', err);
          title.textContent = 'Unable to load';
          body.innerHTML = `<span style="color:var(--hil-text-muted);font-family:var(--font-mono);font-size:12px;">${err.message}</span>`;
        }
      },

      close() {
        const el = document.getElementById('hil-media-viewer');
        if (!el) return;
        el.classList.remove('open');
        const body = document.getElementById('mv-body');
        // Stop any playing video when closing
        if (body) body.innerHTML = '';
      },

      // Returns a ready-to-insert "View: [title]" trigger card HTML string —
      // e.g. for PATCH's chat to drop next to a text reply. Caller inserts
      // this into the DOM; click wiring is delegated (see below), so it works
      // even for cards injected after the fact (chat messages render dynamically).
      cardHTML(assetId, label) {
        return `<div class="hil-media-card" data-asset-id="${assetId}">🖼 View: ${label || assetId}</div>`;
      },

      // HILShell.media.renderForConcept('smart-home', 'module-media-slot') —
      // the tag-driven auto-display. A module page declares its own concept
      // slug once and points at an empty container; this queries guild_media
      // for anything tagged with that concept via related_concepts and drops
      // in small clickable thumbnail cards. New admin uploads tagged with the
      // same concept show up automatically — no asset_id ever hardcoded into
      // the module page, no re-editing the page when the library grows.
      async renderForConcept(conceptSlug, targetElId, opts = {}) {
        const container = document.getElementById(targetElId);
        if (!container) {
          console.warn(`HIL Shell: renderForConcept target #${targetElId} not found`);
          return;
        }
        const max = opts.limit || 6;
        container.innerHTML = `<div class="hil-media-strip-loading">loading media…</div>`;

        try {
          await waitForFirebaseApp();
          const { getFirestore, collection, query, where, limit: fsLimit, getDocs } =
            await import(`${FB_BASE}/firebase-firestore.js`);
          const db = getFirestore(firebaseApp);
          let q = query(
            collection(db, 'guild_media'),
            where('related_concepts', 'array-contains', conceptSlug),
            where('status', '==', 'active'),
            fsLimit(max)
          );
          const snap = await getDocs(q);
          if (snap.empty) {
            console.log(`HIL Shell: renderForConcept('${conceptSlug}') — no matching guild_media assets yet`);
            container.innerHTML = '';
            return;
          } // nothing tagged yet — render nothing, not an error

          container.innerHTML = '';
          container.classList.add('hil-media-strip');
          snap.forEach((docSnap) => {
            const asset = docSnap.data();
            const thumbSrc = asset.file?.mime_type?.startsWith('image/')
              ? `${R2_MEDIA_BASE}${asset.file.r2_path}`
              : null;
            const card = document.createElement('div');
            card.className = 'hil-media-strip-card';
            card.dataset.assetId = docSnap.id;
            card.innerHTML = thumbSrc
              ? `<img src="${thumbSrc}" alt="${asset.title || ''}">`
              : `<div class="hil-media-strip-icon">🖼</div>`;
            card.innerHTML += `<div class="hil-media-strip-label">${asset.title || docSnap.id}</div>`;
            container.appendChild(card);
          });
        } catch (err) {
          console.error('HIL Shell: renderForConcept failed', err);
          container.innerHTML = '';
        }
      },

      // HILShell.media.openLibrary() — the standing "browse everything" panel,
      // wired to the header MEDIA button. Lists all active guild_media assets
      // with no concept filtering; clicking a card opens the single-asset
      // viewer on top of it. This is the fallback/primary entry point that
      // doesn't depend on any page-level tag-matching working correctly.
      async openLibrary() {
        buildMediaLibrary();
        const el = document.getElementById('hil-media-library');
        const body = document.getElementById('ml-body');
        if (!el || !body) return;
        el.classList.add('open');
        body.innerHTML = `<div class="ml-empty">Loading…</div>`;

        try {
          await waitForFirebaseApp();
          const { getFirestore, collection, query, where, limit: fsLimit, getDocs } =
            await import(`${FB_BASE}/firebase-firestore.js`);
          const db = getFirestore(firebaseApp);
          const q = query(collection(db, 'guild_media'), where('status', '==', 'active'), fsLimit(60));
          const snap = await getDocs(q);

          if (snap.empty) {
            body.innerHTML = `<div class="ml-empty">No media in the library yet.</div>`;
            return;
          }
          body.innerHTML = '';
          snap.forEach((docSnap) => {
            const asset = docSnap.data();
            const thumbSrc = asset.file?.mime_type?.startsWith('image/')
              ? `${R2_MEDIA_BASE}${asset.file.r2_path}`
              : null;
            const card = document.createElement('div');
            card.className = 'ml-card';
            card.innerHTML = thumbSrc
              ? `<img src="${thumbSrc}" alt="${asset.title || ''}">`
              : `<div class="ml-card-icon">🖼</div>`;
            card.innerHTML += `<div class="ml-card-label">${asset.title || docSnap.id}</div>`;
            card.addEventListener('click', () => HILShell.media.open(docSnap.id));
            body.appendChild(card);
          });
        } catch (err) {
          console.error('HIL Shell: openLibrary failed', err);
          body.innerHTML = `<div class="ml-empty">Couldn't load library — ${err.message}</div>`;
        }
      },

      closeLibrary() {
        const el = document.getElementById('hil-media-library');
        if (el) el.classList.remove('open');
      },
    },
  };

  // Event delegation so .hil-media-card AND .hil-media-strip-card work even
  // when injected dynamically (e.g. into the PATCH chat drawer, or after an
  // async renderForConcept() call finishes).
  document.addEventListener('click', (e) => {
    const card = e.target.closest && e.target.closest('.hil-media-card, .hil-media-strip-card');
    if (card) HILShell.media.open(card.dataset.assetId);
  });

  window.HILShell = HILShell;

})();
