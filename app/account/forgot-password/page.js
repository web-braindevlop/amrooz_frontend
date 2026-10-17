'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/auth/customerApi';
import { useToast } from '@/components/ui/ToastProvider';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

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
          <p className="eyebrow mt-5 text-accent-dark">Password Reset</p>
          <h1 className="mt-2 font-serif text-2xl text-primary">Forgot your password?</h1>
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-luxe">
          {success ? (
            <div className="text-center">
              <div className="mb-6 rounded-xl bg-sand-50 p-6">
                <div className="mb-3 text-4xl">✓</div>
                <h2 className="mb-2 font-serif text-xl text-primary">Check your email</h2>
                <p className="text-sm text-primary/70">
                  If an account exists for this email, a reset link has been sent.
                </p>
              </div>
              <Link
                href="/account/login"
                className="inline-block rounded-xl bg-accent-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-primary/70">
                Enter your email address and we'll send you a link to reset your password.
              </p>
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-accent-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/account/login" className="text-sm text-accent-dark hover:underline">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
