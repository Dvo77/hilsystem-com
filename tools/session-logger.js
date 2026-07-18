/**
 * HIL GUILD — SESSION LOGGER v1.0
 * Shared utility implementing HIL-Guild-Module-Logging-Standard-v3.0.
 * One canonical Wrap Up + heartbeat implementation for every Guild module,
 * config-driven off each module's Module Manifest (Part 4 of the standard).
 * Replaces the hand-rolled `wrapUp()` preview function every module had
 * independently invented — this is the "actual build" called out in Part 8.
 *
 * DEPLOY PATH: hilsystem-com/tools/session-logger.js
 * LIVE URL:    https://hilsystem.com/tools/session-logger.js
 *
 * USAGE (from a module under tools/electric-forge/*.html):
 *
 *   import { SessionLogger, resolveActiveMember, writeSessionLogEntry }
 *     from '../session-logger.js';
 *
 *   const MODULE_MANIFEST = {
 *     moduleId:    'multimeter-lab',
 *     subjects:    ['physics','engineering'],
 *     conceptTags: ['ohms-law','voltmeter-placement','ammeter-placement','schematic-reading'],
 *     ageRange:    null,
 *     timeModel:   'active_session',
 *     scoringPath: 'outcome',   // 'accuracy' | 'outcome' | 'none'
 *   };
 *
 *   const logger = new SessionLogger(MODULE_MANIFEST);
 *   let activeMember = null;
 *
 *   HILShell.init({ toolId: 'multimeter-lab', toolName: 'Multimeter Lab', requireAuth: true,
 *     onAuth: async (user) => {
 *       if (!user) return;
 *       activeMember = await resolveActiveMember(window.db, user.uid);
 *       logger.start();   // starts the engagement heartbeat — call once the module is interactive
 *     }
 *   });
 *
 *   logger.onWrapUp = async (entry) => {
 *     if (!window.currentUser || !activeMember) {
 *       HILShell.toast('Sign in to save this session', 'error');
 *       return;
 *     }
 *     await writeSessionLogEntry(window.db, window.currentUser.uid, activeMember.id, entry);
 *   };
 *
 *   // Wrap Up button:
 *   async function onWrapUpClick() {
 *     const entry = await logger.wrapUp({
 *       outcome: fuseBlown ? 'mistake' : 'success',
 *       description: 'Placed probes and read a live circuit on Multimeter Lab.',
 *     });
 *     if (entry) renderLedgerPreview(entry);   // entry is the exact object written
 *   }
 *
 * KNOWN OPEN ITEM (per Part 8 / starter prompt — not this file's job to solve):
 *   Modules launched from the Guild hub don't yet receive which household member
 *   is active (hil-guild.html module cards link with a plain href, no ?member=).
 *   resolveActiveMember() below is the interim fallback — same auto-select logic
 *   as hil-guild-scores.html (linked_uid match -> role:family -> first member).
 *   Swap this for a real ?member= / inherited-context resolution once that's built.
 */

