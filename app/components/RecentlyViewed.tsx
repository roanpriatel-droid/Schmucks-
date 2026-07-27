import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {splitTitle} from '~/lib/productCopy';

const KEY = 'sx:recently-viewed';
const LIMIT = 8;

export type RecentProduct = {
  handle: string;
  title: string;
  image?: {url: string; altText?: string | null} | null;
  price?: {amount: string; currencyCode: CurrencyCode} | null;
};

function read(): RecentProduct[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentProduct[]) : [];
  } catch {
    return [];
  }
}

/**
 * Records a product view locally. Deliberately localStorage-only — no
 * identifiers leave the browser, so this needs no consent banner.
 */
export function useRecordRecentlyViewed(product: RecentProduct) {
  useEffect(() => {
    if (!product.handle) return;
    try {
      const next = [
        product,
        ...read().filter((item) => item.handle !== product.handle),
      ].slice(0, LIMIT);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Private mode or storage disabled — the row simply won't appear.
    }
  }, [product.handle, product.title, product.image?.url, product.price?.amount]);
}

/** Renders the row, minus whatever product you're currently looking at. */
export function RecentlyViewed({exclude}: {exclude?: string}) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    setItems(read().filter((item) => item.handle !== exclude));
  }, [exclude]);

  if (items.length < 2) return null;

  return (
    <section className="sx-recent" aria-labelledby="sx-recent-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">You Were Just Looking At</p>
            <h2 className="sx-section-title" id="sx-recent-title">
              Unfinished business
            </h2>
          </div>
        </div>
        <ul className="sx-recent__rail">
          {items.map((item) => (
            <li key={item.handle}>
              <Link
                className="sx-recent__item"
                to={`/products/${item.handle}`}
                prefetch="intent"
              >
                <span className="sx-recent__media">
                  {item.image?.url ? (
                    <Image
                      data={{url: item.image.url, altText: item.image.altText}}
                      alt={item.image.altText || item.title}
                      aspectRatio="1/1"
                      sizes="160px"
                      loading="lazy"
                    />
                  ) : null}
                </span>
                <span className="sx-recent__name">{splitTitle(item.title).displayTitle}</span>
                {item.price ? (
                  <span className="sx-recent__price sx-display">
                    <Money data={item.price} />
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
