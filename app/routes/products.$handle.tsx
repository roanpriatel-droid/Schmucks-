import {useEffect, useRef, useState} from 'react';
import {useLoaderData, Link, useRouteLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {ProductGallery} from '~/components/product/ProductGallery';
import {BuyBox} from '~/components/product/BuyBox';
import {StickyBuyBar} from '~/components/product/StickyBuyBar';
import {SizeGuideModal} from '~/components/product/SizeGuideModal';
import {TrustRow} from '~/components/product/TrustRow';
import {
  CompleteThePair,
  PairSuggestions,
  type PairPartner,
} from '~/components/product/CompleteThePair';
import {MoreFromShelf} from '~/components/product/MoreFromShelf';
import {ReviewsSection} from '~/components/product/ReviewsSection';
import {ReviewStars} from '~/components/ReviewStars';
import {
  RecentlyViewed,
  useRecordRecentlyViewed,
} from '~/components/RecentlyViewed';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {buildProductCopy} from '~/lib/productCopy';
import {SHELVES, COUNTER} from '~/data/shelves';
import {RETURNS_DAYS, SIZE_RUN} from '~/data/commerce';
import {track} from '~/lib/analytics';
import {pageMeta} from '~/lib/seo';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = (args) => {
  const product = args.data?.product;
  const copy = args.data?.copy;
  return pageMeta(args, {
    // The joke is the title; the catalogue suffix is noise in a browser tab.
    title: copy?.displayTitle || product?.title || 'Shirt',
    description: copy
      ? `${copy.sell} ${copy.meta}`
      : product?.seo?.description || undefined,
    // OG image is the product mockup, not the generic site card.
    image: product?.featuredImage?.url,
    type: 'product',
    path: product?.handle ? `/products/${product.handle}` : undefined,
  });
};

/**
 * LCP: the gallery's first slide carries fetchpriority="high" + eager, which is
 * the modern hint. A <link rel="preload"> is deliberately NOT emitted — <Image>
 * serves a srcset, and a preload that doesn't match the chosen candidate makes
 * mobile download the mockup twice.
 */

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/** Catalogue number from a title like "SANWICH — Schmucks · N°. 012". */
function catalogueNumber(title: string) {
  const match = title.match(/N°\.\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

/** Word overlap, used to decide which neighbour is the real other half. */
function titleAffinity(a: string, b: string) {
  const words = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2),
    );
  const left = words(a);
  const right = words(b);
  let shared = 0;
  left.forEach((word) => {
    if (right.has(word)) shared += 1;
  });
  return shared;
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const url = new URL(request.url);
  const selectedOptions = getSelectedProductOptions(request).filter(
    // `variant` is our own shareable param, not a product option.
    (option) => option.name.toLowerCase() !== 'variant',
  );

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  // ?variant=<id> wins over option params so a shared link lands exactly.
  const requestedVariant = url.searchParams.get('variant');
  const variantFromUrl = requestedVariant
    ? (product.variants?.nodes.find(
        (node) =>
          node.id === requestedVariant ||
          node.id.split('/').pop() === requestedVariant,
      ) ?? null)
    : null;

  // The product's own shelf drives the breadcrumb and "More From This Shelf".
  const tags = product.tags ?? [];
  // Thematic shelves win; The Pair Programme is the fallback home for a shirt
  // that only carries the pair tag, so it still gets a breadcrumb and a rail.
  const shelfPool = [
    ...SHELVES,
    ...COUNTER.filter((item) => item.handle === 'the-pair-programme'),
  ];
  const shelf =
    shelfPool.find(
      (item) =>
        tags.includes(item.handle) ||
        (item.handleAliases ?? []).some((alias) => tags.includes(alias)),
    ) ?? null;

  const isPairMember = tags.includes('the-pair-programme');
  const number = catalogueNumber(product.title);

  const [shelfProducts, pairCandidates] = await Promise.all([
    shelf
      ? storefront
          .query(SHELF_PEERS_QUERY, {
            variables: {query: `tag:'${shelf.handle}'`},
            cache: storefront.CacheShort(),
          })
          .then((data) => data?.products?.nodes ?? [])
          .catch(() => [])
      : Promise.resolve([]),
    isPairMember
      ? storefront
          .query(PAIR_CANDIDATES_QUERY, {
            variables: {query: "tag:'the-pair-programme'"},
            cache: storefront.CacheLong(),
          })
          .then((data) => data?.products?.nodes ?? [])
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  // Pairs are consecutive catalogue numbers. Where both neighbours exist, the
  // one sharing more words with this title is the real other half.
  let partner: PairPartner | null = null;
  if (isPairMember && number != null) {
    const neighbours = pairCandidates.filter((candidate) => {
      const candidateNumber = catalogueNumber(candidate.title);
      return candidateNumber != null && Math.abs(candidateNumber - number) === 1;
    });
    partner =
      (neighbours
        .slice()
        .sort(
          (a, b) =>
            titleAffinity(product.title, b.title) -
            titleAffinity(product.title, a.title),
        )[0] as PairPartner | undefined) ?? null;
  }

  const pairFallback = isPairMember
    ? pairCandidates
        .filter((candidate) => candidate.handle !== handle)
        .filter((candidate) => candidate.handle !== partner?.handle)
        .slice(0, 4)
    : [];

  const copy = buildProductCopy({
    title: product.title,
    descriptionHtml: product.descriptionHtml,
    isPairMember,
  });

  return {
    product,
    variantFromUrl,
    copy,
    shelf: shelf ? {handle: shelf.handle, title: shelf.title} : null,
    shelfProducts: shelfProducts.filter(
      (item: {handle: string}) => item.handle !== handle,
    ),
    partner,
    pairFallback,
    storeDomain: context.env.PUBLIC_STORE_DOMAIN,
  };
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {
    product,
    variantFromUrl,
    copy,
    shelf,
    shelfProducts,
    partner,
    pairFallback,
    storeDomain,
  } = useLoaderData<typeof loader>();

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeChosen, setSizeChosen] = useState(false);
  const buyRef = useRef<HTMLDivElement | null>(null);
  const root = useRouteLoaderData<{origin?: string}>('root');

  const selectedVariant = useOptimisticVariant(
    variantFromUrl ?? product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const selectedColor = selectedVariant?.selectedOptions?.find(
    (option) => option.name.toLowerCase() === 'color',
  )?.value;
  const selectedSize = selectedVariant?.selectedOptions?.find(
    (option) => option.name.toLowerCase() === 'size',
  )?.value;

  // Keep ?variant= in the URL so any state of this page is shareable.
  useEffect(() => {
    if (!selectedVariant?.id || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const numeric = selectedVariant.id.split('/').pop() ?? '';
    if (url.searchParams.get('variant') === numeric) return;
    url.searchParams.set('variant', numeric);
    window.history.replaceState({}, '', url.toString());
  }, [selectedVariant?.id]);

  useEffect(() => {
    track('view_item', {item_id: product.id, item_name: product.title});
  }, [product.id, product.title]);

  useRecordRecentlyViewed({
    handle: product.handle,
    title: copy.displayTitle,
    image: product.featuredImage
      ? {url: product.featuredImage.url, altText: product.featuredImage.altText}
      : null,
    price: selectedVariant?.price ?? null,
  });

  const productUrl = root?.origin
    ? `${root.origin}/products/${product.handle}`
    : undefined;

  // One Offer per variant, so rich results can show the real range and stock.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: copy.displayTitle,
    description: `${copy.sell} ${copy.meta}`,
    image: (product.images?.nodes ?? []).slice(0, 6).map((image) => image.url),
    brand: {'@type': 'Brand', name: 'SCHMUCKS'},
    ...(product.vendor ? {manufacturer: product.vendor} : {}),
    ...(productUrl ? {url: productUrl} : {}),
    offers: (product.variants?.nodes ?? []).map((variant) => ({
      '@type': 'Offer',
      name: variant.title,
      ...(variant.sku ? {sku: variant.sku} : {}),
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      ...(productUrl
        ? {url: `${productUrl}?variant=${variant.id.split('/').pop()}`}
        : {}),
    })),
  };

  function nudgeToSize() {
    const sizes = document.querySelector('.sx-sizes');
    sizes?.scrollIntoView({block: 'center', behavior: 'smooth'});
    (sizes?.querySelector('button') as HTMLButtonElement | null)?.focus();
  }

  return (
    <div className="sx-product-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />

      <div className="sx-wrap sx-crumbs-bar">
        <Breadcrumbs
          crumbs={[
            shelf
              ? {label: shelf.title, to: `/collections/${shelf.handle}`}
              : {label: 'Tees', to: '/tees'},
            {label: copy.displayTitle},
          ]}
        />
      </div>

      <div className="sx-product sx-wrap">
        <div className="sx-product__gallery">
          <ProductGallery
            images={product.images?.nodes ?? []}
            title={copy.displayTitle}
            colorName={selectedColor}
            colorImageUrl={selectedVariant?.image?.url}
          />
        </div>

        <div className="sx-product__main">
          <p className="sx-product__eyebrow">
            {shelf ? shelf.title : 'Fine Apparel for Idiots'}
            {copy.catalogueNumber ? ` · N°. ${copy.catalogueNumber}` : ''}
          </p>

          {/* The title IS the joke, so it's the hero. The modifiers step the
              scale down for the long confessions without changing the face. */}
          <h1
            className={`sx-product__title ${
              copy.displayTitle.length > 55 ? 'sx-product__title--long' : ''
            } ${copy.displayTitle.length > 105 ? 'sx-product__title--epic' : ''}`}
          >
            {copy.displayTitle}
          </h1>

          <ReviewStars
            productId={product.id}
            productTitle={copy.displayTitle}
            className="sx-product__reviews"
          />

          <p className="sx-product__sell">{copy.sell}</p>

          <div ref={buyRef}>
            <BuyBox
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              productTitle={copy.displayTitle}
              productId={product.id}
              storeDomain={storeDomain}
              // The shop reports no digital wallets on this plan, so express
              // checkout stays hidden rather than rendering a dead button.
              walletsEnabled={false}
              onOpenSizeGuide={() => setSizeGuideOpen(true)}
              onSizeChosen={() => setSizeChosen(true)}
            />
          </div>

          <TrustRow />

          <ProductDetails copy={copy} />
        </div>
      </div>

      {partner ? (
        <CompleteThePair
          thisProduct={{
            id: product.id,
            handle: product.handle,
            title: product.title,
            featuredImage: product.featuredImage,
            selectedOrFirstAvailableVariant: selectedVariant
              ? {
                  id: selectedVariant.id,
                  availableForSale: selectedVariant.availableForSale,
                  price: selectedVariant.price,
                }
              : null,
          }}
          partner={partner}
        />
      ) : (
        <PairSuggestions products={pairFallback as CollectionItemFragment[]} />
      )}

      {shelf ? (
        <MoreFromShelf
          products={shelfProducts as CollectionItemFragment[]}
          shelfTitle={shelf.title}
          shelfHandle={shelf.handle}
        />
      ) : null}

      <RecentlyViewed exclude={product.handle} />

      <ReviewsSection productId={product.id} productTitle={copy.displayTitle} />

      <FinalCta
        title={copy.displayTitle}
        onBuy={() => {
          buyRef.current?.scrollIntoView({block: 'center', behavior: 'smooth'});
          nudgeToSize();
        }}
      />

      {sizeGuideOpen ? (
        <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />
      ) : null}

      <StickyBuyBar
        selectedVariant={selectedVariant}
        sizeLabel={selectedSize}
        sizeChosen={sizeChosen}
        watchRef={buyRef}
        onNeedSize={nudgeToSize}
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

/** Details / Size & fit / Shipping, as native accordions. */
function ProductDetails({copy}: {copy: ReturnType<typeof buildProductCopy>}) {
  return (
    <div className="sx-acc">
      <details className="sx-acc__item" open>
        <summary className="sx-acc__q">
          <span>Details</span>
          <span className="sx-faq__mark" aria-hidden="true" />
        </summary>
        <div className="sx-acc__a">
          <dl className="sx-specs">
            {copy.specs.map((spec) => (
              <div key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
          <p className="sx-specs__care">{copy.care}</p>
        </div>
      </details>

      <details className="sx-acc__item">
        <summary className="sx-acc__q">
          <span>Size &amp; fit</span>
          <span className="sx-faq__mark" aria-hidden="true" />
        </summary>
        <div className="sx-acc__a">
          <p>
            Unisex {SIZE_RUN}, cut boxy and true to size. Between sizes, or
            after a roomier drape? Size up — the length comes with it.
          </p>
          <p>
            Measure a shirt you already like flat across the chest, double it,
            and match that number on the{' '}
            <Link className="sx-inline-link" to="/pages/size-guide">
              full size guide
            </Link>
            .
          </p>
        </div>
      </details>

      <details className="sx-acc__item">
        <summary className="sx-acc__q">
          <span>Shipping &amp; returns</span>
          <span className="sx-faq__mark" aria-hidden="true" />
        </summary>
        <div className="sx-acc__a">
          <p>
            Printed after you order it, then shipped with tracking. That
            production step is the trade for never warehousing shirts nobody
            wanted.
          </p>
          <p>
            {RETURNS_DAYS}-day returns on unworn shirts.{' '}
            <Link className="sx-inline-link" to="/pages/shipping-returns">
              How returns work
            </Link>
            .
          </p>
        </div>
      </details>
    </div>
  );
}

/** Centered closing band for anyone who read the whole page. */
function FinalCta({title, onBuy}: {title: string; onBuy: () => void}) {
  return (
    <section className="sx-finalcta" aria-label="Buy this shirt">
      <div className="sx-wrap">
        <p className="sx-finalcta__kicker">Still here?</p>
        <p className="sx-finalcta__title sx-display">{title}</p>
        <p className="sx-finalcta__body">
          You&rsquo;ve read the whole page. At this point buying it is the
          efficient outcome.
        </p>
        <button type="button" className="sx-btn sx-btn--ketchup" onClick={onBuy}>
          Take me back to the buttons
        </button>
      </div>
    </section>
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
    tags
    descriptionHtml
    description
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 60) {
      nodes {
        ...ProductVariant
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

const PEER_ITEM_FRAGMENT = `#graphql
  fragment PeerItem on Product {
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
` as const;

const SHELF_PEERS_QUERY = `#graphql
  query ShelfPeers($country: CountryCode, $language: LanguageCode, $query: String!)
    @inContext(country: $country, language: $language) {
    products(first: 5, query: $query, sortKey: BEST_SELLING) {
      nodes {
        ...PeerItem
      }
    }
  }
  ${PEER_ITEM_FRAGMENT}
` as const;

/**
 * All Pair Programme members. Small enough to fetch whole (54 today) and cached
 * hard, which lets the loader match the exact other half by catalogue number
 * without a second round trip.
 */
const PAIR_CANDIDATES_QUERY = `#graphql
  query PairCandidates($country: CountryCode, $language: LanguageCode, $query: String!)
    @inContext(country: $country, language: $language) {
    products(first: 100, query: $query) {
      nodes {
        ...PeerItem
        selectedOrFirstAvailableVariant {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
  ${PEER_ITEM_FRAGMENT}
` as const;
