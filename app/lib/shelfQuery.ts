/**
 * How a shelf finds its products.
 *
 * The ten shelves are smart collections in admin, but as of 2026-07-26 none of
 * them are published to the Hydrogen sales channel — `collection(handle:)`
 * returns null for every one of them. The products *are* published and carry
 * the shelf tags, so a shelf resolves in this order:
 *
 *   1. the published collection, if it exists (preferred — merchandiser order)
 *   2. a tag query against the product catalogue (works today)
 *   3. a sort key, for the two shelves that aren't tag-based
 *   4. nothing — the restocking state
 *
 * When the collections are finally published, step 1 starts winning on its own
 * and none of this needs to change.
 */
import {getShelf} from '~/data/shelves';

export type ShelfSource =
  | {kind: 'tag'; tag: string}
  | {kind: 'sort'; sortKey: 'BEST_SELLING' | 'CREATED_AT'; reverse: boolean};

/**
 * Tag names as they exist on the products, which don't always match the
 * collection handle — the Terms & Conditions tag keeps its "and".
 */
const SHELF_TAGS: Record<string, string> = {
  'the-confessional': 'the-confessional',
  'terms-conditions': 'terms-and-conditions',
  courtship: 'courtship',
  vices: 'vices',
  errata: 'errata',
  'petty-crimes': 'petty-crimes',
  'the-pair-programme': 'the-pair-programme',
  tees: 'tees',
};

/** Shelves with no tag of their own, derived from catalogue order instead. */
const SHELF_SORTS: Record<string, ShelfSource> = {
  'best-sellers': {kind: 'sort', sortKey: 'BEST_SELLING', reverse: false},
  'new-arrivals': {kind: 'sort', sortKey: 'CREATED_AT', reverse: true},
};

export function shelfSource(handle: string): ShelfSource | null {
  if (SHELF_SORTS[handle]) return SHELF_SORTS[handle];
  const tag = SHELF_TAGS[handle];
  return tag ? {kind: 'tag', tag} : null;
}

/** Storefront `products(query:)` string for a shelf, or null if sort-based. */
export function shelfQueryString(handle: string): string | null {
  const source = shelfSource(handle);
  if (!source || source.kind !== 'tag') return null;
  return `tag:'${source.tag}'`;
}

/** Sort args for `products(sortKey:, reverse:)` when the shelf is sort-based. */
export function shelfSortArgs(handle: string) {
  const source = shelfSource(handle);
  if (source?.kind === 'sort') {
    return {sortKey: source.sortKey, reverse: source.reverse};
  }
  return {sortKey: 'BEST_SELLING' as const, reverse: false};
}

/** Title/description for a shelf that has no published collection behind it. */
export function shelfFallbackMeta(handle: string) {
  const shelf = getShelf(handle);
  return {
    title: shelf?.title ?? handle,
    description: shelf?.board ?? shelf?.descriptor ?? null,
  };
}
