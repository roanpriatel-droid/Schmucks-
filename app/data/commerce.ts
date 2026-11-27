/**
 * Commerce facts — the single source of truth for every number the storefront
 * states in copy. Nothing here may be repeated as a literal anywhere else.
 *
 * Verified against the live Storefront API on 2026-07-26:
 *   391 products, all USD $42.00, one price across every variant and size,
 *   options Color (Gold / Natural / Black) and Size (S–3XL), ships worldwide.
 *
 * Prices are NEVER hardcoded in components — render <Money> from the API so a
 * price change in admin can't leave stale copy behind. The constants below are
 * only for thresholds and ladder percentages, which the API doesn't expose.
 */

/**
 * Is there free shipping over a threshold?
 *
 * TRUE as of 2026-11-24, on the store at x1ugph-ad.myshopify.com. Two
 * automatic free-shipping discounts exist (scripts/store-setup, --free-shipping):
 *   United States — order subtotal ≥ US$50
 *   Canada        — order subtotal ≥ US$75
 * Verified with `node scripts/store-setup/cart-test.mjs`: a two-shirt Canadian
 * cart applies "Free shipping — CA orders $75+". The subtotal is measured after
 * Stack & Save, so two shirts ($75.60) still clear both thresholds.
 *
 * If either discount is deleted in admin, set this back to false — every
 * free-shipping claim on the site switches off at once.
 */
export const FREE_SHIPPING_LIVE = true;

/**
 * Threshold used only when FREE_SHIPPING_LIVE is true. Kept so the copy can
 * come back unchanged the moment a real rate exists.
 */
export const FREE_SHIPPING_THRESHOLD = 50;

/** Canada's threshold, in US dollars (the store and every market price in USD). */
export const FREE_SHIPPING_THRESHOLD_CA = 75;

/**
 * Cheapest real US shipping rate: the Printify profile's United States zone
 * starts at $4.95 for the lightest weight bracket (verified 2026-11-24).
 * Used instead of a free-shipping promise so the site still says something
 * concrete about delivery cost.
 */
export const US_SHIPPING_FROM = 4.95;

/**
 * Real shipping rates (USD), from the Printify delivery profile on the store —
 * Printify's cost for blueprint 6 / provider 29 passed straight through,
 * first item + each extra. Verified 2026-11-24 via the Admin API.
 */
export const SHIPPING_RATES = [
  {region: 'United States', first: 4.95, extra: 2.4},
  {region: 'Canada', first: 9.69, extra: 4.39},
  {region: 'European Union', first: 13.49, extra: 4.0},
  {region: 'Australia', first: 12.99, extra: 4.99},
  {region: 'Rest of world', first: 10.39, extra: 4.0},
] as const;

/**
 * Production time before anything ships, in days.
 *
 * From the Printify catalogue for this blueprint/provider
 * (`handling_time: {value: 10, unit: 'day'}`). Nothing on the storefront said
 * when an order would arrive, which is the question every print-to-order
 * shopper asks and the one most likely to become a support ticket or a
 * chargeback. Transit is on top of this.
 */
export const PRODUCTION_DAYS = 10;

/**
 * Is the Stack & Save multi-buy discount actually live at checkout?
 *
 * TRUE as of 2026-11-24. Three automatic discounts exist (2 = 10%, 3 = 20%,
 * 4+ = 30%; they don't combine, Shopify applies the best). Verified with
 * `node scripts/store-setup/cart-test.mjs`, which prices real carts:
 *   1 shirt $42.00 · 2 → $75.60 (−8.40) · 3 → $100.80 (−25.20) · 4 → $117.60 (−50.40)
 * in both USD and CAD.
 *
 * If the discounts are deleted or edited in admin, set this back to false.
 */
export const STACK_DISCOUNT_LIVE = true;

/**
 * Stack & Save tiers. Only rendered when STACK_DISCOUNT_LIVE is true.
 */
export const STACK_TIERS = [
  {quantity: 2, percent: 10},
  {quantity: 3, percent: 20},
  {quantity: 4, percent: 30},
] as const;

/**
 * Does the catalogue contain more than one price?
 *
 * VERIFIED FALSE on 2026-07-27: all 391 products return 42.00 in the shop's
 * currency. While this is false, "Price: low to high" and "Price: high to low"
 * are controls that cannot change anything — a shopper picks one, the page
 * reloads, and the order is identical — so they are removed from the sort list.
 * Add a second price point and flip this back to `true`.
 */
