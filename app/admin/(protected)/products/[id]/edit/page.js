'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';
import { AlertIcon } from '@/components/ui/Icons';
import { fetchAdminProduct } from '@/lib/admin/products';

export default function EditProductPage({ params }) {
  const { id } = use(params);

  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchAdminProduct(id);
        if (active) setProduct(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/50 transition-colors hover:text-primary"
      >
        ← Back to Products
      </Link>

      {loading && (
        <div className="space-y-4">
          <div className="skeleton h-64 rounded-3xl" />
          <div className="skeleton h-40 rounded-3xl" />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertIcon className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && product && <ProductForm mode="edit" product={product} />}
    </div>
  );
}
