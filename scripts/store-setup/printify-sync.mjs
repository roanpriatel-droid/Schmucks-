#!/usr/bin/env node
/**
 * Pushes Printify products to Shopify — only the ones Shopify doesn't already
 * have. DRY-RUN BY DEFAULT; add --apply.
 *
 *   node scripts/store-setup/printify-sync.mjs
 *   node scripts/store-setup/printify-sync.mjs --apply [--limit=20]
 *
 * Why the care: the Shopify store already holds ~391 of these designs, and
 * Printify reports none of its products as published. Publishing blindly would
 * duplicate the catalogue. So for each Printify product:
 *
 *   - already linked (Printify knows its Shopify id) ............ skip
 *   - a Shopify product has the same SKUs ....................... skip (orders route)
 *   - a Shopify product has the same title but not the SKUs ..... REPORT ONLY —
 *       it exists in Shopify but orders for it will NOT reach Printify.
 *       Fixing that means replacing the Shopify copy with a Printify-published
 *       one, which changes its URL; that's a decision, not a script default.
 *   - nothing in Shopify ........................................ publish
 *
 * Before publishing, the product's Printify tags are set to `tees` plus any
 * shelf tags inferred from a matching Shopify product, so it lands on the
 * right shelves the moment it arrives.
 */
import {APPLY, argValue, change, log, paginate, printify, printifyProducts, normTitle, sleep} from './lib.mjs';
import {BASE_TAG, PRINTIFY_SHOP_ID} from './config.mjs';

const SHOPIFY_PRODUCTS = `#graphql
  query SyncProducts($after: String) {
    products(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { id title tags variants(first: 100) { nodes { sku } } }
    }
  }`;

const limit = Number(argValue('limit') ?? Infinity);

async function main() {
  log(APPLY ? 'APPLY MODE' : 'DRY RUN — add --apply to publish.');
  const shopify = await paginate(SHOPIFY_PRODUCTS, (d) => d.products);
  const bySku = new Map();
  for (const p of shopify) for (const v of p.variants.nodes) if (v.sku) bySku.set(v.sku, p);
  const byTitle = new Map(shopify.map((p) => [normTitle(p.title), p]));

  const pf = await printifyProducts(PRINTIFY_SHOP_ID);
  const buckets = {linked: [], skuMatch: [], titleOnly: [], toPublish: []};
  for (const p of pf) {
    if (p.external?.id) buckets.linked.push(p);
    else if (p.variants.some((v) => v.is_enabled && bySku.has(v.sku))) buckets.skuMatch.push(p);
    else if (byTitle.has(normTitle(p.title))) buckets.titleOnly.push(p);
    else buckets.toPublish.push(p);
  }
  log(`Printify ${pf.length} · Shopify ${shopify.length}`);
  log(`  linked already ............ ${buckets.linked.length}`);
  log(`  in Shopify, SKUs match .... ${buckets.skuMatch.length}`);
  log(`  in Shopify, UNLINKED ...... ${buckets.titleOnly.length}  ← orders for these won't reach Printify`);
  log(`  not in Shopify — publish .. ${buckets.toPublish.length}`);

  let done = 0;
  for (const p of buckets.toPublish) {
    if (done >= limit) break;
    const tags = [...new Set([...(p.tags ?? []), BASE_TAG])];
    await change(`publish "${p.title}" (tags: ${tags.join(', ')})`, async () => {
      if (tags.length !== (p.tags ?? []).length) {
        await printify(`/shops/${PRINTIFY_SHOP_ID}/products/${p.id}.json`, {method: 'PUT', body: {tags}});
      }
      await printify(`/shops/${PRINTIFY_SHOP_ID}/products/${p.id}/publish.json`, {
        method: 'POST',
        body: {title: true, description: true, images: true, variants: true, tags: true, keyFeatures: true, shipping_template: true},
      });
      await sleep(400); // Printify publishes asynchronously; don't flood it.
    });
    done++;
  }
  if (buckets.titleOnly.length) {
    log('\nUnlinked (exists in Shopify, Printify does not know about it) — first 20:');
    for (const p of buckets.titleOnly.slice(0, 20)) log(`  - ${p.title}`);
  }
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}`);
  process.exit(1);
});
