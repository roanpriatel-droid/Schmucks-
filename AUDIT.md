# SCHMUCKS — Site Audit & Upgrade Plan

_Baseline: post-launch storefront (homepage, tees/matching-sets, collections,
PDP, cart, contact/faq, blog, account, policies, search). Hydrogen 2026.4 +
React Router 7, data via mock.shop (real store injected on Oxygen)._

## Stack & architecture

- **Framework:** Shopify Hydrogen (React Router 7 fs-routes), deployed on Oxygen
  (auto-deploy on push to `main` via `.github/workflows/oxygen-deployment-*.yml`).
- **Data:** Storefront API via `context.storefront.query`. mock.shop locally;
  real store creds injected by Oxygen in production.
- **Cart:** Hydrogen `CartForm` + optimistic cart; slide-out `Aside` drawer +
  `/cart` page. Stack & Save meter (`StackProgress`) is presentational (needs a
  real Shopify automatic discount to actually apply).
- **Styling:** hand-rolled design system in `app/styles/schmucks.css` (no
  Tailwind). Brand tokens in `:root`. See `BRAND.md`.

## Scores (1–10) — before → after

| Dimension | Before | After | What shipped |
|---|---:|---:|---|
| Visual craft | 7 | 9 | Scroll reveals, product-card hover image-swap, editorial statement bands, split/pullquote system, spec cards |
| Page depth | 5 | 9 | Added About, Materials, Size & Fit, Care, Lookbook, Journal (3 articles) — all fully designed |
| PDP persuasion | 5 | 9 | Swipe gallery + zoom, accordions, sticky ATC, size-guide modal, cross-sell, Product schema, honest badges |
| Mobile | 7 | 9 | Sticky ATC, native swipe gallery, responsive grids/tables, box-sizing fix |
| Performance | 7 | 8.5 | Hydrogen `Image` + lazy below-fold, `display=swap` + preconnect; hero is text (fast LCP). Real-device Lighthouse pending |
| SEO / GEO | 5 | 9.5 | Per-route titles/meta via one helper, absolute canonicals, OG/Twitter, Organization+WebSite(SearchAction)+Product+FAQ+Article+Breadcrumb JSON-LD, `llms.txt`, full sitemap coverage incl. hand-built routes |
| Accessibility | 6 | 8.5 | Focus-visible ring, skip link, native accordions, Esc-closable modals, alt text; full AT testing pending |
| Conversion architecture | 6 | 9 | Free-ship progress, cart trust row, cross-sell, exit-intent email modal, collection sort+count, analytics events |

Perf & a11y are marked ~8.5 honestly — both want real-device Lighthouse and
assistive-tech testing, which needs the running dev server (blocked on this
ARM64 box; verified via build + typecheck + static-render screenshots instead).

## Known issues to fix (honesty)

- **Fabricated social proof present** (violates BRAND §8 / prompt hard rule):
  hero "Loved by 12,000+", reviews "4.9/5 from 12,000+" with named "Verified
  Idiot" quotes, product-card review counts, PDP rating line. **Fix:** replace
  with honest trust content (guarantees, materials, returns) in brand voice;
  remove invented numbers/ratings. Logged in `NEEDS_INPUT.md` for when real
  reviews exist.

## Execution plan (commit per phase)

- **Phase 0** — BRAND.md, AUDIT.md, NEEDS_INPUT.md, plan. ✅
- **Phase 1** — Visual craft: scroll-reveal util (reduced-motion aware), product
  card hover image-swap, editorial homepage rhythm, type/whitespace pass.
- **Phase 2** — Depth: About/Philosophy, Materials & Construction, Size & Fit,
  Care, Journal (index + 3 seeded 600+ word articles), Lookbook, footer upgrade
  w/ newsletter + full sitemap links. (FAQ/Contact already shipped — enhance.)
- **Phase 3** — PDP: gallery w/ zoom + mobile swipe, benefit-led descriptions,
  accordions (Details/Materials/Care/Shipping), size-guide modal, sticky ATC,
  cross-sell, Product JSON-LD. Remove fake ratings.
