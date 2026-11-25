/**
 * Gift guides — landing pages for the searches people actually make
 * ("funny shirts for boyfriend", "white elephant gift ideas"). Each is a
 * curated Storefront query over the real catalogue, plus copy that answers the
 * question the search was asking. Facts must match app/data/commerce.ts.
 */
export type Gift = {
  slug: string;
  /** H1 / page title. */
  title: string;
  /** Short label for chips and the hub. */
  short: string;
  /** Meta description (≤160 chars). */
  description: string;
  /** Intro paragraphs above the grid. */
  intro: string[];
  /** Storefront `products(query:)` string. */
  query: string;
  /** Tips shown beside the grid — the answer to "what should I get?". */
  tips: string[];
};

export const GIFTS: Gift[] = [
  {
    slug: 'for-couples',
    title: 'Matching Couple Shirts',
    short: 'For couples',
    description:
      'Funny matching couple shirts — his-and-hers designs that each work alone and land together. Two shirts take 10% off automatically.',
    intro: [
      'Every shirt here has a partner: girlfriend and boyfriend, husband and wife, the one who scares and the one who’s scared. Wear one each and let the room work it out.',
      'Pick each shirt’s size and colour separately. Two shirts take 10% off at checkout, automatically.',
    ],
    query: 'tag:the-pair-programme',
    tips: [
      'Buy both halves at once — Stack & Save applies to any two shirts.',
      'Mismatched colours (one Black, one Natural) photograph better than identical ones.',
      'Order a week or two ahead of an anniversary: each shirt is printed to order.',
    ],
  },
  {
    slug: 'for-your-boyfriend',
    title: 'Funny Shirts for Your Boyfriend',
    short: 'For your boyfriend',
    description:
      'Funny t-shirts to give your boyfriend — the ones that announce he’s taken, whether he likes it or not. Heavyweight cotton, S–3XL.',
    intro: [
      'Shirts he’ll wear because you bought them, that tell everyone else he’s spoken for. Most mention a girlfriend; all of them mention it loudly.',
    ],
    query: 'title:*Girlfriend*',
    tips: [
      'If you don’t know his size, go one up — the Gildan 5000 is a standard unisex fit.',
      'Pair it with the matching design in your size for 10% off both.',
    ],
  },
  {
    slug: 'for-your-girlfriend',
    title: 'Funny Shirts for Your Girlfriend',
    short: 'For your girlfriend',
    description:
      'Funny t-shirts to give your girlfriend — the boyfriend-themed ones, so everyone knows exactly who to blame. Unisex S–3XL.',
    intro: [
      'The boyfriend side of the catalogue: shirts that mention you, so she can wear the relationship status out loud. Unisex fit — size down for a closer cut.',
    ],
    query: 'title:*Boyfriend*',
    tips: [
      'The shirts are unisex; most people who prefer a fitted look go one size down.',
      'Natural is the softer-looking colour; Black hides more.',
    ],
  },
  {
    slug: 'for-your-worst-friend',
    title: 'Gifts for Your Worst Friend',
    short: 'For your worst friend',
    description:
      'Funny shirts for the friend who deserves it: confessions, self-own one-liners and printed mistakes. Heavyweight cotton, printed to order.',
    intro: [
      'For the friend whose stories you’ve heard too many times. These are confessions and self-owns they’d never print themselves — which is why you’re doing it for them.',
    ],
    query: 'tag:the-confessional OR tag:errata',
    tips: [
      'Choose the shirt that’s accurate, not the one that’s funniest. Accuracy is funnier.',
      'Gift it in public. That’s the whole point.',
    ],
  },
  {
    slug: 'for-drinkers',
    title: 'Funny Drinking Shirts',
    short: 'For drinkers',
    description:
      'Funny drinking and party shirts — open bar athletes, last-call legends and the sober-ish. Four or more take 30% off for group trips.',
    intro: [
      'For the bar, the function and the morning after. Habits you’ve stopped apologising for, set in a typeface that suggests you’ve thought about it.',
    ],
    query: 'tag:vices',
    tips: [
      'Buying for a group? Four or more shirts take 30% off automatically.',
      'Allow up to 10 days to print before a trip or a party.',
    ],
  },
  {
    slug: 'bachelor-bachelorette',
    title: 'Bachelor & Bachelorette Party Shirts',
    short: 'Bachelor & bachelorette',
    description:
      'Funny shirts for bachelor and bachelorette weekends — best men who lost the rings, wedding speeches and open-bar athletes. Group discounts automatic.',
    intro: [
      'Shirts for the weekend before the wedding: best men, speeches, open bars and the people who shouldn’t be trusted with any of them. Mix designs across the group — the discount applies to any shirts.',
    ],
    query: 'tag:vices OR title:*Wedding* OR title:*Best Man* OR title:*Single*',
    tips: [
      'Four or more shirts take 30% off, automatically — mix and match freely.',
      'Order at least two weeks ahead so every shirt is printed and delivered in time.',
    ],
  },
  {
    slug: 'white-elephant',
    title: 'White Elephant & Secret Santa Shirts',
    short: 'White elephant',
    description:
      'Funny shirts for white elephant and Secret Santa swaps — fine-print jokes and petty crimes that get stolen twice. Under $50.',
    intro: [
      'The gift that gets stolen twice. Warning labels, clearance stickers and petty crimes — funny enough to fight over, tame enough for the office party.',
    ],
    query: 'tag:terms-and-conditions OR tag:petty-crimes',
    tips: [
      'Every shirt is US$42 — inside most swap limits once you add the wrapping.',
      'Sizes are unisex S–3XL; L is the safest guess for a stranger.',
    ],
  },
  {
    slug: 'for-coworkers',
    title: 'Funny Shirts for Coworkers',
    short: 'For coworkers',
    description:
      'Funny but office-safe shirts for coworkers: warning labels, care instructions and retail jokes. Text-only designs, heavyweight cotton.',
    intro: [
      'The safest shelf in the shop: people treated like products, with warning labels, care instructions and clearance stickers. Funny at the desk, fine in front of HR.',
    ],
    query: 'tag:terms-and-conditions',
    tips: [
      'These are the only designs we’d call office-safe. The rest of the shop is not.',
      'Buying for the team? Four or more take 30% off automatically.',
    ],
  },
];

export function getGift(slug: string | undefined) {
  return GIFTS.find((g) => g.slug === slug);
}
