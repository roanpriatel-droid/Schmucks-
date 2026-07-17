/**
 * Thin, framework-agnostic analytics abstraction. Pushes GA4-style events to
 * window.dataLayer (works with GTM/GA4 when a container is installed; a no-op
 * otherwise). Keeps event names in one place so wiring stays consistent.
 *
 * Hydrogen's <Analytics.Provider> handles Shopify-native analytics separately;
 * this is the portable layer for view_item / add_to_cart / begin_checkout /
 * newsletter_signup.
 */
type EventName =
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'newsletter_signup';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: EventName, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event, ...params});
}
