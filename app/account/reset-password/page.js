'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/auth/customerApi';
import { useToast } from '@/components/ui/ToastProvider';

function PasswordStrengthIndicator({ password }) {
  const getStrength = () => {
    if (password.length < 8) return { level: 'weak', label: 'Weak', color: 'bg-red-500' };
    
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score >= 3) return { level: 'strong', label: 'Strong', color: 'bg-green-500' };
    if (score >= 2) return { level: 'fair', label: 'Fair', color: 'bg-yellow-500' };
    return { level: 'weak', label: 'Weak', color: 'bg-red-500' };
  };

  const strength = getStrength();
  const widthMap = { weak: 'w-1/3', fair: 'w-2/3', strong: 'w-full' };

  return (
    <div className="mt-2">
      <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-sand-100">
        <div className={`h-full transition-all duration-300 ${strength.color} ${widthMap[strength.level]}`} />
      </div>
      <p className="text-xs text-primary/60">
        Password strength: <span className={strength.level === 'strong' ? 'text-green-600' : strength.level === 'fair' ? 'text-yellow-600' : 'text-red-600'}>{strength.label}</span>
      </p>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast('Invalid reset link', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      sessionStorage.setItem('passwordResetSuccess', 'true');
      showToast('Password reset successfully!', 'success');
      router.push('/account/login');
    } catch (err) {
      if (err.message.includes('Invalid') || err.message.includes('expired')) {
        showToast('Reset link is invalid or expired. Please request a new one.', 'error');
      } else {
        showToast(err.message || 'Failed to reset password', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-6 rounded-xl bg-red-50 p-6">
          <div className="mb-3 text-4xl">⚠️</div>
          <h2 className="mb-2 font-serif text-xl text-primary">Invalid reset link</h2>
          <p className="text-sm text-primary/70">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link
          href="/account/forgot-password"
          className="inline-block rounded-xl bg-accent-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-primary/70">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-primary mb-2">
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
            placeholder="••••••••"
          />
          {newPassword && <PasswordStrengthIndicator password={newPassword} />}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:opacity-50"
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/account/login" className="text-sm text-accent-dark hover:underline">
          ← Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="mt-2 font-serif text-2xl text-primary">Create new password</h1>
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-luxe">
          <Suspense fallback={
            <div className="text-center text-primary/50">Loading...</div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
