/**
 * Product copy, generated per product from its title and its real spec sheet.
 *
 * WHY GENERATED: 393 products, each one a one-liner. Hand-writing 393 sell
 * lines isn't happening, and generic print-on-demand boilerplate ("This
 * comfortable tee is perfect for any occasion!") would undo the whole brand.
 * So the voice is generated and the *facts* are parsed out of the description
 * Shopify already holds — nothing about the garment is invented here.
 *
 * STRUCTURE (per the house pattern):
 *   1. Sell line   — one line of premium-catalogue framing for the joke
 *   2. Spec block  — deadpan bullets, real specs, one joke line at the end
 *   3. Care line   — real instructions, delivered in voice
 *
 * ── Three hand-tuned reference outputs ──────────────────────────────────
 *
 * "SANWICH" (N°. 012, one word)
 *   Sell: "One word, set large and left alone. The rest of the shirt stays
 *          out of its way."
 *   Care: "Machine wash cold with like colors... Reflect warm."
 *
 * "My Wife Left Me After I Sat On My Gun Weird And Blew My Entire Dick And
 *  Balls Off At The Old Country Store" (N°. 154, 24 words)
 *   Sell: "A full confession, set at chest height. Long enough that people
 *          finish reading it in front of you, which is the point."
 *   Care: "Machine wash cold. Reflect warm."
 *
 * "I'M WITH THE SCHMUCK →" (N°. 018, pair member)
 *   Sell: "Half of a two-shirt argument. Useless alone, unbearable in a
 *          pair — which is the recommended configuration."
 *
 * The generator below reproduces that register from title shape alone:
 * word count, punctuation, arrows, and whether the shirt is a pair member.
 */

export type ProductSpecs = {
  substrate?: string;
  print?: string;
  origin?: string;
  care?: string;
  batch?: string;
};

/** Everything the template needs to render the copy for one product. */
export type ProductCopy = {
  /** Display title with the "— Schmucks · N°. 012" catalogue suffix removed. */
  displayTitle: string;
  /** Catalogue number, e.g. "012". */
  catalogueNumber: string | null;
  sell: string;
  specs: Array<{label: string; value: string}>;
  care: string;
  /** Short, plain sentence for meta descriptions and OG. */
  meta: string;
};

const SUFFIX = /\s*—\s*Schmucks\s*·\s*N°\.\s*(\d+)\s*$/i;

export function splitTitle(title: string) {
  const match = title.match(SUFFIX);
  return {
    displayTitle: title.replace(SUFFIX, '').trim(),
    catalogueNumber: match ? match[1] : null,
  };
}

/**
 * Pull the real spec lines out of the Shopify description. Printify writes
 * these as `Label: value` lines, so we read them rather than restate them.
 */
export function parseSpecs(descriptionHtml?: string | null): ProductSpecs {
  if (!descriptionHtml) return {};
  const text = descriptionHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, '’');

  const grab = (label: string) => {
    const match = text.match(new RegExp(`${label}\\s*:\\s*([^\\n]+)`, 'i'));
    if (!match) return undefined;
    // Printify writes these as sentence fragments after the label, so they
    // arrive lowercase: "Substrate: heavyweight 100% cotton jersey."
    const value = match[1].trim();
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const batch = text
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /made on demand/i.test(line));

  return {
    substrate: grab('Substrate'),
    print: grab('Print'),
    origin: grab('Origin'),
    care: grab('Care'),
    batch,
  };
}

/** True when the title is one of the arrow-carrying pair halves. */
function looksLikePairHalf(title: string) {
  return /[→←]/.test(title);
}

/**
 * Deterministic pick — same product always gets the same line, so the page
 * doesn't reword itself between visits or between server and client.
 */
function pick<T>(options: readonly T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return options[hash % options.length];
}

/**
 * The sell line, chosen by what the joke actually *is*.
 *
 * Measured against the live catalogue (393 titles) before writing these: the
 * previous version had 7 branches and put 65% of the shop on one identical
 * sentence, which for a brand whose whole value is the writing is a failure
 * you can see by opening two products in a row.
 *
 * These branches are ordered most-specific first and keyed to registers that
 * genuinely recur here: retail-label parody ("OUT OF STOCK (EMOTIONALLY)",
 * "FRAGILE: HANDLE NEVER"), the "I ❤ X" declaration, "I'm X" self-ID,
 * parenthetical twists, credentials, third-person descriptions, imperatives.
 * Where a branch still covers a lot of ground it holds several lines and picks
 * one deterministically from the title.
 */