- **Phase 4** — Conversion: cart trust row + upsell slot, honest announcement
  bar, email capture (footer + one exit-intent modal), empty states, collection
  filter/sort + editorial intros, analytics events.
- **Phase 5** — Perf/SEO/GEO/a11y: hero preload, font-display, JSON-LD
  (Organization/Product/FAQ/Article/Breadcrumb), OG images, `llms.txt`, canonical,
  keyboard/focus/contrast/alt pass.
- **Phase 6** — Build, click-test (375px + desktop), update this file with
  after-scores + changelog.

## Changelog

- **Phase 0** — reverse-engineered `BRAND.md`, this audit, `NEEDS_INPUT.md`.
- **Phase 1** — `Reveal` scroll util (reduced-motion aware); product-card hover
  image-swap (added `images(first:2)` to product fragments); editorial statement
  band; **removed all fabricated social proof** (hero "12,000+", the "4.9/5"
  reviews block, per-card counts) → honest facts + "Schmucks Promise" + product
  meta.
- **Phase 2** — new pages, all fully designed: About/Philosophy, Materials &
  Construction, Size & Fit (w/ Find-My-Size), Care, Journal (index + 3× 600-word
  articles), Lookbook. Footer upgraded with newsletter + Shop/Learn/Help sitemap.
- **Phase 3** — PDP rebuild: swipe gallery + lightbox zoom, honest badges, size
  modal, Details/Materials/Care/Shipping accordions, sticky ATC, cross-sell,
  Product JSON-LD.
- **Phase 4** — cart free-ship progress + trust row, exit-intent email modal,
  on-brand empty search, collection server-side sort + count + intro, dataLayer
  analytics (view_item / add_to_cart / begin_checkout / newsletter_signup).
- **Phase 5** — `llms.txt`; Organization/WebSite/FAQ JSON-LD; OG/Twitter meta;
  focus-visible ring + skip link + main landmark.
- **Phase 6** — build + typecheck green across all phases; static-render
  screenshots of home, PDP, cart, materials, matching-sets, favicon.
- **Phase 7 — completeness pass over *every* route.** Phases 1–6 built the
  marketing surface; this one finished the routes that were still scaffold:
  - **Shared SEO helper** (`app/lib/seo.ts`) — every route now emits title,
    description, absolute canonical, OG + Twitter cards through `pageMeta()`.
    Root loader exposes `origin` so canonicals/OG URLs are absolute. Fixed three
    leftover `Hydrogen | …` titles (generic page, blog index, blog article) and
    a broken PDP canonical (`{rel: 'canonical'}` without `tagName: 'link'`
    rendered as an invalid `<meta>`). Cart/search/account are `noindex`.
  - **Shopify blog routes rebuilt** to Journal quality: lead post card, excerpts,
    author + date, breadcrumbs, tags, share row, older/newer post nav, Article
    JSON-LD, empty states. List queries no longer pull full `contentHtml`.
  - **Breadcrumbs** (`components/Breadcrumbs.tsx`) on every interior page, with
    BreadcrumbList JSON-LD.
  - **Policies** — index is now a card grid with plain-English framing; detail
    pages cross-link siblings and, when a policy isn't published in admin, render
    an honest "ask us" page (404 status) instead of dead-ending the footer's
    Shipping/Returns links.
  - **Empty + error states everywhere** — collections, catalog, tees, blogs,
    generic pages; branded 404 with search + routes out; server errors get a
    branded page instead of a raw `<pre>`.
  - **Sitemap coverage** — hand-built routes (landings, depth pages, Journal
    articles) were missing entirely; added `/sitemap-static.xml` wired via
    `customChildSitemaps`. Dropped `metaObjects` (not routable here) and added
    `/articles/:handle` → canonical `/blogs/:blog/:article` 301 so the URLs
    Shopify's sitemap emits actually resolve.
  - Fixed the pre-existing lint errors (unescaped entities) — lint is clean.

