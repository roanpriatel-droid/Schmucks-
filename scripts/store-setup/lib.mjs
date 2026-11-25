/**
 * Shared clients for the store-setup scripts: Shopify Admin GraphQL and
 * Printify REST. Zero dependencies — Node 22+ `fetch` only.
 *
 * Credentials come from `scripts/store-setup/.env` (gitignored) or the
 * process environment. Nothing here ever prints a secret.
 */
import {readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const API_VERSION = '2026-04';

// ---------------------------------------------------------------- env

function loadDotEnv() {
  const file = join(HERE, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
loadDotEnv();

export function env(name, {required = true} = {}) {
  const v = process.env[name];
  if (!v && required) {
    throw new Error(
      `Missing ${name}. Put it in scripts/store-setup/.env (see .env.example).`,
    );
  }
  return v;
}

// ---------------------------------------------------------------- args

export const ARGS = new Set(process.argv.slice(2));
export const APPLY = ARGS.has('--apply');
export function argValue(name) {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}

// ---------------------------------------------------------------- utils

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function log(...parts) {
  console.log(...parts);
}

/** A change the script would make. In dry-run it is only printed. */
export async function change(description, fn) {
  if (!APPLY) {
    log(`  [dry-run] ${description}`);
    return null;
  }
  log(`  [apply]   ${description}`);
  return fn();
}

export function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function writeJson(dir, name, data) {
  mkdirSync(dir, {recursive: true});
  writeFileSync(join(dir, name), JSON.stringify(data, null, 2));
}

/** "I Peaked At X — Schmucks · N°. 394 T-Shirt" → "i peaked at x" */
export function normTitle(title) {
  return String(title)
    .replace(/\s+[—–-]\s+Schmucks.*$/i, '')
    .replace(/\s+T-?Shirt$/i, '')
    .replace(/[“”"‘’']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// ---------------------------------------------------------------- Shopify

let cachedToken = null;

/**
 * Admin token. Prefers an explicit SHOPIFY_ADMIN_TOKEN (shpat_…); otherwise
 * exchanges the app's client ID + secret with the client-credentials grant,
 * which works for an app owned by the same organisation as the store.
 */
export async function shopifyToken() {
  if (cachedToken) return cachedToken;
  const explicit = env('SHOPIFY_ADMIN_TOKEN', {required: false});
  if (explicit) return (cachedToken = explicit);

  const shop = env('SHOPIFY_STORE_DOMAIN');
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env('SHOPIFY_CLIENT_ID'),
      client_secret: env('SHOPIFY_CLIENT_SECRET'),
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `Token exchange failed (${res.status}): ${text.slice(0, 300)}\n` +
        'Make sure the app is installed on this store with the scopes in ' +
        'scripts/store-setup/README.md, or set SHOPIFY_ADMIN_TOKEN instead.',
    );
  }
  const body = JSON.parse(text);
  cachedToken = body.access_token;
  if (body.scope && process.env.DEBUG) log(`Shopify token scopes: ${body.scope}`);
  return cachedToken;
}

/**
 * Admin GraphQL with throttle awareness and retries. Throws on top-level
 * errors; callers inspect `userErrors` via `mutate()`.
 */
export async function gql(query, variables = {}, attempt = 0) {
  // SHOPIFY_ADMIN_ORIGIN exists only so the scripts can be exercised against a
  // local fake in tests; leave it unset for real runs.
  const origin = process.env.SHOPIFY_ADMIN_ORIGIN ?? `https://${env('SHOPIFY_STORE_DOMAIN')}`;
  const res = await fetch(
    `${origin}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': await shopifyToken(),
      },
      body: JSON.stringify({query, variables}),
    },
  );
  if ((res.status === 429 || res.status >= 500) && attempt < 6) {
    await sleep(1000 * 2 ** attempt);
    return gql(query, variables, attempt + 1);
  }
  const body = await res.json().catch(() => ({}));
  if (body.errors?.some((e) => e.extensions?.code === 'THROTTLED') && attempt < 8) {
    await sleep(2000 * (attempt + 1));
    return gql(query, variables, attempt + 1);
  }
  if (!res.ok || body.errors) {
    throw new Error(
      `GraphQL error (${res.status}): ${JSON.stringify(body.errors ?? body).slice(0, 800)}`,
    );
  }
  // Stay well under the bucket: pause when it runs low.
  const t = body.extensions?.cost?.throttleStatus;
  if (t && t.currentlyAvailable < 200) {
    await sleep(((200 - t.currentlyAvailable) / t.restoreRate) * 1000);
  }
  return body.data;
}

/** Run a mutation and fail loudly on userErrors. `path` is the payload key. */
export async function mutate(query, variables, path) {
  const data = await gql(query, variables);
  const payload = data[path];
  const errs = payload?.userErrors ?? [];
  if (errs.length) {
    throw new Error(`${path}: ${JSON.stringify(errs)}`);
  }
  return payload;
}

/** Collect every node of a paginated connection. `pick` returns the connection. */
export async function paginate(query, pick, variables = {}) {
  const out = [];
  let after = null;
  for (;;) {
    const data = await gql(query, {...variables, after});
    const conn = pick(data);
    out.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage) return out;
    after = conn.pageInfo.endCursor;
  }
}

// ---------------------------------------------------------------- Printify

const PRINTIFY = 'https://api.printify.com/v1';

export async function printify(path, {method = 'GET', body} = {}, attempt = 0) {
  const res = await fetch(`${PRINTIFY}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env('PRINTIFY_TOKEN').replace(/\s+/g, '')}`,
      'Content-Type': 'application/json',
      'User-Agent': 'store-setup-script',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  // Printify throttles publishing hard ("Too Many Attempts"); back off in
  // minutes, not seconds, so a long sync rides it out instead of dying.
  if (res.status === 429 && attempt < 10) {
    const wait = Math.min(60_000 * 2 ** attempt, 600_000);
    console.log(`  Printify rate limit — waiting ${wait / 60_000} min`);
    await sleep(wait);
    return printify(path, {method, body}, attempt + 1);
  }
  if (res.status >= 500 && attempt < 6) {
    await sleep(1500 * 2 ** attempt);
    return printify(path, {method, body}, attempt + 1);
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Printify ${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function printifyProducts(shopId) {
  const out = [];
  for (let page = 1; ; page++) {
    const d = await printify(`/shops/${shopId}/products.json?limit=50&page=${page}`);
    out.push(...d.data);
    if (page >= d.last_page) return out;
  }
}
