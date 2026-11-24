#!/usr/bin/env node
/**
 * Builds the store out to match the storefront. DRY-RUN BY DEFAULT — prints
 * every change and makes none. Add --apply to write.
 *
 *   node scripts/store-setup/apply.mjs                 # dry run, all steps
 *   node scripts/store-setup/apply.mjs --apply         # do it
 *   node scripts/store-setup/apply.mjs --apply --only=collections,publish
 *
 * Steps (default set): collections, products, publish, menus, policies
 * Opt-in steps (commercial decisions — never run unless named):
 *   --stack-and-save        automatic 2+/3/4+ = 10/20/30% (what the site is built for)
 *   --welcome-code          FIRSTMISTAKE, 15% once per customer (instead of the above)
 *   --free-shipping         automatic free shipping: US ≥ $50, Canada ≥ $75
 *   --overwrite-policies    replace policies that already have text
 *   --publish-to=all        publish to every channel, not just Online Store / Hydrogen / Shop
 *
 * Idempotent: safe to re-run. Run audit.mjs first — it writes a backup.
 */
import {
  ARGS,
  APPLY,
  argValue,
  change,
  gql,
  mutate,
  paginate,
  log,
} from './lib.mjs';
import {
  BRAND,
  BASE_TAG,
  COLLECTIONS,
  MENUS,
  POLICIES,
  PRODUCT_TYPE,
  STACK_TIERS,
  TSHIRT_CATEGORY,
  WELCOME_CODE,
  collectionHtml,
  collectionSeo,
} from './config.mjs';

const DEFAULT_STEPS = ['shipping', 'markets', 'collections', 'products', 'publish', 'menus', 'policies'];
const only = argValue('only');
const steps = only ? only.split(',') : DEFAULT_STEPS;
const want = (s) => steps.includes(s);

if (ARGS.has('--stack-and-save') && ARGS.has('--welcome-code')) {
  console.error('Pick one of --stack-and-save / --welcome-code: they would stack.');
  process.exit(1);
}

// ------------------------------------------------------------------ queries

const COLLECTIONS_Q = `#graphql
  query SetupCollections($after: String) {
    collections(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle title descriptionHtml sortOrder seo { title description } ruleSet { rules { column } } }
    }
  }`;

const COLLECTION_CREATE = `#graphql
  mutation SetupCollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }`;

const COLLECTION_UPDATE = `#graphql
  mutation SetupCollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }`;

const PRODUCTS_Q = `#graphql
  query SetupProducts($after: String) {
    products(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id title handle vendor productType tags
        category { id }
        seo { title description }
        media(first: 20) { nodes { id alt mediaContentType } }
        variants(first: 100) {
          nodes { id inventoryPolicy inventoryItem { tracked } }
        }
      }
    }
  }`;

const PRODUCT_UPDATE = `#graphql
  mutation SetupProductUpdate($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product { id }
      userErrors { field message }
    }
  }`;

const TAGS_ADD = `#graphql
  mutation SetupTagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node { id }
      userErrors { field message }
    }
  }`;

const FILE_UPDATE = `#graphql
  mutation SetupFileAlt($files: [FileUpdateInput!]!) {
    fileUpdate(files: $files) {
      files { id }
      userErrors { field message }
    }
  }`;

const VARIANTS_UPDATE = `#graphql
  mutation SetupVariantPolicy($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product { id }
      userErrors { field message }
    }
  }`;

const PUBLICATIONS_Q = `#graphql
  query SetupPublications {
    publications(first: 50) { nodes { id name catalog { title } } }
  }`;

const UNPUBLISHED_PRODUCTS_Q = `#graphql
  query SetupUnpublishedProducts($after: String, $pub: ID!) {
    products(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { id status published: publishedOnPublication(publicationId: $pub) }
    }
  }`;

const UNPUBLISHED_COLLECTIONS_Q = `#graphql
  query SetupUnpublishedCollections($after: String, $pub: ID!) {
    collections(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { id handle published: publishedOnPublication(publicationId: $pub) }
    }
  }`;

