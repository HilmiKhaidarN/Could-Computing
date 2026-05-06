/**
 * Tipe data yang mencerminkan response dari backend NestJS.
 * Field AI (predictedPriority, aiScore, dll) berasal dari integrasi ML service.
 */

export type Priority = 'urgent' | 'medium' | 'low';
export type ReportStatus = 'pending' | 'proses' | 'selesai' | 'ditolak';
export type ScoreSource = 'ml-model' | 'rule-based';
export type Category =
  | 'Jalan Rusak'
  | 'Lampu Mati'
  | 'Sampah'
  | 'Banjir'
  | 'Fasilitas Umum'
  | 'Drainase';

/** Skor prioritas dari ML service atau rule-based fallback */
export interface AiScore {
  predictedPriority: number;
  aiScore: number;
  priorityLabel: Priority;
  scoreSource: ScoreSource;
}

/** Laporan dari backend — sudah di-enrich dengan AI score */
export interface ApiReport extends AiScore {
  id: string;
  title: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  // Field tambahan yang mungkin ada di data (dari frontend dummy atau future backend)
  category?: Category;
  location?: string;
  lat?: number;
  lng?: number;
  reporter?: string;
  date?: string;
  image?: string;
  severity?: number;
  frequency?: number;
  recency?: number;
}

/** Stats ringkasan untuk dashboard */
export interface DashboardStats {
  totalReports: number;
  urgentCount: number;
  completedCount: number;
  avgAiScore: number;
}

/** State generik untuk data fetching */
export interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
