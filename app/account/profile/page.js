'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/CustomerAuthContext';
import AccountSidebar from '@/components/account/AccountSidebar';
import ProfileForm from '@/components/account/ProfileForm';

export default function ProfilePage() {
  const { customer, isLoading } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !customer) {
      router.replace('/account/login');
    }
  }, [isLoading, customer, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-primary/50">Loading...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary py-12 px-5 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-primary">My Account</h1>
          <p className="mt-2 text-primary/60">Manage your profile and view your orders</p>
        </div>

        <div className="flex gap-8">
          <AccountSidebar />
          <div className="flex-1">
            <ProfileForm />
          </div>
        </div>
      </div>
    </div>
  );
}
