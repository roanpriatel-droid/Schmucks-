import {ReviewStars} from '~/components/ReviewStars';

/**
 * Full reviews section — the Judge.me embed slot.
 *
 * Judge.me's widget script replaces `.jdgm-widget.jdgm-review-widget` in
 * place, keyed by `data-id`. BRAND §8 forbids inventing reviews, so nothing is
 * fabricated here — but a section headed "Reviews" that says "nobody has said
 * anything yet" tells every visitor the product has never sold, which is worse
 * than saying nothing at all. The mount point ships either way so the widget
 * appears the moment the app is installed; only the empty shouting is gone.
 */
export function ReviewsSection({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const numericId = productId.split('/').pop() ?? productId;

  return (
    <div
      className="jdgm-widget jdgm-review-widget sx-reviews-embed"
      data-id={numericId}
      data-product-title={productTitle}
    >
      <ReviewStars
        productId={productId}
        productTitle={productTitle}
        className="sx-visually-hidden"
      />
    </div>
  );
}
