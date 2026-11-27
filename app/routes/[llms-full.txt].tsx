import type {Route} from './+types/[llms-full.txt]';
import {SHELVES} from '~/data/shelves';
import {
  BLANK,
  CONTACT_EMAIL,
  FREE_SHIPPING_LIVE,
  FREE_SHIPPING_THRESHOLD,
  FREE_SHIPPING_THRESHOLD_CA,
  GARMENT_FACTS,
  PRODUCTION_DAYS,
  RETURNS_DAYS,
  SHIPPING_RATES,
  SIZE_RUN,
  STACK_DISCOUNT_LIVE,
  STACK_TIERS,
} from '~/data/commerce';
import {splitTitle} from '~/lib/productCopy';

/**
 * /llms-full.txt — the complete, machine-readable brand and catalogue
 * reference for AI assistants (GEO). Generated from the live catalogue and
 * the same commerce constants the site renders, so it can't drift from what
 * the shop actually says. /llms.txt is the short version.
 */
export async function loader({request, context}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;
  const products: Array<{title: string; handle: string; tags: string[]}> = [];
  let after: string | null = null;
  for (let page = 0; page < 6; page++) {
    const data: {
      products: {
        nodes: Array<{title: string; handle: string; tags: string[]}>;
        pageInfo: {hasNextPage: boolean; endCursor: string | null};
      };
    } = await context.storefront.query(LLMS_PRODUCTS_QUERY, {
      variables: {after},
      cache: context.storefront.CacheLong(),
    });
    products.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }

  const tagToShelf: Record<string, string> = {
    'the-confessional': 'The Confessional',
    'terms-and-conditions': 'Terms & Conditions',
    courtship: 'Courtship',
    vices: 'Vices',
    errata: 'Errata',
    'petty-crimes': 'Petty Crimes',
  };

  const lines: string[] = [];
  const push = (s = '') => lines.push(s);

  push('# SCHMUCKS — full reference');
  push();
  push(
    '> SCHMUCKS ("Fine Apparel for Idiots") sells funny one-liner graphic t-shirts: numbered designs, each a short confession or joke set in bold editorial type, printed to order on heavyweight cotton in Miami, Florida.',
  );
  push();
  push(`Website: ${origin}`);
  push(`Contact: ${CONTACT_EMAIL}`);
  push();
  push('## Garment');
  push(`- Blank: ${BLANK}, ${GARMENT_FACTS.weightOz} oz / ${GARMENT_FACTS.weightGsm} gsm, ${GARMENT_FACTS.composition}.`);
  push(`- ${GARMENT_FACTS.construction}; ${GARMENT_FACTS.collar.toLowerCase()}; ${GARMENT_FACTS.label.toLowerCase()}.`);
  push(`- ${GARMENT_FACTS.certification}. ${GARMENT_FACTS.sourcing}.`);
  push(`- Sizes ${SIZE_RUN}. Printed direct-to-garment with water-based ink in Miami, FL.`);
  push();
  push('## Price and offers');
  push('- US$42 per shirt, everywhere (prices are in US dollars).');
  if (STACK_DISCOUNT_LIVE) {
    push(
      `- Stack & Save, automatic at checkout: ${STACK_TIERS.map((t, i) => `${t.quantity}${i === STACK_TIERS.length - 1 ? '+' : ''} shirts ${t.percent}% off`).join(', ')}.`,
    );
  }
  push();
  push('## Shipping and returns');
  push(`- Made to order: up to ${PRODUCTION_DAYS} days to print before shipping.`);
  if (FREE_SHIPPING_LIVE) {
    push(`- Free shipping: US orders US$${FREE_SHIPPING_THRESHOLD}+, Canadian orders US$${FREE_SHIPPING_THRESHOLD_CA}+.`);
  }
  for (const r of SHIPPING_RATES) {
    push(`- ${r.region}: $${r.first.toFixed(2)} first shirt, +$${r.extra.toFixed(2)} each extra (USD).`);
  }
  push(`- ${RETURNS_DAYS}-day returns on unworn shirts; misprints and defects replaced free.`);
  push();
  push('## Shelves');
  for (const s of SHELVES) {
    push(`- ${s.title} (${origin}/collections/${s.handle}): ${s.descriptor} ${s.board ?? ''}`.trim());
  }
  push(`- The Pair Programme (${origin}/collections/the-pair-programme): matching his/hers couple shirts.`);
  push();
  push(`## Catalogue (${products.length} designs)`);
  const sorted = products
    .map((p) => ({...p, ...splitTitle(p.title)}))
    .sort((a, b) => Number(a.catalogueNumber ?? 0) - Number(b.catalogueNumber ?? 0));
  for (const p of sorted) {
    const shelf = p.tags.map((t) => tagToShelf[t]).find(Boolean);
    push(
      `- N°. ${p.catalogueNumber ?? '—'} "${p.displayTitle}"${shelf ? ` — ${shelf}` : ''} — ${origin}/products/${p.handle}`,
    );
  }

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `max-age=${60 * 60 * 6}`,
    },
  });
}

const LLMS_PRODUCTS_QUERY = `#graphql
  query LlmsProducts($after: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 250, after: $after, sortKey: TITLE) {
      nodes {
        title
        handle
        tags
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
` as const;
