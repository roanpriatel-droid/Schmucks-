import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {
  CollectionControls,
  catalogSortArgs,
} from '~/components/CollectionControls';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [{title: `Shop All — SCHMUCKS`}];
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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });
  const sort = new URL(request.url).searchParams.get('sort') || 'featured';
  const {sortKey, reverse} = catalogSortArgs(sort);

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables, sortKey, reverse},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products, sort};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products, sort} = useLoaderData<typeof loader>();

  return (
    <div className="sx-collection">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Everything We Make</p>
          <h1 className="sx-pagehead__title">Shop All</h1>
          <p className="sx-pagehead__desc">
            The whole menu. Every terrible idea we&rsquo;ve committed to cotton.
            $25 flat, sizes S–3XL.
          </p>
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          <CollectionControls count={products.nodes.length} sort={sort} />
          <PaginatedResourceSection<CollectionItemFragment>
            connection={products}
            resourcesClassName="sx-grid"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </section>
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
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
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys = BEST_SELLING
    $reverse: Boolean = false
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
