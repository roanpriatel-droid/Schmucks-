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
 * Free-shipping threshold, in shop currency.
 *
 * UNVERIFIED — and it is the most-repeated claim on the storefront (announcement
 * bar, marquee, footer, cart progress, PDP). Every other constant in this file
 * carries a verification; this one cannot get one from code: the Storefront API
 * will not expose delivery options for this shop, so a cart with a US address
 * comes back with no `deliveryGroups` at any subtotal. Confirming it needs
 * Shopify admin → Settings → Shipping and delivery.
 *
 * Because it is unverified it is deliberately NOT asserted in Product
 * structured data — a `shippingDetails` claim Google can't match at checkout is
 * worse than none. See NEEDS_INPUT.md; the brand brief said $100, not $50.
 */
export const FREE_SHIPPING_THRESHOLD = 50;

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
export const MULTI_BUY_LINE = `Free shipping kicks in over $${FREE_SHIPPING_THRESHOLD} — one shirt doesn't get you there, two do.`;

export function stackTierFor(quantity: number) {
  return [...STACK_TIERS].reverse().find((tier) => quantity >= tier.quantity);
}

export function nextStackTier(quantity: number) {
  return STACK_TIERS.find((tier) => quantity < tier.quantity);
}
