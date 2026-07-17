import {useEffect, useState} from 'react';
import {Badge} from '~/components/brand/Brand';
import {track} from '~/lib/analytics';

const SEEN_KEY = 'sx-email-modal-seen';
const DELAY_MS = 25000;

/**
 * One email capture per session. Fires on desktop exit-intent (cursor leaves
 * toward the top of the window) or after a delay on touch devices. Easy to
 * dismiss; never shows twice in a session. "Early access" positioning — honest,
 * no fabricated incentive claims.
 */
export function EmailModal() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

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
        {done ? (
          <>
            <h2 className="sx-modal__title">You&rsquo;re In.</h2>
            <p>
              Welcome to the Schmucks. New drops will hit your inbox first — our
              condolences in advance.
            </p>
          </>
        ) : (
          <>
            <h2 className="sx-modal__title">Get In Early, Idiot</h2>
            <p style={{marginBottom: '1.25rem'}}>
              Join the list for early access to weekly drops before they sell out
              to smarter people.
            </p>
            <form
              className="sx-join__form"
              onSubmit={(e) => {
                e.preventDefault();
                track('newsletter_signup', {location: 'exit_modal'});
                setDone(true);
              }}
              aria-label="Email signup"
            >
              <input
                className="sx-join__input"
                type="email"
                required
                placeholder="you@regrets.com"
                aria-label="Email address"
                style={{boxShadow: '3px 3px 0 var(--ink)'}}
              />
              <button className="sx-btn sx-btn--ketchup" type="submit">
                Sign Me Up
              </button>
            </form>
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
