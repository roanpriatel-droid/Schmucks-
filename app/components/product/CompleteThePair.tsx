import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import {STACK_TIERS} from '~/data/commerce';
import {splitTitle} from '~/lib/productCopy';
import {track} from '~/lib/analytics';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';

export type PairPartner = {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  selectedOrFirstAvailableVariant?: {
    id: string;
    availableForSale: boolean;
    price: {amount: string; currencyCode: CurrencyCode};
  } | null;
};

/**
 * The real pair block: this shirt and its other half, side by side, with one
 * button that adds both. Pairs are consecutive catalogue numbers inside The
 * Pair Programme (018 ↔ 019), matched in the loader.
 */
export function CompleteThePair({
  thisProduct,
  partner,
}: {
  thisProduct: PairPartner;
  partner: PairPartner;
}) {
  const {open} = useAside();
  const mine = thisProduct.selectedOrFirstAvailableVariant;
  const theirs = partner.selectedOrFirstAvailableVariant;
  const bothAvailable = Boolean(mine?.availableForSale && theirs?.availableForSale);

  const combined =
    mine && theirs
      ? {
          amount: (Number(mine.price.amount) + Number(theirs.price.amount)).toFixed(2),
          currencyCode: mine.price.currencyCode,
        }
      : null;

  const firstTier = STACK_TIERS[0];

  return (
    <section className="sx-pairblock" aria-labelledby="sx-pairblock-title">
      <div className="sx-wrap">
        <div className="sx-section-head sx-section-head--onink">
          <div>
            <p className="sx-eyebrow sx-eyebrow--mustard">Complete The Pair</p>
            <h2 className="sx-section-title" id="sx-pairblock-title">
              This one has another half
            </h2>
          </div>
          <p className="sx-section-note">
            Add both and Stack &amp; Save takes {firstTier.percent}% off at
            checkout, on its own.
          </p>
        </div>

        <div className="sx-pairblock__pair">
          {[thisProduct, partner].map((product, index) => {
            const {displayTitle} = splitTitle(product.title);
            return (
              <Link
                className="sx-pairblock__half"
                key={product.id}
                to={`/products/${product.handle}`}
                prefetch="intent"
              >
                <span className="sx-pairblock__tag">
                  {index === 0 ? 'This one' : 'Its other half'}
                </span>
                <span className="sx-pairblock__media">
                  {product.featuredImage ? (
                    <Image
                      data={product.featuredImage}
                      alt={product.featuredImage.altText || displayTitle}
                      aspectRatio="1/1"
                      sizes="(min-width: 900px) 320px, 45vw"
                      loading="lazy"
                    />
                  ) : null}
                </span>
                <span className="sx-pairblock__name">{displayTitle}</span>
              </Link>
            );
          })}
          <span className="sx-pairblock__amp sx-display" aria-hidden="true">
            &amp;
          </span>
        </div>

        <div className="sx-pairblock__buy">
          {bothAvailable && mine && theirs ? (
            <AddToCartButton
              onClick={() => {
                track('add_to_cart', {source: 'complete_the_pair', pair: 2});
                open('cart');
              }}
              lines={[
                {merchandiseId: mine.id, quantity: 1},
                {merchandiseId: theirs.id, quantity: 1},
              ]}
            >
              Add both{combined ? <> — <Money data={combined} /></> : null}
            </AddToCartButton>
          ) : (
            <p className="sx-pairblock__oos">
              One half of this pair is out of print right now.
            </p>
          )}
          <p className="sx-pairblock__note">
            Sizes are chosen per shirt in the cart — they don&rsquo;t have to
            match, and frankly they rarely do.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Fallback cross-sell for products with no mapped pair: other shirts from the
 * Pair Programme shelf.
 */
export function PairSuggestions({
  products,
}: {
  products: CollectionItemFragment[];
}) {
  if (!products.length) return null;

  return (
    <section className="sx-crosssell" aria-labelledby="sx-pairsuggest-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">Complete The Pair</p>
            <h2 className="sx-section-title" id="sx-pairsuggest-title">
              Pair it with
            </h2>
          </div>
          <p className="sx-section-note">
            Any two shirts unlock {STACK_TIERS[0].percent}% off — the discount
            applies itself at checkout.
          </p>
        </div>
        <Reveal className="sx-grid">
          {products.slice(0, 4).map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 2 ? 'eager' : 'lazy'}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
