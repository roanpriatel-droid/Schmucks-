import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {ALL_SHELVES} from '~/data/shelves';
import {pageMeta, toDescription} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Collections',
    description:
      'Every SCHMUCKS collection — tees, matching sets and whatever else made it past the group chat.',
  });

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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const [{collections}, shelfPreviews] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // A shelf tile must reflect the shelf, not whether a Shopify collection
    // happens to be published to this sales channel. These are the same tag
    // and sort sources the shelf pages themselves use.
    context.storefront
      .query(SHELF_PREVIEWS_QUERY, {
        variables: {
          confessional: "tag:'the-confessional'",
          terms: "tag:'terms-and-conditions'",
          courtship: "tag:'courtship'",
          vices: "tag:'vices'",
          errata: "tag:'errata'",
          pettyCrimes: "tag:'petty-crimes'",
          pair: "tag:'the-pair-programme'",
        },
        cache: context.storefront.CacheShort(),
      })
      .catch(() => null),
  ]);

  // handle -> first product image, so a tile can show what's actually on it.
  const previews: Record<string, {url: string; altText?: string | null} | null> =
    {};
  const map: Array<[string, {nodes?: Array<{featuredImage?: any}>} | null | undefined]> = [
    ['the-confessional', shelfPreviews?.confessional],
    ['terms-conditions', shelfPreviews?.terms],
    ['courtship', shelfPreviews?.courtship],
    ['vices', shelfPreviews?.vices],
    ['errata', shelfPreviews?.errata],
    ['petty-crimes', shelfPreviews?.pettyCrimes],
    ['the-pair-programme', shelfPreviews?.pair],
    ['best-sellers', shelfPreviews?.bestSellers],
    ['new-arrivals', shelfPreviews?.newArrivals],
  ];
  for (const [handle, node] of map) {
    const image = node?.nodes?.[0]?.featuredImage ?? null;
    previews[handle] = image ? {url: image.url, altText: image.altText} : null;
  }

  return {collections, previews};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections, previews} = useLoaderData<typeof loader>();

  // The shelves are the storefront's own taxonomy, so they're always listed —
  // in their own order, with the store's copy when it exists and ours when it
  // doesn't. Anything else the store publishes is appended after them.
  const published = new Map(
    collections.nodes.map((node) => [node.handle, node]),
  );
  const shelfTiles = ALL_SHELVES.filter((shelf) => shelf.handle !== 'tees').map(
    (shelf) => {
      const node = published.get(shelf.handle);
      const preview = previews[shelf.handle];
      return {
        key: shelf.handle,
        handle: shelf.handle,
        title: node?.title ?? shelf.title,
        description: node?.description || shelf.descriptor,
        // Prefer the merchandiser's collection image; otherwise show a real
        // product off the shelf rather than an empty box.
        image: node?.image ?? (preview ? (preview as never) : null),
        // "Restocking" means no products — not "no published collection".
        live: Boolean(node) || Boolean(preview),
      };
    },
  );
  const extraTiles = collections.nodes
    .filter(
      (node) =>
        node.handle !== 'frontpage' &&
        !ALL_SHELVES.some((shelf) => shelf.handle === node.handle),
    )
    .map((node) => ({
      key: node.id,
      handle: node.handle,
      title: node.title,
      description: node.description ?? '',
      image: node.image ?? null,
      live: true,
    }));
  const tiles = [...shelfTiles, ...extraTiles];

  return (
    <div className="sx-collection">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Collections'}]} />
          <p className="sx-pagehead__eyebrow">Browse the Categories</p>
          <h1 className="sx-pagehead__title">New Drops &amp; Collections</h1>
          <p className="sx-pagehead__desc">
            Pick a lane. They all lead somewhere embarrassing. Want the whole
            menu instead?{' '}
            <Link className="sx-inline-link" to="/tees">
              Every tee lives here
            </Link>
            .
          </p>
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          <div className="sx-collections-grid">
            {tiles.map((tile, index) => (
              <CollectionItem key={tile.key} collection={tile} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

type Tile = {
  handle: string;
  title: string;
  description: string;
  image: CollectionFragment['image'] | null;
  live: boolean;
};

function CollectionItem({
  collection,
  index,
}: {
  collection: Tile;
  index: number;
}) {
  const dek = toDescription(collection.description, 90);

  return (
    <Link
      className="sx-collection-tile"
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <div className="sx-collection-tile__media">
        {collection.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="4/3"
            data={collection.image}
            loading={index < 3 ? 'eager' : 'lazy'}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : (
          <span className="sx-collection-tile__blank" aria-hidden="true" />
        )}
        {collection.live ? null : (
          <span className="sx-collection-tile__flag">Restocking</span>
        )}
      </div>
      <h2 className="sx-collection-tile__title">{collection.title}</h2>
      {dek ? <p className="sx-collection-tile__dek">{dek}</p> : null}
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;

/**
 * One product per shelf, purely for the tile artwork. Best Sellers and New
 * Arrivals are catalogue-order shelves, so they use sort keys like their pages.
 */
const SHELF_PREVIEWS_QUERY = `#graphql
  fragment ShelfPreview on Product {
    id
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query ShelfPreviews(
    $country: CountryCode
    $language: LanguageCode
    $confessional: String!
    $terms: String!
    $courtship: String!
    $vices: String!
    $errata: String!
    $pettyCrimes: String!
    $pair: String!
  ) @inContext(country: $country, language: $language) {
    confessional: products(first: 1, query: $confessional) { nodes { ...ShelfPreview } }
    terms: products(first: 1, query: $terms) { nodes { ...ShelfPreview } }
    courtship: products(first: 1, query: $courtship) { nodes { ...ShelfPreview } }
    vices: products(first: 1, query: $vices) { nodes { ...ShelfPreview } }
    errata: products(first: 1, query: $errata) { nodes { ...ShelfPreview } }
    pettyCrimes: products(first: 1, query: $pettyCrimes) { nodes { ...ShelfPreview } }
    pair: products(first: 1, query: $pair) { nodes { ...ShelfPreview } }
    bestSellers: products(first: 1, sortKey: BEST_SELLING) { nodes { ...ShelfPreview } }
    newArrivals: products(first: 1, sortKey: CREATED_AT, reverse: true) { nodes { ...ShelfPreview } }
  }
` as const;
