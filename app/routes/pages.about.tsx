import type {Route} from './+types/pages.about';
import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {Reveal} from '~/components/Reveal';
import {Mel, MelShrug, Badge} from '~/components/brand/Brand';
import {Marquee} from '~/components/home/Marquee';
import {BLANK, SIZE_RUN} from '~/data/commerce';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'The Schmucks Story',
    description:
      'Founded by an idiot, staffed by idiots, worn by idiots. The entirely unverifiable history of SCHMUCKS — and the very real cotton it is printed on.',
    path: '/pages/about',
  });

/**
 * Deliberate brand fiction. The lore is obviously a joke and stays away from
 * anything a customer could mistake for a trust signal — no invented press,
 * ratings or customer counts (BRAND §8). The facts section at the bottom is
 * the part that's true.
 */
const LORE = [
  {
    year: 'Est. 1952',
    title: 'A man named Mel opens a deli',
    body: 'He is not a good businessman. He is, by every surviving account, a wonderful sandwich maker and a catastrophic decision maker. The counter is busy. The books are a crime scene.',
  },
  {
    year: '1961',
    title: 'The first shirt is an accident',
    body: 'Mel orders aprons. The printer mishears him twice. Forty shirts arrive reading FINE APPAREL FOR IDIOTS. He wears one for thirty years and refuses to discuss it.',
  },
  {
    year: '1978',
    title: 'The regulars start asking',
    body: 'People want the shirt. Mel, who cannot say no and cannot count, begins giving them away. The deli’s margins do not survive this period. The shirts do.',
  },
  {
    year: 'Since recently',
    title: 'We found the box',
    body: 'The deli is long gone. The box of shirts is not. Everything we print now comes out of that box, one bad idea at a time, on cotton Mel would have grudgingly approved of.',
  },
];

const VALUES = [
  {
    label: 'The joke is free',
    body: 'We will never charge extra for the funny part. The design is the cheapest thing about this shirt to make, and pretending otherwise would be insulting.',
  },
  {
    label: 'The shirt is not a joke',
    body: `Heavyweight ${BLANK}, ringspun cotton, ribbed collar, double-needle hems. Printed to order so nothing sits in a warehouse getting sad.`,
  },
  {
    label: 'No invented flattery',
    body: 'You will not find fake five-star quotes, invented customer counts, or “as seen in” logos on this site. When we have real reviews, you’ll see real reviews.',
  },
];

export default function About() {
  return (
    <div className="sx-about">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'The Schmucks Story'}]} />
          <p className="sx-pagehead__eyebrow">Est. 1952 · Allegedly</p>
          <h1 className="sx-pagehead__title">The Schmucks Story</h1>
          <p className="sx-pagehead__desc">
            Founded by an idiot. Staffed by idiots. Worn, at last count, by an
            encouraging number of idiots. None of the following has been
            independently verified and we would ask you not to try.
          </p>
        </div>
      </section>

      {/* Deli "photograph" — brand illustration, plainly labelled as such. */}
      <section className="sx-storyhero" aria-label="The counter">
        <div className="sx-wrap sx-storyhero__inner">
          <figure className="sx-storyhero__plate">
            <Mel className="sx-storyhero__mel" />
            <figcaption className="sx-storyhero__caption">
              Mel, behind the counter, circa whenever. Illustration — we have no
              photographs, because he hated them.
            </figcaption>
          </figure>
          <div className="sx-storyhero__copy">
            <p className="sx-storyhero__lead">
              Every brand this side of a trust fund claims heritage. Ours is a
              man who could not stop giving away shirts.
            </p>
            <p>
              SCHMUCKS is a graphic tee label built on deli logic: say the thing
              plainly, put it on something decent, charge a fair price, and
              never explain the punchline to someone who didn’t get it.
            </p>
            <p>
              The mythology below is nonsense. The cotton is not. Both are
              offered in good faith.
            </p>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          'FOUNDED BY AN IDIOT',
          'STAFFED BY IDIOTS',
          'WORN BY IDIOTS',
          'FINE APPAREL, THOUGH',
        ]}
      />

      <section className="sx-page" aria-labelledby="sx-lore-title">
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">The Unverifiable History</p>
              <h2 className="sx-section-title" id="sx-lore-title">
                How we got here
              </h2>
            </div>
            <p className="sx-section-note">
              A timeline assembled from hearsay, one receipt, and a shirt nobody
              can explain.
            </p>
          </div>

          <ol className="sx-lore">
            {LORE.map((entry, index) => (
              <Reveal as="li" key={entry.year} delay={index * 60}>
                <article className="sx-lore__item">
                  <p className="sx-lore__year sx-display">{entry.year}</p>
                  <h3 className="sx-lore__title">{entry.title}</h3>
                  <p className="sx-lore__body">{entry.body}</p>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="sx-statement" aria-label="What we actually believe">
        <div className="sx-wrap">
          <Reveal>
            <p className="sx-statement__text sx-display">
              Dumb on the front.
              <br />
              <em>Serious</em> about the shirt.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sx-page" aria-labelledby="sx-values-title">
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">House Rules</p>
              <h2 className="sx-section-title" id="sx-values-title">
                Three things we won’t move on
              </h2>
            </div>
          </div>
          <Reveal className="sx-values">
            {VALUES.map((value) => (
              <div className="sx-value" key={value.label}>
                <Badge className="sx-value__badge" />
                <h3 className="sx-value__label">{value.label}</h3>
                <p className="sx-value__body">{value.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section
        className="sx-page sx-about__facts"
        aria-labelledby="sx-facts-title"
      >
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">The Part That’s True</p>
              <h2 className="sx-section-title" id="sx-facts-title">
                What you’re actually buying
              </h2>
            </div>
          </div>
          <dl className="sx-facts">
            <div>
              <dt>The blank</dt>
              <dd>{BLANK}, heavyweight ringspun cotton.</dd>
            </div>
            <div>
              <dt>Sizes</dt>
              <dd>Unisex {SIZE_RUN}, true to size.</dd>
            </div>
            <div>
              <dt>Colourways</dt>
              <dd>Black and Natural, with Gold on a few designs.</dd>
            </div>
            <div>
              <dt>Printing</dt>
              <dd>
                Made to order when you buy it — nothing sits in a warehouse.
              </dd>
            </div>
            <div>
              <dt>Returns</dt>
              <dd>30 days on unworn shirts. One gentle question, maybe.</dd>
            </div>
            <div>
              <dt>Founded</dt>
              <dd>By an idiot. See above.</dd>
            </div>
          </dl>

          <div className="sx-about__ctas">
            <Link className="sx-btn sx-btn--ketchup" to="/tees">
              Shop the shirts
            </Link>
            <Link className="sx-btn sx-btn--ghost" to="/pages/materials">
              How they’re made
            </Link>
            <Link className="sx-btn sx-btn--ghost" to="/pages/contact">
              Talk to a human
            </Link>
          </div>
        </div>
      </section>

      <section className="sx-about__signoff" aria-label="Sign-off">
        <div className="sx-wrap">
          <MelShrug className="sx-about__shrug" />
          <p className="sx-about__signoff-text sx-display">
            That’s the whole story. There isn’t more.
          </p>
        </div>
      </section>
    </div>
  );
}
