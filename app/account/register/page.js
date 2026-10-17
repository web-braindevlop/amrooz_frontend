'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/CustomerAuthContext';
import { useToast } from '@/components/ui/ToastProvider';

export default function CustomerRegisterPage() {
  const { customer, isLoading, register } = useCustomerAuth();
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && customer) {
      router.replace('/account/profile');
    }
  }, [isLoading, customer, router]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Only send non-empty optional fields
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
      };
      if (formData.lastName) payload.lastName = formData.lastName;
      if (formData.phone) payload.phone = formData.phone;

      await register(payload);
      toast.success('Account created successfully!');
      router.push('/account/profile');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
          <h1 className="mt-2 font-serif text-2xl text-primary">Create your account</h1>
        </div>

        <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-luxe">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                minLength={2}
                className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
                placeholder="John"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
                placeholder="Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full rounded-xl border border-black/10 bg-sand-50 px-4 py-3 text-sm text-primary placeholder:text-primary/40 focus:border-accent-dark focus:outline-none focus:ring-2 focus:ring-accent-dark/20"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-primary/50">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-accent-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary disabled:opacity-50"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-primary/60">
              Already have an account?{' '}
              <Link href="/account/login" className="font-medium text-accent-dark hover:underline">
                Sign in
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
