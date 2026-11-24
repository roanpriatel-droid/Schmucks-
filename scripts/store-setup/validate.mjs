#!/usr/bin/env node
/**
 * Validates every `#graphql` document in these scripts against the real
 * Admin API schema for API_VERSION (fetched from shopify.dev's public schema
 * proxy and cached in .schema/). No store access needed.
 *
 *   node scripts/store-setup/validate.mjs
 */
import {existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {buildClientSchema, getIntrospectionQuery, parse, validate} from 'graphql';
import {HERE, API_VERSION} from './lib.mjs';

const cacheDir = join(HERE, '.schema');
const cache = join(cacheDir, `admin-${API_VERSION}.json`);

async function schema() {
  if (!existsSync(cache)) {
    const res = await fetch(`https://shopify.dev/admin-graphql-direct-proxy/${API_VERSION}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query: getIntrospectionQuery()}),
    });
    if (!res.ok) throw new Error(`schema fetch ${res.status}`);
    mkdirSync(cacheDir, {recursive: true});
    writeFileSync(cache, await res.text());
  }
  return buildClientSchema(JSON.parse(readFileSync(cache, 'utf8')).data);
}

const s = await schema();
let docs = 0;
let failures = 0;
for (const file of readdirSync(HERE).filter((f) => f.endsWith('.mjs') && f !== 'validate.mjs')) {
  const src = readFileSync(join(HERE, file), 'utf8');
  for (const m of src.matchAll(/`#graphql([\s\S]*?)`/g)) {
    docs++;
    const name = m[1].match(/(query|mutation)\s+(\w+)/)?.[2] ?? '(anonymous)';
    const errors = validate(s, parse(m[1]));
    const real = errors.filter((e) => !/deprecated/i.test(e.message));
    if (real.length) {
      failures++;
      console.log(`✗ ${file} ${name}\n  ${real.map((e) => e.message).join('\n  ')}`);
    } else console.log(`✓ ${file} ${name}`);
  }
}
console.log(`\n${docs} documents, ${failures} invalid (Admin API ${API_VERSION})`);
process.exit(failures ? 1 : 0);
