import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {Reveal} from '~/components/Reveal';
import {FEATURED_SHELVES} from '~/data/shelves';
import {shelfDescription} from '~/lib/shelves';

export type BoardCollection = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  image?: {
    id?: string | null;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  products: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      featuredImage?: {
        id?: string | null;
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      } | null;
    }>;
  };
} | null;

/**
 * Full-bleed menu board — three shelves presented as oversized deli panels.
 *
 * A shelf that hasn't been tagged yet still gets its panel, with a restocking
 * line where the thumbnails would be. Never render a hole in the board.
 */
export function ShelfBoards({boards}: {boards: BoardCollection[]}) {
  return (
    <section className="sx-board-section" aria-labelledby="sx-board-title">
      <div className="sx-wrap">
        <div className="sx-section-head sx-section-head--onink">
          <div>
            <p className="sx-eyebrow sx-eyebrow--mustard">Today&rsquo;s Board</p>
            <h2 className="sx-section-title" id="sx-board-title">
              Pick a Shelf
            </h2>
          </div>
          <p className="sx-section-note">
            Six shelves, all of them a confession of some kind. Here are three.
          </p>
        </div>
      </div>

      <div className="sx-boards">
        {FEATURED_SHELVES.map((shelf, index) => {
          const collection = boards.find(
            (item) => item?.handle === shelf.handle,
          );
          const products = collection?.products?.nodes ?? [];
          const description = shelfDescription(
            shelf.handle,
            collection?.description,
          );

          return (
            <Reveal key={shelf.handle} delay={index * 60}>
              <Link
                className="sx-board"
                to={`/collections/${shelf.handle}`}
                prefetch="intent"
              >
                <div className="sx-board__head">
                  <span className="sx-board__no sx-display">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="sx-board__title sx-display">{shelf.title}</h3>
                </div>
                <p className="sx-board__desc">{description}</p>

                <div className="sx-board__strip">
                  {products.length ? (
                    products.slice(0, 3).map((product) => (
                      <span className="sx-board__thumb" key={product.id}>
                        {product.featuredImage ? (
                          <Image
                            data={product.featuredImage}
                            alt={product.featuredImage.altText || product.title}
                            aspectRatio="1/1"
                            sizes="120px"
                            loading="lazy"
                          />
                        ) : (
                          <span className="sx-board__thumb-empty" />
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="sx-board__restock">
                      Restocking — check back after the next tagging run.
                    </span>
                  )}
                </div>

                <span className="sx-board__cta">
                  {products.length ? 'Browse the shelf' : 'See the shelf'} →
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="sx-wrap sx-boards__all">
        <Link className="sx-btn sx-btn--mustard" to="/tees">
          All six shelves
        </Link>
      </div>
    </section>
  );
}
