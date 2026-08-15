// hil-slot-generator.js
// Shared canonical slot generator — HIL Containment Reconciliation v2, Phase 1.
//
// Formalizes vessel_types as a real generator (Reconciliation v2 §9, confirmed
// decorative in §17): selecting a vessel_type previously had zero effect on what
// slots got created in either hl-vault-cloud.html or hil-vessel-builder.html —
// slot count was driven entirely by a separately-entered number. This module is
// the one place that actually turns a vessel_type into slots, so both tools stay
// in sync instead of re-implementing this twice (and drifting again).
//
// Canonical shape (Reconciliation v2 §4): vessels/{vesselId}/slots/{slotId}
//   { slotId, label, row, column, capacityMode, slotType }
// A slot stores structure/capacity only, never occupancy. Legacy occupancy
// fields (item_id, kit_id, bin_label, fill_level) may already be present on a
// slot doc when this module writes to it — per Reconciliation v2 §16, locking
// those down is explicitly deferred to end-of-Phase-1, after migration is
// verified (doing it now would break Vessel Builder's still-live per-slot kit
// assignment). generateCanonicalSlots() below uses setDoc(..., {merge:true})
// specifically so it can never wipe an occupancy field it doesn't know about.
//
// vessel_types itself turned out to be a sixth, previously-uncatalogued
// divergence: hl-vault-cloud.html's inline "+ Define a new grid type…" flow
// writes a minimal {name, columns} doc, while hil-vessel-builder.html's Type
// editor writes a richer {structure_shape, slot_count, slot_layout:{rows,cols},
// slot_id_pattern} doc. Both shapes exist in production today. normalizeVesselType()
// reconciles both into one internal {rows, cols, pattern} reading so this
// generator works regardless of which tool created the type doc.

/**
 * Reconcile a vessel_types doc (either known live shape, or none) into a plain
 * grid description, or null if the type carries no slot-bearing information at
 * all (single_blob / no type selected / an empty type doc).
 *
 * @param {object|null} type - a vessel_types doc, or null if none selected
 * @param {number|null} [fallbackCount] - total slot count to fall back to when
 *   the type itself has no grid/count info of its own. This is what lets a
 *   vessel created without picking a real type keep behaving exactly like
 *   today's flat v-slot-count field — single row, N columns, nothing changes
 *   for the common case where nobody bothered defining a type.
 * @returns {{rows:number, cols:number, pattern:string|null}|null}
 */
export function normalizeVesselType(type, fallbackCount) {
  if (type) {
    // Explicit opt-out — Vessel Builder's own slotsAllowed() gate.
    if (type.structure_shape === 'single_blob') return null;

    // Vessel Builder shape: slot_layout.{rows,cols} wins when both are set —
    // it's the most explicit description of intent available.
    if (type.slot_layout && type.slot_layout.rows && type.slot_layout.cols) {
      return {
        rows: Math.max(1, parseInt(type.slot_layout.rows, 10) || 1),
        cols: Math.max(1, parseInt(type.slot_layout.cols, 10) || 1),
        pattern: type.slot_id_pattern || null,
      };
    }

    // Vault modal shape: flat {columns} only. Wrap the requested total (or the
    // type's own slot_count, if it has one) into rows of that width — this is
    // what actually gives the previously-decorative column count real effect.
    if (type.columns) {
      const cols = Math.max(1, parseInt(type.columns, 10) || 1);
      const total = fallbackCount || type.slot_count || cols;
      const rows = Math.max(1, Math.ceil(total / cols));
      return { rows, cols, pattern: type.slot_id_pattern || null };
    }

    // Vessel Builder shape with only a flat slot_count (compartmented /
    // shelf_unit types with no explicit row/col grid) — single row, N columns.
    if (type.slot_count) {
      return {
        rows: 1,
        cols: Math.max(1, parseInt(type.slot_count, 10) || 1),
        pattern: type.slot_id_pattern || null,
      };
    }
  }

  // No type selected, or a type with none of the above set — flat single row
  // of fallbackCount slots. Matches today's behavior exactly when nobody picks
  // a type, which is still the common case live.
  if (fallbackCount && fallbackCount > 0) {
    return { rows: 1, cols: fallbackCount, pattern: null };
  }
  return null;
}

