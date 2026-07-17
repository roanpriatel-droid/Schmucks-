import type {Route} from './+types/lookbook';
import {useLoaderData, Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {Mel, Badge} from '~/components/brand/Brand';
import {Reveal} from '~/components/Reveal';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Lookbook — SCHMUCKS'},
    {
      name: 'description',
      content:
        'The Schmucks lookbook: how the shirts actually wear, styled for real life. Shop the story.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const [{products}] = await Promise.all([
    context.storefront.query(LOOKBOOK_QUERY),
  ]);
  return {products: products?.nodes ?? []};
}

const LOOKS = [
  {
    n: '01',
    title: 'The Everyday Idiot',
    body: 'One loud tee, one plain everything-else. The graphic does the talking; the rest of the fit shuts up and lets it.',
    tone: 'sx-look--mustard',
  },
  {
    n: '02',
    title: 'Layered & Deniable',
    body: 'A cursed shirt under an open overshirt reads unhinged when the jacket’s open and completely normal when it’s closed. Plausible deniability, tailored.',
    tone: 'sx-look--ink',
  },
  {
    n: '03',
    title: 'The Matching Set',
    body: 'Same palette, different prints. You and your favorite idiot, coordinated on purpose for once. Build it on the matching sets page.',
    tone: '',
  },
];

export default function Lookbook() {
  const {products} = useLoaderData<typeof loader>();
  const grid = (products as CollectionItemFragment[]).slice(0, 8);

  return (
    <div className="sx-lookbook">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Lookbook</p>
          <h1 className="sx-pagehead__title">How They Actually Wear</h1>
          <p className="sx-pagehead__desc">
            Not staged perfection — just the shirts, styled for real life. Every
            look is shoppable below.
          </p>
        </div>
      </section>

      {LOOKS.map((look, i) => (
        <section
          className={`sx-look ${look.tone}`}
          key={look.n}
          aria-label={look.title}
        >
          <div className={`sx-look__inner ${i % 2 === 1 ? 'sx-look--reverse' : ''}`}>
            <div className="sx-look__media">
              {i === 2 ? <Badge /> : <Mel />}
            </div>
            <div className="sx-look__text">
              <span className="sx-look__num sx-display">{look.n}</span>
              <h2 className="sx-look__title">{look.title}</h2>
              <p style={{maxWidth: '38ch', lineHeight: 1.6}}>{look.body}</p>
              <div className="sx-look__cta">
                {i === 2 ? (
                  <Link className="sx-btn sx-btn--ketchup" to="/matching-sets">
                    Build a Matching Set
                  </Link>
                ) : (
                  <Link className="sx-btn" to="/tees">
                    Shop the Tees
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="sx-shop">
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">Shop the Story</p>
              <h2 className="sx-section-title">Everything in the Lookbook</h2>
            </div>
          </div>
          {grid.length ? (
            <Reveal className="sx-grid">
              {grid.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 4 ? 'eager' : undefined}
                />
              ))}
            </Reveal>
          ) : (
            <div className="sx-empty-note">
              <Mel className="sx-empty-note__mel" />
              <p>
                Product photos are loading in. Meanwhile,{' '}
                <Link to="/tees">browse the tees</Link>.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const LOOKBOOK_ITEM_FRAGMENT = `#graphql
  fragment MoneyLookItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment LookItem on Product {
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
        ...MoneyLookItem
      }
      maxVariantPrice {
        ...MoneyLookItem
      }
    }
  }
` as const;

const LOOKBOOK_QUERY = `#graphql
  query Lookbook($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...LookItem
      }
    }
  }
  ${LOOKBOOK_ITEM_FRAGMENT}
` as const;
