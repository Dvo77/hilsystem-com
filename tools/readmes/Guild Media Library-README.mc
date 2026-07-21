## Guild Media Library

**File:** Spans three files — `hil-shell.js` (viewer/library panel + concept-tag auto-display), `hil-admin.html` (Guild Media tab — upload form + recent list), `hilsystem-r2-signer.js` (Cloudflare Worker — file upload handling, `guild_media` context)
**URL:** No dedicated page. Library panel opens from a "🖼 MEDIA" button in the shared header on every tool (shell-level). Admin upload lives at the Guild Media tab inside `hil-admin.html`.
**Status:** Beta

**Purpose:** A curated library of teaching/reference assets (illustrations, diagrams, PATCH & SCRATCH shorts, printable PDFs, etc.) that any tool page or PATCH conversation can surface — so the platform can show a visual aid instead of only text, without hand-building a media system per module.

**Core Features:**
- Admin upload form (Guild Media tab, `hil-admin.html`) — pick a file + type + title/description/keywords/related concepts/assistant-use tags/tier, uploads to R2, writes the Firestore metadata doc, auto-generates the asset ID (e.g. `HERO-001`)
- Guild Media Library panel — click "🖼 MEDIA" in the header on any page, browse every active asset as a thumbnail grid, click one to view full-size
- Single-asset viewer popup — renders image/video/PDF depending on file type; opened either from the Library panel or from `HILShell.media.open(assetId)`/`.cardHTML(assetId, label)` (the latter for PATCH chat cards, not yet wired to PATCH's actual responses)
- Concept-tag auto-display — a module page calls `HILShell.media.renderForConcept('some-concept', 'container-id')` once and automatically shows any asset tagged with that concept via `related_concepts`; no asset IDs ever hardcoded into a page

**How it connects:**
- Reads from: `guild_media` Firestore collection (`isSignedIn()` required to read)
- Writes to: `guild_media` directly from the admin tab — frontend-writable, same tier as Museum/Exchange, NOT routed through `hil-admin-action`/Authority Layer, since this is curated content rather than inventory truth (`isAdmin()` — the `admins/{uid}` existence check — required to write)
- File storage: Cloudflare R2 bucket `hilsystem-assets`, path `guild-media/{type-folder}/{assetId}.{ext}`, via `hilsystem-r2-signer` Worker's `guild_media` context
- Entry points: header MEDIA button (every tool, always available); Guild Media tab in `hil-admin.html` (admin-only, for adding assets); `renderForConcept()` calls hand-placed on individual module pages (currently only on `hil-smart-home.html`)
- Cross-tool data flow: none yet — each tool that wants auto-display has to add its own `renderForConcept()` call with the right concept slug; nothing propagates automatically between tools

**Known limitations / not yet live:**
- Only one real asset seeded so far (`HERO-001`, "Home Assistant Integration," tagged `smart-home`/`fixed-points`) — library is functionally empty for testing breadth
- Image URLs currently resolve through the raw `pub-xxxx.r2.dev` R2 URL, not the branded `assets.hilsystem.com` domain — that custom domain's DNS/CDN wiring is unconfirmed; swapping it back is a one-line change in `hil-shell.js` once confirmed
- `renderForConcept()` is only wired into one page (`hil-smart-home.html`); not yet confirmed working end-to-end after the R2 URL fix — last test attempt was blocked by what looked like a Firestore permissions error but was actually a bad image URL; needs a fresh test pass
- No PATCH-side integration yet — PATCH's chat responses don't actually suggest or surface media automatically. `cardHTML()` exists as the building block for this, but nothing on the PATCH agent (Gemini Worker) side queries `guild_media` or includes a suggested asset in its replies
- No edit/delete/archive flow in the admin UI — assets can be uploaded but not modified or removed without going into Firestore/R2 directly
- No thumbnail generation — the library grid and concept strips use the full-size image as the thumbnail; large images will be slow to load in list views as the library grows
- `permissions.tier` (free/paid) is stored on each asset but not actually enforced anywhere — no UI currently filters or blocks paid-tier assets from free-tier users
- Only tested with a static image; video and PDF rendering paths are written (in `mediaBodyHTML()`) but unconfirmed against a real uploaded video/PDF

**Common questions this tool answers:**
- "How do I add a new picture or diagram to the library?" → Sign in as a platform admin, go to Admin → Guild Media tab, fill in the form (type, title, description, tags), and upload the file.
- "Where do uploaded files actually get stored?" → Cloudflare R2, in the `hilsystem-assets` bucket, organized by type (e.g. `guild-media/heroes/HERO-001.png`).
- "Can I see everything in the media library at once?" → Yes — click the "🖼 MEDIA" button in the header on any page.
- "Does PATCH automatically show me pictures related to what I'm asking about?" → Not yet — that's built as a manual per-page feature (a page can auto-display tagged media) but PATCH itself doesn't yet decide to surface assets in conversation.
- "If I upload a new asset, do I have to update every page that should show it?" → No, as long as the page already calls `renderForConcept()` with the matching tag — new uploads tagged with that same concept appear automatically, no page code changes needed.

---

## HIL Whiteboard Style Guide

Locked reference for any `whiteboard` (or `diagram`) type asset drawn via Excalidraw, so the library reads as one consistent set instead of one-off styles. Confirmed working end-to-end (Excalidraw → PNG export → Guild Media upload) as of the `HERO-001`/HL Address Grammar test asset.

**Colors:**
| Purpose | Hex | Notes |
|---|---|---|
| Background | `#0a0c0b` | Sized to actual content bounds + padding — see note below |
| Primary structure/borders | `#00cc66` | HIL green |
| Live example values / key data | `#cc8800` | HIL amber — use sparingly, as the "pop" color drawing the eye |
| Primary labels | `#dde8e2` | Off-white |
| Secondary/muted annotations | `#8a948e` | |
| Shape fill | `#0a2614` | This is the platform's `--hil-green-dim` token |

**Type scale:**
| Element | Size |
|---|---|
| Title | 28px, green |
| Subtitle | 18px, muted |
| Segment/box labels | 18px, off-white |
| Example/key values | 22px, amber |
| Descriptions/annotations | 14px, muted (minimum readable size — never go smaller) |

**Shapes:** rounded rectangles (`roundness: {type: 3}`), 2px stroke, consistent gaps between elements (20-30px minimum per Excalidraw's own readability rules).

**Camera:** default to the L size (800×600) for a standard single-frame whiteboard. Only deviate for close-ups or multi-camera animated sequences.

**Critical export rule:** the dark background rectangle must be sized to the diagram's actual bounds (content size + small padding), NOT the oversized "cover the whole pannable canvas" trick (`10000×7500` at large negative offsets). That trick is only safe for animated/multi-camera diagrams that are never exported as a flat image — using it on a static whiteboard makes the exported PNG shrink the real content to a speck in the middle of a huge black image, because Excalidraw's "Export all" captures the full bounding box of every element, including the background. If this happens, either fix it at generation time (resize the background rect) or use "Export selected" in Excalidraw instead of "Export all."

**Workflow:** draw via Excalidraw MCP tool in chat → open fullscreen in Excalidraw for any manual edits → Export → PNG (not "Save file," which produces the `.excalidraw` project format, not an image) → upload the PNG through the Guild Media admin tab, type `whiteboard`, tagged with whatever concept(s) it explains.
