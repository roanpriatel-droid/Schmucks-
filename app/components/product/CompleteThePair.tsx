import {Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {Reveal} from '~/components/Reveal';
import type {CollectionItemFragment} from 'storefrontapi.generated';

/**
 * "Complete The Pair" — the second half of a matching set.
 *
 * `source` tells the customer where the suggestion came from, because an
 * explicit pairing (from the pipeline's pairs mapping) and "other things on
 * the Pair Programme shelf" are different promises.
 */
export function CompleteThePair({
  products,
  source,
}: {
  products: CollectionItemFragment[];
  source: 'pairs' | 'shelf' | 'related';
}) {
  if (!products.length) return null;

  const copy = {
    pairs: {
      eyebrow: 'Complete the Pair',
      title: 'Its Other Half',
      note: 'This one was made to be worn next to that one. Add both and Stack & Save takes 10% off at checkout.',
    },
    shelf: {
      eyebrow: 'Complete the Pair',
      title: 'Pair It With',
      note: 'From The Pair Programme shelf. Any two shirts unlock 10% off — the discount applies itself at checkout.',
    },
    related: {
      eyebrow: 'Complete the Pair',
      title: 'You May Also Regret',
      note: 'Add a second shirt and Stack & Save takes 10% off automatically.',
    },
  }[source];

  return (
    <section className="sx-crosssell" aria-labelledby="sx-pair-cross-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">{copy.eyebrow}</p>
            <h2 className="sx-section-title" id="sx-pair-cross-title">
              {copy.title}
            </h2>
          </div>
          <p className="sx-section-note">{copy.note}</p>
        </div>
        <Reveal className="sx-grid">
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 4 ? 'eager' : undefined}
            />
          ))}
        </Reveal>
        <div className="sx-specials__cta">
          <Link className="sx-btn sx-btn--ghost" to="/matching-sets">
            How the Pair Programme works
          </Link>
        </div>
      </div>
    </section>
  );
}
