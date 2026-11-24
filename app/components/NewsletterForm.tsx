import {useEffect, useId, useRef, type ReactNode} from 'react';
import {useFetcher} from 'react-router';
import {track} from '~/lib/analytics';
import type {NewsletterResult} from '~/routes/api.newsletter';

/**
 * The one newsletter form. Posts to `/api/newsletter`, which subscribes the
 * address in Shopify — success is only shown once Shopify has accepted it.
 */
export function NewsletterForm({
  location,
  className,
  inputClassName,
  inputStyle,
  buttonLabel,
  done,
}: {
  /** Analytics label: where on the site the signup happened. */
  location: string;
  className?: string;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  buttonLabel: string;
  /** What to render once subscribed. */
  done: ReactNode;
}) {
  const fetcher = useFetcher<NewsletterResult>({key: `newsletter-${location}`});
  const id = useId();
  const tracked = useRef(false);
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data;

  useEffect(() => {
    if (result?.ok && !tracked.current) {
      tracked.current = true;
      track('newsletter_signup', {location});
    }
  }, [result, location]);

  if (result?.ok) return <>{done}</>;

  return (
    <fetcher.Form
      method="post"
      action="/api/newsletter"
      className={className}
      aria-label="Newsletter signup"
      aria-describedby={result && !result.ok ? `${id}-error` : undefined}
    >
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <input
        id={`${id}-email`}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@regrets.com"
        className={inputClassName}
        style={inputStyle}
        aria-invalid={result && !result.ok ? true : undefined}
      />
      {/* Honeypot — hidden from people and assistive tech. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{position: 'absolute', left: '-10000px', width: 1, height: 1}}
      />
      <button className="sx-btn sx-btn--ketchup" type="submit" disabled={busy}>
        {busy ? 'Signing…' : buttonLabel}
      </button>
      {result && !result.ok ? (
        <p id={`${id}-error`} role="alert" className="sx-newsletter__error">
          {result.error}
        </p>
      ) : null}
    </fetcher.Form>
  );
}
