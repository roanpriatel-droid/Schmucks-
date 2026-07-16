/*
 * PLACEHOLDER brand assets for SCHMUCKS.
 * These are stand-ins built in the deli visual system (arched wordmark w/ red
 * off-register shadow, Mel the rubber-hose deli guy, circular badge stamp).
 * Swap each component's internals for the final SVGs from the
 * "Schmucks Brand Identity System.pdf" when they land in the repo — the
 * component API (className props) stays the same so nothing else needs to change.
 */

type SVGProps = {className?: string; title?: string};

const MUSTARD = '#F2B33D';
const INK = '#1A1714';
const CREAM = '#FAF3E3';
const KETCHUP = '#C8362B';

/** Arched SCHMUCKS wordmark with a ketchup off-register shadow. */
export function Wordmark({className, title = 'Schmucks'}: SVGProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 150"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id="sx-arc" d="M 40 128 A 230 230 0 0 1 480 128" fill="none" />
      </defs>
      {/* off-register red shadow */}
      <text
        x="0"
        y="0"
        dx="6"
        dy="6"
        fontFamily="'Alfa Slab One', Georgia, serif"
        fontSize="86"
        fill={KETCHUP}
        letterSpacing="1"
      >
        <textPath href="#sx-arc" startOffset="50%" textAnchor="middle">
          SCHMUCKS
        </textPath>
      </text>
      {/* main ink fill */}
      <text
        x="0"
        y="0"
        fontFamily="'Alfa Slab One', Georgia, serif"
        fontSize="86"
        fill={INK}
        letterSpacing="1"
      >
        <textPath href="#sx-arc" startOffset="50%" textAnchor="middle">
          SCHMUCKS
        </textPath>
      </text>
    </svg>
  );
}

/** Flat straight wordmark for tight spaces (header/footer). */
export function WordmarkFlat({className, title = 'Schmucks'}: SVGProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 460 90"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="8"
        y="66"
        dx="4"
        dy="4"
        fontFamily="'Alfa Slab One', Georgia, serif"
        fontSize="64"
        fill={KETCHUP}
      >
        SCHMUCKS
      </text>
      <text
        x="8"
        y="66"
        fontFamily="'Alfa Slab One', Georgia, serif"
        fontSize="64"
        fill={INK}
      >
        SCHMUCKS
      </text>
    </svg>
  );
}

/** Mel — 1930s rubber-hose deli guy. Placeholder likeness. */
export function Mel({className, title = 'Mel the deli guy'}: SVGProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 220"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* apron / body */}
      <path
        d="M60 220 L60 150 Q100 130 140 150 L140 220 Z"
        fill={CREAM}
        stroke={INK}
        strokeWidth="6"
      />
      <rect x="92" y="150" width="16" height="70" fill={INK} opacity="0.12" />
      {/* neck */}
      <rect x="88" y="120" width="24" height="30" fill="#E7B98C" stroke={INK} strokeWidth="6" />
      {/* head */}
      <circle cx="100" cy="86" r="44" fill="#F0C89A" stroke={INK} strokeWidth="6" />
      {/* ears */}
      <circle cx="56" cy="88" r="9" fill="#F0C89A" stroke={INK} strokeWidth="5" />
      <circle cx="144" cy="88" r="9" fill="#F0C89A" stroke={INK} strokeWidth="5" />
      {/* paper deli hat */}
      <path
        d="M58 60 Q100 22 142 60 Q120 48 100 50 Q80 48 58 60 Z"
        fill={CREAM}
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* eyes */}
      <circle cx="84" cy="82" r="6" fill={INK} />
      <circle cx="116" cy="82" r="6" fill={INK} />
      {/* brows */}
      <path d="M76 70 q8 -6 16 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M108 70 q8 -6 16 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {/* big mustache */}
      <path
        d="M72 104 Q100 122 128 104 Q114 116 100 114 Q86 116 72 104 Z"
        fill={INK}
      />
      {/* smile */}
      <path
        d="M84 112 q16 12 32 0"
        fill="none"
        stroke={INK}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mel with a big shrug — used on the 404. */
export function MelShrug({className, title = 'Mel shrugging'}: SVGProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 220"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* shrugging arms */}
      <path
        d="M62 168 Q34 150 40 120"
        fill="none"
        stroke={INK}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M178 168 Q206 150 200 120"
        fill="none"
        stroke={INK}
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* upturned palms */}
      <path d="M28 116 q12 -10 24 0" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M188 116 q12 -10 24 0" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      {/* body */}
      <path
        d="M74 220 L74 160 Q120 142 166 160 L166 220 Z"
        fill={CREAM}
        stroke={INK}
        strokeWidth="6"
      />
      {/* head */}
      <circle cx="120" cy="92" r="42" fill="#F0C89A" stroke={INK} strokeWidth="6" />
      <path
        d="M80 66 Q120 30 160 66 Q140 54 120 56 Q100 54 80 66 Z"
        fill={CREAM}
        stroke={INK}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* face — flat, deadpan */}
      <circle cx="106" cy="90" r="5.5" fill={INK} />
      <circle cx="134" cy="90" r="5.5" fill={INK} />
      <path
        d="M94 108 Q120 120 146 108 Q132 116 120 115 Q108 116 94 108 Z"
        fill={INK}
      />
      <path
        d="M108 118 h24"
        fill="none"
        stroke={INK}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Circular badge stamp — ring text around Mel's face. */
export function Badge({className, title = 'Schmucks certified'}: SVGProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path
          id="sx-badge-ring"
          d="M100 100 m -74 0 a 74 74 0 1 1 148 0 a 74 74 0 1 1 -148 0"
          fill="none"
        />
      </defs>
      <circle cx="100" cy="100" r="94" fill={MUSTARD} stroke={INK} strokeWidth="6" />
      <circle cx="100" cy="100" r="60" fill={CREAM} stroke={INK} strokeWidth="5" />
      <text
        fontFamily="'Inter', sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="3"
        fill={INK}
      >
        <textPath href="#sx-badge-ring" startOffset="0%">
          SCHMUCKS • FINE APPAREL FOR IDIOTS •
        </textPath>
      </text>
      {/* tiny Mel face */}
      <circle cx="100" cy="96" r="26" fill="#F0C89A" stroke={INK} strokeWidth="4" />
      <circle cx="91" cy="93" r="3.5" fill={INK} />
      <circle cx="109" cy="93" r="3.5" fill={INK} />
      <path d="M84 102 Q100 114 116 102 Q108 109 100 108 Q92 109 84 102 Z" fill={INK} />
    </svg>
  );
}
