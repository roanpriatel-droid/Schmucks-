export function Marquee({
  items,
  variant = 'mustard',
}: {
  items: string[];
  variant?: 'mustard' | 'ink';
}) {
  // Duplicate the group so the -50% keyframe loops seamlessly.
  const group = (
    <div className="sx-marquee__group" aria-hidden="false">
      {items.map((item, idx) => (
        <span className="sx-marquee__item" key={idx}>
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`sx-marquee ${variant === 'ink' ? 'sx-marquee--ink' : ''}`}
      role="marquee"
    >
      <div className="sx-marquee__track">
        {group}
        <div className="sx-marquee__group" aria-hidden="true">
          {items.map((item, idx) => (
            <span className="sx-marquee__item" key={`dup-${idx}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
