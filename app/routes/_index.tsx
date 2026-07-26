import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {Marquee} from '~/components/home/Marquee';
import {StackLadder} from '~/components/home/StackLadder';
import {ShelfBoards, type BoardCollection} from '~/components/home/ShelfBoards';
import {MembershipCard} from '~/components/home/MembershipCard';
import {Mel} from '~/components/brand/Brand';
import {Reveal} from '~/components/Reveal';
import {track} from '~/lib/analytics';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    description:
      'Funny, slightly inappropriate graphic tees for a proud community of idiots. $25 flat. New Schmuck drops weekly.',
    path: '/',
  });

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(HOME_SHELVES_QUERY);

  // Best Sellers needs sales history to populate. Until the store has any, the
  // row falls back to New Arrivals rather than rendering an empty rail.
  const bestSellers = data?.bestSellers?.products?.nodes ?? [];
  const newArrivals = data?.newArrivals?.products?.nodes ?? [];
  const usingFallback = bestSellers.length === 0 && newArrivals.length > 0;

  return {
    featured: {
      title: usingFallback ? 'New Arrivals' : 'Best Sellers',
      handle: usingFallback ? 'new-arrivals' : 'best-sellers',
      usingFallback,
      products: usingFallback ? newArrivals : bestSellers,
    },
    boards: [
      data?.confessional,
      data?.courtship,
      data?.pettyCrimes,
    ] as BoardCollection[],
    pair: data?.pairProgramme ?? null,
  };
}

