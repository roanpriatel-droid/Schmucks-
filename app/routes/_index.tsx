import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {Marquee} from '~/components/home/Marquee';
import {ShelfBoards, type BoardCollection} from '~/components/home/ShelfBoards';
import {MembershipCard} from '~/components/home/MembershipCard';
import {Mel} from '~/components/brand/Brand';
import {Reveal} from '~/components/Reveal';
import {
  MULTI_BUY_LINE,
  SALES_DATA_AVAILABLE,
  STACK_DISCOUNT_LIVE,
  STACK_TIERS,
} from '~/data/commerce';
import {pageMeta} from '~/lib/seo';
import {splitTitle} from '~/lib/productCopy';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    description:
      'Funny, slightly inappropriate graphic tees for a proud community of idiots. Printed to order, new drops weekly.',
    path: '/',
  });

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(HOME_SHELVES_QUERY, {
    variables: {
      confessional: "tag:'the-confessional'",
      courtship: "tag:'courtship'",
      pettyCrimes: "tag:'petty-crimes'",
      pair: "tag:'the-pair-programme'",
      errata: "tag:'errata'",
    },
  });

  // Best Sellers needs sales history to populate. Until the store has any, the
  // row falls back to New Arrivals rather than rendering an empty rail.
  const bestSellers = data?.bestSellers?.nodes ?? [];
  const newArrivals = data?.newArrivals?.nodes ?? [];
  // BEST_SELLING returns catalogue order until something actually sells, so
  // without a sales signal the row is New Arrivals — labelled as such.
  const usingFallback =
    !SALES_DATA_AVAILABLE || (bestSellers.length === 0 && newArrivals.length > 0);

  const boardFor = (
    handle: string,
    nodes: HomeProductFragment[] | undefined,
  ): BoardCollection => ({
    id: handle,
    handle,
    title: '',
    description: null,
    image: null,
    products: {nodes: nodes ?? []},
  });

  return {
    // The hero shows real shirts. Four is enough to read as a catalogue
    // without turning the top of the page into a grid.
    heroProducts: newArrivals.slice(0, 4),
    featured: {
      title: usingFallback ? 'New Arrivals' : 'Best Sellers',
      handle: usingFallback ? 'new-arrivals' : 'best-sellers',
      usingFallback,
      products: usingFallback ? newArrivals : bestSellers,
    },
    boards: [
      boardFor('the-confessional', data?.confessional?.nodes),
      boardFor('courtship', data?.courtship?.nodes),
      boardFor('petty-crimes', data?.pettyCrimes?.nodes),
    ],
    // Two real shirts, shown as a his-and-theirs pair.
    pair: (data?.pair?.nodes ?? []).slice(0, 2),
    errata: data?.errata?.nodes ?? [],
  };
}

export default function Homepage() {
  const {featured, boards, pair, errata, heroProducts} = useLoaderData<typeof loader>();
  return (
    <div className="sx-home">
      <Hero products={heroProducts as HomeProductFragment[]} />
      <Marquee
        items={[
          'FREE SHIPPING OVER $50',
          'PRINTED TO ORDER',
          '30-DAY RETURNS',
          'NEW SCHMUCK DROPS WEEKLY',
        ]}
      />
      <FeaturedRow featured={featured} />
      <ShelfBoards boards={boards} />
      <AsWornByIdiots />
      <PairBanner pair={pair as HomeProductFragment[]} />
      <ErrataStrip products={errata as HomeProductFragment[]} />
      <BrandStory />
      <MembershipCard />
    </div>
  );
}

/**
 * Best Sellers, falling back to New Arrivals while the store has no sales
 * history. When both shelves are empty the row becomes a restocking notice
 * instead of a blank grid.
 */
