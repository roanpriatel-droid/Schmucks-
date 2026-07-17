/**
 * Seeded editorial content for the Schmucks Journal.
 * Real, on-voice long-form (600+ words each). Swap in real photography later.
 * Body is trusted, hand-authored HTML (rendered via dangerouslySetInnerHTML).
 */

export type JournalArticle = {
  slug: string;
  title: string;
  dek: string;
  tag: string;
  date: string; // ISO
  readingTime: string;
  author: string;
  lead: string;
  bodyHtml: string;
};

export const JOURNAL: JournalArticle[] = [
  {
    slug: 'the-anatomy-of-a-25-dollar-shirt',
    title: 'The Anatomy of a $25 Shirt',
    dek: 'A stupid design does not require a stupid shirt. Here is where the money actually goes.',
    tag: 'Materials',
    date: '2026-06-24',
    readingTime: '4 min read',
    author: 'The Schmucks Desk',
    lead: 'We sell shirts with jokes on them. That is the whole business. But the joke is the cheap part — the shirt underneath is where we refuse to be idiots.',
    bodyHtml: `
      <p>There is a certain kind of novelty tee that feels like a punishment. Thin as a napkin, a print that cracks after one wash, a collar that gives up by Thursday. You wear the joke twice and then it becomes a rag for cleaning the car. We think that is a waste of a good joke.</p>
      <p>So before we ever put a dumb slogan on the front, we start with the blank. Ours is a heavyweight ringspun cotton in the ~180 gsm range — "gsm" being grams per square metre, the single most useful number nobody tells you at checkout. Lightweight fast-fashion tees hover around 130–150 gsm. Ours sits noticeably heavier, which is why a Schmucks shirt has a bit of weight in the hand and does not go see-through the first time you stretch.</p>
      <h2>Ringspun means softer, stronger</h2>
      <p>Cotton comes in two broad flavours for tees: open-end (cheap, coarse, fuzzy) and ringspun (the fibres are twisted and thinned into a finer, smoother yarn). Ringspun costs more and feels better — softer against the skin and, counter-intuitively, more durable, because the tighter twist resists pilling and thinning. It is the difference between a shirt you tolerate and a shirt you reach for.</p>
      <p>We also pay attention to the parts nobody photographs. A double-needle hem at the sleeve and bottom means two rows of stitching instead of one, so the edges do not unravel or curl. A ribbed crew collar with a little elastane keeps its shape instead of stretching into a sad, wide scoop. Shoulder-to-shoulder taping hides the seam and stops the neck from warping when you yank it over your head in a hurry.</p>
      <h2>The print is the part that has to survive you</h2>
      <p>A design is only as good as its worst wash. We print with methods matched to the design — soft-hand water-based inks where we want the graphic to sink into the fabric and feel like part of the shirt rather than a plastic sticker sitting on top of it. Done right, you should be able to run your hand across the print and barely feel the edge. Done wrong, it feels like a laminated menu.</p>
      <p>Because every shirt is <a href="/pages/materials">printed to order</a>, the graphic going onto your shirt is fresh, not a design that has been sitting boxed in a warehouse for eight months slowly fading under fluorescent light. It also means we are not landfilling unsold stock, which is a nice thing to be able to say without lying.</p>
      <h2>Where the $25 actually goes</h2>
      <p>Twenty-five dollars, flat, for every design. No "premium" tier where the same shirt costs forty because the graphic is trendier this week. That price buys the heavier blank, the ringspun yarn, the reinforced seams, and a print built to outlast the joke. What it does not buy is a fake origin story or a markup for the privilege of a logo you paid to advertise.</p>
      <p>Is it the most expensive shirt you can buy? Obviously not. Is it a genuinely good shirt that happens to say something regrettable across the chest? That is exactly the point. Buy two and the <a href="/pages/size-guide">fit</a> gets even easier to dial in — and the <a href="/matching-sets">stacking discount</a> makes the second one cheaper, which is the only responsible way to make an irresponsible decision.</p>
      <p>We are idiots about a lot of things. The shirt is not one of them.</p>
    `,
  },
  {
    slug: 'how-to-stack-a-schmuck',
    title: 'How to Stack a Schmuck',
    dek: 'Matching sets, layering, and the fine art of coordinating with someone against their will.',
    tag: 'Styling',
    date: '2026-06-30',
    readingTime: '3 min read',
    author: 'The Schmucks Desk',
    lead: 'A matching set is not a costume. Done with a little restraint, two coordinated tees read as "we planned this" rather than "we lost a bet." Usually.',
    bodyHtml: `
      <p>The instinct with matching anything is to go loud — same shirt, same colour, standing side by side like a two-man tribute band. You can do that. We will not stop you. But the better move, the one that actually looks intentional, is quieter than that.</p>
      <h2>Match the palette, not the print</h2>
      <p>Our whole line lives inside four colours: mustard, ink, cream, and a hit of ketchup red. That is deliberate, and it is your cheat code. Two <em>different</em> designs in the same colourway read as a set without screaming it. Cream on cream. Ink on ink. One person in the loud graphic, one in the quiet one. You look coordinated; you do not look like a uniform.</p>
      <p>If you want the harder-to-pull-off version — same design, two people — keep everything else neutral. Plain trousers, plain shoes, no competing patterns. The shirt is the whole statement, so let it be the whole statement.</p>
      <h2>Layering, for the commitment-averse</h2>
      <p>A graphic tee under an open overshirt or a plain crewneck is the adult way to wear a shirt that says something unhinged. You get the joke when the jacket is open and plausible deniability when it is closed. This is also how you get a summer shirt through autumn. Heavier fabric like <a href="/pages/materials">ours</a> layers well precisely because it is not tissue-thin under a second layer.</p>
      <p>Boxy tee, roomy trouser is the current shape and, conveniently, the most forgiving. Our tees run true to size with a slightly relaxed body, so if you want the boxy look, take your size; if you want it draped and oversized, size up one. The <a href="/pages/size-guide">size guide</a> has the actual measurements so you are not guessing.</p>
      <h2>The two-person rules, briefly</h2>
      <p>One: never match head to toe. Matching shirts and matching shoes and matching hats is not a set, it is a syndrome. Pick one thing to coordinate and let the rest be yours.</p>
      <p>Two: let the loud one be loud. If one shirt is the punchline, the other should be the setup — simpler, calmer, giving the joke room. Two punchlines cancel each other out.</p>
      <p>Three: buy them together. Not for the aesthetics — for the <a href="/matching-sets">stacking discount</a>, which quietly takes money off when you add the second shirt. Coordinating is cheaper than not coordinating, which is the kind of logic we can get behind.</p>
      <p>A matching set works when it looks like a decision and not an accident. Match the colour, split the volume, keep the rest plain. Do that and you and your favourite idiot will look, for once, like you have your life together.</p>
    `,
  },
  {
    slug: 'why-we-print-to-order',
    title: 'Why We Print to Order',
    dek: 'Less waste, fresher prints, and no warehouse full of shirts nobody wanted. Here is the trade-off, honestly.',
    tag: 'Behind the Counter',
    date: '2026-07-07',
    readingTime: '4 min read',
    author: 'The Schmucks Desk',
    lead: 'Every Schmucks shirt is made after you order it, not before. That choice has real upsides and one honest downside, and we would rather tell you both than pretend there is no catch.',
    bodyHtml: `
      <p>The traditional way to sell shirts is to guess. You pick your designs, print a few thousand of each, stack them in a warehouse, and hope you guessed right. When you guess wrong — and everyone guesses wrong sometimes — you are left with boxes of shirts nobody wanted, which get discounted, then deep-discounted, then landfilled. The fashion industry throws away a genuinely grim amount of unsold clothing every year on exactly this bet.</p>
      <p>We do it backwards. When you order a shirt, that is when it gets printed. No crystal ball, no warehouse of dead stock, no incinerated inventory at the end of the season.</p>
      <h2>What you actually get out of it</h2>
      <p>The obvious win is waste: we are not producing shirts on spec, so we are not destroying the ones that do not sell. There are none that do not sell, because none exist until you ask for one.</p>
      <p>The less obvious win is freshness. A print made this week has not spent months boxed under warehouse lights slowly oxidising. The graphic going on your shirt is new. The blank is pulled fresh. On <a href="/pages/materials">heavyweight ringspun cotton</a>, a fresh water-based print sits into the fabric properly instead of sitting on top of it like a decal.</p>
      <p>And it means we can put out <a href="/tees">new designs</a> constantly without betting the company on each one. A dumb idea on a Tuesday can be live by the weekend. If three people buy it, great. If three thousand do, also great, and we did not have to print thirty thousand to find out.</p>
      <h2>The honest downside</h2>
      <p>Print-to-order is slower than pulling a folded shirt off a shelf. We are making your specific shirt, so there is a production step between "you ordered" and "it ships" — typically a few business days before it goes out the door, on top of transit time. If you need a shirt tomorrow for a party tonight, we are not your brand, and we would rather say that plainly than bury it in the fine print.</p>
      <p>We think the trade is worth it: a slightly longer wait for a better-made, fresher shirt and a supply chain that is not quietly burning its mistakes. But it is a trade, and you should know which side of it you are getting.</p>
      <h2>What it is not</h2>
      <p>Printing to order does not make us a sustainability brand, and we are not going to drape ourselves in that word. We make joke shirts. What we can honestly say is that we do not manufacture waste on purpose, we do not fake scarcity, and we do not pretend a shirt is "limited" to rush you. When something sells out it is because the design is retired or the blank is unavailable, not because a countdown timer told you to panic.</p>
      <p>If you want the full picture on the shirt itself — the weight, the yarn, the seams — it is all on the <a href="/pages/materials">materials page</a>, and the <a href="/pages/care">care guide</a> will keep your fresh print looking fresh. Order it, we will make it, and we will tell you the truth about how long it takes.</p>
    `,
  },
];

export function getArticle(slug: string): JournalArticle | undefined {
  return JOURNAL.find((a) => a.slug === slug);
}
