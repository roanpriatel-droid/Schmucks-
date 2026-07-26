import {redirect} from 'react-router';
import type {Route} from './+types/articles.$handle';

/**
 * Shopify's sitemap (and plenty of old links) reference articles as
 * `/articles/<handle>`, but articles actually live under their blog at
 * `/blogs/<blogHandle>/<handle>`. Resolve the blog and 301 to the canonical
 * URL rather than 404ing on a link Shopify itself hands out.
 */
export async function loader({params, context}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) return redirect('/blogs');

  const {articles} = await context.storefront.query(ARTICLE_BY_HANDLE_QUERY, {
    variables: {query: `handle:${handle}`},
  });

  const article = articles?.nodes?.find((node) => node.handle === handle);

  if (!article?.blog?.handle) {
    throw new Response('Article not found', {status: 404});
  }

  return redirect(`/blogs/${article.blog.handle}/${article.handle}`, {
    status: 301,
  });
}

const ARTICLE_BY_HANDLE_QUERY = `#graphql
  query ArticleByHandle(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
  ) @inContext(country: $country, language: $language) {
    articles(first: 5, query: $query) {
      nodes {
        handle
        blog {
          handle
        }
      }
    }
  }
` as const;
