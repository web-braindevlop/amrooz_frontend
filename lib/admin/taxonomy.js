import { apiFetch } from '@/lib/admin/api';

async function parseOrThrow(res, fallbackMessage) {
  if (res.ok) {
    // DELETE returns an empty body on success.
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  let message = fallbackMessage;
  try {
    const body = await res.json();
    message = Array.isArray(body.message) ? body.message.join(', ') : body.message || message;
  } catch {
    // ignore — use fallback
  }
  throw new Error(message);
}

/**
 * Builds a small CRUD client for a taxonomy resource (categories/tags/brands).
 * All mutating calls go through the authenticated `apiFetch` (cookie session).
 */
function crud(base, label) {
  return {
    list: async () => parseOrThrow(await apiFetch(`/${base}`), `Failed to load ${label}`),
    get: async (id) => parseOrThrow(await apiFetch(`/${base}/${id}`), `Failed to load ${label}`),
    create: async (payload) =>
      parseOrThrow(
        await apiFetch(`/${base}`, { method: 'POST', body: JSON.stringify(payload) }),
        `Failed to create ${label}`,
      ),
    update: async (id, payload) =>
      parseOrThrow(
        await apiFetch(`/${base}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
        `Failed to update ${label}`,
      ),
    remove: async (id) => {
      const res = await apiFetch(`/${base}/${id}`, { method: 'DELETE' });
      if (!res.ok) await parseOrThrow(res, `Failed to delete ${label}`);
    },
  };
}

export const categoriesApi = crud('categories', 'category');
export const tagsApi = crud('tags', 'tag');
export const brandsApi = crud('brands', 'brand');
export const attributesApi = crud('attributes', 'attribute');

/**
 * CRUD client for the terms of a single attribute. Shaped like the taxonomy
 * `api` object so it can drive the same TaxonomyManager component.
 */
export function termsApiFor(attributeId) {
  return {
    list: async () =>
      parseOrThrow(await apiFetch(`/attributes/${attributeId}/terms`), 'Failed to load terms'),
    create: async (payload) =>
      parseOrThrow(
        await apiFetch(`/attributes/${attributeId}/terms`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
        'Failed to create term',
      ),
    update: async (id, payload) =>
      parseOrThrow(
        await apiFetch(`/attributes/terms/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
        'Failed to update term',
      ),
    remove: async (id) => {
      const res = await apiFetch(`/attributes/terms/${id}`, { method: 'DELETE' });
      if (!res.ok) await parseOrThrow(res, 'Failed to delete term');
    },
  };
}

/** Convenience readers used by the product form. */
export const fetchTags = () => tagsApi.list();
export const fetchBrands = () => brandsApi.list();
export const fetchAttributes = () => attributesApi.list();
