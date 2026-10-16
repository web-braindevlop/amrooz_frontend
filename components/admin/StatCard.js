import { cn } from '@/utils/format';

/** Single metric tile for the dashboard grid. */
export default function StatCard({ label, value, icon: Icon, tone = 'default', hint }) {
  const toneClasses = {
    default: 'bg-primary text-white',
    gold: 'bg-accent text-primary',
    warn: 'bg-red-50 text-red-600',
  };

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-sm text-primary/50">{label}</p>
      {hint && <p className="mt-3 text-xs font-medium text-accent-dark">{hint}</p>}
    </div>
  );
}
