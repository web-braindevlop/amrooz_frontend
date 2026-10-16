'use client';

import { useState } from 'react';
import { CloseIcon, PlusIcon } from '@/components/ui/Icons';

/**
 * WordPress-style tag picker: selected tags show as removable chips, you can
 * type a name to add an existing tag or create a brand-new one, and remaining
 * tags are offered as quick-add suggestions.
 */
export default function TagSelector({ tags, value, onChange, onCreateTag }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const selected = tags.filter((t) => value.includes(t.id));
  const available = tags.filter((t) => !value.includes(t.id));

  function toggle(id) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  async function addByName(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError('');

    const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!value.includes(existing.id)) onChange([...value, existing.id]);
      setInput('');
      return;
    }

    setBusy(true);
    try {
      const created = await onCreateTag(trimmed);
      onChange([...value, created.id]);
      setInput('');
    } catch (err) {
      setError(err.message || 'Could not add tag.');
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addByName(input);
    }
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
            >
              {t.name}
              <button
                type="button"
                onClick={() => toggle(t.id)}
                aria-label={`Remove ${t.name}`}
                className="text-white/70 transition-colors hover:text-white"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag and press Enter"
          className="w-full rounded-2xl border border-black/10 bg-sand-50 px-4 py-2.5 text-sm text-primary placeholder:text-primary/35 outline-none transition-colors focus:border-accent focus:bg-white"
        />
        <button
          type="button"
          onClick={() => addByName(input)}
          disabled={busy || !input.trim()}
          className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-primary/15 px-3 text-sm font-medium text-primary transition-colors hover:border-primary disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" /> Add
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {available.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs text-primary/40">Choose from existing tags</p>
          <div className="flex flex-wrap gap-2">
            {available.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-primary/70 transition-colors hover:border-accent hover:text-accent-dark"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
