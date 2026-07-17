import {useEffect} from 'react';
import {Link} from 'react-router';
import {SIZES} from '~/data/sizing';

export function SizeGuideModal({onClose}: {onClose: () => void}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sx-modal" role="dialog" aria-modal="true" aria-label="Size guide">
      <button className="sx-modal__scrim" aria-label="Close size guide" onClick={onClose} />
      <div className="sx-modal__panel">
        <button className="sx-modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="sx-modal__title">Size Guide</h2>
        <p style={{marginBottom: '1rem', fontSize: '0.9rem'}}>
          Unisex tee, measured flat in inches. Chest is pit-to-pit — measure a
          shirt you already like and match the number. True to size; size up for
          a boxier fit.
        </p>
        <div className="sx-table-wrap" style={{boxShadow: '4px 4px 0 var(--ink)'}}>
          <table className="sx-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest (flat)</th>
                <th>Length</th>
                <th>Sleeve</th>
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
        <p style={{marginTop: '1rem', fontSize: '0.85rem'}}>
          Want the full fit breakdown and a find-my-size helper?{' '}
          <Link
            to="/pages/size-guide"
            style={{color: 'var(--ketchup)', fontWeight: 800, textDecoration: 'underline'}}
            onClick={onClose}
          >
            Full size &amp; fit guide →
          </Link>
        </p>
      </div>
    </div>
  );
}