const FB_VER  = '10.12.0';
const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VER}`;

let _fsdk = null;
async function firestoreSdk() {
  if (!_fsdk) _fsdk = await import(`${FB_BASE}/firebase-firestore.js`);
  return _fsdk;
}

// ─── OUTCOME VOCABULARY (Part 5) ──────────────────────────────────────────────
// "attempted" is retired as of v3 — collapses into "mistake". Modules should
// stop emitting it; this map exists only to normalize any straggler callers.
const OUTCOME_NORMALIZE = {
  attempted: 'mistake',
  success: 'success',
  mistake: 'mistake',
  explored: 'explored',
};

function normalizeOutcome(outcome) {
  if (outcome == null) return null;
  return OUTCOME_NORMALIZE[outcome] ?? outcome;
}

// ─── ACTIVE MEMBER RESOLUTION (interim fallback, see header note) ────────────
export async function resolveActiveMember(db, uid) {
  if (!db || !uid) return null;
  const { collection, getDocs } = await firestoreSdk();
  const snap = await getDocs(collection(db, 'users', uid, 'team_members'));
  const members = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (!members.length) return null;
  return (
    members.find(m => m.linked_uid === uid) ||
    members.find(m => m.role === 'family') ||
    members[0]
  );
}

// ─── FIRESTORE WRITE (Part 2 — module_activity is frontend-writable) ─────────
export async function writeSessionLogEntry(db, uid, memberId, entry) {
  if (!db || !uid || !memberId) {
    throw new Error('writeSessionLogEntry: db, uid, and memberId are all required');
  }
  const { collection, addDoc, serverTimestamp } = await firestoreSdk();
  const ref = collection(db, 'users', uid, 'team_members', memberId, 'session_log_entries');
  const payload = {
    ...entry,
    owner_uid: uid,
    member_id: memberId,
    created_at: serverTimestamp(),
  };
  await addDoc(ref, payload);
  return payload;
}

// ─── SESSION LOGGER ────────────────────────────────────────────────────────
export class SessionLogger {
  /**
   * @param {object} manifest - Module Manifest, Part 4 of the standard.
   *   { moduleId, subjects, conceptTags, ageRange, timeModel, scoringPath }
   */
  constructor(manifest) {
    if (!manifest || !manifest.moduleId) {
      throw new Error('SessionLogger requires a manifest with at least moduleId set');
    }
    this.manifest = manifest;
    this.onWrapUp = null;      // caller sets this: async (entry) => { ...actual Firestore write... }

    this._sessionStart = null;
    this._lastTick = null;
    this._activeMs = 0;
    this._heartbeatTimer = null;
    this._wrappedUp = false;

    this._onVisibility = () => {
      if (document.hidden) this._autoFlush('backgrounded');
      else this._lastTick = Date.now(); // resume counting from now, don't credit hidden time
    };
    this._onUnload = () => this._autoFlush('unload');
  }

  /** Call once the module becomes interactive. Idempotent. */
  start() {
    if (this._sessionStart) return;
    this._sessionStart = Date.now();
    this._lastTick = this._sessionStart;
    this._wrappedUp = false;
    this._heartbeatTimer = setInterval(() => this._tick(), 5000);
    document.addEventListener('visibilitychange', this._onVisibility);
    window.addEventListener('beforeunload', this._onUnload);
  }

  /** Resets internal state so a genuinely new session can start (Part 3 duplicate-entry guard). */
  reopen() {
    this._teardown();
    this._sessionStart = null;
    this._lastTick = null;
    this._activeMs = 0;
    this._wrappedUp = false;
  }

  /** True once Wrap Up (manual or auto-flushed) has fired for this session. */
  get isWrappedUp() {
    return this._wrappedUp;
  }

  _tick() {
    if (document.hidden) return; // heartbeat only accrues foreground/engaged time
    const now = Date.now();
    this._activeMs += now - this._lastTick;
    this._lastTick = now;
  }

  _activeMinutes() {
    if (!document.hidden && this._lastTick) {
      const now = Date.now();
      this._activeMs += now - this._lastTick;
      this._lastTick = now;
    }
    return Math.max(1, Math.round(this._activeMs / 60000));
  }

  _teardown() {
    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer);
    this._heartbeatTimer = null;
    document.removeEventListener('visibilitychange', this._onVisibility);
    window.removeEventListener('beforeunload', this._onUnload);
  }

  /**
   * Builds a canonical Session Log Entry (Part 1 schema) from module-supplied
   * results. Does NOT write anywhere — that's the caller's onWrapUp.
   */
  _buildEntry({ outcome = null, accuracy = null, description = '', conceptTags = null } = {}) {
    const now = new Date();
    const scoringPath = this.manifest.scoringPath || 'none';
    return {
      entryId: crypto.randomUUID().slice(0, 8),
      moduleId: this.manifest.moduleId,
      entryType: 'module_activity',
      timestampStart: new Date(this._sessionStart).toISOString(),
      timestampEnd: now.toISOString(),
      activeMinutes: this._activeMinutes(),
      subjectsTagged: this.manifest.subjects || [],
      conceptTags: conceptTags || this.manifest.conceptTags || [],
      outcome: scoringPath === 'outcome' ? normalizeOutcome(outcome) : (scoringPath === 'none' ? (outcome ? normalizeOutcome(outcome) : 'explored') : null),
      accuracy: scoringPath === 'accuracy' ? accuracy : null,
      verifiedBy: 'self',
      tier: null,
      description,
      auto_flushed: false,
    };
  }

  /**
   * Manual Wrap Up — the primary trigger (Part 3). Session-scoped duplicate
   * guard: returns null if already wrapped up this session; caller should
   * disable the Wrap Up button once this resolves with a non-null entry.
   */
  async wrapUp(opts = {}) {
    if (this._wrappedUp || !this._sessionStart) return null;
    const entry = this._buildEntry(opts);
    this._wrappedUp = true;
    this._teardown();
    if (typeof this.onWrapUp === 'function') {
      await this.onWrapUp(entry);
    }
    return entry;
  }

  /**
   * Session-end safety net (Part 3) — tab closed or backgrounded before Wrap
   * Up was clicked. Best-effort only: browsers do not guarantee an in-flight
   * async Firestore write completes after 'beforeunload' actually fires, so
   * this is a fallback, not a substitute for the user clicking Wrap Up.
   */
  async _autoFlush(reason) {
    if (this._wrappedUp || !this._sessionStart) return;
    if (this._activeMinutes() < 1) return; // don't log near-zero engagement
    const entry = this._buildEntry({ description: `Auto-flushed (${reason}) — Wrap Up was not clicked.` });
    entry.auto_flushed = true;
    this._wrappedUp = true;
    this._teardown();
    if (typeof this.onWrapUp === 'function') {
      try {
        await this.onWrapUp(entry);
      } catch (err) {
        console.error('SessionLogger: auto-flush write failed', err);
      }
    }
  }
}
