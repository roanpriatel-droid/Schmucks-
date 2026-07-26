import type {Route} from './+types/tees';
import {Link, useLoaderData, useLocation, useNavigation} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Restocking} from '~/components/Restocking';
import {ShelfFilters, type Facet} from '~/components/ShelfFilters';
import {SkeletonGrid} from '~/components/Skeleton';
import {
  CollectionControls,
  catalogSortArgs,
  collectionSortArgs,
} from '~/components/CollectionControls';
import {SHELVES} from '~/data/shelves';
import {facetKindFor, toProductFilters} from '~/lib/shelves';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Tees',
    description:
      'Every Schmucks graphic tee. Unisex S–3XL, printed on cotton that can take a joke.',
    path: '/tees',
  });

type ApiFilters = Array<{
  id: string;
  label: string;
  values: Array<{label: string; count: number}>;
}>;

function buildFacets(apiFilters: ApiFilters): Facet[] {
  const facets: Facet[] = [];
  for (const filter of apiFilters ?? []) {
    const kind = facetKindFor(filter.label);
    if (!kind) continue;
    const values = (filter.values ?? []).filter((value) => value.count > 0);
    if (!values.length) continue;
    facets.push({
      kind,
      label: kind === 'size' ? 'Size' : 'Colorway',
      values: values.map((value) => ({label: value.label, count: value.count})),
    });
  }
  return facets;
}

function totalFromFilters(apiFilters: ApiFilters): number | null {
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

export async function loader({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const searchParams = new URL(request.url).searchParams;
  const sort = searchParams.get('sort') || 'featured';
  const filters = toProductFilters(searchParams, {
    size: 'Size',
    color: 'Color',
  });

  // /tees is the "Tees" shelf when the store publishes one, and the raw
  // catalogue otherwise — so this page works before any tagging has run.
  const collectionSort = collectionSortArgs(sort);
  const {collection} = await context.storefront.query(TEES_COLLECTION_QUERY, {
    variables: {
      handle: 'tees',
      filters,
      sortKey: collectionSort.sortKey,
      reverse: collectionSort.reverse,
      ...paginationVariables,
    },
  });

  if (collection?.products?.nodes?.length) {
    return {
      products: collection.products,
      source: 'collection' as const,
      description: collection.description,
      facets: buildFacets(collection.products.filters),
      total: totalFromFilters(collection.products.filters),
      sort,
    };
  }

  const catalogSort = catalogSortArgs(sort);
  const {products} = await context.storefront.query(TEES_CATALOG_QUERY, {
    variables: {
      sortKey: catalogSort.sortKey,
      reverse: catalogSort.reverse,
      ...paginationVariables,
    },
  });

  return {
    products,
    source: 'catalog' as const,
    description: collection?.description ?? null,
    facets: [] as Facet[],
    total: null,
    sort,
  };
}

export default function Tees() {
  const {products, description, facets, total, sort} =
    useLoaderData<typeof loader>();
  const loaded = products?.nodes?.length ?? 0;
  const count = total ?? loaded;
  const navigation = useNavigation();
  const {pathname} = useLocation();
  const busy =
    navigation.state === 'loading' &&
    navigation.location?.pathname === pathname;

  return (
    <div className="sx-collection">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Tees'}]} />
          <p className="sx-pagehead__eyebrow">The Whole Menu</p>
          <h1 className="sx-pagehead__title">Tees</h1>
          <p className="sx-pagehead__desc">
            {description?.trim() ||
              'Every shirt we make. Unisex S–3XL, three colorways, printed to order. Stack 2 or more and the discount applies itself at checkout.'}
          </p>
        </div>
      </section>

      <section className="sx-shelfdir" aria-label="Browse by shelf">
        <div className="sx-wrap">
          <p className="sx-eyebrow">Or pick a shelf</p>
          <div className="sx-shelfdir__row">
            {SHELVES.map((shelf) => (
              <Link
                key={shelf.handle}
                className="sx-shelfdir__item"
                to={`/collections/${shelf.handle}`}
                prefetch="intent"
              >
                <span className="sx-shelfdir__title">{shelf.title}</span>
                <span className="sx-shelfdir__desc">{shelf.descriptor}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-shop">
        <div className="sx-wrap">
          {loaded ? (
            <>
              <ShelfFilters facets={facets} count={loaded} />
              <CollectionControls count={count} sort={sort} />
              {busy ? (
                <SkeletonGrid count={Math.min(loaded, 8)} />
              ) : (
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
              )}
            </>
          ) : (
            <Restocking title="The whole menu" />
          )}
        </div>
      </section>
    </div>
  );
}

const TEES_ITEM_FRAGMENT = `#graphql
  fragment MoneyTeesItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment TeesItem on Product {
    id
    handle
    title
    variants(first: 20) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
      }
    }
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
        ...MoneyTeesItem
      }
      maxVariantPrice {
        ...MoneyTeesItem
      }
    }
  }
` as const;

const TEES_COLLECTION_QUERY = `#graphql
  query TeesShelf(
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
          ...TeesItem
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
          startCursor
          endCursor
        }
      }
    }
  }
  ${TEES_ITEM_FRAGMENT}
` as const;

const TEES_CATALOG_QUERY = `#graphql
  query TeesCatalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys = BEST_SELLING
    $reverse: Boolean = false
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...TeesItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${TEES_ITEM_FRAGMENT}
` as const;
