#!/usr/bin/env node
/**
 * READ-ONLY. Inventories the Shopify store and the Printify shop, writes a
 * full JSON backup to scripts/store-setup/backups/<timestamp>/ and prints a
 * report of what's missing. Run this before (and after) apply.mjs.
 *
 *   node scripts/store-setup/audit.mjs
 */
import {join} from 'node:path';
import {
  HERE,
  gql,
  paginate,
  printify,
  printifyProducts,
  writeJson,
  stamp,
  normTitle,
  log,
} from './lib.mjs';
import {COLLECTIONS, MENUS, PRINTIFY_SHOP_ID, BASE_TAG, PRODUCT_TYPE} from './config.mjs';

const out = join(HERE, 'backups', stamp());

const Q = {
  shop: `#graphql
    query AuditShop {
      shop {
        id name myshopifyDomain email contactEmail currencyCode
        primaryDomain { host url sslEnabled }
        plan { publicDisplayName partnerDevelopment shopifyPlus }
        shopPolicies { type title url body }
      }
      publications(first: 50) {
        nodes { id name autoPublish catalog { title } }
      }
    }`,
  products: `#graphql
    query AuditProducts($after: String) {
      products(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id title handle status vendor productType tags createdAt
          category { id fullName }
          seo { title description }
          resourcePublicationsCount { count }
          media(first: 20) { nodes { id alt mediaContentType } }
          variants(first: 100) {
            nodes { id sku price inventoryPolicy selectedOptions { name value } }
          }
        }
      }
    }`,
  collections: `#graphql
    query AuditCollections($after: String) {
      collections(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id handle title sortOrder descriptionHtml
          seo { title description }
          productsCount { count }
          resourcePublicationsCount { count }
          ruleSet { appliedDisjunctively rules { column relation condition } }
          image { url altText }
        }
      }
    }`,
  content: `#graphql
    query AuditContent {
      menus(first: 50) {
        nodes { id handle title items { title type url resourceId items { title type url resourceId } } }
      }
      pages(first: 100) { nodes { id handle title isPublished } }
      blogs(first: 20) { nodes { id handle title articlesCount { count } } }
      discountNodes(first: 100) {
        nodes {
          id
          discount {
            __typename
            ... on DiscountAutomaticBasic { title status startsAt endsAt }
            ... on DiscountCodeBasic { title status codesCount { count } }
            ... on DiscountAutomaticFreeShipping { title status }
            ... on DiscountCodeFreeShipping { title status }
          }
        }
      }
      webhookSubscriptions(first: 50) { nodes { id topic uri } }
    }`,
  publishedOn: `#graphql
    query AuditPublishedOn($after: String, $pub: ID!) {
      products(first: 250, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { id published: publishedOnPublication(publicationId: $pub) }
      }
    }`,
  collectionsOn: `#graphql
    query AuditCollectionsOn($after: String, $pub: ID!) {
      collections(first: 250, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { handle published: publishedOnPublication(publicationId: $pub) }
      }
    }`,
};

