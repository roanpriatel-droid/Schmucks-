/**
 * Loading placeholders. Flat blocks in the cream/ink system with a slow shimmer
 * that switches off under prefers-reduced-motion (handled in CSS) — no
 * spinners, no gradients beyond the sweep.
 */
export function SkeletonGrid({count = 8}: {count?: number}) {
  return (
    <div className="sx-grid" aria-hidden="true">
      {Array.from({length: count}).map((_, index) => (
        <div className="sx-skel-card" key={index}>
          <div className="sx-skel sx-skel-card__media" />
          <div className="sx-skel-card__body">
            <div className="sx-skel sx-skel--line" />
            <div className="sx-skel sx-skel--line sx-skel--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonLines({
  count = 3,
  label = 'Loading',
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div className="sx-skel-lines" role="status" aria-label={label}>
      {Array.from({length: count}).map((_, index) => (
        <div
          className={`sx-skel sx-skel--line ${index === count - 1 ? 'sx-skel--short' : ''}`}
          key={index}
        />
      ))}
    </div>
  );
}
