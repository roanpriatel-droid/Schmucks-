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
 * VERIFIED FALSE on 2026-07-30 against the Shopify Admin API
 * (GET /admin/api/2026-04/shipping_zones.json, shop 101605572889):
 *
 *   32 zones, 372 shipping rates.
 *   price-based (threshold) rates anywhere: 0
 *   rates costing $0.00 anywhere:           0
 *
 * Every zone is weight-based flat rate. There is no free shipping in any
 * country at any subtotal. The storefront had been promising "free shipping on
 * orders over $50" in the announcement bar on every page, the marquee, the
 * footer, the cart progress meter, the PDP, the FAQ and the Pair Programme —
 * and the checkout charges for shipping every time. A shopper adding a second
 * shirt to "unlock free shipping" was being charged for it at the till.
 *
 * TO TURN IT ON: Shopify admin → Settings → Shipping and delivery → add a
 * price-based rate of $0.00 with a minimum order price, in each zone you want
 * it. Then re-run the check above and flip this to `true`. Every claim across
 * the site comes back at once.
 */
export const FREE_SHIPPING_LIVE = false;

/**
 * Threshold used only when FREE_SHIPPING_LIVE is true. Kept so the copy can
 * come back unchanged the moment a real rate exists.
 */
export const FREE_SHIPPING_THRESHOLD = 50;

/**
 * Cheapest real US shipping rate, from the shipping_zones response above:
 * the United States zone starts at $4.75 for the lightest weight bracket.
 * Used instead of a free-shipping promise so the site still says something
 * concrete about delivery cost.
 */
export const US_SHIPPING_FROM = 4.75;

/**
 * Real shipping rates, from the Admin API shipping_zones response and matched
 * against what Printify charges for blueprint 6 / provider 29 — the store
 * passes the print provider's cost straight through, first item + each extra.
 * Verified 2026-07-30.
 */
export const SHIPPING_RATES = [
  {region: 'United States', first: 4.75, extra: 2.4},
  {region: 'Canada', first: 9.39, extra: 4.39},
  {region: 'Europe', first: 13.49, extra: 4.0},
  {region: 'Australia', first: 12.49, extra: 4.99},
  {region: 'Rest of world', first: 10.0, extra: 4.0},
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
 * VERIFIED FALSE on 2026-07-27 by building real carts through the Storefront
 * API: 2 shirts = $84.00 and 4 shirts = $168.00, with `discountAllocations`
 * empty at every quantity, and six candidate codes (STACK10, STACK2, STACK,
 * PAIR10, SCHMUCKS10, WELCOME10) all reporting `applicable: false`.
 *
 * A storefront must never promise a price the checkout won't honour, so while
 * this is false every Stack & Save claim on the site is suppressed and the
 * honest free-shipping threshold does the multi-buy work instead.
 *
 * TO TURN IT ON: create the automatic discount in Shopify admin (Discounts →
 * Automatic → 2+ = 10%, 3 = 20%, 4+ = 30%), re-run the cart test below, then
 * flip this to `true`. Every claim across the site comes back at once.
 *
 *   cartCreate(input:{lines:[{merchandiseId:"<variant>", quantity:2}]}) {
 *     cart { cost { totalAmount { amount } } discountAllocations { ... } }
 *   }
 */
export const STACK_DISCOUNT_LIVE = false;

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
export const CONTACT_EMAIL = 'help@schmucks.example';

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
