/**
 * "Complete The Pair" mapping — which shirt goes with which.
 *
 * The upstream pipeline keeps this as `content/pairs.json`; that repo isn't
 * available here, so the mapping is committed to the storefront instead. Keep
 * the shape identical to pairs.json so it can be regenerated:
 *
 *   { "<product-handle>": ["<partner-handle>", "<partner-handle>"] }
 *
 * Handles are Shopify product handles. Unknown handles are ignored, so a stale
 * entry can never break a product page — and any product with no entry falls
 * back to The Pair Programme shelf (see `~/lib/pairs`).
 */
export type PairMap = Record<string, string[]>;

export const PAIRS: PairMap = {
  // Populated when the pipeline emits pairs.json against the live catalogue.
  // Example shape, kept as documentation:
  // 'i-peaked-online': ['i-peaked-online-too', 'we-peaked-together'],
};

/** Partner handles for a product, minus itself. Empty when unmapped. */
export function pairedHandles(handle: string): string[] {
  const partners = PAIRS[handle] ?? [];
  return partners.filter((partner) => partner !== handle);
}
