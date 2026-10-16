'use client';

import { CustomerAuthProvider } from '@/lib/auth/CustomerAuthContext';

export default function AccountLayout({ children }) {
  return (
    <CustomerAuthProvider>
      {children}
    </CustomerAuthProvider>
  );
}
