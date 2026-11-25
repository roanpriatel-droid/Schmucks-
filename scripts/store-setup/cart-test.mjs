#!/usr/bin/env node
/**
 * READ-ONLY proof that the discounts and free shipping actually apply.
 * Prices hypothetical carts with draftOrderCalculate (nothing is created) at
 * 1–4 shirts, for a US and a Canadian address, and prints subtotal, discount
 * and cheapest shipping. Run after apply.mjs, before flipping
 * STACK_DISCOUNT_LIVE / FREE_SHIPPING_LIVE in app/data/commerce.ts.
 *
 *   node scripts/store-setup/cart-test.mjs
 */
import {gql, log} from './lib.mjs';

const VARIANT_Q = `#graphql
  query CartTestVariant {
    productVariants(first: 1, query: "product_status:active") { nodes { id product { title } } }
  }`;

const CALC = `#graphql
  mutation CartTestCalc($input: DraftOrderInput!) {
    draftOrderCalculate(input: $input) {
      calculatedDraftOrder {
        presentmentCurrencyCode
        subtotalPriceSet { presentmentMoney { amount } }
        totalDiscountsSet { presentmentMoney { amount } }
        platformDiscounts { title totalAmount { amount } }
        availableShippingRates { title price { amount } }
      }
      userErrors { field message }
    }
  }`;

const ADDRESSES = {
  US: {address1: '1 Main St', city: 'Austin', provinceCode: 'TX', countryCode: 'US', zip: '73301'},
  CA: {address1: '1 Main St', city: 'Vancouver', provinceCode: 'BC', countryCode: 'CA', zip: 'V5K 0A1'},
};
const CURRENCY = {US: 'USD', CA: 'CAD'};

const {productVariants} = await gql(VARIANT_Q);
const variant = productVariants.nodes[0];
if (!variant) throw new Error('No active products to test with.');
log(`Testing with "${variant.product.title}"\n`);
log('where qty  subtotal  discount  cheapest shipping  discounts applied');
for (const country of ['US', 'CA']) {
  for (const quantity of [1, 2, 3, 4]) {
    const {draftOrderCalculate: r} = await gql(CALC, {
      input: {
        lineItems: [{variantId: variant.id, quantity}],
        shippingAddress: ADDRESSES[country],
        presentmentCurrencyCode: CURRENCY[country],
        acceptAutomaticDiscounts: true,
      },
    });
    if (r.userErrors.length) throw new Error(JSON.stringify(r.userErrors));
    const d = r.calculatedDraftOrder;
    const ship = d.availableShippingRates.map((s) => Number(s.price.amount)).sort((a, b) => a - b)[0];
    log(
      `${country}    ${quantity}   ${d.subtotalPriceSet.presentmentMoney.amount.padStart(7)}  ` +
        `${d.totalDiscountsSet.presentmentMoney.amount.padStart(8)}  ${String(ship ?? 'none').padStart(17)}  ` +
        `${d.platformDiscounts.map((x) => x.title).join(' + ') || '—'}  (${d.presentmentCurrencyCode})`,
    );
  }
}
