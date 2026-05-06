'use client';

import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  change,
  positive = true,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}: StatCardProps) {
  return (
    <div className="card p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-apple-md hover:-translate-y-0.5 hover:border-primary/10 group cursor-default">
      <div
        className={clsx(
          'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
          iconBg,
        )}
      >
        <Icon className={clsx('w-5 h-5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-secondary mb-1">{label}</p>
        <p className="text-2xl font-bold text-text-primary tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </p>
        {change && (
          <p
            className={clsx(
              'text-xs font-semibold mt-1 flex items-center gap-1',
              positive ? 'text-green-600' : 'text-red-500',
            )}
          >
            <span>{positive ? '↑' : '↓'}</span>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
