import {useState} from 'react';
import type {Route} from './+types/pages.size-guide';
import {Link} from 'react-router';
import {SIZES} from '~/data/sizing';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Size & Fit Guide — SCHMUCKS'},
    {
      name: 'description',
      content:
        'Measurements, fit descriptions, and a find-my-size helper for Schmucks unisex tees (S–3XL). True to size — size up for an oversized drape.',
    },
  ];
};

const FITS = [
  {name: 'True to Size', body: 'Take your normal size for a clean, relaxed fit that skims the body without clinging. This is how we cut it.'},
  {name: 'Boxy / Oversized', body: 'Size up one for the current drop-shoulder, roomy look. Great over a longer-sleeve layer.'},
  {name: 'Fitted', body: 'Size down one if you want it closer to the body — note the length comes up a touch shorter too.'},
];

export default function SizeGuide() {
  return (
    <div className="sx-sizeguide">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <p className="sx-pagehead__eyebrow">Size &amp; Fit</p>
          <h1 className="sx-pagehead__title">Find Your Size</h1>
          <p className="sx-pagehead__desc">
            One relaxed unisex cut, S–3XL. True to size. Here are the actual
            numbers so you&rsquo;re not guessing.
          </p>
        </div>
      </section>

      <section className="sx-page">
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">Measurements</p>
              <h2 className="sx-section-title">Garment Measurements</h2>
            </div>
            <p className="sx-section-note">
              Measured flat, in inches. Chest is across the front (pit to pit) —
              double it for the full circumference.
            </p>
          </div>
          <div className="sx-table-wrap">
            <table className="sx-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (flat, in)</th>
                  <th>Body Length (in)</th>
                  <th>Sleeve (in)</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((s) => (
                  <tr key={s.size}>
                    <td>{s.size}</td>
                    <td>{s.chest}"</td>
                    <td>{s.length}"</td>
                    <td>{s.sleeve}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sx-model-note">
            How to measure: lay a shirt you already like flat and measure pit to
            pit. Match that number to the Chest column and you&rsquo;ll be right
            nearly every time.
          </div>
        </div>
      </section>

      <section className="sx-page" style={{paddingTop: 0}}>
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">How It Wears</p>
              <h2 className="sx-section-title">Pick Your Fit</h2>
            </div>
          </div>
          <div className="sx-fitlist">
            {FITS.map((f) => (
              <div className="sx-fit" key={f.name}>
                <h3 className="sx-fit__name">{f.name}</h3>
                <p style={{fontSize: '0.9rem', lineHeight: 1.5}}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sx-page" style={{paddingTop: 0}}>
        <div className="sx-wrap">
          <div className="sx-section-head">
            <div>
              <p className="sx-eyebrow">Still Not Sure?</p>
              <h2 className="sx-section-title">Find My Size</h2>
            </div>
            <p className="sx-section-note">
              A rough starting point based on height and how you like it to sit.
              When you&rsquo;re between sizes, we say size up.
            </p>
          </div>
          <SizeFinder />
        </div>
      </section>

      <section className="sx-page" style={{paddingTop: 0}}>
        <div className="sx-wrap" style={{textAlign: 'center'}}>
          <Link className="sx-btn" to="/tees">
            Shop the Tees
          </Link>
        </div>
      </section>
    </div>
  );
}

function SizeFinder() {
  const [height, setHeight] = useState('');
  const [fit, setFit] = useState('true');
  const [result, setResult] = useState<string | null>(null);

  function recommend() {
    const h = Number(height);
    if (!h) {
      setResult(null);
      return;
    }
    // Base size by height (inches). Deliberately conservative + honest.
    const order = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
    let base = 2; // L
    if (h < 64) base = 0; // < 5'4"
    else if (h < 67) base = 1; // 5'4"–5'6"
    else if (h < 71) base = 2; // 5'7"–5'10"
    else if (h < 74) base = 3; // 5'11"–6'1"
    else base = 4; // 6'2"+
    if (fit === 'oversized') base = Math.min(base + 1, order.length - 1);
    if (fit === 'fitted') base = Math.max(base - 1, 0);
    setResult(order[base]);
  }

  return (
    <div className="sx-finder">
      <div className="sx-finder__row">
        <div>
          <label htmlFor="sf-height">Your height (inches)</label>
          <input
            id="sf-height"
            type="number"
            inputMode="numeric"
            min={48}
            max={84}
            placeholder="e.g. 70"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-fit">How do you like it?</label>
          <select
            id="sf-fit"
            value={fit}
            onChange={(e) => setFit(e.target.value)}
          >
            <option value="fitted">Fitted</option>
            <option value="true">True to size</option>
            <option value="oversized">Oversized / boxy</option>
          </select>
        </div>
      </div>
      <button className="sx-btn sx-btn--ink" type="button" onClick={recommend}>
        Find My Size
      </button>
      {result && (
        <div className="sx-finder__result" role="status">
          Start with a <strong>{result}</strong>. Between sizes? Size up. Still
          unsure? 30-day returns have your back.
        </div>
      )}
    </div>
  );
}
