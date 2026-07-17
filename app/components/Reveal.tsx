import {useEffect, useRef, useState, type ReactNode} from 'react';

/**
 * Scroll-triggered reveal. Opacity + small translateY only, ≤ 400ms.
 * Fully respects prefers-reduced-motion (renders visible immediately).
 * SSR-safe: content is in the DOM from first paint; only the reveal class toggles.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  as?: 'div' | 'section' | 'li' | 'article';
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      {threshold: 0.12, rootMargin: '0px 0px -8% 0px'},
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`sx-reveal ${shown ? 'is-in' : ''} ${className}`.trim()}
      style={delay ? {transitionDelay: `${delay}ms`} : undefined}
    >
      {children}
    </Tag>
  );
}
