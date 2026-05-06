/**
 * data.ts — Static reference data & chart constants.
 *
 * All data comes from backend API.
 * This file only contains static reference data like colors and categories.
 */

export type Priority = 'urgent' | 'medium' | 'low';
export type ReportStatus = 'pending' | 'proses' | 'selesai' | 'ditolak';
export type Category =
  | 'Jalan Rusak'
  | 'Lampu Mati'
  | 'Sampah'
  | 'Banjir'
  | 'Fasilitas Umum'
  | 'Drainase';

export interface PriorityScore {
  severity: number;
  frequency: number;
  recency: number;
  total: number;
  reason: string;
}

export interface Report {
  id: string;
  title: string;
  category: Category;
  status: ReportStatus;
  priority: Priority;
  location: string;
  lat: number;
  lng: number;
  description: string;
  reporter: string;
  date: string;
  image?: string;
  score?: PriorityScore;
}

// ─── No dummy data - all data comes from backend API ──

export const reports: Report[] = [];

// ─── Static chart data (tidak berubah, digunakan analytics) ──────────────────

export const monthlyData = [
  { month: 'Jan', laporan: 95,  selesai: 72  },
  { month: 'Feb', laporan: 110, selesai: 88  },
  { month: 'Mar', laporan: 128, selesai: 95  },
  { month: 'Apr', laporan: 142, selesai: 110 },
  { month: 'Mei', laporan: 165, selesai: 130 },
  { month: 'Jun', laporan: 138, selesai: 115 },
  { month: 'Jul', laporan: 152, selesai: 128 },
  { month: 'Agu', laporan: 178, selesai: 145 },
  { month: 'Sep', laporan: 195, selesai: 162 },
  { month: 'Okt', laporan: 210, selesai: 178 },
  { month: 'Nov', laporan: 188, selesai: 155 },
  { month: 'Des', laporan: 220, selesai: 190 },
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Jalan Rusak':    '#0071E3',
  'Lampu Mati':     '#6366F1',
  'Sampah':         '#8B5CF6',
  'Banjir':         '#FF9500',
  'Fasilitas Umum': '#34C759',
  'Drainase':       '#FF3B30',
};
