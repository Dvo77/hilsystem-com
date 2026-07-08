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

window.HILVaultClient = {
  vaultUpdateItem,
  vaultArchiveItem,
  vaultCommitStaged,
};
