# Store setup

Scripts that build the Shopify store out to match this storefront, and push
the Printify catalogue into it. Zero dependencies beyond the repo's own
`graphql` package. **Everything is dry-run unless you pass `--apply`.**

## 1. Credentials

```bash
cp scripts/store-setup/.env.example scripts/store-setup/.env   # gitignored
```

Fill in `SHOPIFY_STORE_DOMAIN` (the `*.myshopify.com` one) and either
`SHOPIFY_ADMIN_TOKEN` (`shpat_…`) or the app's `SHOPIFY_CLIENT_ID` +
`SHOPIFY_CLIENT_SECRET`. Client credentials are exchanged for a 24-hour token
automatically; that works when the app belongs to the same organisation as the
store and is installed on it.

The app needs these Admin API scopes:

```
read_products write_products write_publications read_publications
read_discounts write_discounts write_online_store_navigation
write_legal_policies read_legal_policies write_files read_files
write_inventory read_orders read_content
```

## 2. Run

```bash
node scripts/store-setup/validate.mjs        # check every query against the real Admin schema
node scripts/store-setup/audit.mjs           # read-only report + full JSON backup
node scripts/store-setup/apply.mjs           # dry run: prints every change
node scripts/store-setup/apply.mjs --apply   # make them
node scripts/store-setup/printify-sync.mjs   # dry run: what Printify would publish
```

### What `apply.mjs` does (default steps)

| Step | What |
|---|---|
| `collections` | Ensures the 10 smart collections from `app/data/shelves.ts` exist with the right tag rules, in-voice descriptions, SEO and sort order. Fills blanks only. |
| `products` | Vendor `SCHMUCKS`, type `T-Shirt`, taxonomy *Clothing Tops › T-Shirts*, SEO title/description, image alt text, the `tees` tag, and `CONTINUE` inventory policy on tracked variants (print-on-demand never sells out). Fills blanks only. |
| `publish` | Publishes every active product and every shelf collection to Online Store, the Hydrogen storefront and Shop. This is what makes the storefront's collections, filters and merchandiser order work. |
| `menus` | `main-menu` and `footer`, mirroring the site's nav. |
| `policies` | Refund, terms, shipping, contact, from `POLICIES_DRAFT.md`. Skips any that already have text unless `--overwrite-policies`. |

### Opt-in (commercial decisions)

| Flag | What | Then in code |
|---|---|---|
| `--stack-and-save` | Automatic 2 = 10%, 3 = 20%, 4+ = 30% | `STACK_DISCOUNT_LIVE = true` |
| `--welcome-code` | `FIRSTMISTAKE`, 15% once per customer (not with the above) | — |
| `--free-shipping` | Automatic free shipping, US ≥ $50, Canada ≥ $75 | `FREE_SHIPPING_LIVE = true` |

After flipping a flag, re-run the cart test described in `app/data/commerce.ts`.

`--only=collections,publish` runs a subset. Every step is idempotent and
resumable: re-running after a failure continues where it stopped, and a run
with nothing to do changes nothing.

## Printify sync

`printify-sync.mjs` publishes only Printify products that Shopify doesn't
already have (matched by SKU, then by title), so it can't duplicate the
catalogue. It reports products that exist in Shopify **without** a Printify
link. Orders for those won't reach Printify for printing, and fixing that is a
decision (it replaces the Shopify copy), not a default.

## Artwork (designs N° 21–394)

`artwork/render.py` typesets the editorial designs: statement in Playfair
Display Black (bold, high-contrast, print-safe strokes), a rule, and a tracked
"SCHMUCKS · N°. 000" caption in Inter ExtraBold, on a 4500×5100 transparent
canvas positioned like the original files. It writes two inks: `cream` (dark
ink, printed on Natural/Gold) and `black` (cream ink, printed on Black).

`artwork/rollout.py` renders, uploads to Printify, swaps only the front
print, and republishes **images only** to Shopify (title, tags, SEO and URL
untouched). Dry-run by default; idempotent (skips designs already on
`schmucks-bold-*`). Afterwards run `apply.mjs --only=products --apply` to
restore vendor and alt text on the new images.

Fonts (OFL, not committed) — download once:

```bash
mkdir -p /tmp/fonts && cd /tmp/fonts
curl -sLo PlayfairDisplay.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf"
curl -sLo Inter.ttf "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf"
```

```bash
python3 scripts/store-setup/artwork/rollout.py --fonts /tmp/fonts --out /tmp/preview           # previews only
python3 scripts/store-setup/artwork/rollout.py --fonts /tmp/fonts --out /tmp/preview --apply   # live
```