- **Phase 8 — wired to the live shelves.** The store's ten smart collections
  (Best Sellers, New Arrivals, The Confessional, Terms & Conditions, Courtship,
  Vices, Errata, Petty Crimes, The Pair Programme, Tees) are now the site's
  taxonomy, defined once in `app/data/shelves.ts`:
  - **Nav** — "Tees" is a mega-dropdown (six shelves + the counter, each with an
    in-voice descriptor); Matching Sets became **The Pair Programme**; Best
    Sellers promoted to top level. Mobile aside gets the same tree.
  - **Homepage** — Best Sellers row (falls back to New Arrivals while there's no
    sales history, then to a restocking notice), a full-bleed ink menu board of
    three shelves, a ketchup Pair Programme banner, and the email capture
    rebuilt as a **Membership Card — Community of Idiots**. The placeholder
    "@idiot_1" UGC tiles were removed (invented handles, BRAND §8).
  - **Collections** — description under the title (store copy first, our
    in-voice line as fallback), size + colorway facets from the Storefront
    filter API, sort, and a count line ("47 items of questionable judgment").
  - **PDP** — Gildan 5000 size chart, mobile-only sticky ATC, trust row
    (30-day returns / printed in the US / secure checkout), and **Complete The
    Pair** reading `app/data/pairs.ts` → Pair Programme shelf → catalogue.
  - **Empty-state contract** — a shelf that is unpublished *or* untagged renders
    its real page with the restocking panel (and `noindex`) instead of a 404, so
    no nav link can dead-end. Same for the boards, the featured row and /tees.
  - **Measured** (Lighthouse 12, desktop preset, against the built worker):
    home 95 / 100 / 96 / 100, tees 96 / 100 / 96 / 100, shelf 96 / 100 / 96 / 66
    (SEO 66 = the deliberate noindex on an empty shelf), pair 96 / 100.
    Accessibility fixes made along the way: cream-on-mustard and
    ketchup-on-cream-shade contrast, heading order, social-link name mismatch.

- **Phase 9 — launch build-out.** Verified against the live catalogue first
  (393 products, CAD $42.00 flat, tags per shelf), then built to it:
  - **Shelves now serve real products.** The smart collections still aren't
    published to this sales channel, so `app/lib/shelfQuery.ts` resolves each
    shelf as published collection → product tag query → sort key → restocking.
    Counts are exact (26 Confessional, 20 Petty Crimes, 109 Courtship…).
  - **Price truth.** Every "$25 flat" / "$100 free US shipping" claim was
    fiction against this store; all removed, prices render from the API, and
    thresholds live in one file (`app/data/commerce.ts`).
  - **New/rebuilt pages:** The Schmucks Story (heritage lore + the true-facts
    table), FAQ (grouped accordion, honest shipping answers, FAQPage JSON-LD),
    Shipping & Returns (new), Contact (deli order ticket composing a real
    mailto), Lookbook (catalogue spreads built from real product plates).
  - **Homepage** rebuilt to ten sections: announcement bar, hero, Best Sellers
    (New Arrivals fallback), menu-board triptych, As Worn By Idiots, Pair
    Programme banner with a real his-and-theirs pair, Errata spotlight, brand
    story, membership card, fat footer.
  - **Fat footer:** Shop (all ten shelves), Help, The Brand, and a newsletter +
    honest payment note. Only policies the shop has actually published are
    linked, sourced from the root loader.
  - **Conversion:** collection quick-add (size-first), cart free-shipping bar at
    $50, drawer upsell, trust rows on PDP and cart, recently-viewed rail
    (localStorage only), in-voice urgency, Judge.me-ready review slot.
  - **Zero dead links, proven:** a crawler walks every in-page link from the
    homepage — 348 URLs, 0 non-2xx/3xx. It caught two real ones: `/pages/care`
    and the PDP both linked `/policies/refund-policy`, which this store has
    never published; both now point at our own Shipping & Returns page.
  - **Lighthouse (desktop, against the built worker):** home 91/100/100,
    collection 94/100/100, PDP 93/100/100 (perf/a11y/SEO). Fixed on the way:
    a `noindex` bug that hid every tag-driven shelf from search, 9px gallery
    dots, an invalid `tablist`, heading order, and two contrast failures.
  - **390px audit** across every template caught the header overflowing on
    mobile (a side-effect of the earlier nowrap CLS fix); sign-in moved into
    the mobile nav and search collapsed to its glyph.
  - **OG:** a real 1200×630 share card (`public/og-default.png`) replaces the
    touch icon; sitemap now includes the shelves and the new pages.

