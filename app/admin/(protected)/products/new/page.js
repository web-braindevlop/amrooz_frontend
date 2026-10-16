'use client';

import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/50 transition-colors hover:text-primary"
      >
        ← Back to Products
      </Link>
      <ProductForm mode="create" />
    </div>
  );
}