async function main() {
  log(`Backing up to ${out}\n`);
  const report = [];
  const say = (line = '') => {
    report.push(line);
    log(line);
  };

  // ---------------------------------------------------------- Shopify
  const {shop, publications} = await gql(Q.shop);
  writeJson(out, 'shop.json', {shop, publications});
  say(`# Store audit — ${shop.name} (${shop.myshopifyDomain})`);
  say(`Primary domain: ${shop.primaryDomain.url} · currency ${shop.currencyCode} · plan ${shop.plan.publicDisplayName}`);
  say(`Customer email: ${shop.contactEmail}`);
  say();

  const products = await paginate(Q.products, (d) => d.products);
  writeJson(out, 'products.json', products);
  const collections = await paginate(Q.collections, (d) => d.collections);
  writeJson(out, 'collections.json', collections);
  const content = await gql(Q.content);
  writeJson(out, 'content.json', content);

  // Publication coverage
  say('## Sales channels (publications)');
  const pubReport = [];
  for (const pub of publications.nodes) {
    const ps = await paginate(Q.publishedOn, (d) => d.products, {pub: pub.id});
    const cs = await paginate(Q.collectionsOn, (d) => d.collections, {pub: pub.id});
    const p = ps.filter((x) => x.published).length;
    const c = cs.filter((x) => x.published).length;
    pubReport.push({id: pub.id, name: pub.name, catalog: pub.catalog?.title, products: p, collections: c});
    say(`- ${pub.name ?? pub.catalog?.title}: ${p}/${products.length} products, ${c}/${collections.length} collections${pub.autoPublish ? ' (auto-publish)' : ''}`);
  }
  writeJson(out, 'publication-coverage.json', pubReport);
  say();

  // Products
  say(`## Products: ${products.length}`);
  const by = (f) => products.reduce((m, p) => ((m[f(p)] = (m[f(p)] ?? 0) + 1), m), {});
  say(`- status: ${JSON.stringify(by((p) => p.status))}`);
  say(`- vendor: ${JSON.stringify(by((p) => p.vendor || '(blank)'))}`);
  say(`- productType: ${JSON.stringify(by((p) => p.productType || '(blank)'))}`);
  say(`- category: ${JSON.stringify(by((p) => p.category?.fullName ?? '(none)'))}`);
  say(`- prices: ${JSON.stringify(by((p) => [...new Set(p.variants.nodes.map((v) => v.price))].join('/')))}`);
  say(`- missing "${BASE_TAG}" tag: ${products.filter((p) => !p.tags.includes(BASE_TAG)).length}`);
  say(`- missing SEO description: ${products.filter((p) => !p.seo.description).length}`);
  say(`- media without alt text: ${products.reduce((n, p) => n + p.media.nodes.filter((m) => !m.alt).length, 0)}`);
  say(`- products with no images: ${products.filter((p) => p.media.nodes.length === 0).length}`);
  say(`- inventory policy DENY (would sell out, wrong for print-on-demand): ${products.filter((p) => p.variants.nodes.some((v) => v.inventoryPolicy === 'DENY')).length}`);
  const shelfTags = COLLECTIONS.flatMap((c) => c.rules.filter((r) => r.column === 'TAG').map((r) => r.condition));
  const untagged = products.filter((p) => !p.tags.some((t) => shelfTags.includes(t) && t !== BASE_TAG));
  say(`- on no themed shelf: ${untagged.length}`);
  say(`- product type ≠ ${PRODUCT_TYPE}: ${products.filter((p) => p.productType !== PRODUCT_TYPE).length}`);
  say();

  // Collections
  say('## Collections');
  for (const want of COLLECTIONS) {
    const have = collections.find((c) => c.handle === want.handle);
    if (!have) say(`- ✗ ${want.handle} — MISSING`);
    else
      say(
        `- ${have.productsCount.count ? '✓' : '⚠'} ${want.handle}: ${have.productsCount.count} products, ` +
          `${have.ruleSet ? 'smart' : 'manual'}, sort ${have.sortOrder}, ` +
          `${have.descriptionHtml ? 'has' : 'NO'} description, ${have.image ? 'has' : 'no'} image, ` +
          `on ${have.resourcePublicationsCount.count} channels`,
      );
  }
  const extra = collections.filter((c) => !COLLECTIONS.some((w) => w.handle === c.handle));
  if (extra.length) say(`- other collections: ${extra.map((c) => c.handle).join(', ')}`);
  say();

  // Content
  say('## Content');
  for (const m of MENUS) {
    const have = content.menus.nodes.find((x) => x.handle === m.handle);
    say(`- menu ${m.handle}: ${have ? `${have.items.length} items` : 'MISSING'}`);
  }
  say(`- policies published: ${shop.shopPolicies.filter((p) => p.body?.trim()).map((p) => p.type).join(', ') || 'none'}`);
  say(`- pages: ${content.pages.nodes.map((p) => p.handle).join(', ') || 'none'}`);
  say(`- blogs: ${content.blogs.nodes.map((b) => `${b.handle} (${b.articlesCount.count})`).join(', ') || 'none'}`);
  say(`- discounts: ${content.discountNodes.nodes.map((d) => `${d.discount.title} [${d.discount.status}]`).join(', ') || 'none'}`);
  say(`- webhooks: ${content.webhookSubscriptions.nodes.length}`);
  say();

  // ---------------------------------------------------------- Printify
  say('## Printify ↔ Shopify');
  const pf = await printifyProducts(PRINTIFY_SHOP_ID);
  writeJson(out, 'printify-products.json', pf);
  const linked = pf.filter((p) => p.external?.id);
  const skuToShopify = new Map();
  for (const p of products) for (const v of p.variants.nodes) if (v.sku) skuToShopify.set(v.sku, p.id);
  const shopifyByTitle = new Map(products.map((p) => [normTitle(p.title), p]));

  const rows = pf.map((p) => {
    const skuHit = p.variants.find((v) => v.is_enabled && skuToShopify.has(v.sku));
    const titleHit = shopifyByTitle.get(normTitle(p.title));
    return {
      printifyId: p.id,
      title: p.title,
      linkedExternalId: p.external?.id ?? null,
      shopifyBySku: skuHit ? skuToShopify.get(skuHit.sku) : null,
      shopifyByTitle: titleHit?.id ?? null,
    };
  });
  writeJson(out, 'printify-shopify-map.json', rows);
  const bySku = rows.filter((r) => r.shopifyBySku).length;
  const byTitleOnly = rows.filter((r) => !r.shopifyBySku && r.shopifyByTitle).length;
  const none = rows.filter((r) => !r.shopifyBySku && !r.shopifyByTitle && !r.linkedExternalId).length;
  say(`- Printify products: ${pf.length} (linked to Shopify via Printify: ${linked.length})`);
  say(`- matched to a Shopify product by SKU (orders will route to Printify): ${bySku}`);
  say(`- matched by title only (UNLINKED — orders will NOT reach Printify): ${byTitleOnly}`);
  say(`- not in Shopify at all: ${none}`);
  const orphans = products.filter(
    (p) => !rows.some((r) => r.shopifyBySku === p.id || r.shopifyByTitle === p.id),
  );
  say(`- Shopify products with no Printify source: ${orphans.length}`);
  writeJson(out, 'shopify-orphans.json', orphans.map((p) => ({id: p.id, title: p.title})));

  const orders = await printify(`/shops/${PRINTIFY_SHOP_ID}/orders.json?limit=1`);
  say(`- Printify orders received: ${orders.total ?? 0}`);

  writeJson(out, 'REPORT.json', {report});
  const {writeFileSync} = await import('node:fs');
  writeFileSync(join(out, 'REPORT.md'), report.join('\n') + '\n');
  log(`\nReport + backup: ${out}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
