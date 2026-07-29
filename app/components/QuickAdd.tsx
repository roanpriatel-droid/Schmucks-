import {useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {track} from '~/lib/analytics';

export type QuickAddVariant = {
  id: string;
  availableForSale: boolean;
  selectedOptions: Array<{name: string; value: string}>;
};

/**
 * Size-first quick add on collection cards.
 *
 * Every design comes in one price and a full size run, so the only decision
 * blocking an add-to-cart from a listing is size — this asks that one question
 * inline and skips the product page. Colour stays on the PDP, where the
 * shopper can actually see it.
 */
export function QuickAdd({
  variants,
  productTitle,
}: {
  variants: QuickAddVariant[];
  productTitle: string;
}) {
  const {open} = useAside();
  const [chosen, setChosen] = useState<string | null>(null);
  // Collapsed by default. A permanently-open six-button size grid on every
  // card cost ~66px of height each and repeated "S M L XL 2XL 3XL" 24 times a
  // page, which pushed the grid down to barely two products per phone screen.
  const [open_, setOpen] = useState(false);

  const sizes = variants
    .map((variant) => ({
      variant,
      size: variant.selectedOptions.find(
        (option) => option.name.toLowerCase() === 'size',
      )?.value,
    }))
    .filter(
      (entry): entry is {variant: QuickAddVariant; size: string} =>
        Boolean(entry.size),
    );

  // De-duplicate sizes across colourways, preferring an in-stock variant.
  const bySize = new Map<string, QuickAddVariant>();
  for (const {variant, size} of sizes) {
    const existing = bySize.get(size);
    if (!existing || (!existing.availableForSale && variant.availableForSale)) {
      bySize.set(size, variant);
    }
  }

  const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const entries = [...bySize.entries()].sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );

  if (!entries.length) return null;

  const selected = chosen ? bySize.get(chosen) : undefined;

  return (
    <div className="sx-quickadd">
      {!open_ ? (
        <button
          type="button"
          className="sx-quickadd__toggle"
          onClick={() => setOpen(true)}
          aria-expanded={false}
        >
          Quick add
        </button>
      ) : null}

      <div
        className="sx-quickadd__sizes"
        role="group"
        aria-label={`Choose a size for ${productTitle}`}
        hidden={!open_}
      >
        {entries.map(([size, variant]) => (
          <button
            type="button"
            key={size}
            className={`sx-quickadd__size ${chosen === size ? 'is-on' : ''}`}
            disabled={!variant.availableForSale}
            aria-pressed={chosen === size}
            onClick={() => setChosen(size === chosen ? null : size)}
          >
            {size}
          </button>
        ))}
      </div>

      {open_ ? (
      <AddToCartButton
        disabled={!selected?.availableForSale}
        onClick={() => {
          if (!selected) return;
          track('add_to_cart', {variant_id: selected.id, source: 'quick_add'});
          open('cart');
        }}
        lines={
          selected
            ? [{merchandiseId: selected.id, quantity: 1}]
            : []
        }
      >
        {chosen ? `Add ${chosen}` : 'Pick a size'}
      </AddToCartButton>
      ) : null}
    </div>
  );
}
