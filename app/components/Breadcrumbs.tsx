import {Link, useRouteLoaderData} from 'react-router';

export type Crumb = {
  label: string;
  /** Omit on the current page — it renders as plain text. */
  to?: string;
};

/**
 * Interior-page breadcrumb trail. Emits BreadcrumbList JSON-LD alongside the
 * visible trail so search engines get the same hierarchy users do.
 */
export function Breadcrumbs({crumbs}: {crumbs: Crumb[]}) {
  const root = useRouteLoaderData<{origin?: string}>('root');
  const origin = root?.origin;
  const trail: Crumb[] = [{label: 'Home', to: '/'}, ...crumbs];

  const jsonLd = origin
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.label,
          ...(crumb.to ? {item: `${origin}${crumb.to}`} : {}),
        })),
      }
    : null;

  return (
    <nav className="sx-crumbs" aria-label="Breadcrumb">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
      ) : null}
      <ol>
        {trail.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`}>
            {crumb.to ? (
              <Link to={crumb.to} prefetch="intent">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
