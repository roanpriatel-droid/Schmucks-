/**
 * What the store should contain. Mirrors `app/data/shelves.ts` and
 * `app/data/commerce.ts` — when those change, change this too.
 *
 * Every apply step is idempotent: it creates what's missing and fills what's
 * blank, and never overwrites something a person edited in admin unless the
 * step says so.
 */

export const BRAND = 'SCHMUCKS';
export const CONTACT_EMAIL = 'roanpriatel379@gmail.com';
export const PRODUCT_TYPE = 'T-Shirt';
/** Shopify Standard Product Taxonomy: Apparel & Accessories › Clothing › Clothing Tops › T-Shirts */
export const TSHIRT_CATEGORY = 'gid://shopify/TaxonomyCategory/aa-1-13-8';
export const PRINTIFY_SHOP_ID = 28354424;

/** Every product that is a tee carries this tag; the Tees collection uses it. */
export const BASE_TAG = 'tees';

// ---------------------------------------------------------------- collections

const ALL_PRODUCTS = [{column: 'VARIANT_PRICE', relation: 'GREATER_THAN', condition: '0'}];
const tag = (t) => [{column: 'TAG', relation: 'EQUALS', condition: t}];

/**
 * handle → smart collection. `tag` values match the tags already on the
 * products (see app/lib/shelfQuery.ts — Terms & Conditions keeps its "and").
 */
export const COLLECTIONS = [
  {
    handle: 'the-confessional',
    title: 'The Confessional',
    rules: tag('the-confessional'),
    sortOrder: 'CREATED_DESC',
    descriptor: 'Things you’d only admit to a stranger.',
    board:
      'For the admissions that don’t survive daylight. Wear it and skip the conversation entirely.',
  },
  {
    handle: 'terms-conditions',
    title: 'Terms & Conditions',
    rules: tag('terms-and-conditions'),
    sortOrder: 'CREATED_DESC',
    descriptor: 'The fine print of being you.',
    board:
      'Everything you agreed to without reading. Now printed large enough to be legally noticed.',
  },
  {
    handle: 'courtship',
    title: 'Courtship',
    rules: tag('courtship'),
    sortOrder: 'CREATED_DESC',
    descriptor: 'Romance, allegedly.',
    board:
      'Flirting, dating, and whatever it is you’re currently calling it. Results not guaranteed.',
  },
  {
    handle: 'vices',
    title: 'Vices',
    rules: tag('vices'),
    sortOrder: 'CREATED_DESC',
    descriptor: 'Habits you’ve stopped apologising for.',
    board:
      'The ones you’ve made peace with. No judgement here — we printed them, after all.',
  },
  {
    handle: 'errata',
    title: 'Errata',
    rules: tag('errata'),
    sortOrder: 'CREATED_DESC',
    descriptor: 'Mistakes, printed permanently.',
    board:
      'Corrections issued far too late to help. A permanent record of a temporary lapse.',
  },
  {
    handle: 'petty-crimes',
    title: 'Petty Crimes',
    rules: tag('petty-crimes'),
    sortOrder: 'CREATED_DESC',
    descriptor: 'Nothing indictable. Probably.',
    board:
      'Minor offences against taste, decency, and the people who have to look at you.',
  },
  {
    handle: 'best-sellers',
    title: 'Best Sellers',
    rules: ALL_PRODUCTS,
    sortOrder: 'BEST_SELLING',
    descriptor: 'The ones other idiots bought.',
    board: 'Popular by public demand. Take that however you like.',
  },
  {
    handle: 'new-arrivals',
    title: 'New Arrivals',
    rules: ALL_PRODUCTS,
    sortOrder: 'CREATED_DESC',
    descriptor: 'Fresh regrets, still warm.',
    board: 'Straight off the press and not yet regretted.',
  },
  {
    handle: 'the-pair-programme',
    title: 'The Pair Programme',
    rules: tag('the-pair-programme'),
    sortOrder: 'MANUAL',
    descriptor: 'Two shirts, one bad idea.',
    board: 'Pick two. Wear them with someone you can tolerate in public.',
  },
  {
    handle: 'tees',
    title: 'Tees',
    rules: tag(BASE_TAG),
    sortOrder: 'CREATED_DESC',
    descriptor: 'Everything we print, in one place.',
    board:
      'Every shirt in the shop. Heavyweight cotton, printed to order, worn at your own risk.',
  },
];

