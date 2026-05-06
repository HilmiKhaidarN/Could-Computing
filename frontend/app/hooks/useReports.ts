'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchReports } from '@/app/services/reports.service';
import type { ApiReport, DashboardStats, Priority } from '@/app/lib/types';

// ─── No fallback data - all data from backend API ──────────────────────────────

const FALLBACK_REPORTS: ApiReport[] = [];

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseReportsReturn {
  reports: ApiReport[];
  isLoading: boolean;
  error: string | null;
  isUsingFallback: boolean;
  refresh: () => void;
  stats: DashboardStats;
}

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReports();
      setReports(data);
      setIsUsingFallback(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data laporan';
      setError(msg);
      // No fallback - show empty state
      setReports([]);
      setIsUsingFallback(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Hitung stats dari data yang ada
  const stats: DashboardStats = {
    totalReports: reports.length,
    urgentCount: reports.filter((r) => r.priorityLabel === 'urgent').length,
    completedCount: reports.filter((r) => r.status === 'selesai').length,
    avgAiScore:
      reports.length > 0
        ? Math.round(
            (reports.reduce((sum, r) => sum + (r.aiScore ?? 5), 0) / reports.length) * 10,
          ) / 10
        : 0,
  };

  return {
    reports,
    isLoading,
    error,
    isUsingFallback,
    refresh: load,
    stats,
  };
}
