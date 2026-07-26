import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {pageMeta, toDescription} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => {
  const page = args.data?.page;
  return pageMeta(args, {
    title: page?.seo?.title || page?.title || 'Page',
    description:
      toDescription(page?.seo?.description) ?? toDescription(page?.body),
  });
};

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
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();
  // Shopify pages can be published with an empty body — say something useful
  // rather than rendering a headline over blank space.
  const hasBody = Boolean(page.body && page.body.trim());

  return (
    <div className="sx-genericpage">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: page.title}]} />
          <h1 className="sx-pagehead__title">{page.title}</h1>
          {page.seo?.description ? (
            <p className="sx-pagehead__desc">{page.seo.description}</p>
          ) : null}
        </div>
      </section>
      <section className="sx-page">
        {hasBody ? (
          <div
            className="sx-wrap sx-prose"
            dangerouslySetInnerHTML={{__html: page.body}}
          />
        ) : (
          <div className="sx-wrap sx-prose">
            <p>
              This page doesn&rsquo;t have anything on it yet. That&rsquo;s on
              us, not you.
            </p>
            <p>
              Try the <Link to="/pages/faq">FAQ</Link>, go{' '}
              <Link to="/tees">look at the shirts</Link>, or{' '}
              <Link to="/pages/contact">ask us directly</Link>.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
