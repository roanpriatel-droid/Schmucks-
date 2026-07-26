import {
  redirect,
  useLoaderData,
  useLocation,
  useNavigation,
} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {
  CollectionControls,
  collectionSortArgs,
} from '~/components/CollectionControls';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Restocking} from '~/components/Restocking';
import {ShelfFilters, type Facet} from '~/components/ShelfFilters';
import {SkeletonGrid} from '~/components/Skeleton';
import {canonicalShelfHandle, getShelf} from '~/data/shelves';
import {facetKindFor, shelfDescription, toProductFilters} from '~/lib/shelves';
import {pageMeta, toDescription} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => {
  const collection = args.data?.collection;
  const shelf = args.data?.shelf;
  return pageMeta(args, {
    title:
      collection?.seo?.title || collection?.title || shelf?.title || 'Shop',
    // Nothing to index on a shelf with no products yet.
    noindex: !collection?.products?.nodes?.length,
    description:
      toDescription(collection?.seo?.description) ??
      toDescription(collection?.description) ??
      toDescription(args.data?.description) ??
      (collection?.title
        ? `${collection.title} from SCHMUCKS — $25 flat, unisex S–3XL, printed to order.`
        : undefined),
    image: collection?.image?.url,
    // Sorted and filtered views are the same products in a different order.
    path: collection?.handle
      ? `/collections/${collection.handle}`
      : shelf?.handle
        ? `/collections/${shelf.handle}`
        : undefined,
  });
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const sort = searchParams.get('sort') || 'featured';
  const {sortKey, reverse} = collectionSortArgs(sort);

  if (!handle) {
    throw redirect('/collections');
  }

  // Shopify's auto-generated handles drop "&" (Terms & Conditions →
  // terms-conditions). Send known aliases to the canonical URL so a nav link
  // can never dead-end on a guessed handle.
  const canonical = canonicalShelfHandle(handle);
  if (canonical) {
    throw redirect(`/collections/${canonical}${url.search}`, {status: 301});
  }

  // Option names differ per store (Color vs Colour); pass both through and let
  // the API match. Filters are AND'd across facets, OR'd within one.
  const filters = toProductFilters(searchParams, {
    size: 'Size',
    color: 'Color',
  });

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        sortKey,
        reverse,
        filters,
        ...paginationVariables,
      },
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  const shelf = getShelf(handle);

  if (!collection) {
    // A known shelf that the store hasn't published (or tagged) yet is not an
    // error — it's linked from the nav and will fill on the next tagging run.
    // Render the real shelf page in its restocking state, but keep it out of
    // the index until it has something on it.
    if (shelf) {
      return {
        collection: null,
        shelf,
        sort,
        description: shelf.board ?? shelf.descriptor,
        facets: [] as Facet[],
        total: null,
      };
    }
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    shelf: shelf ?? null,
    sort,
    description: shelfDescription(handle, collection.description),
    facets: buildFacets(collection.products.filters),
    total: totalFromFilters(collection.products.filters),
  };
}

/**
 * Turn the API's filter list into just the two facets we surface. Anything
 * else the store reports (price, vendor, product type) is ignored on purpose —
 * one price, one vendor, one product type.
 */
function buildFacets(
  apiFilters: Array<{
    id: string;
    label: string;
    values: Array<{label: string; count: number}>;
  }>,
): Facet[] {
  const facets: Facet[] = [];
  for (const filter of apiFilters ?? []) {
    const kind = facetKindFor(filter.label);
    if (!kind) continue;
    const values = (filter.values ?? []).filter((value) => value.count > 0);
    if (!values.length) continue;
    facets.push({
      kind,
      label: kind === 'size' ? 'Size' : 'Colorway',
      values: values.map((value) => ({
        label: value.label,
        count: value.count,
      })),
    });
  }
  return facets;
}

/**
 * Storefront has no product-count field on Collection, but the availability
 * facet counts products (in stock + out of stock) for the current filter set.
 * Returns null when the store reports no availability facet.
 */
function totalFromFilters(
  apiFilters: Array<{
    id: string;
    label: string;
    values: Array<{label: string; count: number}>;
  }>,
): number | null {
  const availability = (apiFilters ?? []).find(
    (filter) =>
      filter.id === 'filter.v.availability' ||
      filter.label.toLowerCase() === 'availability',
  );
  if (!availability?.values?.length) return null;
  return availability.values.reduce(
    (sum, value) => sum + (value.count ?? 0),
    0,
  );
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
  const {collection, shelf, sort, description, facets, total} =
    useLoaderData<typeof loader>();
  const loaded = collection?.products.nodes.length ?? 0;
  const hasProducts = loaded > 0;
  // Filter and sort links are real navigations; swap the grid for placeholders
  // while the next page of results is in flight instead of freezing the old one.
  const navigation = useNavigation();
  const {pathname} = useLocation();
  const busy =
    navigation.state === 'loading' &&
    navigation.location?.pathname === pathname;
  const title = collection?.title ?? shelf?.title ?? 'Shop';
  const count = total ?? loaded;

  return (
    <div className="sx-collection">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs
            crumbs={[
              {label: 'Collections', to: '/collections'},
              {label: title},
            ]}
          />
          <p className="sx-pagehead__eyebrow">
            {shelf ? 'The Shelves' : 'The Menu Board'}
          </p>
          <h1 className="sx-pagehead__title">{title}</h1>
          {description ? (
            <p className="sx-pagehead__desc">{description}</p>
          ) : null}
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          {hasProducts && collection ? (
            <>
              <ShelfFilters facets={facets} count={loaded} />
              <CollectionControls count={count} sort={sort} />
              {busy ? (
                <SkeletonGrid count={Math.min(loaded, 8)} />
              ) : (
                <PaginatedResourceSection<ProductItemFragment>
                  connection={collection.products}
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
              )}
            </>
          ) : (
            <>
              <ShelfFilters facets={facets} count={0} />
              <Restocking title={title} />
            </>
          )}
        </div>
      </section>
      {collection ? (
        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      ) : null}
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys = COLLECTION_DEFAULT
    $reverse: Boolean = false
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      image {
        id
        url
        altText
        width
        height
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        nodes {
          ...ProductItem
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
