import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {WordmarkFlat} from '~/components/brand/Brand';
import {ShelfMegaMenu, ShelfMobileTree} from '~/components/ShelfMenu';
import {SALES_DATA_AVAILABLE} from '~/data/commerce';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

// Deli menu-board nav. "Tees" is the mega-dropdown (see ShelfMenu); the rest
// are flat links. The Pair Programme is the matching-set landing page.
const SX_NAV = [
  {title: 'The Pair Programme', to: '/matching-sets'},
  // Best Sellers is only a real shelf once something has sold; until then the
  // slot carries New Arrivals rather than an invented ranking.
  SALES_DATA_AVAILABLE
    ? {title: 'Best Sellers', to: '/collections/best-sellers'}
    : {title: 'New Arrivals', to: '/collections/new-arrivals'},
  {title: 'Lookbook', to: '/lookbook'},
  {title: 'Contact', to: '/pages/contact'},
];

export function Header({header, isLoggedIn, cart}: HeaderProps) {
  const {shop} = header;
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" className="sx-brand-link" end>
        <WordmarkFlat
          className="sx-wordmark--header"
          title={shop.name || 'Schmucks'}
        />
      </NavLink>
      <HeaderMenu viewport="desktop" />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({viewport}: {viewport: Viewport}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  if (viewport === 'mobile') {
    return (
      <nav className={className} role="navigation">
        <ShelfMobileTree onNavigate={close} />
      </nav>
    );
  }

  return (
    <nav className={className} role="navigation">
      <ShelfMegaMenu />
      {SX_NAV.map((item) => (
        <NavLink
          className="header-menu-item"
          end
          key={item.title}
          onClick={close}
          prefetch="intent"
          to={item.to}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" className="sx-account-link">
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      {/* A glyph, not a section heading — as an <h3> it landed in the document
          outline and was announced as a heading reading "☰". */}
      <span aria-hidden="true">☰</span>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="sx-cart-btn"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart
      <span className="sx-cart-count" aria-label={`(items: ${count})`}>
        {count}
      </span>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
