'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/auth/CustomerAuthContext';
import { fetchCustomerOrders } from '@/lib/auth/customerApi';
import AccountSidebar from '@/components/account/AccountSidebar';
import OrderHistory from '@/components/account/OrderHistory';
import { useToast } from '@/components/ui/ToastProvider';

export default function OrdersPage() {
  const { customer, isLoading } = useCustomerAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.replace('/account/login');
    }
  }, [isLoading, customer, router]);

  useEffect(() => {
    if (customer) {
      (async () => {
        try {
          const data = await fetchCustomerOrders();
          setOrders(data);
        } catch (err) {
          showToast(err.message || 'Failed to load orders', 'error');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [customer, showToast]);

  if (isLoading || loading) {
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
          <h1 className="font-serif text-3xl text-primary">Order History</h1>
          <p className="mt-2 text-primary/60">View your past orders and track shipments</p>
        </div>

        <div className="flex gap-8">
          <AccountSidebar />
          <div className="flex-1">
            <OrderHistory orders={orders} />
          </div>
        </div>
      </div>
    </div>
  );
}
