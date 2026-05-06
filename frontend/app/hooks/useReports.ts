'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchReports } from '@/app/services/reports.service';
import type { ApiReport, DashboardStats, Priority } from '@/app/lib/types';

// ─── Fallback data (digunakan jika API tidak tersedia) ────────────────────────
import { reports as DUMMY_REPORTS } from '@/app/lib/data';

function dummyToApiReport(r: (typeof DUMMY_REPORTS)[0]): ApiReport {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    createdAt: r.date,
    updatedAt: r.date,
    createdBy: { id: '0', name: r.reporter, email: '' },
    category: r.category,
    location: r.location,
    lat: r.lat,
    lng: r.lng,
    reporter: r.reporter,
    date: r.date,
    image: r.image,
    predictedPriority: r.score?.total ?? 5,
    aiScore: r.score?.total ?? 5,
    priorityLabel: r.priority,
    scoreSource: 'rule-based',
    severity: r.score?.severity,
    frequency: r.score?.frequency,
    recency: r.score?.recency,
  };
}

const FALLBACK_REPORTS: ApiReport[] = DUMMY_REPORTS.map(dummyToApiReport);

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
      // Fallback ke dummy data agar UI tetap berfungsi
      setReports(FALLBACK_REPORTS);
      setIsUsingFallback(true);
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
