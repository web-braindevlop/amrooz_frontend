'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import {
  CartIcon,
  HeartIcon,
  SearchIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
} from '@/components/ui/Icons';
import { cn, formatPrice } from '@/utils/format';
import { fetchProducts } from '@/lib/products';
import { useCart } from '@/lib/cart/CartContext';
import { useWishlist } from '@/lib/wishlist/WishlistContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop All', href: '/products' },
  { label: "Women's", href: '/products?category=women' },
  { label: "Men's", href: '/products?category=men' },
  { label: 'Accessories', href: '/products?category=accessories' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count: cartCount } = useCart();
  const { count: wishlistCount = 0 } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Index of the keyboard-highlighted result; -1 means nothing highlighted.
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const optionRefs = useRef([]);

  // Ensure client-side rendering for wishlist count
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Focus the field as soon as the search bar expands.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Real-time, debounced search-as-you-type against the products API.
  useEffect(() => {
    const q = query.trim();
    // Any change to the query invalidates the current highlight.
    setActiveIndex(-1);
    if (q.length < 2) return;

    let alive = true;
    const handle = setTimeout(async () => {
      setSearching(true);
      const { data } = await fetchProducts({ search: q });
      if (alive) {
        setResults(data.slice(0, 6));
        setActiveIndex(-1);
        setSearching(false);
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [query]);

  // Resets the field and closes the panel — used by every dismiss path
  // (close button, Escape, picking a result, viewing all results).
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
    setSearching(false);
    setActiveIndex(-1);
  };

  const goToResults = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    closeSearch();
  };

  // Keep the highlighted option in view when navigating a long list by keyboard.
  useEffect(() => {
    if (activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Full keyboard control for the search combobox. Arrow keys move the
  // highlight through the results (and the "view all" row), Enter opens the
  // highlighted item (or all results when nothing is highlighted), and Escape
  // closes. Every other key keeps its normal text-editing behaviour, so
  // typing, Backspace, Left/Right, Home/End and select-all all still work.
  const handleSearchKeyDown = (e) => {
    // Navigable options = each result plus the trailing "view all" row.
    const optionCount = results.length > 0 ? results.length + 1 : 0;

    switch (e.key) {
      case 'ArrowDown':
        if (!optionCount) return;
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % optionCount);
        break;
      case 'ArrowUp':
        if (!optionCount) return;
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? optionCount - 1 : i - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          router.push(`/products/${results[activeIndex].id}`);
          closeSearch();
        } else {
          // "View all" highlighted, or no highlight → full results page.
          goToResults();
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeSearch();
        break;
      default:
        break;
    }
  };

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname + '' === href.split('?')[0];

  const showResults = searchOpen && query.trim().length >= 2;

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      <div
        className={cn(
          'border-b transition-all duration-500',
          scrolled
            ? 'border-black/5 bg-secondary/90 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(20,17,13,0.35)]'
            : 'border-black/5 bg-secondary'
        )}
      >
        <nav className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-500',
              scrolled ? 'h-16' : 'h-20'
            )}
          >
            {/* Left: mobile toggle + desktop links */}
            <div className="flex flex-1 items-center gap-6">
              <button
                className="lg:hidden -ml-1 p-1 text-primary"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>

              <div className="hidden items-center gap-7 lg:flex">
                {NAV_LINKS.slice(0, 3).map((link) => (
                  <NavLink key={link.href} link={link} active={isActive(link.href)} />
                ))}
              </div>
            </div>

            {/* Center: logo */}
            <Link
              href="/"
              aria-label="Amrooz Collection — Home"
              className="flex shrink-0 items-center"
            >
              <img
                src="/logo.png"
                alt="Amrooz Collection"
                className={cn(
                  'w-auto object-contain transition-all duration-500',
                  scrolled ? 'h-8 sm:h-9' : 'h-10 sm:h-12'
                )}
              />
            </Link>

            {/* Right: secondary links + actions */}
            <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
              <div className="mr-2 hidden items-center gap-7 lg:flex">
                {NAV_LINKS.slice(3).map((link) => (
                  <NavLink key={link.href} link={link} active={isActive(link.href)} />
                ))}
              </div>

              <IconButton label="Search" onClick={() => setSearchOpen((v) => !v)}>
                <SearchIcon className="h-5 w-5" />
              </IconButton>

              <IconButton label="Account" href="/account" className="hidden sm:inline-flex">
                <UserIcon className="h-5 w-5" />
              </IconButton>

              <IconButton label="Wishlist" href="/wishlist" className="hidden sm:inline-flex" badge={mounted && wishlistCount > 0 ? (wishlistCount > 99 ? '99+' : wishlistCount) : null}>
                <HeartIcon className="h-5 w-5" />
              </IconButton>

              <IconButton
                label={`Cart${cartCount ? ` (${cartCount} items)` : ''}`}
                href="/cart"
                badge={cartCount > 0 ? (cartCount > 99 ? '99+' : cartCount) : null}
              >
                <CartIcon className="h-5 w-5" />
              </IconButton>
            </div>
          </div>

          {/* Expanding search field */}
          <div
            className={cn(
              'grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              searchOpen ? 'grid-rows-[1fr] pb-4 opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="min-h-0">
              <div className="flex items-center gap-3 rounded-full border border-black/10 bg-sand-50 px-5 py-3">
                <SearchIcon className="h-5 w-5 text-primary/50" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search for dresses, coats, accessories…"
                  role="combobox"
                  aria-label="Search products"
                  aria-autocomplete="list"
                  aria-expanded={showResults}
                  aria-controls="navbar-search-listbox"
                  aria-activedescendant={
                    activeIndex >= 0 ? `navbar-search-option-${activeIndex}` : undefined
                  }
                  className="w-full bg-transparent text-sm text-primary placeholder:text-primary/40 focus:outline-none"
                />
                <button
                  onClick={closeSearch}
                  className="text-primary/40 hover:text-primary"
                  aria-label="Close search"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Live results — floated as an overlay (absolute, out of flow) so it
              layers over the hero instead of pushing page content down. */}
          {showResults && (
            <div className="absolute left-5 right-5 top-full z-50 lg:left-8 lg:right-8">
              <div
                id="navbar-search-listbox"
                role="listbox"
                aria-label="Search results"
                className="animate-fade-in overflow-hidden rounded-2xl border border-black/10 bg-white shadow-luxe"
              >
                {searching ? (
                  <p className="px-4 py-5 text-center text-sm text-primary/50">Searching…</p>
                ) : results.length === 0 ? (
                  <p className="px-4 py-5 text-center text-sm text-primary/50">
                    No products found for “{query.trim()}”.
                  </p>
                ) : (
                  <>
                    <ul
                      role="presentation"
                      className="max-h-[60vh] divide-y divide-black/5 overflow-y-auto"
                    >
                      {results.map((p, i) => (
                        <li
                          key={p.id}
                          id={`navbar-search-option-${i}`}
                          role="option"
                          aria-selected={activeIndex === i}
                          ref={(el) => (optionRefs.current[i] = el)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={cn(
                            'transition-colors',
                            activeIndex === i ? 'bg-sand-50' : ''
                          )}
                        >
                          <Link
                            href={`/products/${p.id}`}
                            onClick={closeSearch}
                            tabIndex={-1}
                            className="flex items-center gap-3 px-4 py-3"
                          >
                            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                              {p.imageUrl && (
                                <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-primary">
                                {p.name}
                              </span>
                              <span className="block text-xs text-primary/50">
                                {formatPrice(p.price)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      id={`navbar-search-option-${results.length}`}
                      role="option"
                      aria-selected={activeIndex === results.length}
                      ref={(el) => (optionRefs.current[results.length] = el)}
                      onMouseEnter={() => setActiveIndex(results.length)}
                      onClick={goToResults}
                      className={cn(
                        'block w-full border-t border-black/5 px-4 py-3 text-center text-sm font-semibold text-accent-dark transition-colors',
                        activeIndex === results.length ? 'bg-sand-50' : 'hover:bg-sand-50'
                      )}
                    >
                      View all results for “{query.trim()}”
                    </button>
                  </>
                )}
              </div>
              </div>
            )}
        </nav>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={NAV_LINKS}
        isActive={isActive}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        mounted={mounted}
      />
    </header>
  );
}

function NavLink({ link, active }) {
  return (
    <Link
      href={link.href}
      className={cn(
        'link-underline text-sm font-medium tracking-wide transition-colors',
        active ? 'text-accent-dark' : 'text-primary/80 hover:text-primary'
      )}
    >
      {link.label}
    </Link>
  );
}

function IconButton({ children, label, href, badge, onClick, className }) {
  const inner = (
    <span className="relative">
      {children}
      {badge ? (
        <span className="absolute -right-2 -top-2 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold text-primary">
          {badge}
        </span>
      ) : null}
    </span>
  );

  const classes = cn(
    'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5',
    className
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button aria-label={label} onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

function MobileDrawer({ open, onClose, links, isActive, cartCount = 0, wishlistCount = 0, mounted = false }) {
  return (
    <div className={cn('lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-primary/40 backdrop-blur-sm transition-opacity duration-500',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      {/* Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-sm flex-col bg-cream shadow-luxe transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
          <span className="font-serif text-xl font-semibold text-primary">Menu</span>
          <button onClick={onClose} aria-label="Close menu" className="p-1 text-primary">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-primary text-white'
                  : 'text-primary/80 hover:bg-primary/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-black/5 px-3 py-4">
          <Link
            href="/cart"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-primary/80 hover:bg-primary/5"
          >
            <span className="flex items-center gap-3">
              <CartIcon className="h-5 w-5" /> Cart
            </span>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-primary">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-primary/80 hover:bg-primary/5"
          >
            <UserIcon className="h-5 w-5" /> My Account
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-primary/80 hover:bg-primary/5"
          >
            <HeartIcon className="h-5 w-5" /> Wishlist
            {mounted && wishlistCount > 0 && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
        </div>
      </aside>
    </div>
  );
}
