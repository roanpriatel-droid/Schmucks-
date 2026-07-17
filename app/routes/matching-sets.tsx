import type {Route} from './+types/matching-sets';
import {useLoaderData, Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {Marquee} from '~/components/home/Marquee';
import {Mel} from '~/components/brand/Brand';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Matching Sets — SCHMUCKS'},
    {
      name: 'description',
      content:
        'Matching Schmucks for you and your favorite idiot. Pick any two tees — the Stack & Save discount applies automatically at checkout.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const [{products}] = await Promise.all([
    context.storefront.query(MATCH_PRODUCTS_QUERY),
  ]);
  return {products: products?.nodes ?? []};
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
    body: 'Two shirts unlocks 10% off automatically. Three unlocks 20%. Keep going.',
  },
  {
    n: '3',
    title: 'Wear Them Together',
    body: 'Coordinate with your person, your dog, or your other personality.',
  },
];

export default function MatchingSets() {
  const {products} = useLoaderData<typeof loader>();
  const grid = (products as CollectionItemFragment[]).slice(0, 8);

  return (
    <div className="sx-matching">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Two Idiots, One Look</p>
          <h1 className="sx-pagehead__title">Matching Sets</h1>
          <p className="sx-pagehead__desc">
            Build your own matching set: pick any two tees for you and your
            favorite idiot. There&rsquo;s no separate &ldquo;set&rdquo; to buy —
            add any two shirts and Stack &amp; Save takes 10% off at checkout,
            automatically.
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
          'ANY 2 TEES = 10% OFF',
          'ANY 3 = 20% OFF',
          'ANY 4+ = 30% OFF',
          'MIX & MATCH ANY DESIGNS',
        ]}
      />

      <section className="sx-page">
        <div className="sx-wrap">
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
              Grab any two below. The discount sorts itself out at checkout.
            </p>
          </div>
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
