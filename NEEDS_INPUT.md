# Needs Real-World Input

Things I deliberately did **not** fabricate. Each needs a real value from you
before it can ship as a factual claim. Until then I use honest alternatives.

## Trust / social proof
- **Customer reviews, star ratings, review counts** — removed all invented ones
  (was "4.9/5 from 12,000+ idiots", named quotes, per-product counts). Replaced
  with honest trust content (guarantees, materials, returns). To add real
  reviews later: wire a reviews app (Judge.me / Okendo / Shopify Product Reviews)
  and I'll render real data + Product `aggregateRating` schema.
- **Press mentions / "as seen in"** — none added (none are real).
- **Social links point at platforms, not profiles.** The footer's IG / TikTok / X
  icons link to `instagram.com`, `tiktok.com` and `x.com` — the sites, not the
  brand's accounts — so they read as broken to anyone who clicks. Give me the
  real handles and they get wired up, and the homepage `Organization` schema
  gets its `sameAs` back (deliberately omitted for now rather than telling
  Google that the platform homepages are this brand's accounts).

## Commerce facts
- **Free-shipping threshold — UNVERIFIED, and stated on every page.** The site
  promises "free shipping on orders over $50" in the announcement bar, the
  marquee, the footer, the cart progress bar and the PDP. Nothing has confirmed
  that a matching Shopify shipping profile exists. The Storefront API will not
  expose delivery options for this shop (`cartBuyerIdentityUpdate` with a US
  address returns no `deliveryGroups`), so it cannot be checked from code —
  it needs a look in admin (Settings → Shipping and delivery).
  Note the brand brief said **$100**, the code says **$50**: at $42 a shirt
  that is the difference between free shipping on the second shirt and on the
  third. Whichever is right, this is the single most-repeated claim on the
  storefront and the only commerce constant with no verification behind it.
- **Stack & Save discount** — the cart meter is UI only. Create the matching
  **Shopify automatic discount** (2+=10%, 3=20%, 4+=30%) in admin or it won't
  apply at checkout.
- **Shipping times / low stock** — I only show these if driven by real Storefront
  data. No fabricated "ships in 3–5 days / only 2 left" unless your fulfillment
  data confirms it. Confirm real fulfillment windows to hard-code copy.

## Store configuration
- **PRICES ARE USD $42.00, NOT $25.** The catalogue is 391 products, all one
  price, options Color (Black / Natural, Gold on 12) and Size S–3XL. Every
  hardcoded "$25 flat" and "free US shipping over $100" claim has been removed;
  prices now render from the API only. If you intended a $25/$27/$29 ladder,
  that has to change in admin — the storefront reports what the store says.
  (Verified 2026-07-28: shop currency is USD and the only presentment currency
  is USD, so the earlier "CAD" note here was wrong.)
- (Free shipping is covered under **Commerce facts** above — one entry, not two.)
- **The ten smart collections are still unpublished to the Hydrogen channel.**
  The storefront works anyway: every shelf falls back to a product tag query
  (`app/lib/shelfQuery.ts`). Publishing them switches each shelf to
  merchandiser order and turns the size/colourway facets back on, with no code
  change. Note the Terms & Conditions tag is `terms-and-conditions` while its
  handle is `terms-conditions`.
- **No gift cards exist**, so no gift card page was built and nothing links to
  one. Add gift card products and it can be added in an afternoon.
- **Stack & Save is OFF sitewide as of 2026-07-27, and this is the single
  highest-value thing you can fix.** Cart tests proved no discount applies at
  any quantity (2 shirts = $84.00, 4 = $168.00, no allocations, no working
  code), so every claim is suppressed behind `STACK_DISCOUNT_LIVE` in
  `app/data/commerce.ts`. Create the automatic discount in admin (Discounts →
  Automatic → 2+ = 10%, 3 = 20%, 4+ = 30%), re-run the cart test documented in
  that file, then flip the flag — the whole merchandising layer switches back
  on at once. See IMPROVEMENTS.md cycle 1.
- **`help@schmucks.example` is still a placeholder.** The contact ticket, FAQ
  and returns page all compose real `mailto:` links to it — they'll work the
  moment it's a real inbox. Change it in `app/data/commerce.ts` (one constant).
- **BLOCKER — publish the collections and products to the Hydrogen sales
  channel.** As of 2026-07-26 the Storefront API returns **0 products and none
  of the ten smart collections** for this storefront token; only the default
  `frontpage` collection is visible. Everything is wired and will populate the
  moment the collections + products are published to the Hydrogen/headless
  channel in admin (Products → … → Manage sales channels). Until then every
  shelf renders its restocking state.
- **`PUBLIC_CHECKOUT_DOMAIN` is not set** on the storefront environment, which
  made `Analytics.Provider` log a console error. The code now falls back to
  `PUBLIC_STORE_DOMAIN`; set the real value if checkout runs on its own domain.
- **`content/pairs.json`** — the pipeline's pairing map isn't reachable from
  this repo, so the mapping lives at `app/data/pairs.ts` in the identical
  shape (`{handle: [handle, ...]}`) and is currently empty. Drop the real pairs
  in and "Complete the Pair" switches from shelf-fallback to explicit pairs.
- **Shop policies must be written in admin** (Settings → Policies): shipping,
  refund, privacy, terms. The footer links Shipping/Returns directly, and
  `/policies` lists whatever exists. Until a policy is published, that URL
  returns 404 with an honest "not published yet, ask us" page rather than
  invented terms — but real customers need the real text.
- **Blogs** — `/blogs` (Shopify blogs, linked in the footer as "News") is empty
  until a blog is created in admin. The Journal is separate and always populated.

## Content / assets
- **Real brand SVGs** — Mel, arched wordmark, badge are placeholders. Provide the
  finals (from "Schmucks Brand Identity System.pdf") to swap in.
- **Product photography** — grids/PDP/lookbook use Storefront product images.
  Editorial/lookbook art direction wants real lifestyle photography; placeholders
  are clearly-labeled brand illustrations, not fake photos.
- **Size & fit measurements** — the size guide uses standard unisex tee
  measurements as a sensible default. Replace with your Printify blank's actual
  spec sheet (measurements per size) before relying on it.
- **Materials / GSM** — Materials page uses typical print-on-demand blank specs
  (e.g. ~180 gsm ringspun cotton). Confirm your actual Printify blank(s) and I'll
  correct the numbers.
- **Journal articles** — 3 seeded editorial pieces in brand voice. Review/approve
  copy; swap in real photography.
- **Contact email / socials** — `help@schmucks.example` etc. are placeholders.
  Provide real addresses and social handles/URLs.