export function collectionHtml(c) {
  return `<p><strong>${c.descriptor}</strong></p><p>${c.board}</p>`;
}

export function collectionSeo(c) {
  const description = `${c.descriptor} ${c.board}`;
  return {
    title: `${c.title} — Funny Graphic Tees | ${BRAND}`,
    description:
      description.length > 155 ? `${description.slice(0, 152).trimEnd()}…` : description,
  };
}

// ---------------------------------------------------------------- menus

/**
 * Shopify menus. The Hydrogen header/footer are hardcoded, so these serve the
 * Online Store, Shop app and any future theme — kept in step with the site.
 * `collection:` items resolve to the collection's GID at apply time.
 */
export const MENUS = [
  {
    handle: 'main-menu',
    title: 'Main menu',
    items: [
      {
        title: 'Tees',
        url: '/collections/tees',
        collection: 'tees',
        items: [
          'the-confessional',
          'terms-conditions',
          'courtship',
          'vices',
          'errata',
          'petty-crimes',
        ].map((h) => ({collection: h})),
      },
      {title: 'New Arrivals', url: '/collections/new-arrivals', collection: 'new-arrivals'},
      {title: 'Matching Sets', url: '/matching-sets'},
      {title: 'Lookbook', url: '/lookbook'},
      {title: 'Journal', url: '/journal'},
      {title: 'About', url: '/pages/about'},
    ],
  },
  {
    handle: 'footer',
    title: 'Footer menu',
    items: [
      {title: 'FAQ', url: '/pages/faq'},
      {title: 'Shipping & Returns', url: '/pages/shipping-returns'},
      {title: 'Size Guide', url: '/pages/size-guide'},
      {title: 'Care Guide', url: '/pages/care'},
      {title: 'Contact', url: '/pages/contact'},
      {title: 'Refund policy', url: '/policies/refund-policy'},
      {title: 'Shipping policy', url: '/policies/shipping-policy'},
      {title: 'Terms of service', url: '/policies/terms-of-service'},
      {title: 'Privacy policy', url: '/policies/privacy-policy'},
      {title: 'Search', url: '/search', type: 'SEARCH'},
    ],
  },
];

// ---------------------------------------------------------------- policies

/**
 * From POLICIES_DRAFT.md (the generous 30-day version the site already
 * promises). Governing law defaults to British Columbia, where the business
 * operates — confirm with a lawyer.
 */
