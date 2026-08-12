## HIL People

**File:** `tools/hil-people.html`
**URL:** `hilsystem.com/tools/hil-people.html`
**Status:** Live

**Purpose:** Standalone record for a real person — living or historical — so
provenance ("belonged to my grandfather"), family history, and genealogy can
live in one place instead of being retyped on every item, museum piece, or
story that mentions them.

**Core Features:**
- Identity, occupation, primary location, photo, born/died dates, burial
  place, free-text biography/provenance story
- Spouse, father, mother, and any number of children as relationship links —
  each can point at another real person record (`person_id`) or just be a
  typed name if that person doesn't have their own record yet
- "+ Add child" from a parent's own record deep-links into a pre-filled New
  Person form with `father_id`/`mother_id` already set
- Public toggle per person — gates whether that person's page appears on the
  History Wall, same public/private split Museum uses
- Tags — same registry-backed picker as Vault items, Vessels, and Kits, all
  pulling from and writing to the one shared `tag_registry`; a tag created
  from any of those four places is immediately available in the rest
- Delete, with a clear warning that items still referencing this person keep
  their stored name/story but lose the live link
- Deep links: `?open=<id>` opens an existing record directly, `?new=1&name=…`
  opens a prefilled New Person form — used by the "+ Add child" flow and
  available for other tools to link into later

**How it connects:**
- Reads from: `people/{personId}` (owner-filtered query, real query not a
  listener — list is loaded once on tool open and refreshed after
  save/delete, not live-synced across tabs), `users/{uid}/tag_registry`
- Writes to: `people/{personId}` directly (owner-writable top-level
  collection, not nested under `users/{uid}` the way most inventory
  collections are); `users/{uid}/tag_registry` directly when a new tag is
  typed (vocabulary, not inventory truth — same write class as Vault/Vessel/
  Kit tags)
- Entry points: top nav (`People`); intended to also be reachable from
  `item_records.heritage.person_id` and Museum's associated-people field,
  though neither of those call sites is confirmed wired from this side yet
- Cross-tool data flows: tags created here show up in Tag Manager and in
  every other tag picker's autocomplete immediately, no separate sync step

**Known limitations / not yet live:**
- Photo upload is stubbed — `uploadToR2()` currently just returns the
  existing/preview URL instead of actually uploading to the
  `hilsystem-assets` R2 bucket. A photo picked in the form previews locally
  but isn't durably stored yet.
- "Preview Public Page" opens `/people/<slug>`, but no public-facing route
  for an individual person page was found in the repo as of this writing —
  the button may currently 404. Needs confirming against what's actually
  deployed before treating it as live.
- The people list loads once per tool visit rather than live-syncing — if
  Carrie and Dan both have the tool open, a record either adds elsewhere
  won't appear until the page is reloaded.
- Requires a Firestore composite index on `people` (`owner_uid` Asc +
  `display_name` Asc) — this needed to be created manually via the Firebase
  console the first time the list query ran; if the People collection is
  ever recreated on a fresh project, that index has to be rebuilt too.
- No bulk import — each person is entered one at a time through the form.

**Common questions this tool answers:**
- "This chest belonged to my great-grandmother — where do I record who she
  was?" → Create a person record for her here, with her story, dates, and
  burial place; Vault items and Museum pieces can reference her instead of
  each carrying their own copy of that text.
- "How do I build out a family tree without retyping names over and over?"
  → Link spouse/father/mother/children to each other's actual person
  records, not just typed names — "+ Add child" even prefills the new
  child's parent fields for you.
- "Can I tag people the same way I tag tools, like 'maternal side' or
  'Piper family'?" → Yes — Tags on a person record use the same tag store as
  everything else in HIL.
- "If I delete someone's record, do I lose the story on items linked to
  them?" → No — items keep their own stored copy of the name/story, they
  just lose the live link to the person record itself.
- "Can other people see this person's page?" → Only if you check "Make this
  person's page public on the History Wall" — off by default, same as
  Museum items.
