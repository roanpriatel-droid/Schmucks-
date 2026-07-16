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
  const image = product.featuredImage;
  return (
    <Link
      className="sx-card"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="sx-card__media">
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}
      </div>
      <div className="sx-card__body">
        <h4 className="sx-card__title">{product.title}</h4>
        <div className="sx-card__reviews">
          <span className="sx-stars">★★★★★</span>
          <span>(new)</span>
        </div>
        <div className="sx-card__price sx-display">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