function FeaturedRow({
  featured,
}: {
  featured: {
    title: string;
    handle: string;
    usingFallback: boolean;
    products: HomeProductFragment[];
  };
}) {
  const hasProducts = featured.products.length > 0;

  return (
    <section className="sx-specials" aria-labelledby="sx-featured-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">
              {featured.usingFallback
                ? 'Straight Off the Press'
                : 'Bought Most'}
            </p>
            <h2 className="sx-section-title" id="sx-featured-title">
              {featured.title}
            </h2>
          </div>
          <p className="sx-section-note">
            {!hasProducts
              ? 'This shelf fills itself the moment the tagging run finds something.'
              : featured.usingFallback
                ? 'Fresh off the press — the newest additions to the catalogue.'
                : 'The ones other idiots bought. Draw your own conclusions.'}
          </p>
        </div>

        {hasProducts ? (
          <>
            <Reveal className="sx-grid">
              {featured.products.slice(0, 8).map((product, i) => (
                <ProductItem
                  key={product.id}
                  product={product as never}
                  loading={i < 4 ? 'eager' : 'lazy'}
                  quickAdd
                />
              ))}
            </Reveal>
            <div className="sx-specials__cta">
              <Link className="sx-btn" to={`/collections/${featured.handle}`}>
                See the whole shelf
              </Link>
            </div>
          </>
        ) : (
          <div className="sx-restock">
            <p className="sx-restock__title sx-display">Restocking</p>
            <p className="sx-restock__body">
              The shelves fill themselves when the next tagging run lands. In
              the meantime the whole menu is one click away.
            </p>
            <Link className="sx-btn sx-btn--ketchup" to="/tees">
              Show me everything
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The Pair Programme, sold with two actual shirts from the shelf rather than
 * an illustration of the idea.
 */
function PairBanner({pair}: {pair: HomeProductFragment[]}) {
  const [his, theirs] = pair;

  return (
    <section className="sx-pairbanner" aria-labelledby="sx-pair-title">
      <div className="sx-wrap sx-pairbanner__inner">
        <div className="sx-pairbanner__copy">
          <p className="sx-eyebrow sx-eyebrow--mustard">The Pair Programme</p>
          <h2 className="sx-pairbanner__title sx-display" id="sx-pair-title">
            Two shirts.
            <br />
            One bad idea.
          </h2>
          <p className="sx-pairbanner__body">
            Pick any two designs — for you and whoever agreed to this.
            There&rsquo;s no separate &ldquo;set&rdquo; to buy and nothing to
            configure: two shirts, two people, one shared lapse in judgement.
          </p>
          {STACK_DISCOUNT_LIVE ? (
            <ul className="sx-pairbanner__ladder">
              {STACK_TIERS.map((tier) => (
                <li key={tier.quantity}>
                  <span className="sx-display">
                    {tier.quantity}
                    {tier.quantity === 4 ? '+' : ''}
                  </span>{' '}
                  shirts — {tier.percent}% off
                </li>
              ))}
            </ul>
          ) : (
            <p className="sx-pairbanner__ship">{MULTI_BUY_LINE}</p>
          )}
          <div className="sx-pairbanner__ctas">
            <Link className="sx-btn sx-btn--mustard" to="/matching-sets">
              Enrol in the Programme
            </Link>
            <Link
              className="sx-btn sx-btn--ghost-light"
              to="/collections/the-pair-programme"
            >
              Browse the pairs
            </Link>
          </div>
        </div>

        {his && theirs ? (
          <div className="sx-pairbanner__pair">
            {[
              {product: his, label: 'His'},
              {product: theirs, label: 'Theirs'},
            ].map(({product, label}) => (
              <Link
                className="sx-pairpiece"
                key={product.id}
                to={`/products/${product.handle}`}
                prefetch="intent"
              >
                <span className="sx-pairpiece__label">{label}</span>
                <span className="sx-pairpiece__media">
                  {product.featuredImage ? (
                    <Image
                      data={product.featuredImage}
                      alt={product.featuredImage.altText || product.title}
                      aspectRatio="1/1"
                      sizes="(min-width: 880px) 220px, 40vw"
                      loading="lazy"
                    />
                  ) : null}
                </span>
                <span className="sx-pairpiece__name">
                  {splitTitle(product.title).displayTitle}
                </span>
              </Link>
            ))}
            <span className="sx-pairpiece__amp sx-display" aria-hidden="true">
              &amp;
            </span>
          </div>
        ) : (
          <div className="sx-pairbanner__art" aria-hidden="true">
            <Mel />
            <Mel />
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * The customer-photo ask.
 *
 * This used to be a four-up gallery of empty dashed frames reading "your photo
 * here" — a homepage section whose entire content was the admission that it
 * had no content. BRAND §8 rules out staging or buying photos to fill it, so
 * the honest move is to stop pretending it's a gallery: it's a one-line
 * invitation until real photos exist, at which point the grid comes back.
 */
function AsWornByIdiots() {
  return (
    <section className="sx-wornband" aria-labelledby="sx-worn-title">
      <div className="sx-wrap sx-wornband__inner">
        <div>
          <p className="sx-eyebrow sx-eyebrow--mustard">As Worn By Idiots</p>
          <h2 className="sx-wornband__title sx-display" id="sx-worn-title">
            Caught in public
          </h2>
        </div>
        <p className="sx-wornband__note">
          No staged models and no stock photography — the only photos that go on
          this site are ones you send us. Wear it somewhere inadvisable and
          we&rsquo;ll put you up.
        </p>
        <Link className="sx-btn sx-btn--ketchup" to="/pages/contact">
          Send us yours
        </Link>
      </div>
    </section>
  );
}

/** Errata — the misprints we decided to keep. */
function ErrataStrip({products}: {products: HomeProductFragment[]}) {
  if (!products.length) return null;

  return (
    <section className="sx-errata" aria-labelledby="sx-errata-title">
      <div className="sx-wrap">
        <div className="sx-errata__head">
          <div>
            <p className="sx-eyebrow sx-eyebrow--mustard">Errata</p>
            <h2 className="sx-errata__title sx-display" id="sx-errata-title">
              Printing mistakes we stand behind
            </h2>
            <p className="sx-errata__body">
              Every so often something goes to print wrong and comes back
              better. We don&rsquo;t pulp those. We number them, sell them, and
              refuse to correct the record.
            </p>
            <Link className="sx-btn sx-btn--mustard" to="/collections/errata">
              See the misprints
            </Link>
          </div>
        </div>

        <div className="sx-errata__rail">
          {products.slice(0, 6).map((product) => (
            <Link
              className="sx-errata__item"
              key={product.id}
              to={`/products/${product.handle}`}
              prefetch="intent"
            >
              <span className="sx-errata__media">
                {product.featuredImage ? (
                  <Image
                    data={product.featuredImage}
                    alt={product.featuredImage.altText || product.title}
                    aspectRatio="1/1"
                    sizes="(min-width: 900px) 200px, 45vw"
                    loading="lazy"
                  />
                ) : null}
                <span className="sx-errata__stamp">As printed</span>
              </span>
              <span className="sx-errata__name">
                {splitTitle(product.title).displayTitle}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Brand story, three columns. */
const STORY = [
  {
    head: 'Fine Apparel',
    body: 'Heavyweight ringspun cotton, ribbed collar, double-needle hems, printed to order. The shirt is the part we refuse to cheap out on, because the joke only works if the garment survives it.',
    to: '/pages/materials',
    cta: 'What it’s made of',
  },
  {
    head: 'For Idiots',
    body: 'Ours is an affectionate slur. The customer is in on it — every design assumes you already know the worst thing about yourself and have made peace with wearing it in public.',
    to: '/tees',
    cta: 'Browse the evidence',
  },
  {
    head: 'Since Recently',
    body: 'There is a heritage story involving a deli, a mishearing, and forty accidental shirts. It is not true in any way a lawyer would recognise, but we tell it anyway.',
    to: '/pages/about',
    cta: 'Read the lore',
  },
];

function BrandStory() {
  return (
    <section className="sx-story" aria-labelledby="sx-story-title">
      <div className="sx-wrap">
        <h2 className="sx-visually-hidden" id="sx-story-title">
          About Schmucks
        </h2>
        <Reveal className="sx-story__cols">
          {STORY.map((column) => (
            <div className="sx-story__col" key={column.head}>
              <h3 className="sx-story__head sx-display">{column.head}</h3>
              <p className="sx-story__body">{column.body}</p>
              <Link className="sx-story__cta" to={column.to}>
                {column.cta} →
              </Link>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The hero used to be type on a dotted background with no product in it at
 * all — the first screen of a clothing shop showed no clothing. It now leads
 * with four real shirts, cropped to the print so the shopper can actually read
 * a joke above the fold instead of being told there are some.
 */
function Hero({products}: {products: HomeProductFragment[]}) {
  const tiles = products.slice(0, 4);

  return (
    <section className="sx-hero" aria-label="Hero">
      <div className="sx-wrap sx-hero__inner">
        <div className="sx-hero__copy">
          <span className="sx-hero__kicker">New Schmuck Drops Weekly</span>
          <h1 className="sx-hero__headline">
            <span>Fine Apparel</span>
            <br />
            <span className="sx-hero__line2">for Idiots.</span>
          </h1>
          <p className="sx-hero__sub">
            Funny shirts for people who peaked online. Sizes S–3XL, printed on
            cotton that can take a joke.
          </p>
          <div className="sx-hero__ctas">
            <Link className="sx-btn sx-btn--ketchup" to="/tees">
              Shop the Tees
            </Link>
            <Link className="sx-btn sx-btn--ghost" to="/matching-sets">
              The Pair Programme
            </Link>
          </div>
          <p className="sx-hero__social">
            <span>Printed to order</span>
            <span className="sx-hero__dot">·</span>
            <span>Free shipping over $50</span>
            <span className="sx-hero__dot">·</span>
            <span>30-day returns</span>
          </p>
        </div>

        {tiles.length ? (
          <div className="sx-hero__wall">
            {tiles.map((product, index) => {
              // Alternate colourways so the wall isn't four identical black
              // squares — each product carries a Natural and a Black mockup.
              const alt = product.images?.nodes?.find(
                (node) => node.url !== product.featuredImage?.url,
              );
              const image =
                index % 3 === 1 && alt ? alt : product.featuredImage;
              if (!image) return null;
              const {displayTitle} = splitTitle(product.title);
              return (
                <Link
                  className="sx-herotile"
                  key={product.id}
                  to={`/products/${product.handle}`}
                  prefetch="intent"
                >
                  <Image
                    data={image}
                    alt={`The print on ${displayTitle}`}
                    aspectRatio="1/1"
                    sizes="(min-width: 60em) 22vw, 45vw"
                    loading={index < 2 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : undefined}
                  />
                  <span className="sx-herotile__shop">Shop</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
      <Mel className="sx-mel-peek" />
    </section>
  );
}

const HOME_SHELVES_QUERY = `#graphql
  fragment HomeProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
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
  }
  query HomeShelves(
    $country: CountryCode
    $language: LanguageCode
    $confessional: String!
    $courtship: String!
    $pettyCrimes: String!
    $pair: String!
    $errata: String!
  ) @inContext(country: $country, language: $language) {
    bestSellers: products(first: 8, sortKey: BEST_SELLING) {
      nodes {
        ...HomeProduct
      }
    }
    newArrivals: products(first: 8, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...HomeProduct
      }
    }
    confessional: products(first: 3, query: $confessional) {
      nodes {
        ...HomeProduct
      }
    }
    courtship: products(first: 3, query: $courtship) {
      nodes {
        ...HomeProduct
      }
    }
    pettyCrimes: products(first: 3, query: $pettyCrimes) {
      nodes {
        ...HomeProduct
      }
    }
    pair: products(first: 2, query: $pair) {
      nodes {
        ...HomeProduct
      }
    }
    errata: products(first: 6, query: $errata) {
      nodes {
        ...HomeProduct
      }
    }
  }
` as const;
