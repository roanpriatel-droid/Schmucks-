import {useState} from 'react';
import type {Route} from './+types/pages.contact';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Contact — SCHMUCKS'},
    {
      name: 'description',
      content:
        'Get in touch with Schmucks. Order questions, complaints, and unsolicited jokes welcome.',
    },
  ];
};

export default function ContactPage() {
  return (
    <div className="sx-contact">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Talk to a Schmuck</p>
          <h1 className="sx-pagehead__title">Contact</h1>
          <p className="sx-pagehead__desc">
            Questions about an order? A design idea? A grievance? We read
            everything, usually while eating a sandwich.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap sx-page__grid">
          <div className="sx-prose">
            <h2>The Fastest Way</h2>
            <p>
              For anything about an existing order — where&rsquo;s my shirt, wrong
              size, changed my mind — email us at{' '}
              <a href="mailto:help@schmucks.example">help@schmucks.example</a>{' '}
              with your order number. We answer within 1–2 business days, or
              faster if the joke is good.
            </p>
            <h2>Returns &amp; Sizing</h2>
            <p>
              Every shirt is backed by our 30-day returns policy. Not sure on
              size? Our tees run true to size, unisex, S–3XL. When in doubt, size
              up and call it &ldquo;oversized on purpose.&rdquo;
            </p>
            <h2>Wholesale &amp; Collabs</h2>
            <p>
              Want a pile of Schmucks for your team, band, or ill-advised group
              costume? Email{' '}
              <a href="mailto:hello@schmucks.example">hello@schmucks.example</a>.
            </p>
          </div>

          <div>
            <div className="sx-contact-card">
              <h3>Drop Us a Line</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="sx-form-success" role="status">
        <div className="sx-form-success__title">Got it.</div>
        <p>
          Thanks for reaching out. We&rsquo;ll get back to you within 1–2
          business days — or sooner if the joke was good.
        </p>
      </div>
    );
  }

  return (
    <>
      <p>Fill this out and we&rsquo;ll get back to you. Probably.</p>
      <form
        className="sx-contact-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div>
          <label htmlFor="c-name">Your Name</label>
          <input id="c-name" type="text" required placeholder="A. Schmuck" />
        </div>
        <div>
          <label htmlFor="c-email">Email</label>
          <input
            id="c-email"
            type="email"
            required
            placeholder="you@regrets.com"
          />
        </div>
        <div>
          <label htmlFor="c-msg">Message</label>
          <textarea
            id="c-msg"
            required
            placeholder="Where is my shirt / here is my joke"
          />
        </div>
        <button className="sx-btn sx-btn--ink" type="submit">
          Send It
        </button>
      </form>
    </>
  );
}
