# Needs Real-World Input

Things I deliberately did **not** fabricate. Each needs a real value from you
before it can ship as a factual claim. Until then I use honest alternatives.

## Trust / social proof
- **Customer reviews, star ratings, review counts** — removed all invented ones
  (was "4.9/5 from 12,000+ idiots", named quotes, per-product counts). Replaced
  with honest trust content (guarantees, materials, returns). To add real
  reviews later: wire a reviews app (Judge.me / Okendo / Shopify Product Reviews)
  and I'll render real data + Product `aggregateRating` schema.
- **Press mentions / "as seen in"** — none added (none are real).

## Commerce facts
- **Free-shipping threshold** — currently shown as **$100** (from the brand
  brief "free US shipping $100+"). Confirm the real threshold; it drives the
  announcement bar, cart progress, and PDP shipping copy.
- **Stack & Save discount** — the cart meter is UI only. Create the matching
  **Shopify automatic discount** (2+=10%, 3=20%, 4+=30%) in admin or it won't
  apply at checkout.
- **Shipping times / low stock** — I only show these if driven by real Storefront
  data. No fabricated "ships in 3–5 days / only 2 left" unless your fulfillment
  data confirms it. Confirm real fulfillment windows to hard-code copy.

## Store configuration
- **BLOCKER — publish the collections and products to the Hydrogen sales
  channel.** As of 2026-07-26 the Storefront API returns **0 products and none
  of the ten smart collections** for this storefront token; only the default
  `frontpage` collection is visible. Everything is wired and will populate the
  moment the collections + products are published to the Hydrogen/headless
  channel in admin (Products → … → Manage sales channels). Until then every
  shelf renders its restocking state.
- **`PUBLIC_CHECKOUT_DOMAIN` is not set** on the storefront environment, which
  made `Analytics.Provider` log a console error. The code now falls back to
  `PUBLIC_STORE_DOMAIN`; set the real value if checkout runs on its own domain.
- **`content/pairs.json`** — the pipeline's pairing map isn't reachable from
  this repo, so the mapping lives at `app/data/pairs.ts` in the identical
  shape (`{handle: [handle, ...]}`) and is currently empty. Drop the real pairs
  in and "Complete the Pair" switches from shelf-fallback to explicit pairs.
- **Shop policies must be written in admin** (Settings → Policies): shipping,
  refund, privacy, terms. The footer links Shipping/Returns directly, and
  `/policies` lists whatever exists. Until a policy is published, that URL
  returns 404 with an honest "not published yet, ask us" page rather than
  invented terms — but real customers need the real text.
- **Blogs** — `/blogs` (Shopify blogs, linked in the footer as "News") is empty
  until a blog is created in admin. The Journal is separate and always populated.

## Content / assets
- **Real brand SVGs** — Mel, arched wordmark, badge are placeholders. Provide the
  finals (from "Schmucks Brand Identity System.pdf") to swap in.
- **Product photography** — grids/PDP/lookbook use Storefront product images.
  Editorial/lookbook art direction wants real lifestyle photography; placeholders
  are clearly-labeled brand illustrations, not fake photos.
- **Size & fit measurements** — the size guide uses standard unisex tee
  measurements as a sensible default. Replace with your Printify blank's actual
  spec sheet (measurements per size) before relying on it.
- **Materials / GSM** — Materials page uses typical print-on-demand blank specs
  (e.g. ~180 gsm ringspun cotton). Confirm your actual Printify blank(s) and I'll
  correct the numbers.
- **Journal articles** — 3 seeded editorial pieces in brand voice. Review/approve
  copy; swap in real photography.
- **Contact email / socials** — `help@schmucks.example` etc. are placeholders.
  Provide real addresses and social handles/URLs.
