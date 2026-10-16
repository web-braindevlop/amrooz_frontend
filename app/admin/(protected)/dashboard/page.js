'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import { apiFetch } from '@/lib/admin/api';
import { formatPrice } from '@/utils/format';
import { AlertIcon, BoxIcon, CashIcon, ReceiptIcon, TagIcon } from '@/components/ui/Icons';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiFetch('/admin/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard stats');
        const data = await res.json();
        if (active) setStats(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-40 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        <AlertIcon className="h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={stats.products.total} icon={BoxIcon} />
        <StatCard label="Active Products" value={stats.products.active} icon={BoxIcon} tone="gold" />
        <StatCard label="Categories" value={stats.categories.total} icon={TagIcon} />
        <StatCard label="Total Orders" value={stats.orders.total} icon={ReceiptIcon} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Pending Orders" value={stats.orders.pending} icon={ReceiptIcon} tone="warn" />
        <StatCard
          label="Low Stock Products"
          value={stats.products.lowStock}
          icon={AlertIcon}
          tone="warn"
          hint="5 units or fewer"
        />
        <StatCard label="Revenue (Paid Orders)" value={formatPrice(stats.revenue)} icon={CashIcon} tone="gold" />
      </div>
    </div>
  );
}
