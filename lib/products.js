import { sampleProducts } from '@/lib/sampleProducts';

/**
 * Fetch products from the NestJS API, gracefully falling back to the local
 * sample catalogue when the backend is unavailable or returns nothing.
 * Works on both server and client.
 *
 * Accepts either a category slug (legacy, e.g. `fetchProducts('women')`) or
 * an options object `{ category, search }` for combined filtering.
 *
 * @returns {Promise<{ data: any[], isSample: boolean }>}
 */
export async function fetchProducts(categoryOrOptions) {
  const { category, search } =
    typeof categoryOrOptions === 'string' || categoryOrOptions == null
      ? { category: categoryOrOptions, search: undefined }
      : categoryOrOptions;

  const base = process.env.NEXT_PUBLIC_API_URL;
  const sampleFor = () => {
    let list = category ? sampleProducts.filter((p) => p.category === category) : sampleProducts;
    if (search?.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
      );
    }
    return list;
  };

  try {
    if (!base) throw new Error('API URL not configured');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search?.trim()) params.set('search', search.trim());
    const url = params.toString() ? `${base}/products?${params}` : `${base}/products`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Unexpected response shape');
    // A real, empty search result is meaningful ("no matches") and shouldn't
    // be papered over with unrelated sample products.
    if (data.length > 0 || search?.trim()) {
      return { data, isSample: false };
    }
    return { data: sampleFor(), isSample: true };
  } catch {
    return { data: sampleFor(), isSample: true };
  }
}

/**
 * Fetch a single product by id from the NestJS API, falling back to the
 * local sample catalogue when the backend is unavailable or the id isn't
 * found there either. Works on both server and client.
 *
 * @returns {Promise<{ data: any|null, isSample: boolean }>}
 */
export async function fetchProduct(id) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const sampleMatch = () =>
    sampleProducts.find((p) => String(p.id) === String(id)) || null;

  try {
    if (!base) throw new Error('API URL not configured');
    const res = await fetch(`${base}/products/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);

    const data = await res.json();
    if (data && data.id != null) {
      return { data, isSample: false };
    }
    return { data: sampleMatch(), isSample: true };
  } catch {
    return { data: sampleMatch(), isSample: true };
  }
}
