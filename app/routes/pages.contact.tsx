import {useState} from 'react';
import type {Route} from './+types/pages.contact';
import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Mel} from '~/components/brand/Brand';
import {CONTACT_EMAIL, RETURNS_DAYS} from '~/data/commerce';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Contact',
    description:
      'Order questions, sizing help, complaints and unsolicited jokes. Write it on the ticket and a human will answer.',
    path: '/pages/contact',
  });

const TOPICS = [
  'Where is my order',
  'Sizing help',
  'Return or exchange',
  'Wrong or damaged item',
  'Bulk / team order',
  'Just saying something',
];

/**
 * Deli order ticket.
 *
 * Headless Hydrogen has no Shopify contact-form endpoint (that's a Liquid
 * feature) and there's no ESP wired, so the ticket composes a real mailto:
 * with everything filled in rather than faking a submitted state. It's a form
 * that actually delivers, using software the customer already has.
 */
export default function ContactPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [order, setOrder] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const subject = `[${topic}]${order ? ` Order ${order}` : ''} — Schmucks`;
  const body = [
    `Topic: ${topic}`,
    order ? `Order number: ${order}` : 'Order number: (none given)',
    name ? `Name: ${name}` : '',
    '',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  const ready = message.trim().length > 0;

  return (
    <div className="sx-contact">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Contact'}]} />
          <p className="sx-pagehead__eyebrow">Talk to a Schmuck</p>
          <h1 className="sx-pagehead__title">Contact</h1>
          <p className="sx-pagehead__desc">
            Questions about an order? A design idea? A grievance? We read
            everything, usually while eating a sandwich.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap sx-ticketwrap">
          <form
            className="sx-ticket"
            onSubmit={(event) => {
              // The mailto lives on the submit so the browser hands off to the
              // customer's mail client with the ticket already written.
              event.preventDefault();
              window.location.href = mailto;
            }}
            aria-labelledby="sx-ticket-title"
          >
            <div className="sx-ticket__head">
              <span className="sx-ticket__no">No. ____</span>
              <h2 className="sx-ticket__title sx-display" id="sx-ticket-title">
                Order Ticket
              </h2>
              <span className="sx-ticket__stamp">Schmucks</span>
            </div>

            <div className="sx-ticket__body">
              <fieldset className="sx-ticket__field">
                <legend>What’s this about?</legend>
                <div className="sx-ticket__topics">
                  {TOPICS.map((item) => (
                    <label className="sx-ticket__topic" key={item}>
                      <input
                        type="radio"
                        name="topic"
                        value={item}
                        checked={topic === item}
                        onChange={() => setTopic(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="sx-ticket__row">
                <label className="sx-ticket__label" htmlFor="ticket-name">
                  Name
                  <input
                    id="ticket-name"
                    className="sx-ticket__input"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="A. Schmuck"
                    autoComplete="name"
                  />
                </label>
                <label className="sx-ticket__label" htmlFor="ticket-order">
                  Order number <span className="sx-ticket__opt">(if you have one)</span>
                  <input
                    id="ticket-order"
                    className="sx-ticket__input"
                    type="text"
                    value={order}
                    onChange={(event) => setOrder(event.target.value)}
                    placeholder="#1001"
                  />
                </label>
              </div>

              <label className="sx-ticket__label" htmlFor="ticket-message">
                The actual message
                <textarea
                  id="ticket-message"
                  className="sx-ticket__input sx-ticket__textarea"
                  rows={6}
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Where is my shirt / here is my joke / you spelled something wrong on purpose and I respect it"
                />
              </label>
            </div>

            <div className="sx-ticket__foot">
              <button className="sx-btn sx-btn--ketchup" type="submit" disabled={!ready}>
                Send it over
              </button>
              <p className="sx-ticket__note">
                This opens your email app with the ticket already written — so
                you keep a copy and we can actually reply. Prefer to write it
                yourself?{' '}
                <a className="sx-inline-link" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </form>

          <aside className="sx-contact__aside">
            <Mel className="sx-contact__mel" />
            <h2 className="sx-contact__asidetitle">Faster than emailing</h2>
            <ul className="sx-contact__links">
              <li>
                <Link to="/pages/size-guide">What size am I?</Link>
                <span>Measurements and a find-my-size helper.</span>
              </li>
              <li>
                <Link to="/pages/shipping-returns">Where’s my order?</Link>
                <span>How printing and shipping actually work.</span>
              </li>
              <li>
                <Link to="/pages/shipping-returns">Sending one back</Link>
                <span>{RETURNS_DAYS} days, unworn, no interrogation.</span>
              </li>
              <li>
                <Link to="/pages/faq">Everything else</Link>
                <span>The FAQ answers most of it.</span>
              </li>
            </ul>
            <p className="sx-contact__hours">
              We answer in the order tickets arrive. Complaints about the jokes
              are read with particular attention and then ignored.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
