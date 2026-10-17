'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/CustomerAuthContext';
import { useToast } from '@/components/ui/ToastProvider';

export default function CustomerLoginPage() {
  const { customer, isLoading, login } = useCustomerAuth();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && customer) {
      router.replace('/account/profile');
    }
  }, [isLoading, customer, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/account/profile');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-primary/50">Loading...</p>
      </div>
    );
  }

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
          <p className="eyebrow mt-5 text-accent-dark">My Account</p>
          <h1 className="mt-2 font-serif text-2xl text-primary">Sign in to continue</h1>
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-luxe">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
                placeholder="••••••••"
              />
              <div className="mt-2 text-right">
                <Link href="/account/forgot-password" className="text-sm text-accent-dark hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-accent-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-primary/60">
              Don't have an account?{' '}
              <Link href="/account/register" className="font-medium text-accent-dark hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary/50 hover:text-primary">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
