import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Reveal} from '~/components/Reveal';
import {MelShrug} from '~/components/brand/Brand';
import {pageMeta, toDescription} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => {
  const blog = args.data?.blog;
  return pageMeta(args, {
    title: blog?.seo?.title || blog?.title || 'Blog',
    description:
      toDescription(blog?.seo?.description) ??
      (blog?.title
        ? `${blog.title} — drop announcements, behind-the-scenes and long-form nonsense from SCHMUCKS.`
        : undefined),
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

function fmt(iso?: string | null) {
  if (!iso) return null;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();
  const {articles} = blog;
  const hasArticles = articles.nodes.length > 0;
  // On the first page, promote the newest post to a wide lead card.
  const lead = !articles.pageInfo.hasPreviousPage
    ? articles.nodes[0]
    : undefined;

  return (
    <div className="sx-blog">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs
            crumbs={[
              {label: 'The Deli Counter', to: '/blogs'},
              {label: blog.title},
            ]}
          />
          <p className="sx-pagehead__eyebrow">The Deli Counter</p>
          <h1 className="sx-pagehead__title">{blog.title}</h1>
          {blog.seo?.description ? (
            <p className="sx-pagehead__desc">{blog.seo.description}</p>
          ) : null}
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          {hasArticles ? (
            <>
              {lead ? <LeadArticle article={lead} /> : null}
              <PaginatedResourceSection<ArticleItemFragment>
                connection={articles}
                resourcesClassName="sx-blog-grid"
              >
                {({node: article, index}) =>
                  lead && article.id === lead.id ? null : (
                    <ArticleItem
                      article={article}
                      key={article.id}
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                  )
                }
              </PaginatedResourceSection>
            </>
          ) : (
            <div className="sx-empty-note">
              <MelShrug className="sx-empty-note__mel" />
              <p>No posts in {blog.title} yet. Check back after the next drop.</p>
              <p>
                In the meantime: <Link to="/journal">the Journal</Link> or{' '}
                <Link to="/tees">the shirts</Link>.
              </p>
            </div>
          )}
          <Link className="sx-article__back" to="/blogs">
            ← All blogs
          </Link>
        </div>
      </section>
    </div>
  );
}

function LeadArticle({article}: {article: ArticleItemFragment}) {
  const publishedAt = fmt(article.publishedAt);
  return (
    <Reveal>
      <Link
        className="sx-blog-lead"
        to={`/blogs/${article.blog.handle}/${article.handle}`}
        prefetch="intent"
      >
        <div className="sx-blog-lead__media">
          {article.image ? (
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="4/3"
              data={article.image}
              loading="eager"
              sizes="(min-width: 900px) 50vw, 100vw"
            />
          ) : (
            <MelShrug />
          )}
        </div>
        <div className="sx-blog-lead__body">
          <span className="sx-eyebrow">Latest post</span>
          <h2 className="sx-blog-lead__title">{article.title}</h2>
          {article.excerpt ? (
            <p className="sx-blog-lead__dek">
              {toDescription(article.excerpt, 220)}
            </p>
          ) : null}
          <p className="sx-blog-card__meta">
            {[publishedAt, article.author?.name].filter(Boolean).join(' · ')}
          </p>
          <span className="sx-blog-card__cta">Read it →</span>
        </div>
      </Link>
    </Reveal>
  );
}

function ArticleItem({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const publishedAt = fmt(article.publishedAt);
  return (
    <Link
      className="sx-blog-card"
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      prefetch="intent"
      key={article.id}
    >
      {article.image && (
        <div className="sx-blog-card__media">
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="3/2"
            data={article.image}
            loading={loading}
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        </div>
      )}
      <h3 className="sx-blog-card__title">{article.title}</h3>
      {article.excerpt ? (
        <p className="sx-blog-card__dek">{toDescription(article.excerpt, 140)}</p>
      ) : null}
      <p className="sx-blog-card__meta">
        {[publishedAt, article.author?.name].filter(Boolean).join(' · ')}
      </p>
      <span className="sx-blog-card__cta">Read it →</span>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    excerpt
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
