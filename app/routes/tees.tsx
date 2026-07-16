import type {Route} from './+types/tees';
import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Tees — SCHMUCKS'},
    {
      name: 'description',
      content:
        'Every Schmucks graphic tee. $25 flat, unisex S–3XL, printed on cotton that can take a joke.',
    },
  ];
};

export async function loader({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const [{products}] = await Promise.all([
    context.storefront.query(TEES_QUERY, {variables: {...paginationVariables}}),
  ]);
  return {products};
}

export default function Tees() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="sx-collection">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">The Whole Menu</p>
          <h1 className="sx-pagehead__title">Tees</h1>
          <p className="sx-pagehead__desc">
            Every shirt we make. $25 flat, unisex S–3XL, a few colorways each.
            Stack 2 or more and the discount applies itself at checkout.
          </p>
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          <PaginatedResourceSection<CollectionItemFragment>
            connection={products}
            resourcesClassName="sx-grid"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </div>
      </section>
    </div>
  );
}

const TEES_ITEM_FRAGMENT = `#graphql
  fragment MoneyTeesItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment TeesItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyTeesItem
      }
      maxVariantPrice {
        ...MoneyTeesItem
      }
    }
  }
` as const;

const TEES_QUERY = `#graphql
  query TeesCatalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...TeesItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${TEES_ITEM_FRAGMENT}
` as const;
