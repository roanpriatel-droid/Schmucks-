import type {Route} from './+types/pages.about';
import {Link} from 'react-router';
import {Mel, Badge} from '~/components/brand/Brand';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'About — SCHMUCKS'},
    {
      name: 'description',
      content:
        'SCHMUCKS makes funny graphic tees on genuinely good cotton. Fine apparel for idiots — the joke is free, the quality is not an accident.',
    },
  ];
};

export default function About() {
  return (
    <div className="sx-about">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Our Whole Deal</p>
          <h1 className="sx-pagehead__title">Fine Apparel for Idiots</h1>
          <p className="sx-pagehead__desc">
            We make shirts with dumb things written on them. We also refuse to
            make them badly. Both of those are the point.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap">
          <Reveal className="sx-prose">
            <p className="sx-article__lead">
              SCHMUCKS started from a simple, slightly unhinged observation: the
              funniest shirts are almost always the worst-made ones. Great joke,
              tragic fabric. You wear it twice and it becomes a dust rag. We
              thought the joke deserved better than that — and so did you.
            </p>
            <p>
              So we built a deli. Not a real one — a brand that looks and talks
              like a 1960s New York lunch counter that somehow started printing
              cursed t-shirts. Mustard, ink, cream, a squirt of ketchup red. Big
              chunky sign-painter letters. A mascot named Mel who has seen things.
              The whole thing is a bit, and the bit is sincere: apparel should be
              fun to look at, honest to buy, and good enough to keep.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="sx-wrap">
        <div className="sx-split">
          <div>
            <p className="sx-split__kicker">The Point of View</p>
            <h2 className="sx-split__title">The joke is free. The shirt is not an accident.</h2>
            <p>
              Anyone can slap a meme on the cheapest blank in the catalogue. We
              start the other way around — with a heavyweight ringspun cotton, a
              proper ribbed collar, double-needle hems, and a print built to
              survive the wash cycle and your lifestyle. Then we put something
              stupid on it. In that order.
            </p>
            <p>
              The full spec lives on the{' '}
              <Link to="/pages/materials">materials page</Link>, because we would
              rather show our work than ask you to trust a vibe.
            </p>
          </div>
          <div className="sx-split__visual sx-split--reverse">
            <Mel />
          </div>
        </div>
      </div>

      <section className="sx-statement sx-statement--mustard">
        <div className="sx-wrap">
          <Reveal>
            <p className="sx-statement__text sx-display">
              A proud community of <em>idiots.</em>
            </p>
            <p className="sx-statement__sub" style={{color: 'var(--ink)'}}>
              The customer is always in on the joke. We are laughing with you,
              never at you — mostly because we are wearing the same shirt.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="sx-wrap">
        <div className="sx-split sx-split--reverse">
          <div className="sx-split__visual">
            <Badge />
          </div>
          <div>
            <p className="sx-split__kicker">How We Operate</p>
            <h2 className="sx-split__title">Print to order. Tell the truth.</h2>
            <p>
              Every shirt is made after you order it — no warehouse of dead stock,
              no incinerated inventory, fresher prints. We covered the honest
              trade-offs in the <Link to="/journal/why-we-print-to-order">Journal</Link>.
            </p>
            <p>
              And we do not fake things. No invented five-star reviews, no fake
              scarcity timers, no "as seen in" logos we made up. If we claim it,
              it is true. That is a low bar, and we are proud of how many brands
              trip over it.
            </p>
          </div>
        </div>
      </div>

      <section className="sx-join">
        <div className="sx-wrap">
          <h2 className="sx-join__title">Come Be an Idiot With Us</h2>
          <p className="sx-join__sub">
            $25 flat, S–3XL, printed to order. New drops all the time.
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link className="sx-btn sx-btn--ink" to="/tees">
              Shop the Tees
            </Link>
            <Link className="sx-btn sx-btn--ghost" to="/pages/materials">
              How They&rsquo;re Made
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
