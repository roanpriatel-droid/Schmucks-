# Improvements log

Autonomous improvement loop. One cycle per entry: pick a lens, audit the live
build against real store data, research when uncertain, execute the top
finding, verify, ship, log. Reverts are recorded as successes, not failures.

Audits run against the production build served locally (`npm run build` + a Node
adapter over `dist/server/index.js`) because the live domain sits behind the
store's password gate. Same bundle, same Storefront API, same data.

---

## Cycle 1 — 2026-07-27 — Lens: conversion

### Found

Ranked by impact on money actually changing hands:

1. **The site's headline offer does not exist at checkout.** (critical)
   Verified by building real carts through the Storefront API:

   | Cart | Subtotal | Total | `discountAllocations` |
   |---|---|---|---|
   | 1 shirt | $42.00 | $42.00 | empty |
   | 2 shirts | $84.00 | **$84.00** | empty |
   | 4 shirts | $168.00 | **$168.00** | empty |

   Six candidate codes (`STACK10`, `STACK2`, `STACK`, `PAIR10`, `SCHMUCKS10`,
   `WELCOME10`) all returned `applicable: false`. There is no automatic
   discount and no code. Meanwhile "Stack & Save — 2 = 10%, 3 = 20%, 4+ = 30%,
   applies itself at checkout" appeared in **26 places across 13 files**:
   announcement bar, homepage marquee, Pair Programme banner, cart drawer
   upsell, cart progress meter, PDP cross-sell, matching-sets page, FAQ, shelf
   copy, /tees.

   A shopper adding a second shirt for the promised 10% reaches checkout and
   sees full price. That is the worst possible moment to break trust, and it
   is also a deceptive-pricing exposure, not just a conversion leak.

2. Currency is buyer-contextual (USD for a US buyer, CAD for CA) — prices
   already render from the API, so nothing to fix, but hardcoding a symbol
   anywhere would be wrong.
3. Free-shipping threshold ($50) can't be verified pre-address; the Storefront
   API returns no delivery options without one. Owner-stated, so retained.

### Researched

Confirmed via Shopify's own docs that a real quantity discount needs either an
admin **automatic discount** or a **Discount Function** (an app). Neither is
available inside the operating rails (no admin settings changes, no new paid
apps). Conclusion: the storefront *cannot* make this promise true, therefore it
must stop making it.

### Did

Added `STACK_DISCOUNT_LIVE` to `app/data/commerce.ts` as the single source of
truth, defaulting to `false`, with the exact cart test documented above it.
Every Stack & Save claim is now conditional on that flag. With it off:

- Announcement bar and both marquees carry three true lines (free shipping,
  printed to order, 30-day returns).
- The cart progress meter renders nothing rather than counting toward a saving
  that never arrives.
- The cart drawer upsell now sells the **real** multi-buy reason: one $42 shirt
  sits under the $50 free-shipping threshold and two clear it.
- The Pair Programme sells the concept (two people, one shared lapse in
  judgement) instead of a percentage.
- The FAQ replaces "How does Stack & Save work?" with "Do you do multi-buy
  discounts?" — answered honestly, in voice, pointing at free shipping.
- `StackLadder` (currently unrendered) is guarded so it can't reintroduce the
  claim if it's ever dropped back onto a page.

Flipping the flag to `true` restores all of it at once.

### Why

A storefront must never write a cheque the checkout can't cash. The honest
replacement is not weaker merchandising: the free-shipping threshold does the
identical "add a second shirt" job, and unlike the discount it is a promise the
basket actually keeps.

### Verified

- `tsc`, `eslint` (0 errors), `npm run build` clean.
- Rendered scan of 9 funnel pages: **0 false discount claims** sitewide
  (was 26 in source).
- Positive check that honest replacements render on home, FAQ, cart, pair page.
- 390px mobile pass on home and /matching-sets.
- Home Lighthouse 93 / 90 on re-runs (a first run of 85 was box noise), LCP
  1.2s, a11y 100, SEO 100 — no regression.

