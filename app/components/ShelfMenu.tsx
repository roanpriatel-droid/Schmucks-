import {useEffect, useRef, useState} from 'react';
import {NavLink} from 'react-router';
import {SHELVES, COUNTER} from '~/data/shelves';
import {SALES_DATA_AVAILABLE} from '~/data/commerce';

/** Counter shelves worth linking: Best Sellers only once it means something. */
const counterItems = COUNTER.filter(
  (item) =>
    item.handle !== 'tees' &&
    (item.handle !== 'best-sellers' || SALES_DATA_AVAILABLE),
);

/**
 * The Tees mega-dropdown — the deli menu board, hung under the nav.
 *
 * Opens on hover for pointers and on click/Enter for keyboard and touch, which
 * keeps it operable without a pointer. Escape closes and returns focus to the
 * trigger; focus leaving the panel closes it.
 */
export function ShelfMegaMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Closing on a bare mouseleave made the menu feel like it vanished the
  // instant you moved toward it. A short grace period lets the pointer travel.
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openNow = () => {
    cancelClose();
    setOpen(true);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 260);
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <div
      className="sx-mega"
      ref={wrapRef}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        className={`header-menu-item sx-mega__trigger ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
      >
        Tees
        <span className="sx-mega__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      <div className="sx-mega__panel" hidden={!open}>
        <div className="sx-mega__inner">
          <div className="sx-mega__col sx-mega__col--shelves">
            <p className="sx-mega__label">The Shelves</p>
            <ul className="sx-mega__list">
              {SHELVES.map((shelf) => (
                <li key={shelf.handle}>
                  <NavLink
                    to={`/collections/${shelf.handle}`}
                    prefetch="intent"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sx-mega__title">{shelf.title}</span>
                    <span className="sx-mega__desc">{shelf.descriptor}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="sx-mega__col">
            <p className="sx-mega__label">At the Counter</p>
            <ul className="sx-mega__list sx-mega__list--counter">
              {counterItems.map((item) => (
                <li key={item.handle}>
                  <NavLink
                    to={
                      item.handle === 'the-pair-programme'
                        ? '/matching-sets'
                        : `/collections/${item.handle}`
                    }
                    prefetch="intent"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sx-mega__title">{item.title}</span>
                    <span className="sx-mega__desc">{item.descriptor}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
            <NavLink
              className="sx-mega__all"
              to="/tees"
              prefetch="intent"
              onClick={() => setOpen(false)}
            >
              Every shirt we make →
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The same tree, stacked, for the mobile aside. */
export function ShelfMobileTree({onNavigate}: {onNavigate: () => void}) {
  return (
    <div className="sx-navtree">
      <NavLink end onClick={onNavigate} prefetch="intent" to="/">
        Home
      </NavLink>

      <p className="sx-navtree__label">The Shelves</p>
      {SHELVES.map((shelf) => (
        <NavLink
          key={shelf.handle}
          className="sx-navtree__item"
          to={`/collections/${shelf.handle}`}
          prefetch="intent"
          onClick={onNavigate}
        >
          <span className="sx-navtree__title">{shelf.title}</span>
          <span className="sx-navtree__desc">{shelf.descriptor}</span>
        </NavLink>
      ))}

      <p className="sx-navtree__label">At the Counter</p>
      <NavLink
        className="sx-navtree__item"
        to="/tees"
        prefetch="intent"
        onClick={onNavigate}
      >
        <span className="sx-navtree__title">All Tees</span>
        <span className="sx-navtree__desc">Everything we print, in one place.</span>
      </NavLink>
      {counterItems.map((item) => (
        <NavLink
          key={item.handle}
          className="sx-navtree__item"
          to={
            item.handle === 'the-pair-programme'
              ? '/matching-sets'
              : `/collections/${item.handle}`
          }
          prefetch="intent"
          onClick={onNavigate}
        >
          <span className="sx-navtree__title">{item.title}</span>
          <span className="sx-navtree__desc">{item.descriptor}</span>
        </NavLink>
      ))}

      <p className="sx-navtree__label">Elsewhere</p>
      <NavLink
        className="sx-navtree__item"
        to="/lookbook"
        prefetch="intent"
        onClick={onNavigate}
      >
        <span className="sx-navtree__title">Lookbook</span>
      </NavLink>
      <NavLink
        className="sx-navtree__item"
        to="/pages/contact"
        prefetch="intent"
        onClick={onNavigate}
      >
        <span className="sx-navtree__title">Contact</span>
      </NavLink>
      <NavLink
        className="sx-navtree__item"
        to="/pages/faq"
        prefetch="intent"
        onClick={onNavigate}
      >
        <span className="sx-navtree__title">FAQ &amp; Shipping</span>
      </NavLink>
      <NavLink
        className="sx-navtree__item"
        to="/account"
        prefetch="intent"
        onClick={onNavigate}
      >
        <span className="sx-navtree__title">Account</span>
        <span className="sx-navtree__desc">Orders, addresses, sign in.</span>
      </NavLink>
    </div>
  );
}
