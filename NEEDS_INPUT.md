# Needs Real-World Input

## Store status 2026-11-24 (store-setup session) — read this first

The live store is **x1ugph-ad.myshopify.com** (CAD base, Canada). It was empty;
it now holds all 393 designs, every one linked to Printify by SKU (orders route
to Printify for printing), on the right shelves, published to the Hydrogen
storefront, Online Store and Shop. Markets, collections, menus, policies, Stack
& Save and free shipping are live. Re-check any time with
`node scripts/store-setup/audit.mjs` and `node scripts/store-setup/cart-test.mjs`.

**Support email mismatch (fix before launch).** The site, footer and the
published policies use `roanpriatel379@gmail.com` (`CONTACT_EMAIL` in
`app/data/commerce.ts`), but this store's Shopify customer email — the one
order confirmations use — is `roanpriatel389@gmail.com`. One is wrong. Tell
me which, and I'll update the code and republish the policies.

**BLOCKER 1 — nothing outside Canada can be bought.** In a US (or EU) context
every product reports `availableForSale: false` and carts return
`MERCHANDISE_OUT_OF_STOCK`; Canada works. The storefront browses as `US`
(`app/lib/context.ts`), so the site currently shows everything sold out.
Ruled out via the API: stock (9999, CONTINUE policy), publication, shipping
zones and rates (US/EU/AU/ROW all present), markets (active, USD), timing.
Also ruled out on 2026-11-25 by reversible experiments (all restored):
untracked inventory (still sold out), the US market priced in the store's own
CAD (still sold out), delivery customizations and fulfilment constraint
rules (none exist), and both locations are eligible for delivery profiles.
Both locations — including Printify's — are registered in **Canada**, so the
likely cause is an order-routing / fulfillable-inventory rule that keeps a
market to locations inside it. Check Settings → Shipping and delivery →
**Order routing** (e.g. "Stay within the destination market") and any
"Fulfillable inventory" / "sell only within shipping zones" option, and
Settings → Markets → United States. The Printify location's address can only
be edited by Printify (the API refuses) — if needed, ask Printify support to
set it to the real origin (Monster Digital, Miami FL). Then run
`cart-test.mjs`: the US rows should show a shipping rate.

**BLOCKER 2 — the production storefront is private.** `schmucks.store`
redirects visitors to a Shopify login. Hydrogen → Storefront settings →
Environments → Production → URL privacy → Public. Fix blocker 1 first.

Also:
- **Gift cards are switched off in Shopify.** Creating the gift card product
  ($25/$50/$100, copy ready in the session notes) is refused until you turn
  gift cards on: Settings → Gift cards. The shelves already exclude gift
  cards (Best Sellers/New Arrivals rules), so it's safe to switch on.
- **Social handles** — send them and they go into the footer and the
  OnlineStore schema (`sameAs`).
- Canadians are charged C$42; US and International pay US$42 (manual rate
  1.0). If you'd rather everyone pays USD, change the store currency to USD in
  Settings → Store details (no orders exist yet, so it's allowed).
- Newsletter signups now create subscribed customers (verified on this store).

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
- **THERE IS NO FREE SHIPPING. RESOLVED 2026-07-30 — the site was lying.**
  Checked against the Admin API (`GET /admin/api/2026-04/shipping_zones.json`):
  **32 zones, 372 rates, zero price-based (threshold) rates, zero $0.00 rates.**
  Every zone is weight-based flat rate. The storefront had been promising "free
  shipping on orders over $50" in the announcement bar on every page, the
  marquee, the footer, the cart progress meter, the PDP, the FAQ and the Pair
  Programme — and the checkout charged for shipping every time. Someone adding
  a second shirt to "unlock free shipping" got billed for it at the till.
  All of it is now suppressed behind `FREE_SHIPPING_LIVE` in
  `app/data/commerce.ts`. Real US rates, for reference:
  1 shirt **$4.75**, 2 shirts **$7.15**, 3 shirts **$9.55** (Canada $9.39 /
  $13.78, EU ~$13.49 / $17.49, rest of world $10 / $14).
  **If you want free shipping to be true**, add a price-based $0.00 rate with a
  minimum order price per zone in Settings → Shipping and delivery, then flip
  `FREE_SHIPPING_LIVE` to `true` — every claim comes back at once. Note that at
  $42 a shirt with $7.15 US shipping, a $50 threshold means you'd absorb $7.15
  on most two-shirt orders.

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
