import {useState} from 'react';
import {NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {WordmarkFlat, Badge} from '~/components/brand/Brand';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

const SHOP_LINKS = [
  {title: 'Tees', to: '/tees'},
  {title: 'Matching Sets', to: '/matching-sets'},
  {title: 'Shop All', to: '/collections/all'},
  {title: 'Lookbook', to: '/lookbook'},
];

const LEARN_LINKS = [
  {title: 'About', to: '/pages/about'},
  {title: 'Materials', to: '/pages/materials'},
  {title: 'Size & Fit', to: '/pages/size-guide'},
  {title: 'Care Guide', to: '/pages/care'},
  {title: 'Journal', to: '/journal'},
];

const HELP_LINKS = [
  {title: 'Contact', to: '/pages/contact'},
  {title: 'FAQ', to: '/pages/faq'},
  {title: 'Shipping', to: '/policies/shipping-policy'},
  {title: 'Returns', to: '/policies/refund-policy'},
];

const POLICY_LINKS = [
  {title: 'Privacy', to: '/policies/privacy-policy'},
  {title: 'Terms', to: '/policies/terms-of-service'},
  {title: 'Refunds', to: '/policies/refund-policy'},
];

const SOCIALS = [
  {label: 'Instagram', glyph: 'IG', href: 'https://instagram.com'},
  {label: 'TikTok', glyph: 'TT', href: 'https://tiktok.com'},
  {label: 'X', glyph: 'X', href: 'https://x.com'},
];

export function Footer(_props: FooterProps) {
  return (
    <footer className="footer">
      <div className="sx-wrap sx-footer-news">
        <div>
          <h2 className="sx-footer-news__title">Join the Schmucks</h2>
          <p className="sx-footer-news__sub">
            New drops, early access, and 10% off your first mistake.
          </p>
        </div>
        <NewsletterForm />
      </div>

      <div className="sx-wrap sx-footer">
        <div className="sx-footer__brand">
          <WordmarkFlat className="sx-wordmark--footer" title="Schmucks" />
          <p className="sx-footer__tag">
            Fine Apparel for Idiots. Heavyweight cotton, printed to order,
            shipped with love and mild concern.
          </p>
          <div className="sx-footer__socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                className="sx-footer__social"
                href={s.href}
                aria-label={s.label}
                rel="noopener noreferrer"
                target="_blank"
              >
                {s.glyph}
              </a>
            ))}
          </div>
        </div>

        <FooterCol heading="Shop" links={SHOP_LINKS} />
        <FooterCol heading="Learn" links={LEARN_LINKS} />
        <FooterCol heading="Help" links={HELP_LINKS} />

        <div className="sx-footer__stamp">
          <Badge title="Schmucks certified" />
        </div>
      </div>

      <div className="sx-wrap sx-footer__legal">
        <span>
          © {new Date().getFullYear()} Schmucks. All rights reserved (barely).
        </span>
        <span style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          {POLICY_LINKS.map((l) => (
            <NavLink key={l.title} to={l.to} prefetch="intent">
              {l.title}
            </NavLink>
          ))}
        </span>
      </div>
    </footer>
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
      <h4>{heading}</h4>
      {links.map((l) => (
        <NavLink key={l.title} to={l.to} prefetch="intent">
          {l.title}
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
        You&rsquo;re in. Check your inbox for your code — and our condolences.
      </div>
    );
  }
  return (
    <form
      className="sx-footer-news__form"
      onSubmit={(e) => {
        e.preventDefault();
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
