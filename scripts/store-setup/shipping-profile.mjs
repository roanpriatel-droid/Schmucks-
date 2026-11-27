#!/usr/bin/env node
/**
 * Moves every Printify product into a custom delivery profile, "Printify — All",
 * that Printify's sync can't overwrite. DRY-RUN BY DEFAULT; add --apply.
 *
 *   node scripts/store-setup/shipping-profile.mjs            # show the plan
 *   node scripts/store-setup/shipping-profile.mjs --apply    # do it
 *   node scripts/store-setup/shipping-profile.mjs --revert --apply
 *       # move every variant back to Printify's own profile
 *
 * The zones and weight-tier rates are copied exactly from Printify's profile
 * (same prices in USD, same tiers), so customers pay what they paid before.
 * Each rate keeps Printify's delivery estimate as its description where it
 * has one, otherwise "Printed to order (up to 10 days), then shipped".
 * Idempotent: an existing "Printify — All" profile is reused; only variants
 * not already in it are moved.
 */
import {APPLY, ARGS, change, gql, mutate, paginate, log} from './lib.mjs';

const NAME = 'Printify — All';
const FALLBACK_DESC = 'Printed to order (up to 10 days), then shipped';

const PROFILES_Q = `#graphql
  query ShipProfiles {
    deliveryProfiles(first: 20) { nodes { id name default } }
    locations(first: 20, includeLegacy: true) { nodes { id name fulfillmentService { handle } } }
  }`;

const PROFILE_Q = `#graphql
  query ShipProfile($id: ID!) {
    deliveryProfile(id: $id) {
      id name
      profileLocationGroups {
        locationGroup { id }
        locationGroupZones(first: 20) {
          nodes {
            zone { name countries { code { countryCode restOfWorld } } }
            methodDefinitions(first: 60) {
              nodes {
                name description active
                rateProvider { ... on DeliveryRateDefinition { price { amount currencyCode } } }
                methodConditions {
                  field operator
                  conditionCriteria { __typename ... on Weight { value unit } ... on MoneyV2 { amount currencyCode } }
                }
              }
            }
          }
        }
      }
    }
  }`;

const VARIANTS_Q = `#graphql
  query ShipVariants($after: String) {
    productVariants(first: 250, after: $after, query: "product_type:'T-Shirt'") {
      pageInfo { hasNextPage endCursor }
      nodes { id deliveryProfile { id } }
    }
  }`;

const CREATE = `#graphql
  mutation ShipCreate($profile: DeliveryProfileInput!) {
    deliveryProfileCreate(profile: $profile) {
      profile { id name }
      userErrors { field message }
    }
  }`;

const UPDATE = `#graphql
  mutation ShipUpdate($id: ID!, $profile: DeliveryProfileInput!) {
    deliveryProfileUpdate(id: $id, profile: $profile) {
      profile { id }
      userErrors { field message }
    }
  }`;

/** Printify's own profile: a non-default one that ships from the Printify location. */
function isPrintifyProfile(p) {
  return !p.default && p.name !== NAME && /standard|printify|monster/i.test(p.name);
}

/** Extend tiers to this weight (~30 shirts at 0.22 lb). Printify's stop at 2.75 lb. */
const EXTEND_TO_LB = 6.61;

