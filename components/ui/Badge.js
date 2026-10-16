import { cn } from '@/utils/format';

const TONES = {
  new: 'bg-primary text-white',
  sale: 'bg-accent text-primary',
  bestseller: 'bg-white/90 text-primary backdrop-blur',
  soldout: 'bg-white/85 text-primary/70 backdrop-blur',
  neutral: 'bg-sand-100 text-primary/70',
  gold: 'bg-gradient-to-r from-accent-dark to-accent text-white',
  // Order statuses
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  processing: 'bg-blue-100 text-blue-800 border border-blue-200',
  shipped: 'bg-violet-100 text-violet-800 border border-violet-200',
  delivered: 'bg-green-100 text-green-800 border border-green-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
  refunded: 'bg-orange-100 text-orange-800 border border-orange-200',
  failed: 'bg-red-100 text-red-800 border border-red-200',
};

/** Compact pill label used for product status and marketing flags. */
export default function Badge({ tone = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]',
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
