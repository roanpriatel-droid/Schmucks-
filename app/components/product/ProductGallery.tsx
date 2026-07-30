import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';

export type GalleryImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Product gallery.
 *
 * Printify quirks this absorbs:
 * - Every variant carries an image, but there is only ONE distinct mockup per
 *   colourway. The remaining 6–10 images on a product are unattributed extra
 *   mockups, so they can't be filed under a colour. We therefore lead with the
 *   selected colour's mockup and keep the rest as shared shots.
 * - `altText` is null on every Printify image, so alt text is generated from
 *   the product title and colour instead of shipping empty alts.
 * - Mockup counts vary (8 here, 12 there, occasionally 1). Thumbnails and dots
 *   disappear entirely at a single image rather than rendering a lone stub.
 *
 * CLS: every slide and thumb is an aspect-ratio box, so the layout is stable
 * before any image decodes.
 */
export function ProductGallery({
  images,
  title,
  colorName,
  colorImageUrl,
}: {
  images: GalleryImage[];
  title: string;
  /** Currently selected colourway, used for alt text and lead-image choice. */
  colorName?: string;
  /** The selected variant's image — the colour's primary mockup. */
  colorImageUrl?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Lead with the selected colour's mockup, then everything else in order.
  const ordered = useMemo(() => {
    if (!colorImageUrl) return images;
    const lead = images.find((image) => image.url === colorImageUrl);
    if (!lead) return images;
    return [lead, ...images.filter((image) => image.url !== colorImageUrl)];
  }, [images, colorImageUrl]);

  /**
   * Every mockup in this catalogue is the same shot: the whole garment on
   * white, with the print rendered small enough to be unreadable at any size
   * the page actually displays it. The words are the product, so the shopper
   * has to be able to read them without pinch-zooming.
   *
   * Printify places every design at the same chest-hit position, so a fixed
   * crop of the lead mockup is a reliable detail shot. Verified against the
   * catalogue's extremes — the 106-character design and the widest bold
   * lockups both sit inside the frame with margin. Same URL as the lead image,
   * so it costs a second decode and no extra bytes.
   */
  const slides = useMemo(() => {
    const list: Array<{image: GalleryImage; detail: boolean}> = [];
    ordered.forEach((image, position) => {
      list.push({image, detail: false});
      if (position === 0) list.push({image, detail: true});
    });
    return list;
  }, [ordered]);

  const scrollTo = useCallback((next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[next] as HTMLElement | undefined;
    if (slide) {
      track.scrollTo({left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth'});
    }
    setIndex(next);
  }, []);

  // Colour change resets to the lead mockup so the shopper sees what they picked.
  useEffect(() => {
    setIndex(0);
    const track = trackRef.current;
    if (track) track.scrollTo({left: 0});
  }, [colorImageUrl]);

  // Keep the dots honest while the shopper swipes.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        setIndex(Math.round(track.scrollLeft / width));
      });
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomed(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoomed]);

  if (!ordered.length) {
    return (
      <div className="sx-gallery">
        <div className="sx-gallery__slide sx-gallery__slide--empty" aria-hidden="true" />
      </div>
    );
  }

  const altFor = (position: number) =>
    position === 0
      ? `${title}${colorName ? ` in ${colorName}` : ''}`
      : `${title} — alternate view ${position + 1}`;

  const single = slides.length === 1;

  return (
    <div className="sx-gallery">
      <div
        className="sx-gallery__track"
        ref={trackRef}
        role="group"
        aria-label={`${title} images`}
      >
        {slides.map((slide, position) => (
          <button
            type="button"
            className={`sx-gallery__slide ${slide.detail ? 'sx-gallery__slide--detail' : ''}`.trim()}
            key={`${slide.image.id ?? slide.image.url}-${slide.detail ? 'detail' : 'full'}`}
            onClick={() => setZoomed(true)}
            aria-label={
              slide.detail ? `Zoom the print on ${title}` : `Zoom ${altFor(position)}`
            }
          >
            <Image
              data={slide.image}
              alt={
                slide.detail
                  ? `Close-up of the print on ${title}`
                  : slide.image.altText || altFor(position)
              }
              aspectRatio="1/1"
              // The detail slide magnifies 2.6x, so it needs far more source
              // than its layout box implies (see --print-zoom).
              sizes={slide.detail ? '100vw' : '(min-width: 990px) 46vw, 100vw'}
              // The first two slides are the same URL and the LCP element.
              loading={position <= 1 ? 'eager' : 'lazy'}
              fetchPriority={position === 0 ? 'high' : undefined}
            />
            {slide.detail ? (
              <span className="sx-gallery__detailtag">The print</span>
            ) : null}
          </button>
        ))}
      </div>

      {!single ? (
        <>
          <div className="sx-gallery__dots" role="group" aria-label="Gallery position">
            {slides.map((slide, position) => (
              <button
                type="button"
                key={`dot-${slide.image.id ?? slide.image.url}-${position}`}
                className="sx-gallery__dot"
                aria-current={position === index}
                aria-label={`Go to image ${position + 1}`}
                onClick={() => scrollTo(position)}
              />
            ))}
          </div>

          <div className="sx-gallery__thumbs" role="group" aria-label="Choose an image">
            {slides.map((slide, position) => (
              <button
                type="button"
                key={`thumb-${slide.image.id ?? slide.image.url}-${position}`}
                className={`sx-gallery__thumb ${position === index ? 'is-on' : ''} ${
                  slide.detail ? 'sx-gallery__thumb--detail' : ''
                }`.trim()}
                onClick={() => scrollTo(position)}
                aria-label={
                  slide.detail
                    ? `Show the print close-up`
                    : `Show ${altFor(position)}`
                }
                aria-pressed={position === index}
              >
                <Image
                  data={slide.image}
                  alt=""
                  aspectRatio="1/1"
                  sizes={slide.detail ? '220px' : '80px'}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      ) : null}

      {zoomed ? (
        <div
          className="sx-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, enlarged`}
        >
          <button
            type="button"
            className="sx-lightbox__scrim"
            aria-label="Close image"
            onClick={() => setZoomed(false)}
          />
          <div className="sx-lightbox__inner">
            {/* Native pinch-zoom: the scroller allows scale, so mobile gets
                real two-finger zoom without a gesture library. */}
            <img
              className={`sx-lightbox__img ${
                slides[index]?.detail ? 'sx-lightbox__img--detail' : ''
              }`.trim()}
              src={slides[index]?.image.url ?? slides[0].image.url}
              alt={
                slides[index]?.detail
                  ? `Close-up of the print on ${title}`
                  : altFor(index)
              }
              width={slides[index]?.image.width ?? undefined}
              height={slides[index]?.image.height ?? undefined}
            />
          </div>
          <button
            type="button"
            className="sx-lightbox__close"
            onClick={() => setZoomed(false)}
          >
            Close ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
