import {Form} from 'react-router';

export const SORT_OPTIONS = [
  {value: 'featured', label: 'Featured'},
  {value: 'newest', label: 'Newest'},
  {value: 'price-asc', label: 'Price: Low to High'},
  {value: 'price-desc', label: 'Price: High to Low'},
  {value: 'title', label: 'A–Z'},
];

/** Maps a sort param to Storefront collection.products sort args. */
export function collectionSortArgs(sort?: string | null) {
  switch (sort) {
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false} as const;
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true} as const;
    case 'newest':
      return {sortKey: 'CREATED', reverse: true} as const;
    case 'title':
      return {sortKey: 'TITLE', reverse: false} as const;
    default:
      return {sortKey: 'COLLECTION_DEFAULT', reverse: false} as const;
  }
}

/** Maps a sort param to Storefront products (catalog) sort args. */
export function catalogSortArgs(sort?: string | null) {
  switch (sort) {
    case 'price-asc':
      return {sortKey: 'PRICE', reverse: false} as const;
    case 'price-desc':
      return {sortKey: 'PRICE', reverse: true} as const;
    case 'newest':
      return {sortKey: 'CREATED_AT', reverse: true} as const;
    case 'title':
      return {sortKey: 'TITLE', reverse: false} as const;
    default:
      return {sortKey: 'BEST_SELLING', reverse: false} as const;
  }
}

export function CollectionControls({
  count,
  sort,
}: {
  count: number;
  sort: string;
}) {
  return (
    <div className="sx-collctl">
      <span className="sx-collctl__count">
        {count} {count === 1 ? 'style' : 'styles'}
      </span>
      <Form method="get" className="sx-collctl__sort">
        <label htmlFor="sort">Sort</label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Form>
    </div>
  );
}
