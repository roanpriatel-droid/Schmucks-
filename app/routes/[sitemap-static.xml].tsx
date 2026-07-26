import type {Route} from './+types/[sitemap-static.xml]';
import {JOURNAL} from '~/data/journal';

/**
 * Hydrogen's generated sitemaps only cover Shopify resources (products,
 * collections, Shopify pages, blogs, articles). Everything hand-built here —
 * the catalog landings, the depth pages, the Journal — would otherwise be
 * missing from the sitemap entirely. This file covers those.
 *
 * Linked from /sitemap.xml via `customChildSitemaps`.
 */
const STATIC_ROUTES: Array<{path: string; priority: string}> = [
  {path: '/', priority: '1.0'},
  {path: '/tees', priority: '0.9'},
  {path: '/matching-sets', priority: '0.9'},
  {path: '/collections', priority: '0.7'},
  {path: '/collections/all', priority: '0.8'},
  {path: '/lookbook', priority: '0.7'},
  {path: '/journal', priority: '0.7'},
  {path: '/blogs', priority: '0.5'},
  {path: '/pages/about', priority: '0.7'},
  {path: '/pages/materials', priority: '0.7'},
  {path: '/pages/size-guide', priority: '0.7'},
  {path: '/pages/care', priority: '0.6'},
  {path: '/pages/faq', priority: '0.6'},
  {path: '/pages/contact', priority: '0.6'},
  {path: '/policies', priority: '0.3'},
];

function urlEntry({
  loc,
  priority,
  lastmod,
}: {
  loc: string;
  priority: string;
  lastmod?: string;
}) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function loader({request}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;

  const entries = [
    ...STATIC_ROUTES.map(({path, priority}) =>
      urlEntry({loc: `${origin}${path}`, priority}),
    ),
    ...JOURNAL.map((article) =>
      urlEntry({
        loc: `${origin}/journal/${article.slug}`,
        priority: '0.6',
        lastmod: new Date(article.date).toISOString().split('T')[0],
      }),
    ),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}
