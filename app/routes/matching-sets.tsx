import type {Route} from './+types/matching-sets';
import {useLoaderData, Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {Marquee} from '~/components/home/Marquee';
import {Mel} from '~/components/brand/Brand';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {pageMeta} from '~/lib/seo';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'The Pair Programme',
    description:
      'Two shirts, one bad idea. Pick any two Schmucks tees for you and whoever agreed to this.',
    path: '/matching-sets',
  });

/** Catalogue number from "… — Schmucks · N°. 018". */
function catalogueNumber(title: string) {
  const match = title.match(/N°\.\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

export async function loader({context}: Route.LoaderArgs) {
  // The Pair Programme shelf, by tag. The published collection is preferred
  // when it exists, but this page must never fall back to "the first products
  // in the catalogue" — that showed shirts with no pair at all.
  const [{collection}, tagged] = await Promise.all([
    context.storefront.query(PAIR_COLLECTION_QUERY),
    context.storefront
      .query(PAIR_TAGGED_QUERY, {
        variables: {query: "tag:'the-pair-programme'"},
        cache: context.storefront.CacheShort(),
      })
      .catch(() => null),
  ]);

  const shelfProducts = collection?.products?.nodes ?? [];
  const pool = shelfProducts.length
    ? shelfProducts
    : (tagged?.products?.nodes ?? []);

  // Pairs are consecutive catalogue numbers inside the shelf, so the page can
  // show actual two-shirt sets rather than a grid of unrelated halves.
  const byNumber = new Map<number, (typeof pool)[number]>();
  for (const product of pool) {
    const number = catalogueNumber(product.title);
    if (number != null) byNumber.set(number, product);
  }
  const pairs: Array<[(typeof pool)[number], (typeof pool)[number]]> = [];
  const used = new Set<number>();
  for (const number of [...byNumber.keys()].sort((a, b) => a - b)) {
    if (used.has(number)) continue;
    const partner = byNumber.get(number + 1);
    if (partner && !used.has(number + 1)) {
      pairs.push([byNumber.get(number)!, partner]);
      used.add(number);
      used.add(number + 1);
    }
  }

  return {
    products: pool,
    pairs: pairs.slice(0, 4),
    description: collection?.description ?? null,
    fromShelf: true,
  };
}

const STEPS = [
  {
    n: '1',
    title: 'Pick Two Tees',
    body: 'Any two designs, any sizes. Match on purpose or match by accident.',
  },
  {
    n: '2',
    title: 'Add Both to Cart',
    body: 'Two shirts clears the free-shipping threshold. It also commits you both to the bit in public.',
  },
  {
    n: '3',
    title: 'Wear Them Together',
    body: 'Coordinate with your person, your dog, or your other personality.',
  },
];

export default function MatchingSets() {
  const {products, pairs, description, fromShelf} = useLoaderData<typeof loader>();
  const grid = (products as CollectionItemFragment[]).slice(0, 8);

  return (
    <div className="sx-matching">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'The Pair Programme'}]} />
          <p className="sx-pagehead__eyebrow">Two Idiots, One Look</p>
          <h1 className="sx-pagehead__title">The Pair Programme</h1>
          <p className="sx-pagehead__desc">
            {description?.trim() ||
              'Build your own pair: any two tees, for you and whoever agreed to this. There’s no separate “set” to buy and nothing to configure — pick two designs that argue with each other and wear them at the same time.'}
          </p>
          <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <Link className="sx-btn sx-btn--ketchup" to="/tees">
              Start with the Tees
            </Link>
            <Link className="sx-btn sx-btn--ghost" to="/collections/all">
              Shop Everything
            </Link>
          </div>
        </div>
      </section>

      <Marquee
        variant="ink"
        items={[
          'MIX & MATCH ANY DESIGNS',
          'TWO SHIRTS, ONE BAD IDEA',
          'PRINTED TO ORDER',
        ]}
      />

      <section className="sx-page">
        <div className="sx-wrap">
          <h2 className="sx-section-title sx-steps__head">How the Programme works</h2>
          <div className="sx-steps">
            {STEPS.map((s) => (
              <div className="sx-step" key={s.n}>
                <div className="sx-step__n sx-display">{s.n}</div>
                <h3 className="sx-step__title">{s.title}</h3>
                <p className="sx-step__body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-shop" style={{paddingTop: 0}}>
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">Build Your Match</p>
              <h2 className="sx-section-title">Pick Your Two</h2>
            </div>
            <p className="sx-section-note">
              {fromShelf
                ? 'Straight from the Pair Programme shelf. Grab any two that argue with each other.'
                : 'Grab any two below. They don’t have to match — they have to disagree well.'}
            </p>
          </div>
          {pairs.length ? (
            <div className="sx-madepairs">
              {(pairs as Array<[CollectionItemFragment, CollectionItemFragment]>).map(
                ([left, right]) => (
                  <div className="sx-madepair" key={left.id}>
                    <span className="sx-madepair__tag">Made for each other</span>
                    <div className="sx-madepair__two">
                      <ProductItem product={left} loading="lazy" />
                      <span className="sx-madepair__amp sx-display" aria-hidden="true">
                        &amp;
                      </span>
                      <ProductItem product={right} loading="lazy" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : null}

          {grid.length ? (
            <div className="sx-grid">
              {grid.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 4 ? 'eager' : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="sx-empty-note">
              <Mel className="sx-empty-note__mel" />
              <p>
                New shirts are being printed as we speak. Check back in a minute,
                or{' '}
                <Link to="/collections/all">browse everything</Link>.
              </p>
            </div>
          )}
          <div className="sx-specials__cta">
            <Link className="sx-btn" to="/tees">
              See All the Tees
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const MATCH_ITEM_FRAGMENT = `#graphql
  fragment MoneyMatchItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment MatchItem on Product {
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
        ...MoneyMatchItem
      }
      maxVariantPrice {
        ...MoneyMatchItem
      }
    }
  }
` as const;

const MATCH_PRODUCTS_QUERY = `#graphql
  query MatchProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...MatchItem
      }
    }
  }
  ${MATCH_ITEM_FRAGMENT}
` as const;

const PAIR_COLLECTION_QUERY = `#graphql
  query PairProgrammeShelf($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collection(handle: "the-pair-programme") {
      id
      handle
      title
      description
      products(first: 8) {
        nodes {
          ...MatchItem
        }
      }
    }
  }
  ${MATCH_ITEM_FRAGMENT}
` as const;


const PAIR_TAGGED_QUERY = `#graphql
  query PairTagged($country: CountryCode, $language: LanguageCode, $query: String!)
    @inContext(country: $country, language: $language) {
    products(first: 60, query: $query) {
      nodes {
        ...MatchItem
      }
    }
  }
  ${MATCH_ITEM_FRAGMENT}
` as const;
