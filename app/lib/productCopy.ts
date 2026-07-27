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
 *   Sell: "One word, spelled the way it's actually said. The rest of the
 *          shirt stays out of its way."
 *   Care: "Machine wash cold. Reflect warm."
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
 * The sell line. Branches on the shape of the joke, because a one-word title
 * and a 24-word confession need different framing to read as premium rather
 * than as filler.
 */
function sellLine(displayTitle: string, isPairMember: boolean) {
  const words = displayTitle.split(/\s+/).filter(Boolean).length;
  const shouts = displayTitle === displayTitle.toUpperCase() && words <= 6;
  const asksAQuestion = displayTitle.trim().endsWith('?');

  if (looksLikePairHalf(displayTitle)) {
    return 'Half of a two-shirt argument. Useless alone, unbearable in a pair — which is the recommended configuration.';
  }
  if (isPairMember) {
    return 'Built to be worn next to somebody wearing the other half. Works alone; works better as evidence of a shared lapse in judgement.';
  }
  if (asksAQuestion) {
    return 'A question you will now be asked, repeatedly, by strangers who think they are the first.';
  }
  if (words === 1) {
    return 'One word, set large and left alone. The rest of the shirt stays out of its way.';
  }
  if (shouts) {
    return 'Short, loud, and legible across a room. Says the thing before you have to.';
  }
  if (words >= 16) {
    return 'A full confession, set at chest height. Long enough that people finish reading it in front of you, which is the point.';
  }
  if (words >= 9) {
    return 'A complete thought, printed at a size that commits you to it. No follow-up question survives it.';
  }
  return 'A one-liner with nowhere to hide. Front only, chest height, no explanation offered.';
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
