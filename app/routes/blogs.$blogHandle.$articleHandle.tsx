import {Link, useLoaderData, useRouteLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {ShareRow} from '~/components/ShareRow';
import {pageMeta, toDescription} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => {
  const article = args.data?.article;
  return pageMeta(args, {
    title: article?.seo?.title || article?.title || 'Article',
    description:
      toDescription(article?.seo?.description) ??
      toDescription(article?.excerpt) ??
      toDescription(article?.contentHtml),
    image: article?.image?.url,
    type: 'article',
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  // Siblings are newest-first; walk to either side for prev/next links.
  // Capped at 50 posts — past that the older tail just loses its "older" link.
  const siblings = blog.articles?.nodes ?? [];
  const position = siblings.findIndex((node) => node.handle === articleHandle);
  const newer = position > 0 ? siblings[position - 1] : null;
  const older =
    position >= 0 && position < siblings.length - 1
      ? siblings[position + 1]
      : null;

  return {
    article,
    blogTitle: blog.title,
    blogHandle,
    newer,
    older,
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

export default function Article() {
  const {article, blogTitle, blogHandle, newer, older} =
    useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;
  const root = useRouteLoaderData<{origin?: string}>('root');
  const url = root?.origin
    ? `${root.origin}/blogs/${blogHandle}/${article.handle}`
    : undefined;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: article.publishedAt,
    description:
      toDescription(article.seo?.description) ??
      toDescription(article.excerpt) ??
      toDescription(contentHtml),
    ...(image?.url ? {image: [image.url]} : {}),
    ...(url ? {mainEntityOfPage: url} : {}),
    author: {
      '@type': author?.name ? 'Person' : 'Organization',
      name: author?.name || 'SCHMUCKS',
    },
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
              {label: 'The Deli Counter', to: '/blogs'},
              {label: blogTitle, to: `/blogs/${blogHandle}`},
              {label: title},
            ]}
          />
          <p className="sx-article__meta">
            <time dateTime={article.publishedAt}>{publishedDate}</time>
            {author?.name ? ` · ${author.name}` : ''}
          </p>
          <h1 className="sx-pagehead__title">{title}</h1>
        </div>
      </section>
      <section className="sx-article">
        <div className="sx-wrap sx-article__body">
          {image && (
            <Image
              data={image}
              sizes="(min-width: 900px) 820px, 100vw"
              loading="eager"
              className="sx-article__hero"
            />
          )}
          {article.excerpt ? (
            <p className="sx-article__lead">{article.excerpt}</p>
          ) : null}
          <div
            className="sx-prose"
            dangerouslySetInnerHTML={{__html: contentHtml}}
          />

          {article.tags?.length ? (
            <ul className="sx-tags">
              {article.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}

          <ShareRow url={url} title={title} />

          {newer || older ? (
            <nav className="sx-article__nav" aria-label="More posts">
              {older ? (
                <Link
                  className="sx-article__nav-link"
                  to={`/blogs/${blogHandle}/${older.handle}`}
                  prefetch="intent"
                >
                  <span className="sx-eyebrow">← Older</span>
                  <span className="sx-article__nav-title">{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link
                  className="sx-article__nav-link sx-article__nav-link--next"
                  to={`/blogs/${blogHandle}/${newer.handle}`}
                  prefetch="intent"
                >
                  <span className="sx-eyebrow">Newer →</span>
                  <span className="sx-article__nav-title">{newer.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}

          <Link className="sx-article__back" to={`/blogs/${blogHandle}`}>
            ← Back to {blogTitle}
          </Link>
        </div>
      </section>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      title
      articles(first: 50, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          id
          handle
          title
        }
      }
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        excerpt
        tags
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