export const MULTI_PRICE_CATALOGUE = false;

/**
 * Does the shop have enough sales history for a "best sellers" ranking?
 *
 * VERIFIED FALSE on 2026-07-27: `products(sortKey: BEST_SELLING)` returns the
 * *identical* order to `products(sortKey: CREATED_AT, reverse: true)` — the
 * first eight titles match exactly. That is Shopify falling back to default
 * ordering because nothing has sold. Ranking 393 products as "best sellers" on
 * that basis is an invented ranking, so while this is false the Best Sellers
 * shelf redirects to New Arrivals rather than fabricate one.
 *
 * TO TURN IT ON: once real orders exist, re-run the comparison; if the two
 * orders diverge, flip this to `true`.
 */
export const SALES_DATA_AVAILABLE = false;

/**
 * How many products "New Arrivals" holds. It is a shelf, not the catalogue —
 * unbounded it returned all 393 and duplicated /tees. Set to exactly one page
 * so every product in the window is reachable without paging.
 */
export const NEW_ARRIVALS_LIMIT = 24;

/** The blank every design is printed on. */
export const BLANK = 'Gildan 5000 Heavy Cotton';

/**
 * Garment facts, taken from the Printify catalogue entry for blueprint 6
 * (Gildan 5000 "Unisex Heavy Cotton Tee"), verified 2026-07-30.
 *
 * NOTE ON "RINGSPUN": the site used to describe this tee as "100% ringspun
 * cotton … finer, smoother, stronger yarn than standard open-end cotton". The
 * Gildan 5000 is carded open-end cotton — Printify's spec says only "100%
 * cotton" and never ringspun (its genuinely ringspun blanks say so explicitly).
 * The claim was both unsupported and specifically contradicted by the garment
 * it described, so it is gone. The facts below are ones the supplier documents.
 */
export const GARMENT_FACTS = {
  weightGsm: 180,
  weightOz: 5.3,
  composition: '100% US-grown cotton',
  construction: 'Seamless tubular body — no side seams',
  collar: 'Ribbed crew neck, taped neck and shoulders',
  label: 'Tear-away label',
  certification: 'OEKO-TEX® STANDARD 100 (cert. 168252, OETI)',
  sourcing: 'US Cotton Trust Protocol member',
} as const;

/** Size run offered on every product. */
export const SIZE_RUN = 'S–3XL';

/** Returns window in days, stated in the announcement bar and trust rows. */
export const RETURNS_DAYS = 30;

/** Contact address. Placeholder until a real inbox exists (NEEDS_INPUT.md). */
/**
 * Customer service address.
 *
 * Was `help@schmucks.example`. `.example` is a reserved TLD that can never
 * resolve, so every "email us" link on the site — the contact form's mailto,
 * the FAQ, the returns instructions — silently discarded the message. A
 * shopper with a problem had no working way to reach anyone.
 *
 * This is the address Shopify already has as the store's `customer_email`, so
 * it is the one every order confirmation tells customers to reply to. Putting
 * it on the contact page is not a new exposure.
 *
 * WORTH UPGRADING: you own shmucks.store, and Shopify-managed domains support
 * free email forwarding. Setting up help@shmucks.store → this inbox takes a
 * minute and looks considerably better on a receipt. Change this constant and
 * every path updates.
 */
export const CONTACT_EMAIL = 'roanpriatel389@gmail.com';

/**
 * The honest multi-buy reason while Stack & Save is off: one shirt sits under
 * the free-shipping threshold and two clear it. That's a real incentive the
 * checkout actually honours.
 */
/**
 * The multi-buy line.
 *
 * This used to be "free shipping kicks in over $50 — one shirt doesn't get you
 * there, two do", which was the site's main reason to add a second shirt and
 * is false (see FREE_SHIPPING_LIVE). With no discount and no free-shipping
 * tier, there is currently NO financial reason to buy two, so the copy no
 * longer invents one — the pair stands on being a pair.
 */
export const MULTI_BUY_LINE = FREE_SHIPPING_LIVE
  ? `Free shipping kicks in over $${FREE_SHIPPING_THRESHOLD} — one shirt doesn't get you there, two do.`
  : `Two people, two shirts, one running joke. Sizes are chosen separately, so nobody has to compromise.`;

export function stackTierFor(quantity: number) {
  return [...STACK_TIERS].reverse().find((tier) => quantity >= tier.quantity);
}

export function nextStackTier(quantity: number) {
  return STACK_TIERS.find((tier) => quantity < tier.quantity);
}
