'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Award, BarChart3, Brain, AlertTriangle } from 'lucide-react';
import { CATEGORY_COLORS } from '@/app/lib/data';
import { useAuth } from '@/app/hooks/useAuth';
import { useReports } from '@/app/hooks/useReports';
import { ErrorBanner } from '@/app/components/ui/ErrorBanner';
import { StatCardSkeleton } from '@/app/components/ui/Skeleton';

interface TooltipPayloadItem { name: string; value: number; color: string; }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayloadItem[]; label?: string; }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-4 py-3 shadow-apple-md text-xs">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-semibold text-text-primary">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { can, isLoading: authLoading } = useAuth();
  const { reports, isLoading, isUsingFallback, refresh, stats } = useReports();

  // Calculate all derived data BEFORE any early returns
  const completionRate = stats.totalReports > 0
    ? Math.round((stats.completedCount / stats.totalReports) * 100)
    : 0;

  // Category distribution dari data real
  const categoryDist = useMemo(() => {
    const counts = reports.reduce<Record<string, number>>((acc, r) => {
      const cat = r.category ?? 'Lainnya';
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {});
    const total = reports.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[name] ?? '#AEAEB2',
      }));
  }, [reports]);

  // Priority ranking dari data real (sorted by aiScore)
  const priorityRanking = useMemo(() =>
    [...reports]
      .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
      .slice(0, 5)
      .map((r, i) => ({
        rank: i + 1,
        title: r.title,
        location: r.location ?? '—',
        score: r.aiScore ?? r.predictedPriority ?? 5,
        source: r.scoreSource,
      })),
    [reports],
  );

  // Priority distribution dari data real
  const priorityDist = useMemo(() => {
    const counts = reports.reduce<Record<string, number>>((acc, r) => {
      const priority = r.priorityLabel || 'unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});
    
    const priorityOrder = ['urgent', 'medium', 'low'];
    const priorityColors: Record<string, string> = {
      urgent: '#FF3B30',
      medium: '#FF9500',
      low: '#34C759',
    };
    const priorityLabels: Record<string, string> = {
      urgent: 'Urgent',
      medium: 'Medium',
      low: 'Rendah',
    };

    return priorityOrder
      .filter(p => counts[p] > 0)
      .map(priority => ({
        name: priorityLabels[priority] || priority,
        value: counts[priority] || 0,
        color: priorityColors[priority] || '#AEAEB2',
      }));
  }, [reports]);

  // AI insights dari data real
  const topCategory = categoryDist[0];
  const urgentPct = stats.totalReports > 0
    ? Math.round((stats.urgentCount / stats.totalReports) * 100)
    : 0;

  const aiInsights = [
    {
      icon: TrendingUp,
      title: 'Kategori Dominan',
      text: topCategory
        ? `${topCategory.name} mendominasi ${topCategory.value}% dari total ${stats.totalReports} laporan. Perlu perhatian khusus pada kategori ini.`
        : 'Belum ada data laporan.',
      color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100',
    },
    {
      icon: AlertTriangle,
      title: 'Laporan Urgent',
      text: `${stats.urgentCount} laporan (${urgentPct}%) berstatus urgent dan memerlukan penanganan segera. Rata-rata skor AI: ${stats.avgAiScore.toFixed(1)}/10.`,
      color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
    },
    {
      icon: TrendingDown,
      title: 'Tingkat Penyelesaian',
      text: `${stats.completedCount} laporan (${completionRate}%) telah diselesaikan. Sumber skor: ${reports.filter(r => r.scoreSource === 'ml-model').length} dari ML Model, ${reports.filter(r => r.scoreSource === 'rule-based').length} dari Rule-based.`,
      color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100',
    },
  ];

  // Check auth AFTER all hooks
  useEffect(() => {
    if (!authLoading && !can('viewAnalytics')) router.replace('/dashboard');
  }, [authLoading, can, router]);

  // Early returns AFTER all hooks
  if (authLoading) return null;
  if (!can('viewAnalytics')) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 bg-white border-b border-surface-border flex-shrink-0">
        <h1 className="text-lg font-bold text-text-primary">Analitik</h1>
        <p className="text-xs text-text-tertiary mt-0.5">Ringkasan data dan tren laporan infrastruktur</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
        {isUsingFallback && <ErrorBanner compact onRetry={refresh} />}

        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            [
              { label: 'Total Laporan', value: stats.totalReports, sub: 'Dari backend', icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10', trend: `${stats.totalReports}`, up: true },
              { label: 'Tingkat Penyelesaian', value: `${completionRate}%`, sub: 'Laporan selesai', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: `${stats.completedCount} selesai`, up: true },
              { label: 'Laporan Urgent', value: stats.urgentCount, sub: 'Perlu perhatian', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50', trend: `${urgentPct}%`, up: false },
              { label: 'Rata-rata Skor AI', value: stats.avgAiScore.toFixed(1), sub: 'Prioritas sistem', icon: Award, color: 'text-accent-purple', bg: 'bg-accent-purple/10', trend: '/10', up: true },
            ].map(({ label, value, sub, icon: Icon, color, bg, trend, up }) => (
              <div key={label} className="card p-5 hover:shadow-apple-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className={`text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>{trend}</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
                <p className="text-xs font-medium text-text-secondary mt-0.5">{label}</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>
              </div>
            ))
          )}
        </div>

        {/* AI Insights banner */}
        <div className="card p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,rgba(99,102,241,0.06) 0%,rgba(0,113,227,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.18)',
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.08),transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3.5s ease-in-out infinite',
            }} />
          <div className="relative">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}>
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary leading-none">AI Insight Otomatis</h3>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  {isLoading ? 'Memuat data...' : `Dianalisis dari ${stats.totalReports} laporan aktual`}
                </p>
              </div>
              <span className="ml-auto text-[10px] font-bold text-accent-purple bg-accent-purple/10 px-2.5 py-1 rounded-full border border-accent-purple/20">
                {isUsingFallback ? 'Data Lokal' : 'Live Data'}
              </span>
            </div>
            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-3">
                {aiInsights.map(({ icon: Icon, title, text, color, bg, border }) => (
                  <div key={title}
                    className={`flex flex-col gap-2 p-3.5 rounded-xl ${bg} border ${border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm`}>
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={`${color} flex-shrink-0`} />
                      <span className={`text-[11px] font-bold ${color}`}>{title}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Distribusi Prioritas Laporan</h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {isLoading ? 'Memuat...' : `Dari ${stats.totalReports} laporan aktual`}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-red-500 inline-block" />
                  <span className="text-text-secondary">Urgent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-orange-400 inline-block" />
                  <span className="text-text-secondary">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-text-secondary">Rendah</span>
                </div>
              </div>
            </div>
            {isLoading ? (
              <div className="h-[220px] bg-surface rounded-xl animate-pulse" />
            ) : priorityDist.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-text-tertiary">Belum ada data laporan</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityDist} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#AEAEB2' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#AEAEB2' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Jumlah Laporan" radius={[8, 8, 0, 0]}>
                    {priorityDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart — dari data real */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-text-primary mb-1">Laporan per Kategori</h3>
            <p className="text-xs text-text-tertiary mb-4">
              {isLoading ? 'Memuat...' : `${stats.totalReports} laporan aktual`}
            </p>
            {isLoading ? (
              <div className="h-40 bg-surface rounded-xl animate-pulse" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {categoryDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, '']} contentStyle={{ borderRadius: 12, border: '1px solid #E5E5EA', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {categoryDist.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-[11px] text-text-secondary">{name}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-text-primary">{value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid xl:grid-cols-2 gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-bold text-text-primary mb-1">Volume per Kategori</h3>
            <p className="text-xs text-text-tertiary mb-4">Dari data aktual backend</p>
            {isLoading ? (
              <div className="h-48 bg-surface rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryDist} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#AEAEB2' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#AEAEB2' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Persentase" radius={[6, 6, 0, 0]}>
                    {categoryDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Priority ranking — dari data real */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-text-primary">Ranking Prioritas AI</h3>
              <div className="w-5 h-5 rounded-lg bg-gradient-accent flex items-center justify-center ml-auto">
                <Brain size={11} className="text-white" />
              </div>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {priorityRanking.map(({ rank, title, location, score, source }) => (
                  <div key={rank} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface transition-colors group">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      rank === 1 ? 'bg-yellow-100 text-yellow-700'
                      : rank === 2 ? 'bg-gray-100 text-gray-600'
                      : rank === 3 ? 'bg-orange-100 text-orange-700'
                      : 'bg-surface text-text-tertiary'
                    }`}>
                      {rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{title}</p>
                      <p className="text-[10px] text-text-tertiary truncate">{location}</p>
                      <p className="text-[10px] text-accent-purple mt-0.5">
                        {source === 'ml-model' ? '🤖 ML Model' : '⚡ Rule-based'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary">{score.toFixed(1)}</p>
                      <p className="text-[9px] text-text-tertiary">skor AI</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
