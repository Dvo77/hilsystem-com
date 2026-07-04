## HIL Exchange

**File:** hil-exchange.html
**URL:** exchange.hilsystem.com (planned) — currently served from `tools/hil-exchange.html`
**Status:** Beta

**Purpose:** Lets users list household items for barter, trade, sale, or auction, brokering the introduction and listing only — HIL never touches money or shipping.

**Core Features:**
- Five transaction modes on a listing: Auction, Sell, Barter, Trade, and Brag (display with pride, no price posted, converts to a real listing if the right offer comes in)
- Ring system controls visibility: Ring 1 = household/pod, Ring 2 = maker/collector network, Ring 3 = public/estate (no login required to browse)
- Listing flow pulls the item directly from the user's Vault (`item_records`) — name, HL address, and photo carry over automatically once picked; manual entry fallback exists for items not yet inventoried
- Auction mode: 3/5/7 day window with optional Buy It Now price
- Manage Listing: the owner can change status (Active/Pending/Sold/Withdrawn/Expired), edit price or barter/trade terms, edit reference price, or delete the listing outright, all from the listing card
- Filter bar and sidebar nav filter the live grid by Ring, by mode, or to "Mine Only"
- Upvote/star system on listings; inquiries write a trade-request record the owner can review
- Reference Price field on every listing (manual entry today — see limitations)
- Broker disclaimer shown at listing confirmation: HIL doesn't process payments; buyer and seller arrange that directly

**How it connects:**
- Reads from: `users/{uid}/item_records` (Vault) to populate the item picker; `exchange_listings` for the live grid; `users/{uid}` for Generosity Score stats
- Writes to: `exchange_listings` (create/update/delete), `exchange_listings/{id}/upvotes`, `exchange_listings/{id}/trade_requests`
- Entry points: currently only the Exchange page itself ("+ List Item" / "Quick List") — not yet wired to the Family Ledger item detail overlay described in the locked spec
- Cross-tool data flow: item name/address/photo pull from the Vault record at listing time, but the connection is one-way — listing an item does **not** yet flip the `display.exchange` flag back on the source `item_record`, so Vault won't show "currently listed" status

**Known limitations / not yet live:**
- No real eBay price lookup — "Reference Price" is manual entry only (`baseline_source: 'manual'`); Browse API integration is planned but not wired
- "Push to eBay" button is visible on every card but disabled — placeholder for the future Sell/Inventory API integration, not functional yet
- "Ending Soon" filter shows all live auctions but can't sort by actual time remaining — `auction.start_time`/`end_time` aren't computed or stored at save time, only `duration_days`
- History Wall section exists in the UI but has no live Firestore wiring yet — always shows the static empty state
- Not entry-pointed from Family Ledger yet — listing has to start from the Exchange page directly
- No Poshmark or other marketplace push targets — eBay is first in line once the push feature itself is built
- Legacy Mode (estate liquidation / bulk-list-everything workflow) is not built

**Common questions this tool answers:**
- "Can I trade an item instead of selling it?" → Yes — Barter, Trade, Sell, and Auction are all modes on one listing, not separate tools.
- "Who can see my listing?" → Depends on the Ring you pick: household/pod only, maker network, or fully public.
- "How do I know what my stuff is worth?" → Right now you enter a ballpark reference price yourself; automatic eBay pricing isn't live yet.
- "Can I edit or take down a listing after I post it?" → Yes — click "Manage" on your own listing card to change status, edit terms, or delete it.
- "Can this list my item on eBay automatically?" → Not yet. There's a placeholder button showing where that's headed, but it isn't functional yet.
- "What happens if nobody bids on my auction?" → Per spec, unsold auctions are meant to fall back to fixed Sell automatically — this isn't implemented yet, so check back and switch modes manually via Manage for now.
