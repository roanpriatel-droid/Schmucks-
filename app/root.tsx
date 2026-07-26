import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import schmucksStyles from '~/styles/schmucks.css?url';
import {PageLayout} from './components/PageLayout';
import {MelShrug} from '~/components/brand/Brand';
import {pageMeta} from '~/lib/seo';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Inter:wght@400;500;600;700;800;900&display=swap',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
    {rel: 'alternate icon', type: 'image/png', href: '/favicon.png'},
    {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    // Absolute origin so meta functions can emit canonical/OG URLs.
    origin: new URL(args.request.url).origin,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      // Stores without a dedicated checkout domain check out on the shop
      // domain; without this fallback Analytics.Provider logs a console error.
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN ?? env.PUBLIC_STORE_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/** Site-wide defaults; any route exporting `meta` replaces these entirely. */
export const meta: Route.MetaFunction = (args) => pageMeta(args);

function orgJsonLd(origin?: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'SCHMUCKS',
        description:
          'Fine Apparel for Idiots — funny graphic tees printed to order on heavyweight cotton.',
        slogan: 'Fine Apparel for Idiots',
        ...(origin ? {url: origin, logo: `${origin}/apple-touch-icon.png`} : {}),
      },
      {
        '@type': 'WebSite',
        name: 'SCHMUCKS',
        description: 'Funny graphic tees, $25 flat, printed to order.',
        ...(origin
          ? {
              url: origin,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${origin}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }
          : {}),
      },
    ],
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  // Absent while an error boundary renders — the JSON-LD just degrades.
  const rootData = useRouteLoaderData<RootLoader>('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#F2B33D" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={schmucksStyles}></link>
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd(rootData?.origin)),
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="sx-skip">
          Skip to content
        </a>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  if (errorStatus === 404) {
    return <NotFound />;
  }

  return (
    <div className="sx-404">
      <div>
        <MelShrug className="sx-404__mel" />
        <div className="sx-404__code sx-display">{errorStatus}</div>
        <p className="sx-404__msg">
          Something broke on our end. Mel has been told. Nothing you did caused
          this, which is the one comforting part.
        </p>
        <div className="sx-404__links">
          <a className="sx-btn sx-btn--ketchup" href="/">
            Back to the shop
          </a>
          <a className="sx-btn sx-btn--ghost" href="/pages/contact">
            Tell us what happened
          </a>
        </div>
        {errorMessage && errorMessage !== 'Unknown error' ? (
          <details className="sx-404__details">
            <summary>Technical bit, for the curious</summary>
            <pre>{errorMessage}</pre>
          </details>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Shared 404 body — used by the root error boundary and the `$` catch-all so a
 * missing URL always lands somewhere useful instead of a dead end.
 */
export function NotFound({
  title = '404',
  message = 'This page doesn’t exist. Classic schmuck move.',
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="sx-404">
      <div>
        <MelShrug className="sx-404__mel" />
        <div className="sx-404__code sx-display">{title}</div>
        <p className="sx-404__msg">{message}</p>
        <form className="sx-404__search" action="/search" method="get">
          <label className="sx-visually-hidden" htmlFor="notfound-search">
            Search the shop
          </label>
          <input
            id="notfound-search"
            name="q"
            type="search"
            placeholder="Search for a shirt…"
          />
          <button type="submit" className="sx-btn">
            Search
          </button>
        </form>
        <div className="sx-404__links">
          <a className="sx-btn sx-btn--ketchup" href="/tees">
            Shop all tees
          </a>
          <a className="sx-btn sx-btn--ghost" href="/matching-sets">
            Matching sets
          </a>
          <a className="sx-btn sx-btn--ghost" href="/pages/faq">
            FAQ
          </a>
        </div>
      </div>
    </div>
  );
}
