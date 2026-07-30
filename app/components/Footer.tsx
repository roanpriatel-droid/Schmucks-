import {useState} from 'react';
import {NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {WordmarkFlat, Badge} from '~/components/brand/Brand';
import {SHELVES} from '~/data/shelves';
import {
  FREE_SHIPPING_LIVE,
  FREE_SHIPPING_THRESHOLD,
  US_SHIPPING_FROM,
  RETURNS_DAYS,
  SALES_DATA_AVAILABLE,
} from '~/data/commerce';
import {track} from '~/lib/analytics';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
  /** Policy handles the shop has actually published — see the root loader. */
  policies?: Array<{title: string; handle: string}>;
}

/** All ten shelves, in shelf order. */
const SHOP_LINKS = [
  {title: 'All Tees', to: '/tees'},
  ...SHELVES.map((shelf) => ({
    title: shelf.title,
    to: `/collections/${shelf.handle}`,
  })),
  ...(SALES_DATA_AVAILABLE
    ? [{title: 'Best Sellers', to: '/collections/best-sellers'}]
    : []),
  {title: 'New Arrivals', to: '/collections/new-arrivals'},
  {title: 'The Pair Programme', to: '/matching-sets'},
];

const HELP_LINKS = [
  {title: 'FAQ', to: '/pages/faq'},
  {title: 'Shipping & Returns', to: '/pages/shipping-returns'},
  {title: 'Size Guide', to: '/pages/size-guide'},
  {title: 'Care Guide', to: '/pages/care'},
  {title: 'Contact', to: '/pages/contact'},
];

const BRAND_LINKS = [
  {title: 'The Schmucks Story', to: '/pages/about'},
  {title: 'Lookbook', to: '/lookbook'},
  {title: 'Materials', to: '/pages/materials'},
  {title: 'Journal', to: '/journal'},
  {title: 'News', to: '/blogs'},
];

const SOCIALS = [
  {label: 'Instagram', glyph: 'IG', href: 'https://instagram.com'},
  {label: 'TikTok', glyph: 'TT', href: 'https://tiktok.com'},
  {label: 'X', glyph: 'X', href: 'https://x.com'},
];

export function Footer({policies = []}: FooterProps) {
  return (
    <footer className="footer">
      <div className="sx-wrap sx-footer-news">
        <div>
          <h2 className="sx-footer-news__title">Join the Schmucks</h2>
          <p className="sx-footer-news__sub">
            New drops and early access, before the smart people find out.
          </p>
        </div>
        <NewsletterForm />
      </div>

      <div className="sx-wrap sx-footer">
        <FooterCol heading="Shop" links={SHOP_LINKS} />
        <FooterCol heading="Help" links={HELP_LINKS} />
        <FooterCol heading="The Brand" links={BRAND_LINKS} />

        <div className="sx-footer__brand">
          <WordmarkFlat className="sx-wordmark--footer" title="Schmucks" />
          <p className="sx-footer__tag">
            Fine Apparel for Idiots. Heavyweight cotton, printed to order,
            shipped with love and mild concern.
          </p>
          <ul className="sx-footer__perks">
            <li>
              {FREE_SHIPPING_LIVE
                ? `Free shipping over $${FREE_SHIPPING_THRESHOLD}`
                : `US shipping from $${US_SHIPPING_FROM.toFixed(2)}`}
            </li>
            <li>{RETURNS_DAYS}-day returns</li>
            <li>Printed to order</li>
          </ul>
          <div className="sx-footer__socials">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                className="sx-footer__social"
                href={social.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span aria-hidden="true">{social.glyph}</span>
                <span className="sx-visually-hidden">{social.label}</span>
              </a>
            ))}
          </div>
          <PaymentRow />
        </div>
      </div>

      <div className="sx-wrap sx-footer__legal">
        <span className="sx-footer__copy">
          <Badge className="sx-footer__badge" title="Schmucks certified" />©{' '}
          {new Date().getFullYear()} Schmucks. Fine Apparel for Idiots.
        </span>
        <span className="sx-footer__legallinks">
          {/* Only policies the shop has actually published get linked, so the
              footer can never point at a page that doesn't exist. */}
          {policies.map((policy) => (
            <NavLink
              key={policy.handle}
              to={`/policies/${policy.handle}`}
              prefetch="intent"
            >
              {policy.title}
            </NavLink>
          ))}
          {policies.length ? (
            <NavLink to="/policies" prefetch="intent">
              All Policies
            </NavLink>
          ) : null}
        </span>
      </div>
    </footer>
  );
}

/**
 * The store reports no accepted card brands or digital wallets on this plan,
 * so a row of Visa/Mastercard marks would be a claim we can't support. State
 * what's actually true instead.
 */
function PaymentRow() {
  return (
    <div className="sx-footer__pay">
      <span className="sx-footer__paylabel">Secure checkout</span>
      <span className="sx-footer__paynote">
        Payments processed by Shopify. Your card details never touch us.
      </span>
    </div>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: Array<{title: string; to: string}>;
}) {
  return (
    <div className="sx-footer__col">
      <h3>{heading}</h3>
      {links.map((link) => (
        <NavLink key={link.title} to={link.to} prefetch="intent">
          {link.title}
        </NavLink>
      ))}
    </div>
  );
}

function NewsletterForm() {
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <div className="sx-footer-news__done" role="status">
        You&rsquo;re in. Nothing arrives until the next drop — that&rsquo;s the
        whole arrangement.
      </div>
    );
  }
  return (
    <form
      className="sx-footer-news__form"
      onSubmit={(event) => {
        event.preventDefault();
        track('newsletter_signup', {location: 'footer'});
        setDone(true);
      }}
      aria-label="Newsletter signup"
    >
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        required
        placeholder="you@regrets.com"
        className="sx-footer-news__input"
      />
      <button className="sx-btn sx-btn--ketchup" type="submit">
        Sign Up
      </button>
    </form>
  );
}
