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
    slug: 'why-our-shirts-got-bolder',
    title: 'Why Our Shirts Got Bolder',
    dek: 'We reset 372 designs in a heavier typeface. Here is what changed, and why a thin letter is a liability on cotton.',
    tag: 'Behind the Counter',
    date: '2026-11-25',
    readingTime: '4 min read',
    author: 'The Schmucks Desk',
    lead: 'For a while our shirts whispered. The jokes were set in a hairline serif at about a third of the chest, and on an actual person, across an actual room, they mostly read as a smudge. So we fixed it.',
    bodyHtml: `
      <p>The original idea was restraint. A one-line confession, set small in an elegant, high-contrast serif, the way a fashion house might print its name. On a screen it looked expensive. On cotton it had two problems.</p>
      <h2>Problem one: nobody could read it</h2>
      <p>A joke shirt has one job, which is to be read by someone who did not ask to read it. Ours were being read by the wearer and approximately no one else. The thin strokes of a display serif vanish at a distance, and a line set at a third of the chest width turns into texture by the time it is across a bar.</p>
      <h2>Problem two: thin lines do not print well</h2>
      <p>Our shirts are printed direct-to-garment — the ink goes straight into the cotton, like an inkjet onto very expensive paper. That is why the print feels soft. It also means the very finest strokes of a typeface can break up into the weave instead of printing as a clean line. A hairline that looks crisp on a monitor can come out looking faded and frayed on the shirt.</p>
      <h2>What we changed</h2>
      <p>Every design from N°. 21 to N°. 394 has been reset in a heavy editorial serif, roughly twice the visual weight of the old one, and sized to fill about three-quarters of the print area. Lines break evenly so nothing hangs alone. The caption underneath — <em>SCHMUCKS · N°. 042</em> — is bolder too, because the number is part of the joke. The layout is the same: the statement, a rule, the number. It just speaks up now.</p>
      <p>We kept the serif on purpose. A joke about crying at a car wash, set like the masthead of a serious magazine, is funnier than the same joke in a cartoon font. The contrast is the bit.</p>
      <h2>What did not change</h2>
      <p>Same <a href="/pages/materials">Gildan 5000 heavyweight cotton</a>, same Miami print shop, same price, same <a href="/pages/shipping-returns">30-day returns</a>. Designs N°. 1 to 20 were already set in our chunky deli slab and stayed exactly as they were. If you bought one of the old prints, it is now a limited edition, which is a nicer way of describing a mistake than we usually manage.</p>
    `,
  },
  {
    slug: 'how-to-wash-a-graphic-tee',
    title: 'How to Wash a Graphic Tee So the Print Lasts',
    dek: 'Four rules, one of which you are currently breaking. The joke should outlive the shirt, not the other way round.',
    tag: 'Care',
    date: '2026-11-18',
    readingTime: '3 min read',
    author: 'The Schmucks Desk',
    lead: 'Most graphic tees do not wear out. They get washed out — too hot, too often, face up against a zip. Here is how to keep a printed shirt looking printed.',
    bodyHtml: `
      <p>Our shirts are printed direct-to-garment with water-based ink, which means the design is in the cotton rather than sitting on top of it like a sticker. That is why it feels soft. It also means the print ages the way the cotton ages, so looking after one looks after the other.</p>
      <h2>1. Turn it inside out</h2>
      <p>The print should never be the side that rubs against the drum, jeans rivets or someone else&rsquo;s zip. Inside out, every time. This one habit does more than the other three combined.</p>
      <h2>2. Wash cold</h2>
      <p>Machine wash cold with like colours. Heat is what fades ink and shrinks cotton, and a cold wash gets a t-shirt every bit as clean as a hot one. Black shirts especially: cold water and like colours keep the black black.</p>
      <h2>3. Tumble dry low — or don&rsquo;t</h2>
      <p>Low heat is fine. High heat is how a size L becomes a gift for your nephew. Hanging it to dry is better still, and it saves you ironing, which brings us to the last rule.</p>
      <h2>4. Never iron the print</h2>
      <p>If it needs pressing, iron it inside out, or iron around the design. A hot iron directly on a print is the fastest way to ruin one. No bleach, no dry cleaning.</p>
      <p>That is it. The same advice is on the <a href="/pages/care">care guide</a> and the label. Follow it and the shirt will outlast the joke — and if a print ever arrives faulty, that is on us, not your washing machine: see <a href="/pages/shipping-returns">returns</a>.</p>
    `,
  },
  {
    slug: 'funny-shirt-gifts-that-actually-get-worn',
    title: 'Funny Shirt Gifts That Actually Get Worn',
    dek: 'Most novelty gifts end up in a drawer. Here is how to pick the one that ends up in the rotation.',
    tag: 'Gift Guide',
    date: '2026-11-10',
    readingTime: '4 min read',
    author: 'The Schmucks Desk',
    lead: 'A funny shirt is the easiest gift to buy and the easiest to get wrong. The difference between a laugh and a drawer is about three decisions.',
    bodyHtml: `
      <h2>Pick the true one, not the funniest one</h2>
      <p>The shirt that gets worn is the one that is accurate. Not the most outrageous line in the shop — the one that makes everyone who knows them say &ldquo;well, yes.&rdquo; Accuracy is funnier than shock, and it is flattering in a way shock is not. The friend who has heard every story twice gets something from <a href="/collections/the-confessional">The Confessional</a>. The one who has never returned a shopping cart gets <a href="/collections/petty-crimes">Petty Crimes</a>.</p>
      <h2>Know where it will be worn</h2>
      <p>Some of our shirts are fine at a family barbecue. Some are not fine anywhere your grandmother is. If it is a Secret Santa or a work swap, stay on <a href="/collections/terms-conditions">Terms &amp; Conditions</a> — warning labels and fine print, no explicit language. Our <a href="/gifts/for-coworkers">coworker guide</a> is the office-safe edit.</p>
      <h2>Get the size right</h2>
      <p>The shirts are a standard unisex fit, sizes S to 3XL. If you are guessing, go with their usual t-shirt size; if you are unsure between two, size up — a slightly big shirt gets worn, a tight one does not. The <a href="/pages/size-guide">size guide</a> has measurements if you can steal one of their shirts to compare.</p>
      <h2>Buy two</h2>
      <p>Not as an upsell — it is genuinely the better gift. One for them, one for you, or a <a href="/gifts/for-couples">matching pair</a> for a couple. Two shirts take 10% off automatically, and in the US two shirts also clear free shipping.</p>
      <h2>Order early</h2>
      <p>Every shirt is printed after you order it, which takes up to 10 days before it ships. For a birthday or the holidays, give it two to three weeks. Browse every guide at <a href="/gifts">/gifts</a>.</p>
    `,
  },
  {
    slug: 'why-every-shirt-has-a-number',
    title: 'Why Every Shirt Has a Number',
    dek: 'N°. 001 to N°. 394, and counting. The catalogue number is not decoration — it is how we keep ourselves honest.',
    tag: 'Behind the Counter',
    date: '2026-10-30',
    readingTime: '3 min read',
    author: 'The Schmucks Desk',
    lead: 'Look under any joke on a Schmucks shirt and you will find a catalogue number. People ask what it is for. Mostly, it is for us.',
    bodyHtml: `
      <p>Every design gets a number in the order it was written. <em>Certified Schmuck</em> is N°. 001. <em>I Peaked at My Own Birthday Party (Age 9)</em> is N°. 394. The number is printed on the shirt, under a rule, in the same place every time.</p>
      <h2>It makes a joke a series</h2>
      <p>One funny shirt is a novelty. Three hundred and ninety-four numbered ones is a catalogue — a body of work, written by idiots, filed with the care of a library. The number turns a throwaway line into an entry in something larger, which is funnier, and also slightly more expensive-looking than it has any right to be.</p>
      <h2>It stops us repeating ourselves</h2>
      <p>With hundreds of one-liners, it is easy to write the same joke twice in different words. Numbering everything means there is one list, in order, that we check new lines against. If it is already on the list, it does not get a second number.</p>
      <h2>It gives you something to ask for</h2>
      <p>&ldquo;The one about the Costco parking lot&rdquo; is a description. &ldquo;N°. 387&rdquo; is an order. Search the shop by number, quote it in an email, or start collecting them in order. We are not going to stop you.</p>
      <p>The full catalogue is on <a href="/tees">every shirt</a>, sorted newest first. The numbers keep going up.</p>
    `,
  },
  {
    slug: 'matching-couple-shirts-without-the-cringe',
    title: 'Matching Couple Shirts, Without the Cringe',
    dek: 'Two people, two shirts, one bad idea. How to do matching outfits so it reads as a joke you are both in on.',
    tag: 'Styling',
    date: '2026-10-20',
    readingTime: '3 min read',
    author: 'The Schmucks Desk',
    lead: 'Matching couple shirts have a reputation, and it is earned. Done right, though, they are the rare couples thing that is actually funny to everyone else in the room.',
    bodyHtml: `
      <h2>Make the shirts talk to each other</h2>
      <p>The best couple shirts are not identical — they are two halves of the same joke. &ldquo;Bare Minimum Boyfriend&rdquo; and &ldquo;Bare Minimum Girlfriend.&rdquo; &ldquo;Husband Material (Clearance Bin)&rdquo; and &ldquo;Wife Material (Final Sale).&rdquo; Each one works alone. Together they are a bit. We keep every pair in <a href="/collections/the-pair-programme">The Pair Programme</a>.</p>
      <h2>Split the colours</h2>
      <p>One in Black, one in Natural. Identical shirts in identical colours read as a uniform; the same line in opposite colours reads as a decision. It also photographs better.</p>
      <h2>Pick your sizes separately</h2>
      <p>The shirts are unisex, S to 3XL, and each one is ordered on its own — there is no &ldquo;set&rdquo; forcing you into the same size. If one of you likes a closer fit, go down a size; for a boxier look, go up. The <a href="/pages/size-guide">size guide</a> has the measurements.</p>
      <h2>Wear them once, together, on purpose</h2>
      <p>Matching shirts work as an event — a birthday, a wedding weekend, a trip — not as a lifestyle. Wear them separately the rest of the time and nobody needs to know.</p>
      <p>Add both halves to the cart and Stack &amp; Save takes 10% off automatically. More ideas in the <a href="/gifts/for-couples">couples gift guide</a>.</p>
    `,
  },
  {
    slug: 'the-anatomy-of-a-25-dollar-shirt',
    title: 'The Anatomy of a Schmucks Shirt',
    dek: 'A stupid design does not require a stupid shirt. Here is where the money actually goes.',
    tag: 'Materials',
    date: '2026-06-24',
    readingTime: '4 min read',
    author: 'The Schmucks Desk',
    lead: 'We sell shirts with jokes on them. That is the whole business. But the joke is the cheap part — the shirt underneath is where we refuse to be idiots.',
    bodyHtml: `
      <p>There is a certain kind of novelty tee that feels like a punishment. Thin as a napkin, a print that cracks after one wash, a collar that gives up by Thursday. You wear the joke twice and then it becomes a rag for cleaning the car. We think that is a waste of a good joke.</p>
      <p>So before we ever put a dumb slogan on the front, we start with the blank. Ours is the Gildan 5000, 100% cotton at 180 gsm (5.3 oz) — "gsm" being grams per square metre, the single most useful number nobody tells you at checkout. Lightweight fast-fashion tees hover around 130–150 gsm. Ours sits noticeably heavier, which is why a Schmucks shirt has a bit of weight in the hand and does not go see-through the first time you stretch.</p>
      <h2>What we will not tell you about it</h2>
      <p>We will not tell you it is ringspun, because it is not. Ringspun cotton is twisted into a finer, smoother yarn and it does feel softer — but this is a classic carded cotton, and pretending otherwise would be exactly the sort of thing this page exists to avoid. What it is instead: tightly knit, which is why print detail stays sharp on it, and heavy enough to survive being owned.</p>
      <p>What we will tell you is the stuff that is actually verifiable. The cotton is grown and harvested in the US under the Cotton Trust Protocol. The blank is certified to OEKO-TEX® Standard 100 (certificate 168252, OETI), which means it has been tested for substances that are bad news against skin. And the body is tubular — no side seams at all, so there is nothing running down your ribs.</p>
      <p>We also pay attention to the parts nobody photographs. A double-needle hem at the sleeve and bottom means two rows of stitching instead of one, so the edges do not unravel or curl. A ribbed crew collar with a little elastane keeps its shape instead of stretching into a sad, wide scoop. Shoulder-to-shoulder taping hides the seam and stops the neck from warping when you yank it over your head in a hurry.</p>
      <h2>The print is the part that has to survive you</h2>
      <p>A design is only as good as its worst wash. We print with methods matched to the design — soft-hand water-based inks where we want the graphic to sink into the fabric and feel like part of the shirt rather than a plastic sticker sitting on top of it. Done right, you should be able to run your hand across the print and barely feel the edge. Done wrong, it feels like a laminated menu.</p>
      <p>Because every shirt is <a href="/pages/materials">printed to order</a>, the graphic going onto your shirt is fresh, not a design that has been sitting boxed in a warehouse for eight months slowly fading under fluorescent light. It also means we are not landfilling unsold stock, which is a nice thing to be able to say without lying.</p>
      <h2>Where the money actually goes</h2>
      <p>One flat price for every design. No "premium" tier where the same shirt costs more because the graphic is trendier this week. That price buys the heavier blank, the certified cotton, the reinforced seams, and a print built to outlast the joke. What it does not buy is a fake origin story or a markup for the privilege of a logo you paid to advertise.</p>
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
      <p>Every design comes on Black or Natural (a handful also on Gold), and every print is a single line of type. That restraint is your cheat code. Two <em>different</em> designs on the same colour read as a set without screaming it. Natural with Natural. Black with Black. Or split them — one of each — and let the type do the matching. You look coordinated; you do not look like a uniform.</p>
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
      <p>The less obvious win is freshness. A print made this week has not spent months boxed under warehouse lights slowly oxidising. The graphic going on your shirt is new. The blank is pulled fresh. On <a href="/pages/materials">a tightly knit 180 gsm blank</a>, a fresh water-based print sits into the fabric properly instead of sitting on top of it like a decal.</p>
      <p>And it means we can put out <a href="/tees">new designs</a> constantly without betting the company on each one. A dumb idea on a Tuesday can be live by the weekend. If three people buy it, great. If three thousand do, also great, and we did not have to print thirty thousand to find out.</p>
      <h2>The honest downside</h2>
      <p>Print-to-order is slower than pulling a folded shirt off a shelf. We are making your specific shirt, so there is a production step between "you ordered" and "it ships" — up to 10 days before it goes out the door, on top of transit time. If you need a shirt tomorrow for a party tonight, we are not your brand, and we would rather say that plainly than bury it in the fine print.</p>
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
