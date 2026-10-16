'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { useAuth } from '@/lib/admin/AuthContext';

export default function AdminLoginPage() {
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && admin) {
      router.replace('/admin/dashboard');
    }
  }, [loading, admin, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center leading-none">
            <span className="font-serif text-3xl font-semibold text-primary">Amrooz</span>
            <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.45em] text-accent-dark">
              Collection
            </span>
          </Link>
          <p className="eyebrow mt-5 text-accent-dark">Admin Access</p>
          <h1 className="mt-2 font-serif text-2xl text-primary">Sign in to your dashboard</h1>
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-luxe">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-primary/40">
          Restricted access. Contact the store owner if you need an account.
        </p>
      </div>
    </div>
  );
}
