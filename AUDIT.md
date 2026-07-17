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
| SEO / GEO | 5 | 9 | Per-route titles/meta, OG/Twitter, Organization+WebSite+Product+FAQ+Article JSON-LD, `llms.txt`, entity-rich copy |
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