// 0-based row index -> spreadsheet-style letters (A, B, ... Z, AA, AB, ...).
// Used only for grid generation from a row COUNT. Vessel-in-vessel nesting
// below uses the live tier->letter mapping instead (see translateNestingPosition).
function rowLetterFromIndex(rowIndex) {
  let n = rowIndex + 1, s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function slotIdFor(row, column, pattern) {
  if (pattern) return pattern.replace('{row}', row).replace('{column}', String(column));
  return `${row}${column}`;
}

/**
 * Generate (or re-affirm) the canonical slot subcollection for a vessel, from
 * an already-normalized grid description. Idempotent by construction: doc ID
 * is the deterministic slotId (not an auto ID), written with setDoc(...,
 * {merge:true}) so calling this twice — or running it after the migration
 * script has already touched the same slot — never duplicates or wipes data.
 *
 * Call this ONLY on initial vessel creation, never on edit — it must not be
 * able to clobber slots someone has since hand-curated (relabeled, assigned a
 * kit/item, etc).
 *
 * @param {{collection:Function, doc:Function, setDoc:Function}} sdk - Firestore
 *   modular SDK functions, already bound to the caller's imported firebase-firestore.js
 * @param {object} db - Firestore db instance (window.db)
 * @param {string} uid - owner uid
 * @param {string} vesselId - the vessel's doc id
 * @param {{rows:number, cols:number, pattern:string|null}|null} grid - normalizeVesselType() output
 * @param {{defaultCapacityMode?:string, defaultSlotType?:string}} [opts]
 * @returns {Promise<string[]>} slotIds written (empty array if grid is null — nothing to do)
 */
export async function generateCanonicalSlots(sdk, db, uid, vesselId, grid, opts = {}) {
  if (!grid) return [];
  const { collection, doc, setDoc } = sdk;
  const capacityMode = opts.defaultCapacityMode || 'single';
  const slotType = opts.defaultSlotType || 'item_slot';
  const base = collection(db, 'users', uid, 'vessels', vesselId, 'slots');
  const written = [];
  for (let r = 0; r < grid.rows; r++) {
    const row = rowLetterFromIndex(r);
    for (let c = 1; c <= grid.cols; c++) {
      const slotId = slotIdFor(row, c, grid.pattern);
      await setDoc(doc(base, slotId), {
        slotId, label: slotId, row, column: c,
        capacityMode, slotType,
      }, { merge: true });
      written.push(slotId);
    }
  }
  return written;
}

// Same tier -> LEVEL-letter mapping already live in hl-vault-cloud.html's
// vesselTierLetter() (tier 1 = bottom = 'A'). Reused identically on purpose,
// not reinvented — the two must stay in lockstep since existing hl_address
// strings already encode this mapping.
function tierLetter(tier) {
  const n = parseInt(tier, 10);
  if (!n || n < 1 || n > 26) return '?';
  return String.fromCharCode(64 + n);
}

/**
 * Position-translation step (Reconciliation v2 §4/§10): converts Vault modal's
 * vessel-in-vessel nesting grammar (tier/height/width/bay) into a row/column
 * address inside the PARENT vessel's own canonical slot grid, since the two
 * live tools used incompatible addressing grammars and row/column is what wins
 * (§4). A 'full'-width bay logically spans both column positions in its row —
 * that collision rule is unchanged and still enforced by the existing
 * vesselSlotOccupied() check in hl-vault-cloud.html, not by this function.
 *
 * This only translates the ADDRESS. Which vessel currently occupies that slot
 * is still tracked via the existing parent_ref/slot_position fields on the
 * child vessel through Phase 1 — that occupancy fact moves to `placements` in
 * Phase 2, same as every other occupancy fact this reconciliation defers.
 *
 * @param {number|string} tier - 1-based, bottom-up (matches vesselTierLetter)
 * @param {'full'|'half'} width
 * @param {'1'|'2'|null} bay - only meaningful when width === 'half'
 * @returns {{row:string, column:number, slotId:string, capacityMode:string, slotType:string, label:string}}
 */
export function translateNestingPosition(tier, width, bay) {
  const row = tierLetter(tier);
  const column = width === 'half' ? (parseInt(bay, 10) || 1) : 1;
  return {
    row, column,
    slotId: slotIdFor(row, column, null),
    capacityMode: 'single',
    slotType: 'vessel_bay',
    label: width === 'full' ? `${row} (Full)` : `${row}${column}`,
  };
}
