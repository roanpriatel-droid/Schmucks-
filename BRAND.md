# SCHMUCKS — Brand System

> Reverse-engineered from the existing codebase (`app/styles/schmucks.css`,
> `app/components/brand/Brand.tsx`) and the brand brief. This file is law.
> When in doubt: **restraint over decoration.**

## 1. Positioning

**SCHMUCKS — "Fine Apparel for Idiots."** Funny, mildly inappropriate graphic
tees (print-on-demand via Printify, fulfilled on Shopify). Launch line: unisex
tees, $25 flat, S–3XL, a few colorways each. Expansion: hoodies, matching sets.

The joke is affectionate, never mean — **the customer is in on it** ("a proud
community of idiots"). Aesthetic: **vintage 1960s New York deli / diner
Americana × internet meme brand.** Think a deli menu board that happens to sell
cursed shirts.

## 2. Color (locked — do not add colors)

| Token | Hex | Use |
|---|---|---|
| `--mustard` | `#F2B33D` | Primary. Bands, buttons, highlights, badges |
| `--ink` | `#1A1714` | Text, outlines, dark bands, frames |
| `--cream` | `#FAF3E3` | Default background, cards |
| `--ketchup` | `#C8362B` | Accent ONLY — sale/urgent, off-register shadow, CTAs |
| `--cream-shade` | `#F0E6CF` | Card media backdrops, subtle fills |
| `--ink-soft` | `#2C2621` | Hairlines on dark |

Body text contrast: ink on cream / cream on ink both exceed 4.5:1. Never put
mustard text on cream (fails contrast) — mustard is a *fill*, not a text color.

## 3. Type

- **Display:** `Alfa Slab One` (chunky vintage slab, arched deli-sign energy).
  UPPERCASE, `line-height: 0.9–0.95`. Used for the wordmark, hero, section
  titles, prices, numbers.
- **Body/UI:** `Inter` (deadpan clean sans). Weights 400–900. The deadpan
  contrast against the slab is intentional.
- Loaded via Google Fonts (`root.tsx`), allow-listed in CSP (`entry.server.tsx`).

**Type scale (enforce):**
| Role | Size | Font |
|---|---|---|
| Hero | `clamp(2.9rem, 11vw, 8rem)` | display |
| Page-head / section title | `clamp(1.8rem, 6vw, 4rem)` | display |
| Card / sub-title | `1.1–1.3rem` | display or Inter 800 |
| Body | `1rem` (never < 15px on mobile) | Inter 400–500 |
| Eyebrow/label | `0.72rem`, `letter-spacing: 0.14–0.18em`, 800, UPPER | Inter |

Rules: fix headline widows (`&nbsp;` the last two words), tighten display
letter-spacing, body ≥ 15px on mobile, generous line-height on body (1.5–1.65).

## 4. Geometry & motion

- **Flat. No gradients, no 3D, no blur.** `--radius: 0` (square corners only;
  exception: cart count pill, review avatars).
- **Thick outlines:** `--outline: 3px solid ink`; heavy variant `5px`.
- **Off-register hard shadows** (the printing-press signature):
  `--shadow-hard: 6px 6px 0 ink`; ketchup echo `5px 5px 0 ketchup`. Buttons/cards
  translate into their shadow on hover.
- **Motion:** subtle only — opacity/translate, ≤ 400ms, ease. Always respect
  `@media (prefers-reduced-motion: reduce)` (marquees stop, reveals disable).

## 5. Spacing

- Page container: `--wrap: 1240px`, side padding `--gutter: clamp(1rem, 4vw, 2.75rem)`.
- Section vertical rhythm: `clamp(3rem, 7vw, 5rem)` for major sections.
- Luxury = breathing room. When unsure, add space, not elements.

## 6. Voice

Deadpan, in-character, self-deprecating, warm. The customer is a "Schmuck" / an
"idiot" and proud of it. Examples already shipped:
- Cart: **"Your Terrible Decisions"** · empty: **"No regrets yet."**
- Checkout button: **"Commit to the Bit"** · order flow talks like a deli guy.
- 404: Mel shrugging. Contact/FAQ answer straight but with a wink.

Never break character on customer-facing copy. But **never let a joke become a
lie** — see §8.

## 7. Assets

- **Wordmark** (arched, ketchup off-register shadow), **Mel** (1930s rubber-hose
  deli mascot), **Badge** (circular stamp). Currently PLACEHOLDER SVGs in
  `app/components/brand/Brand.tsx` — swap for finals from the brand PDF; keep the
  component API identical.
- Favicon: deli "S" mark (`app/assets/favicon.svg` + PNG fallbacks in `public/`).

## 8. Honesty rules (hard)

**Never fabricate social proof** — no invented reviews, star ratings, customer
counts, testimonials, or press. The brand is a joke; the *trust signals are
not*. Use honest alternatives: real guarantees (30-day returns), materials
specs, construction detail, return-policy clarity, secure-checkout. Any real
review/count data must come from a real source before it ships.

## 9. Component vocabulary (classes)

`.sx-wrap` container · `.sx-pagehead` interior title band · `.sx-btn`
(+`--ketchup`/`--ink`/`--ghost`) · `.sx-card` product card · `.sx-grid` product
grid · `.sx-marquee` scroller · `.sx-section-head` / `.sx-eyebrow` /
`.sx-section-title` · `.sx-prose` long-form · `.sx-board` deli menu-board. Reuse
these before inventing new ones.
