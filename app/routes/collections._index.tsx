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

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
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
  const {collections} = useLoaderData<typeof loader>();

  // The shelves are the storefront's own taxonomy, so they're always listed —
  // in their own order, with the store's copy when it exists and ours when it
  // doesn't. Anything else the store publishes is appended after them.
  const published = new Map(
    collections.nodes.map((node) => [node.handle, node]),
  );
  const shelfTiles = ALL_SHELVES.filter((shelf) => shelf.handle !== 'tees').map(
    (shelf) => {
      const node = published.get(shelf.handle);
      return {
        key: shelf.handle,
        handle: shelf.handle,
        title: node?.title ?? shelf.title,
        description: node?.description || shelf.descriptor,
        image: node?.image ?? null,
        live: Boolean(node),
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