### Next

- **For the owner:** create the automatic discount in admin (Discounts →
  Automatic → 2+ = 10%, 3 = 20%, 4+ = 30%), re-run the cart test, flip
  `STACK_DISCOUNT_LIVE`. That single change is worth more than anything else on
  this list, because the merchandising is already built and waiting.
- Verify the $50 free-shipping rule actually exists in the shipping profile —
  it is now the site's only stated saving, so it carries more weight than it
  did yesterday.
- Next lens: **performance** (mobile perf was 68 in the phase-9 audit and is
  the weakest measured number on the site).

---

## Cycle 2 — 2026-07-27 — Lens: performance

### Found

Mobile Lighthouse on the homepage, measured on a settled box (load < 3):
perf 41, **FCP 4.9s == LCP 4.9s** — first paint was fully blocked. Render-blocking
chain: Google Fonts CSS (891ms, third-party origin) → schmucks.css (3045ms) →
app.css → reset.css.

Payload breakdown (mobile homepage, 25 image requests):

| Type | Requests | Transfer |
|---|---:|---:|
| Script | 25 | 401.2 KB |
| Document | 1 | 124.0 KB |
| Image | 25 | 119.7 KB |
| Stylesheet | 4 | 102.4 KB |
| Font | 2 | 66.1 KB |

- Images are already right: Hydrogen serves 400px-wide variants at ~4.5 KB each.
- JS is framework-dominated (entry.client 134 KB, vendor chunk 128 KB, Shopify's
  own perf-kit + consent 29 KB). Our application code is ~40 KB of the 401 KB.
- TTFB is healthy: 110–240 ms.
- **Defect found mid-audit:** every listing page fetched `variants(first: 20)`
  per product and threw it away. Quick-add — reported as shipped in phase 9 —
  was never actually rendering: `ProductItem` accepted the `quickAdd` prop and
  the fragments fetched the data, but no caller passed the prop. A phase-9 edit
  silently failed to match and I verified the build instead of the DOM. That is
  a reporting error on my part, recorded here as such.

### Did

1. **Self-hosted the brand faces** (`app/styles/fonts.css`, `public/fonts/`).
   Same two typefaces BRAND.md locks; only the delivery changed. Inter ships as
   the variable file (400–900 in one download) replacing five static weights,
   `unicode-range` keeps the -ext subsets from downloading unless needed, and
   the two latin files are preloaded. Removed fonts.googleapis.com and
   fonts.gstatic.com from the document and from the CSP.
2. **Removed 11.6 KB of provably dead CSS** — 95 rules whose `sx-` selectors
   appear nowhere in the app, left behind by sections deleted in phase 9 (the
   tabbed specials, the old reviews block, UGC). 126.4 KB → 114.8 KB source;
   built stylesheet 94.6 KB → 85.6 KB.
3. **Fixed quick-add** so the variant payload the site was already downloading
   is actually used: 12 cards × 7 controls now render on every listing page.

### Verified

- `tsc` clean, build clean, 4 templates screenshotted after the CSS strip with
  no visual regression; quick-add confirmed in the DOM (12 blocks, 84 size
  buttons) and at 390px.
- Collection page Lighthouse **a11y 100 · SEO 100** with the new controls live.

### Honest note on the measurement

Font self-hosting produced **no measurable local delta** (FCP ~4.9s before and
after, medians over paired runs with CPU throttling disabled to remove box
noise). The reason is that the local harness serves **uncompressed CSS over
HTTP/1.1**, so a 94 KB stylesheet dominates the critical path and masks
everything else. Oxygen serves brotli over HTTP/2, where neither of those
bottlenecks exists. I kept the change on architecture rather than on a number:
it removes an entire third-party origin (DNS + TLS + a blocking CSS round trip)
from the critical path, and it is what makes the fonts preloadable at all.

That is the honest limit of this environment: **delivery-level performance work
cannot be validated here.** Byte counts and request counts are trustworthy;
wall-clock timings are not.

