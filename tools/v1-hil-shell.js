/**
 * HIL SHELL v2.1
 * Universal shell for all HIL/HL tools
 * Provides: Firebase init, Auth (Google + GitHub + Email), Firestore user record,
 *           fixed header, tool nav bar, auth gate overlay, toast system, CSS design tokens
 *
 * DROP-IN PATTERN (3 lines in any tool):
 *   <script src="./hil-shell.js"></script>
 *   <script>
 *     HILShell.init({ toolId: 'vault', toolName: 'HL Vault', requireAuth: true, onAuth: (user) => { ... } });
 *   </script>
 *
 * DEPLOY PATH: spatial-vector-grammar/static/tools/hil-shell.js
 * LIVE URL: https://hlsystem.org/tools/hil-shell.js
 * CHANGELOG:
 *   v2.1 — Added Family Ledger and HIL Hub to nav
 *   v2.0 — Google + GitHub + Email auth, Firestore user record init
 */

(function () {
  'use strict';

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyARjQ3kD8iz9rD-2Fl1zNASnlVDmvDeVb4",
    authDomain: "project-97444efa-3b6f-493b-b96.firebaseapp.com",
    projectId: "project-97444efa-3b6f-493b-b96",
    storageBucket: "project-97444efa-3b6f-493b-b96.firebasestorage.app",
    messagingSenderId: "937314472168",
    appId: "1:937314472168:web:5ad7b916ac01a9e649b95d"
  };

  const FB_VER  = '10.12.0';
  const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VER}`;

  // ─── NAV TOOLS LIST ─────────────────────────────────────────────────────────
  const NAV_TOOLS = [
    { id: 'hub',           label: 'Hub',          icon: '🧭', href: './hil-hub.html' },
    { id: 'vault',         label: 'Vault',        icon: '🗄', href: './hl-vault-cloud.html' },
    { id: 'museum',        label: 'Museum',       icon: '🏛', href: './hil-museum-builder.html' },
    { id: 'family-ledger', label: 'Ledger',       icon: '👥', href: './hil-family-ledger.html' },
    { id: 'field-tool',    label: 'Field Tool',   icon: '📍', href: './hil-field-tool.html' },
    { id: 'labels',        label: 'Labels',       icon: '🏷', href: './hil-label-generator.html' },
    { id: 'room-codes',    label: 'Room Codes',   icon: '🗺', href: './hl-room-code-generator.html' },
    { id: 'sign-studio',   label: 'Signs',        icon: '🪧', href: './hil-sign-studio.html' },
    { id: 'admin',         label: 'Admin',        icon: '⚙',  href: './hil-admin.html' },
  ];

  // ─── CSS DESIGN TOKENS ──────────────────────────────────────────────────────
  const SHELL_CSS = `
    :root {
      --hil-green:       #00cc66;
      --hil-green-dim:   #009944;
      --hil-bg:          #0a0a0a;
      --hil-surface:     #111111;
      --hil-surface-2:   #1a1a1a;
      --hil-border:      #222222;
      --hil-text:        #e0e0e0;
      --hil-text-muted:  #666666;
      --hil-danger:      #cc3333;
      --hil-warning:     #cc8800;
      --hil-shell-h:     56px;
      --hil-nav-h:       40px;
      --hil-offset:      96px;
      --font-display:    'Orbitron', monospace;
      --font-mono:       'Space Mono', monospace;
      --font-ui:         'Barlow Condensed', sans-serif;
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
      border-bottom: 1px solid var(--hil-green);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      z-index: 1000;
    }
    #hil-logo { width: 36px; height: 36px; flex-shrink: 0; }
    #hil-wordmark { display: flex; flex-direction: column; line-height: 1; }
    #hil-wordmark .hil-title {
      font-family: var(--font-display); font-size: 14px;
      color: var(--hil-green); letter-spacing: 3px;
    }
    #hil-wordmark .hil-subtitle {
      font-family: var(--font-ui); font-size: 10px;
      color: var(--hil-text-muted); letter-spacing: 2px; text-transform: uppercase;
    }
    #hil-tool-name {
      margin-left: auto; font-family: var(--font-display); font-size: 11px;
      color: var(--hil-text-muted); letter-spacing: 2px; text-transform: uppercase;
    }
    #hil-user-info { display: flex; align-items: center; gap: 8px; margin-left: 16px; }
    #hil-user-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      border: 1px solid var(--hil-green); object-fit: cover; display: none;
    }
    #hil-signout-btn {
      font-family: var(--font-mono); font-size: 10px; color: var(--hil-text-muted);
      background: none; border: 1px solid var(--hil-border); padding: 4px 8px;
      cursor: pointer; display: none; letter-spacing: 1px;
    }
    #hil-signout-btn:hover { border-color: var(--hil-danger); color: var(--hil-danger); }

    /* ── NAV BAR ── */
    #hil-nav {
      position: fixed;
      top: var(--hil-shell-h); left: 0; right: 0;
      height: var(--hil-nav-h);
      background: var(--hil-surface);
      border-bottom: 1px solid var(--hil-border);
      display: flex; align-items: center;
      padding: 0 8px; gap: 2px;
      overflow-x: auto; z-index: 999;
      scrollbar-width: none;
    }
    #hil-nav::-webkit-scrollbar { display: none; }
    .hil-nav-link {
      font-family: var(--font-ui); font-size: 12px; color: var(--hil-text-muted);
      text-decoration: none; padding: 4px 10px; border-radius: 3px;
      white-space: nowrap; letter-spacing: 1px; transition: all 0.15s;
      border: 1px solid transparent;
    }
    .hil-nav-link:hover { color: var(--hil-text); background: var(--hil-surface-2); }
    .hil-nav-link.active { color: var(--hil-green); border-color: var(--hil-green); }

    /* ── AUTH GATE ── */
    #hil-auth-gate {
      position: fixed; inset: 0; background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; backdrop-filter: blur(4px);
    }
    #hil-auth-gate.hidden { display: none; }
    #hil-auth-box {
      background: var(--hil-surface); border: 1px solid var(--hil-green);
      padding: 40px; width: 360px; max-width: 90vw; text-align: center;
    }
    #hil-auth-box .auth-logo { width: 52px; height: 52px; margin: 0 auto 16px; }
    #hil-auth-box .auth-title {
      font-family: var(--font-display); font-size: 20px;
      color: var(--hil-green); letter-spacing: 4px; margin-bottom: 4px;
    }
    #hil-auth-box .auth-tool {
      font-family: var(--font-ui); font-size: 11px; color: var(--hil-text-muted);
      letter-spacing: 3px; text-transform: uppercase; margin-bottom: 32px;
    }
    #hil-auth-tabs {
      display: flex; border-bottom: 1px solid var(--hil-border); margin-bottom: 24px;
    }
    .hil-auth-tab {
      flex: 1; padding: 8px; font-family: var(--font-ui); font-size: 11px;
      letter-spacing: 1px; text-transform: uppercase; color: var(--hil-text-muted);
      background: none; border: none; border-bottom: 2px solid transparent;
      cursor: pointer; transition: all 0.15s;
    }
    .hil-auth-tab.active { color: var(--hil-green); border-bottom-color: var(--hil-green); }
    .hil-auth-panel { display: none; }
    .hil-auth-panel.active { display: block; }
    .hil-social-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 12px; margin-bottom: 10px; font-family: var(--font-ui);
      font-size: 13px; letter-spacing: 1px; cursor: pointer;
      border: 1px solid var(--hil-border); background: var(--hil-surface-2);
      color: var(--hil-text); transition: all 0.15s;
    }
    .hil-social-btn:hover { border-color: var(--hil-green); color: var(--hil-green); }
    .hil-social-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
    .hil-input {
      width: 100%; padding: 10px 12px; margin-bottom: 10px;
      background: var(--hil-bg); border: 1px solid var(--hil-border);
      color: var(--hil-text); font-family: var(--font-mono); font-size: 13px;
      outline: none; transition: border-color 0.15s;
    }
    .hil-input:focus { border-color: var(--hil-green); }
    .hil-input::placeholder { color: var(--hil-text-muted); }
    .hil-submit-btn {
      width: 100%; padding: 12px; background: var(--hil-green); color: #000;
      font-family: var(--font-display); font-size: 12px; letter-spacing: 2px;
      border: none; cursor: pointer; transition: background 0.15s; margin-bottom: 10px;
    }
    .hil-submit-btn:hover { background: var(--hil-green-dim); }
    .hil-submit-btn:disabled { background: var(--hil-border); cursor: not-allowed; }
    .hil-auth-toggle { font-size: 11px; color: var(--hil-text-muted); margin-top: 8px; }
    .hil-auth-toggle a { color: var(--hil-green); cursor: pointer; text-decoration: underline; }
    .hil-auth-error {
      color: var(--hil-danger); font-size: 11px; font-family: var(--font-mono);
      margin-top: 8px; min-height: 16px; text-align: left;
    }

    /* ── TOAST ── */
    #hil-toast-container {
      position: fixed; bottom: 24px; right: 24px; z-index: 3000;
      display: flex; flex-direction: column; gap: 8px;
    }
    .hil-toast {
      background: var(--hil-surface); border-left: 3px solid var(--hil-green);
      color: var(--hil-text); font-family: var(--font-mono); font-size: 12px;
      padding: 10px 16px; min-width: 240px; max-width: 360px;
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
      font-family: var(--font-mono); font-size: 10px;
      padding: 2px 6px; border-radius: 2px; letter-spacing: 1px;
    }
    .hil-badge-green  { background: rgba(0,204,102,0.15); color: var(--hil-green); border: 1px solid var(--hil-green); }
    .hil-badge-gray   { background: var(--hil-surface-2); color: var(--hil-text-muted); border: 1px solid var(--hil-border); }
    .hil-badge-danger { background: rgba(204,51,51,0.15); color: var(--hil-danger); border: 1px solid var(--hil-danger); }
    .hil-address { font-family: var(--font-mono); font-size: 11px; color: var(--hil-green); letter-spacing: 2px; }
    .hil-section-header {
      font-family: var(--font-display); font-size: 11px; color: var(--hil-text-muted);
      letter-spacing: 3px; text-transform: uppercase;
      padding: 8px 0; border-bottom: 1px solid var(--hil-border); margin-bottom: 12px;
    }

    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Space+Mono&family=Barlow+Condensed:wght@300;400;600&display=swap');
  `;

  const LOGO_SVG = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" id="hil-logo">
      <polygon points="50,2 93,26 93,74 50,98 7,74 7,26" fill="none" stroke="#00cc66" stroke-width="3"/>
      <polygon points="50,12 83,30 83,70 50,88 17,70 17,30" fill="none" stroke="#00cc66" stroke-width="1" opacity="0.4"/>
      <line x1="50" y1="12" x2="50" y2="30" stroke="#00cc66" stroke-width="1.5"/>
      <line x1="50" y1="70" x2="50" y2="88" stroke="#00cc66" stroke-width="1.5"/>
      <line x1="17" y1="30" x2="30" y2="40" stroke="#00cc66" stroke-width="1.5"/>
      <line x1="70" y1="40" x2="83" y2="30" stroke="#00cc66" stroke-width="1.5"/>
      <line x1="17" y1="70" x2="30" y2="60" stroke="#00cc66" stroke-width="1.5"/>
      <line x1="70" y1="60" x2="83" y2="70" stroke="#00cc66" stroke-width="1.5"/>
      <polygon points="50,22 55,45 50,40 45,45" fill="#00cc66"/>
      <polygon points="50,78 55,55 50,60 45,55" fill="#00cc66" opacity="0.5"/>
      <circle cx="50" cy="50" r="6" fill="none" stroke="#00cc66" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="2" fill="#00cc66"/>
      <text x="50" y="54" text-anchor="middle" font-family="Orbitron,monospace" font-size="7" fill="#00cc66" letter-spacing="1">HIL</text>
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

  let shellConfig = {};
  let firebaseApp = null;
  let firebaseAuth = null;
  let firebaseDb = null;

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = SHELL_CSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  function buildHeader() {
    const header = document.createElement('div');
    header.id = 'hil-header';
    header.innerHTML = `
      ${LOGO_SVG}
      <div id="hil-wordmark">
        <span class="hil-title">HIL</span>
        <span class="hil-subtitle">Home Inventory Locator</span>
      </div>
      <div id="hil-tool-name">${shellConfig.toolName || ''}</div>
      <div id="hil-user-info">
        <img id="hil-user-avatar" alt="avatar"/>
        <button id="hil-signout-btn">SIGN OUT</button>
      </div>`;
    document.body.insertBefore(header, document.body.firstChild);
    document.getElementById('hil-signout-btn').addEventListener('click', () => {
      if (firebaseAuth) { firebaseAuth.signOut(); HILShell.toast('Signed out'); }
    });
  }

  function buildNav() {
    const nav = document.createElement('div');
    nav.id = 'hil-nav';
    nav.innerHTML = NAV_TOOLS.map(t => `
      <a href="${t.href}" class="hil-nav-link ${t.id === shellConfig.toolId ? 'active' : ''}" title="${t.label}">
        ${t.icon} ${t.label}
      </a>`).join('');
    document.body.insertBefore(nav, document.body.children[1]);
  }

  function buildAuthGate() {
    const gate = document.createElement('div');
    gate.id = 'hil-auth-gate';
    gate.innerHTML = `
      <div id="hil-auth-box">
        ${LOGO_SVG.replace('id="hil-logo"', 'class="auth-logo"')}
        <div class="auth-title">HIL</div>
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
      document.getElementById('hil-email-signin-form').style.display = 'none';
      document.getElementById('hil-email-register-form').style.display = 'block';
      clearAuthError();
    });
    document.getElementById('hil-switch-to-signin').addEventListener('click', () => {
      document.getElementById('hil-email-register-form').style.display = 'none';
      document.getElementById('hil-email-signin-form').style.display = 'block';
      clearAuthError();
    });
  }

  function clearAuthError() {
    const el = document.getElementById('hil-auth-error'); if (el) el.textContent = '';
  }
  function showAuthError(msg) {
    const el = document.getElementById('hil-auth-error'); if (el) el.textContent = msg;
  }

  function buildToastContainer() {
    const c = document.createElement('div');
    c.id = 'hil-toast-container';
    document.body.appendChild(c);
  }

  async function initializeUserRecord(user, setDoc, doc) {
    try {
      await setDoc(doc(firebaseDb, 'users', user.uid), {
        uid: user.uid, email: user.email,
        display_name: user.displayName || user.email.split('@')[0],
        avatar_url: user.photoURL || null,
        provider: user.providerData[0]?.providerId || 'unknown',
        plan: 'free', account_type: 'personal', public: false,
        stats: { item_count:0, collection_count:0, star_count:0, generosity_score:0 },
        last_login: new Date(), created_at: new Date(), updated_at: new Date(),
      }, { merge: true });
    } catch (err) { console.warn('HIL Shell: user record init failed', err); }
  }

  async function onAuthSuccess(user, setDoc, doc) {
    await initializeUserRecord(user, setDoc, doc);
    const avatar  = document.getElementById('hil-user-avatar');
    const signout = document.getElementById('hil-signout-btn');
    if (avatar && user.photoURL) { avatar.src = user.photoURL; avatar.style.display = 'block'; }
    if (signout) signout.style.display = 'block';
    const gate = document.getElementById('hil-auth-gate');
    if (gate) gate.classList.add('hidden');
    window.currentUser = user;
    window.db   = firebaseDb;
    window.auth = firebaseAuth;
    HILShell.toast(`Welcome, ${user.displayName || user.email}`, 'success');
    if (typeof shellConfig.onAuth === 'function') shellConfig.onAuth(user);
  }

  function wireAuth(GoogleAuthProvider, GithubAuthProvider, signInWithPopup,
                    signInWithEmailAndPassword, createUserWithEmailAndPassword,
                    updateProfile, setDoc, doc) {

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
      'auth/user-not-found':       'No account found with that email.',
      'auth/wrong-password':       'Incorrect password.',
      'auth/invalid-email':        'Invalid email address.',
      'auth/email-already-in-use': 'An account with that email already exists.',
      'auth/weak-password':        'Password must be at least 6 characters.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': 'Sign-in cancelled.',
      'auth/account-exists-with-different-credential': 'Account exists with a different sign-in method.',
      'auth/popup-blocked':        'Popup was blocked. Please allow popups for this site.',
    })[code] || `Auth error: ${code}`;
  }

  async function loadFirebaseAndBoot() {
    const [
      { initializeApp, getApps },
      { getFirestore, doc, setDoc },
      { getAuth, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider,
        signInWithPopup, signInWithEmailAndPassword,
        createUserWithEmailAndPassword, updateProfile }
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

    wireAuth(GoogleAuthProvider, GithubAuthProvider, signInWithPopup,
             signInWithEmailAndPassword, createUserWithEmailAndPassword,
             updateProfile, setDoc, doc);

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

  const HILShell = {
    init(config) {
      shellConfig = config || {};
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
        HILShell.toast('Firebase failed to load', 'error');
      });
    },

    toast(message, type = 'info', duration = 3000) {
      const container = document.getElementById('hil-toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `hil-toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : ''}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), duration);
    },

    getUser()  { return window.currentUser || null; },
    getDb()    { return window.db || null; },
    getAuth()  { return window.auth || null; },
  };

  window.HILShell = HILShell;
})();
