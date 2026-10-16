'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/admin/AuthContext';
import { LogoutIcon, UserIcon, MenuIcon } from '@/components/ui/Icons';

function titleForPath(pathname) {
  if (!pathname) return 'Dashboard';
  if (pathname === '/admin/products/new') return 'Add Product';
  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) return 'Edit Product';
  if (pathname.startsWith('/admin/products')) return 'Products';
  if (pathname.startsWith('/admin/categories')) return 'Categories';
  if (pathname.startsWith('/admin/tags')) return 'Tags';
  if (/^\/admin\/attributes\/[^/]+$/.test(pathname)) return 'Attribute Terms';
  if (pathname.startsWith('/admin/attributes')) return 'Attributes';
  if (pathname.startsWith('/admin/brands')) return 'Brands';
  return 'Dashboard';
}

export default function AdminTopbar({ onMenuClick }) {
  const { admin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const title = titleForPath(pathname);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.replace('/admin/login');
  }

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-black/5 bg-white px-6 py-5 lg:px-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden -ml-1 p-2 text-primary hover:bg-sand-50 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <div>
          <p className="eyebrow text-accent-dark">Amrooz Collection</p>
          <h1 className="mt-1 font-serif text-2xl text-primary">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2.5 rounded-full bg-sand-50 py-2 pl-2 pr-4 sm:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <UserIcon className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-primary">{admin?.name}</p>
            <p className="text-xs text-primary/50">{admin?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-full border border-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:opacity-60"
        >
          <LogoutIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
          <span className="sm:hidden">{loggingOut ? '...' : 'Out'}</span>
        </button>
      </div>
    </header>
  );
}
