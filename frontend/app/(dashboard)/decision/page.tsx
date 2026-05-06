'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { useReports } from '@/app/hooks/useReports';
import { PriorityBadge } from '@/app/components/ui/Badge';
import { ErrorBanner } from '@/app/components/ui/ErrorBanner';

interface ScoreBarProps {
  label: string;
  value: number;
  color: string;
  max?: number;
}

function ScoreBar({ label, value, color, max = 10 }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-text-secondary w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-bold text-text-primary w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

export default function DecisionPage() {
  const router = useRouter();
  const { can, isLoading: authLoading } = useAuth();
  const { reports, isLoading, isUsingFallback, refresh } = useReports();

  // Calculate scored reports from real data
  const scoredReports = useMemo(() => {
    return reports
      .filter((r) => r.aiScore && r.aiScore > 0)
      .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
      .map((r) => ({
        ...r,
        score: {
          total: r.aiScore ?? 0,
          severity: r.severity ?? 0,
          frequency: r.frequency ?? 0,
          recency: r.recency ?? 0,
          reason: r.scoreSource === 'ml-model' 
            ? `Laporan ini diprioritaskan berdasarkan analisis ML Model dengan skor ${(r.aiScore ?? 0).toFixed(1)}/10. Faktor utama: severity ${(r.severity ?? 0).toFixed(1)}, frequency ${(r.frequency ?? 0).toFixed(1)}, recency ${(r.recency ?? 0).toFixed(1)}.`
            : `Laporan ini dinilai menggunakan rule-based system dengan skor ${(r.aiScore ?? 0).toFixed(1)}/10 berdasarkan kategori dan status laporan.`,
        },
      }));
  }, [reports]);

  useEffect(() => {
    if (!authLoading && !can('viewDecisionInsight')) {
      router.replace('/dashboard');
    }
  }, [authLoading, can, router]);

  if (authLoading) return null;
  if (!can('viewDecisionInsight')) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-surface-border flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-sm">
          <Brain size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary">Decision Insight</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Sistem keputusan prioritas berbasis AI — Severity, Frequency, Recency
          </p>
        </div>
        <span className="ml-auto text-[10px] font-semibold text-accent-purple bg-accent-purple/10 px-3 py-1 rounded-full">
          Supervisor Only
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
        {isUsingFallback && <ErrorBanner compact onRetry={refresh} />}

        {/* Methodology card */}
        <div
          className="card p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,rgba(99,102,241,0.07) 0%,rgba(0,113,227,0.07) 100%)',
            border: '1px solid rgba(99,102,241,0.18)',
          }}
        >
          {/* shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.1),transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-accent-purple" />
              <h3 className="text-sm font-bold text-text-primary">Metodologi Penilaian SFR</h3>
              <span className="ml-auto text-[10px] font-bold text-accent-purple bg-accent-purple/10 px-2.5 py-1 rounded-full border border-accent-purple/20">
                AI-Powered
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Severity', desc: 'Tingkat keparahan dampak terhadap warga dan infrastruktur', color: '#FF3B30', weight: '40%' },
                { label: 'Frequency', desc: 'Seberapa sering masalah dilaporkan dalam periode tertentu', color: '#FF9500', weight: '35%' },
                { label: 'Recency', desc: 'Seberapa baru laporan masuk — laporan terbaru lebih diprioritaskan', color: '#0071E3', weight: '25%' },
              ].map(({ label, desc, color, weight }) => (
                <div key={label} className="p-3.5 rounded-xl bg-white border border-surface-border hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color }}>{label}</span>
                    <span className="text-[10px] font-bold text-text-tertiary bg-surface px-2 py-0.5 rounded-full">
                      Bobot {weight}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-border rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: weight,
                        background: `linear-gradient(90deg,${color}88,${color})`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scored reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Rekomendasi Prioritas Penanganan</h3>
            <span className="text-xs text-text-tertiary">
              {isLoading ? 'Memuat...' : `${scoredReports.length} laporan dengan skor AI`}
            </span>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-5 h-48 animate-pulse bg-surface" />
              ))}
            </div>
          ) : scoredReports.length === 0 ? (
            <div className="card p-8 text-center">
              <Brain size={32} className="text-text-tertiary mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Belum ada laporan dengan skor AI</p>
              <p className="text-xs text-text-tertiary mt-1">Laporan akan muncul setelah diproses oleh sistem</p>
            </div>
          ) : (
            scoredReports.map((report, index) => (
            <div
              key={report.id}
              className="card p-5 hover:shadow-apple-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700'
                    : index === 1 ? 'bg-gray-100 text-gray-600'
                    : index === 2 ? 'bg-orange-100 text-orange-700'
                    : 'bg-surface text-text-tertiary'
                  }`}
                >
                  #{index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{report.title}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">📍 {report.location}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={report.priority} />
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary leading-none">
                          {report.score!.total.toFixed(1)}
                        </p>
                        <p className="text-[9px] text-text-tertiary">/ 10</p>
                      </div>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="space-y-2 mb-3">
                    <ScoreBar label="Severity" value={report.score!.severity} color="#FF3B30" />
                    <ScoreBar label="Frequency" value={report.score!.frequency} color="#FF9500" />
                    <ScoreBar label="Recency" value={report.score!.recency} color="#0071E3" />
                  </div>

                  {/* AI reason */}
                  <div
                    className="flex items-start gap-2 p-3 rounded-xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg,rgba(99,102,241,0.07),rgba(0,113,227,0.07))',
                      border: '1px solid rgba(99,102,241,0.15)',
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none opacity-60"
                      style={{
                        background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.1),transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 3s ease-in-out infinite',
                      }}
                    />
                    <Brain size={12} className="text-accent-purple flex-shrink-0 mt-0.5 relative" />
                    <p className="text-[11px] text-text-secondary leading-relaxed relative">
                      {report.score!.reason}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}
