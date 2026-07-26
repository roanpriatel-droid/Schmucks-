import {Link, useLocation, useSearchParams} from 'react-router';
import {
  activeFacets,
  clearedFacetSearch,
  compareSizes,
  toggledFacetSearch,
  type FacetKind,
} from '~/lib/shelves';

export type Facet = {
  kind: FacetKind;
  label: string;
  values: Array<{label: string; count: number}>;
};

/**
 * Size + colorway filtering, driven by the facets the Storefront API reports
 * for the current collection — so it reflects what's actually in stock rather
 * than a hardcoded size run.
 *
 * Every control is a link, so filtering works without JavaScript and each
 * filtered view is a real, shareable URL.
 */
export function ShelfFilters({
  facets,
  count,
}: {
  facets: Facet[];
  /** Products currently shown — drives the "nothing matches" hint. */
  count: number;
}) {
  const [searchParams] = useSearchParams();
  const {pathname} = useLocation();
  const active = activeFacets(searchParams);
  const activeCount = active.size.length + active.color.length;

  if (!facets.length) return null;

  return (
    <div className="sx-filters">
      <div className="sx-filters__bar">
        <span className="sx-filters__label">Narrow it down</span>
        {activeCount > 0 ? (
          <Link
            className="sx-filters__clear"
            to={`${pathname}?${clearedFacetSearch(searchParams)}`}
            preventScrollReset
          >
            Clear {activeCount === 1 ? 'filter' : 'filters'}
          </Link>
        ) : null}
      </div>

      <div className="sx-filters__groups">
        {facets.map((facet) => {
          const values =
            facet.kind === 'size'
              ? [...facet.values].sort((a, b) => compareSizes(a.label, b.label))
              : facet.values;

          return (
            <fieldset className="sx-filters__group" key={facet.kind}>
              <legend className="sx-filters__legend">{facet.label}</legend>
              <div className="sx-filters__chips">
                {values.map((value) => {
                  const isActive = active[facet.kind].includes(value.label);
                  const href = `${pathname}?${toggledFacetSearch(
                    searchParams,
                    facet.kind,
                    value.label,
                  )}`;
                  return (
                    <Link
                      key={value.label}
                      to={href}
                      preventScrollReset
                      className={`sx-chip ${isActive ? 'is-on' : ''}`}
                      aria-pressed={isActive}
                    >
                      {value.label}
                      {value.count ? (
                        <span className="sx-chip__count">{value.count}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {count === 0 && activeCount > 0 ? (
        <p className="sx-filters__none">
          Nothing matches that combination. Loosen a filter and try again.
        </p>
      ) : null}
    </div>
  );
}
