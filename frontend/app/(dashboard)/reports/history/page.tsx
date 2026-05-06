'use client';

import { useState } from 'react';
import { MapPin, Calendar, Search, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useReports } from '@/app/hooks/useReports';
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge';
import type { ApiReport } from '@/app/lib/types';

// Simulate: user "Warga Bandung" (id: '3') owns RPT-001, RPT-003, RPT-005
// Now using real data from backend filtered by current user

const STATUS_STEPS = ['pending', 'processing', 'completed'] as const;
const STATUS_STEP_LABELS: Record<string, string> = {
  pending: 'Diterima',
  processing: 'Diproses',
  completed: 'Selesai',
  failed: 'Ditolak',
};

interface ProgressTrackerProps {
  status: ApiReport['status'];
}

function ProgressTracker({ status }: ProgressTrackerProps) {
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
          ✕ Laporan Ditolak
        </span>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number]);

  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentStep;
        const active = i === currentStep;
        return (
          <div key={step} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                  done
                    ? active
                      ? 'bg-primary text-white ring-2 ring-primary/30'
                      : 'bg-green-500 text-white'
                    : 'bg-surface-border text-text-tertiary'
                }`}
              >
                {done && !active ? '✓' : i + 1}
              </div>
              <span
                className={`text-[9px] mt-1 font-medium ${
                  done ? (active ? 'text-primary' : 'text-green-600') : 'text-text-tertiary'
                }`}
              >
                {STATUS_STEP_LABELS[step]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mb-4 rounded-full transition-all duration-500 ${
                  i < currentStep ? 'bg-green-400' : 'bg-surface-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ReportHistoryPage() {
  const { user } = useAuth();
  const { reports, isLoading } = useReports();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApiReport | null>(null);

  // Filter reports by current user (createdById)
  const myReports = reports.filter((r) => r.createdById === user?.id);

  const filtered = myReports.filter((r) => {
    const q = search.toLowerCase();
    return (
      q === '' ||
      r.title.toLowerCase().includes(q) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      r.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-surface-border flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Riwayat Laporan Saya</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Pantau status laporan yang pernah Anda buat
          </p>
        </div>
        <Link href="/reports/create" className="btn-primary text-xs py-2 px-4 gap-1.5">
          <Plus size={13} />
          Buat Laporan
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-4 h-20 animate-pulse bg-surface" />
            ))
          ) : (
            [
              { label: 'Total Laporan', value: myReports.length, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Sedang Diproses', value: myReports.filter((r) => r.status === 'processing').length, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Selesai', value: myReports.filter((r) => r.status === 'completed').length, color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="card p-4 text-center hover:shadow-apple-md transition-all duration-200">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-text-secondary mt-1">{label}</p>
              </div>
            ))
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Cari laporan Anda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Report cards */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 h-32 animate-pulse bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4">
              <Search size={20} className="text-text-tertiary" />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1">Tidak ada laporan</p>
            <p className="text-xs text-text-tertiary mb-4">
              {search ? 'Tidak ada laporan yang cocok dengan pencarian.' : 'Anda belum membuat laporan apapun.'}
            </p>
            <Link href="/reports/create" className="btn-primary text-xs py-2 px-4 gap-1.5 inline-flex">
              <Plus size={13} /> Buat Laporan Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((report) => (
              <div
                key={report.id}
                className={`card p-5 transition-all duration-200 hover:shadow-apple-md hover:-translate-y-0.5 cursor-pointer ${
                  selected?.id === report.id ? 'border-primary/30 shadow-apple' : ''
                }`}
                onClick={() => setSelected(selected?.id === report.id ? null : report)}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-text-tertiary">{report.id}</span>
                      <PriorityBadge priority={report.priority} />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary leading-snug">{report.title}</h3>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-[11px] text-text-tertiary mb-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {report.location || 'Tidak ada lokasi'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {new Date(report.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {/* Progress tracker */}
                <ProgressTracker status={report.status} />

                {/* Expanded detail */}
                {selected?.id === report.id && (
                  <div className="mt-4 pt-4 border-t border-surface-border animate-fade-in">
                    <p className="text-xs text-text-secondary leading-relaxed mb-3">
                      {report.description || 'Tidak ada deskripsi'}
                    </p>
                    {report.fileUrl && (
                      <img
                        src={report.fileUrl}
                        alt={report.title}
                        className="w-full h-36 object-cover rounded-xl mb-3"
                      />
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                      <span className="font-semibold text-text-secondary">Kategori:</span>
                      {report.category || 'Tidak ada kategori'}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="btn-secondary text-xs py-2 px-3 gap-1.5">
                        <Eye size={12} /> Lihat di Peta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
