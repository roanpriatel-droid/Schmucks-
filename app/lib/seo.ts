/**
 * Shared SEO/meta helpers.
 *
 * Every route builds its `meta` through `pageMeta()` so titles, descriptions,
 * canonicals and social cards stay consistent. The canonical/OG URLs need an
 * absolute origin, which the root loader exposes as `origin` — we read it back
 * out of the root match inside the meta function.
 */
import type {MetaDescriptor} from 'react-router';

export const SITE_NAME = 'SCHMUCKS';
export const SITE_TAGLINE = 'Fine Apparel for Idiots';
export const SITE_DESCRIPTION =
  'Fine Apparel for Idiots. Funny graphic tees, $25 flat, unisex S–3XL, printed to order on cotton that can take a joke.';

/** Shape of the meta-function args we actually read (kept loose on purpose). */
export type MetaArgsLike = {
  location?: {pathname?: string; search?: string};
  matches?: ReadonlyArray<{id?: string; data?: unknown} | undefined>;
};

export type SeoInput = {
  /** Page title WITHOUT the brand suffix. Omit for the homepage. */
  title?: string;
  description?: string;
  /** Path to canonicalise, defaults to the current pathname (search dropped). */
  path?: string;
  /** Absolute or root-relative image for social cards. */
  image?: string;
  type?: 'website' | 'article' | 'product';
  /** Set on pages that must not be indexed (search results, account, cart). */
  noindex?: boolean;
};

function rootOrigin(args?: MetaArgsLike): string | undefined {
  const root = args?.matches?.find((match) => match?.id === 'root');
  const data = root?.data as {origin?: string} | undefined;
  return data?.origin;
}

function absolute(origin: string | undefined, value: string | undefined) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (!origin) return undefined;
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

/** `Tees — SCHMUCKS` / `SCHMUCKS — Fine Apparel for Idiots` on the homepage. */
export function formatTitle(title?: string) {
  const trimmed = title?.trim();
  if (!trimmed) return `${SITE_NAME} — ${SITE_TAGLINE}`;
  if (trimmed.toUpperCase().includes(SITE_NAME)) return trimmed;
  return `${trimmed} — ${SITE_NAME}`;
}

/**
 * Collapse rich text / HTML into a clean meta description.
 * Shopify page + policy bodies arrive as HTML, so strip tags and entities.
 */
export function toDescription(input?: string | null, max = 160) {
  if (!input) return undefined;
  const text = input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return undefined;
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

export function pageMeta(
  args: MetaArgsLike | undefined,
  input: SeoInput = {},
): MetaDescriptor[] {
  const origin = rootOrigin(args);
  const path = input.path ?? args?.location?.pathname ?? '/';
  const canonical = absolute(origin, path);
  const image = absolute(origin, input.image ?? '/apple-touch-icon.png');
  const title = formatTitle(input.title);
  const description = input.description ?? SITE_DESCRIPTION;

  const descriptors: MetaDescriptor[] = [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:type', content: input.type ?? 'website'},
    {property: 'og:site_name', content: SITE_NAME},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];

  if (canonical) {
    descriptors.push({tagName: 'link', rel: 'canonical', href: canonical});
    descriptors.push({property: 'og:url', content: canonical});
  }
  if (image) {
    descriptors.push({property: 'og:image', content: image});
    descriptors.push({name: 'twitter:image', content: image});
  }
  if (input.noindex) {
    descriptors.push({name: 'robots', content: 'noindex, follow'});
  }

  return descriptors;
}
