'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import TaxonomyManager from '@/components/admin/TaxonomyManager';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { AlertIcon } from '@/components/ui/Icons';
import { attributesApi, termsApiFor } from '@/lib/admin/taxonomy';

export default function AttributeTermsPage({ params }) {
  const { id } = use(params);
  const termsApi = useMemo(() => termsApiFor(id), [id]);

  const [attribute, setAttribute] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await attributesApi.get(id);
        if (active) setAttribute(data);
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
        href="/admin/attributes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/50 transition-colors hover:text-primary"
      >
        ← Back to Attributes
      </Link>

      {loading && <div className="skeleton h-64 rounded-3xl" />}

      {!loading && error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertIcon className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && attribute && (
        <>
          <div>
            <h2 className="font-serif text-xl text-primary">Terms for “{attribute.name}”</h2>
            <p className="mt-1 text-sm text-primary/50">
              Add the selectable values for this attribute (e.g. Small, Medium, Large).
            </p>
          </div>

          <ToastProvider>
            <TaxonomyManager
              singular="Term"
              plural="Terms"
              description={`Values for the “${attribute.name}” attribute.`}
              api={termsApi}
              reorderable
              bulkCreate
            />
          </ToastProvider>
        </>
      )}
    </div>
  );
}
