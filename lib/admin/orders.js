import { apiFetch } from '@/lib/admin/api';

async function parseOrThrow(res, fallback) {
  if (res.ok) return res.json();
  let msg = fallback;
  try {
    const body = await res.json();
    msg = Array.isArray(body.message) ? body.message.join(', ') : body.message || msg;
  } catch {}
  throw new Error(msg);
}

export async function fetchAdminOrders({ page = 1, limit = 25, search = '', status = '', paymentStatus = '' } = {}) {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (paymentStatus) params.set('paymentStatus', paymentStatus);
  const qs = params.toString();
  const res = await apiFetch(`/orders${qs ? `?${qs}` : ''}`);
  return parseOrThrow(res, 'Failed to load orders');
}

export async function fetchAdminOrder(id) {
  const res = await apiFetch(`/orders/${id}`);
  return parseOrThrow(res, 'Failed to load order');
}

export async function updateAdminOrder(id, payload) {
  const res = await apiFetch(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, 'Failed to update order');
}
