import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {QuickAdd} from '~/components/QuickAdd';
import {useCanHover} from '~/lib/useCanHover';
import {splitTitle} from '~/lib/productCopy';

/**
 * The joke is the product. A fixed type size clamped to three lines cut the
 * punchline off ~15% of the catalogue — and the long ones are the specific,
 * funny ones people actually click. Titles get smaller as they get longer so
 * every line lands, measured against the real distribution: median 24 chars,
 * p90 44, max 106.
 */
function titleSizeClass(length: number) {
  if (length > 62) return 'sx-card__title--xs';
  if (length > 44) return 'sx-card__title--sm';
  if (length > 28) return 'sx-card__title--md';
  return '';
}

export function ProductItem({
  product,
  loading,
  quickAdd = false,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
  /** Show the inline size picker + add button (listing pages). */
  quickAdd?: boolean;
}) {
  const variants =
    'variants' in product ? (product.variants?.nodes ?? []) : [];
  // Touch devices can never trigger the hover swap, so they never fetch it.
  const canHover = useCanHover();
  // The "— Schmucks · N°. 359" suffix is 21 characters of boilerplate against a
  // 24-character median title. On a card it buries the joke, so the number
  // becomes a badge and the line itself gets the space.
  const {displayTitle, catalogueNumber} = splitTitle(product.title);
  const variantUrl = useVariantUrl(product.handle);
  const gallery = 'images' in product ? (product.images?.nodes ?? []) : [];
  const image = product.featuredImage ?? gallery[0] ?? null;
  /**
   * The hover used to swap in a second mockup — a near-identical shot of the
   * same garment, costing a whole extra image request to show almost nothing.
   * It now zooms the print instead, which is the one thing a shopper browsing
   * 393 near-identical black tees actually wants to see, and reuses the primary
   * URL so it costs no extra bytes. See .sx-card__img--secondary.
   */
  const secondary = image;
  const sizes = '(min-width: 45em) 400px, 50vw';
  // If a product's variants ever differ in price, one figure would be a
  // half-truth — show a range instead. (Today the catalogue is flat-priced.)
  const {minVariantPrice, maxVariantPrice} = product.priceRange;
  const hasRange =
    maxVariantPrice && minVariantPrice.amount !== maxVariantPrice.amount;
  return (
    /**
     * The card is a div, not a link. It used to be one <Link> wrapping
     * everything including the quick-add form — which forced the wrapper to
     * preventDefault() every click to stop the card navigating, and that also
     * cancelled the form's own submit. Quick-add looked interactive on all 24
     * cards and added nothing to the cart. Interactive controls now sit
     * outside the anchor instead of inside it.
     */
    <div className="sx-card" key={product.id}>
      <Link className="sx-card__link" prefetch="intent" to={variantUrl}>
        <div
          className={`sx-card__media ${secondary ? 'sx-card__media--swap' : ''}`}
        >
          {!image && <span className="sx-card__noimg" aria-hidden="true" />}
          {image && (
            <Image
              alt={image.altText || displayTitle}
              aspectRatio="1/1"
              data={image}
              loading={loading ?? 'lazy'}
              sizes={sizes}
              className="sx-card__img--primary"
            />
          )}
          {secondary && canHover && (
            <Image
              alt=""
              aria-hidden="true"
              aspectRatio="1/1"
              data={secondary}
              loading="lazy"
              sizes={sizes}
              className="sx-card__img--secondary"
            />
          )}
        </div>
        <div className="sx-card__body">
          <p
            className={`sx-card__title ${titleSizeClass(displayTitle.length)}`.trim()}
          >
            {displayTitle}
          </p>
          {catalogueNumber ? (
            <span className="sx-card__no">N°. {catalogueNumber}</span>
          ) : null}
          <div className="sx-card__price sx-display">
            {hasRange ? <span className="sx-card__from">from </span> : null}
            <Money data={minVariantPrice} />
          </div>
        </div>
      </Link>
      {quickAdd && variants.length ? (
        <div className="sx-card__foot">
          <QuickAdd variants={variants} productTitle={displayTitle} />
        </div>
      ) : null}
    </div>
  );
}