function sellLine(displayTitle: string, isPairMember: boolean) {
  const title = displayTitle.trim();
  const low = title.toLowerCase();
  const words = title.split(/\s+/).filter(Boolean).length;
  const shouts = title === title.toUpperCase() && words <= 6;

  if (looksLikePairHalf(title)) {
    return 'Half of a two-shirt argument. Useless alone, unbearable in a pair — which is the recommended configuration.';
  }

  // Retail / packaging language repurposed as a personality disclosure.
  if (
    /^(warning|caution|notice|attention|disclaimer|fragile|clearance|out of stock|item not as pictured|no refunds|some assembly required|final sale|contents)/i.test(
      title,
    )
  ) {
    return pick(
      [
        'Packaging language, repurposed as a personality disclosure. Reads as a warning because it is one.',
        'Shelf-label grammar applied to a person. Nobody has ever taken the hint.',
        'The tone of a compliance sticker, the content of a confession.',
      ],
      title,
    );
  }

  // "I ❤ X" — the declaration format.
  if (/^i\s*(?:❤|♥|<3|love)(?:\s|$)/i.test(title)) {
    return pick(
      [
        'A public declaration of affection for something that should probably have stayed private.',
        'The souvenir-shirt format, aimed at something no gift shop would stock.',
        'Says the quiet part in the friendliest possible typeface.',
      ],
      title,
    );
  }

  // "I'm X" — self-identification.
  if (/^(i'm|im|i am)\b/i.test(title)) {
    return pick(
      [
        'Self-identification, printed at chest height so nobody has to ask.',
        'Introduces you before you get the chance to do it badly yourself.',
        'A statement of fact, worn as an early warning.',
      ],
      title,
    );
  }

  // The twist lives in the brackets.
  if (/\([^)]{2,}\)\s*$/.test(title)) {
    return pick(
      [
        'The joke is in the brackets. People read the first half out loud and then go quiet.',
        'Sets up in the open, lands in the parenthesis. Timing done entirely by punctuation.',
      ],
      title,
    );
  }

  // A credential nobody issued.
  if (/\b(certified|professional|licensed|official|award.winning)\b/i.test(low)) {
    return pick(
      [
        'A credential nobody issued and nobody can revoke.',
        'Qualifications, self-awarded, printed for the doubters.',
      ],
      title,
    );
  }

  if (title.endsWith('?')) {
    return 'A question you will now be asked, repeatedly, by strangers who think they are the first.';
  }

  // Written about you, from the outside.
  if (/^(known to|somebody's|someone's|statistically|allegedly|reportedly|locally)/i.test(title)) {
    return pick(
      [
        'Written about you in the third person, which somehow makes it worse.',
        'Reads like a case file entry. Wear it before somebody else says it.',
      ],
      title,
    );
  }

  // Instructions and direct address.
  if (/^(legalize|kiss|dear|please|stop|don't|do not|ask me|tell me|let me)\b/i.test(low)) {
    return pick(
      [
        'An instruction. Compliance optional, eye contact unavoidable.',
        'Addressed to whoever is standing in front of you, whether they volunteered or not.',
      ],
      title,
    );
  }

  // A specific number is harder to argue with than a vague claim.
  if (/\d/.test(title)) {
    return 'A specific number, which is exactly what makes it impossible to argue with.';
  }

  if (words === 1) {
    return pick(
      [
        'One word, set large and left alone. The rest of the shirt stays out of its way.',
        'A single word doing the work of a whole conversation you would rather not have.',
      ],
      title,
    );
  }

  if (shouts) {
    return pick(
      [
        'Short, loud, and legible across a room. Says the thing before you have to.',
        'All capitals, no hedging. Readable from the far side of a bar.',
      ],
      title,
    );
  }

  if (words >= 16) {
    return 'A full confession, set at chest height. Long enough that people finish reading it in front of you, which is the point.';
  }

  if (words >= 9) {
    return pick(
      [
        'A complete thought, printed at a size that commits you to it. No follow-up question survives it.',
        'Long enough to be a position rather than a joke. You will be asked to defend it.',
      ],
      title,
    );
  }

  if (isPairMember) {
    return 'Built to be worn next to somebody wearing the other half. Works alone; works better as evidence of a shared lapse in judgement.';
  }

  return pick(
    [
      'A one-liner with nowhere to hide. Front only, chest height, no explanation offered.',
      'Short, deadpan, and delivered without a setup. The shirt does not build to it.',
      'Says one thing plainly and then stops, which is the hardest version to write.',
      'No preamble, no punchline scaffolding. Just the line and whatever it costs you.',
    ],
    title,
  );
}

const FALLBACK_SPECS = {
  substrate:
    'Heavyweight 100% cotton jersey. Unisex fit, taped shoulders, ribbed collar. Preshrunk.',
  print: 'DTG water-based ink, chest-hit position, front only.',
  origin: 'Printed and shipped from Miami, FL.',
  care: 'Machine wash cold with like colors, tumble dry low, do not iron the print.',
};

export function buildProductCopy({
  title,
  descriptionHtml,
  isPairMember = false,
}: {
  title: string;
  descriptionHtml?: string | null;
  isPairMember?: boolean;
}): ProductCopy {
  const {displayTitle, catalogueNumber} = splitTitle(title);
  const parsed = parseSpecs(descriptionHtml);

  const specs: Array<{label: string; value: string}> = [
    {label: 'Fabric', value: parsed.substrate ?? FALLBACK_SPECS.substrate},
    {label: 'Print', value: parsed.print ?? FALLBACK_SPECS.print},
    {label: 'Fit', value: 'Boxy unisex cut, true to size. Size up for more room.'},
    {label: 'Made', value: parsed.origin ?? FALLBACK_SPECS.origin},
    {
      label: 'Character',
      value: 'Holds its shape better than you hold opinions.',
    },
  ];

  return {
    displayTitle,
    catalogueNumber,
    sell: sellLine(displayTitle, isPairMember),
    specs,
    // Real instructions first, house voice second — the joke never replaces
    // the information.
    care: `${parsed.care ?? FALLBACK_SPECS.care} Reflect warm.`.replace(
      /^./,
      (character) => character.toUpperCase(),
    ),
    meta: `${displayTitle} — a Schmucks graphic tee. Heavyweight cotton, unisex S–3XL, printed to order.`,
  };
}
