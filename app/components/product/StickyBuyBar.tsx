import {useEffect, useState, type RefObject} from 'react';
import {Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {track} from '~/lib/analytics';
import type {ProductFragment} from 'storefrontapi.generated';

/**
 * Mobile buy bar, fixed to the bottom of the viewport.
 *
 * Appears once the real buy block scrolls away, so add-to-cart stays inside
 * thumb reach at every scroll depth. Carries the live price and a size
 * reminder; with no size chosen it nudges instead of adding the wrong variant.
 */
export function StickyBuyBar({
  selectedVariant,
  sizeLabel,
  sizeChosen,
  watchRef,
  onNeedSize,
}: {
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  sizeLabel?: string;
  sizeChosen: boolean;
  watchRef: RefObject<HTMLElement | null>;
  onNeedSize: () => void;
}) {
  const {open} = useAside();
  const [shown, setShown] = useState(false);

  /**
   * This used to watch the buy block with an IntersectionObserver. That only
   * delivers a callback when the intersection *changes* — so if the block
   * started below the fold and the shopper flung straight past it, the state
   * went "not intersecting" to "not intersecting", no callback fired, and the
   * bar never appeared. Reproducible by jumping from the top of a PDP to
   * halfway down in one scroll. Measuring position directly can't miss a
   * transition it never observed.
   */
  useEffect(() => {
    const element = watchRef.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      // Shown once the real buy block has scrolled off the top of the screen.
      setShown(element.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [watchRef]);

  const available = Boolean(selectedVariant?.availableForSale);

  return (
    <div className={`sx-sticky-atc ${shown ? 'is-shown' : ''}`} aria-hidden={!shown}>
      <div className="sx-sticky-atc__inner">
        <div className="sx-sticky-atc__info">
          <span className="sx-sticky-atc__price sx-display">
            {selectedVariant?.price ? <Money data={selectedVariant.price} /> : null}
          </span>
          <span className="sx-sticky-atc__size">
            {sizeChosen && sizeLabel ? `Size ${sizeLabel}` : 'No size picked'}
          </span>
        </div>
        <div className="sx-sticky-atc__cta">
          {available && sizeChosen ? (
            <AddToCartButton
              disabled={!selectedVariant}
              onClick={() => {
                track('add_to_cart', {
                  variant_id: selectedVariant?.id,
                  source: 'sticky_bar',
                });
                open('cart');
              }}
              lines={
                selectedVariant
                  ? [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity: 1,
                        selectedVariant,
                      },
                    ]
                  : []
              }
            >
              Add to cart
            </AddToCartButton>
          ) : (
            <button
              type="button"
              className="sx-btn sx-btn--ketchup"
              onClick={onNeedSize}
              // Hidden from the tab order while the bar is off-screen.
              tabIndex={shown ? 0 : -1}
            >
              {available ? 'Pick a size' : 'Sold out'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
