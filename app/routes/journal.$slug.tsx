import type {Route} from './+types/journal.$slug';
import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import {getArticle, JOURNAL} from '~/data/journal';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {ShareRow} from '~/components/ShareRow';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: args.data?.article
      ? `${args.data.article.title} — SCHMUCKS Journal`
      : 'Journal',
    description: args.data?.article?.dek,
    type: 'article',
  });

export async function loader({params}: Route.LoaderArgs) {
  const article = getArticle(params.slug!);
  if (!article) {
    throw new Response('Article not found', {status: 404});
  }
  const more = JOURNAL.filter((a) => a.slug !== article.slug).slice(0, 2);
  return {article, more};
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function JournalArticlePage() {
  const {article, more} = useLoaderData<typeof loader>();
  const root = useRouteLoaderData<{origin?: string}>('root');
  const url = root?.origin
    ? `${root.origin}/journal/${article.slug}`
    : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    datePublished: article.date,
    author: {'@type': 'Organization', name: 'SCHMUCKS'},
    publisher: {'@type': 'Organization', name: 'SCHMUCKS'},
  };

  return (
    <div className="sx-article-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
      />
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs
            crumbs={[
              {label: 'The Journal', to: '/journal'},
              {label: article.title},
            ]}
          />
          <p className="sx-article__meta">
            {article.tag} · {fmt(article.date)} · {article.readingTime}
          </p>
          <h1 className="sx-pagehead__title">{article.title}</h1>
        </div>
      </section>
      <section className="sx-article">
        <div className="sx-wrap sx-article__body">
          <p className="sx-article__lead">{article.lead}</p>
          <div
            className="sx-prose"
            dangerouslySetInnerHTML={{__html: article.bodyHtml}}
          />
          <ShareRow url={url} title={article.title} />

          <div className="sx-article__more">
            <p className="sx-eyebrow">Keep Reading</p>
            <ul>
              {more.map((m) => (
                <li key={m.slug}>
                  <Link to={`/journal/${m.slug}`} prefetch="intent">
                    {m.title}
                  </Link>
                  <span className="sx-article__more-dek">{m.dek}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link className="sx-article__back" to="/journal">
            ← Back to the Journal
          </Link>
        </div>
      </section>
    </div>
  );
}
