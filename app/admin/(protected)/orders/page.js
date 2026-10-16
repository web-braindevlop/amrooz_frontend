'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { AlertIcon, EyeIcon } from '@/components/ui/Icons';
import { formatPrice } from '@/utils/format';
import { fetchAdminOrders } from '@/lib/admin/orders';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

const PAYMENT_OPTIONS = [
  { value: '', label: 'All payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return String(d); }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 25;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Debounce search input → search query
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminOrders({ page, limit, search, status, paymentStatus });
      // Backend returns { data, total, page, limit } — fallback if array
      if (Array.isArray(res)) {
        setOrders(res);
        setTotal(res.length);
      } else {
        setOrders(res.data ?? []);
        setTotal(res.total ?? 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, paymentStatus]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-primary">Orders</h1>
          <p className="mt-1 text-sm text-primary/50">
            {loading ? 'Loading…' : `${total} order${total === 1 ? '' : 's'}${search || status || paymentStatus ? ' (filtered)' : ''}`}
          </p>
        </div>
        <div className="text-sm text-primary/40">{!loading && totalPages > 1 && `Page ${page} of ${totalPages}`}</div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-3xl border border-black/5 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by order # or email…"
          className="w-full flex-1 rounded-2xl border border-black/10 bg-sand-50 px-4 py-2.5 text-sm text-primary placeholder:text-primary/35 outline-none focus:border-accent focus:bg-white sm:max-w-xs"
        />
        <div className="flex gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
          >
            {PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertIcon className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <p className="text-primary/50">No orders found.</p>
          {(search || status || paymentStatus) && <p className="mt-2 text-sm text-primary/35">Try clearing filters.</p>}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs font-semibold uppercase tracking-wide text-primary/45">
                    <th className="px-6 py-4">Order</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Items</th>
                    <th className="px-4 py-4">Total</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Payment</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-black/5 last:border-0 hover:bg-sand-50/60">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-primary">#{o.orderNumber}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-primary/60">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-4 max-w-[180px] truncate text-primary/70">{o.email}</td>
                      <td className="px-4 py-4 text-primary/70">{o.items?.length ?? '—'}</td>
                      <td className="px-4 py-4 font-medium text-primary">{formatPrice(o.total)}</td>
                      <td className="px-4 py-4"><Badge tone={o.status}>{o.status}</Badge></td>
                      <td className="px-4 py-4"><Badge tone={o.paymentStatus}>{o.paymentStatus}</Badge></td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary"
                        >
                          <EyeIcon className="h-3.5 w-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-primary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-primary/50">Page {page} of {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-primary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
