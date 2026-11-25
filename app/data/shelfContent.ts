/**
 * Long-form copy for each shelf page: a short guide under the grid, a
 * three-question FAQ (rendered with FAQPage schema), and where to go next.
 *
 * This is the text search engines and AI assistants read to understand what a
 * shelf is for, so every factual claim here must match app/data/commerce.ts
 * (price, blank, print method, returns). Jokes are fine; invented facts aren't.
 */
export type ShelfGuide = {
  /** H2 above the guide. */
  heading: string;
  /** 2–3 short paragraphs. */
  body: string[];
  faq: Array<{q: string; a: string}>;
  /** Related shelf handles (rendered as links). */
  related: string[];
  /** Related gift-guide slugs (see app/data/gifts.ts). */
  gifts?: string[];
};

const SHARED_FAQ = {
  quality: {
    q: 'What are the shirts actually made of?',
    a: 'Gildan 5000 Heavy Cotton: 5.3 oz (180 gsm), 100% US-grown cotton, seamless tubular body, taped neck and shoulders, OEKO-TEX STANDARD 100 certified. Printed direct-to-garment with water-based ink in Miami, Florida.',
  },
  shipping: {
    q: 'How long until it arrives?',
    a: 'Every shirt is printed after you order it, which takes up to 10 days, then it ships. US orders of $50 or more ship free — two shirts get you there.',
  },
};

