'use client';

import Link from 'next/link';
import TaxonomyManager from '@/components/admin/TaxonomyManager';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { attributesApi } from '@/lib/admin/taxonomy';

// Each attribute previews its configured terms (values) and links through to
// its own terms screen (WooCommerce's "Configure terms").
const columns = [
  {
    key: 'terms',
    label: 'Terms',
    render: (item) => {
      const names = (item.terms || []).map((t) => t.name);
      const shown = names.slice(0, 12);
      const extra = names.length - shown.length;
      return (
        <div className="space-y-1">
          {names.length > 0 ? (
            <p className="text-primary/80">
              {shown.join(', ')}
              {extra > 0 && <span className="text-primary/40"> +{extra} more</span>}
            </p>
          ) : (
            <p className="text-primary/35">No terms yet</p>
          )}
          <Link
            href={`/admin/attributes/${item.id}`}
            className="inline-block text-xs font-medium text-accent-dark transition-colors hover:underline"
          >
            Configure terms
          </Link>
        </div>
      );
    },
  },
];

export default function AttributesPage() {
  return (
    <ToastProvider>
      <TaxonomyManager
        singular="Attribute"
        plural="Attributes"
        description="Define product attributes like Color or Size, then add each one's terms (values). Drag the handle to reorder."
        api={attributesApi}
        columns={columns}
        reorderable
      />
    </ToastProvider>
  );
}
