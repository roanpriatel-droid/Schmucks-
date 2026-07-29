import {Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';

/**
 * A shoppable rail for the site's dead ends — an empty cart, a search that
 * matched nothing, a 404. Each of those was previously a single link back to
 * the catalogue, which asks the shopper to start over rather than handing them
 * something to buy. Four products, in the page's own voice.
 */
export function RescueRail({
  products,
  eyebrow,
  title,
}: {
  products: Array<Parameters<typeof ProductItem>[0]['product']>;
  eyebrow: string;
  title: string;
}) {
  if (!products.length) return null;

  return (
    <section className="sx-rescue" aria-labelledby="sx-rescue-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">{eyebrow}</p>
            <h2 className="sx-section-title" id="sx-rescue-title">
              {title}
            </h2>
          </div>
        </div>
        <div className="sx-grid">
          {products.slice(0, 4).map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        <div className="sx-specials__cta">
          <Link className="sx-btn" to="/tees">
            See every design
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Newest four, shared by every rescue surface. */
export const RESCUE_PRODUCTS_QUERY = `#graphql
  fragment RescueItem on Product {
    id
    handle
    title
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
  query RescueProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...RescueItem
      }
    }
  }
` as const;
