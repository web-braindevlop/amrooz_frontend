'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { AlertIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { formatPrice } from '@/utils/format';
import { fetchAdminOrder, updateAdminOrder } from '@/lib/admin/orders';

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(d);
  }
}

function AddressBlock({ addr }) {
  if (!addr) return <p className="text-sm text-primary/40">No address</p>;
  return (
    <div className="text-sm leading-relaxed text-primary/70">
      <p className="font-medium text-primary">{addr.fullName}</p>
      <p>{addr.street}{addr.street2 ? `, ${addr.street2}` : ''}</p>
      <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
      <p>{addr.country}</p>
      <p className="mt-1 text-primary/50">{addr.phone}</p>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminOrder(id);
        if (!active) return;
        setOrder(data);
        setStatus(data.status);
        setPaymentStatus(data.paymentStatus);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  async function handleSave() {
    setSaveError('');
    setSaveSuccess('');
    // Only send changed fields — backend validates transitions
    const payload = {};
    if (status !== order.status) payload.status = status;
    if (paymentStatus !== order.paymentStatus) payload.paymentStatus = paymentStatus;
    if (Object.keys(payload).length === 0) {
      setSaveError('No changes to save.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateAdminOrder(id, payload);
      setOrder(updated);
      setStatus(updated.status);
      setPaymentStatus(updated.paymentStatus);
      setSaveSuccess('Order updated successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 rounded-3xl" />
        <div className="skeleton h-48 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary">
          ← Back to Orders
        </Link>
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertIcon className="h-5 w-5 shrink-0" /> {error}
        </div>
      </div>
    );
  }

  if (!order) return null;

  const hasChanges = status !== order.status || paymentStatus !== order.paymentStatus;

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-primary/60 hover:text-primary">
        ← Back to Orders
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl text-primary">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-primary/50">Placed {formatDate(order.createdAt)} · {order.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={order.status}>{order.status}</Badge>
          <Badge tone={order.paymentStatus}>{order.paymentStatus}</Badge>
          <span className="inline-flex items-center rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-primary/60">
            {order.currency || 'PKR'}
          </span>
        </div>
      </div>

      {/* Status controls — secure, validated server-side */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary/60">Update Status</h2>
        <p className="mt-1 text-xs text-primary/40">Changes are validated against allowed transitions (e.g. pending → processing → shipped). Invalid transitions are rejected by the server.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-primary/60">Order Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-primary outline-none focus:border-accent"
            >
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-primary/60">Payment Status</span>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-primary outline-none focus:border-accent"
            >
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <Button onClick={handleSave} loading={saving} disabled={!hasChanges || saving} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </div>
        {saveError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{saveError}</p>}
        {saveSuccess && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{saveSuccess}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-card">
            <div className="border-b border-black/5 px-6 py-4">
              <h2 className="font-semibold text-primary">Items ({order.items?.length ?? 0})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs font-semibold uppercase tracking-wide text-primary/45">
                    <th className="px-6 py-3">Product</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="border-b border-black/5 last:border-0">
                      <td className="px-6 py-4">
                        <p className="font-medium text-primary">{item.productName}</p>
                        {item.variantLabel && <p className="text-xs text-primary/50">{item.variantLabel}</p>}
                        {item.sku && <p className="text-xs text-primary/40">SKU: {item.sku}</p>}
                      </td>
                      <td className="px-4 py-4 text-primary/70">{item.quantity}</td>
                      <td className="px-4 py-4 text-primary/70">{formatPrice(item.unitPrice)}</td>
                      <td className="px-6 py-4 text-right font-medium text-primary">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div className="border-t border-black/5 bg-sand-50 px-6 py-4">
              <div className="ml-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-primary/60"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between text-primary/60"><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
                {Number(order.tax) > 0 && <div className="flex justify-between text-primary/60"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>}
                {Number(order.discount) > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                <div className="flex justify-between border-t border-black/10 pt-2 text-base font-semibold text-primary"><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: address + notes */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-card">
            <h3 className="text-sm font-semibold text-primary">Shipping Address</h3>
            <div className="mt-3"><AddressBlock addr={order.shippingAddress} /></div>
            <div className="mt-4 border-t border-black/5 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary/40">Contact</p>
              <p className="mt-1 text-sm text-primary/70">{order.email}</p>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-card">
              <h3 className="text-sm font-semibold text-primary">Notes</h3>
              <p className="mt-3 text-sm text-primary/70 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-card">
            <h3 className="text-sm font-semibold text-primary">Timeline</h3>
            <div className="mt-3 space-y-2 text-xs text-primary/60">
              <p>Created: {formatDate(order.createdAt)}</p>
              <p>Updated: {formatDate(order.updatedAt)}</p>
              <p>ID: #{order.id} · {order.orderNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
