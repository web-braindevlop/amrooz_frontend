'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductsTable from '@/components/admin/ProductsTable';
import { AlertIcon, PlusIcon } from '@/components/ui/Icons';
import { deleteProduct, fetchAdminProducts } from '@/lib/admin/products';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const previous = products;
    setProducts((p) => p.filter((item) => item.id !== id));
    try {
      await deleteProduct(id);
    } catch (err) {
      setProducts(previous);
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-primary/50">
          {loading ? 'Loading…' : `${products.length} product${products.length === 1 ? '' : 's'}`}
        </p>
        <Link
          href="/admin/products/new"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-soft"
        >
          <PlusIcon className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertIcon className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ProductsTable products={products} onDelete={handleDelete} />
      )}
    </div>
  );
}
