import {PRODUCTION_DAYS, US_SHIPPING_FROM} from '~/data/commerce';

/**
 * Buy-box trust row. Every line here is a claim the shop actually makes
 * elsewhere (announcement bar, policies, product copy) — no invented badges.
 *
 * The delivery line is new: nothing on the storefront said when an order would
 * arrive, which is the first question a print-to-order shopper asks and the one
 * most likely to become a support ticket or a chargeback. The number is the
 * print provider's own production time (see PRODUCTION_DAYS).
 */
const ITEMS = [
  {
    icon: '⏱',
    title: `Made to order — up to ${PRODUCTION_DAYS} days`,
    note: `Then shipping on top, from $${US_SHIPPING_FROM.toFixed(2)} in the US.`,
  },
  {
    icon: '↩',
    title: '30-day returns',
    note: 'No questions. We might ask one.',
  },
  {
    icon: '🇺🇸',
    title: 'Printed in the US',
    note: 'Made to order, not warehoused.',
  },
  {
    icon: '🔒',
    title: 'Secure checkout',
    note: 'Payments handled by Shopify.',
  },
];

export function TrustRow() {
  return (
    <ul className="sx-trustrow" aria-label="What you get">
      {ITEMS.map((item) => (
        <li className="sx-trustrow__item" key={item.title}>
          <span className="sx-trustrow__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="sx-trustrow__text">
            <span className="sx-trustrow__title">{item.title}</span>
            <span className="sx-trustrow__note">{item.note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
