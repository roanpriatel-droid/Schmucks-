import type {Route} from './+types/pages.materials';
import {Link} from 'react-router';
import {Reveal} from '~/components/Reveal';
import {pageMeta} from '~/lib/seo';
import {Breadcrumbs} from '~/components/Breadcrumbs';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Materials & Construction',
    description:
      'What goes into a Schmucks tee: 180 gsm 100% US cotton, seamless tubular body, ribbed collar, double-needle hems, and soft-hand prints built to survive the wash.',
    path: '/pages/materials',
  });

const SPECS = [
  {num: '~180', label: 'GSM Weight', note: 'Heavyweight. Not see-through, not flimsy. Has a real hand-feel.'},
  // Was "Ringspun Cotton — finer, smoother, stronger yarn than standard
  // open-end cotton". The Gildan 5000 is carded open-end cotton; the supplier
  // spec says only "100% cotton". The claim was unsupported and specifically
  // contradicted by the garment it described. See GARMENT_FACTS.
  {num: '100%', label: 'US Cotton', note: 'Grown and harvested in the US, under the Cotton Trust Protocol.'},
  {num: '2×', label: 'Double-Needle Hems', note: 'Two rows of stitching at sleeve and bottom so edges don’t unravel.'},
  {num: 'S–3XL', label: 'Unisex Sizing', note: 'One relaxed unisex cut, six sizes, a few colorways each.'},
  {
    num: 'OEKO',
    label: 'TEX® Standard 100',
    note: 'Certificate 168252 (OETI) — tested for substances harmful to skin.',
  },
];

const CONSTRUCTION = [
  ['Fabric', '100% cotton, 180 gsm / 5.3 oz', 'Tightly knit, so print detail stays sharp and colour lasts'],
  ['Body', 'Seamless tubular body — no side seams', 'Nothing digging in down the sides; cleaner drape'],
  ['Collar', 'Ribbed crew, tear-away label', 'Snaps back instead of stretching into a scoop, and nothing scratches'],
  ['Shoulders', 'Shoulder-to-shoulder taping', 'Hides the seam, stops the neck warping'],
  ['Hems', 'Double-needle sleeve & bottom hem', 'No curling, no unraveling edges'],
  ['Print', 'Soft-hand water-based / DTG, matched to design', 'Sinks into the fabric — not a plastic decal on top'],
  ['Fit', 'Relaxed unisex, true to size', 'Size up one for an oversized, boxy drape'],
];

export default function Materials() {
  return (
    <div className="sx-materials">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Materials & Construction'}]} />
          <p className="sx-pagehead__eyebrow">Materials &amp; Construction</p>
          <h1 className="sx-pagehead__title">Dumb Shirt. Serious Cotton.</h1>
          <p className="sx-pagehead__desc">
            The joke is on the front. The reason you keep wearing it is
            everything underneath. Here is exactly what you&rsquo;re buying.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap">
          <Reveal className="sx-spec-grid">
            {SPECS.map((s) => (
              <div className="sx-spec" key={s.label}>
                <div className="sx-spec__num sx-display">{s.num}</div>
                <div className="sx-spec__label">{s.label}</div>
                <div className="sx-spec__note">{s.note}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <div className="sx-wrap">
        <div className="sx-split">
          <div>
            <p className="sx-split__kicker">Weight Matters</p>
            <h2 className="sx-split__title">Why ~180 GSM is the whole game</h2>
            <p>
              GSM — grams per square metre — is the one number nobody tells you at
              checkout, and it&rsquo;s the difference between a shirt and a
              disappointment. Fast-fashion tees live around 130–150 gsm: thin,
              papery, see-through when you stretch. Ours sits noticeably heavier,
              which is why a Schmucks shirt has weight in the hand and opacity on
              the body.
            </p>
            <p className="sx-pull">
              The knit is tight — which is what keeps print detail sharp — and tougher
              against pilling.
            </p>
            <p>
              Heavier, tightly knit, reinforced. It costs us more than the cheap
              blank. It&rsquo;s the reason the shirt outlasts the joke.
            </p>
          </div>
          <div className="sx-split__visual">
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <div className="sx-spec__num sx-display" style={{fontSize: '4rem'}}>
                180
              </div>
              <div className="sx-spec__label">grams / m²</div>
            </div>
          </div>
        </div>
      </div>

      <section className="sx-page" style={{paddingTop: 0}}>
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">The Build</p>
              <h2 className="sx-section-title">Construction, Line by Line</h2>
            </div>
          </div>
          <div className="sx-table-wrap">
            <table className="sx-table">
              <thead>
                <tr>
                  <th>Part</th>
                  <th>What it is</th>
                  <th>Why it matters</th>
                </tr>
              </thead>
              <tbody>
                {CONSTRUCTION.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{marginTop: '1rem', fontSize: '0.82rem', opacity: 0.65}}>
            Specs reflect our standard blank. Exact figures can vary slightly by
            colorway and run; if a specific measurement matters to you, the{' '}
            <Link to="/pages/size-guide" style={{textDecoration: 'underline'}}>
              size guide
            </Link>{' '}
            has the numbers.
          </p>
        </div>
      </section>

      <section className="sx-statement">
        <div className="sx-wrap">
          <p className="sx-statement__text sx-display">
            Made when you order it.
          </p>
          <p className="sx-statement__sub">
            Every shirt is printed to order — fresher prints, no dead stock. The
            honest trade-offs are in the{' '}
            <Link to="/journal/why-we-print-to-order" style={{color: 'var(--mustard)', textDecoration: 'underline'}}>
              Journal
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap" style={{textAlign: 'center'}}>
          <Link className="sx-btn" to="/tees">
            Shop the Tees
          </Link>
        </div>
      </section>
    </div>
  );
}
