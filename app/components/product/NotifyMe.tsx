import {useState} from 'react';
import {CONTACT_EMAIL} from '~/data/commerce';
import {track} from '~/lib/analytics';

/**
 * Out-of-stock capture.
 *
 * There's no ESP wired, so rather than pretend a list exists this composes a
 * real restock request to the shop inbox — the shopper keeps a copy and we can
 * actually answer. Swap the submit handler for an ESP call when one exists
 * (NEEDS_INPUT.md); the markup won't need to change.
 */
export function NotifyMe({
  productTitle,
  variantTitle,
  productId,
}: {
  productTitle: string;
  variantTitle?: string;
  productId: string;
}) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const subject = `Restock me: ${productTitle}${variantTitle ? ` (${variantTitle})` : ''}`;
  const body = [
    `Please tell me when this is back:`,
    `Product: ${productTitle}`,
    variantTitle ? `Variant: ${variantTitle}` : '',
    `Reference: ${productId}`,
    '',
    `Email: ${email}`,
  ]
    .filter(Boolean)
    .join('\n');

  if (sent) {
    return (
      <p className="sx-notify__done" role="status">
        Noted. We&rsquo;ll shout when it&rsquo;s back on the press.
      </p>
    );
  }

  return (
    <form
      className="sx-notify"
      onSubmit={(event) => {
        event.preventDefault();
        track('notify_me', {product_id: productId, variant: variantTitle});
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
          subject,
        )}&body=${encodeURIComponent(body)}`;
        setSent(true);
      }}
    >
      <label className="sx-visually-hidden" htmlFor="notify-email">
        Email address for restock notice
      </label>
      <input
        id="notify-email"
        className="sx-notify__input"
        type="email"
        required
        placeholder="you@regrets.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button className="sx-btn sx-btn--ink" type="submit">
        Tell me when
      </button>
    </form>
  );
}
