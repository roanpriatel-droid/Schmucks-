import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs._index';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Reveal} from '~/components/Reveal';
import {MelShrug} from '~/components/brand/Brand';
import {pageMeta, toDescription} from '~/lib/seo';
import type {BlogsQuery} from 'storefrontapi.generated';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'The Deli Counter',
    description:
      'Drop announcements, behind-the-scenes, and the occasional bad idea in long form. Every SCHMUCKS blog in one place.',
  });

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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
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

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();
  const hasBlogs = blogs.nodes.length > 0;

  return (
    <div className="sx-blogs">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'The Deli Counter'}]} />
          <p className="sx-pagehead__eyebrow">Words, For Some Reason</p>
          <h1 className="sx-pagehead__title">The Deli Counter</h1>
          <p className="sx-pagehead__desc">
            Drop announcements, behind-the-scenes, and the occasional bad idea
            in long form. Looking for styling and materials writing instead?
            That lives in{' '}
            <Link className="sx-inline-link" to="/journal">
              the Journal
            </Link>
            .
          </p>
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          {hasBlogs ? (
            <PaginatedResourceSection<BlogNode>
              connection={blogs}
              resourcesClassName="sx-blog-grid"
            >
              {({node: blog, index}) => (
                <BlogCard key={blog.handle} blog={blog} index={index} />
              )}
            </PaginatedResourceSection>
          ) : (
            <div className="sx-empty-note">
              <MelShrug className="sx-empty-note__mel" />
              <p>
                Nothing published here yet. Mel is still deciding what&rsquo;s
                worth saying.
              </p>
              <p>
                The <Link to="/journal">Journal</Link> has plenty to read in the
                meantime, or go <Link to="/tees">look at the shirts</Link>.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BlogCard({blog, index}: {blog: BlogNode; index: number}) {
  const latest = blog.articles?.nodes?.[0];
  const description =
    toDescription(blog.seo?.description) ??
    toDescription(latest?.excerpt) ??
    'Read the latest from the counter.';
  const latestDate = fmt(latest?.publishedAt);

  return (
    <Reveal>
      <Link
        className="sx-blog-card"
        prefetch="intent"
        to={`/blogs/${blog.handle}`}
      >
        {latest?.image ? (
          <div className="sx-blog-card__media">
            <Image
              alt={latest.image.altText || blog.title}
              aspectRatio="3/2"
              data={latest.image}
              loading={index < 2 ? 'eager' : 'lazy'}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        ) : null}
        <h2 className="sx-blog-card__title">{blog.title}</h2>
        <p className="sx-blog-card__dek">{description}</p>
        <p className="sx-blog-card__meta">
          {latest
            ? `Latest: ${latest.title}${latestDate ? ` · ${latestDate}` : ''}`
            : 'No posts yet'}
        </p>
        <span className="sx-blog-card__cta">Read the posts →</span>
      </Link>
    </Reveal>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
        articles(first: 1, sortKey: PUBLISHED_AT, reverse: true) {
          nodes {
            id
            title
            handle
            publishedAt
            excerpt
            image {
              id
              altText
              url
              width
              height
            }
          }
        }
      }
    }
  }
` as const;
