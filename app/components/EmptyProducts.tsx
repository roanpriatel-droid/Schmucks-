import {Link} from 'react-router';
import {MelShrug} from '~/components/brand/Brand';

/**
 * Shown when a product listing comes back empty — an unpublished collection, a
 * sold-out drop, a filter with no matches. Always offers a way onward.
 */
export function EmptyProducts({
  message = 'Nothing to show here yet.',
}: {
  message?: string;
}) {
  return (
    <div className="sx-empty-note">
      <MelShrug className="sx-empty-note__mel" />
      <p>{message}</p>
      <p>
        Try <Link to="/tees">all the tees</Link>,{' '}
        <Link to="/matching-sets">the matching sets</Link>, or{' '}
        <Link to="/search">search for something specific</Link>.
      </p>
    </div>
  );
}
