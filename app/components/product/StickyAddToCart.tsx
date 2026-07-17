import {useEffect, useState, type RefObject, type ReactNode} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {track} from '~/lib/analytics';
import type {ProductFragment} from 'storefrontapi.generated';

/**
 * Mobile-first sticky add-to-cart. Appears once the main buy block
 * (`watchRef`) scrolls out of view.
 */
export function StickyAddToCart({
  title,
  price,
  selectedVariant,
  watchRef,
}: {
  title: string;
  price: ReactNode;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  watchRef: RefObject<HTMLElement | null>;
}) {
  const {open} = useAside();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      {threshold: 0},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [watchRef]);

  const available = Boolean(selectedVariant?.availableForSale);

  return (
    <div
      className={`sx-sticky-atc ${shown ? 'is-shown' : ''}`}
      aria-hidden={!shown}
    >
      <div className="sx-sticky-atc__inner">
        <div className="sx-sticky-atc__info">
          <span className="sx-sticky-atc__name">{title}</span>
          <span className="sx-sticky-atc__price sx-display">{price}</span>
        </div>
        <div className="sx-sticky-atc__cta">
          <AddToCartButton
            disabled={!available}
            onClick={() => {
              track('add_to_cart', {variant_id: selectedVariant?.id});
              open('cart');
            }}
            lines={
              selectedVariant
                ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
                : []
            }
          >
            {available ? 'Add to cart' : 'Sold out'}
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}
