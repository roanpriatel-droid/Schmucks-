import {Link} from 'react-router';
import {useAside} from '~/components/Aside';

/**
 * Cart drawer upsell. Shown while the cart holds a single shirt — the exact
 * point where one more unlocks the 10% Stack & Save tier. Disappears at two,
 * because at that point the nudge is just noise.
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
        Two shirts takes 10% off the lot, applied automatically at checkout. No
        code, no minimum spend, no catch worth mentioning.
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
