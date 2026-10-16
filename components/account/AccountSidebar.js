'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/CustomerAuthContext';
import { cn } from '@/utils/format';

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useCustomerAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const links = [
    { label: 'Profile', href: '/account/profile' },
    { label: 'Orders', href: '/account/orders' },
  ];

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="rounded-[2rem] border border-black/5 bg-white p-4 shadow-luxe">
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-accent-dark text-white'
                  : 'text-primary/70 hover:bg-sand-50'
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-primary/70 hover:bg-sand-50 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
