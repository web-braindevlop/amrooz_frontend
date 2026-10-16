'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/admin/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function ProtectedAdminLayout({ children }) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/admin/login');
    }
  }, [loading, admin, router]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  if (loading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar mobileMenuOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <AdminTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
