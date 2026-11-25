import {useEffect, useState} from 'react';
import {useFetcher} from 'react-router';
import {Badge} from '~/components/brand/Brand';
import {NewsletterForm} from '~/components/NewsletterForm';
import type {NewsletterResult} from '~/routes/api.newsletter';

const SEEN_KEY = 'sx-email-modal-seen';
const DELAY_MS = 25000;
const MODAL_LOCATION = 'exit_modal';

/**
 * One email capture per session. Fires on desktop exit-intent (cursor leaves
 * toward the top of the window) or after a delay on touch devices. Easy to
 * dismiss; never shows twice in a session. "Early access" positioning — honest,
 * no fabricated incentive claims.
 */
export function EmailModal() {
  const [open, setOpen] = useState(false);
  // Same fetcher key NewsletterForm uses, so the modal can swap to its thank-you.
  const signup = useFetcher<NewsletterResult>({key: `newsletter-${MODAL_LOCATION}`});
  const subscribed = signup.data?.ok === true;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      seen = false;
    }
    if (seen) return;

    const markSeen = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* ignore */
      }
    };

    const show = () => {
      setOpen(true);
      markSeen();
      cleanup();
    };

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    const timer = window.setTimeout(show, DELAY_MS);
    document.addEventListener('mouseout', onLeave);

    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onLeave);
    }
    return cleanup;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="sx-modal" role="dialog" aria-modal="true" aria-label="Join the Schmucks">
      <button className="sx-modal__scrim" aria-label="Close" onClick={() => setOpen(false)} />
      <div className="sx-modal__panel" style={{textAlign: 'center'}}>
        <button className="sx-modal__close" onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>
        <div style={{display: 'grid', placeItems: 'center', marginBottom: '0.75rem'}}>
          <Badge className="sx-join__badge" />
        </div>
        {subscribed ? (
          <div role="status">
            <h2 className="sx-modal__title">You&rsquo;re In.</h2>
            <p>
              Welcome to the Schmucks. New drops will hit your inbox first — our
              condolences in advance.
            </p>
          </div>
        ) : (
          <>
            <h2 className="sx-modal__title">Get In Early, Idiot</h2>
            <p style={{marginBottom: '1.25rem'}}>
              Join the list for early access to weekly drops before they sell
              out to smarter people.
            </p>
            <NewsletterForm
              location={MODAL_LOCATION}
              className="sx-join__form"
              inputClassName="sx-join__input"
              inputStyle={{boxShadow: '3px 3px 0 var(--ink)'}}
              buttonLabel="Sign Me Up"
              done={null}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: '1rem',
                background: 'none',
                border: 0,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.8rem',
                opacity: 0.7,
              }}
            >
              No thanks, I enjoy missing out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
