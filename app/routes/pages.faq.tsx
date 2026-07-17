import type {Route} from './+types/pages.faq';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'FAQ — SCHMUCKS'},
    {
      name: 'description',
      content:
        'Frequently asked questions about Schmucks shirts: shipping, sizing, returns, and the Stack & Save discount.',
    },
  ];
};

const FAQS = [
  {
    q: 'How much is shipping?',
    a: 'Flat-rate shipping across the US, and it’s free when you order 2 or more shirts (that’s also where Stack & Save kicks in — see below). Printed to order and on its way in about 3–5 business days.',
  },
  {
    q: 'How does Stack & Save work?',
    a: 'Buy more, save more — automatically. 2 shirts = 10% off, 3 = 20% off, 4+ = 30% off. Mix and match any designs, any sizes. The discount applies at checkout on its own. No code, no math, no thinking.',
  },
  {
    q: 'What sizes do you carry?',
    a: 'Every design comes in unisex S through 3XL. Our tees run true to size. If you’re between sizes or want a roomier fit, size up.',
  },
  {
    q: 'What’s your return policy?',
    a: '30-day returns on unworn shirts. Wrong size or changed your mind? Email help@schmucks.example with your order number and we’ll sort it out — no interrogation, maybe one gentle question.',
  },
  {
    q: 'Are the shirts actually good quality?',
    a: 'Annoyingly, yes. Soft, heavyweight cotton with prints that survive the wash. The designs are dumb on purpose; the shirts are not.',
  },
  {
    q: 'Do you do custom or bulk orders?',
    a: 'For teams, events, or questionable group costumes, email hello@schmucks.example and we’ll talk pile-of-Schmucks pricing.',
  },
  {
    q: 'When do new designs drop?',
    a: 'New Schmuck drops weekly. Join the list at the bottom of any page to see them first (and grab 10% off your first mistake).',
  },
];

export default function FAQPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {'@type': 'Answer', text: f.a},
    })),
  };
  return (
    <div className="sx-faq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqJsonLd)}}
      />
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Answers, Reluctantly</p>
          <h1 className="sx-pagehead__title">FAQ</h1>
          <p className="sx-pagehead__desc">
            Everything you were going to email us about, answered before you had
            to.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap" style={{maxWidth: 760}}>
          {FAQS.map((item, i) => (
            <details className="sx-faq__item" key={i} open={i === 0}>
              <summary className="sx-faq__q">{item.q}</summary>
              <div className="sx-faq__a">{item.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
