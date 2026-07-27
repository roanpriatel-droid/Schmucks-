/**
 * The shelves — the live smart collections in the Shopify store.
 *
 * Handles are the kebab-case of the collection titles. Smart collections fill
 * by tag, so any of these can legitimately be empty at any moment; every
 * surface that reads this file must handle an empty shelf (see
 * `~/lib/shelves` for the restocking state).
 *
 * `descriptor` is our own in-voice one-liner. The Shopify collection
 * description wins when it exists — this is the fallback so a shelf never
 * renders naked, and it's what the nav dropdown shows.
 *
 * `handleAliases` covers the ambiguous auto-generated handles (Shopify drops
 * "&" from "Terms & Conditions"); the collection route redirects to the real
 * one rather than 404ing a nav link.
 */
export type Shelf = {
  handle: string;
  title: string;
  descriptor: string;
  /** Longer in-voice line for the oversized menu-board panels. */
  board?: string;
  handleAliases?: string[];
};

/** Thematic shelves — the actual categories a customer browses. */
export const SHELVES: Shelf[] = [
  {
    handle: 'the-confessional',
    title: 'The Confessional',
    descriptor: 'Things you’d only admit to a stranger.',
    board:
      'For the admissions that don’t survive daylight. Wear it and skip the conversation entirely.',
  },
  {
    handle: 'terms-conditions',
    title: 'Terms & Conditions',
    descriptor: 'The fine print of being you.',
    board:
      'Everything you agreed to without reading. Now printed large enough to be legally noticed.',
    handleAliases: ['terms-and-conditions', 'terms'],
  },
  {
    handle: 'courtship',
    title: 'Courtship',
    descriptor: 'Romance, allegedly.',
    board:
      'Flirting, dating, and whatever it is you’re currently calling it. Results not guaranteed.',
  },
  {
    handle: 'vices',
    title: 'Vices',
    descriptor: 'Habits you’ve stopped apologising for.',
    board:
      'The ones you’ve made peace with. No judgement here — we printed them, after all.',
  },
  {
    handle: 'errata',
    title: 'Errata',
    descriptor: 'Mistakes, printed permanently.',
    board:
      'Corrections issued far too late to help. A permanent record of a temporary lapse.',
  },
  {
    handle: 'petty-crimes',
    title: 'Petty Crimes',
    descriptor: 'Nothing indictable. Probably.',
    board:
      'Minor offences against taste, decency, and the people who have to look at you.',
  },
];

/** Merchandising shelves — the counter, not the categories. */
export const COUNTER: Shelf[] = [
  {
    handle: 'best-sellers',
    title: 'Best Sellers',
    descriptor: 'The ones other idiots bought.',
    board: 'Popular by public demand. Take that however you like.',
  },
  {
    handle: 'new-arrivals',
    title: 'New Arrivals',
    descriptor: 'Fresh regrets, still warm.',
    board: 'Straight off the press and not yet regretted.',
  },
  {
    handle: 'the-pair-programme',
    title: 'The Pair Programme',
    descriptor: 'Two shirts, one bad idea.',
    board:
      'Pick two. Wear them with someone you can tolerate in public.',
  },
  {
    handle: 'tees',
    title: 'Tees',
    descriptor: 'Everything we print, in one place.',
  },
];

export const ALL_SHELVES = [...SHELVES, ...COUNTER];

/** Handles of the three shelves that get the oversized menu-board panels. */
export const FEATURED_SHELF_HANDLES = [
  'the-confessional',
  'courtship',
  'petty-crimes',
] as const;

export const FEATURED_SHELVES = FEATURED_SHELF_HANDLES.map(
  (handle) => SHELVES.find((shelf) => shelf.handle === handle)!,
);

export function getShelf(handle?: string | null): Shelf | undefined {
  if (!handle) return undefined;
  return ALL_SHELVES.find(
    (shelf) => shelf.handle === handle || shelf.handleAliases?.includes(handle),
  );
}

/** The canonical handle for a possibly-aliased one, or null if unknown. */
export function canonicalShelfHandle(handle: string): string | null {
  const shelf = ALL_SHELVES.find((item) =>
    item.handleAliases?.includes(handle),
  );
  return shelf ? shelf.handle : null;
}
