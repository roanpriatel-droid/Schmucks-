import {useEffect, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

type Img = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Swipeable product gallery: scroll-snap track (native touch swipe), thumbnail
 * strip + dots as position indicator, and a click-to-zoom lightbox.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: Img[];
  title: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const pics = images.filter((i) => i?.url);

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  if (!pics.length) {
    return (
      <div className="sx-product__media" style={{aspectRatio: '1 / 1'}} />
    );
  }

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({left: track.clientWidth * i, behavior: 'smooth'});
    setActive(i);
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== active) setActive(i);
  }

  return (
    <div className="sx-gallery">
      <div className="sx-gallery__main">
        <div className="sx-gallery__track" ref={trackRef} onScroll={onScroll}>
          {pics.map((img, i) => (
            <button
              key={img.id || img.url}
              type="button"
              className="sx-gallery__slide"
              onClick={() => setLightbox(i)}
              aria-label={`Zoom image ${i + 1} of ${pics.length}`}
            >
              <Image
                data={img}
                alt={img.altText || `${title} — view ${i + 1}`}
                aspectRatio="1/1"
                sizes="(min-width: 860px) 620px, 100vw"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </button>
          ))}
        </div>
        {pics.length > 1 && (
          <span className="sx-gallery__zoomhint">Tap to zoom</span>
        )}
      </div>

      {pics.length > 1 && (
        <>
          <div className="sx-gallery__dots" role="tablist" aria-label="Gallery position">
            {pics.map((img, i) => (
              <button
                key={`dot-${img.id || i}`}
                type="button"
                className="sx-gallery__dot"
                aria-current={active === i}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div className="sx-gallery__thumbs">
            {pics.map((img, i) => (
              <button
                key={`thumb-${img.id || i}`}
                type="button"
                className="sx-gallery__thumb"
                aria-current={active === i}
                aria-label={`View image ${i + 1}`}
                onClick={() => goTo(i)}
              >
                <Image data={img} alt="" aspectRatio="1/1" sizes="68px" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}

      {lightbox !== null && (
        <div className="sx-modal" role="dialog" aria-modal="true" aria-label="Product image">
          <button
            className="sx-modal__scrim"
            aria-label="Close"
            onClick={() => setLightbox(null)}
          />
          <div className="sx-modal__panel" style={{padding: 0, maxWidth: '90vw'}}>
            <button
              className="sx-modal__close"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <Image
              data={pics[lightbox]}
              alt={pics[lightbox].altText || title}
              sizes="90vw"
              loading="eager"
            />
          </div>
        </div>
      )}
    </div>
  );
}
