/**
 * Live Stack & Save progress meter for the cart.
 *
 * NOTE: this is motivational UI only. The actual discount must be configured as
 * a Shopify *automatic discount* (2+ = 10%, 3 = 20%, 4+ = 30%) so it applies at
 * checkout. Until that's set up in the Shopify admin, this shows the unlock
 * progress but the subtotal won't change on its own.
 */
const TIERS = [
  {qty: 2, pct: 10},
  {qty: 3, pct: 20},
  {qty: 4, pct: 30},
];
const MAX_QTY = 4;

export function StackProgress({quantity}: {quantity: number}) {
  if (!quantity) return null;

  const current = [...TIERS].reverse().find((t) => quantity >= t.qty);
  const next = TIERS.find((t) => quantity < t.qty);
  const fill = Math.min(quantity / MAX_QTY, 1) * 100;
  const maxed = quantity >= MAX_QTY;

  let msg: string;
  if (maxed) {
    msg = `Maxed out — 30% off. A fully committed idiot.`;
  } else if (next && current) {
    const more = next.qty - quantity;
    msg = `Saving ${current.pct}% · Add ${more} more to save ${next.pct}%`;
  } else if (next) {
    const more = next.qty - quantity;
    msg = `Add ${more} more shirt${more > 1 ? 's' : ''} to save ${next.pct}%`;
  } else {
    msg = 'Stack & save';
  }

  return (
    <div className="sx-stackbar" aria-live="polite">
      <div className="sx-stackbar__msg">
        <span className="sx-stars">★</span>
        {msg}
      </div>
      <div
        className="sx-stackbar__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={MAX_QTY}
        aria-valuenow={Math.min(quantity, MAX_QTY)}
      >
        <div
          className={`sx-stackbar__fill ${maxed ? 'sx-stackbar__fill--max' : ''}`}
          style={{width: `${fill}%`}}
        />
      </div>
      <div className="sx-stackbar__ticks">
        <span>1</span>
        <span>2 · 10%</span>
        <span>3 · 20%</span>
        <span>4+ · 30%</span>
      </div>
    </div>
  );
}
