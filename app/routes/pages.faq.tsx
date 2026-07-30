import type {Route} from './+types/pages.faq';
import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {MelShrug} from '~/components/brand/Brand';
import {
  BLANK,
  CONTACT_EMAIL,
  FREE_SHIPPING_LIVE,
  FREE_SHIPPING_THRESHOLD,
  US_SHIPPING_FROM,
  RETURNS_DAYS,
  SIZE_RUN,
  STACK_DISCOUNT_LIVE,
  STACK_TIERS,
} from '~/data/commerce';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'FAQ',
    description:
      'Sizing, shipping, returns and colourways — the questions you were about to email us, answered first.',
    path: '/pages/faq',
  });

const ladder = STACK_TIERS.map(
  (tier) => `${tier.quantity}${tier.quantity === 4 ? '+' : ''} = ${tier.percent}% off`,
).join(', ');

/**
 * Answers are grouped so the accordion is scannable. Every claim here is one
 * the shop can actually stand behind — where we don't have a real number
 * (courier transit times), the answer says so instead of inventing one.
 */
const GROUPS: Array<{
  group: string;
  items: Array<{q: string; a: React.ReactNode; plain: string}>;
}> = [
  {
    group: 'Sizing & fit',
    items: [
      {
        q: 'What size am I?',
        plain: `Every design comes in unisex ${SIZE_RUN} on a ${BLANK} blank, which runs true to size. The reliable trick: measure a t-shirt you already like flat across the chest, double it, and match that number on the size chart. Between sizes, or want it roomy? Size up.`,
        a: (
          <>
            Every design comes in unisex {SIZE_RUN} on a {BLANK} blank, which
            runs true to size. The reliable trick: lay a t-shirt you already
            like flat, measure across the chest, double it, and match that
            number on the{' '}
            <Link className="sx-inline-link" to="/pages/size-guide">
              size chart
            </Link>
            . Between sizes, or want it roomy? Size up.
          </>
        ),
      },
      {
        q: 'Do they shrink?',
        plain:
          'Cotton is cotton — expect a little shrinkage on the first hot wash, which is why we tell you to wash cold and hang dry. Do that and the fit you get is the fit you keep.',
        a: (
          <>
            Cotton is cotton — expect a little shrinkage on a hot wash, which is
            exactly why the{' '}
            <Link className="sx-inline-link" to="/pages/care">
              care guide
            </Link>{' '}
            says wash cold and hang dry. Do that and the fit you get is the fit
            you keep.
          </>
        ),
      },
      {
        q: 'What colours can I get?',
        plain:
          'Black and Natural on every design, plus Gold on a handful. The colour you pick changes how the print reads — Natural is warmer, Black is louder.',
        a: 'Black and Natural on every design, plus Gold on a handful of them. The colour changes how the print reads: Natural is warmer and softer, Black is louder. Both are the same blank underneath.',
      },
    ],
  },
  {
    group: 'Shipping',
    items: [
      {
        q: 'When will it arrive?',
        plain:
          'Every shirt is printed after you order it, so there is a production step before anything ships. Production time plus courier transit is what you wait. We would rather point you at the real tracking than promise a number we cannot control.',
        a: (
          <>
            Every shirt is printed <em>after</em> you order it, so there’s a
            production step before anything ships — that’s the trade for not
            warehousing thousands of shirts nobody wanted. You’ll get tracking
            as soon as it leaves. If an order is taking longer than feels
            reasonable,{' '}
            <Link className="sx-inline-link" to="/pages/contact">
              tell us
            </Link>{' '}
            and we’ll chase it.
          </>
        ),
      },
      {
        q: 'Do you ship to me?',
        plain:
          'Almost certainly. The store ships internationally. Rates and any duties are calculated at checkout before you pay.',
        a: (
          <>
            Almost certainly — the shop ships internationally. Rates are
            calculated at checkout before you pay anything, starting at $
            {US_SHIPPING_FROM.toFixed(2)} in the US. Full detail on the{' '}
            <Link className="sx-inline-link" to="/pages/shipping-returns">
              shipping &amp; returns
            </Link>{' '}
            page.
          </>
        ),
      },
    ],
  },
  {
    group: 'Returns & orders',
    items: [
      {
        q: 'What if it doesn’t fit?',
        plain: `You have ${RETURNS_DAYS} days to send an unworn shirt back. Email your order number and we will sort it out — no interrogation, maybe one gentle question.`,
        a: (
          <>
            You have {RETURNS_DAYS} days to send an unworn shirt back. Email
            your order number to{' '}
            <a className="sx-inline-link" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{' '}
            and we’ll sort it out — no interrogation, maybe one gentle question.
            The{' '}
            <Link className="sx-inline-link" to="/pages/shipping-returns">
              returns page
            </Link>{' '}
            has the steps.
          </>
        ),
      },
      {
        q: 'The print looks slightly off-centre. Is that a defect?',
        plain:
          'A millimetre or two of variation is normal for printed-to-order garments and is not a defect. Anything genuinely wrong — cracked print, wrong size, wrong shirt — is on us and we will replace it.',
        a: (
          <>
            A millimetre or two of variation is normal on printed-to-order
            garments; it’s the same reason no two deli sandwiches are identical.
            Anything genuinely wrong — cracked print, wrong size, wrong shirt —
            is on us, and we’ll replace it. Some of our{' '}
            <Link className="sx-inline-link" to="/collections/errata">
              Errata
            </Link>{' '}
            designs are misprints we liked enough to keep on purpose.
          </>
        ),
      },
      {
        q: 'Can I change or cancel an order?',
        plain:
          'Tell us fast. Once a shirt is in production it cannot be pulled back, because it is being made specifically for you.',
        a: (
          <>
            Tell us fast and we’ll try. Once a shirt is in production it can’t
            be pulled back, because it’s being made specifically for you — but{' '}
            <Link className="sx-inline-link" to="/pages/contact">
              message us
            </Link>{' '}
            the moment you know and we’ll do what we can.
          </>
        ),
      },
    ],
  },
  {
    group: 'Discounts',
    items: [
      STACK_DISCOUNT_LIVE
        ? {
            q: 'How does Stack & Save work?',
            plain: `Buy more, save more, automatically: ${ladder}. Mix and match any designs and sizes; the discount applies itself at checkout with no code.`,
            a: (
              <>
                Buy more, save more, automatically: {ladder}. Mix and match any
                designs and any sizes — the discount applies itself at checkout.
                There’s no code to remember and no minimum spend.
              </>
            ),
          }
        : {
            q: 'Do you do multi-buy discounts?',
            plain: `No. There is no multi-buy discount and no free-shipping threshold — shipping is charged by weight and starts at $${US_SHIPPING_FROM.toFixed(2)} in the US. We would rather say that than advertise a saving the checkout doesn't apply.`,
            a: (
              <>
                No. There&rsquo;s no multi-buy discount and{' '}
                <strong>no free-shipping threshold</strong> — shipping is
                charged by weight and starts at ${US_SHIPPING_FROM.toFixed(2)}{' '}
                in the US. We&rsquo;d rather say that than advertise a saving
                the checkout doesn&rsquo;t apply. If we ever run
                a proper multi-buy deal it&rsquo;ll apply itself at checkout and
                say so here — we&rsquo;d rather admit this than advertise a
                discount your basket never gets.{' '}
                <Link className="sx-inline-link" to="/matching-sets">
                  The Pair Programme
                </Link>{' '}
                is about two people, not two prices.
              </>
            ),
          },
      {
        q: 'Do you do bulk or team orders?',
        plain:
          'Yes — for teams, events, or questionable group costumes, email us and we will talk numbers.',
        a: (
          <>
            For teams, events, or questionable group costumes, email{' '}
            <a className="sx-inline-link" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{' '}
            and we’ll talk pile-of-Schmucks numbers.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {'@type': 'Answer', text: item.plain},
      })),
    ),
  };

  return (
    <div className="sx-faq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqJsonLd)}}
      />
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'FAQ'}]} />
          <p className="sx-pagehead__eyebrow">Answers, Reluctantly</p>
          <h1 className="sx-pagehead__title">FAQ</h1>
          <p className="sx-pagehead__desc">
            Everything you were going to email us about, answered before you had
            to. Still stuck?{' '}
            <Link className="sx-inline-link" to="/pages/contact">
              There’s a form
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap sx-faq">
          {GROUPS.map((group) => (
            <div className="sx-faq__group" key={group.group}>
              <h2 className="sx-faq__grouptitle">{group.group}</h2>
              {group.items.map((item, index) => (
                <details
                  className="sx-faq__item"
                  key={item.q}
                  open={group.group === 'Sizing & fit' && index === 0}
                >
                  <summary className="sx-faq__q">
                    <span>{item.q}</span>
                    <span className="sx-faq__mark" aria-hidden="true" />
                  </summary>
                  <div className="sx-faq__a">{item.a}</div>
                </details>
              ))}
            </div>
          ))}

          <div className="sx-faq__foot">
            <MelShrug className="sx-faq__mel" />
            <p>
              Asked something we haven’t covered? That’s a failure of ours, not
              yours —{' '}
              <Link className="sx-inline-link" to="/pages/contact">
                send it over
              </Link>{' '}
              and we’ll add it here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
