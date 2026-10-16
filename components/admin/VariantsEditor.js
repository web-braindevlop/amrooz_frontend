'use client';

import { useMemo, useState } from 'react';
import Toggle from '@/components/ui/Toggle';
import FeaturedImageUploader from '@/components/admin/FeaturedImageUploader';
import { CloseIcon, PlusIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/format';

const inputClass =
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-primary/60';

/** Common color-name → hex map so swatches get a sensible default from the
 *  attribute term name (attribute terms don't store a hex of their own). */
const COLOR_HEX = {
  black: '#111111', white: '#ffffff', ivory: '#fffff0', cream: '#f8eadd', beige: '#f5f5dc',
  grey: '#808080', gray: '#808080', charcoal: '#36454f', silver: '#c0c0c0', slate: '#708090',
  red: '#c0392b', maroon: '#800000', burgundy: '#800020', wine: '#722f37',
  pink: '#ffc0cb', blush: '#de5d83', rose: '#ff007f', coral: '#ff7f50',
  orange: '#e67e22', peach: '#ffe5b4', apricot: '#fbceb1',
  gold: '#c8a24a', yellow: '#f1c40f', mustard: '#e1ad01',
  green: '#27ae60', olive: '#808000', emerald: '#2ecc71', mint: '#98ff98', sage: '#9caf88', teal: '#008080',
  blue: '#2980b9', navy: '#1f2a44', 'navy blue': '#1f2a44', sky: '#87ceeb', 'sky blue': '#87ceeb', royal: '#4169e1', denim: '#1560bd',
  purple: '#8e44ad', lavender: '#b57edc', violet: '#7f00ff', plum: '#8e4585',
  brown: '#8b5a2b', tan: '#d2b48c', khaki: '#c3b091', camel: '#c19a6b', chocolate: '#5a3a22',
  'off white': '#faf9f6', 'off-white': '#faf9f6', nude: '#e3bc9a',
};

/** Best-guess swatch hex for a color name; falls back to a neutral dark. */
export function guessColorHex(name) {
  return COLOR_HEX[String(name || '').trim().toLowerCase()] || '#1a1a1a';
}

const keyOf = (color, size) =>
  `${String(color || '').trim().toLowerCase()}|${String(size || '').trim().toLowerCase()}`;

/** Merges an attribute's global terms with any already-selected values that aren't
 *  in them (e.g. legacy colors typed on an older product) so nothing disappears. */
function mergeColorChips(colorOptions, selectedColors) {
  const map = new Map();
  for (const c of colorOptions) map.set(c.name, { name: c.name, hex: c.hex });
  for (const c of selectedColors) if (!map.has(c.name)) map.set(c.name, { name: c.name, hex: c.hex });
  return Array.from(map.values());
}

function mergeSizeChips(sizeOptions, selectedSizes) {
  const seen = new Set();
  const list = [];
  for (const s of [...sizeOptions, ...selectedSizes]) {
    if (s && !seen.has(s)) {
      seen.add(s);
      list.push(s);
    }
  }
  return list;
}

/**
 * Color terms — all selected by default the moment their attribute is
 * picked (see ProductForm's handleColorAttributeChange). Each selected chip
 * shows a × to remove it; an unselected one (removed earlier) is a plain
 * outline chip you can click to add back. No manual hex editing here.
 * Rendered directly under the "Color attribute" dropdown in ProductForm.
 */
export function ColorPicker({ colorOptions = [], selectedColors = [], onChange, className }) {
  const chips = useMemo(
    () => mergeColorChips(colorOptions, selectedColors),
    [colorOptions, selectedColors],
  );
  if (!chips.length) return null;

  const isSelected = (name) => selectedColors.find((c) => c.name === name);
  function toggle(chip) {
    if (isSelected(chip.name)) {
      onChange(selectedColors.filter((c) => c.name !== chip.name));
    } else {
      onChange([...selectedColors, { name: chip.name, hex: chip.hex || guessColorHex(chip.name) }]);
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => {
        const sel = isSelected(chip.name);
        const hex = sel?.hex || chip.hex || guessColorHex(chip.name);
        return (
          <div
            key={chip.name}
            className={cn(
              'flex items-center gap-2 rounded-full border py-1.5 pl-2.5 pr-2 transition-colors',
              sel ? 'border-accent bg-accent/5' : 'border-black/10'
            )}
          >
            <button
              type="button"
              onClick={() => toggle(chip)}
              aria-pressed={!!sel}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="h-4 w-4 rounded-full border border-black/15"
                style={{ backgroundColor: hex }}
              />
              <span className={sel ? 'font-medium text-primary' : 'text-primary/70'}>{chip.name}</span>
            </button>
            {sel && (
              <button
                type="button"
                onClick={() => toggle(chip)}
                aria-label={`Remove ${chip.name}`}
                className="rounded-full p-0.5 text-primary/35 transition-colors hover:text-red-600"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Size terms — same "all selected by default, × to remove" pattern as ColorPicker. */
export function SizePicker({ sizeOptions = [], selectedSizes = [], onChange, className }) {
  const chips = useMemo(() => mergeSizeChips(sizeOptions, selectedSizes), [sizeOptions, selectedSizes]);
  if (!chips.length) return null;

  const isSelected = (name) => selectedSizes.includes(name);
  function toggle(name) {
    if (isSelected(name)) onChange(selectedSizes.filter((s) => s !== name));
    else onChange([...selectedSizes, name]);
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((name) => {
        const sel = isSelected(name);
        return (
          <div
            key={name}
            className={cn(
              'flex items-center gap-1.5 rounded-full border py-1.5 pl-4 pr-2 text-sm font-medium transition-colors',
              sel ? 'border-primary bg-primary text-white' : 'border-black/10 text-primary/70'
            )}
          >
            <button type="button" onClick={() => toggle(name)} aria-pressed={sel}>
              {name}
            </button>
            {sel && (
              <button
                type="button"
                onClick={() => toggle(name)}
                aria-label={`Remove ${name}`}
                className="rounded-full p-0.5 text-white/70 transition-colors hover:text-white"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Attribute-driven variations editor.
 *
 * The admin picks colors and sizes from the store's global attribute terms
 * (managed under Products → Attributes) instead of retyping them, then clicks
 * "Generate variations" to build a purchasable row for every color × size
 * combination. Each row keeps its own SKU, stock, price/sale overrides and
 * availability; regenerating preserves edits for combinations that still exist.
 *
 * `variants` is the single source of truth for the generated rows; the selected
 * color/size pools live one level up (in ProductForm, via <ColorPicker>/<SizePicker>
 * rendered next to their attribute dropdowns) so they persist across the
 * product-data tabs and stay visually grouped with the attribute they came from.
 */
export default function VariantsEditor({
  variants,
  onChange,
  colorOptions = [],
  sizeOptions = [],
  selectedColors = [],
  selectedSizes = [],
}) {
  // Same merge as ColorPicker/SizePicker — needed here too, for the Generate
  // button's combo count and for each row's Color/Size dropdown options.
  const colorChips = useMemo(
    () => mergeColorChips(colorOptions, selectedColors),
    [colorOptions, selectedColors],
  );
  const sizeChips = useMemo(() => mergeSizeChips(sizeOptions, selectedSizes), [sizeOptions, selectedSizes]);

  // Rows whose Sale start/end date fields have been expanded via the
  // "Schedule" link. A row also renders expanded automatically when it
  // already has a date set (e.g. loading an existing product for edit).
  const [expandedSchedule, setExpandedSchedule] = useState(() => new Set());
  function toggleSchedule(index) {
    setExpandedSchedule((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Clears any set dates and collapses the section — lets the admin back out
  // of a schedule entirely instead of just hiding the fields with values still in them.
  function cancelSchedule(index) {
    setExpandedSchedule((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    updateVariant(index, { saleStartDate: '', saleEndDate: '' });
  }

  // Every variation needs both a color and a size — no generating from just one axis.
  const canGenerate = selectedColors.length > 0 && selectedSizes.length > 0;
  const comboCount = selectedColors.length * selectedSizes.length;

  function generate() {
    if (!canGenerate) return;
    const colors = selectedColors;
    const sizes = selectedSizes;
    const existing = new Map(variants.map((v) => [keyOf(v.color, v.size), v]));

    const next = [];
    for (const c of colors) {
      for (const s of sizes) {
        const prev = existing.get(keyOf(c.name, s));
        if (prev) {
          next.push({ ...prev, color: c.name, size: s, colorHex: c.hex ?? prev.colorHex });
        } else {
          next.push({
            size: s,
            color: c.name,
            colorHex: c.hex || guessColorHex(c.name),
            sku: '',
            stock: 0,
            priceOverride: '',
            salePrice: '',
            saleStartDate: '',
            saleEndDate: '',
            isActive: true,
            imageUrl: '',
          });
        }
      }
    }
    onChange(next);
  }

  function updateVariant(index, patch) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index) {
    onChange(variants.filter((_, i) => i !== index));
  }

  // Copy data from this variant to all other variants with the same color
  function copyToSameColor(sourceIndex) {
    const source = variants[sourceIndex];
    if (!source) return;

    const updated = variants.map((v, i) => {
      // Skip the source variant and variants with different colors
      if (i === sourceIndex || v.color !== source.color) return v;
      
      // Copy all fields except size and color (which should stay unique)
      return {
        ...v,
        sku: '', // Keep SKU empty as it should be unique
        stock: source.stock,
        priceOverride: source.priceOverride,
        salePrice: source.salePrice,
        saleStartDate: source.saleStartDate,
        saleEndDate: source.saleEndDate,
        isActive: source.isActive,
        imageUrl: source.imageUrl,
      };
    });
    
    onChange(updated);
  }

  const noAttributes = colorChips.length === 0 && sizeChips.length === 0;

  if (noAttributes) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 bg-sand-50 px-4 py-8 text-center text-sm text-primary/55">
        No attributes defined yet. Create a <b>Color</b> and a <b>Size</b> attribute with their
        values under{' '}
        <a href="/admin/attributes" className="font-semibold text-accent-dark underline">
          Products → Attributes
        </a>
        , then pick from them here.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Generate */}
      <div className="flex flex-wrap items-center gap-3 border-t border-black/5 pt-4">
        <button
          type="button"
          onClick={generate}
          disabled={!canGenerate}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-40"
        >
          <PlusIcon className="h-4 w-4" /> Generate variations
        </button>
        <span className="text-xs text-primary/45">
          {canGenerate
            ? `Builds ${comboCount} variation${comboCount === 1 ? '' : 's'} from the selected colors & sizes.`
            : 'Select at least one color and one size to generate variations.'}
        </span>
      </div>

      {/* Generated rows */}
      {variants.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/15 px-4 py-6 text-center text-sm text-primary/40">
          No variations yet. Pick colors/sizes above and click “Generate variations”.
        </p>
      ) : (
        <div className="space-y-3">
          {variants.map((v, i) => {
            // Count how many other variants have the same color
            const sameColorCount = variants.filter((variant, idx) => idx !== i && variant.color === v.color).length;
            
            return (
            <div key={i} className="rounded-2xl border border-black/10 bg-sand-50 p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="grid flex-1 grid-cols-2 gap-3">
                  <Field label="Color">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border border-black/15"
                        style={{ backgroundColor: v.colorHex || '#1a1a1a' }}
                        aria-hidden="true"
                      />
                      <select
                        value={v.color}
                        onChange={(e) => {
                          const name = e.target.value;
                          const chip = colorChips.find((c) => c.name === name);
                          updateVariant(i, {
                            color: name,
                            colorHex: name ? chip?.hex || guessColorHex(name) : v.colorHex,
                          });
                        }}
                        required
                        className={inputClass}
                      >
                        {!v.color && (
                          <option value="" disabled hidden>
                            Select color…
                          </option>
                        )}
                        {colorChips.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Field>
                  <Field label="Size">
                    <select
                      value={v.size}
                      onChange={(e) => updateVariant(i, { size: e.target.value })}
                      required
                      className={inputClass}
                    >
                      {!v.size && (
                        <option value="" disabled hidden>
                          Select size…
                        </option>
                      )}
                      {sizeChips.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  aria-label="Remove variation"
                  className="mt-6 shrink-0 rounded-full p-2 text-red-500 transition-colors hover:bg-red-50"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Copy to same color button */}
              {sameColorCount > 0 && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => copyToSameColor(i)}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-dark transition-colors hover:bg-accent/20"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to all other {v.color} ({sameColorCount} {sameColorCount === 1 ? 'size' : 'sizes'})
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="SKU">
                  <input
                    value={v.sku || ''}
                    onChange={(e) => updateVariant(i, { sku: e.target.value })}
                    placeholder="optional"
                    className={inputClass}
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, { stock: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Regular price">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.priceOverride ?? ''}
                    onChange={(e) => updateVariant(i, { priceOverride: e.target.value })}
                    placeholder="Same as product"
                    className={inputClass}
                  />
                </Field>
                <label className="block">
                  <span className="mb-1.5 flex items-center justify-between gap-2 text-[0.65rem] font-semibold uppercase tracking-wide text-primary/50">
                    Sale price
                    <button
                      type="button"
                      onClick={() => toggleSchedule(i)}
                      className="normal-case tracking-normal text-accent-dark underline decoration-dotted underline-offset-2 hover:text-accent"
                    >
                      Schedule
                    </button>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.salePrice ?? ''}
                    onChange={(e) => updateVariant(i, { salePrice: e.target.value })}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </label>
              </div>

              {(expandedSchedule.has(i) || v.saleStartDate || v.saleEndDate) && (
                <div className="mt-3 border-t border-black/5 pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-primary/50">
                      Sale schedule
                    </span>
                    <button
                      type="button"
                      onClick={() => cancelSchedule(i)}
                      className="text-xs font-medium text-red-500 underline decoration-dotted underline-offset-2 hover:text-red-600"
                    >
                      Cancel schedule
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Sale starts">
                      <input
                        type="datetime-local"
                        value={v.saleStartDate || ''}
                        onChange={(e) => updateVariant(i, { saleStartDate: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Sale ends">
                      <input
                        type="datetime-local"
                        value={v.saleEndDate || ''}
                        onChange={(e) => updateVariant(i, { saleEndDate: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <Toggle
                  id={`variant-${i}-active`}
                  checked={v.isActive !== false}
                  onChange={(checked) => updateVariant(i, { isActive: checked })}
                  label="Available"
                />
              </div>

              <div className="mt-3 border-t border-black/5 pt-3">
                <p className={labelClass}>Image</p>
                <FeaturedImageUploader
                  image={v.imageUrl || ''}
                  onChange={(url) => updateVariant(i, { imageUrl: url })}
                />
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-wide text-primary/50">
        {label}
      </span>
      {children}
    </label>
  );
}