const PUBLISH = `#graphql
  mutation SetupPublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }`;

const MENUS_Q = `#graphql
  query SetupMenus {
    menus(first: 50) { nodes { id handle title items { title } } }
  }`;

const MENU_CREATE = `#graphql
  mutation SetupMenuCreate($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu { id handle }
      userErrors { field message }
    }
  }`;

const MENU_UPDATE = `#graphql
  mutation SetupMenuUpdate($id: ID!, $title: String!, $handle: String, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, handle: $handle, items: $items) {
      menu { id handle }
      userErrors { field message }
    }
  }`;

const POLICIES_Q = `#graphql
  query SetupPolicies {
    shop { shopPolicies { type body } }
  }`;

const POLICY_UPDATE = `#graphql
  mutation SetupPolicyUpdate($shopPolicy: ShopPolicyInput!) {
    shopPolicyUpdate(shopPolicy: $shopPolicy) {
      shopPolicy { id type }
      userErrors { field message }
    }
  }`;

const DISCOUNTS_Q = `#graphql
  query SetupDiscounts {
    discountNodes(first: 100) {
      nodes {
        id
        discount {
          __typename
          ... on DiscountAutomaticBasic { title }
          ... on DiscountCodeBasic { title }
          ... on DiscountAutomaticFreeShipping { title }
        }
      }
    }
  }`;

const AUTO_BASIC_CREATE = `#graphql
  mutation SetupAutoBasic($d: DiscountAutomaticBasicInput!) {
    discountAutomaticBasicCreate(automaticBasicDiscount: $d) {
      automaticDiscountNode { id }
      userErrors { field message }
    }
  }`;

const CODE_BASIC_CREATE = `#graphql
  mutation SetupCodeBasic($d: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $d) {
      codeDiscountNode { id }
      userErrors { field message }
    }
  }`;

const AUTO_SHIP_CREATE = `#graphql
  mutation SetupAutoShip($d: DiscountAutomaticFreeShippingInput!) {
    discountAutomaticFreeShippingCreate(freeShippingAutomaticDiscount: $d) {
      automaticDiscountNode { id }
      userErrors { field message }
    }
  }`;

const MARKETS_Q = `#graphql
  query SetupMarkets {
    shop { currencyCode shipsToCountries }
    markets(first: 50) {
      nodes {
        id name handle status
        conditions { regionsCondition { regions(first: 250) { nodes { ... on MarketRegionCountry { code } } } } }
      }
    }
  }`;

const MARKET_CREATE = `#graphql
  mutation SetupMarketCreate($input: MarketCreateInput!) {
    marketCreate(input: $input) {
      market { id handle }
      userErrors { field message }
    }
  }`;

const SHIPPING_Q = `#graphql
  query SetupShipping {
    locations(first: 20, includeLegacy: true) { nodes { id name fulfillmentService { handle } } }
    deliveryProfiles(first: 20) {
      nodes {
        id name default
        profileLocationGroups {
          locationGroup { id locations(first: 20, includeLegacy: true) { nodes { id } } }
          locationGroupZones(first: 1) { nodes { zone { id } } }
        }
      }
    }
  }`;

const PROFILE_UPDATE = `#graphql
  mutation SetupProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id }
      userErrors { field message }
    }
  }`;

// ------------------------------------------------------------------ helpers

/** "I Peaked At X — Schmucks · N°. 394" → "I Peaked At X" */
function designName(title) {
  return title.replace(/\s+[—–-]\s+Schmucks.*$/i, '').replace(/^[“"]|[”"]$/g, '').trim();
}

