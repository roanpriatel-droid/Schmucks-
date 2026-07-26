import {useState} from 'react';
import {Badge} from '~/components/brand/Brand';
import {track} from '~/lib/analytics';

/**
 * Email capture, dressed as a membership card for the Community of Idiots.
 * Same honest mechanics as the rest of the site: the success state is
 * client-side only until a real ESP is wired (see NEEDS_INPUT.md), so it
 * promises nothing it can't deliver.
 */
export function MembershipCard() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="sx-member" aria-labelledby="sx-member-title">
      <div className="sx-wrap">
        <div className="sx-member__card">
          <div className="sx-member__stub">
            <Badge className="sx-member__badge" />
            <span className="sx-member__stub-no">NO. 0000</span>
          </div>

          <div className="sx-member__body">
            <p className="sx-member__kicker">Membership Card</p>
            <h2 className="sx-member__title sx-display" id="sx-member-title">
              Community of Idiots
            </h2>
            <p className="sx-member__sub">
              Drops land weekly and the good ones go first. Put your email on
              the card and we&rsquo;ll tell you before the smart people find
              out.
            </p>

            {submitted ? (
              <div className="sx-form-success" role="status">
                <div className="sx-form-success__title">
                  Card issued. Welcome to the membership.
                </div>
                <p>
                  Nothing arrives until the next drop. That&rsquo;s the whole
                  arrangement.
                </p>
              </div>
            ) : (
              <form
                className="sx-member__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  track('newsletter_signup', {location: 'membership_card'});
                  setSubmitted(true);
                }}
                aria-label="Membership signup"
              >
                <label className="sx-visually-hidden" htmlFor="member-email">
                  Email address
                </label>
                <input
                  id="member-email"
                  className="sx-member__input"
                  type="email"
                  required
                  placeholder="you@regrets.com"
                />
                <button className="sx-btn sx-btn--ink" type="submit">
                  Issue my card
                </button>
              </form>
            )}

            <dl className="sx-member__terms">
              <div>
                <dt>Member no.</dt>
                <dd>Assigned on arrival</dd>
              </div>
              <div>
                <dt>Benefits</dt>
                <dd>Early word on drops</dd>
              </div>
              <div>
                <dt>Dues</dt>
                <dd>None. Obviously.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
