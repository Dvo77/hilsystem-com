/**
 * vault-item-client.js
 * Drop-in replacement for any Vault code that currently does:
 *   db.collection('users').doc(uid).collection('item_records').doc(id).set(...)
 *   db.collection('users').doc(uid).collection('item_records').doc(id).delete()
 *
 * Those calls will always fail now — item_records write is `false` for every
 * client per firestore.rules. Everything routes through hil-admin-action
 * (Cloud Run) using the signed-in user's Firebase ID token instead.
 *
 * Loaded via dynamic import() in hl-vault-cloud.html, so this MUST use
 * ES module `export` syntax — a plain script + window.HILVaultClient
 * will NOT work with import() and silently yields undefined functions.
 *
 * Reads the signed-in user from window.currentUser, which hil-shell.js
 * sets via the modular SDK's onAuthStateChanged (there is no global
 * `firebase` namespace on these pages — this uses the modular SDK, not
 * the old compat SDK, so we can't call firebase.auth().currentUser).
 */
const HIL_ADMIN_ACTION_BASE = "https://hil-admin-action-937314472168.us-central1.run.app";
async function getIdToken() {
  const user = window.currentUser;
  if (!user) throw new Error("Not signed in");
  return user.getIdToken();
}
async function callAdminAction(path, body) {
  const token = await getIdToken();
  const resp = await fetch(`${HIL_ADMIN_ACTION_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || `Request failed (${resp.status})`);
  }
  return data;
}
export async function vaultUpdateItem(itemId, fields) {
  return callAdminAction("/update-item", {
    item_id: itemId || null,
    fields,
  });
}
export async function vaultArchiveItem(itemId, reason) {
  return callAdminAction("/archive-item", {
    item_id: itemId,
    reason: reason || null,
  });
}
export async function vaultCommitStaged(stagedItemId) {
  return callAdminAction("/commit-staged", {
    staged_item_id: stagedItemId,
  });
}
// Related Items are a bidirectional pairwise link (distinct from Kit
// Memberships). Because linking/unlinking touches TWO item_records docs
// atomically, it can't go through /update-item (which only ever writes the
// caller's own item) — it needs its own hil-admin-action endpoint that
// verifies the caller owns both items, then batch-writes related_items on
// both docs together. action must be 'link' or 'unlink'.
export async function vaultLinkRelatedItem(itemId, relatedItemId, action) {
  return callAdminAction("/link-related-item", {
    item_id: itemId,
    related_item_id: relatedItemId,
    action,
  });
}
// Tag Store merge: folds loserTagId into winnerTagId across every
// item_record that uses it, plus marks the loser tag_registry doc as
// merged. Fan-out write across many item_records — same reasoning as
// vaultLinkRelatedItem, can't be a frontend-only operation.
export async function vaultMergeTag(loserTagId, winnerTagId) {
  return callAdminAction("/merge-tag", {
    loser_tag_id: loserTagId,
    winner_tag_id: winnerTagId,
  });
}
// Maintenance Calendar → item_records sync. Only touches the item's
// `maintenance` block (service_history append + next_service_due
// recalc) on hil-admin-action's side — never any other field. Called by
// hil-maintenance-calendar.html once per item-linked task when a
// calendar event is marked complete, so the item's own service history
// (House Brain schema) stays authoritative instead of drifting from
// what the calendar shows as done.
export async function vaultLogMaintenanceService(itemId, { type, notes, cost, receiptUrl, sourceEventId } = {}) {
  return callAdminAction("/log-maintenance-service", {
    item_id: itemId,
    type,
    notes: notes || null,
    cost: (typeof cost === 'number') ? cost : null,
    receipt_url: receiptUrl || null,
    source_event_id: sourceEventId || null,
  });
}
window.HILVaultClient = {
  vaultUpdateItem,
  vaultArchiveItem,
  vaultCommitStaged,
  vaultLinkRelatedItem,
  vaultMergeTag,
  vaultLogMaintenanceService,
};
