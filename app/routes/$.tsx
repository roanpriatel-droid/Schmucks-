import {data as routerData, useLoaderData} from 'react-router';
import type {Route} from './+types/$';
import {NotFound} from '~/root';
import {pageMeta} from '~/lib/seo';
import {RescueRail, RESCUE_PRODUCTS_QUERY} from '~/components/RescueRail';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Page not found',
    description:
      'That page isn’t here. Try the tees, the matching sets, or search for whatever you were after.',
    noindex: true,
  });

export async function loader({request, context}: Route.LoaderArgs) {
  // Render a real branded 404 body rather than bubbling to the error boundary,
  // while still answering with a 404 status for crawlers.
  const rescue = await context.storefront
    .query(RESCUE_PRODUCTS_QUERY, {cache: context.storefront.CacheShort()})
    .catch(() => null);
  return routerData(
    {
      pathname: new URL(request.url).pathname,
      rescue: rescue?.products?.nodes ?? [],
    },
    {status: 404},
  );
}

export default function CatchAllPage() {
  const {rescue} = useLoaderData<typeof loader>();
  return (
    <>
      <NotFound />
      <RescueRail
        products={rescue as never}
        eyebrow="While you're lost"
        title="Newest in the catalogue"
      />
    </>
  );
}
