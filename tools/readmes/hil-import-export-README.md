## HIL Import / Export

**File:** hil-import-export.html
**URL:** hilsystem.com/tools/hil-import-export.html
**Status:** Live — with a known shell-loading bug (see Known Limitations). Core import/export logic is functional; the platform shell (nav bar, PATCH bubble, auth gate) is not reliably rendering as of July 17, 2026.

**Purpose:** Move inventory data in and out of the HIL Vault. Bring data in from other home-inventory apps or a spreadsheet; take your own HIL data out in whatever format you need (JSON, CSV, Markdown, or a full "Estate Package" for provenance/legacy purposes). Built on the platform's "your data stays yours, no lock-in" principle — this tool exists specifically so nobody is ever trapped in HIL.

## Core Features

### Import to Vault (left panel)
- **Source app selector:** HIL Backup, HomeBox, Generic CSV, JSON — with Sortly, Grocy, and Snipe-IT shown as "coming soon" (not yet built, correctly disabled in the UI)
- **File format toggle:** JSON or CSV
- **Drag-and-drop or click-to-browse** file picker, accepts `.json`/`.csv`, 10MB max
- **Field mapping table:** for CSV imports, auto-detects likely column matches (e.g. a column named "addr" auto-maps to the `address` field) and lets the user manually map anything it didn't catch
- **Preview table:** shows the first 5 parsed rows before committing anything
- **Import button** writes rows into `staged_items` (NOT directly into `item_records` — matches the platform's Authority Layer Doctrine; a human/backend step is still required to promote staged rows into real inventory)

### Export Vault (right panel)
- **Export format:** JSON (full backup, AI-readable), CSV (spreadsheet), Markdown (wiki-paste-friendly table), or Estate Package (a formatted provenance document per item — description, location, condition, value — intended for legacy/estate use)
- **Scope selector:** All Items, Staged Only, or By Zone (with a zone-code text filter)
- Triggers a real browser file download, no server round-trip needed beyond the initial Firestore read

### Quick Downloads (bottom right panel)
No sign-in required for this section. Static reference files:
- CSV template (blank, pre-labelled HIL fields)
- JSON template (starter schema + example record)
- HL Grammar Spec as a plain-text `.txt` — paste into any AI to teach it the addressing grammar
- Home Assistant YAML starter snippet
- Links out to Label Studio for the printable label sheet and Starter Pack

### Converters — Supported Apps
A small status list showing which import sources are live (HomeBox) vs. planned (Sortly, Grocy, Snipe-IT).

## Known Limitations

- **Shell loading intermittently fails (open issue, July 17, 2026):** on at least one live test, the page displayed "shell load failed" / "Platform shell not ready — reload page," and the tool fell back to rendering its own separate nav bar instead of the shared platform nav. If a user reports the PATCH bubble or main nav missing on this page specifically, this is the known cause — advise a hard refresh first; if it persists, it needs developer attention, not user troubleshooting.
- **Fixed today, for reference:** earlier versions of this tool authenticated anonymously via a separate, self-contained Firebase app instance (with placeholder config values), meaning imported data could get staged under a random throwaway session ID instead of the user's real account. This was corrected to reuse the platform's shared, already-signed-in user — but if anyone reports import data "disappearing" from before July 17, 2026, this bug is the likely explanation; that data was staged under an anonymous UID and is not recoverable through the normal account.
- **Grammar spec download was also fixed today:** the downloadable "HL Grammar Spec" `.txt` file and the CSV/JSON templates previously used an outdated, incorrect address format (`STRUCT-ZONE-WALL-POS-LEVEL`, numeric levels). Now corrected to match the real canonical format (`STRUCT-ZONE-ANCHOR+COL-LEVEL+DEPTH`, letter levels bottom-up).
- No conflict/duplicate detection on import — re-importing the same file twice will create duplicate `staged_items` rows.
- Sortly, Grocy, and Snipe-IT converters are UI stubs only — clicking them does nothing yet, correctly shown as disabled/"coming soon."

---

**Common questions this doc answers (for PATCH):**
- "Where did my imported items go?" → They land in `staged_items`, not directly in inventory — they still need to be reviewed/committed (e.g. via Vault) before they count as real inventory.
- "My import from last week is missing." → If it was imported before July 17, 2026, it may have been staged under an anonymous session due to a since-fixed auth bug — it likely isn't recoverable.
- "Can I get my data out of HIL if I stop using it?" → Yes — Export Vault supports full JSON, CSV, Markdown, or a formatted Estate Package, no lock-in.
- "The nav bar or PATCH bubble isn't showing on this page." → Known open issue as of July 17, 2026 — the shared platform shell can fail to load on this specific page. Suggest a hard refresh; if it persists, flag it as a bug, don't troubleshoot as user error.
- "What's the HL Grammar Spec download for?" → A plain-text copy of the addressing grammar meant to be pasted into any AI assistant to teach it the system — useful outside the platform entirely.

*hil-import-export README v1.0 — July 17, 2026*
