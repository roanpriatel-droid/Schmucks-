/**
 * Review placeholder, wired for Judge.me.
 *
 * There are no reviews yet and BRAND §8 forbids inventing any, so this renders
 * the *slot* rather than a rating: the Judge.me preview badge mounts into the
 * data attributes below once the app is installed, and until then the shopper
 * sees an honest "no reviews yet" line instead of five hollow stars.
 *
 * Judge.me's widget script looks for `.jdgm-widget` / `.jdgm-preview-badge`
 * with `data-id` and `data-product-title`, which is exactly what's emitted.
 */
export function ReviewStars({
  productId,
  productTitle,
  className = '',
}: {
  productId: string;
  productTitle: string;
  className?: string;
}) {
  // Judge.me expects the numeric portion of the Shopify GID.
  const numericId = productId.split('/').pop() ?? productId;

  return (
    <div
      className={`sx-reviews-slot jdgm-widget jdgm-preview-badge ${className}`.trim()}
      data-id={numericId}
      data-product-title={productTitle}
    >
      {/* Replaced by the Judge.me badge when the app is installed. */}
      <span className="sx-reviews-slot__empty">
        No reviews yet — be the first to say something regrettable.
      </span>
    </div>
  );
}
