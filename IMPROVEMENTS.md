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