export const SHELF_GUIDES: Record<string, ShelfGuide> = {
  'the-confessional': {
    heading: 'Funny confession shirts, for the things you’d only tell a stranger',
    body: [
      'The Confessional is where the specific ones live: the eulogy you plugged your Instagram in, the Costco parking lot you got dumped in and still went inside. Each shirt is a single admission, set large and printed plainly, so the joke lands before anyone has to ask.',
      'They work best on people with a good story and no shame about it — and as gifts for the friend whose stories you’ve heard too many times.',
    ],
    faq: [
      {
        q: 'Are these real confessions?',
        a: 'They’re written to sound like one. Whether they’re true of the person wearing it is between them and whoever reads it.',
      },
      SHARED_FAQ.quality,
      SHARED_FAQ.shipping,
    ],
    related: ['errata', 'courtship', 'petty-crimes'],
    gifts: ['for-your-worst-friend', 'white-elephant'],
  },
  'terms-conditions': {
    heading: 'Warning-label and fine-print shirts',
    body: [
      'Terms & Conditions treats a person like a product: warning labels, care instructions, clearance stickers and the small print nobody reads. “Reduced for Quick Sale.” “Batteries Not Included (Neither Is Effort).” It’s the shelf for people who come with a disclaimer.',
      'The retail jokes started at Aisle 9 and never left. They’re the easiest shirts here to wear to a family event.',
    ],
    faq: [
      {
        q: 'Which shirt is the safest to wear in public?',
        a: 'This shelf, mostly. The labels are self-deprecating rather than explicit — “Fragile: Handle Never” gets a laugh at a barbecue without a follow-up conversation.',
      },
      SHARED_FAQ.quality,
      SHARED_FAQ.shipping,
    ],
    related: ['errata', 'the-confessional', 'vices'],
    gifts: ['for-coworkers', 'white-elephant'],
  },
  courtship: {
    heading: 'Funny dating and relationship shirts',
    body: [
      'Courtship covers flirting, dating, situationships and the people who’ve made it out the other side. Some are sweet (“I Love and Cherish My Wife”), most are not, and a fair few come in his-and-hers versions for couples who’d like the whole room to know.',
      'It’s the biggest shelf on the site, because romance is where people make the most mistakes.',
    ],
    faq: [
      {
        q: 'Do you have matching couple shirts?',
        a: 'Yes — many designs here have a partner version (girlfriend/boyfriend, husband/wife, milfs/dilfs). They’re collected in The Pair Programme, and two shirts take 10% off automatically.',
      },
      {
        q: 'Are these shirts explicit?',
        a: 'Some are. The jokes are text only — no imagery — but a number of them are written for adults. Read before you gift.',
      },
      SHARED_FAQ.shipping,
    ],
    related: ['the-pair-programme', 'the-confessional', 'vices'],
    gifts: ['for-couples', 'for-your-boyfriend', 'for-your-girlfriend', 'bachelor-bachelorette'],
  },
  vices: {
    heading: 'Funny drinking and party shirts',
    body: [
      'Vices is the shelf for the bar, the function and the morning after: “Open Bar Athlete,” “Sober-ish,” “I Only Smoke When I Drink (I Always Drink).” Habits you’ve stopped apologising for, printed in a typeface that suggests you’ve thought about it.',
      'Popular for bachelor and bachelorette weekends, birthdays and anyone whose bartender knows their name.',
    ],
    faq: [
      {
        q: 'Can I get matching shirts for a group trip?',
        a: 'Any design can be ordered in any quantity, and Stack & Save takes 30% off orders of four shirts or more, automatically at checkout.',
      },
      SHARED_FAQ.quality,
      SHARED_FAQ.shipping,
    ],
    related: ['petty-crimes', 'courtship', 'the-confessional'],
    gifts: ['for-drinkers', 'bachelor-bachelorette'],
  },
  errata: {
    heading: 'Self-deprecating shirts and deliberate typos',
    body: [
      'Errata is mistakes, printed permanently: “I’m Stupid,” “Certified Yapper,” “Napping Through My Prime” — and a handful of shirts misspelled on purpose (“Shrit,” “Limited Editoin”). The typos are the joke. We promise.',
      'It’s the most wearable shelf for people who’d rather insult themselves before anyone else gets the chance.',
    ],
    faq: [
      {
        q: 'Are the misspellings mistakes?',
        a: 'No. “Shrit,” “Muscel Shirt” and the rest are spelled that way on purpose. If one ever arrives misprinted by accident, we replace it free.',
      },
      SHARED_FAQ.quality,
      SHARED_FAQ.shipping,
    ],
    related: ['the-confessional', 'terms-conditions', 'petty-crimes'],
    gifts: ['for-your-worst-friend', 'for-coworkers'],
  },
  'petty-crimes': {
    heading: 'Shirts for minor, non-indictable offences',
    body: [
      'Petty Crimes is tax evasion jokes, weak alibis and being known to local authorities: “Guilty Until Proven Guilty,” “My Alibi Is Weak,” “I’d Cheat at Monopoly.” Offences against taste rather than the law — nothing here is a confession anyone could use.',
      'Good for the friend who has never once returned a shopping cart.',
    ],
    faq: [
      {
        q: 'Will a shirt get me in trouble?',
        a: 'The crimes are petty by design. Wearing “Person of Interest” to an airport is a choice we can’t make for you.',
      },
      SHARED_FAQ.quality,
      SHARED_FAQ.shipping,
    ],
    related: ['vices', 'errata', 'the-confessional'],
    gifts: ['for-your-worst-friend', 'white-elephant'],
  },
  'the-pair-programme': {
    heading: 'Matching couple shirts',
    body: [
      'The Pair Programme collects the designs that come in two: girlfriend and boyfriend, husband and wife, milfs and dilfs, the one who fears and the one who is feared. Each half works alone; together they’re a warning to everyone else at the party.',
      'Add both to the cart and Stack & Save takes 10% off automatically — no code, no form.',
    ],
    faq: [
      {
        q: 'Do both shirts have to be the same size or colour?',
        a: 'No. Pick each shirt’s size and colour separately; the discount applies to any two shirts.',
      },
      {
        q: 'How does the couples discount work?',
        a: 'It’s Stack & Save: 2 shirts take 10% off, 3 take 20%, 4 or more take 30%, applied automatically at checkout.',
      },
      SHARED_FAQ.shipping,
    ],
    related: ['courtship', 'the-confessional', 'vices'],
    gifts: ['for-couples', 'for-your-boyfriend', 'for-your-girlfriend'],
  },
  tees: {
    heading: 'Every SCHMUCKS shirt, in one place',
    body: [
      'Every design we print, numbered in the order it was written. Each is a single line of type on a heavyweight cotton tee, printed to order in Miami — no stock sitting in a warehouse, no seasons, nothing on sale because it didn’t sell.',
    ],
    faq: [SHARED_FAQ.quality, SHARED_FAQ.shipping],
    related: ['the-confessional', 'courtship', 'errata'],
    gifts: ['for-your-worst-friend', 'for-couples'],
  },
};

export function shelfGuide(handle: string | undefined | null) {
  return handle ? SHELF_GUIDES[handle] : undefined;
}