export default function Homepage() {
  const {featured, boards, pair} = useLoaderData<typeof loader>();
  return (
    <div className="sx-home">
      <Hero />
      <Marquee
        items={[
          'STACK 2 SAVE 10%',
          'STACK 3 SAVE 20%',
          'FREE US SHIPPING $100+',
          'NEW SCHMUCK DROPS WEEKLY',
        ]}
      />
      <FeaturedRow featured={featured} />
      <ShelfBoards boards={boards} />
      <PairBanner hasProducts={Boolean(pair?.products?.nodes?.length)} />
      <Statement />
      <StackLadder />
      <PromiseSection />
      <TrustBar />
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
              {featured.usingFallback ? 'Straight Off the Press' : 'Bought Most'}
            </p>
            <h2 className="sx-section-title" id="sx-featured-title">
              {featured.title}
            </h2>
          </div>
          <p className="sx-section-note">
            {!hasProducts
              ? 'This shelf fills itself the moment the tagging run finds something.'
              : featured.usingFallback
                ? 'Nobody has voted with their wallet yet, so here’s what’s newest.'
                : 'The ones other idiots bought. Draw your own conclusions.'}
          </p>
        </div>

        {hasProducts ? (
          <>
            <Reveal className="sx-grid">
              {featured.products.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
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

/** Sells the matching-set concept and points at The Pair Programme. */
function PairBanner({hasProducts}: {hasProducts: boolean}) {
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
            Pick any two designs — for you and whoever agreed to this. No
            separate &ldquo;set&rdquo; to buy and no code to remember: add two
            shirts and the discount applies itself at checkout.
          </p>
          <ul className="sx-pairbanner__ladder">
            <li>
              <span className="sx-display">2</span> shirts — 10% off
            </li>
            <li>
              <span className="sx-display">3</span> shirts — 20% off
            </li>
            <li>
              <span className="sx-display">4+</span> shirts — 30% off
            </li>
          </ul>
          <div className="sx-pairbanner__ctas">
            <Link className="sx-btn sx-btn--mustard" to="/matching-sets">
              Enrol in the Programme
            </Link>
            {hasProducts ? (
              <Link
                className="sx-btn sx-btn--ghost-light"
                to="/collections/the-pair-programme"
              >
                Browse the pairs
              </Link>
            ) : null}
          </div>
        </div>
        <div className="sx-pairbanner__art" aria-hidden="true">
          <Mel />
          <Mel />
        </div>
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section className="sx-statement" aria-label="Brand statement">
      <div className="sx-wrap">
        <Reveal>
          <p className="sx-statement__text sx-display">
            Dumb on the front.
            <br />
            <em>Serious</em> about the shirt.
          </p>
          <p className="sx-statement__sub">
            Heavyweight ringspun cotton, printed to order in the USA. The joke is
            free; the quality isn&rsquo;t an accident.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="sx-hero" aria-label="Hero">
      <div className="sx-wrap sx-hero__inner">
        <span className="sx-hero__kicker">New Schmuck Drops Weekly</span>
        <h1 className="sx-hero__headline">
          <span>Fine Apparel</span>
          <br />
          <span className="sx-hero__line2">for Idiots.</span>
        </h1>
        <p className="sx-hero__sub">
          Funny shirts for people who peaked online. $25 flat, sizes S–3XL,
          printed on cotton that can take a joke.
        </p>
        <p className="sx-hero__social">
          <span>$25 flat</span>
          <span className="sx-hero__dot">·</span>
          <span>Free US shipping over $100</span>
          <span className="sx-hero__dot">·</span>
          <span>30-day returns</span>
        </p>
        <div className="sx-hero__ctas">
          <Link className="sx-btn sx-btn--ketchup" to="/tees">
            Shop the Tees
          </Link>
          <Link className="sx-btn sx-btn--ghost" to="/matching-sets">
            Matching Sets
          </Link>
        </div>
      </div>
      <Mel className="sx-mel-peek" />
    </section>
  );
}

function ProductCard({
  product,
  index,
}: {
  product: HomeProductFragment;
  index: number;
}) {
  const gallery = product.images?.nodes ?? [];
  const image = product.featuredImage ?? gallery[0] ?? null;
  const secondary = gallery.find((img) => img?.id && img.id !== image?.id);
  const sizes = '(min-width: 940px) 300px, (min-width: 620px) 33vw, 50vw';
  return (
    <Link className="sx-card" to={`/products/${product.handle}`} prefetch="intent">
      <div className={`sx-card__media ${secondary ? 'sx-card__media--swap' : ''}`}>
        {index === 0 && <span className="sx-card__flag">Fresh Drop</span>}
        {image && (
          <Image
            data={image}
            alt={image.altText || product.title}
            aspectRatio="1/1"
            sizes={sizes}
            loading={index < 4 ? 'eager' : 'lazy'}
            className="sx-card__img--primary"
          />
        )}
        {secondary && (
          <Image
            data={secondary}
            alt=""
            aria-hidden="true"
            aspectRatio="1/1"
            sizes={sizes}
            loading="lazy"
            className="sx-card__img--secondary"
          />
        )}
      </div>
      <div className="sx-card__body">
        <h3 className="sx-card__title">{product.title}</h3>
        <div className="sx-card__meta">Unisex tee · S–3XL</div>
        <div className="sx-card__price sx-display">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}

const PROMISE = [
  {
    title: 'Real Cotton, Real Weight',
    body: 'Heavyweight ringspun cotton with a soft hand and a print that survives the wash. The shirt is not the punchline.',
  },
  {
    title: 'Printed to Order',
    body: 'Every shirt is made when you order it — less waste, no dusty warehouse stock, fresh prints every time.',
  },
  {
    title: '30-Day Returns',
    body: 'Wrong size or second thoughts? Send it back within 30 days. No interrogation. Maybe one gentle question.',
  },
];

function PromiseSection() {
  return (
    <section className="sx-reviews" aria-labelledby="sx-promise-title">
      <div className="sx-wrap">
        <div className="sx-reviews__head">
          <p className="sx-eyebrow" style={{color: 'var(--ketchup)'}}>
            The Schmucks Promise
          </p>
          <h2 className="sx-section-title" id="sx-promise-title">
            Dumb Shirt. Serious Standards.
          </h2>
          <p style={{maxWidth: '46ch', margin: '0.75rem auto 0'}}>
            We don&rsquo;t do fake five-star quotes. Here&rsquo;s what we&rsquo;ll
            actually stand behind.
          </p>
        </div>
        <Reveal className="sx-review-grid">
          {PROMISE.map((p) => (
            <div className="sx-review" key={p.title}>
              <div className="sx-review__stars" aria-hidden="true">
                ★
              </div>
              <h3 className="sx-promise__title">{p.title}</h3>
              <p className="sx-review__body">{p.body}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

const TRUST = [
  {title: '30-Day Returns', note: 'Changed your mind? Fine.', icon: '↩'},
  {title: 'Free US Shipping', note: 'On orders $100+', icon: '📦'},
  {title: 'Secure Checkout', note: 'Powered by Shopify', icon: '🔒'},
  {title: 'Ships in 3–5 Days', note: 'Printed to order in the US', icon: '⚡'},
];

function TrustBar() {
  return (
    <section className="sx-trust" aria-label="Store guarantees">
      <div className="sx-wrap">
        <div className="sx-trust__grid">
          {TRUST.map((t) => (
            <div className="sx-trust__col" key={t.title}>
              <div className="sx-trust__icon" style={{fontSize: '1.6rem'}}>
                {t.icon}
              </div>
              <div className="sx-trust__title">{t.title}</div>
              <div className="sx-trust__note">{t.note}</div>
            </div>
          ))}
        </div>
      </div>
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
    }
  }
  fragment HomeBoard on Collection {
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
    products(first: 3) {
      nodes {
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
      }
    }
  }
  query HomeShelves($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    bestSellers: collection(handle: "best-sellers") {
      id
      handle
      products(first: 8) {
        nodes {
          ...HomeProduct
        }
      }
    }
    newArrivals: collection(handle: "new-arrivals") {
      id
      handle
      products(first: 8) {
        nodes {
          ...HomeProduct
        }
      }
    }
    confessional: collection(handle: "the-confessional") {
      ...HomeBoard
    }
    courtship: collection(handle: "courtship") {
      ...HomeBoard
    }
    pettyCrimes: collection(handle: "petty-crimes") {
      ...HomeBoard
    }
    pairProgramme: collection(handle: "the-pair-programme") {
      id
      handle
      products(first: 1) {
        nodes {
          id
        }
      }
    }
  }
` as const;
