import {useMemo, useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Image, Money} from '@shopify/hydrogen';
import type {HomeProductFragment} from 'storefrontapi.generated';
import {Marquee} from '~/components/home/Marquee';
import {StackLadder} from '~/components/home/StackLadder';
import {Mel, Badge} from '~/components/brand/Brand';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'SCHMUCKS — Fine Apparel for Idiots'},
    {
      name: 'description',
      content:
        'Funny, slightly inappropriate graphic tees for a proud community of idiots. $25 flat. New Schmuck drops weekly.',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(HOME_COLLECTIONS_QUERY),
  ]);

  return {collections: collections?.nodes ?? []};
}

type HomeCollection = {
  id: string;
  title: string;
  handle: string;
  products: {nodes: HomeProductFragment[]};
};

export default function Homepage() {
  const {collections} = useLoaderData<typeof loader>();
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
      <Specials collections={collections as HomeCollection[]} />
      <Statement />
      <StackLadder />
      <PromiseSection />
      <UGC />
      <TrustBar />
      <JoinTheSchmucks />
    </div>
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

function Specials({collections}: {collections: HomeCollection[]}) {
  const withProducts = collections.filter((c) => c.products?.nodes?.length);

  // "All" = de-duped union across collections, capped to a clean grid.
  const all = useMemo(() => {
    const seen = new Set<string>();
    const out: HomeCollection['products']['nodes'] = [];
    for (const c of withProducts) {
      for (const p of c.products.nodes) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          out.push(p);
        }
      }
    }
    return out.slice(0, 8);
  }, [withProducts]);

  const tabs = [
    {key: '__all', title: 'All', products: all},
    ...withProducts.map((c) => ({
      key: c.handle,
      title: c.title,
      products: c.products.nodes.slice(0, 8),
    })),
  ];

  const [active, setActive] = useState('__all');
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <section className="sx-specials" aria-labelledby="sx-specials-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">Today&rsquo;s Specials</p>
            <h2 className="sx-section-title" id="sx-specials-title">
              The Goods
            </h2>
          </div>
          <p className="sx-section-note">
            Fresh off the press. Order at the counter, we&rsquo;ll bring it to
            your door.
          </p>
        </div>

        {tabs.length > 1 && (
          <div className="sx-tabs" role="tablist" aria-label="Filter shirts">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={active === t.key}
                className="sx-tab"
                onClick={() => setActive(t.key)}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}

        <Reveal className="sx-grid">
          {current.products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </Reveal>

        <div className="sx-specials__cta">
          <Link className="sx-btn" to="/collections/all">
            View the Whole Menu
          </Link>
        </div>
      </div>
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

function UGC() {
  return (
    <section className="sx-ugc" aria-labelledby="sx-ugc-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">Schmucks in the Wild</p>
            <h2 className="sx-section-title" id="sx-ugc-title">
              Caught in Public
            </h2>
          </div>
          <p className="sx-section-note">
            Tag <strong>@schmucks</strong> for a feature and 10% off your next
            mistake.
          </p>
        </div>
        <div className="sx-ugc__grid">
          {Array.from({length: 4}).map((_, i) => (
            <figure className="sx-ugc__tile" key={i}>
              <Mel />
              <figcaption className="sx-ugc__handle">@idiot_{i + 1}</figcaption>
            </figure>
          ))}
        </div>
        <p className="sx-ugc__cap">
          Real photos coming soon. These are Mel. Mel is not for sale.
        </p>
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

function JoinTheSchmucks() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <section className="sx-join" aria-labelledby="sx-join-title">
      <div className="sx-wrap">
        <div
          style={{display: 'grid', placeItems: 'center', marginBottom: '1rem'}}
        >
          <Badge className="sx-join__badge" />
        </div>
        <h2 className="sx-join__title" id="sx-join-title">
          Join the Schmucks
        </h2>
        <p className="sx-join__sub">
          Get 10% off your first mistake, plus early access to weekly drops
          before they sell out to smarter people.
        </p>
        {submitted ? (
          <div className="sx-form-success" role="status">
            <div className="sx-form-success__title">You&rsquo;re in.</div>
            <p>
              Welcome to the Schmucks. Check your inbox for your 10% code — and
              our sincere condolences.
            </p>
          </div>
        ) : (
          <form
            className="sx-join__form"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            aria-label="Email signup"
          >
            <input
              className="sx-join__input"
              type="email"
              required
              placeholder="you@regrets.com"
              aria-label="Email address"
            />
            <button className="sx-btn sx-btn--ink" type="submit">
              Sign Me Up
            </button>
          </form>
        )}
        <p className="sx-join__fine">
          No spam. Just bad decisions, delivered weekly.
        </p>
      </div>
    </section>
  );
}

const HOME_COLLECTIONS_QUERY = `#graphql
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
  query HomeCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 5, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        products(first: 8) {
          nodes {
            ...HomeProduct
          }
        }
      }
    }
  }
` as const;
