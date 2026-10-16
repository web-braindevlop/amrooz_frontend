'use client';

import { useRef, useState } from 'react';
import { uploadProductImage } from '@/lib/admin/products';
import { AlertIcon, CloseIcon, PlusIcon } from '@/components/ui/Icons';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Single "featured" image uploader — the product's main photo, kept
 * separate from the gallery below it (mirrors WooCommerce's Product
 * image vs. Product gallery fields).
 */
export default function FeaturedImageUploader({ image, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    setError('');
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`"${file.name}" isn't a supported image type.`);
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`"${file.name}" is larger than 5MB.`);
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadProductImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || `Failed to upload "${file.name}".`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-sand-50">
          {image ? (
            <>
              <img src={image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/55 via-transparent to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onChange('')}
                  aria-label="Remove image"
                  className="rounded-full bg-white/90 p-1.5 text-red-600 hover:bg-white"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : uploading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-black/15 text-primary/40 transition-colors hover:border-accent hover:text-accent-dark"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="text-xs font-medium">Add Image</span>
            </button>
          )}
        </div>

        {image && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Replace image'}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
          <AlertIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <p className="mt-3 text-xs text-primary/40">
        JPEG, PNG, WEBP or GIF, up to 5MB. Shown on product cards and store listings.
      </p>
    </div>
  );
}
