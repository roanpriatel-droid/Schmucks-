import {useId, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {Money, ShopPayButton, type MappedProductOptions} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {NotifyMe} from '~/components/product/NotifyMe';
import {track} from '~/lib/analytics';
import type {ProductFragment} from 'storefrontapi.generated';

type Variant = ProductFragment['selectedOrFirstAvailableVariant'];

/**
 * Fabric chips for the colourway. The three Printify colours map onto the
 * locked palette exactly — Natural is the cream, Black is the ink, Gold is the
 * mustard — so the swatches are the brand, not a new colour system.
 */
const CHIP: Record<string, string> = {
  natural: 'var(--cream-shade)',
  black: 'var(--ink)',
  gold: 'var(--mustard)',
  white: '#ffffff',
};

function chipColor(name: string) {
  return CHIP[name.trim().toLowerCase()] ?? 'var(--cream-shade)';
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export function BuyBox({
  productOptions,
  selectedVariant,
  productTitle,
  productId,
  storeDomain,
  walletsEnabled,
  onOpenSizeGuide,
  onSizeChosen,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: Variant;
  productTitle: string;
  productId: string;
  storeDomain: string;
  /** Only render express checkout if the shop actually offers a wallet. */
  walletsEnabled: boolean;
  onOpenSizeGuide: () => void;
  /** Fires the first time a size is picked, so the sticky bar can arm. */
  onSizeChosen: () => void;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const sizeGroupRef = useRef<HTMLFieldSetElement>(null);
  const [sizeError, setSizeError] = useState(false);
  const errorId = useId();

  const colorOption = productOptions.find(
    (option) => option.name.toLowerCase() === 'color',
  );
  const sizeOption = productOptions.find(
    (option) => option.name.toLowerCase() === 'size',
  );

  // A size is only "chosen" once the shopper picks one; Hydrogen preselects
  // the first available variant, so intent is tracked separately.
  const [sizeTouched, setSizeTouched] = useState(false);
  const sizeReady = sizeTouched || !sizeOption;

  const available = Boolean(selectedVariant?.availableForSale);
  const compareAt = selectedVariant?.compareAtPrice;
  const currencyCode = selectedVariant?.price?.currencyCode;
  const onSale =
    compareAt &&
    Number(compareAt.amount) > Number(selectedVariant?.price?.amount ?? 0);

  function goToVariant(uriQuery: string) {
    void navigate(`?${uriQuery}`, {replace: true, preventScrollReset: true});
  }

  function handleUnsizedAttempt() {
    setSizeError(true);
    sizeGroupRef.current?.scrollIntoView({block: 'center', behavior: 'smooth'});
    const firstSize = sizeGroupRef.current?.querySelector('button');
    (firstSize as HTMLButtonElement | undefined)?.focus();
  }

  return (
    <div className="sx-buybox">
      <div className="sx-buybox__price">
        {selectedVariant?.price ? (
          <span className="sx-buybox__now sx-display">
            <Money data={selectedVariant.price} />
          </span>
        ) : null}
        {onSale && compareAt ? (
          <s className="sx-buybox__was">
            <Money data={compareAt} />
          </s>
        ) : null}
        {/* The shop is Canada-based and prices in USD only, but ships to 32
            zones. A bare "$42.00" reads as their own dollar to most of the
            world, so the currency is stated once, next to the price. */}
        <span className="sx-buybox__tax">
          {currencyCode ? `${currencyCode} · ` : ''}Taxes and shipping at
          checkout
        </span>
      </div>

      {colorOption && colorOption.optionValues.length > 1 ? (
        <fieldset className="sx-opt">
          <legend className="sx-opt__legend">
            Colourway
            <span className="sx-opt__chosen">
              {colorOption.optionValues.find((value) => value.selected)?.name}
            </span>
          </legend>
          <div className="sx-chips" role="group" aria-label="Colourway">
            {colorOption.optionValues.map((value) => (
              <button
                type="button"
                key={value.name}
                className={`sx-chip-swatch ${value.selected ? 'is-on' : ''}`}
                aria-pressed={value.selected}
                disabled={!value.exists}
                title={value.name}
                onClick={() => {
                  if (!value.selected) goToVariant(value.variantUriQuery);
                }}
              >
                <span
                  className="sx-chip-swatch__fabric"
                  style={{background: chipColor(value.name)}}
                  aria-hidden="true"
                />
                <span className="sx-chip-swatch__label">{value.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {sizeOption && sizeOption.optionValues.length > 1 ? (
        <fieldset className="sx-opt" ref={sizeGroupRef}>
          <legend className="sx-opt__legend">
            Size
            <button
              type="button"
              className="sx-opt__guide"
              onClick={onOpenSizeGuide}
            >
              Size guide
            </button>
          </legend>
          <div
            className="sx-sizes"
            role="group"
            aria-label="Size"
            aria-describedby={sizeError ? errorId : undefined}
          >
            {[...sizeOption.optionValues]
              .sort(
                (a, b) => SIZE_ORDER.indexOf(a.name) - SIZE_ORDER.indexOf(b.name),
              )
              .map((value) => (
                <button
                  type="button"
                  key={value.name}
                  className={`sx-size ${value.selected && sizeTouched ? 'is-on' : ''}`}
                  aria-pressed={value.selected && sizeTouched}
                  disabled={!value.exists}
                  onClick={() => {
                    setSizeTouched(true);
                    setSizeError(false);
                    onSizeChosen();
                    if (!value.selected) goToVariant(value.variantUriQuery);
                  }}
                >
                  {value.name}
                  {!value.available ? (
                    <span className="sx-visually-hidden"> (sold out)</span>
                  ) : null}
                </button>
              ))}
          </div>
          {sizeError ? (
            <p className="sx-size-error" id={errorId} role="alert">
              Pick a size, schmuck (affectionate).
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div className="sx-buybox__actions">
        {available ? (
          sizeReady ? (
            <AddToCartButton
              disabled={!selectedVariant}
              onClick={() => {
                track('add_to_cart', {
                  variant_id: selectedVariant?.id,
                  price: selectedVariant?.price?.amount,
                });
                open('cart');
              }}
              lines={
                selectedVariant
                  ? [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity: 1,
                        selectedVariant,
                      },
                    ]
                  : []
              }
            >
              Add to cart —{' '}
              {selectedVariant?.price ? (
                <Money data={selectedVariant.price} />
              ) : null}
            </AddToCartButton>
          ) : (
            // Before a size is chosen the button is real but refuses, so the
            // shopper gets the nudge instead of a silently wrong variant.
            <button
              type="button"
              className="sx-btn sx-btn--ketchup sx-buybox__atc"
              onClick={handleUnsizedAttempt}
            >
              Add to cart —{' '}
              {selectedVariant?.price ? (
                <Money data={selectedVariant.price} />
              ) : null}
            </button>
          )
        ) : (
          <div className="sx-oos">
            <p className="sx-oos__title sx-display">Gone. Like our dignity.</p>
            <p className="sx-oos__body">
              This colourway and size is out of print. Tell us where to reach
              you and we&rsquo;ll shout when it&rsquo;s back.
            </p>
            <NotifyMe
              productTitle={productTitle}
              variantTitle={selectedVariant?.title}
              productId={productId}
            />
          </div>
        )}

        {available && walletsEnabled && selectedVariant?.id ? (
          <div className="sx-express">
            <span className="sx-express__label">or check out straight away</span>
            <ShopPayButton
              variantIdsAndQuantities={[
                {id: selectedVariant.id, quantity: 1},
              ]}
              storeDomain={storeDomain}
              className="sx-express__button"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
