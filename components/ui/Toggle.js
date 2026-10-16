import { cn } from '@/utils/format';

/** Accessible on/off switch backed by a real (visually hidden) checkbox. */
export default function Toggle({ id, checked, onChange, label, description }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 py-1.5">
      <span>
        <span className="block text-sm font-medium text-primary">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-primary/45">{description}</span>}
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full transition-colors',
            'bg-black/15 peer-checked:bg-accent'
          )}
        />
        <span
          className={cn(
            'pointer-events-none relative inline-block h-4.5 w-4.5 translate-x-1 transform',
            'rounded-full bg-white shadow transition-transform peer-checked:translate-x-6'
          )}
        />
      </span>
    </label>
  );
}
