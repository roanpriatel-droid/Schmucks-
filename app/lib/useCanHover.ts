import {useEffect, useState} from 'react';

/**
 * True only on devices with a real hovering pointer.
 *
 * Product cards layer a second mockup behind the first and cross-fade it on
 * hover. On a touch device that hover can never happen, but the browser still
 * downloads the image — one wasted request per card, and with 24 cards per
 * shelf page that is 24 images fetched to be never seen.
 *
 * Starts false so the server-rendered HTML carries only the primary image;
 * pointer devices add the second one after hydration. The swap image is
 * absolutely positioned decoration, so adding it later shifts nothing.
 */
export function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(query.matches);
    const onChange = (event: MediaQueryListEvent) => setCanHover(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return canHover;
}