export const POLICIES = {
  REFUND_POLICY: `
<h2>Thirty days. That’s the deal.</h2>
<p>If a shirt isn’t right, you have 30 days from delivery to send it back for a refund or an exchange. We won’t interrogate you about it, though we may ask what went wrong so we can stop doing it.</p>
<h3>What we need from you</h3>
<p>The shirt should be unworn and unwashed, with the tags on. It can have been tried on — that’s what trying on is for. It should not have been worn to a wedding first.</p>
<h3>Who pays</h3>
<p>Return postage is on you. If the shirt is faulty, misprinted, or we simply sent the wrong one, it’s on us — we’ll send a replacement or refund in full, whichever you prefer. Send a photo and we’ll sort it out without making you post anything back.</p>
<h3>How to start one</h3>
<p>Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> with your order number and what happened. We’ll reply with a return address and instructions.</p>
<h3>When you get your money</h3>
<p>Once the shirt reaches us we’ll inspect it and refund to your original payment method within 5 business days. Depending on your bank it can take a few more days to appear. Original shipping charges are not refunded unless the fault was ours.</p>
<h3>What we can’t take back</h3>
<p>Gift cards, and anything returned after the 30-day window has closed.</p>
<h3>Damaged in transit?</h3>
<p>Tell us within 7 days of delivery and we’ll replace it.</p>`.trim(),

  TERMS_OF_SERVICE: `
<h2>The basics</h2>
<p>By buying from Schmucks you agree to what’s below. If you don’t, don’t buy anything — no hard feelings.</p>
<h3>Who we are</h3>
<p>Schmucks is operated from British Columbia, Canada. Shirts are printed and dispatched from Miami, Florida.</p>
<h3>Orders</h3>
<p>Placing an order is an offer to buy. We can decline or cancel an order — if we do, you get a full refund, promptly. Every shirt is printed to order, so once production has started an order usually can’t be changed or cancelled. If you need to change something, email us fast and we’ll try.</p>
<h3>Prices</h3>
<p>Prices are in US dollars, except for orders delivered to Canada, which are charged in Canadian dollars. We can change prices at any time, but never after you’ve paid. Taxes and duties are calculated at checkout or charged on import, depending on where you are — see the shipping policy.</p>
<h3>The product</h3>
<p>Colours on a screen are not colours on cotton. Print position and size may vary very slightly between garments, which is what happens when a person prints a shirt rather than a machine stamping a billion identical ones.</p>
<h3>The designs</h3>
<p>The jokes on our shirts are ours. Don’t reproduce them for sale. Wearing one in public is not only permitted but encouraged.</p>
<h3>Liability</h3>
<p>We’re responsible for getting you the shirt you paid for, in the condition described. We’re not responsible for what happens to you while wearing it.</p>
<h3>Governing law</h3>
<p>These terms are governed by the laws of the Province of British Columbia and the federal laws of Canada applicable there.</p>
<h3>Contact</h3>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`.trim(),

  SHIPPING_POLICY: `
<h2>Made to order, then sent.</h2>
<p>Nothing sits in a warehouse. Your shirt is printed after you order it, which takes up to 10 days before it ships. Delivery time is on top of that and depends on where you are.</p>
<h3>Free shipping</h3>
<p><strong>United States:</strong> free on orders of US$50 or more. <strong>Canada:</strong> free on orders of C$75 or more. Two shirts gets you there either way. Applied automatically at checkout — no code.</p>
<h3>What it costs otherwise</h3>
<p>Charged by weight, so it goes up with the number of shirts rather than the price of them. Rates in US dollars:</p>
<table>
<thead><tr><th>Where</th><th>First shirt</th><th>Each extra</th></tr></thead>
<tbody>
<tr><td>United States</td><td>$4.95</td><td>+$2.40</td></tr>
<tr><td>Canada</td><td>$9.69</td><td>+$4.39</td></tr>
<tr><td>European Union</td><td>$13.49</td><td>+$4.00</td></tr>
<tr><td>Australia</td><td>$12.99</td><td>+$4.99</td></tr>
<tr><td>Rest of world</td><td>$10.39</td><td>+$4.00</td></tr>
</tbody>
</table>
<p>The exact figure is confirmed at checkout before you pay. No surprise line items after the fact.</p>
<h3>Customs and duties</h3>
<p>Orders shipped outside the United States may attract import duties or taxes on arrival. Those are set by your country, not by us, and they’re your responsibility. We don’t mark parcels as gifts.</p>
<h3>Tracking</h3>
<p>You’ll get a tracking link by email when the shirt leaves the print shop.</p>
<h3>Something went missing</h3>
<p>If tracking has stalled or a parcel hasn’t arrived, email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> and we’ll chase it.</p>`.trim(),

  CONTACT_INFORMATION: `
<p><strong>Schmucks</strong><br>British Columbia, Canada</p>
<p>Email: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
<p>We answer every email. Slowly, but every one.</p>`.trim(),
};

// ---------------------------------------------------------------- discounts

/**
 * Stack & Save — the automatic multi-buy ladder the storefront is built
 * around (app/data/commerce.ts STACK_TIERS). Three automatic discounts, one
 * per tier; Shopify applies the best one that qualifies.
 */
export const STACK_TIERS = [
  {quantity: 2, percent: 10},
  {quantity: 3, percent: 20},
  {quantity: 4, percent: 30},
];

/** Alternative to Stack & Save: a one-time welcome code. Don't run both. */
export const WELCOME_CODE = {code: 'FIRSTMISTAKE', percent: 15};
