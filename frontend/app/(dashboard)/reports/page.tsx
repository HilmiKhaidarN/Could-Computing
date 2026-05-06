'use client';

import { useState, useMemo } from 'react';
import {
  Search, Plus, MapPin, Calendar, ChevronDown,
  CheckCircle, Clock, XCircle,
} from 'lucide-react';
import type { ApiReport, Priority, ReportStatus, Category } from '@/app/lib/types';
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge';
import { ErrorBanner } from '@/app/components/ui/ErrorBanner';
import { TableRowSkeleton } from '@/app/components/ui/Skeleton';
import { useAuth } from '@/app/hooks/useAuth';
import { useReports } from '@/app/hooks/useReports';

const ALL = 'Semua' as const;
type FilterAll = typeof ALL;

const STATUS_OPTIONS = [
  { value: ALL,       label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'proses',  label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
] as const;

const PRIORITY_OPTIONS = [
  { value: ALL,      label: 'Semua Prioritas' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Rendah' },
] as const;

const STATUS_ACTIONS = [
  { value: 'proses'  as ReportStatus, label: 'Proses',  icon: Clock,         color: 'text-blue-600' },
  { value: 'selesai' as ReportStatus, label: 'Selesai', icon: CheckCircle,   color: 'text-green-600' },
  { value: 'ditolak' as ReportStatus, label: 'Tolak',   icon: XCircle,       color: 'text-red-500' },
];

export default function ReportsPage() {
  const { can } = useAuth();
  const { reports: apiReports, isLoading, isUsingFallback, refresh } = useReports();

  // Local state for optimistic status updates
  const [localReports, setLocalReports] = useState<ApiReport[] | null>(null);
  const reports = localReports ?? apiReports;

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState<ReportStatus | FilterAll>(ALL);
  const [filterPriority, setFilterPriority] = useState<Priority | FilterAll>(ALL);
  const [filterCategory, setFilterCategory] = useState<Category | FilterAll>(ALL);
  const [selected, setSelected]           = useState<ApiReport | null>(null);

  // Sync local when api data changes
  if (!isLoading && localReports === null && apiReports.length > 0) {
    setLocalReports(apiReports);
  }

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(reports.map((r) => r.category).filter(Boolean)))] as (Category | FilterAll)[],
    [reports],
  );

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === '' ||
        r.title.toLowerCase().includes(q) ||
        (r.location ?? '').toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchStatus   = filterStatus   === ALL || r.status        === filterStatus;
      const matchPriority = filterPriority === ALL || r.priorityLabel === filterPriority;
      const matchCategory = filterCategory === ALL || r.category      === filterCategory;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [reports, search, filterStatus, filterPriority, filterCategory]);

  const handleStatusUpdate = (reportId: string, newStatus: ReportStatus) => {
    setLocalReports((prev) =>
      (prev ?? apiReports).map((r) => r.id === reportId ? { ...r, status: newStatus } : r),
    );
    if (selected?.id === reportId) {
      setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const dateDisplay = (r: ApiReport) =>
    r.date ?? new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-surface-border flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Daftar Laporan</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            {isLoading ? 'Memuat data...' : `${reports.length} laporan dari backend`}
          </p>
        </div>
        {can('createReport') && (
          <button className="btn-primary text-xs py-2 px-4 gap-1.5 hover:scale-[1.02] transition-transform">
            <Plus size={13} /> Buat Laporan
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
        {isUsingFallback && <ErrorBanner compact onRetry={refresh} />}

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input type="text" placeholder="Cari laporan, lokasi, ID..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 py-2.5 text-sm" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ReportStatus | FilterAll)}
                className="input-field py-2.5 pr-8 text-sm appearance-none cursor-pointer min-w-[130px]">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            </div>

            {/* Priority filter */}
            <div className="relative">
              <select value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as Priority | FilterAll)}
                className="input-field py-2.5 pr-8 text-sm appearance-none cursor-pointer min-w-[130px]">
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            </div>

            {/* Category filter */}
            <div className="relative">
              <select value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as Category | FilterAll)}
                className="input-field py-2.5 pr-8 text-sm appearance-none cursor-pointer min-w-[150px]">
                {categories.map((c) => (
                  <option key={c} value={c}>{c === ALL ? 'Semua Kategori' : c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            </div>

            <span className="text-xs text-text-tertiary ml-auto">
              {isLoading ? '...' : `${filtered.length} laporan ditemukan`}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border bg-surface">
                  {['ID', 'Judul', 'Kategori', 'Lokasi', 'Prioritas', 'Status', 'Skor AI', 'Tanggal',
                    can('updateStatus') ? 'Aksi' : ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-sm text-text-tertiary">
                      Tidak ada laporan yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}
                      className={`transition-colors cursor-pointer group ${
                        selected?.id === r.id ? 'bg-primary/5' : 'hover:bg-surface/60'
                      }`}
                      onClick={() => setSelected(selected?.id === r.id ? null : r)}>
                      <td className="px-5 py-4 text-xs font-mono text-text-tertiary">{r.id.slice(0, 8)}…</td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {r.title}
                        </p>
                        <p className="text-[10px] text-text-tertiary mt-0.5">{r.createdBy?.name ?? '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-text-secondary whitespace-nowrap">{r.category ?? '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary max-w-[160px]">
                          <MapPin size={11} className="text-text-tertiary flex-shrink-0" />
                          <span className="truncate">{r.location ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><PriorityBadge priority={r.priorityLabel} /></td>
                      <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-primary">
                          {(r.aiScore ?? r.predictedPriority ?? 5).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-text-tertiary">/10</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-tertiary whitespace-nowrap">
                          <Calendar size={11} />
                          {dateDisplay(r)}
                        </div>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {can('updateStatus') && r.status !== 'selesai' && (
                          <div className="flex items-center gap-1">
                            {STATUS_ACTIONS.filter((a) => a.value !== r.status).map(({ value, label, icon: Icon, color }) => (
                              <button key={value}
                                onClick={() => handleStatusUpdate(r.id, value)}
                                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg hover:bg-surface transition-colors ${color}`}
                                title={label}>
                                <Icon size={11} /> {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 border-t border-surface-border bg-surface flex items-center justify-between">
            <p className="text-xs text-text-tertiary">
              Menampilkan {filtered.length} dari {reports.length} laporan
              {isUsingFallback && ' (data lokal)'}
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((p) => (
                <button key={p}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    p === 1 ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-border'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded detail */}
        {selected && (
          <div className="card p-5 animate-slide-up border-primary/20 bg-gradient-card">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">
                  {selected.id}
                </p>
                <h3 className="text-base font-bold text-text-primary">{selected.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={selected.priorityLabel} />
                <StatusBadge status={selected.status} />
                <span className="text-xs font-bold text-primary">
                  AI: {(selected.aiScore ?? 5).toFixed(1)}/10
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {selected.description ?? 'Tidak ada deskripsi.'}
                </p>
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs text-text-tertiary flex items-center gap-2">
                    <MapPin size={12} /> {selected.location ?? '—'}
                  </p>
                  <p className="text-xs text-text-tertiary flex items-center gap-2">
                    <Calendar size={12} /> {dateDisplay(selected)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Sumber skor: {selected.scoreSource === 'ml-model' ? '🤖 ML Model' : '⚡ Rule-based'}
                  </p>
                </div>
              </div>
              {selected.image && (
                <img src={selected.image} alt={selected.title}
                  className="w-full h-32 object-cover rounded-xl" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
