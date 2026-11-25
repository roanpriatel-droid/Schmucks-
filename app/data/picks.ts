/**
 * Hand-picked merchandising: the shirts the home page leads with.
 *
 * Until the store has sales history, "newest first" put the tamest designs
 * (the N° 1–20 deli series) in the hero and the first rail. These are the
 * lines most likely to stop a scroll — sex, vice and petty-crime jokes —
 * chosen to provoke without punching at race or politics.
 *
 * Product GIDs are stable; the handle and title beside each are for humans.
 * To swap one, copy the product's ID from Shopify admin (or ask). Any ID
 * that stops resolving is skipped, so a deleted product can't break the page.
 * Short lines go in the hero: long ones don't read at tile size.
 */
type Pick = {id: string; handle: string; title: string};

const p = (num: string, handle: string, title: string): Pick => ({
  id: `gid://shopify/Product/${num}`,
  handle,
  title,
});

/** Hero wall: first is the large featured tile, then three supports. */
export const HERO_PICKS: Pick[] = [
  p('15504092954852', 'i-heart-milfs', 'I ❤ Milfs'),
  p('15504484892900', 'paying-taxes-is-for-virgins', 'Paying Taxes Is for Virgins'),
  p('15504481911012', 'small-dick-big-dreams', 'Small Dick Big Dreams'),
  p('15504467886308', 'my-liver-my-choice', 'My Liver My Choice'),
];

/** The first product rail on the home page ("Most Likely to Start Something"). */
export const STAFF_PICKS: Pick[] = [
  p('15504447570148', 'this-is-my-only-shirt-with-no-cum-on-it', 'This Is My Only Shirt With No Cum On It'),
  p('15504456122596', 'gaslighting-is-not-real-youre-just-crazy', 'Gaslighting Is Not Real You’re Just Crazy'),
  p('15504483123428', 'im-not-gay-but-20-is-20', 'I’m Not Gay But $20 Is $20'),
  p('15504436068580', 'everything-i-want-to-do-is-illegal', 'Everything I Want to Do Is Illegal'),
  p('15504478306532', 'depressed-and-horny', 'Depressed and Horny'),
  p('15504486596836', 'i-heart-tax-fraud', 'I ❤ Tax Fraud'),
  p('15504128770276', 'ask-your-mom-about-me', 'Ask Your Mom About Me'),
  p('15504379707620', 'grower-not-a-shower', 'Grower Not a Shower'),
  p('15504382329060', 'horny-and-unemployable', 'Horny and Unemployable'),
  p('15504454320356', 'im-not-a-gynecologist-but-ill-take-a-look', 'I’m Not a Gynecologist But I’ll Take a Look'),
  p('15504092332260', 'i-heart-dilfs', 'I ❤ Dilfs'),
  p('15504130080996', 'walking-red-flag', 'Walking Red Flag'),
];

export const PICK_IDS = [...HERO_PICKS, ...STAFF_PICKS].map((pick) => pick.id);
