import {Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import type {CollectionItemFragment} from 'storefrontapi.generated';

/** Four more from the shelf this product belongs to. */
export function MoreFromShelf({
  products,
  shelfTitle,
  shelfHandle,
}: {
  products: CollectionItemFragment[];
  shelfTitle: string;
  shelfHandle: string;
}) {
  if (!products.length) return null;

  return (
    <section className="sx-moreshelf" aria-labelledby="sx-moreshelf-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">More From This Shelf</p>
            <h2 className="sx-section-title" id="sx-moreshelf-title">
              {shelfTitle}
            </h2>
          </div>
          <Link className="sx-btn sx-btn--ghost" to={`/collections/${shelfHandle}`}>
            See the whole shelf
          </Link>
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
