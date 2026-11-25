import {Link} from 'react-router';
import type {ShelfGuide as Guide} from '~/data/shelfContent';
import {ALL_SHELVES} from '~/data/shelves';
import {GIFTS} from '~/data/gifts';

/**
 * The words under a shelf's grid: a short guide, a three-question FAQ and
 * where to go next. Gives each shelf page something to rank on (SEO) and a
 * quotable answer for AI assistants (GEO), without pushing the products down.
 */
export function ShelfGuide({guide}: {guide: Guide}) {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {'@type': 'Answer', text: item.a},
    })),
  };
  const related = guide.related
    .map((handle) => ALL_SHELVES.find((s) => s.handle === handle))
    .filter(Boolean);
  const gifts = (guide.gifts ?? [])
    .map((slug) => GIFTS.find((g) => g.slug === slug))
    .filter(Boolean);

  return (
    <section className="sx-guide" aria-labelledby="sx-guide-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqJsonLd)}}
      />
      <div className="sx-wrap sx-guide__inner">
        <div className="sx-guide__copy">
          <p className="sx-eyebrow">The shelf, explained</p>
          <h2 className="sx-guide__title sx-display" id="sx-guide-title">
            {guide.heading}
          </h2>
          {guide.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="sx-guide__p">
              {paragraph}
            </p>
          ))}
          {related.length || gifts.length ? (
            <nav className="sx-guide__next" aria-label="Related">
              {related.map((shelf) => (
                <Link
                  key={shelf!.handle}
                  to={`/collections/${shelf!.handle}`}
                  className="sx-guide__chip"
                  prefetch="intent"
                >
                  {shelf!.title}
                </Link>
              ))}
              {gifts.map((gift) => (
                <Link
                  key={gift!.slug}
                  to={`/gifts/${gift!.slug}`}
                  className="sx-guide__chip sx-guide__chip--gift"
                  prefetch="intent"
                >
                  {gift!.short}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
        <div className="sx-guide__faq">
          <p className="sx-eyebrow">Asked at the counter</p>
          <dl className="sx-guide__qa">
            {guide.faq.map((item) => (
              <div key={item.q} className="sx-guide__qa-item">
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
