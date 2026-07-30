# Shopify settings to apply

I could not make these changes myself. The `shpat_` token in `.env` has **read**
access to the shop and its shipping zones, but no write scope — a REST write to
`price_based_shipping_rates` returns `406`, and `deliveryProfiles` in GraphQL
returns `ACCESS_DENIED`. `read_products`, `read_discounts` and `read_price_rules`
are refused too ("requires merchant approval"). The client ID / secret you sent
are OAuth app credentials, which can't call the Admin API without completing an
OAuth exchange.

**To let me do this myself next time:** Settings → Apps and sales channels →
Develop apps → (your app) → Configuration → Admin API access scopes → add
`write_shipping`, `read_products`, `write_products`, `read_discounts`,
`write_discounts` → Save → Install/reinstall → copy the new `shpat_` token into
`~/schmucks/.env`.

---

## 1. Shipping — recommended (Settings → Shipping and delivery)

The numbers behind this: the shirt costs **$10.65** to make (Printify) and sells
for **$42.00**, a 75% gross margin. The store currently passes the print
provider's shipping cost straight to the customer.

**United States** — replace the weight-based rates with two price-based rates:

| Condition | Rate name | Price |
|---|---|---|
| Order subtotal $0.00 – $49.99 | Standard Delivery | **$4.75** |
| Order subtotal $50.00 and up | Free Delivery | **$0.00** |

This makes the site's original promise true again, and makes the two-shirt pitch
honest: one shirt ($42) doesn't reach it, two ($84) do. Cost to you on an $84
order is the $7.15 you absorb — leaving **$55.55** margin on that order.

**Canada** — same shape, higher threshold, because Canadian shipping costs you
more ($9.39 + $4.39):

| Condition | Rate name | Price |
|---|---|---|
| $0.00 – $74.99 | Standard Delivery | **$9.39** |
| $75.00 and up | Free Delivery | **$0.00** |

**Everywhere else** — leave the existing weight-based rates alone. Absorbing
$13.49 EU / $12.49 AU shipping is not worth it at this price point.

**After applying:** flip `FREE_SHIPPING_LIVE` to `true` in
`app/data/commerce.ts` and every free-shipping claim across the site comes back
at once, already written. Set `FREE_SHIPPING_THRESHOLD` to `50`.

## 2. Discounts — recommended (Discounts → Create discount)

There is currently no discount of any kind. I'd add **one** welcome code rather
than a permanent multi-buy ladder, because at a 75% margin the lever you want is
first-purchase conversion, not average order value:

- **Type:** Amount off products → Discount code
- **Code:** `FIRSTMISTAKE`
- **Value:** 15% off
- **Applies to:** All products
- **Minimum:** none
- **Usage:** One use per customer
- **Cost to you:** $6.30 a shirt. Margin still $25.05 after product cost.

If you'd rather drive AOV, the alternative is the Stack & Save ladder the code
already supports (2+ = 10%, 3 = 20%, 4+ = 30%) as an **automatic** discount —
create it and flip `STACK_DISCOUNT_LIVE` to `true`. Don't do both; they'd stack.

## 3. Still unverifiable from code

- **The ten smart collections are still unpublished to the Hydrogen channel.**
  Every shelf falls back to a tag query, which works, but publishing them
  restores merchandiser ordering and the size/colour facets with no code change.
- **`help@schmucks.example` bounces.** It's on every contact path. Replace it in
  `app/data/commerce.ts`.