### Next

- Real perf verification needs production measurement, which the store password
  gate currently blocks. Lifting it (or a preview link) would let the next perf
  cycle measure something true.
- Remaining honest byte win: 73 KB of the stylesheet is unused on any given
  page — per-route CSS splitting would fix it, but it is a real refactor with
  regression risk, so it wants a dedicated cycle.
- Next lens: **copy quality** (never audited; 393 generated sell lines currently
  come from 8 branches, and the long-tail titles deserve a look).

---

## Cycle 3 — 2026-07-27 — Lens: copy quality

### Found

Measured against all 393 real product titles, not sampled by eye:

1. **The catalogue suffix was eating the joke.** Every title carries
   "— Schmucks · N°. 359". That suffix is **21 characters against a 24-character
   median display title** — nearly half of every card's title text was repeated
   boilerplate. `splitTitle()` existed and stripped it, but was only wired into
   the PDP and the pair block. Cards, search results, the cart line items,
   recently-viewed, the errata rail, the pair banner and the lookbook plates all
   rendered it raw. The cart is the worst place for it: the moment of purchase,
   read as noise.

2. **65% of the catalogue shared one identical sell line.** The generator had 7
   branches for 393 products; 256 of them landed on
   *"A one-liner with nowhere to hide…"*. For a brand whose entire value is the
   writing, opening two products in a row exposed it.

### Did

**Titles.** Wired `splitTitle()` through every remaining surface — cards,
search, cart line items, recently-viewed, homepage cards, errata rail, pair
pieces, lookbook plates — and promoted the catalogue number to a quiet
`N°. 359` badge so the brand device survives without competing with the joke.
Also cleaned the card `alt` text, which previously read the suffix aloud to
screen-reader users on every product image.

