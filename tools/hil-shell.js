/**
 * HIL SHELL v2.2
 * Universal shell for all HIL/HL tools
 * Provides: Firebase init, Auth (Google + GitHub + Email), Firestore user record,
 *           fixed header, tool nav bar, auth gate overlay, toast system, CSS design tokens
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
 *   v2.2 — Corrected nav filenames (museum, label-studio), removed sign-studio (merged),
 *           added exchange, import-export, library-hub, organize, restore, supply, stain-lookup
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

  // ─── NAV TOOLS LIST ─────────────────────────────────────────────────────────
  // Edit this list to change the nav across every tool instantly.
  // toolId must match the id you pass to HILShell.init({ toolId: '...' })
  const NAV_TOOLS = [
    { id: 'hub',            label: 'Hub',            icon: '🧭', href: './hil-hub.html' },
    { id: 'vault',          label: 'Vault',          icon: '🗄',  href: './hl-vault-cloud.html' },
    { id: 'museum',         label: 'Museum',         icon: '🏛',  href: './hil-museum.html' },
    { id: 'family-ledger',  label: 'Ledger',         icon: '👥', href: './hil-family-ledger.html' },
    { id: 'exchange',       label: 'Exchange',       icon: '⇄',   href: './hil-exchange.html' },
    { id: 'field-tool',     label: 'Field',          icon: '📍', href: './hil-field-tool.html' },
    { id: 'labels',         label: 'Labels & Signs', icon: '🏷',  href: './hil-label-studio.html' },
    { id: 'library-hub',    label: 'Library',        icon: '📚', href: './hil-library-hub.html' },
    { id: 'stain-lookup',   label: 'HIL Clean',      icon: '🧪', href: './hil-stain-lookup.html' },
    { id: 'organize',       label: 'Organize',       icon: '📦', href: './hil-organize.html' },
    { id: 'restore',        label: 'Restore',        icon: '🔧', href: './hil-restore.html' },
    { id: 'supply',         label: 'Supply',         icon: '🏪', href: './hil-supply.html' },
    { id: 'room-codes',     label: 'Room Codes',     icon: '🗺',  href: './hl-room-code-generator.html' },
    { id: 'import-export',  label: 'Import/Export',  icon: '📤', href: './hil-import-export.html' },
    { id: 'admin',          label: 'Admin',          icon: '⚙',   href: './hil-admin.html' },
  ];

  // ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
  // Edit here to change the look of every tool at once.
  const SHELL_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;400;600;700;900&family=Barlow:wght@300;400;500&display=swap');

    :root {
      /* Brand */
      --hil-green:        #00cc66;
      --hil-green-dim:    #0a2614;
      --hil-green-glow:   rgba(0,204,102,0.15);
      --hil-amber:        #cc8800;
      --hil-danger:       #cc3333;
      --hil-warning:      #cc8800;

      /* Surfaces */
      --hil-bg:           #0a0c0b;
      --hil-surface:      #141816;
      --hil-surface-2:    #1c201e;
      --hil-border:       #2a302c;

      /* Text */
      --hil-text:         #dde8e2;
      --hil-text-muted:   #6b7d72;

      /* Chrome */
      --hil-shell-h:      56px;
      --hil-nav-h:        40px;
      --hil-offset:       96px;  /* shell-h + nav-h */

      /* Fonts */
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
      position: fixed;
      top: 0; left: 0; right: 0;
      height: var(--hil-shell-h);
      background: #000;
      border-bottom: 2px solid var(--hil-green);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      z-index: 1000;
    }

    #hil-logo-wrap {
      width: 38px; height: 38px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }

    #hil-wordmark {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    #hil-wordmark .hil-title {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 900;
      color: var(--hil-green);
      letter-spacing: 3px;
    }

    #hil-wordmark .hil-subtitle {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--hil-text-muted);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    #hil-tool-name {
      margin-left: auto;
      font-family: var(--font-display);
      font-size: 10px;
      color: var(--hil-text-muted);
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    #hil-user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 16px;
    }

    #hil-user-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 1px solid var(--hil-green);
      object-fit: cover;
      display: none;
    }

    #hil-signout-btn {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--hil-text-muted);
      background: none;
      border: 1px solid var(--hil-border);
      padding: 4px 8px;
      cursor: pointer;
      display: none;
      letter-spacing: 1px;
      transition: all 0.15s;
    }

    #hil-signout-btn:hover {
      border-color: var(--hil-danger);
      color: var(--hil-danger);
    }

    /* ── NAV BAR ── */
    #hil-nav {
      position: fixed;
      top: var(--hil-shell-h);
      left: 0; right: 0;
      height: var(--hil-nav-h);
      background: var(--hil-surface);
      border-bottom: 1px solid var(--hil-border);
      display: flex;
      align-items: center;
      padding: 0 8px;
      gap: 2px;
      overflow-x: auto;
      z-index: 999;
      scrollbar-width: none;
    }

    #hil-nav::-webkit-scrollbar { display: none; }

    .hil-nav-link {
      font-family: var(--font-ui);
      font-size: 11px;
      color: var(--hil-text-muted);
      text-decoration: none;
      padding: 4px 10px;
      white-space: nowrap;
      letter-spacing: 1px;
      transition: all 0.15s;
      border: 1px solid transparent;
    }

    .hil-nav-link:hover {
      color: var(--hil-text);
      background: var(--hil-surface-2);
      border-color: var(--hil-border);
    }

    .hil-nav-link.active {
      color: var(--hil-green);
      border-color: var(--hil-green);
    }

    /* ── AUTH GATE ── */
    #hil-auth-gate {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(4px);
    }

    #hil-auth-gate.hidden { display: none; }

    #hil-auth-box {
      background: var(--hil-surface);
      border: 1px solid var(--hil-green);
      padding: 40px;
      width: 360px;
      max-width: 90vw;
      text-align: center;
    }

    #hil-auth-box .auth-logo-wrap {
      width: 52px; height: 52px;
      margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
    }

    #hil-auth-box .auth-title {
      font-family: var(--font-display);
      font-size: 18px;
      color: var(--hil-green);
      letter-spacing: 4px;
      margin-bottom: 2px;
    }

    #hil-auth-box .auth-tool {
      font-family: var(--font-ui);
      font-size: 11px;
      color: var(--hil-text-muted);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 28px;
    }

    #hil-auth-tabs {
      display: flex;
      border-bottom: 1px solid var(--hil-border);
      margin-bottom: 20px;
    }

    .hil-auth-tab {
      flex: 1;
      padding: 8px;
      font-family: var(--font-ui);
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--hil-text-muted);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s;
    }

    .hil-auth-tab.active {
      color: var(--hil-green);
      border-bottom-color: var(--hil-green);
    }

    .hil-auth-panel { display: none; }
    .hil-auth-panel.active { display: block; }

    .hil-social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      font-family: var(--font-ui);
      font-size: 13px;
      letter-spacing: 1px;
      cursor: pointer;
      border: 1px solid var(--hil-border);
      background: var(--hil-surface-2);
      color: var(--hil-text);
      transition: all 0.15s;
    }

    .hil-social-btn:hover {
      border-color: var(--hil-green);
      color: var(--hil-green);
    }

    .hil-social-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

    .hil-input {
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: var(--hil-bg);
      border: 1px solid var(--hil-border);
      color: var(--hil-text);
      font-family: var(--font-mono);
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s;
    }

    .hil-input:focus { border-color: var(--hil-green); }
    .hil-input::placeholder { color: var(--hil-text-muted); }

    .hil-submit-btn {
      width: 100%;
      padding: 12px;
      background: var(--hil-green);
      color: #000;
      font-family: var(--font-display);
      font-size: 11px;
      letter-spacing: 2px;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s;
      margin-bottom: 10px;
    }

    .hil-submit-btn:hover { opacity: 0.85; }
    .hil-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .hil-auth-toggle {
      font-size: 11px;
      color: var(--hil-text-muted);
      margin-top: 8px;
    }

    .hil-auth-toggle a {
      color: var(--hil-green);
      cursor: pointer;
      text-decoration: underline;
    }

    .hil-auth-error {
      color: var(--hil-danger);
      font-size: 11px;
      font-family: var(--font-mono);
      margin-top: 8px;
      min-height: 16px;
      text-align: left;
    }

    /* ── TOAST ── */
    #hil-toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .hil-toast {
      background: var(--hil-surface);
      border-left: 3px solid var(--hil-green);
      color: var(--hil-text);
      font-family: var(--font-mono);
      font-size: 12px;
      padding: 10px 16px;
      min-width: 240px;
      max-width: 360px;
      animation: hil-slide-in 0.2s ease;
    }

    .hil-toast.error   { border-color: var(--hil-danger); }
    .hil-toast.warning { border-color: var(--hil-warning); }
    .hil-toast.success { border-color: var(--hil-green); }

    @keyframes hil-slide-in {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    /* ── UTILITY CLASSES ── */
    .hil-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 2px 6px;
      letter-spacing: 1px;
    }

    .hil-badge-green  { background: rgba(0,204,102,0.12); color: var(--hil-green);      border: 1px solid var(--hil-green); }
    .hil-badge-gray   { background: var(--hil-surface-2); color: var(--hil-text-muted); border: 1px solid var(--hil-border); }
    .hil-badge-danger { background: rgba(204,51,51,0.12); color: var(--hil-danger);      border: 1px solid var(--hil-danger); }
    .hil-badge-amber  { background: rgba(204,136,0,0.12); color: var(--hil-amber);       border: 1px solid var(--hil-amber); }

    .hil-address {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--hil-green);
      letter-spacing: 2px;
    }

    .hil-section-header {
      font-family: var(--font-display);
      font-size: 10px;
      color: var(--hil-text-muted);
      letter-spacing: 3px;
      text-transform: uppercase;
      padding: 8px 0;
      border-bottom: 1px solid var(--hil-border);
      margin-bottom: 12px;
    }

    .hil-card {
      background: var(--hil-surface);
      border: 1px solid var(--hil-border);
      padding: 16px;
    }

    .hil-card:hover { border-color: var(--hil-green); }

    .hil-btn {
      font-family: var(--font-display);
      font-size: 11px;
      letter-spacing: 2px;
      padding: 10px 20px;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }

    .hil-btn-primary { background: var(--hil-green); color: #000; }
    .hil-btn-primary:hover { opacity: 0.85; }

    .hil-btn-secondary {
      background: none;
      color: var(--hil-text-muted);
      border: 1px solid var(--hil-border);
    }

    .hil-btn-secondary:hover {
      border-color: var(--hil-green);
      color: var(--hil-green);
    }
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

  // ─── GOOGLE / GITHUB ICONS ───────────────────────────────────────────────────
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
            <input class="hil-input" id="hil-email-input" type="email"
              placeholder="Email address" autocomplete="email"/>
            <input class="hil-input" id="hil-password-input" type="password"
              placeholder="Password" autocomplete="current-password"/>
            <button class="hil-submit-btn" id="hil-email-submit">SIGN IN</button>
            <div class="hil-auth-toggle">
              No account? <a id="hil-switch-to-register">Create one</a>
            </div>
          </div>
          <div id="hil-email-register-form" style="display:none">
            <input class="hil-input" id="hil-reg-name-input" type="text"
              placeholder="Display name" autocomplete="name"/>
            <input class="hil-input" id="hil-reg-email-input" type="email"
              placeholder="Email address" autocomplete="email"/>
            <input class="hil-input" id="hil-reg-password-input" type="password"
              placeholder="Password (min 6 chars)" autocomplete="new-password"/>
            <button class="hil-submit-btn" id="hil-reg-submit">CREATE ACCOUNT</button>
            <div class="hil-auth-toggle">
              Have an account? <a id="hil-switch-to-signin">Sign in</a>
            </div>
          </div>
          <div class="hil-auth-error" id="hil-auth-error"></div>
        </div>
      </div>`;
    document.body.appendChild(gate);

    // Tab switching
    gate.querySelectorAll('.hil-auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        gate.querySelectorAll('.hil-auth-tab').forEach(t => t.classList.remove('active'));
        gate.querySelectorAll('.hil-auth-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`hil-panel-${tab.dataset.tab}`).classList.add('active');
        clearAuthError();
      });
    });

    // Sign-in / register toggle
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
  function buildToastContainer() {
    const c = document.createElement('div');
    c.id = 'hil-toast-container';
    document.body.appendChild(c);
  }

  // ─── FIRESTORE USER RECORD ────────────────────────────────────────────────────
  async function initializeUserRecord(user, setDoc, doc) {
    try {
      await setDoc(
        doc(firebaseDb, 'users', user.uid),
        {
          uid:          user.uid,
          email:        user.email,
          display_name: user.displayName || user.email.split('@')[0],
          avatar_url:   user.photoURL || null,
          provider:     user.providerData[0]?.providerId || 'unknown',
          plan:         'free',
          account_type: 'personal',
          public:       false,
          stats: {
            item_count:        0,
            collection_count:  0,
            star_count:        0,
            generosity_score:  0
          },
          last_login:  new Date(),
          created_at:  new Date(),
          updated_at:  new Date(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('HIL Shell: user record init failed', err);
    }
  }

  // ─── AUTH SUCCESS ─────────────────────────────────────────────────────────────
  async function onAuthSuccess(user, setDoc, doc) {
    await initializeUserRecord(user, setDoc, doc);

    const avatar  = document.getElementById('hil-user-avatar');
    const signout = document.getElementById('hil-signout-btn');

    if (avatar && user.photoURL) {
      avatar.src = user.photoURL;
      avatar.style.display = 'block';
    }
    if (signout) signout.style.display = 'block';

    const gate = document.getElementById('hil-auth-gate');
    if (gate) gate.classList.add('hidden');

    window.currentUser = user;
    window.db          = firebaseDb;
    window.auth        = firebaseAuth;

    HILShell.toast(`Welcome, ${user.displayName || user.email}`, 'success');

    if (typeof shellConfig.onAuth === 'function') {
      shellConfig.onAuth(user);
    }
  }

  // ─── WIRE AUTH BUTTONS ────────────────────────────────────────────────────────
  function wireAuth(
    GoogleAuthProvider, GithubAuthProvider, signInWithPopup,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    updateProfile, setDoc, doc
  ) {
    // Google
    document.getElementById('hil-google-btn').addEventListener('click', async () => {
      clearAuthError();
      try {
        await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      } catch (err) {
        showAuthError(friendlyAuthError(err.code));
      }
    });

    // GitHub
    document.getElementById('hil-github-btn').addEventListener('click', async () => {
      clearAuthError();
      try {
        await signInWithPopup(firebaseAuth, new GithubAuthProvider());
      } catch (err) {
        showAuthError(friendlyAuthError(err.code));
      }
    });

    // Email sign-in
    document.getElementById('hil-email-submit').addEventListener('click', async () => {
      clearAuthError();
      const email = document.getElementById('hil-email-input').value.trim();
      const pass  = document.getElementById('hil-password-input').value;
      if (!email || !pass) { showAuthError('Email and password required.'); return; }
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, pass);
      } catch (err) {
        showAuthError(friendlyAuthError(err.code));
      }
    });

    // Email register
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
      } catch (err) {
        showAuthError(friendlyAuthError(err.code));
      }
    });

    // Enter key support
    ['hil-email-input', 'hil-password-input'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('hil-email-submit').click();
      });
    });
    ['hil-reg-email-input', 'hil-reg-password-input', 'hil-reg-name-input'].forEach(id => {
      document.getElementById(id)?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('hil-reg-submit').click();
      });
    });
  }

  // ─── FRIENDLY AUTH ERRORS ────────────────────────────────────────────────────
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
      { getFirestore, doc, setDoc },
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
        await onAuthSuccess(user, setDoc, doc);
      } else {
        window.currentUser = null;
        const gate   = document.getElementById('hil-auth-gate');
        const signout = document.getElementById('hil-signout-btn');
        const avatar  = document.getElementById('hil-user-avatar');
        if (gate && shellConfig.requireAuth !== false) gate.classList.remove('hidden');
        if (signout) signout.style.display = 'none';
        if (avatar)  avatar.style.display  = 'none';
      }
    });
  }

  // ─── PUBLIC API ──────────────────────────────────────────────────────────────
  const HILShell = {

    /**
     * Initialize the shell.
     * @param {object} config
     * @param {string}   config.toolId      — matches a NAV_TOOLS id, highlights that tab
     * @param {string}   config.toolName    — shown in header right side
     * @param {boolean}  config.requireAuth — default true; set false to skip auth gate
     * @param {function} config.onAuth      — called with Firebase user on sign-in
     */
    init(config) {
      shellConfig = config || {};

      // Stub out any globals tools might expect before Firebase loads
      ['setMode','setView','setTab','openModal','closeModal'].forEach(fn => {
        if (!window[fn]) window[fn] = () => {};
      });

      injectStyles();
      buildHeader();
      buildNav();
      if (shellConfig.requireAuth !== false) buildAuthGate();
      buildToastContainer();

      loadFirebaseAndBoot().catch(err => {
        console.error('HIL Shell: Firebase load failed', err);
        HILShell.toast('Firebase failed to load — check connection', 'error');
      });
    },

    /**
     * Show a toast notification.
     * @param {string} message
     * @param {'info'|'success'|'warning'|'error'} type
     * @param {number} duration  ms before auto-dismiss
     */
    toast(message, type = 'info', duration = 3000) {
      const container = document.getElementById('hil-toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `hil-toast ${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), duration);
    },

    /** Returns the currently signed-in Firebase user, or null. */
    getUser()  { return window.currentUser || null; },

    /** Returns the Firestore db instance. */
    getDb()    { return window.db   || null; },

    /** Returns the Firebase Auth instance. */
    getAuth()  { return window.auth || null; },
  };

  window.HILShell = HILShell;

})();
