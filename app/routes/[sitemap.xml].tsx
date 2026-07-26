import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';

export async function loader({
  request,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemapIndex({
    storefront,
    request,
    // `metaObjects` is in the default list but this storefront has no
    // metaobject routes, so those URLs would 404. Everything else here is
    // routable — /articles/:handle redirects to its canonical blog URL.
    types: ['products', 'collections', 'pages', 'blogs', 'articles'],
    // Hand-built routes Shopify doesn't know about (see the file for why).
    customChildSitemaps: ['/sitemap-static.xml'],
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
