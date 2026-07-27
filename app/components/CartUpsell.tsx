import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {
  FREE_SHIPPING_THRESHOLD,
  STACK_DISCOUNT_LIVE,
  STACK_TIERS,
} from '~/data/commerce';

/**
 * Cart drawer upsell, shown while the cart holds a single shirt.
 *
 * The reason to add a second one has to be a promise checkout will keep. With
 * Stack & Save off, that's the free-shipping threshold — one $42 shirt sits
 * under it and two clear it. When the multi-buy discount goes live the tier
 * language comes back automatically.
 */
export function CartUpsell({totalQuantity}: {totalQuantity: number}) {
  const {close} = useAside();

  if (totalQuantity !== 1) return null;

  return (
    <aside className="sx-upsell" aria-label="Add another shirt">
      <p className="sx-upsell__title sx-display">
        Add a second shirt — idiocy loves company
      </p>
      <p className="sx-upsell__note">
        {STACK_DISCOUNT_LIVE
          ? `Two shirts takes ${STACK_TIERS[0].percent}% off the lot, applied automatically at checkout. No code, no catch worth mentioning.`
          : `Orders over $${FREE_SHIPPING_THRESHOLD} ship free, and one shirt doesn’t get you there. Two do — and the second one is somebody else’s problem to explain.`}
      </p>
      <div className="sx-upsell__ctas">
        <Link
          className="sx-btn sx-btn--ketchup sx-upsell__btn"
          to="/collections/the-pair-programme"
          onClick={close}
          prefetch="intent"
        >
          Find its other half
        </Link>
        <Link
          className="sx-upsell__link"
          to="/tees"
          onClick={close}
          prefetch="intent"
        >
          Browse everything
        </Link>
      </div>
    </aside>
  );
}
