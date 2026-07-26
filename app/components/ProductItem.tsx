import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const gallery = 'images' in product ? (product.images?.nodes ?? []) : [];
  const image = product.featuredImage ?? gallery[0] ?? null;
  const secondary = gallery.find((img) => img?.id && img.id !== image?.id);
  const sizes = '(min-width: 45em) 400px, 50vw';
  // Sizes carry a price ladder ($25/$27/$29), so a single figure would be a
  // half-truth on any product whose variants differ.
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
            alt={image.altText || product.title}
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
        <h3 className="sx-card__title">{product.title}</h3>
        <div className="sx-card__meta">Unisex tee · S–3XL</div>
        <div className="sx-card__price sx-display">
          {hasRange ? <span className="sx-card__from">from </span> : null}
          <Money data={minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
