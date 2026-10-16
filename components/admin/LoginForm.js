'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/admin/AuthContext';
import Button from '@/components/ui/Button';
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/format';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-primary/60">
          Email
        </label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-primary/35" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@amroozcollection.com"
            className="w-full rounded-2xl border border-black/10 bg-sand-50 py-3.5 pl-11 pr-4 text-sm text-primary placeholder:text-primary/35 outline-none transition-colors focus:border-accent focus:bg-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-primary/60">
          Password
        </label>
        <div className="relative">
          <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-primary/35" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full rounded-2xl border border-black/10 bg-sand-50 py-3.5 pl-11 pr-11 text-sm text-primary placeholder:text-primary/35 outline-none transition-colors focus:border-accent focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className={cn(
              'absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-primary/40 transition-colors hover:text-primary'
            )}
          >
            {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      <Button type="submit" fullWidth size="lg" loading={submitting} disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
