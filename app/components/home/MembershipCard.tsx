import {Badge} from '~/components/brand/Brand';
import {NewsletterForm} from '~/components/NewsletterForm';

/**
 * Email capture, dressed as a membership card for the Community of Idiots.
 * Posts to /api/newsletter like every signup form: the card is only
 * "issued" once Shopify has subscribed the address.
 */
export function MembershipCard() {
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

            <NewsletterForm
              location="membership_card"
              className="sx-member__form"
              inputClassName="sx-member__input"
              buttonLabel="Issue my card"
              buttonClassName="sx-btn sx-btn--ink"
              done={
                <div className="sx-form-success" role="status">
                  <div className="sx-form-success__title">
                    Card issued. Welcome to the membership.
                  </div>
                  <p>
                    Nothing arrives until the next drop. That&rsquo;s the whole
                    arrangement.
                  </p>
                </div>
              }
            />

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
