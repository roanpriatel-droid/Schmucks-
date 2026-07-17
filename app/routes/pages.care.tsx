import type {Route} from './+types/pages.care';
import {Link} from 'react-router';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Care Guide — SCHMUCKS'},
    {
      name: 'description',
      content:
        'How to keep your Schmucks tee (and its print) looking sharp: cold wash, inside out, hang dry, no ironing the graphic.',
    },
  ];
};

const CARE = [
  {icon: '🧊', title: 'Wash Cold', note: 'Cold water, gentle cycle. Heat is what fades prints and shrinks cotton. Cold keeps both honest.'},
  {icon: '🔄', title: 'Inside Out', note: 'Turn it inside out before washing so the print rubs against the drum less. Free years of life.'},
  {icon: '🚫', title: 'Skip the Fabric Softener', note: 'Softener coats fibres and dulls prints over time. The cotton is already soft — leave it be.'},
  {icon: '🌬️', title: 'Hang or Lay Flat to Dry', note: 'The dryer is a print’s worst enemy. Air-dry and the graphic stays crisp and the fit stays true.'},
  {icon: '🔥', title: 'Never Iron the Print', note: 'If you must iron, go inside out and avoid the graphic entirely. Direct heat melts ink.'},
  {icon: '🧺', title: 'Wash With Like Colors', note: 'Cream with cream, ink with ink. Standard stuff, but it keeps the mustard looking like mustard.'},
];

export default function Care() {
  return (
    <div className="sx-care-page">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Care Guide</p>
          <h1 className="sx-pagehead__title">Keep It Looking Dumb</h1>
          <p className="sx-pagehead__desc">
            A good shirt should outlast the joke. Six small habits and yours will.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap">
          <div className="sx-care-list">
            {CARE.map((c) => (
              <div className="sx-care" key={c.title}>
                <span className="sx-care__icon" aria-hidden="true">
                  {c.icon}
                </span>
                <div>
                  <div className="sx-care__title">{c.title}</div>
                  <div className="sx-care__note">{c.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sx-prose" style={{marginTop: '2.5rem', maxWidth: '62ch'}}>
            <h2>The short version</h2>
            <p>
              Cold wash, inside out, hang dry, hands off the print with an iron.
              Do that and a Schmucks tee keeps its weight, its color, and its
              graphic for years — which is the whole idea behind{' '}
              <Link to="/pages/materials">how we build them</Link>.
            </p>
            <p>
              Something arrive not right? That&rsquo;s what the{' '}
              <Link to="/policies/refund-policy">30-day returns</Link> are for.
              Questions we didn&rsquo;t answer? <Link to="/pages/contact">Ask us</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
