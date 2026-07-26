/**
 * Shelf helpers shared by the collection routes, the nav and the homepage.
 *
 * Smart collections fill by tag, so "empty" is a normal state here, not an
 * error — everything below is built so a zero-product shelf still renders a
 * deliberate page.
 */
import {getShelf} from '~/data/shelves';

/** "47 items of questionable judgment" */
export function countLine(count: number) {
  if (count === 1) return '1 item of questionable judgment';
  return `${count} items of questionable judgment`;
}

/** Copy for a shelf that exists but currently holds nothing. */
export function restockingCopy(title?: string) {
  return {
    heading: 'Restocking this shelf',
    body: title
      ? `${title} is between drops. The tagging runs on its own schedule and this shelf fills itself when it does.`
      : 'This shelf is between drops. It fills itself when the next batch is tagged.',
  };
}

/**
 * Description shown under a collection title: the shop's own words when the
 * collection has them, otherwise our in-voice line so the page is never bare.
 */
export function shelfDescription(
  handle: string,
  storeDescription?: string | null,
) {
  const trimmed = storeDescription?.trim();
  if (trimmed) return trimmed;
  const shelf = getShelf(handle);
  return shelf?.board ?? shelf?.descriptor ?? null;
}

/* ------------------------------------------------------------------ *
 * Faceted filtering (size + colorway)
 * ------------------------------------------------------------------ */

/** Option names we surface as filters, lowercased for comparison. */
const SIZE_NAMES = ['size'];
const COLOR_NAMES = ['color', 'colour', 'colorway', 'colourway'];

export type FacetKind = 'size' | 'color';

export function facetKindFor(optionName: string): FacetKind | null {
  const name = optionName.trim().toLowerCase();
  if (SIZE_NAMES.includes(name)) return 'size';
  if (COLOR_NAMES.includes(name)) return 'color';
  return null;
}

/** Sort sizes in wearing order rather than alphabetically. */
const SIZE_ORDER = ['xs', 's', 'm', 'l', 'xl', '2xl', 'xxl', '3xl', 'xxxl'];

export function compareSizes(a: string, b: string) {
  const ia = SIZE_ORDER.indexOf(a.trim().toLowerCase());
  const ib = SIZE_ORDER.indexOf(b.trim().toLowerCase());
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

/**
 * Read `?size=M&size=L&color=Black` into Storefront `ProductFilter` inputs.
 * Values within one facet are OR'd by the API; separate facets are AND'd.
 */
export function activeFacets(searchParams: URLSearchParams) {
  return {
    size: searchParams.getAll('size').filter(Boolean),
    color: searchParams.getAll('color').filter(Boolean),
  };
}

export function toProductFilters(
  searchParams: URLSearchParams,
  optionNames: {size?: string; color?: string},
) {
  const {size, color} = activeFacets(searchParams);
  const filters: Array<{variantOption: {name: string; value: string}}> = [];

  for (const value of size) {
    filters.push({variantOption: {name: optionNames.size ?? 'Size', value}});
  }
  for (const value of color) {
    filters.push({variantOption: {name: optionNames.color ?? 'Color', value}});
  }
  return filters;
}

/** Toggle one facet value, preserving everything else (and resetting paging). */
export function toggledFacetSearch(
  searchParams: URLSearchParams,
  kind: FacetKind,
  value: string,
) {
  const next = new URLSearchParams(searchParams);
  const current = next.getAll(kind);
  next.delete(kind);
  const isOn = current.includes(value);
  for (const item of current) {
    if (item !== value) next.append(kind, item);
  }
  if (!isOn) next.append(kind, value);
  // Cursor pagination is invalid once the filter set changes.
  next.delete('cursor');
  next.delete('direction');
  return next.toString();
}

export function clearedFacetSearch(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams);
  next.delete('size');
  next.delete('color');
  next.delete('cursor');
  next.delete('direction');
  return next.toString();
}
