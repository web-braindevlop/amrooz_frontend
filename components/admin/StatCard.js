import { cn } from '@/utils/format';

/** Single metric tile for the dashboard grid with optional trend graph. */
export default function StatCard({ label, value, icon: Icon, color = 'default', hint, trend }) {
  const colorClasses = {
    default: 'bg-gray-600',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    gold: 'bg-amber-500',
  };

  const lightColorClasses = {
    default: 'bg-gray-100',
    purple: 'bg-purple-100',
    blue: 'bg-blue-100',
    green: 'bg-emerald-100',
    orange: 'bg-orange-100',
    pink: 'bg-pink-100',
    red: 'bg-red-100',
    gold: 'bg-amber-100',
  };

  return (
    <div className={cn('rounded-3xl p-6 shadow-lg text-white relative overflow-hidden', colorClasses[color])}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm')}>
            <Icon className="h-6 w-6" />
          </span>
          {hint && (
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
              {hint}
            </span>
          )}
        </div>
        
        <p className="mt-6 text-4xl font-bold">{value}</p>
        <p className="mt-2 text-sm font-medium opacity-90">{label}</p>

        {/* Mini trend graph */}
        {trend && trend.length > 0 && (
          <div className="mt-4 flex items-end gap-1 h-12">
            {trend.map((val, idx) => {
              const maxVal = Math.max(...trend);
              const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div 
                  key={idx} 
                  className="flex-1 bg-white/30 rounded-t transition-all hover:bg-white/50"
                  style={{ height: `${height}%`, minHeight: '8px' }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
