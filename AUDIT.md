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

## Scores (1–10) — baseline → target

| Dimension | Before | Target | Notes |
|---|---:|---:|---|
| Visual craft | 7 | 9 | Strong system; homepage needs editorial rhythm, micro-interactions, scroll reveals, card hover image-swap |
| Page depth | 5 | 9 | Missing About, Materials, Size & Fit, Care, Lookbook, Journal. FAQ/Contact exist |
| PDP persuasion | 5 | 9 | No gallery zoom, no accordions, no sticky ATC, no cross-sell, no size-guide modal, no Product schema |
| Mobile | 7 | 9 | Responsive already; needs sticky ATC, swipe gallery, tap targets audit |
| Performance | 7 | 9 | Hydrogen `Image` used; add hero preload, font-display swap, blur/skeletons |
| SEO / GEO | 5 | 9 | Per-route titles mostly done; missing OG images, canonical, JSON-LD, `llms.txt`, editorial entity copy |
| Accessibility | 6 | 9 | Aside/accordions need keyboard + focus states; alt text; contrast pass |
| Conversion architecture | 6 | 9 | Free-ship bar (meter) present; need trust row, cross-sell, email modal, filtering, analytics events |

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

- **Phase 0** (this commit): reverse-engineered `BRAND.md`, wrote this audit and
  `NEEDS_INPUT.md`. No functional changes.
