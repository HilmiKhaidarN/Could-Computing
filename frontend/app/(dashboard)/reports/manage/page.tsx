'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Filter,
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge';
import { useAuth } from '@/app/hooks/useAuth';
import { useReports } from '@/app/hooks/useReports';
import type { ApiReport } from '@/app/lib/types';

const ALL = 'Semua' as const;
type ReportStatus = ApiReport['status'];
type Priority = ApiReport['priorityLabel'];

interface StatusAction {
  value: ReportStatus;
  label: string;
  icon: React.ElementType;
  className: string;
}

const STATUS_ACTIONS: StatusAction[] = [
  { value: 'processing', label: 'Proses', icon: Clock, className: 'text-blue-600 hover:bg-blue-50' },
  { value: 'completed', label: 'Selesai', icon: CheckCircle, className: 'text-green-600 hover:bg-green-50' },
  { value: 'failed', label: 'Tolak', icon: XCircle, className: 'text-red-500 hover:bg-red-50' },
];

interface EditModalProps {
  report: ApiReport;
  onSave: (updated: Partial<ApiReport>) => void;
  onClose: () => void;
}

function EditModal({ report, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(report.title);
  const [description, setDescription] = useState(report.description || '');
  const [location, setLocation] = useState(report.location || '');

  const handleSave = () => {
    onSave({ title, description, location });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="card w-full max-w-lg shadow-apple-lg animate-slide-up">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">Edit Laporan</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface text-text-tertiary hover:text-text-primary transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Judul</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Lokasi</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-surface-border flex gap-3">
          <button onClick={onClose} className="btn-secondary text-sm flex-shrink-0">Batal</button>
          <button onClick={handleSave} className="btn-primary text-sm flex-1 gap-2">
            <Save size={14} /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageReportsPage() {
  const router = useRouter();
  const { can, isLoading: authLoading } = useAuth();
  const { reports: reportList, isLoading } = useReports();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | typeof ALL>(ALL);
  const [filterPriority, setFilterPriority] = useState<Priority | typeof ALL>(ALL);
  const [editingReport, setEditingReport] = useState<ApiReport | null>(null);

  // Role guard
  useEffect(() => {
    if (!authLoading && !can('editReport')) {
      router.replace('/dashboard');
    }
  }, [authLoading, can, router]);

  const filtered = useMemo(() => {
    return reportList.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === '' ||
        r.title.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        r.id.toLowerCase().includes(q);
      const matchStatus = filterStatus === ALL || r.status === filterStatus;
      const matchPriority = filterPriority === ALL || r.priorityLabel === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [reportList, search, filterStatus, filterPriority]);

  const handleStatusUpdate = (id: string, status: ReportStatus) => {
    // TODO: Call backend API to update status
    console.log('Update status:', id, status);
    alert(`Status update untuk ${id} → ${status} (belum terimplementasi di backend)`);
  };

  const handleEdit = (updated: Partial<ApiReport>) => {
    // TODO: Call backend API to update report
    console.log('Update report:', editingReport?.id, updated);
    alert(`Edit laporan ${editingReport?.id} (belum terimplementasi di backend)`);
    setEditingReport(null);
  };

  // Stats
  const pendingCount = reportList.filter((r) => r.status === 'pending').length;
  const prosesCount = reportList.filter((r) => r.status === 'processing').length;
  const selesaiCount = reportList.filter((r) => r.status === 'completed').length;

  if (authLoading || isLoading) return null;
  if (!can('editReport')) return null;

  return (
    <>
      {editingReport && (
        <EditModal
          report={editingReport}
          onSave={handleEdit}
          onClose={() => setEditingReport(null)}
        />
      )}

      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-surface-border flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-text-primary">Kelola Laporan</h1>
            <p className="text-xs text-text-tertiary mt-0.5">
              Update status dan edit laporan infrastruktur
            </p>
          </div>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Admin Only
          </span>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', value: pendingCount, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Diproses', value: prosesCount, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Selesai', value: selesaiCount, color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`card p-4 text-center ${bg} border-0`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-text-secondary mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Cari laporan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-9 py-2.5 text-sm"
                />
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ReportStatus | typeof ALL)}
                  className="input-field py-2.5 pr-8 text-sm appearance-none cursor-pointer min-w-[130px]"
                >
                  <option value={ALL}>Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Diproses</option>
                  <option value="completed">Selesai</option>
                  <option value="failed">Ditolak</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as Priority | typeof ALL)}
                  className="input-field py-2.5 pr-8 text-sm appearance-none cursor-pointer min-w-[130px]"
                >
                  <option value={ALL}>Semua Prioritas</option>
                  <option value="urgent">Urgent</option>
                  <option value="medium">Medium</option>
                  <option value="low">Rendah</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>

              <span className="text-xs text-text-tertiary ml-auto">
                {filtered.length} laporan
              </span>
            </div>
          </div>

          {/* Report cards */}
          <div className="space-y-3">
            {filtered.map((report) => (
              <div
                key={report.id}
                className="card p-5 hover:shadow-apple-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-text-tertiary">{report.id}</span>
                      <PriorityBadge priority={report.priorityLabel} />
                      <StatusBadge status={report.status} />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary mb-1">{report.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">{report.description || 'Tidak ada deskripsi'}</p>
                    <div className="flex items-center gap-4 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {report.location || 'Tidak ada lokasi'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {new Date(report.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {/* Edit button */}
                    <button
                      onClick={() => setEditingReport(report)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-surface-border hover:border-primary/40 hover:bg-primary/5 text-text-secondary hover:text-primary transition-all duration-200"
                    >
                      <Edit3 size={12} /> Edit
                    </button>

                    {/* Status actions */}
                    {report.status !== 'completed' && (
                      <div className="flex flex-col gap-1">
                        {STATUS_ACTIONS.filter((a) => a.value !== report.status).map(
                          ({ value, label, icon: Icon, className }) => (
                            <button
                              key={value}
                              onClick={() => handleStatusUpdate(report.id, value)}
                              className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors ${className}`}
                            >
                              <Icon size={11} /> {label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="card p-12 text-center">
                <Filter size={24} className="text-text-tertiary mx-auto mb-3" />
                <p className="text-sm font-semibold text-text-primary mb-1">Tidak ada laporan</p>
                <p className="text-xs text-text-tertiary">Coba ubah filter pencarian.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
