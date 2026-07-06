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
 * Assumes `firebase.auth()` is already initialized via hil-shell.js.
 */

const HIL_ADMIN_ACTION_BASE = "https://hil-admin-action-937314472168.us-central1.run.app";

async function getIdToken() {
  const user = firebase.auth().currentUser;
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
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error || `Request to ${path} failed (${resp.status})`);
  }
  return data;
}

/**
 * Adding a new item from Vault's add-item form.
 * Step 1: write to staged_items (frontend IS allowed to do this).
 * Step 2: call /commit-staged to have Cloud Run promote it to item_records.
 */
async function vaultAddItem(db, ownerUid, itemFields) {
  const stagedRef = db.collection("staged_items").doc();
  await stagedRef.set({
    id: stagedRef.id,
    owner_uid: ownerUid,
    source: "manual",
    status: "pending",
    subject: itemFields.display_name || "",
    parsed: {
      name: itemFields.display_name || "",
      description: itemFields.description || "",
      attachments: itemFields.photos || [],
    },
    created_at: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // The "confirm" tap in Vault's UI triggers this immediately —
  // no separate approval screen for manual entries.
  return callAdminAction("/commit-staged", { staged_item_id: stagedRef.id });
}

/**
 * Editing an existing item from Vault's item detail view.
 * fields = only the keys the user actually changed.
 */
async function vaultUpdateItem(ownerUid, itemId, fields) {
  return callAdminAction("/update-item", {
    owner_uid: ownerUid,
    item_id: itemId,
    fields,
  });
}

/**
 * Deleting (archiving) an item from Vault.
 * There is no hard-delete path — this always soft-deletes.
 */
async function vaultArchiveItem(ownerUid, itemId, reason) {
  return callAdminAction("/archive-item", {
    owner_uid: ownerUid,
    item_id: itemId,
    reason,
  });
}

window.HILVaultClient = {
  vaultAddItem,
  vaultUpdateItem,
  vaultArchiveItem,
};
