import { apiFetch } from '@/lib/admin/api';

async function parseOrThrow(res, fallbackMessage) {
  if (res.ok) return res.json();
  let message = fallbackMessage;
  try {
    const body = await res.json();
    message = Array.isArray(body.message) ? body.message.join(', ') : body.message || message;
  } catch {
    // ignore — use fallback
  }
  throw new Error(message);
}

export async function fetchAdminProducts() {
  const res = await apiFetch('/products');
  return parseOrThrow(res, 'Failed to load products');
}

export async function fetchAdminProduct(id) {
  const res = await apiFetch(`/products/${id}`);
  return parseOrThrow(res, 'Failed to load product');
}

export async function createProduct(payload) {
  const res = await apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, 'Failed to create product');
}

export async function updateProduct(id, payload) {
  const res = await apiFetch(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, 'Failed to update product');
}

export async function deleteProduct(id) {
  const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseOrThrow(res, 'Failed to delete product');
}

export async function fetchAdminCategories() {
  const res = await apiFetch('/categories');
  return parseOrThrow(res, 'Failed to load categories');
}

/** Uploads a single image file, returning its public URL. */
export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiFetch('/uploads/image', {
    method: 'POST',
    body: formData,
  });
  return parseOrThrow(res, 'Failed to upload image');
}
