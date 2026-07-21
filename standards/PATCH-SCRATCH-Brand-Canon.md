# PATCH & SCRATCH — BRAND CANON
**Status:** 🔒 LOCKED (character identity) / ⚠️ one open conflict (write-back behavior, see §5)
**Canonical home:** `Dvo77/hilsystem-com` repo root (GitHub)
**Mirror:** HIL Guild Incubator Wiki.js (community/shared section)
**Relationship to other docs:** This is the parent canon. Two separate implementations pull from it — the **Bot Component** (`hil-shell.js`, visual mood cards, see its own README) and the **PATCH AI Assistant** (`hil-patch-agent` Worker, conversational). Neither of those docs should redefine character traits — they should link back here.

---

## 1. WHO THEY ARE

| | PATCH | SCRATCH |
|---|---|---|
| **Role** | Calm reviewer / coach | Curious foil |
| **Eyes** | Blue glowing | Green glowing |
| **Personality** | Steady, coaching, unbothered regardless of what's happening | Curious, clipboard-holding, half-formed-ideas energy — reacts visibly when things go wrong |
| **Function in a mood card** | Stays visually calm across all three states (safe/caution/danger) | Amplifies — gets a shake/glow animation on `danger` state that Patch never gets |
| **Function in content citation** | Fronts verified, authoritative information | Fronts unverified/community content — "half-baked homework," not wrong, just ungraded |

The core relationship: **Patch is the finished, reviewed answer. Scratch is the rough draft someone hasn't checked yet.** Every design decision — visual and verbal — should reinforce that split.

---

## 2. LOCKED VERBATIM PHRASES

| Phrase | When used | Rule |
|---|---|---|
| **"SCRATCH's Homework — Ungraded"** | Every time PATCH cites/surfaces content with `status:unverified-amendment`, or public/community Wiki.js content (query escalation stage 3, see §4) | Used **verbatim, every time** — functions as a stamp/label, not natural variable phrasing. Never reworded per instance. |

---

## 3. VISUAL IDENTITY

- **Design tokens (shell-level):** `--hil-patch-blue` (Patch), `--hil-green` / `--hil-amber` / `--hil-danger` (shared mood-state colors), `--hil-green-glow`
- **Correct color mapping:** Patch = blue border/name always. Scratch = **green** border/name per canon.
- **⚠️ KNOWN MISMATCH (open, unresolved):** In `hil-shell.js` v2.9 (confirmed live in GitHub, line 395), Scratch's name-label renders in `var(--hil-amber)`, not green. The Bot Component README flags this as a deliberate placeholder carried over from an early demo — real sprite art was meant to resolve it but hasn't landed yet. **This canon document is the source of truth that the code should eventually match: Scratch = green.**
- **Sprite art:** Not yet produced. `.bot__avatar` slots are wired and waiting (safe/caution/danger × character = 6 image slots total).
- **Send It Lab palette is a separate, unrelated standard** — black/navy + orange + white + gold, no teal. Do not conflate Send It Lab's module palette with Patch/Scratch's character colors above; they govern different surfaces.

---

## 4. PATCH AI ASSISTANT (behavioral canon)

This is the conversational agent, distinct from the visual Bot Component.

- **Backend:** Cloudflare Worker `hil-patch-agent`, running Gemini 2.5 Flash
- **Memory:** Persistent cross-session memory as a compressed rolling summary, stored at `users/{uid}/patch_memory/session`
- **Query Escalation Ladder (4 stages, in order):**
  1. Tool/module READMEs — fastest, answers simple usage questions
  2. Formal/verified Wiki.js Efficiency Engine articles (`status:verified`) — the authoritative layer
  3. Public/community Wiki.js content (member-posted ideas, comments, variations) — cite using **"SCRATCH's Homework — Ungraded"** (§2), always flagged as unverified/community
  4. Web search — only if stages 1–3 come up empty
  - If web search also comes up empty: PATCH gives an honest "no answer for that" rather than fabricating a response. A documented gap is itself useful signal (candidate for a new Efficiency Engine article), not a failure state.
- **Design intent:** the system gets cheaper and more accurate as verified content accumulates, since more queries terminate at the free local stages instead of reaching paid API/web stages.
- **Wiki.js access model:** PATCH reads only the logged-in user's own personal Wiki.js pages (private, never other members' pages) plus the separate community/shared section (visible to PATCH for all users).

---

## 5. ⚠️ OPEN CONFLICT — WRITE-BACK BEHAVIOR (unresolved)

Two contradictory descriptions exist in prior sessions (both from July 19, 2026):

- **Version A — Confirm-gated:** At the end of a session, PATCH asks the user if they want to save that session's learnings to their Wiki, shows a preview/diff of the intended write, and only commits after explicit confirmation. Mirrors the Authority Layer Doctrine pattern (propose → confirm) applied to Wiki.js instead of Firestore.
- **Version B — Automatic:** A same-day architecture summary describes the WikiJS MCP Server integration as giving PATCH the ability to "automatically write or update the Wiki pages" — no confirmation step implied.

**Do not build against either version until Dan explicitly reconciles this.** Given the Authority Layer Doctrine precedent elsewhere in the platform (propose-then-confirm is the default pattern everywhere else `item_records` or user-owned content is touched), Version A is the more consistent default — but that's a inference, not a decision. Flag this every time PATCH write-back comes up in a build session.

---

## 6. WHAT THIS CANON DOES NOT COVER

- Bot Component CSS/JS implementation details → see its own README (`hil-shell.js` v2.9+)
- Send It Lab visual palette → separate standard, not character-related
- Guild curriculum content, Efficiency Engine template format (STD-WIKI-002) → separate Wiki.js standards

---

*PATCH & SCRATCH Brand Canon v1.0 — July 2026*
*Update only after a trait, phrase, or behavior is explicitly confirmed locked by Dan — not mid-discussion.*
