'use client';

import { X, MapPin, Calendar, User, Tag, Crosshair, Brain, Sparkles, Cpu, Zap } from 'lucide-react';
import type { ApiReport } from '@/app/lib/types';
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge';
import { can } from '@/app/lib/auth';

interface ReportDetailPanelProps {
  report: ApiReport | null;
  onClose: () => void;
  onFocusMap?: () => void;
}

interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
  description: string;
}

function ScoreBar({ label, value, color, description }: ScoreBarProps) {
  const pct = (value / 10) * 100;
  const level = value >= 8 ? 'Tinggi' : value >= 5 ? 'Sedang' : 'Rendah';
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-text-secondary">{label}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: `${color}18`, color }}>
            {level}
          </span>
        </div>
        <span className="text-[11px] font-bold text-text-primary">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-surface-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}cc,${color})` }} />
      </div>
      <p className="text-[9px] text-text-tertiary mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {description}
      </p>
    </div>
  );
}

const SCORE_META: Record<string, { color: string; description: string }> = {
  Severity:  { color: '#FF3B30', description: 'Tingkat keparahan dampak terhadap warga' },
  Frequency: { color: '#FF9500', description: 'Frekuensi laporan dalam 30 hari terakhir' },
  Recency:   { color: '#0071E3', description: 'Seberapa baru laporan ini masuk' },
};

export function ReportDetailPanel({ report, onClose, onFocusMap }: ReportDetailPanelProps) {
  if (!report) return null;

  const showAiInsight = can('viewDecisionInsight') || can('viewAnalytics');

  // Normalise date display
  const dateDisplay = report.date ?? new Date(report.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const reporterDisplay = report.reporter ?? report.createdBy?.name ?? '—';
  const locationDisplay = report.location ?? '—';
  const categoryDisplay = report.category ?? '—';

  // Source badge
  const isMLModel = report.scoreSource === 'ml-model';

  return (
    <div className="absolute top-4 right-4 w-[300px] z-[1000] animate-slide-in-right">
      <div className="overflow-hidden shadow-apple-lg"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '1.25rem',
          border: '1px solid rgba(229,229,234,0.8)',
        }}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-border/60 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">
              {report.id}
            </p>
            <h3 className="text-sm font-bold text-text-primary leading-snug">{report.title}</h3>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface text-text-tertiary hover:text-text-primary transition-all duration-150 hover:scale-110 flex-shrink-0"
            aria-label="Tutup panel">
            <X size={14} />
          </button>
        </div>

        {/* Image */}
        {report.image && (
          <div className="relative h-32 bg-surface overflow-hidden">
            <img src={report.image} alt={report.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3">
              <PriorityBadge priority={report.priorityLabel} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-5 py-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
          {/* Badges */}
          {!report.image && (
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={report.priorityLabel} />
              <StatusBadge status={report.status} />
            </div>
          )}
          {report.image && (
            <div className="flex items-center gap-2">
              <StatusBadge status={report.status} />
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-text-secondary leading-relaxed">
            {report.description ?? 'Tidak ada deskripsi.'}
          </p>

          {/* Meta */}
          <div className="space-y-2 pt-0.5">
            {[
              { icon: MapPin,   text: locationDisplay },
              { icon: Tag,      text: categoryDisplay },
              { icon: User,     text: reporterDisplay },
              { icon: Calendar, text: dateDisplay },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2.5">
                <Icon size={12} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                <span className="text-xs text-text-secondary leading-snug">{text}</span>
              </div>
            ))}
          </div>

          {/* ── AI Score section ─────────────────────────────────────────────── */}
          {showAiInsight && (
            <div className="pt-3 border-t border-surface-border/60">
              {/* AI header + source badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                  <Brain size={12} className="text-white" />
                </div>
                <span className="text-xs font-bold text-text-primary">AI Priority Score</span>

                {/* Source indicator */}
                <div className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  isMLModel
                    ? 'bg-primary/10 text-primary'
                    : 'bg-orange-50 text-orange-600'
                }`}>
                  {isMLModel
                    ? <><Cpu size={9} /> ML Model</>
                    : <><Zap size={9} /> Rule-based</>
                  }
                </div>
              </div>

              {/* Big score */}
              <div className="flex items-end gap-1 mb-3">
                <span className="text-3xl font-black text-primary leading-none">
                  {(report.aiScore ?? report.predictedPriority ?? 5).toFixed(1)}
                </span>
                <span className="text-xs text-text-tertiary mb-1">/10</span>
              </div>

              {/* Score bars — hanya jika ada data SFR */}
              {(report.severity !== undefined || report.frequency !== undefined || report.recency !== undefined) && (
                <div className="space-y-2.5 mb-3">
                  {([
                    ['Severity',  report.severity  ?? 5],
                    ['Frequency', report.frequency ?? 5],
                    ['Recency',   report.recency   ?? 5],
                  ] as [string, number][]).map(([key, val]) => (
                    <ScoreBar key={key} label={key} value={val}
                      color={SCORE_META[key].color}
                      description={SCORE_META[key].description} />
                  ))}
                </div>
              )}

              {/* Source explanation */}
              <div className="p-3 rounded-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(0,113,227,0.07))',
                  border: '1px solid rgba(99,102,241,0.15)',
                }}>
                <div className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg,transparent 0%,rgba(99,102,241,0.12) 50%,transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }} />
                <div className="relative flex items-start gap-2">
                  <Sparkles size={11} className="text-accent-purple flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    {isMLModel
                      ? `Skor dihitung oleh model Linear Regression (R²=0.9998) berdasarkan severity, frequency, dan recency laporan ini.`
                      : `Skor dihitung menggunakan weighted average (Severity 40%, Frequency 35%, Recency 25%) karena ML service sedang tidak tersedia.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-surface-border/60 flex gap-2"
          style={{ background: 'rgba(245,245,247,0.6)' }}>
          {onFocusMap && (
            <button onClick={onFocusMap}
              className="btn-secondary text-xs py-2 px-3 gap-1.5 flex-shrink-0 hover:scale-[1.03]">
              <Crosshair size={12} />
              Fokus
            </button>
          )}
          <button className="btn-primary text-xs py-2 flex-1 hover:scale-[1.02]">
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
}