**Sell lines.** Rewrote the generator around registers that actually recur in
this catalogue, discovered by reading 40 random real titles rather than
guessing: retail-label parody ("OUT OF STOCK (EMOTIONALLY)", "FRAGILE: HANDLE
NEVER"), the "I ❤ X" declaration, "I'm X" self-identification, parenthetical
twists, self-issued credentials, third-person description, imperatives, and
specific numbers. Branches with wide coverage hold several lines and pick one
deterministically from the title, so a product always reads the same way but
its neighbours don't.

Result, measured across the full catalogue:

| | Before | After |
|---|---:|---:|
| Distinct sell lines | 7 | **29** |
| Largest single share | 65% (256 products) | **13% (51 products)** |

**Bug caught in my own new code:** the "I ❤ X" branch used `\b` after the heart
character, and `\b` can never match between two non-word characters — so the
branch fired on 2 products instead of 45. Found by sampling rendered PDPs
rather than trusting the code. Fixed; 43 products moved from a generic line to
the apt one.

### Verified

- `tsc` clean, build clean, lint 0 errors.
- Rendered scan: **0 visible catalogue suffixes** across home, collection, tees,
  lookbook and search (remaining occurrences are in JSON-LD and alt text, where
  the canonical title belongs).
- Random sample of 8 live PDPs: 7 distinct sell lines.
- 390px card screenshot confirms the title is now the joke and the number is a
  badge.

### Next

- The three "reference outputs" documented in `productCopy.ts` should be
  re-tuned by a human who owns the voice — they were written before the
  register analysis and the generator has moved past them.
- Next lens: **trust / edge cases** (never audited: what a shopper sees when a
  variant is genuinely unavailable, when search returns nothing, and whether the
  free-shipping claim can be substantiated).

---

## Cycle 4 — 2026-07-27 — Lens: trust & edge cases

### Found

Walked the paths that aren't the happy path.

1. **Search results were still raw Hydrogen scaffold.** (top finding)
   Every other listing surface on the site uses the branded card — image, joke
   as the title, price in slab, size-first quick add. Search rendered a plain
   list with 50px thumbnails and no styling at all. For a **393-product**
   catalogue, search is a primary way in, and on mobile it is often the first
   thing a shopper touches. It read as an unfinished corner of an otherwise
   finished shop, which is a trust signal before it is a conversion one.
2. The empty-search state was already good and in voice ("Nothing. Nada. Zip.")
   — no change needed. Worth recording that the failure path was better built
   than the success path.
3. 404, empty cart and restocking states all still behave.

### Did

Rebuilt search results on the site's own card system: enriched the search
fragment with `featuredImage`, `images`, `priceRange` and `variants`, then
rendered `ProductItem` in the standard `sx-grid` with quick-add enabled, a
proper "N items of questionable judgment" count, and real pagination controls.

### Caught a regression I shipped in cycle 3

The `sx-card__no` catalogue badge introduced last cycle measured **3.31:1**
against cream at opacity 0.5 — below AA for 10px text — and it went out on
every listing page. Search's a11y audit surfaced it at 96. Raised to opacity
0.72 (**6.81:1**, computed rather than eyeballed); still visually secondary.
Search and collection are back to **a11y 100**.

That is the loop doing its job: cycle 3's change was verified for what it
changed (titles) and not for what it introduced (a new element). Worth
remembering that a new element is a new audit surface.

### Verified

- `tsc`, build clean.
- Search renders real cards with quick-add; count line correct.
- Contrast ratio computed for three candidate opacities before picking one.
- Search a11y back to **100**, collection unaffected.
- 390px screenshot of results.

### Next

- **Trust gap I cannot close from here:** every contact path — the order
  ticket, the FAQ, the returns page, the notify-me capture — composes a
  `mailto:` to `help@schmucks.example`, which is a placeholder domain and will
  bounce. A dead support channel on a store taking money is a real trust
  failure, and it is one constant (`CONTACT_EMAIL` in `app/data/commerce.ts`)
  away from being fixed. Escalated in NEEDS_INPUT.md.
- Next lens: **mobile UX** (never audited on its own; the sticky buy bar, the
  mega-menu on touch, and the cart drawer all deserve a dedicated pass).

---

## Cycle 5 — 2026-07-27 — Lens: mobile UX

### Found

1. **Two controls would zoom the page on iOS.** Safari zooms whenever a focused
   form control is under 16px. The collection **sort `<select>` measured
   13.1px** — on the most-used control on every listing page — and the restock
   capture measured 15.2px. Auditing this by computing rendered px from the
   stylesheet rather than by eye, because it is invisible on desktop.
2. **Card titles destroyed the mobile grid.** This catalogue runs to 106
   characters; at a ~170px column that wrapped to six-plus lines, so no two
   cards in a row were the same height and the grid lost its rhythm entirely.
3. **The cart drawer was 400px on a 390px viewport** — it covered the screen
   edge to edge with nothing left to tap to dismiss.

### Did

- Both sub-16px controls raised to 1rem.
- Card titles clamped to three lines. The full line always lives on the product
  page; the card's job is to get you there.
- Drawer capped at 92vw below 480px so a strip of the page stays visible and
  tappable.

### Verified

- Build clean; 390px screenshot shows uniform card heights and restored grid
  rhythm.

### Next

Next lens: **browse at scale.** A 97-product shelf currently offers sort and
12-per-page "load more" and nothing else — the size/colourway facets only work
on *published* collections, which this store has none of, so every shelf is
unfilterable. That is the biggest remaining functional gap for a 393-product
catalogue and it deserves a full cycle.

---

## Cycle 6 — 2026-07-27 — Lens: browse at scale

### Found

1. **End-to-end purchase flow verified for the first time.** Never actually
   tested before this cycle. Driving the real `CartForm` endpoint: add → cart
   cookie set → line item renders → subtotal $42.00 → free-shipping bar counts
   → second item → $84.00 → "Free shipping unlocked" → upsell correctly
   disappears at two → live Shopify checkout URL issued. **It works.**
   *Caveat worth recording:* my first run reported "no cart cookie" and looked
   like a critical bug. It was my own test harness — `Headers.forEach()`
   collapses multiple `Set-Cookie` values into one string, so the adapter was
   dropping the cart cookie. Fixed the harness with `getSetCookie()`. I nearly
   filed a false P0 against working code.

2. **Two of five sort options were inert controls.** All 393 products are
   42.00, so "Price: low to high" and "Price: high to low" reload the page and
   change nothing.

3. **Filters would have been inert too — so I did not build them.** The plan
   coming into this cycle was faceted size/colourway filtering for the ~100-item
   shelves. The data killed it: **every product carries every size S–3XL**, and
   colourways are near-uniform (all 97 Vices products come in both Black and
   Natural; Gold exists on 12 of 393 catalogue-wide). A size filter would narrow
   nothing on any shelf, and a colour filter would narrow nothing on almost all
   of them. Building them would have shipped controls that imply choice where
   none exists — the same defect as the price sorts, dressed up as a feature.

### Did

- Recorded `MULTI_PRICE_CATALOGUE = false` in `commerce.ts` with its
  verification, and made the sort list filter on it. Price sorts return
  automatically if a second price point ever appears.
- Raised shelf page size 12 → 24, halving the "load more" presses on a
  97-product shelf from 8 to 4.
- Fixed the audit harness so cookie-dependent flows can be tested honestly.

### Verified

Sort list now reads Featured / Newest / A–Z; 24 cards per page; build clean.

### Next

See the diminishing-returns assessment below.

---

## Cycle 7 — 2026-07-27 — Lens: performance (image delivery)

### Found

Cycle 6 doubled the shelf page size to 24, which also doubled a waste I had
already noticed and not acted on: product cards layer a **second mockup**
behind the first and cross-fade it on hover. A touch device can never trigger
that hover, but the browser downloads the image anyway — one wasted request per
card, now 24 per shelf page.

Measured on the collection page, mobile profile: **28 image requests,
131.7 KB**.

### Did

Added `useCanHover()` (`app/lib/useCanHover.ts`) — `(hover: hover) and
(pointer: fine)`, defaulting to false so the server-rendered HTML carries only
the primary image. Pointer devices add the swap after hydration; the swap image
is absolutely-positioned decoration, so adding it later shifts nothing.

### Verified

| Collection page | Image requests | Image bytes |
|---|---:|---:|
| Mobile, before | 28 | 131.7 KB |
| Mobile, after | **14** | **64.0 KB** |

**51% fewer image requests and half the image bytes** on the device class that
matters most, on every listing page. Server-rendered HTML confirmed to contain
24 primary images and zero secondaries. Desktop card layout unchanged
(screenshotted).

### Honest limitation

**I could not verify the desktop hover swap still works.** Chasing it produced a
useful discovery: a probe page shows this headless Chrome reports
`hover: hover = false` and `pointer: fine = false` — the harness cannot
emulate a hovering pointer at all, so every "desktop" measurement I took of
this feature was meaningless, including the identical DOM counts that first
looked like evidence of breakage. The implementation is the canonical media
query plus a conditional render, so the risk is low, but it is unverified here
and should be eyeballed on a real desktop browser once the site is reachable.

I kept the change because the trade is a measured 51% mobile image cut against
an unverifiable decorative desktop effect. If the swap turns out to be broken on
a real desktop, the honest fix is to delete the feature rather than restore the
waste.

---

## Cycle 8 — 2026-07-27 — Lens: SEO

### Found

**Every paginated shelf page declared itself a duplicate of page one.** The
canonical on `/collections/vices?direction=next&cursor=…` pointed at
`/collections/vices`. At 24 products per page that means:

| Shelf | Products | Reachable only on page 2+ |
|---|---:|---:|
| Courtship | 109 | 85 |
| Vices | 97 | 73 |
| The Pair Programme | 54 | 30 |
| Terms & Conditions | 35 | 11 |

Those products were still in the XML sitemap, so they were discoverable — but
their only listing-page appearance was being handed to Google as duplicate
content, which suppresses the internal links pointing at them.

### Did

Cursor pagination has no stable page-2 URL worth canonicalising to, so the
correct treatment is **`noindex, follow`** on paginated views: the page itself
stays out of the index, and every product link on it stays crawlable. Applied
to `/collections/:handle`, `/tees` and `/collections/all` via a shared
`isPaginatedRequest()` helper.

Also added **ItemList structured data** to collection pages — position, name
and URL for each product — so a shelf is legible to search engines as the
product listing it actually is, alongside the existing BreadcrumbList.

### Verified

- Page 1 indexable, page 2 `noindex, follow` (confirmed on the live build).
- ItemList emits 24 positioned items; **schema.org validator: 0 errors,
  0 warnings** on the collection page's combined structured data.
- Build clean.

### Next

See the diminishing-returns assessment below — this cycle is where the
code-side work stops paying like it did.

---

## Cycle 9 — 2026-07-27 — Lens: visual polish

### Found

Looked at the full-length mobile homepage as a first-time visitor would.

1. **The homepage shipped a weaker product card than every other page.** It used
   its own bespoke `ProductCard` rather than the shared `ProductItem`, so the
   highest-traffic page on the site had **no catalogue badge and no quick-add**
   — a shopper could add a size straight from a shelf, but not from Best
   Sellers on the front page.
2. **Dead space above the fold.** The hero carried generous `min-height`
   reservations (6.2em + 4.4em) added in an earlier session to absorb the
   reflow when Inter arrived from a third-party origin. Cycle 2 self-hosted and
   preloaded the fonts, which made those reservations mostly obsolete — but
   they were still pushing product content down the page on every mobile visit.

### Did

- Homepage Best Sellers now renders the shared `ProductItem` with `quickAdd`;
  deleted the bespoke card and added `variants` to the home query to feed it.
- Trimmed the hero reservations to 4.6em / 2.8em.

### Verified

**CLS 0.000, with zero recorded layout shifts** on mobile — the trim did not
reintroduce the reflow those reservations existed to prevent, which is the
measurement that makes cycle 2's font work pay off twice. Accessibility 100.
Homepage confirmed to render 8 quick-add blocks and 8 catalogue badges.

### Next

The site now behaves consistently across every listing surface. Remaining
code-side candidates are getting narrower (per-route CSS splitting is the last
sizeable one, and it carries real regression risk for ~8 KB compressed).

---

## Cycle 10 — 2026-07-27 — Lens: performance, measured on production

### The unblock

**The store password gate came down**, so for the first time the live site is
reachable and every "cannot be validated here" caveat in this log can be
settled. Cycle 2's hypothesis was exact:

| | Local harness | Production |
|---|---:|---:|
| `schmucks.css` over the wire | 86,293 B, uncompressed | **17,149 B, brotli** |
| Protocol | HTTP/1.1 | **HTTP/2** |
| Ratio | — | **5.0×** |

That 5× inflation is precisely what buried the font work in cycle 2 and made
local wall-clock timings untrustworthy. Byte counts were always honest; timings
never were.

### Real production baseline (home, mobile profile)

**perf 69 · a11y 100 · SEO 100 · best-practices 93**
FCP 3.1s · LCP 3.1s · TBT 710ms · **CLS 0**

Payload over the wire, compressed: Script 157 KB / 25 req · Image 71 KB / 14 req
· Font 67 KB · Document 24 KB · Stylesheet 17.7 KB.

### Found

**My own `fonts.css` was the single biggest render blocker: 807 ms for a
0.8 KB file.** Self-hosting removed Google's origin from the critical path in
cycle 2, but replaced it with a same-origin stylesheet that still had to be
fetched before the browser could act on it — a full round trip in the critical
chain to deliver under a kilobyte.

### Did

Inlined the `@font-face` block (1,380 bytes) directly into the document head
with the existing CSP nonce, and dropped the stylesheet link. The preloads for
the two latin subsets stay, so the font files still start downloading
immediately — now with nothing in front of them.

### Verified

Inline block present, `fonts.css` request gone, both preloads intact, and both
faces render identically (screenshotted). Build clean.

### Verified on production after deploy

Three runs on a settled box (a first run of 52 was box noise — the same
contention signature as before, on a change that touched zero JavaScript):

| | perf | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|
| Home, before | 69 | 3.1s | 3.1s | 710ms | 0 |
| **Home, after** | **84 / 84 / 83** | **2.76s** | **2.78s** | **308ms** | **0** |
| **PDP** | **85** | — | **2.7s** | **300ms** | **0** |

PDP also holds a11y 100 and SEO 100. Caveat kept honest: the "before" figure is
a single run and the box was noisier then, so the delta is directional rather
than a clean A/B — but the post-change medians are stable and better than any
measurement taken before it.

Note the render-blocking chain simply *moved*: with `fonts.css` gone, Lighthouse
now attributes ~922ms to `reset.css`. The chain itself is the cost, not any one
file — which is the argument for consolidating the three remaining stylesheets,
and the next thing worth doing.

### Next

With production measurable, the ranked targets are now real: **Script 157 KB
across 25 requests** (largely framework and Shopify-injected, so limited
headroom), and the **stylesheet chain** — three separate render-blocking CSS
requests where one would do. LCP 2.78s sits just above Google's 2.5s "good"
threshold, and the stylesheet chain is the most likely way to cross it.

---

## Cycle 11 — 2026-07-27 — Lens: dead ends (user-reported)

### Found

Reported by the owner: "the store doesn't show all the products, especially the
pages that have the collections — often they are empty."

Investigated on production. The shelf *detail* pages were fine — Courtship pages
through 24+24+24+24+13 = 109, exactly matching its count — but three real bugs
were making the catalogue look empty or smaller than it is:

1. **`/collections` showed all nine shelves as blank grey boxes labelled
   "RESTOCKING"** — including Courtship (109 products) and Vices (97). The tile
   decided a shelf was live by checking for a *published Shopify collection*.
   None of the ten are published to the Hydrogen channel, so every tile
   reported empty even though every shelf behind it was full. Introduced in
   phase 9; missed because I only ever re-checked the shelf pages after adding
   the tag fallback, never the index that links to them.
2. **`/tees` claimed "24 items of questionable judgment"** — its own page size —
   when it carries all 393.
3. **Best Sellers and New Arrivals claimed "24 items"** for the same reason:
   sort-based shelves had no count source and fell back to the loaded count.

### Did

- Shelf tiles now fetch a real product per shelf using the same tag and sort
  sources the shelf pages use, and show it as the tile artwork. "Restocking"
  now means *zero products*, not *no published collection*.
- `/tees` and the sort-based shelves count against the catalogue tag, so they
  report `250+ items` (the Storefront page ceiling) instead of their page size.

### Verified

`/collections`: 9 tiles, **0 restocking flags, 0 blank boxes**, real product
artwork on every tile (screenshotted). Counts now read 250+ for /tees, Best
Sellers and New Arrivals; 97 for Vices; 13 for Errata — all matching the tag
census.

### Lesson

Every previous cycle audited *detail* pages and the funnel. Nobody audited the
page whose entire job is to advertise that the shelves have things on them. A
fallback added in one place has to be re-checked everywhere the old assumption
was encoded — including the pages that merely *describe* the data.

---

## Cycle 12 — 2026-07-27 — Lens: merchandising correctness (user-reported)

### Found

Reported by the owner: products aren't on the page their collection is attached
to — "right now it's very random."

Checked every shelf against the tag census. **The six thematic shelves were
correct**, and demonstrably so: Errata really is the misprints (SANWICH, Golira,
TRAF, Minye, Shrit), Petty Crimes really is tax evasion and speeding,
Terms & Conditions really is packaging parody. Those weren't the problem.

**The two non-tag shelves were.** Proof:

```
products(sortKey: BEST_SELLING)              products(sortKey: CREATED_AT, reverse: true)
1 I Peaked At My Own Birthday Party (Age 9)  1 I Peaked At My Own Birthday Party (Age 9)
2 I Gave A Eulogy And Plugged My Instagram   2 I Gave A Eulogy And Plugged My Instagram
3 My Group Chat Has A Group Chat Without Me  3 My Group Chat Has A Group Chat Without Me
...identical for all 8 sampled
```

`BEST_SELLING` returns **the identical order** to newest-first. That is Shopify
falling back to default ordering because **nothing has sold**. So:

- **Best Sellers and New Arrivals were the same 393 products in the same order**,
  under two different nav entries — the "random" the owner saw.
- Neither was bounded, so both were also duplicates of `/tees`.
- Every product was created on the same day (bulk import), so recency carries no
  signal either.

### Did

- `SALES_DATA_AVAILABLE = false` in `commerce.ts`, with the ordering comparison
  documented as its verification.
- While false, `/collections/best-sellers` **302s to New Arrivals** rather than
  present an invented ranking of the whole catalogue, and the Best Sellers entry
  drops out of the header, mega-menu and footer.
- **New Arrivals is now a bounded shelf** — exactly one page (24), so every
  product in the window is reachable and it no longer duplicates `/tees`.
- The homepage row now takes the honest path unconditionally while the flag is
  false, so it is labelled New Arrivals with the existing in-voice line
  ("Nobody has voted with their wallet yet…").

Flip `SALES_DATA_AVAILABLE` once real orders exist and Best Sellers returns
everywhere, ranked by actual sales.

### Verified

Every shelf now matches the tag census exactly: Confessional 26, Terms &
Conditions 35, Courtship 109, Vices 97, Errata 13, Petty Crimes 20, Pair
Programme 52, New Arrivals 24 (bounded), /tees 250+. Best Sellers 302s. No
next-link on the bounded shelf, so nothing is stranded.

### Correction to my own fix

First pass set the window to 48 while the page size was 24 *and* disabled
paging — which would have stranded 24 products. Caught it in verification
before shipping and set the window to exactly one page.

## Cycle 13 — three reported bugs

**Lens:** user-reported defects (not a rotation — direct report takes priority).

### 1. The Pair Programme page didn't show the Pair Programme collection

`/matching-sets` loaded `collection(handle:"the-pair-programme")`, which returns
null because that smart collection isn't published to the Hydrogen sales channel.
The fallback was `products(first: 8)` with no filter — so the page showed the
first eight products in the whole catalogue. Same root cause as the collections-page
and Best-Sellers bugs.

**Fix:** query `products(query: "tag:'the-pair-programme'")` (the same tag path
every shelf page uses), then compute real pairs from consecutive catalogue numbers
in the title (`N°. 041` / `N°. 042`). Renders a "Made for each other" block above
the browse grid.

**Verified:** page now shows I'm Stupid & I'm Fucking Stupid (041/042), I'm
Tweaking & I'm Fucking Tweaking (052/053), I'm Crazy & I'm Fucking Crazy,
I'm A Slut For My Girlfriend & …Boyfriend. Four real pairs, 54 tagged products
in the browse grid.

### 2. Load-more was too quiet

After 24 products the only way onward was a small bordered text link. Now a full
house-style button — mustard fill, thick outline, hard shadow, display type, ↓,
56px tall, min 22rem wide. Press states move the shadow like every other button.

### 3. Nav menu closed before you could click an option

`.sx-mega__panel` sat at `top: calc(100% + 0.9rem)`, so moving the pointer from
the trigger toward the panel crossed a dead gap outside the wrapper — `mouseleave`
fired and the menu shut mid-travel. Two fixes: invisible bridge pseudo-elements
spanning the gap on both the trigger and the panel, and a 260 ms close delay so a
brief excursion doesn't dismiss it. Re-entering cancels the pending close.

Cost: 0 KB JS beyond one timer ref. Keyboard/escape behaviour unchanged.
