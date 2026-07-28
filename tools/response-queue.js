/**
 * RESPONSE QUEUE — shared module for admin-graded free-text answers
 * Guild-wide infrastructure, not Foundations-specific. This is the fourth
 * scoring paradigm alongside Time (session-logger.js), Score (client-side
 * exact-match grading), and AI confirmation (proctored judgment calls) — see
 * SCORING-PARADIGMS.md for when to reach for which one. Any module can
 * import this: Foundations' Tier 3/4 modules were the first users, not the
 * only intended ones.
 *
 * SCHEMA CHOICE: response_submissions is a top-level collection, filtered by
 * owner_uid — same pattern as staged_items in Import/Export, not the nested
 * users/{uid}/team_members/{memberId}/... pattern session_log_entries uses.
 * Reasoning: an admin reviewing submissions needs to query across the whole
 * household in one shot; a top-level collection + owner_uid filter matches
 * that access pattern the way staged_items already does. session_log_entries
 * stays nested because it's always read scoped to one member at a time.
 *
 * FIXED (this pass): writeApprovedEntry() previously hand-wrote its own
 * addDoc() call with a payload missing owner_uid/member_id — the exact two
 * fields the live Firestore rule requires on every session_log_entries
 * create:
 *   allow create: if request.auth.uid == uid
 *                 && request.resource.data.owner_uid == uid
 *                 && request.resource.data.member_id == memberId;
 * Every approval write would have failed permission-denied, silently, since
 * resolveSubmission() never checked the result — the submission would flip
 * to "approved" in the queue while the actual credit never landed. Now
 * routes through session-logger.js's writeSessionLogEntry(), which injects
 * owner_uid/member_id/created_at the same way every other module's writes
 * do, and uses the same field shape SessionLogger._buildEntry() produces
 * (activeMinutes, not creditedSeconds) so the Ledger UI reads it correctly.
 *
 * NEW entryType: 'response_review' is not yet in the documented entryType
 * vocabulary alongside 'module_activity' | 'tutor_session' |
 * 'mastery_verification' — kept as-is since it's a genuinely distinct kind
 * of entry (admin-graded, not self-timed), but this needs to be added to
 * the Universal Scoring & Session Logging Spec explicitly, not just live
 * in code.
 *
 * DROP-IN PATTERN for any module (module_id/module_name identify the caller,
 * nothing else here is module-specific):
 *   import { submitResponse, watchMySubmissions } from '../response-queue.js';
 *   const id = await submitResponse(window.db, {
 *     uid: user.uid, memberId: activeMember.id, memberName: activeMember.name,
 *     moduleId: 'ambiguity-lab', moduleName: 'Ambiguity Lab',
 *     promptId: 'amb-03', promptText: '...', answerText: '...',
 *   });
 */

import {
  collection, addDoc, doc, updateDoc, getDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { writeSessionLogEntry } from './session-logger.js';

const COLLECTION = 'response_submissions';

// ---------- LEARNER SIDE ----------

/**
 * Submits one free-text answer for admin review. Returns the new doc ID.
 * moduleName/memberName are denormalized (stored on the doc, not just
 * looked up by ID) specifically so the admin queue can show them at a
 * glance without a join per row — same reasoning as staged_items denormalizing
 * whatever it can at write time.
 */
export async function submitResponse(db, {
  uid, memberId, memberName, moduleId, moduleName, promptId, promptText, answerText,
}) {
  const ref = await addDoc(collection(db, COLLECTION), {
    owner_uid: uid,
    member_id: memberId,
    member_name: memberName || 'Unnamed member',
    module_id: moduleId,
    module_name: moduleName,
    prompt_id: promptId,
    prompt_text: promptText,
    answer_text: answerText,
    status: 'pending',
    admin_note: null,
    credited_minutes: null,
    submitted_at: serverTimestamp(),
    resolved_at: null,
    resolved_by: null,
  });
  return ref.id;
}

/**
 * Live status feed for one learner's own submissions — this is the UI gap
 * flagged earlier: Tier 3/4 doesn't get the instant Wrap-Up-to-Ledger flow
 * Tier 1 has, so the module needs to show "Submitted — waiting on review"
 * somewhere. Call this on the module's own page; unsubscribe on unload.
 */
export function watchMySubmissions(db, uid, memberId, callback) {
  const q = query(
    collection(db, COLLECTION),
    where('owner_uid', '==', uid),
    where('member_id', '==', memberId),
    orderBy('submitted_at', 'desc'),
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ---------- ADMIN SIDE ----------

/** Live feed of everything awaiting review, newest first. */
export function watchPendingQueue(db, callback) {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'pending'),
    orderBy('submitted_at', 'asc'), // oldest-pending-first — fairness default
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Resolves one submission. action is 'approve' | 'reject' | 'revise'.
 * - approve: writes the actual session_log_entries credit (creditedMinutes
 *   is whatever the admin negotiated with the learner — never computed by
 *   a timer here, matching the stated policy for Tier 3/4).
 * - reject / revise: no credit written; adminNote should say why, since a
 *   bare rejection with no reason is a dead end for the learner.
 */
export async function resolveSubmission(db, submissionId, {
  action, adminUid, adminNote = null, creditedMinutes = null,
}) {
  if (!['approve', 'reject', 'revise'].includes(action)) {
    throw new Error(`resolveSubmission: unknown action "${action}"`);
  }
  const subRef = doc(db, COLLECTION, submissionId);
  const snap = await getDoc(subRef);
  if (!snap.exists()) throw new Error('resolveSubmission: submission not found');
  const sub = snap.data();

  const statusMap = { approve: 'approved', reject: 'rejected', revise: 'revise' };

  await updateDoc(subRef, {
    status: statusMap[action],
    admin_note: adminNote,
    credited_minutes: action === 'approve' ? creditedMinutes : null,
    resolved_at: serverTimestamp(),
    resolved_by: adminUid,
  });

  if (action === 'approve') {
    await writeApprovedEntry(db, sub, creditedMinutes);
  }
}

/**
 * Writes the credit-granting Ledger entry once an admin approves. Routed
 * through the shared writeSessionLogEntry() helper (see FIXED note at top
 * of file) so owner_uid/member_id/created_at are injected the same way
 * every other module's write already works, and the field shape matches
 * what SessionLogger._buildEntry() produces elsewhere (activeMinutes, not
 * creditedSeconds) so the real Ledger UI reads it correctly.
 */
async function writeApprovedEntry(db, sub, creditedMinutes) {
  const entry = {
    entryId: crypto.randomUUID().slice(0, 8),
    moduleId: sub.module_id,
    entryType: 'response_review', // new value — see NEW entryType note at top of file
    timestampStart: sub.submitted_at,
    timestampEnd: new Date().toISOString(),
    activeMinutes: creditedMinutes || 0,
    subjectsTagged: [],
    conceptTags: [],
    outcome: 'admin_approved',
    accuracy: null,
    verifiedBy: 'human',
    tier: null,
    description: `Admin-reviewed response for "${sub.prompt_text.slice(0, 60)}${sub.prompt_text.length > 60 ? '…' : ''}" — approved.`,
    auto_flushed: false,
  };
  await writeSessionLogEntry(db, sub.owner_uid, sub.member_id, entry);
}