- **Phase 10 — the PDP rebuild.** Developed against three real products chosen
  for shape, not convenience: `SANWICH` (1 word), the 24-word confession
  `N°. 154`, and pair half `I'M WITH THE SCHMUCK →` (N°. 018).
  - **Layout:** two-column desktop with a sticky buy column, single flow on
    mobile. Gallery → title → (hidden-when-empty) review slot → price →
    fabric-chip colourways → size buttons → add-to-cart → trust row →
    accordions.
  - **Title as hero:** three type steps by character count, so a one-word
    slogan and a 24-word confession both read as the headline. This was the
    named failure mode and it's the reason the long product is a test case.
  - **Copy system** (`app/lib/productCopy.ts`): sell line generated from title
    shape (word count, arrows, question marks, pair membership); spec block and
    care line *parsed from the real Shopify description*, so no garment fact is
    invented. Three hand-tuned reference outputs are documented in the file.
  - **Printify quirks absorbed:** one distinct mockup per colourway (the other
    6–10 images are unattributed), null altText on every image, 8–12 mockups
    varying per product, no inventory counts, no compare-at prices.
  - **Pairs are real:** consecutive catalogue numbers inside The Pair
    Programme, disambiguated by title-word affinity when both neighbours
    exist. 018 correctly resolves to 019, with a combined-price add-both.
  - **Technical:** `?variant=` sync both directions, Product schema with one
    Offer per variant (12/12/18), OG image = product mockup, optimistic
    add-to-cart opening the drawer, out-of-stock → "Gone. Like our dignity." +
    restock capture, aspect-ratio gallery boxes (CLS 0.002).
  - **Measured:** schema.org validator 0 errors / 0 warnings on all three;
    Lighthouse desktop 93/100/100/96 (perf/a11y/SEO/best-practices),
    LCP 1.2s, CLS 0.002, TBT 0ms.

## Route inventory (all 42 routes, post-Phase 7)

Every route below renders a designed page or is a deliberate redirect/utility.

- **Shop** — `_index`, `tees`, `matching-sets`, `collections._index`,
  `collections.all`, `collections.$handle`, `products.$handle`, `search`, `cart`,
  `lookbook`
- **Depth** — `pages.about`, `pages.materials`, `pages.size-guide`, `pages.care`,
  `pages.faq`, `pages.contact`, `pages.$handle` (any other Shopify page)
- **Editorial** — `journal._index`, `journal.$slug`, `blogs._index`,
  `blogs.$blogHandle._index`, `blogs.$blogHandle.$articleHandle`
- **Legal** — `policies._index`, `policies.$handle`
- **Account** — `account` (layout), `account._index`, `account.orders._index`,
  `account.orders.$id`, `account.profile`, `account.addresses`, `account.$`,
  `account_.login`, `account_.logout`, `account_.authorize`
- **Utility (no UI by design)** — `$` (branded 404), `cart.$lines`,
  `discount.$code`, `articles.$handle` (301 to canonical blog URL),
  `[robots.txt]`, `[sitemap.xml]`, `[sitemap-static.xml]`,
  `sitemap.$type.$page[.xml]`

## Framework deviations / notes

- **Journal** is a local seeded content route (`app/data/journal.ts`), not the
  Shopify blog — gives full editorial control and works regardless of store blog
  config. The Shopify `/blogs/*` routes remain, re-skinned.
- **Reviews** intentionally omitted (honesty rule). Wire a reviews app when real
  data exists; `aggregateRating` will slot into the existing Product JSON-LD.
- **Stack & Save + free-ship bar** are honest UI; both need the matching Shopify
  automatic discount / confirmed threshold to be *functionally* true (NEEDS_INPUT).
- Could not run the Hydrogen dev server locally (workerd fails on this ARM64
  39-bit-VA box); verification was build + `tsc` + headless-Chromium static
  renders. Full end-to-end click-through should be done in Codespaces/Oxygen.
