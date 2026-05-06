'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-border rounded-xl animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

/** Skeleton untuk baris tabel */
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-3 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton untuk stat card */
export function StatCardSkeleton() {
  return (
    <div className="card p-5 flex items-start gap-4">
      <Skeleton className="w-11 h-11 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-2 w-20" />
      </div>
    </div>
  );
}
