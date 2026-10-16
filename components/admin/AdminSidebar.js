'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BoxIcon, GridIcon, ReceiptIcon, CloseIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/format';

// WooCommerce-style grouping: a top-level Products section with the same
// sub-screens WordPress exposes (All Products, Add New, Categories, Tags, Brands).
const PRODUCT_LINKS = [
  { label: 'All Products', href: '/admin/products' },
  { label: 'Add New', href: '/admin/products/new' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Tags', href: '/admin/tags' },
  { label: 'Attributes', href: '/admin/attributes' },
  { label: 'Brands', href: '/admin/brands' },
];

function isActive(pathname, href) {
  if (href === '/admin/products') {
    return pathname === '/admin/products' || /^\/admin\/products\/[^/]+\/edit$/.test(pathname);
  }
  if (href === '/admin/products/new') return pathname === '/admin/products/new';
  return pathname === href || pathname?.startsWith(href + '/');
}

export default function AdminSidebar({ mobileMenuOpen = false, onClose = () => {} }) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <Link href="/admin/dashboard" className="flex shrink-0 items-center gap-2.5 px-7 py-7" onClick={onClose}>
        <span className="font-serif text-xl font-semibold text-white">Amrooz</span>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-accent">
          Admin
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {/* Dashboard */}
        <Link
          href="/admin/dashboard"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
            isActive(pathname, '/admin/dashboard')
              ? 'bg-accent text-primary'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          )}
        >
          <GridIcon className="h-4.5 w-4.5" />
          Dashboard
        </Link>

        {/* Products group */}
        <div className="pt-3">
          <div className="flex items-center gap-3 px-4 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40">
            <BoxIcon className="h-4 w-4" />
            Products
          </div>
          <div className="space-y-0.5">
            {PRODUCT_LINKS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center rounded-2xl py-2.5 pl-11 pr-4 text-sm transition-colors',
                    active
                      ? 'bg-accent font-medium text-primary'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Orders */}
        <Link
          href="/admin/orders"
          onClick={onClose}
          className={cn(
            'mt-3 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
            isActive(pathname, '/admin/orders')
              ? 'bg-accent text-primary'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          )}
        >
          <ReceiptIcon className="h-4.5 w-4.5" />
          Orders
        </Link>
      </nav>

      <Link
        href="/"
        onClick={onClose}
        className="mx-4 mb-7 shrink-0 rounded-2xl border border-white/10 px-4 py-3 text-center text-xs font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white"
      >
        ← View Storefront
      </Link>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-primary text-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Menu */}
      <div className={cn('lg:hidden', mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        {/* Backdrop */}
        <div
          onClick={onClose}
          className={cn(
            'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        
        {/* Sidebar Panel */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-primary text-white shadow-2xl transition-transform duration-300 ease-out',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-7 p-2 text-white/70 hover:text-white"
            aria-label="Close menu"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
          
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
