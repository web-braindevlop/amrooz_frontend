'use client';

import { cn } from '@/utils/format';
import { AreaChart, Area, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

/** Single metric tile for the dashboard grid with Recharts graph. */
export default function StatCard({ label, value, icon: Icon, color = 'default', hint, trend, chartType = 'area' }) {
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

  const chartColors = {
    default: '#4b5563',
    purple: '#a855f7',
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f97316',
    pink: '#ec4899',
    red: '#ef4444',
    gold: '#f59e0b',
  };

  // Convert trend array to data format for Recharts
  const chartData = trend?.map((val, idx) => ({
    name: idx,
    value: val,
  })) || [];

  return (
    <div className={cn('rounded-3xl p-6 shadow-lg text-white relative overflow-hidden', colorClasses[color])}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${color}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${color})`} />
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

        {/* Recharts Graph */}
        {chartData.length > 0 && (
          <div className="mt-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="white" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="white" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="white" 
                    strokeWidth={2}
                    fill={`url(#gradient-${color})`}
                    animationDuration={1000}
                  />
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="white" 
                    strokeWidth={3}
                    dot={{ fill: 'white', r: 3 }}
                    activeDot={{ r: 5 }}
                    animationDuration={1000}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <Bar 
                    dataKey="value" 
                    fill="white"
                    opacity={0.8}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
