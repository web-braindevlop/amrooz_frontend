import { cn } from '@/utils/format';
import { StarIcon } from '@/components/ui/Icons';

/**
 * Star rating display with fractional fill and optional review count.
 * Renders nothing when `value` is not a valid number.
 */
export default function Rating({ value, count, size = 'sm', className }) {
  const rating = Number(value);
  if (Number.isNaN(rating) || rating <= 0) return null;

  const dims = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative inline-flex">
        {/* Base (empty) stars */}
        <div className="flex text-sand-300">
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} className={dims} strokeWidth={1.2} />
          ))}
        </div>
        {/* Filled overlay clipped to the rating percentage */}
        <div
          className="absolute inset-0 flex overflow-hidden text-accent"
          style={{ width: `${percent}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon
              key={i}
              className={dims}
              strokeWidth={1.2}
              style={{ fill: 'currentColor' }}
            />
          ))}
        </div>
      </div>
      <span className="text-xs font-medium text-primary/70">
        {rating.toFixed(1)}
        {count ? <span className="text-primary/40"> ({count})</span> : null}
      </span>
    </div>
  );
}
