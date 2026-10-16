'use client';

import { useRef, useState } from 'react';
import { uploadProductImage } from '@/lib/admin/products';
import { AlertIcon, CloseIcon, PlusIcon, StarIcon } from '@/components/ui/Icons';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Multi-image upload widget for the product gallery — separate from the
 * single featured image. Uploads immediately and shows thumbnails; images
 * can be reordered by moving one to the front of the gallery.
 */
export default function ImageUploader({ images, onChange }) {
  const inputRef = useRef(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');

  async function handleFiles(fileList) {
    setError('');
    const files = Array.from(fileList || []);

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" isn't a supported image type.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" is larger than 5MB.`);
        continue;
      }

      setPendingCount((n) => n + 1);
      try {
        const { url } = await uploadProductImage(file);
        onChange((current) => [...current, url]);
      } catch (err) {
        setError(err.message || `Failed to upload "${file.name}".`);
      } finally {
        setPendingCount((n) => n - 1);
      }
    }
  }

  function handleRemove(index) {
    onChange((current) => current.filter((_, i) => i !== index));
  }

  function handleMoveToFront(index) {
    onChange((current) => {
      if (index === 0) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div
            key={url + i}
            className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-sand-50"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/55 via-transparent to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveToFront(i)}
                  aria-label="Move to front of gallery"
                  className="rounded-full bg-white/90 p-1.5 text-primary hover:bg-white"
                >
                  <StarIcon className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label="Remove image"
                className="ml-auto rounded-full bg-white/90 p-1.5 text-red-600 hover:bg-white"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: pendingCount }).map((_, i) => (
          <div
            key={`pending-${i}`}
            className="skeleton flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-black/10"
          >
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-black/15 text-primary/40 transition-colors hover:border-accent hover:text-accent-dark"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="text-xs font-medium">Add Image</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
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
        JPEG, PNG, WEBP or GIF, up to 5MB each. Extra photos shown alongside the main product
        image — hover a thumbnail to reorder it.
      </p>
    </div>
  );
}
