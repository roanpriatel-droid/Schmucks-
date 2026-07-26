import {useEffect} from 'react';
import {Link} from 'react-router';
import {BLANK_NAME, SIZES} from '~/data/sizing';

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
        <p className="sx-modal__note">
          {BLANK_NAME}, measured flat in inches. Chest is pit-to-pit — measure a
          shirt you already like and match the number. True to size; size up for
          a boxier fit. Allow about ±1&Prime; garment tolerance.
        </p>
        <div className="sx-table-wrap sx-table-wrap--modal">
          <table className="sx-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest (½, flat)</th>
                <th>Body length</th>
                <th>Sleeve</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s.size}>
                  <td>{s.size}</td>
                  <td>{s.chest}&Prime;</td>
                  <td>{s.length}&Prime;</td>
                  <td>{s.sleeve}&Prime;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sx-modal__foot">
          Want the full fit breakdown and a find-my-size helper?{' '}
          <Link className="sx-inline-link" to="/pages/size-guide" onClick={onClose}>
            Full size &amp; fit guide →
          </Link>
        </p>
      </div>
    </div>
  );
}
