import {ReviewStars} from '~/components/ReviewStars';

/**
 * Full reviews section — the Judge.me embed slot.
 *
 * Judge.me's widget script replaces `.jdgm-widget.jdgm-review-widget` in
 * place, keyed by `data-id`. Until the app is installed there is nothing to
 * show, and BRAND §8 forbids inventing anything, so the section states the
 * honest position and invites the first one instead of rendering hollow stars.
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
    <section className="sx-reviews-section" aria-labelledby="sx-reviews-title">
      <div className="sx-wrap">
        <div className="sx-section-head">
          <div>
            <p className="sx-eyebrow">What People Say</p>
            <h2 className="sx-section-title" id="sx-reviews-title">
              Reviews
            </h2>
          </div>
          <p className="sx-section-note">
            We don&rsquo;t write our own reviews and we don&rsquo;t buy them.
            When there are real ones, they appear here.
          </p>
        </div>

        <div
          className="jdgm-widget jdgm-review-widget sx-reviews-embed"
          data-id={numericId}
          data-product-title={productTitle}
        >
          <div className="sx-reviews-embed__empty">
            <p className="sx-display">Nobody has said anything yet.</p>
            <p>
              Bought this one? Tell us what happened when you wore it. The good
              ones go straight on the page, unedited.
            </p>
          </div>
        </div>

        <ReviewStars
          productId={productId}
          productTitle={productTitle}
          className="sx-visually-hidden"
        />
      </div>
    </section>
  );
}
