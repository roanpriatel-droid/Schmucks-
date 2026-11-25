import type {Route} from './+types/gifts._index';
import {Link} from 'react-router';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {GIFTS} from '~/data/gifts';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'Funny T-Shirt Gift Guides',
    description:
      'Funny t-shirt gifts by who they’re for: couples, boyfriends, girlfriends, coworkers, drinkers, white elephant swaps and your worst friend.',
    path: '/gifts',
  });

export default function Gifts() {
  return (
    <div className="sx-gifts">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'Gift Guides'}]} />
          <p className="sx-pagehead__eyebrow">Gift Guides</p>
          <h1 className="sx-pagehead__title">Gifts for Idiots</h1>
          <p className="sx-pagehead__desc">
            Funny shirts, sorted by who&rsquo;s getting one. Every shirt is
            US$42, printed to order, and two or more take 10% off
            automatically.
          </p>
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          <ul className="sx-gifthub">
            {GIFTS.map((gift, index) => (
              <li key={gift.slug}>
                <Link
                  to={`/gifts/${gift.slug}`}
                  className={`sx-gifthub__card ${index % 3 === 0 ? 'is-ketchup' : index % 3 === 1 ? 'is-mustard' : 'is-ink'}`}
                  prefetch="intent"
                >
                  <span className="sx-gifthub__kicker">Gift guide</span>
                  <span className="sx-gifthub__title sx-display">
                    {gift.title}
                  </span>
                  <span className="sx-gifthub__desc">{gift.intro[0]}</span>
                  <span className="sx-gifthub__cta">Shop the guide →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
