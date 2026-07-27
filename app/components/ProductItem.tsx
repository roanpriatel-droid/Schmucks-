import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {QuickAdd} from '~/components/QuickAdd';
import {splitTitle} from '~/lib/productCopy';

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
  // The "— Schmucks · N°. 359" suffix is 21 characters of boilerplate against a
  // 24-character median title. On a card it buries the joke, so the number
  // becomes a badge and the line itself gets the space.
  const {displayTitle, catalogueNumber} = splitTitle(product.title);
  const variantUrl = useVariantUrl(product.handle);
  const gallery = 'images' in product ? (product.images?.nodes ?? []) : [];
  const image = product.featuredImage ?? gallery[0] ?? null;
  const secondary = gallery.find((img) => img?.id && img.id !== image?.id);
  const sizes = '(min-width: 45em) 400px, 50vw';
  // If a product's variants ever differ in price, one figure would be a
  // half-truth — show a range instead. (Today the catalogue is flat-priced.)
  const {minVariantPrice, maxVariantPrice} = product.priceRange;
  const hasRange =
    maxVariantPrice && minVariantPrice.amount !== maxVariantPrice.amount;
  return (
    <Link
      className="sx-card"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className={`sx-card__media ${secondary ? 'sx-card__media--swap' : ''}`}>
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
        {secondary && (
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
        <p className="sx-card__title">{displayTitle}</p>
        {catalogueNumber ? (
          <span className="sx-card__no">N°. {catalogueNumber}</span>
        ) : null}
        <div className="sx-card__meta">Unisex tee · S–3XL</div>
        <div className="sx-card__price sx-display">
          {hasRange ? <span className="sx-card__from">from </span> : null}
          <Money data={minVariantPrice} />
        </div>
        {quickAdd && variants.length ? (
          <QuickAdd variants={variants} productTitle={displayTitle} />
        ) : null}
      </div>
    </Link>
  );
}
