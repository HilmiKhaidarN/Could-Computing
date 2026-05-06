/**
 * data.ts — Static reference data & chart constants.
 *
 * Dummy laporan dipertahankan HANYA sebagai fallback ketika backend tidak tersedia.
 * Semua komponen seharusnya menggunakan useReports() hook yang fetch dari API.
 * Import langsung dari file ini hanya untuk fallback di useReports.ts.
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

// ─── Fallback dummy data (digunakan oleh useReports jika API tidak tersedia) ──

export const reports: Report[] = [
  {
    id: 'RPT-001',
    title: 'Jalan Berlubang Besar',
    category: 'Jalan Rusak',
    status: 'pending',
    priority: 'urgent',
    location: 'Jl. Merdeka No. 12, Bandung',
    lat: -6.9175,
    lng: 107.6191,
    description: 'Terdapat lubang besar di tengah jalan dengan diameter ±1 meter dan kedalaman 30cm.',
    reporter: 'Budi Santoso',
    date: '12 Mei 2025',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
    score: { severity: 9.5, frequency: 8.8, recency: 9.2, total: 9.2, reason: 'Severity tinggi, dilaporkan baru-baru ini.' },
  },
  {
    id: 'RPT-002',
    title: 'Lampu Jalan Padam',
    category: 'Lampu Mati',
    status: 'proses',
    priority: 'medium',
    location: 'Jl. Sudirman No. 45, Bandung',
    lat: -6.9044,
    lng: 107.6129,
    description: '5 titik lampu jalan tidak menyala sejak 3 hari lalu.',
    reporter: 'Siti Rahayu',
    date: '11 Mei 2025',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    score: { severity: 6.5, frequency: 5.2, recency: 7.0, total: 6.2, reason: 'Dampak keamanan cukup signifikan.' },
  },
  {
    id: 'RPT-003',
    title: 'Tumpukan Sampah Liar',
    category: 'Sampah',
    status: 'pending',
    priority: 'medium',
    location: 'Jl. Gatot Subroto, Bandung',
    lat: -6.9248,
    lng: 107.6072,
    description: 'Tumpukan sampah liar di pinggir jalan sudah menumpuk selama 1 minggu.',
    reporter: 'Ahmad Fauzi',
    date: '10 Mei 2025',
    score: { severity: 5.5, frequency: 7.0, recency: 6.5, total: 6.3, reason: 'Frekuensi keluhan meningkat 20% minggu ini.' },
  },
  {
    id: 'RPT-004',
    title: 'Drainase Tersumbat',
    category: 'Drainase',
    status: 'proses',
    priority: 'urgent',
    location: 'Jl. Asia Afrika No. 8, Bandung',
    lat: -6.9218,
    lng: 107.6069,
    description: 'Saluran drainase tersumbat menyebabkan genangan air saat hujan.',
    reporter: 'Dewi Kusuma',
    date: '9 Mei 2025',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
    score: { severity: 8.7, frequency: 8.0, recency: 8.5, total: 8.4, reason: 'Potensi banjir meluas, tren meningkat 35%.' },
  },
  {
    id: 'RPT-005',
    title: 'Fasilitas Taman Rusak',
    category: 'Fasilitas Umum',
    status: 'selesai',
    priority: 'low',
    location: 'Taman Alun-Alun, Bandung',
    lat: -6.9215,
    lng: 107.6069,
    description: 'Bangku taman dan pagar pembatas rusak.',
    reporter: 'Rini Wulandari',
    date: '8 Mei 2025',
    score: { severity: 3.0, frequency: 2.5, recency: 4.0, total: 3.2, reason: 'Prioritas rendah, tidak membahayakan.' },
  },
  {
    id: 'RPT-006',
    title: 'Jalan Retak Parah',
    category: 'Jalan Rusak',
    status: 'pending',
    priority: 'urgent',
    location: 'Jl. Pasteur No. 30, Bandung',
    lat: -6.8971,
    lng: 107.5999,
    description: 'Aspal jalan retak parah sepanjang 50 meter.',
    reporter: 'Hendra Wijaya',
    date: '7 Mei 2025',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
    score: { severity: 8.2, frequency: 7.5, recency: 7.8, total: 7.9, reason: 'Jalan utama, volume lalu lintas tinggi.' },
  },
  {
    id: 'RPT-007',
    title: 'Lampu Taman Mati',
    category: 'Lampu Mati',
    status: 'selesai',
    priority: 'low',
    location: 'Taman Cibeunying, Bandung',
    lat: -6.9001,
    lng: 107.6301,
    description: 'Beberapa lampu taman tidak berfungsi sejak seminggu lalu.',
    reporter: 'Maya Sari',
    date: '6 Mei 2025',
    score: { severity: 2.5, frequency: 2.0, recency: 3.5, total: 2.7, reason: 'Dampak terbatas, sudah diselesaikan.' },
  },
  {
    id: 'RPT-008',
    title: 'Banjir Lokal',
    category: 'Banjir',
    status: 'proses',
    priority: 'urgent',
    location: 'Jl. Soekarno Hatta, Bandung',
    lat: -6.9401,
    lng: 107.6271,
    description: 'Banjir setinggi 60cm menggenangi jalan dan rumah warga.',
    reporter: 'Agus Prasetyo',
    date: '5 Mei 2025',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
    score: { severity: 9.0, frequency: 8.5, recency: 8.0, total: 8.5, reason: 'Banjir berulang, area meningkat 40%.' },
  },
];

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
