/**
 * Commerce facts — the single source of truth for every number the storefront
 * states in copy. Nothing here may be repeated as a literal anywhere else.
 *
 * Verified against the live Storefront API on 2026-07-26:
 *   393 products, all CAD $42.00, one price across every variant and size,
 *   options Color (Gold / Natural / Black) and Size (S–3XL), ships worldwide.
 *
 * Prices are NEVER hardcoded in components — render <Money> from the API so a
 * price change in admin can't leave stale copy behind. The constants below are
 * only for thresholds and ladder percentages, which the API doesn't expose.
 */

/** Free-shipping threshold used by the cart progress bar, in shop currency. */
export const FREE_SHIPPING_THRESHOLD = 50;

/**
 * Stack & Save tiers. These are UI only until the matching Shopify automatic
 * discount exists in admin — see NEEDS_INPUT.md.
 */
export const STACK_TIERS = [
  {quantity: 2, percent: 10},
  {quantity: 3, percent: 20},
  {quantity: 4, percent: 30},
] as const;

/** The blank every design is printed on. */
export const BLANK = 'Gildan 5000 Heavy Cotton';

/** Size run offered on every product. */
export const SIZE_RUN = 'S–3XL';

/** Returns window in days, stated in the announcement bar and trust rows. */
export const RETURNS_DAYS = 30;

/** Contact address. Placeholder until a real inbox exists (NEEDS_INPUT.md). */
export const CONTACT_EMAIL = 'help@schmucks.example';

export function stackTierFor(quantity: number) {
  return [...STACK_TIERS].reverse().find((tier) => quantity >= tier.quantity);
}

export function nextStackTier(quantity: number) {
  return STACK_TIERS.find((tier) => quantity < tier.quantity);
}
