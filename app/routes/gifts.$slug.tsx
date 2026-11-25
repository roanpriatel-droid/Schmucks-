import type {Route} from './+types/gifts.$slug';
import {Link, useLoaderData} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {ProductItem} from '~/components/ProductItem';
import {Restocking} from '~/components/Restocking';
import {GIFTS, getGift} from '~/data/gifts';
import {pageMeta} from '~/lib/seo';
import {splitTitle} from '~/lib/productCopy';
import {PRODUCT_ITEM_FRAGMENT} from './collections.$handle';
import type {ProductItemFragment} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = (args) => {
  const gift = args.data?.gift;
  return pageMeta(args, {
    title: gift ? gift.title : 'Gift Guide',
    description: gift?.description,
    path: gift ? `/gifts/${gift.slug}` : '/gifts',
    noindex: !args.data?.products?.length,
  });
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  const gift = getGift(params.slug);
  if (!gift) throw new Response('Not found', {status: 404});
  const {products} = await context.storefront.query(GIFT_PRODUCTS_QUERY, {
    variables: {query: gift.query, first: 30},
    cache: context.storefront.CacheShort(),
  });
  return {
    gift,
    products: products.nodes as ProductItemFragment[],
    origin: new URL(request.url).origin,
  };
}

export default function GiftGuide() {
  const {gift, products, origin} = useLoaderData<typeof loader>();
  const others = GIFTS.filter((g) => g.slug !== gift.slug);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: gift.title,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${origin}/products/${product.handle}`,
      name: splitTitle(product.title).displayTitle,
    })),
  };

  return (
    <div className="sx-gift">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(itemList)}}
      />
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs
            crumbs={[{label: 'Gift Guides', to: '/gifts'}, {label: gift.title}]}
          />
          <p className="sx-pagehead__eyebrow">Gift Guide</p>
          <h1 className="sx-pagehead__title">{gift.title}</h1>
          {gift.intro.map((p) => (
            <p key={p.slice(0, 24)} className="sx-pagehead__desc">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="sx-shop">
        <div className="sx-wrap sx-gift__layout">
          <aside className="sx-gift__tips" aria-label="Buying tips">
            <p className="sx-eyebrow">Counter advice</p>
            <ul>
              {gift.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </aside>
          {products.length ? (
            <div className="sx-grid sx-gift__grid">
              {products.map((product, index) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  loading={index < 8 ? 'eager' : undefined}
                  quickAdd
                />
              ))}
            </div>
          ) : (
            <Restocking title={gift.title} />
          )}
        </div>
      </section>

      <section className="sx-guide">
        <div className="sx-wrap">
          <p className="sx-eyebrow">More gift guides</p>
          <nav className="sx-guide__next" aria-label="More gift guides">
            {others.map((g) => (
              <Link
                key={g.slug}
                to={`/gifts/${g.slug}`}
                className="sx-guide__chip sx-guide__chip--gift"
                prefetch="intent"
              >
                {g.short}
              </Link>
            ))}
            <Link to="/tees" className="sx-guide__chip" prefetch="intent">
              Every shirt
            </Link>
          </nav>
        </div>
      </section>
    </div>
  );
}

const GIFT_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query GiftProducts(
    $query: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, query: $query, sortKey: BEST_SELLING) {
      nodes {
        ...ProductItem
      }
    }
  }
` as const;
