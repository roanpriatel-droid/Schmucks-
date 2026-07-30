# Store policies — drafts to paste into Shopify

**The store currently publishes only a Privacy Policy.** Checked against the
Storefront API: `refundPolicy`, `termsOfService`, `shippingPolicy` and
`subscriptionPolicy` all return `null`.

That matters more than it looks:

- The storefront promises **"30-day returns"** on every product page, in the
  footer, and in the buy-box trust row — with no refund policy behind it.
- Shopify shows policy links at checkout. Right now a customer reaches payment
  and finds no refund terms.
- Payment providers and app stores generally expect a refund policy and terms of
  service to exist.

Paste these in **Settings → Policies**. They're written to match what the site
already says and to sound like the rest of it. **I'm not a lawyer — have someone
who is read them before you rely on them**, particularly the governing-law line,
which I've left for you to set (the business is in British Columbia; the print
provider is in Florida).

---

## ⚠️ One commercial thing to decide first

The site says returns are "30-day, no questions." Because every shirt is
**printed to order**, a returned shirt cannot go back into stock and **Printify
will not reimburse you for a change of mind** — they only replace defective or
misprinted items. So a buyer's-remorse return costs you the full $10.65
production cost plus whatever shipping you've absorbed, against a $42 sale.

At a 75% gross margin that's affordable and a generous policy converts well, so
I'd keep it. But you should be choosing it knowingly. The draft below reflects
the generous version, with two sensible limits: the customer pays return
postage, and defects/misprints are always free to replace.

---

## Refund policy

> **Thirty days. That's the deal.**
>
> If a shirt isn't right, you have 30 days from delivery to send it back for a
> refund or an exchange. We won't interrogate you about it, though we may ask
> what went wrong so we can stop doing it.
>
> **What we need from you.** The shirt should be unworn and unwashed, with the
> tags on. It can have been tried on — that's what trying on is for. It should
> not have been worn to a wedding first.
>
> **Who pays.** Return postage is on you. If the shirt is faulty, misprinted, or
> we simply sent the wrong one, it's on us — we'll cover the return and send a
> replacement or refund in full, whichever you prefer. Send a photo and we'll
> sort it out without making you post anything back.
>
> **How to start one.** Email {CONTACT_EMAIL} with your order number and what
> happened. We'll reply with a return address and instructions.
>
> **When you get your money.** Once the shirt reaches us we'll inspect it and
> refund to your original payment method within 5 business days. Depending on
> your bank it can take a few more days to appear. Original shipping charges are
> not refunded unless the fault was ours.
>
> **What we can't take back.** Gift cards, and anything returned after the
> 30-day window has closed.
>
> **Damaged in transit?** Tell us within 7 days of delivery and we'll replace it.

## Terms of service

> **The basics.**
>
> By buying from Schmucks you agree to what's below. If you don't, don't buy
> anything — no hard feelings.
>
> **Who we are.** Schmucks is operated from British Columbia, Canada. Shirts are
> printed and dispatched from Miami, Florida.
>
> **Orders.** Placing an order is an offer to buy. We can decline or cancel an
> order — if we do, you get a full refund, promptly. Every shirt is printed to
> order, so once production has started an order usually can't be changed or
> cancelled. If you need to change something, email us fast and we'll try.
>
> **Prices.** All prices are in **US dollars**. We can change prices at any
> time, but never after you've paid. Taxes and duties are calculated at checkout
> or charged on import, depending on where you are — see the shipping policy.
>
> **The product.** Colours on a screen are not colours on cotton. Print position
> and size may vary very slightly between garments, which is what happens when a
> person prints a shirt rather than a machine stamping a billion identical ones.
>
> **The designs.** The jokes on our shirts are ours. Don't reproduce them for
> sale. Wearing one in public is not only permitted but encouraged.
>
> **Liability.** We're responsible for getting you the shirt you paid for, in
> the condition described. We're not responsible for what happens to you while
> wearing it.
>
> **Governing law.** [SET THIS — normally the province/state where the business
> is registered.]
>
> **Contact.** {CONTACT_EMAIL}

## Shipping policy

> **Made to order, then sent.**
>
> Nothing sits in a warehouse. Your shirt is printed after you order it, which
> takes **up to 10 days** before it ships. Delivery time is on top of that and
> depends on where you are.
>
> **What it costs.** Charged by weight, so it goes up with the number of shirts
> rather than the price of them.
>
> | Where | First shirt | Each extra |
> |---|---|---|
> | United States | $4.75 | +$2.40 |
> | Canada | $9.39 | +$4.39 |
> | Europe | $13.49 | +$4.00 |
> | Australia | $12.49 | +$4.99 |
> | Rest of world | $10.00 | +$4.00 |
>
> The exact figure is confirmed at checkout before you pay. No surprise line
> items after the fact.
>
> **Customs and duties.** Orders shipped outside the United States may attract
> import duties or taxes on arrival. Those are set by your country, not by us,
> and they're your responsibility. We don't mark parcels as gifts.
>
> **Tracking.** You'll get a tracking link by email when the shirt leaves the
> print shop.
>
> **Something went missing.** If tracking has stalled or a parcel hasn't arrived,
> email {CONTACT_EMAIL} and we'll chase it.

---

## After you publish them

The footer and `/policies` render whatever Shopify has published, automatically
— no code change needed. Replace `{CONTACT_EMAIL}` with the address you settle
on (see the note about `help@shmucks.store` forwarding in
`app/data/commerce.ts`), and update the shipping table if you apply the
free-shipping rates in `SHOPIFY_SETTINGS.md`.
