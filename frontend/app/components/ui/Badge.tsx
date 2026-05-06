'use client';

import clsx from 'clsx';
import type { Priority, ReportStatus } from '@/app/lib/data';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold', {
        'bg-red-50 text-red-600': priority === 'urgent',
        'bg-orange-50 text-orange-600': priority === 'medium',
        'bg-green-50 text-green-600': priority === 'low',
      })}
    >
      <span
        className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-red-500': priority === 'urgent',
          'bg-orange-500': priority === 'medium',
          'bg-green-500': priority === 'low',
        })}
      />
      {priority === 'urgent' ? 'Urgent' : priority === 'medium' ? 'Medium' : 'Rendah'}
    </span>
  );
}

interface StatusBadgeProps {
  status: ReportStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<ReportStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700' },
    proses: { label: 'Diproses', className: 'bg-blue-50 text-blue-700' },
    selesai: { label: 'Selesai', className: 'bg-green-50 text-green-700' },
    ditolak: { label: 'Ditolak', className: 'bg-red-50 text-red-600' },
  };
  const { label, className } = map[status];
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', className)}>
      {label}
    </span>
  );
}
