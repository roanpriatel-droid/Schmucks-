import {NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {WordmarkFlat, Badge} from '~/components/brand/Brand';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

const SHOP_LINKS = [
  {title: 'Shop All', to: '/collections/all'},
  {title: 'Best Sellers', to: '/collections/featured'},
  {title: 'New Drops', to: '/collections'},
  {title: 'Matching Sets (Soon)', to: '/collections'},
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
      <div className="sx-wrap sx-footer">
        <div className="sx-footer__brand">
          <WordmarkFlat className="sx-wordmark--footer" title="Schmucks" />
          <p className="sx-footer__tag">
            Fine Apparel for Idiots. A proud community of idiots since whenever
            this started. Printed to order, shipped with love and mild concern.
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

        <div className="sx-footer__col">
          <h4>Shop</h4>
          {SHOP_LINKS.map((l) => (
            <NavLink key={l.title} to={l.to} prefetch="intent">
              {l.title}
            </NavLink>
          ))}
        </div>

        <div className="sx-footer__col">
          <h4>Help</h4>
          {HELP_LINKS.map((l) => (
            <NavLink key={l.title} to={l.to} prefetch="intent">
              {l.title}
            </NavLink>
          ))}
        </div>

        <div className="sx-footer__stamp">
          <Badge title="Schmucks certified" />
        </div>
      </div>

      <div className="sx-wrap sx-footer__legal">
        <span>© {new Date().getFullYear()} Schmucks. All rights reserved (barely).</span>
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
