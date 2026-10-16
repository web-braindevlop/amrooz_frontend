'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { CloseIcon, EyeIcon, PlusIcon } from '@/components/ui/Icons';
import { formatPrice } from '@/utils/format';

export default function ProductsTable({ products, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-black/15 bg-white px-6 py-20 text-center">
        <p className="text-primary/50">No products yet.</p>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-soft"
        >
          <PlusIcon className="h-4 w-4" /> Add your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs font-semibold uppercase tracking-wide text-primary/45">
              <th className="px-6 py-4">Product</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">Stock</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow key={p.id} product={p} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductRow({ product, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteClick() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setDeleting(true);
    await onDelete(product.id);
  }

  return (
    <tr className="border-b border-black/5 last:border-0 hover:bg-sand-50/60">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand-100">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-lg text-primary/20">
                {product.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-primary">{product.name}</p>
            {product.sku && <p className="text-xs text-primary/40">SKU: {product.sku}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-primary/70">{product.categoryName || '—'}</td>
      <td className="px-4 py-4">
        <span className="font-medium text-primary">{formatPrice(product.price)}</span>
        {product.compareAtPrice > product.price && (
          <span className="ml-1.5 text-xs text-primary/35 line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <span className={product.stock === 0 ? 'text-red-600' : 'text-primary/70'}>{product.stock}</span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={product.isActive ? 'neutral' : 'soldout'}>
            {product.isActive ? 'Active' : 'Hidden'}
          </Badge>
          {product.isFeatured && <Badge tone="gold">Featured</Badge>}
          {product.isNew && <Badge tone="new">New</Badge>}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/products/${product.id}`}
            target="_blank"
            aria-label="View on storefront"
            className="rounded-full p-2 text-primary/40 transition-colors hover:bg-sand-100 hover:text-primary"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="rounded-full border border-primary/15 px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={deleting}
            className={
              confirming
                ? 'inline-flex items-center gap-1 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white'
                : 'rounded-full p-2 text-primary/40 transition-colors hover:bg-red-50 hover:text-red-600'
            }
          >
            {confirming ? (
              <>
                <CloseIcon className="h-3.5 w-3.5" /> {deleting ? 'Deleting…' : 'Confirm?'}
              </>
            ) : (
              <CloseIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
