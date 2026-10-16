'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CustomerAuthProvider } from '@/lib/auth/CustomerAuthContext';
import { CartProvider } from '@/lib/cart/CartContext';
import { WishlistProvider } from '@/lib/wishlist/WishlistContext';
import { ToastProvider } from '@/components/ui/ToastProvider';

/** Storefront chrome (nav + footer) — hidden on /admin/* routes, which have their own shell. */
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Admin routes have their own shell (and mount their own ToastProvider), so
  // they opt out of the storefront cart + toast providers entirely.
  if (isAdmin) return <>{children}</>;

  return (
    <CustomerAuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </CustomerAuthProvider>
  );
}
