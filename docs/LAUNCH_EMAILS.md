# Launch copy: notification emails, checkout look, welcome email

Everything here is pasted into Shopify admin by hand. There is no API for
notification templates, and checkout branding by API is Plus-only.

Every fact below matches `app/data/commerce.ts`: printed to order, up to 10
days before it ships, 30-day returns, and faulty shirts replaced free. The
support address is Shopify's own `{{ shop.email }}`, so it always matches
Settings → Store details.

---

## 1. Brand the email templates (2 minutes)

**Settings → Notifications → Customer notifications → Customize email templates**

| Setting | Value |
|---|---|
| Logo | the SCHMUCKS wordmark (PNG, transparent) |
| Logo width | 180 px |
| Accent colour | `#C8362B` (ketchup) |

---

## 2. The templates

For each one: **Settings → Notifications → Customer notifications → [name]
→ Edit code**.

1. Replace the **Email subject** with the one given.
2. In the **Email body (HTML)**, find
   `{% capture email_title %}…{% endcapture %}` and
   `{% capture email_body %}…{% endcapture %}` near the top. Replace only the
   text *between* each capture tag.
3. Leave everything else alone, including the order summary table, buttons
   and links.
4. Click **Preview**, then **Save**.

### Order confirmation
**Subject:** `Order {{ order.name }}: you did it. We're printing it.`

`email_title`:
```liquid
Order received. No take-backs on the decision, just the shirt.
```
`email_body`:
```liquid
{% if requires_shipping %}Hi {{ customer.first_name | default: "there" }} — your order is in. Every Schmucks shirt is printed after you order it, so yours goes to the press now and ships within 10 days. You'll get a tracking link the moment it leaves the print shop in Miami.{% else %}Hi {{ customer.first_name | default: "there" }} — your order is in.{% endif %}
```

### Shipping confirmation
**Subject:** `It's on its way. Order {{ order.name }} has left the building.`

`email_title`:
```liquid
Printed, folded, and out the door.
```
`email_body`:
```liquid
Your shirt has shipped. Track it with the link below. If tracking stalls or anything arrives wrong, reply to this email or write to {{ shop.email }} and we'll sort it out.
```

### Out for delivery
**Subject:** `Today's the day. Order {{ order.name }} is out for delivery.`

`email_title`:
```liquid
Out for delivery. Brace yourself.
```
`email_body`:
```liquid
Your order is with the courier and should arrive today. Wear it somewhere inadvisable.
```

### Delivered
**Subject:** `Delivered. Order {{ order.name }} is officially your problem now.`

`email_title`:
```liquid
It's there. Go look.
```
`email_body`:
```liquid
Your order was delivered. If the shirt isn't right, you have 30 days to send it back. If it's faulty or misprinted, send us a photo at {{ shop.email }} and we'll replace it free, no posting required.
```

### Order canceled
**Subject:** `Order {{ order.name }} has been canceled.`

`email_title`:
```liquid
Order canceled. Second thoughts happen.
```
`email_body`:
```liquid
Your order {{ order.name }} was canceled{% if financial_status == 'voided' or financial_status == 'refunded' %} and you haven't been charged — any hold on your card will drop off shortly{% endif %}. Questions? {{ shop.email }}.
```

### Order refund
**Subject:** `Refund issued for order {{ order.name }}.`

`email_title`:
```liquid
Refund on its way.
```
`email_body`:
```liquid
We've refunded your original payment method. Depending on your bank it can take a few days to appear. Thanks for giving us a go.
```

### Abandoned checkout
**Subject:** `You left something at the counter.`

`email_title`:
```liquid
Still thinking about it?
```
`email_body`:
```liquid
Your cart is exactly where you left it. Every shirt is printed to order, so nothing sells out — but two shirts take 10% off automatically, and US orders over $50 ship free.
```

### Customer marketing confirmation (newsletter double opt-in)
**Subject:** `Confirm you want to hear from us. Brave.`

`email_title`:
```liquid
One click and you're in.
```
`email_body`:
```liquid
Confirm your email and you'll hear about new drops before the smart people do. That's the whole arrangement.
```

---

## 3. Newsletter welcome email (Shopify Email automation)

**Marketing → Automations → Create automation → Welcome new subscribers.**
Send it immediately after the signup is confirmed.

- **Subject:** `Welcome to the Schmucks. Our condolences.`
- **Preview text:** `New drops land here first. Here's what you signed up for.`
- **Headline:** `You're in.`
- **Body:**
  > You joined a proud community of idiots. Here's the arrangement: we email
  > when there's a new drop worth your time, and not otherwise.
  >
  > While you're here: every shirt is US$42, printed to order on heavyweight
  > cotton in Miami. Two shirts take 10% off automatically, three take 20%, and four or
  > more take 30%. US orders over $50 ship free.
- **Button:** `Shop the Tees` → `https://schmucks.store/tees`
- **Second button (optional):** `Most Likely to Start Something` → `https://schmucks.store/`

---

## 4. Checkout look (checklist #12)

**Settings → Checkout → Customize** opens the visual editor. Basic plans
style checkout here; the API version is Plus-only.

| Setting | Value |
|---|---|
| Logo | SCHMUCKS wordmark, left-aligned, ~160 px |
| Background (main) | `#FAF3E3` (cream) |
| Background (order summary) | `#F0E6CF` (cream shade) |
| Accent / buttons | `#C8362B` (ketchup) |
| Button text | `#FAF3E3` |
| Text colour | `#1A1714` (ink) |
| Errors | `#C8362B` |
| Headings font | **Alfa Slab One** if offered, else a bold serif (Shopify's font list) |
| Body font | **Inter** |
| Corner radius | **None / square** (the brand has no rounded corners) |
| Form fields | Bordered, white background |

Also in **Settings → Checkout**:
- **Contact method:** email (phone optional)
- **Marketing consent:** show the "email me with news" checkbox, *unchecked* by default (required in Canada/EU)
- **Address autocomplete:** on
- **Tipping:** off
- **Order status page → Additional scripts:** leave empty; pixels go in Customer events
