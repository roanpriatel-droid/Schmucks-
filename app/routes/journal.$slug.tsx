import type {Route} from './+types/journal.$slug';
import {Link, useLoaderData} from 'react-router';
import {getArticle, JOURNAL} from '~/data/journal';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data?.article) return [{title: 'Journal — SCHMUCKS'}];
  return [
    {title: `${data.article.title} — SCHMUCKS Journal`},
    {name: 'description', content: data.article.dek},
    {property: 'og:title', content: data.article.title},
    {property: 'og:description', content: data.article.dek},
    {property: 'og:type', content: 'article'},
  ];
};

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
          <div className="sx-article__more" style={{marginTop: '2.5rem'}}>
            <p className="sx-eyebrow">Keep Reading</p>
            <ul style={{marginTop: '0.75rem'}}>
              {more.map((m) => (
                <li key={m.slug} style={{marginBottom: '0.5rem'}}>
                  <Link
                    to={`/journal/${m.slug}`}
                    style={{
                      fontWeight: 800,
                      color: 'var(--ketchup)',
                      textDecoration: 'underline',
                    }}
                  >
                    {m.title}
                  </Link>
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
