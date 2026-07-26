import {Link} from 'react-router';
import {MelShrug} from '~/components/brand/Brand';
import {restockingCopy} from '~/lib/shelves';

/**
 * The state a smart collection sits in before its tags match anything.
 * Deliberately not an error: the shelf exists, it's just between drops.
 */
export function Restocking({
  title,
  className = '',
}: {
  title?: string;
  className?: string;
}) {
  const copy = restockingCopy(title);

  return (
    <div className={`sx-restock sx-restock--panel ${className}`.trim()}>
      <MelShrug className="sx-restock__mel" />
      <p className="sx-restock__title sx-display">{copy.heading}</p>
      <p className="sx-restock__body">{copy.body}</p>
      <div className="sx-restock__ctas">
        <Link className="sx-btn sx-btn--ketchup" to="/tees">
          Everything we print
        </Link>
        <Link className="sx-btn sx-btn--ghost" to="/collections/new-arrivals">
          New arrivals
        </Link>
      </div>
    </div>
  );
}