function clip(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

const counts = {};
const bump = (k) => (counts[k] = (counts[k] ?? 0) + 1);

// ------------------------------------------------------------------ steps

async function stepCollections() {
  log('\n▸ Collections');
  const existing = await paginate(COLLECTIONS_Q, (d) => d.collections);
  for (const c of COLLECTIONS) {
    const have = existing.find((x) => x.handle === c.handle);
    const seo = collectionSeo(c);
    if (!have) {
      await change(`create smart collection "${c.title}" (${c.handle})`, () =>
        mutate(
          COLLECTION_CREATE,
          {
            input: {
              title: c.title,
              handle: c.handle,
              descriptionHtml: collectionHtml(c),
              sortOrder: c.sortOrder,
              seo,
              ruleSet: {appliedDisjunctively: false, rules: c.rules},
            },
          },
          'collectionCreate',
        ),
      );
      bump('collections created');
      continue;
    }
    // Fill blanks only — never overwrite copy someone wrote in admin.
    const input = {id: have.id};
    if (!have.descriptionHtml?.trim()) input.descriptionHtml = collectionHtml(c);
    if (!have.seo?.title && !have.seo?.description) input.seo = seo;
    if (c.sortOrder === 'BEST_SELLING' && have.sortOrder !== 'BEST_SELLING') input.sortOrder = 'BEST_SELLING';
    if (c.sortOrder === 'CREATED_DESC' && have.handle === 'new-arrivals' && have.sortOrder !== 'CREATED_DESC')
      input.sortOrder = 'CREATED_DESC';
    if (Object.keys(input).length > 1) {
      await change(`update "${c.title}": ${Object.keys(input).filter((k) => k !== 'id').join(', ')}`, () =>
        mutate(COLLECTION_UPDATE, {input}, 'collectionUpdate'),
      );
      bump('collections updated');
    } else log(`  ✓ ${c.handle}`);
  }
}

async function stepProducts() {
  log('\n▸ Products');
  const products = await paginate(PRODUCTS_Q, (d) => d.products);
  log(`  ${products.length} products`);
  const takenHandles = new Set(products.map((p) => p.handle));
  for (const p of products) {
    const name = designName(p.title);
    const input = {id: p.id};
    if (!p.vendor || /printify|my store/i.test(p.vendor)) input.vendor = BRAND;
    if (!p.productType) input.productType = PRODUCT_TYPE;
    if (!p.category) input.category = TSHIRT_CATEGORY;
    // Printify handles carry the boilerplate: "…-schmucks-n-394". Keep the
    // design name only, with a redirect from the old URL.
    const clean = p.handle.replace(/-schmucks-n-\d+$/, '');
    if (clean !== p.handle && clean.length > 2 && !takenHandles.has(clean)) {
      input.handle = clean;
      input.redirectNewHandle = true;
      takenHandles.add(clean);
    }
    if (!p.seo.title && !p.seo.description) {
      input.seo = {
        title: clip(`${name} T-Shirt | ${BRAND}`, 70),
        description: clip(
          `“${name}” — a funny graphic tee from ${BRAND}. Heavyweight 100% cotton, unisex fit, printed to order. Sizes S–3XL.`,
          155,
        ),
      };
    }
    if (Object.keys(input).length > 1) {
      await change(`${p.handle}: set ${Object.keys(input).filter((k) => k !== 'id').join(', ')}`, () =>
        mutate(PRODUCT_UPDATE, {product: input}, 'productUpdate'),
      );
      bump('products updated');
    }

    if (!p.tags.includes(BASE_TAG) && (p.productType || PRODUCT_TYPE) === PRODUCT_TYPE) {
      await change(`${p.handle}: add tag "${BASE_TAG}"`, () =>
        mutate(TAGS_ADD, {id: p.id, tags: [BASE_TAG]}, 'tagsAdd'),
      );
      bump('products tagged');
    }

    const noAlt = p.media.nodes.filter((m) => m.mediaContentType === 'IMAGE' && !m.alt);
    if (noAlt.length) {
      await change(`${p.handle}: alt text on ${noAlt.length} images`, () =>
        mutate(
          FILE_UPDATE,
          {
            files: noAlt.map((m, i) => ({
              id: m.id,
              alt: clip(`${BRAND} “${name}” graphic tee${i ? ` — view ${i + 1}` : ''}`, 512),
            })),
          },
          'fileUpdate',
        ),
      );
      bump('products alt-texted');
    }

    // Print-on-demand never runs out: a tracked variant set to DENY would
    // show "sold out" the moment the counter hits zero.
    const deny = p.variants.nodes.filter((v) => v.inventoryItem?.tracked && v.inventoryPolicy === 'DENY');
    if (deny.length) {
      await change(`${p.handle}: ${deny.length} variants → keep selling when stock counter is 0`, () =>
        mutate(
          VARIANTS_UPDATE,
          {productId: p.id, variants: deny.map((v) => ({id: v.id, inventoryPolicy: 'CONTINUE'}))},
          'productVariantsBulkUpdate',
        ),
      );
      bump('products inventory policy');
    }
  }
}

async function targetPublications() {
  const {publications} = await gql(PUBLICATIONS_Q);
  const all = publications.nodes.map((p) => ({...p, label: p.name ?? p.catalog?.title ?? p.id}));
  if (argValue('publish-to') === 'all') return all;
  const match = /online store|hydrogen|headless|shop\b|schmucks|storefront/i;
  const picked = all.filter((p) => match.test(p.label) || match.test(p.catalog?.title ?? ''));
  log(`  channels: ${all.map((p) => `${picked.includes(p) ? '●' : '○'} ${p.label}`).join('  ')}`);
  return picked;
}

async function stepPublish() {
  log('\n▸ Publish to sales channels');
  const pubs = await targetPublications();
  for (const pub of pubs) {
    const products = await paginate(UNPUBLISHED_PRODUCTS_Q, (d) => d.products, {pub: pub.id});
    const todo = products.filter((p) => !p.published && p.status === 'ACTIVE');
    const cols = await paginate(UNPUBLISHED_COLLECTIONS_Q, (d) => d.collections, {pub: pub.id});
    const wanted = new Set([...COLLECTIONS.map((c) => c.handle), 'frontpage']);
    const ctodo = cols.filter((c) => !c.published && wanted.has(c.handle));
    log(`  ${pub.label}: ${todo.length} products and ${ctodo.length} collections to publish`);
    if (!APPLY) {
      if (todo.length || ctodo.length) log(`  [dry-run] publish them to ${pub.label}`);
      continue;
    }
    for (const item of [...ctodo, ...todo]) {
      await mutate(PUBLISH, {id: item.id, input: [{publicationId: pub.id}]}, 'publishablePublish');
      bump(`published → ${pub.label}`);
    }
  }
}

function toMenuItems(items, collectionIds, update = false) {
  return items.map((item) => {
    const col = COLLECTIONS.find((c) => c.handle === item.collection);
    const id = item.collection ? collectionIds.get(item.collection) : null;
    const node = id
      ? {title: item.title ?? col.title, type: 'COLLECTION', resourceId: id}
      : {title: item.title ?? col?.title, type: item.type ?? 'HTTP', url: item.url ?? `/collections/${item.collection}`};
    if (item.items) node.items = toMenuItems(item.items, collectionIds, update);
    return node;
  });
}

async function stepMenus() {
  log('\n▸ Menus');
  const cols = await paginate(COLLECTIONS_Q, (d) => d.collections);
  const ids = new Map(cols.map((c) => [c.handle, c.id]));
  const {menus} = await gql(MENUS_Q);
  for (const m of MENUS) {
    const have = menus.nodes.find((x) => x.handle === m.handle);
    const items = toMenuItems(m.items, ids);
    if (!have) {
      await change(`create menu ${m.handle} (${items.length} items)`, () =>
        mutate(MENU_CREATE, {title: m.title, handle: m.handle, items}, 'menuCreate'),
      );
    } else {
      const same = have.items.map((i) => i.title).join('|') === items.map((i) => i.title).join('|');
      if (same) {
        log(`  ✓ ${m.handle}`);
        continue;
      }
      await change(`replace menu ${m.handle}: [${have.items.map((i) => i.title).join(', ')}] → [${items.map((i) => i.title).join(', ')}]`, () =>
        mutate(MENU_UPDATE, {id: have.id, title: have.title, handle: m.handle, items}, 'menuUpdate'),
      );
    }
    bump('menus');
  }
}

async function stepPolicies() {
  log('\n▸ Policies');
  const {shop} = await gql(POLICIES_Q);
  for (const [type, body] of Object.entries(POLICIES)) {
    const have = shop.shopPolicies.find((p) => p.type === type);
    if (have?.body?.trim() && !ARGS.has('--overwrite-policies')) {
      log(`  ✓ ${type} already has text (use --overwrite-policies to replace)`);
      continue;
    }
    await change(`publish ${type}`, () =>
      mutate(POLICY_UPDATE, {shopPolicy: {type, body}}, 'shopPolicyUpdate'),
    );
    bump('policies');
  }
}

/**
 * Sell outside Canada. Printify's shipping profile already covers the US, EU,
 * Australia and the rest of the world, but Shopify only had a Canada market,
 * so nobody else could check out. Both new markets price in USD at a manual
 * rate of 1.0 against the shop currency, so a $42 product is US$42 — what the
 * site and the policies say — whatever the store's base currency is.
 */
async function stepMarkets() {
  log('\n▸ Markets');
  const {shop, markets} = await gql(MARKETS_Q);
  const covered = new Set(
    markets.nodes.flatMap((m) => m.conditions?.regionsCondition?.regions.nodes.map((r) => r.code) ?? []),
  );
  const usd = shop.currencyCode === 'USD'
    ? {baseCurrency: 'USD', localCurrencies: false}
    : {baseCurrency: 'USD', baseCurrencyManualRate: '1.0', localCurrencies: false};
  const plan = [
    {name: 'United States', handle: 'us', countries: ['US']},
    {
      name: 'International',
      handle: 'international',
      countries: shop.shipsToCountries.filter((c) => !['US', 'CA'].includes(c) && c !== 'ZZ'),
    },
  ];
  for (const m of plan) {
    const countries = m.countries.filter((c) => !covered.has(c));
    if (markets.nodes.some((x) => x.handle === m.handle) || countries.length === 0) {
      log(`  ✓ ${m.name}`);
      continue;
    }
    await change(`create market ${m.name} (${countries.length} countries, USD)`, () =>
      mutate(
        MARKET_CREATE,
        {
          input: {
            name: m.name,
            handle: m.handle,
            status: 'ACTIVE',
            conditions: {regionsCondition: {regions: countries.map((countryCode) => ({countryCode}))}},
            currencySettings: usd,
          },
        },
        'marketCreate',
      ),
    );
    bump('markets');
  }
}

/**
 * Printify creates its own shipping profile (US/CA/EU/AU/rest-of-world rates)
 * but can leave its location group empty — a profile with nowhere to ship
 * from quotes no rates, so checkout has no shipping option and can't be
 * completed. Attach the Printify fulfilment location to every non-default
 * profile whose location group has zones but no location.
 */
async function stepShipping() {
  log('\n▸ Shipping profiles');
  const {locations, deliveryProfiles} = await gql(SHIPPING_Q);
  const printifyLoc = locations.nodes.find((l) => l.fulfillmentService?.handle === 'printify');
  if (!printifyLoc) return log('  no Printify location — is the Printify app installed?');
  for (const profile of deliveryProfiles.nodes.filter((p) => !p.default)) {
    for (const g of profile.profileLocationGroups) {
      const hasZones = g.locationGroupZones.nodes.length > 0;
      if (!hasZones || g.locationGroup.locations.nodes.length > 0) {
        log(`  ✓ ${profile.name}`);
        continue;
      }
      await change(`attach Printify location to "${profile.name}"`, () =>
        mutate(
          PROFILE_UPDATE,
          {
            id: profile.id,
            profile: {
              locationGroupsToUpdate: [{id: g.locationGroup.id, locationsToAdd: [printifyLoc.id]}],
            },
          },
          'deliveryProfileUpdate',
        ),
      );
      bump('shipping profiles fixed');
    }
  }
}

async function existingDiscountTitles() {
  const {discountNodes} = await gql(DISCOUNTS_Q);
  return new Set(discountNodes.nodes.map((n) => n.discount.title));
}

const NO_COMBINE = {productDiscounts: false, orderDiscounts: false, shippingDiscounts: true};

async function stepStackAndSave() {
  log('\n▸ Stack & Save (automatic)');
  const titles = await existingDiscountTitles();
  for (const tier of STACK_TIERS) {
    const title = `Stack & Save — ${tier.quantity}${tier.quantity === STACK_TIERS.at(-1).quantity ? '+' : ''} shirts, ${tier.percent}% off`;
    if (titles.has(title)) {
      log(`  ✓ ${title}`);
      continue;
    }
    await change(`create "${title}"`, () =>
      mutate(
        AUTO_BASIC_CREATE,
        {
          d: {
            title,
            startsAt: new Date().toISOString(),
            combinesWith: NO_COMBINE,
            minimumRequirement: {quantity: {greaterThanOrEqualToQuantity: String(tier.quantity)}},
            customerGets: {value: {percentage: tier.percent / 100}, items: {all: true}},
          },
        },
        'discountAutomaticBasicCreate',
      ),
    );
    bump('discounts');
  }
}

async function stepWelcomeCode() {
  log('\n▸ Welcome code');
  const titles = await existingDiscountTitles();
  const title = `${WELCOME_CODE.code} — ${WELCOME_CODE.percent}% off a first order`;
  if (titles.has(title)) return log(`  ✓ ${title}`);
  await change(`create code ${WELCOME_CODE.code}`, () =>
    mutate(
      CODE_BASIC_CREATE,
      {
        d: {
          title,
          code: WELCOME_CODE.code,
          startsAt: new Date().toISOString(),
          appliesOncePerCustomer: true,
          combinesWith: NO_COMBINE,
          context: {all: 'ALL'},
          customerGets: {value: {percentage: WELCOME_CODE.percent / 100}, items: {all: true}},
        },
      },
      'discountCodeBasicCreate',
    ),
  );
  bump('discounts');
}

async function stepFreeShipping() {
  log('\n▸ Free shipping (automatic)');
  const titles = await existingDiscountTitles();
  for (const [country, min] of [
    ['US', 50],
    ['CA', 75],
  ]) {
    const title = `Free shipping — ${country} orders $${min}+`;
    if (titles.has(title)) {
      log(`  ✓ ${title}`);
      continue;
    }
    await change(`create "${title}"`, () =>
      mutate(
        AUTO_SHIP_CREATE,
        {
          d: {
            title,
            startsAt: new Date().toISOString(),
            combinesWith: {productDiscounts: true, orderDiscounts: true, shippingDiscounts: false},
            minimumRequirement: {subtotal: {greaterThanOrEqualToSubtotal: String(min)}},
            destination: {countries: {add: [country]}},
          },
        },
        'discountAutomaticFreeShippingCreate',
      ),
    );
    bump('discounts');
  }
}

// ------------------------------------------------------------------ run

async function main() {
  log(APPLY ? 'APPLY MODE — writing to the store.' : 'DRY RUN — nothing will change. Add --apply to write.');
  if (want('shipping')) await stepShipping();
  if (want('markets')) await stepMarkets();
  if (want('collections')) await stepCollections();
  if (want('products')) await stepProducts();
  // Publish after collections exist so new ones go out too.
  if (want('publish')) await stepPublish();
  if (want('menus')) await stepMenus();
  if (want('policies')) await stepPolicies();
  if (ARGS.has('--stack-and-save')) await stepStackAndSave();
  if (ARGS.has('--welcome-code')) await stepWelcomeCode();
  if (ARGS.has('--free-shipping')) await stepFreeShipping();
  log(`\nSummary${APPLY ? '' : ' (would do)'}: ${JSON.stringify(counts)}`);
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}`);
  process.exit(1);
});
