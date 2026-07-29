/**
 * Exact product count for a tag query.
 *
 * The Storefront API caps a page at 250 nodes, so a single-page count reported
 * "250+" for the full catalogue — which is 391 products. Undercounting the
 * catalogue by 141 is both wrong and a weaker thing to say than the real
 * number, so this pages through until the API says there is no more.
 *
 * Bounded to `maxPages` so a runaway catalogue can't turn one page render into
 * an unbounded fan-out; if the bound is hit the caller still gets a "+" label.
 * Results are cached long — a catalogue count changes when products are added,
 * not per request.
 */
export async function countProducts(
  storefront: {query: Function; CacheLong: () => unknown},
  query: string,
  maxPages = 4,
): Promise<{total: number; capped: boolean}> {
  let total = 0;
  let after: string | null = null;

  for (let page = 0; page < maxPages; page++) {
    const data: any = await storefront.query(PRODUCT_COUNT_QUERY, {
      variables: {query, after},
      cache: storefront.CacheLong(),
    });
    const nodes = data?.products?.nodes ?? [];
    total += nodes.length;
    const info = data?.products?.pageInfo;
    if (!info?.hasNextPage) return {total, capped: false};
    after = info.endCursor;
  }
  return {total, capped: true};
}

const PRODUCT_COUNT_QUERY = `#graphql
  query ProductCount(
    $country: CountryCode
    $language: LanguageCode
    $query: String!
    $after: String
  ) @inContext(country: $country, language: $language) {
    products(first: 250, query: $query, after: $after) {
      nodes {
        id
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;