function zoneInput(zone) {
  const countries = zone.zone.countries.map((c) =>
    c.code.restOfWorld ? {restOfWorld: true} : {code: c.code.countryCode, includeAllProvinces: true},
  );
  const tiers = zone.methodDefinitions.nodes
    .filter((m) => m.active)
    .map((m) => {
      const w = (op) =>
        m.methodConditions.find((c) => c.field === 'TOTAL_WEIGHT' && c.operator === op)?.conditionCriteria;
      return {
        min: w('GREATER_THAN_OR_EQUAL_TO')?.value ?? 0,
        max: w('LESS_THAN_OR_EQUAL_TO')?.value,
        unit: w('LESS_THAN_OR_EQUAL_TO')?.unit ?? 'POUNDS',
        price: Number(m.rateProvider.price.amount),
        currency: m.rateProvider.price.currencyCode,
        transit: m.description?.trim(),
      };
    })
    .sort((a, b) => a.min - b.min);

  // Continue Printify's own pattern past its last tier: same weight step,
  // same price step (their "each additional item" charge).
  const last = tiers.at(-1);
  const prev = tiers.at(-2);
  if (last && prev && last.max != null) {
    const step = +(last.max - last.min).toFixed(2);
    const inc = +(last.price - prev.price).toFixed(2);
    let {max, price} = last;
    while (max < EXTEND_TO_LB) {
      const min = +max.toFixed(2);
      max = +(max + step).toFixed(2);
      price = +(price + inc).toFixed(2);
      tiers.push({...last, min, max, price});
    }
  }

  const description = (t) =>
    t.transit
      ? `Printed to order (up to 10 days), then ${t.transit.replace(/-/g, '–')} in transit`
      : FALLBACK_DESC;

  const methods = tiers.map((t) => ({
    name: 'Standard',
    description: description(t),
    active: true,
    rateDefinition: {price: {amount: t.price.toFixed(2), currencyCode: t.currency}},
    weightConditionsToCreate: [
      {operator: 'GREATER_THAN_OR_EQUAL_TO', criteria: {value: t.min, unit: t.unit}},
      {operator: 'LESS_THAN_OR_EQUAL_TO', criteria: {value: t.max, unit: t.unit}},
    ],
  }));
  // Strip Printify's "#47c3eded" suffixes; give the EU zone a plain name.
  let name = zone.zone.name.replace(/\s*#[0-9a-f]+$/i, '');
  if (/27 countries/.test(name)) name = 'European Union';
  return {name, countries, methodDefinitionsToCreate: methods};
}

async function main() {
  log(APPLY ? 'APPLY MODE' : 'DRY RUN — add --apply to write.');
  const {deliveryProfiles, locations} = await gql(PROFILES_Q);
  const printifyLoc = locations.nodes.find((l) => l.fulfillmentService?.handle === 'printify');
  const source = deliveryProfiles.nodes.find(isPrintifyProfile);
  let target = deliveryProfiles.nodes.find((p) => p.name === NAME);
  if (!printifyLoc) throw new Error('No Printify location.');

  if (ARGS.has('--revert')) {
    if (!source || !target) throw new Error('Need both profiles to revert.');
    const variants = await paginate(VARIANTS_Q, (d) => d.productVariants);
    const ids = variants.filter((v) => v.deliveryProfile?.id === target.id).map((v) => v.id);
    log(`Moving ${ids.length} variants back to "${source.name}"`);
    for (let i = 0; i < ids.length; i += 250) {
      await change(`move ${Math.min(250, ids.length - i)} variants back`, () =>
        mutate(UPDATE, {id: source.id, profile: {variantsToAssociate: ids.slice(i, i + 250)}}, 'deliveryProfileUpdate'),
      );
    }
    return;
  }

  if (!target) {
    if (!source) throw new Error("Can't find Printify's delivery profile to copy.");
    const {deliveryProfile} = await gql(PROFILE_Q, {id: source.id});
    const zones = deliveryProfile.profileLocationGroups.flatMap((g) => g.locationGroupZones.nodes);
    log(`Copying ${zones.length} zones from "${source.name}":`);
    for (const z of zones) {
      const zi = zoneInput(z);
      const m = zi.methodDefinitionsToCreate;
      const top = m.at(-1).weightConditionsToCreate[1].criteria.value;
      log(
        `  ${zi.name}: ${m.length} rates, $${m[0].rateDefinition.price.amount} → $${m.at(-1).rateDefinition.price.amount}, up to ${top} lb — "${m[0].description}"`,
      );
    }
    const created = await change(`create profile "${NAME}" (location: Printify)`, () =>
      mutate(
        CREATE,
        {
          profile: {
            name: NAME,
            locationGroupsToCreate: [{locations: [printifyLoc.id], zonesToCreate: zones.map(zoneInput)}],
          },
        },
        'deliveryProfileCreate',
      ),
    );
    if (!created) return; // dry run stops here: there's no profile to move variants into
    target = created.profile;
  } else {
    log(`✓ "${NAME}" exists — moving any variants not yet in it`);
  }

  const variants = await paginate(VARIANTS_Q, (d) => d.productVariants);
  const ids = variants.filter((v) => v.deliveryProfile?.id !== target.id).map((v) => v.id);
  log(`${variants.length} T-shirt variants; ${ids.length} to move into "${NAME}"`);
  for (let i = 0; i < ids.length; i += 250) {
    await change(`move ${Math.min(250, ids.length - i)} variants (${i + Math.min(250, ids.length - i)}/${ids.length})`, () =>
      mutate(UPDATE, {id: target.id, profile: {variantsToAssociate: ids.slice(i, i + 250)}}, 'deliveryProfileUpdate'),
    );
  }
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}`);
  process.exit(1);
});
