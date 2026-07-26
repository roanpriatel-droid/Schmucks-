import {data as routerData} from 'react-router';
import type {Route} from './+types/$';
import {NotFound} from '~/root';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Page not found',
    description:
      'That page isn’t here. Try the tees, the matching sets, or search for whatever you were after.',
    noindex: true,
  });

export async function loader({request}: Route.LoaderArgs) {
  // Render a real branded 404 body rather than bubbling to the error boundary,
  // while still answering with a 404 status for crawlers.
  return routerData({pathname: new URL(request.url).pathname}, {status: 404});
}

export default function CatchAllPage() {
  return <NotFound />;
}
