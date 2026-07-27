import type {Route} from './+types/lookbook';
import {useLoaderData, Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import {Restocking} from '~/components/Restocking';
import {Badge} from '~/components/brand/Brand';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {SIZE_RUN} from '~/data/commerce';
import {pageMeta} from '~/lib/seo';
import {splitTitle} from '~/lib/productCopy';
import {Breadcrumbs} from '~/components/Breadcrumbs';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Lookbook',
    description:
      'The Schmucks catalogue, laid out like the mail-order spreads it is pretending to be. Every plate is shoppable.',
    path: '/lookbook',
  });

export async function loader({context}: Route.LoaderArgs) {
  // Three shelves give the spread its sections; each contributes real plates.
  const data = await context.storefront.query(LOOKBOOK_QUERY, {
    variables: {
      confessional: "tag:'the-confessional'",
      courtship: "tag:'courtship'",
      vices: "tag:'vices'",
      rest: "tag:'tees'",
    },
  });

  return {
    plates: {
      confessional: data?.confessional?.nodes ?? [],
      courtship: data?.courtship?.nodes ?? [],
      vices: data?.vices?.nodes ?? [],
    },
    rest: data?.rest?.nodes ?? [],
  };
}

/** Editorial framing for each spread — the shelf supplies the garments. */
const SPREADS = [
  {
    key: 'confessional' as const,
    plate: 'Plate I',
    title: 'Said Out Loud',
    body: 'The admissions section. Worn best with an expression that suggests you meant it, and a jacket you can close in a hurry.',
    to: '/collections/the-confessional',
    tone: '',
  },
  {
    key: 'courtship' as const,
    plate: 'Plate II',
    title: 'Courtship & Related Errors',
    body: 'Garments for the pursuit of another person. Historically effective in the way a sandwich board is effective.',
    to: '/collections/courtship',
    tone: 'sx-spread--mustard',
  },
  {
    key: 'vices' as const,
    plate: 'Plate III',
    title: 'The Vices Department',
    body: 'Habits, rendered in cotton. Our largest department, which we have decided not to think about too hard.',
    to: '/collections/vices',
    tone: 'sx-spread--ink',
  },
];

export default function Lookbook() {
  const {plates, rest} = useLoaderData<typeof loader>();
  const grid = (rest as CollectionItemFragment[]).slice(0, 8);
  const hasAnything =
    grid.length ||
    SPREADS.some((spread) => plates[spread.key]?.length);

  return (
    <div className="sx-lookbook">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Lookbook'}]} />
          <p className="sx-pagehead__eyebrow">Catalogue No. 001</p>
          <h1 className="sx-pagehead__title">The Lookbook</h1>
          <p className="sx-pagehead__desc">
            Laid out like the mail-order catalogues nobody asked us to imitate.
            Every plate is a real shirt, unisex {SIZE_RUN}, and every one of
            them is shoppable.
          </p>
        </div>
      </section>

      {!hasAnything ? (
        <section className="sx-shop">
          <div className="sx-wrap">
            <Restocking title="The lookbook" />
          </div>
        </section>
      ) : null}

      {SPREADS.map((spread, index) => {
        const items = plates[spread.key] ?? [];
        if (!items.length) return null;
        const [hero, ...others] = items;

        return (
          <section
            className={`sx-spread ${spread.tone}`}
            key={spread.key}
            aria-labelledby={`sx-spread-${spread.key}`}
          >
            <div className="sx-wrap">
              <div className="sx-spread__rule">
                <span className="sx-spread__plate">{spread.plate}</span>
                <span className="sx-spread__line" aria-hidden="true" />
                <span className="sx-spread__page">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="sx-spread__inner">
                <Reveal className="sx-spread__hero">
                  <Link
                    className="sx-plate sx-plate--hero"
                    to={`/products/${hero.handle}`}
                    prefetch="intent"
                  >
                    <div className="sx-plate__media">
                      {hero.featuredImage ? (
                        <Image
                          data={hero.featuredImage}
                          alt={hero.featuredImage.altText || hero.title}
                          aspectRatio="4/5"
                          sizes="(min-width: 900px) 46vw, 92vw"
                          loading={index === 0 ? 'eager' : 'lazy'}
                        />
                      ) : null}
                    </div>
                    <figcaption className="sx-plate__cap">
                      <span className="sx-plate__fig">Fig. {index + 1}a</span>
                      <span className="sx-plate__name">
                        {splitTitle(hero.title).displayTitle}
                      </span>
                      <span className="sx-plate__price">
                        <Money data={hero.priceRange.minVariantPrice} />
                      </span>
                    </figcaption>
                  </Link>
                </Reveal>

                <div className="sx-spread__text">
                  <h2 className="sx-spread__title" id={`sx-spread-${spread.key}`}>
                    {spread.title}
                  </h2>
                  <p className="sx-spread__body">{spread.body}</p>
                  <Link className="sx-btn sx-btn--ghost" to={spread.to}>
                    See the whole shelf
                  </Link>

                  <div className="sx-spread__minis">
                    {others.slice(0, 4).map((item, i) => (
                      <Link
                        className="sx-plate sx-plate--mini"
                        key={item.id}
                        to={`/products/${item.handle}`}
                        prefetch="intent"
                      >
                        <div className="sx-plate__media">
                          {item.featuredImage ? (
                            <Image
                              data={item.featuredImage}
                              alt={item.featuredImage.altText || item.title}
                              aspectRatio="1/1"
                              sizes="150px"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <span className="sx-plate__fig">
                          Fig. {index + 1}
                          {String.fromCharCode(98 + i)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="sx-lookbook__note" aria-label="Catalogue note">
        <div className="sx-wrap">
          <Badge className="sx-lookbook__badge" />
          <p>
            All garments printed to order. Colours photographed as accurately as
            a screen allows. Sizes {SIZE_RUN}. Prices as marked, in the currency
            your checkout says.
          </p>
        </div>
      </section>

      {grid.length ? (
        <section className="sx-shop">
          <div className="sx-wrap">
            <div className="sx-section-head">
              <div>
                <p className="sx-eyebrow">Shop the Catalogue</p>
                <h2 className="sx-section-title">Everything on these pages</h2>
              </div>
            </div>
            <Reveal className="sx-grid">
              {grid.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 4 ? 'eager' : 'lazy'}
                />
              ))}
            </Reveal>
            <div className="sx-specials__cta">
              <Link className="sx-btn" to="/tees">
                The whole menu
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

const LOOKBOOK_ITEM_FRAGMENT = `#graphql
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

const LOOKBOOK_QUERY = `#graphql
  query Lookbook(
    $country: CountryCode
    $language: LanguageCode
    $confessional: String!
    $courtship: String!
    $vices: String!
    $rest: String!
  ) @inContext(country: $country, language: $language) {
    confessional: products(first: 5, query: $confessional) {
      nodes {
        ...LookItem
      }
    }
    courtship: products(first: 5, query: $courtship) {
      nodes {
        ...LookItem
      }
    }
    vices: products(first: 5, query: $vices) {
      nodes {
        ...LookItem
      }
    }
    rest: products(first: 8, query: $rest, sortKey: BEST_SELLING) {
      nodes {
        ...LookItem
      }
    }
  }
  ${LOOKBOOK_ITEM_FRAGMENT}
` as const;
