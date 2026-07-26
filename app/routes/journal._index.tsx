import type {Route} from './+types/journal._index';
import {Link} from 'react-router';
import {JOURNAL} from '~/data/journal';
import {Mel} from '~/components/brand/Brand';
import {Reveal} from '~/components/Reveal';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, {
    title: 'The Journal',
    description:
      'Styling, materials, and the occasional bad idea in long form. The Schmucks Journal.',
  });

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function JournalIndex() {
  return (
    <div className="sx-journal">
      <section className="sx-pagehead">
        <div className="sx-wrap">
          <Breadcrumbs crumbs={[{label: 'The Journal'}]} />
          <p className="sx-pagehead__eyebrow">Words, For Some Reason</p>
          <h1 className="sx-pagehead__title">The Journal</h1>
          <p className="sx-pagehead__desc">
            Styling notes, what goes into the shirts, and the thinking behind a
            brand for idiots. No fluff, no filler, occasionally useful.
          </p>
        </div>
      </section>
      <section className="sx-shop">
        <div className="sx-wrap">
          <Reveal className="sx-journal-grid">
            {JOURNAL.map((a) => (
              <Link key={a.slug} className="sx-jcard" to={`/journal/${a.slug}`} prefetch="intent">
                <div className="sx-jcard__media">
                  <Mel />
                </div>
                <div className="sx-jcard__body">
                  <span className="sx-jcard__meta">
                    {a.tag} · {a.readingTime}
                  </span>
                  <h2 className="sx-jcard__title">{a.title}</h2>
                  <p className="sx-jcard__dek">{a.dek}</p>
                  <span className="sx-jcard__date">{fmt(a.date)}</span>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
