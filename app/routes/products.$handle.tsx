import {useRef, useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  Money,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductForm} from '~/components/ProductForm';
import {ProductItem} from '~/components/ProductItem';
import {ProductGallery} from '~/components/product/ProductGallery';
import {SizeGuideModal} from '~/components/product/SizeGuideModal';
import {StickyAddToCart} from '~/components/product/StickyAddToCart';
import {Reveal} from '~/components/Reveal';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => {
  const p = data?.product;
  return [
    {title: `${p?.title ?? 'Shirt'} — SCHMUCKS`},
    {
      name: 'description',
      content: p?.description
        ? p.description.slice(0, 155)
        : `${p?.title ?? 'A Schmucks tee'} — heavyweight unisex graphic tee, $25 flat, S–3XL, printed to order.`,
    },
    {rel: 'canonical', href: `/products/${p?.handle}`},
    {property: 'og:title', content: p?.title ?? 'SCHMUCKS'},
    {property: 'og:type', content: 'product'},
    ...(p?.featuredImage?.url
      ? [{property: 'og:image', content: p.featuredImage.url}]
      : []),
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}, {products}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    storefront.query(RELATED_PRODUCTS_QUERY).catch(() => ({products: null})),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const related = (products?.nodes ?? [])
    .filter((p: {handle: string}) => p.handle !== handle)
    .slice(0, 4);

  return {
    product,
    related,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product, related} = useLoaderData<typeof loader>();
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const buyRef = useRef<HTMLDivElement | null>(null);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  // Gallery: product images, fall back to the selected variant image.
  const galleryImages = product.images?.nodes?.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  const hasSizeOption = productOptions.some(
    (o) => o.name.toLowerCase() === 'size',
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} — a Schmucks graphic tee.`,
    image: galleryImages.map((i) => i?.url).filter(Boolean),
    brand: {'@type': 'Brand', name: 'SCHMUCKS'},
    offers: {
      '@type': 'Offer',
      price: selectedVariant?.price?.amount ?? '25.00',
      priceCurrency: selectedVariant?.price?.currencyCode ?? 'USD',
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="sx-product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <div className="sx-product sx-wrap">
        <div>
          <ProductGallery images={galleryImages} title={title} />
        </div>

        <div className="sx-product__main">
          <p className="sx-product__eyebrow">Fine Apparel for Idiots</p>
          <h1 className="sx-product__title">{title}</h1>

          <div className="sx-product__badges">
            <span className="sx-product__badge">Unisex</span>
            <span className="sx-product__badge">S–3XL</span>
            <span className="sx-product__badge">Heavyweight Cotton</span>
            <span className="sx-product__badge">Printed to Order</span>
          </div>

          <div className="sx-product__price">
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          {hasSizeOption && (
            <div className="sx-sizerow">
              <span />
              <button
                type="button"
                className="sx-sizeguide-btn"
                onClick={() => setSizeGuideOpen(true)}
              >
                📏 Size guide
              </button>
            </div>
          )}

          <div ref={buyRef}>
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>

          <ul className="sx-product__perks">
            <li>Free US shipping over $100</li>
            <li>Stack &amp; save up to 30% when you buy more (auto at checkout)</li>
            <li>30-day returns, no interrogation (maybe one question)</li>
            <li>Printed to order on heavyweight ringspun cotton</li>
          </ul>

          <ProductDetails descriptionHtml={descriptionHtml} />
        </div>
      </div>

      {related?.length ? (
        <section className="sx-crosssell">
          <div className="sx-wrap">
            <div className="sx-section-head">
              <div>
                <p className="sx-eyebrow">Complete the Look</p>
                <h2 className="sx-section-title">You May Also Regret</h2>
              </div>
            </div>
            <Reveal className="sx-grid">
              {(related as CollectionItemFragment[]).map((p, i) => (
                <ProductItem key={p.id} product={p} loading={i < 4 ? 'eager' : undefined} />
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}

      <StickyAddToCart
        title={title}
        price={selectedVariant?.price ? <Money data={selectedVariant.price} /> : null}
        selectedVariant={selectedVariant}
        watchRef={buyRef}
      />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function ProductDetails({descriptionHtml}: {descriptionHtml?: string}) {
  return (
    <div className="sx-acc">
      <details className="sx-acc__item" open>
        <summary className="sx-acc__q">Details &amp; Fit</summary>
        <div className="sx-acc__a">
          {descriptionHtml ? (
            <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
          ) : (
            <p>
              A genuinely comfortable unisex heavyweight tee with a design your
              group chat will respect and your relatives won&rsquo;t. Relaxed,
              true-to-size fit — size up for a boxier drape.
            </p>
          )}
          <p style={{marginTop: '0.5rem'}}>
            <Link to="/pages/size-guide" style={{color: 'var(--ketchup)', fontWeight: 700, textDecoration: 'underline'}}>
              Full size &amp; fit guide →
            </Link>
          </p>
        </div>
      </details>
      <details className="sx-acc__item">
        <summary className="sx-acc__q">Materials</summary>
        <div className="sx-acc__a">
          <ul>
            <li>~180 gsm heavyweight ringspun cotton</li>
            <li>Ribbed crew collar, shoulder-to-shoulder taping</li>
            <li>Double-needle sleeve &amp; bottom hems</li>
            <li>Soft-hand print that sinks into the fabric</li>
          </ul>
          <p style={{marginTop: '0.5rem'}}>
            <Link to="/pages/materials" style={{color: 'var(--ketchup)', fontWeight: 700, textDecoration: 'underline'}}>
              How it&rsquo;s made →
            </Link>
          </p>
        </div>
      </details>
      <details className="sx-acc__item">
        <summary className="sx-acc__q">Care</summary>
        <div className="sx-acc__a">
          Wash cold, inside out. Hang dry. Skip the fabric softener and
          don&rsquo;t iron the print.{' '}
          <Link to="/pages/care" style={{color: 'var(--ketchup)', fontWeight: 700, textDecoration: 'underline'}}>
            Full care guide →
          </Link>
        </div>
      </details>
      <details className="sx-acc__item">
        <summary className="sx-acc__q">Shipping &amp; Returns</summary>
        <div className="sx-acc__a">
          Printed to order and shipped from the US. Free US shipping on orders
          over $100. 30-day returns on unworn shirts — see the{' '}
          <Link to="/policies/refund-policy" style={{color: 'var(--ketchup)', fontWeight: 700, textDecoration: 'underline'}}>
            refund policy
          </Link>
          .
        </div>
      </details>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 8) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RELATED_PRODUCTS_QUERY = `#graphql
  fragment RelatedItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        altText
        url
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
  query RelatedProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 5) {
      nodes {
        ...RelatedItem
      }
    }
  }
` as const;
