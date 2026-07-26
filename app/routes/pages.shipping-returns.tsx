import type {Route} from './+types/pages.shipping-returns';
import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Reveal} from '~/components/Reveal';
import {Mel} from '~/components/brand/Brand';
import {
  CONTACT_EMAIL,
  FREE_SHIPPING_THRESHOLD,
  RETURNS_DAYS,
} from '~/data/commerce';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Shipping & Returns',
    description: `How a Schmucks order gets made, packed and shipped, what free shipping over $${FREE_SHIPPING_THRESHOLD} means, and how to send a shirt back within ${RETURNS_DAYS} days.`,
    path: '/pages/shipping-returns',
  });

/**
 * Deliberately free of invented transit times. Print-on-demand production plus
 * courier time is genuinely variable and we have no confirmed SLA — so this
 * explains the process precisely and says what to do when it goes wrong,
 * rather than promising a number the shop can't keep (NEEDS_INPUT.md).
 */
const STAGES = [
  {
    n: '01',
    title: 'You order',
    body: 'Your shirt does not exist yet. That is on purpose — nothing is printed until somebody actually wants it, which is why there is no dusty warehouse stock and no seasonal landfill.',
  },
  {
    n: '02',
    title: 'We print it',
    body: 'The design goes onto a blank in your size and colourway, then gets checked, folded and bagged. This is the step that takes the time. It is also the step that makes the shirt good.',
  },
  {
    n: '03',
    title: 'It ships',
    body: 'You get a tracking number the moment it leaves. From there it is in the courier’s hands, and the courier does not take our calls any faster than it takes yours.',
  },
];

export default function ShippingReturns() {
  return (
    <div className="sx-shipping">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Shipping & Returns'}]} />
          <p className="sx-pagehead__eyebrow">Getting It To You, Getting It Back</p>
          <h1 className="sx-pagehead__title">Shipping &amp; Returns</h1>
          <p className="sx-pagehead__desc">
            Printed to order, shipped worldwide, returnable for{' '}
            {RETURNS_DAYS} days. The whole arrangement, in plain language.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap">
          <div className="sx-shipcards">
            <div className="sx-shipcard sx-shipcard--hero">
              <p className="sx-shipcard__label">Free shipping</p>
              <p className="sx-shipcard__value sx-display">
                Over ${FREE_SHIPPING_THRESHOLD}
              </p>
              <p className="sx-shipcard__note">
                Applied automatically at checkout. Below that, the exact rate is
                calculated before you pay — no surprise line items.
              </p>
            </div>
            <div className="sx-shipcard">
              <p className="sx-shipcard__label">Ships to</p>
              <p className="sx-shipcard__value sx-display">Most places</p>
              <p className="sx-shipcard__note">
                International orders are welcome. Any duties or import charges
                are set by your country, not by us.
              </p>
            </div>
            <div className="sx-shipcard">
              <p className="sx-shipcard__label">Returns window</p>
              <p className="sx-shipcard__value sx-display">
                {RETURNS_DAYS} days
              </p>
              <p className="sx-shipcard__note">
                Unworn, unwashed, still itself. One gentle question, maybe.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sx-page" aria-labelledby="sx-stages-title">
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">What Actually Happens</p>
              <h2 className="sx-section-title" id="sx-stages-title">
                Order to doorstep
              </h2>
            </div>
            <p className="sx-section-note">
              We would rather explain the process than invent a delivery date we
              can’t control.
            </p>
          </div>
          <Reveal className="sx-steps">
            {STAGES.map((stage) => (
              <div className="sx-step" key={stage.n}>
                <div className="sx-step__n sx-display">{stage.n}</div>
                <h3 className="sx-step__title">{stage.title}</h3>
                <p className="sx-step__body">{stage.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="sx-page" aria-labelledby="sx-returns-title">
        <div className="sx-wrap sx-returns">
          <div>
            <p className="sx-eyebrow">Sending One Back</p>
            <h2 className="sx-section-title" id="sx-returns-title">
              Returns, without the interrogation
            </h2>
            <ol className="sx-returns__steps">
              <li>
                <strong>Email us.</strong> Send your order number to{' '}
                <a className="sx-inline-link" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>{' '}
                within {RETURNS_DAYS} days of it arriving, and say what went
                wrong. &ldquo;It didn’t suit me&rdquo; is a complete answer.
              </li>
              <li>
                <strong>We reply with instructions.</strong> Where to send it,
                and what to put in the box. Don’t post anything back before you
                hear from us — untracked returns get lost and then we’re both
                sad.
              </li>
              <li>
                <strong>You get sorted.</strong> Refund to the original payment
                method, or a swap for a different size or design if you’d
                rather.
              </li>
            </ol>
          </div>
          <aside className="sx-returns__aside">
            <Mel className="sx-returns__mel" />
            <h3 className="sx-returns__asidetitle">Two honest caveats</h3>
            <p>
              <strong>Worn or washed shirts can’t come back.</strong> Once it’s
              been out in the world it belongs to the world.
            </p>
            <p>
              <strong>Wrong or faulty is different.</strong> If we sent the
              wrong thing, or the print cracked, that’s our mistake and our
              cost. Tell us and we’ll replace it.
            </p>
          </aside>
        </div>
      </section>

      <section className="sx-page sx-shipping__foot">
        <div className="sx-wrap">
          <p>
            The binding legal wording lives in the shop{' '}
            <Link className="sx-inline-link" to="/policies">
              policies
            </Link>
            . Sizing questions are answered on the{' '}
            <Link className="sx-inline-link" to="/pages/size-guide">
              size guide
            </Link>
            , and everything else is probably in the{' '}
            <Link className="sx-inline-link" to="/pages/faq">
              FAQ
            </Link>
            .
          </p>
          <div className="sx-about__ctas">
            <Link className="sx-btn sx-btn--ketchup" to="/pages/contact">
              Ask about an order
            </Link>
            <Link className="sx-btn sx-btn--ghost" to="/tees">
              Back to the shirts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
