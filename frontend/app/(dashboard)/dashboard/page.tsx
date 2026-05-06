'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  FileText, AlertTriangle, CheckCircle, TrendingUp,
  RefreshCw, Filter, Brain,
} from 'lucide-react';
import type { ApiReport } from '@/app/lib/types';
import { StatCard } from '@/app/components/ui/StatCard';
import { StatCardSkeleton } from '@/app/components/ui/Skeleton';
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge';
import { ReportDetailPanel } from '@/app/components/map/ReportDetailPanel';
import { ErrorBanner } from '@/app/components/ui/ErrorBanner';
import { useAuth } from '@/app/hooks/useAuth';
import { useReports } from '@/app/hooks/useReports';
import { CATEGORY_COLORS } from '@/app/lib/data';

const MapView = dynamic(() => import('@/app/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-text-secondary">Memuat peta...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { user, can } = useAuth();
  const { reports, isLoading, error, isUsingFallback, refresh, stats } = useReports();

  const [selectedReport, setSelectedReport] = useState<ApiReport | null>(null);
  const [focusReport, setFocusReport] = useState<ApiReport | null>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const handleMarkerClick = useCallback((report: ApiReport) => {
    setSelectedReport(report);
  }, []);

  const handleMapReady = useCallback((mapInstance: unknown) => {
    mapInstanceRef.current = mapInstance;
  }, []);

  const handlePriorityItemClick = useCallback((report: ApiReport) => {
    setSelectedReport(report);
    setFocusReport(report);
    setTimeout(() => setFocusReport(null), 1000);
  }, []);

  const handleFocusMap = useCallback(() => {
    if (!selectedReport) return;
    setFocusReport(selectedReport);
    setTimeout(() => setFocusReport(null), 1000);
  }, [selectedReport]);

  // Derived data
  const urgentReports = reports.filter((r) => r.priorityLabel === 'urgent').slice(0, 3);

  // Category distribution from real data
  const categoryDist = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => {
      const cat = r.category ?? 'Lainnya';
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({
      label,
      pct: Math.round((count / Math.max(reports.length, 1)) * 100),
      color: CATEGORY_COLORS[label] ?? '#AEAEB2',
    }));

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 bg-white border-b border-surface-border flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Dashboard</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Selamat datang, <span className="font-semibold text-primary">{user?.name}</span> —
            Pemantauan infrastruktur Kota Bandung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs py-2 px-3 gap-1.5">
            <Filter size={13} /> Filter
          </button>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="btn-secondary text-xs py-2 px-3 gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-6 space-y-5">

          {/* Fallback banner */}
          {isUsingFallback && (
            <ErrorBanner compact onRetry={refresh} />
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard label="Total Laporan" value={stats.totalReports}
                  change="dari backend" positive icon={FileText}
                  iconColor="text-primary" iconBg="bg-primary/10" />
                <StatCard label="Prioritas Tinggi" value={stats.urgentCount}
                  change="perlu perhatian" positive={false} icon={AlertTriangle}
                  iconColor="text-red-500" iconBg="bg-red-50" />
                <StatCard label="Selesai" value={stats.completedCount}
                  change="laporan selesai" positive icon={CheckCircle}
                  iconColor="text-green-600" iconBg="bg-green-50" />
                <StatCard label="Rata-rata Skor AI" value={stats.avgAiScore.toFixed(1)}
                  change="skor prioritas" positive icon={TrendingUp}
                  iconColor="text-accent-purple" iconBg="bg-accent-purple/10" />
              </>
            )}
          </div>

          {/* Map + Side panel */}
          <div className="grid xl:grid-cols-3 gap-5">
            {/* Map */}
            <div className="xl:col-span-2">
              <div className="card overflow-hidden" style={{ height: 480 }}>
                <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-500'} animate-pulse`} />
                    <span className="text-sm font-semibold text-text-primary">Peta Laporan</span>
                    <span className="text-xs text-text-tertiary">
                      — {isLoading ? '...' : `${reports.length} titik aktif`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {[
                      { color: 'bg-red-500', label: 'Urgent' },
                      { color: 'bg-orange-400', label: 'Medium' },
                      { color: 'bg-green-500', label: 'Rendah' },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-[10px] text-text-tertiary">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative" style={{ height: 'calc(100% - 49px)' }}>
                  <MapView
                    reports={reports}
                    onMarkerClick={handleMarkerClick}
                    onMapReady={handleMapReady}
                    selectedId={selectedReport?.id}
                    focusReport={focusReport}
                  />
                  {selectedReport && (
                    <ReportDetailPanel
                      report={selectedReport}
                      onClose={() => setSelectedReport(null)}
                      onFocusMap={handleFocusMap}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Priority list */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-text-primary">Prioritas Tinggi</h3>
                  <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    {urgentReports.length} urgent
                  </span>
                </div>
                <div className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 rounded-xl bg-surface animate-pulse h-16" />
                    ))
                  ) : urgentReports.length === 0 ? (
                    <p className="text-xs text-text-tertiary text-center py-4">
                      Tidak ada laporan urgent
                    </p>
                  ) : (
                    urgentReports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => handlePriorityItemClick(report)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group hover:scale-[1.01] ${
                          selectedReport?.id === report.id
                            ? 'bg-red-50/80 border-red-200 shadow-sm'
                            : 'bg-surface border-surface-border hover:bg-red-50/50 hover:border-red-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-xs font-semibold text-text-primary leading-snug group-hover:text-red-700 transition-colors">
                            {report.title}
                          </p>
                          <PriorityBadge priority={report.priorityLabel} />
                        </div>
                        <p className="text-[10px] text-text-tertiary truncate">
                          📍 {report.location ?? '—'}
                        </p>
                        {/* AI score bar */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-text-tertiary">Skor AI</span>
                            <span className="text-[9px] font-bold text-primary">
                              {(report.aiScore ?? report.predictedPriority ?? 5).toFixed(1)}/10
                            </span>
                          </div>
                          <div className="h-1 bg-surface-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-primary rounded-full transition-all duration-700"
                              style={{ width: `${((report.aiScore ?? 5) / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Category insight — dari data real */}
              <div className="card p-5 bg-gradient-card border-primary/10">
                <h3 className="text-sm font-bold text-text-primary mb-3">Insight Singkat</h3>
                {isLoading ? (
                  <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-2 bg-surface-border rounded mb-1.5" />
                        <div className="h-1.5 bg-surface-border rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {categoryDist.map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-text-secondary">{label}</span>
                          <span className="text-[11px] font-semibold text-text-primary">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Insight — supervisor only */}
              {can('viewDecisionInsight') && !isLoading && (
                <div className="card p-4 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg,rgba(99,102,241,0.07) 0%,rgba(0,113,227,0.07) 100%)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}>
                  <div className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.1),transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s ease-in-out infinite',
                    }} />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                        <Brain size={12} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-text-primary">AI Insight</span>
                      <span className="ml-auto text-[9px] font-bold text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {stats.urgentCount > 0
                        ? <>Terdapat <strong className="text-red-500">{stats.urgentCount} laporan urgent</strong> yang memerlukan penanganan segera. Rata-rata skor AI: <strong className="text-primary">{stats.avgAiScore.toFixed(1)}/10</strong>.</>
                        : 'Tidak ada laporan urgent saat ini. Sistem berjalan normal.'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent reports table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Laporan Terbaru</h3>
              <a href="/reports" className="text-xs font-medium text-primary hover:underline transition-colors">
                Lihat semua →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border bg-surface">
                    {['ID', 'Judul', 'Kategori', 'Status', 'Prioritas', 'Skor AI'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-3 bg-surface-border rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    reports.slice(0, 5).map((r) => (
                      <tr
                        key={r.id}
                        className={`transition-colors cursor-pointer group ${
                          selectedReport?.id === r.id ? 'bg-primary/5' : 'hover:bg-surface/50'
                        }`}
                        onClick={() => handlePriorityItemClick(r)}
                      >
                        <td className="px-5 py-3.5 text-xs font-mono text-text-tertiary">{r.id}</td>
                        <td className="px-5 py-3.5 text-xs font-medium text-text-primary max-w-[180px] truncate group-hover:text-primary transition-colors">
                          {r.title}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-text-secondary">{r.category ?? '—'}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-3.5"><PriorityBadge priority={r.priorityLabel} /></td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold text-primary">
                            {(r.aiScore ?? r.predictedPriority ?? 5).toFixed(1)}
                          </span>
                          <span className="text-[10px] text-text-tertiary">/10</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
