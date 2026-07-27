import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {ProductItem} from '~/components/ProductItem';
import {countLine} from '~/lib/shelves';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Articles</h2>
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={article.id}>
              <Link prefetch="intent" to={articleUrl}>
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2>Pages</h2>
      <div>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={page.id}>
              <Link prefetch="intent" to={pageUrl}>
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => (
          <div className="sx-paged">
            <PreviousLink className="sx-pagelink">
              {isLoading ? 'Loading…' : <span>↑ Load previous</span>}
            </PreviousLink>

            <div className="sx-searchhead">
              <h2 className="sx-section-title">Shirts</h2>
              <span className="sx-searchhead__count">
                {countLine(nodes.length)}
              </span>
            </div>

            {/* Search is a primary way into a 393-product catalogue, so results
                use the same card as every other listing surface — image, joke
                as the title, price, and size-first quick add. */}
            <div className="sx-grid">
              {nodes.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product as never}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  quickAdd
                />
              ))}
            </div>

            <NextLink className="sx-pagelink">
              {isLoading ? 'Loading…' : <span>Load more ↓</span>}
            </NextLink>
          </div>
        )}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <div className="sx-empty-note" style={{marginTop: '1rem'}}>
      <p style={{fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: '1.4rem'}}>
        Nothing. Nada. Zip.
      </p>
      <p>
        No shirts matched that. Try a different word, or just{' '}
        <a href="/tees" style={{color: 'var(--ketchup)', fontWeight: 800, textDecoration: 'underline'}}>
          browse all the tees
        </a>
        .
      </p>
    </div>
  );
}
