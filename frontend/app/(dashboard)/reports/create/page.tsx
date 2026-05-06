'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  FileText,
  Tag,
  AlignLeft,
  CheckCircle,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

const CATEGORIES = [
  'Jalan Rusak',
  'Lampu Mati',
  'Sampah',
  'Banjir',
  'Fasilitas Umum',
  'Drainase',
] as const;

type Category = (typeof CATEGORIES)[number];
type Priority = 'urgent' | 'medium' | 'low';

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent — Bahaya / Darurat',  color: 'border-red-300 bg-red-50 text-red-700' },
  { value: 'medium', label: 'Medium — Perlu Segera',      color: 'border-orange-300 bg-orange-50 text-orange-700' },
  { value: 'low',    label: 'Rendah — Tidak Mendesak',    color: 'border-green-300 bg-green-50 text-green-700' },
];

// Mapping priority → severity score untuk AI
const PRIORITY_SEVERITY: Record<Priority, number> = {
  urgent: 9,
  medium: 6,
  low: 3,
};

interface FormState {
  title: string;
  category: Category | '';
  priority: Priority | '';
  location: string;
  description: string;
}

const INITIAL_FORM: FormState = {
  title: '',
  category: '',
  priority: '',
  location: '',
  description: '',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function CreateReportPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm]               = useState<FormState>(INITIAL_FORM);
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [createdReportId, setCreatedReportId] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const isValid =
    form.title.trim() !== '' &&
    form.category !== '' &&
    form.priority !== '' &&
    form.location.trim() !== '' &&
    form.description.trim() !== '';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    // Get token from aegisops_user session
    const sessionRaw = localStorage.getItem('aegisops_user');
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        return session.token || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const severity = form.priority ? PRIORITY_SEVERITY[form.priority as Priority] : 5;

      // ── Step 1: Buat laporan ──────────────────────────────────────────────
      const createRes = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          location: form.location,
          severity,
          frequency: 5,
          recency: 8,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.message ?? 'Gagal membuat laporan');
      }

      const report = await createRes.json();
      setCreatedReportId(report.id);

      // ── Step 2: Upload foto ke S3 (jika ada) ─────────────────────────────
      if (imageFile && report.id) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadRes = await fetch(`${API_URL}/reports/${report.id}/upload`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          // fileUrl adalah URL CloudFront (bukan S3 langsung)
          setUploadedImageUrl(uploadData.fileUrl ?? null);
        } else {
          // Upload gagal tapi laporan tetap tersimpan
          console.warn('Upload foto gagal, laporan tetap tersimpan');
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="card p-10 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Laporan Terkirim!</h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            Laporan <strong>"{form.title}"</strong> berhasil dikirim dan akan segera ditinjau oleh
            tim kami.
          </p>

          {/* Foto yang diupload ke S3 via CloudFront */}
          {uploadedImageUrl && (
            <div className="mb-4">
              <p className="text-[10px] text-text-tertiary mb-2 flex items-center gap-1 justify-center">
                <ImageIcon size={10} /> Foto tersimpan di S3 · diakses via CloudFront CDN
              </p>
              <img
                src={uploadedImageUrl}
                alt="Foto laporan"
                className="w-full h-32 object-cover rounded-xl"
              />
            </div>
          )}

          <div className="p-4 rounded-xl bg-surface border border-surface-border mb-6 text-left space-y-2">
            {createdReportId && (
              <p className="text-xs text-text-tertiary">
                <span className="font-semibold text-text-secondary">ID:</span>{' '}
                <span className="font-mono">{createdReportId.slice(0, 8)}…</span>
              </p>
            )}
            <p className="text-xs text-text-tertiary">
              <span className="font-semibold text-text-secondary">Kategori:</span> {form.category}
            </p>
            <p className="text-xs text-text-tertiary">
              <span className="font-semibold text-text-secondary">Lokasi:</span> {form.location}
            </p>
            <p className="text-xs text-text-tertiary">
              <span className="font-semibold text-text-secondary">Prioritas:</span>{' '}
              <span className="capitalize">{form.priority}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm(INITIAL_FORM);
                setSubmitted(false);
                setImagePreview(null);
                setImageFile(null);
                setCreatedReportId(null);
                setUploadedImageUrl(null);
              }}
              className="btn-secondary text-sm flex-1"
            >
              Buat Laporan Baru
            </button>
            <button onClick={() => router.push('/reports/history')} className="btn-primary text-sm flex-1">
              Lihat Riwayat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-surface-border flex items-center gap-4 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-primary">Buat Laporan</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Laporkan masalah infrastruktur di sekitar Anda
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            {/* Reporter info */}
            <div className="card p-5 bg-gradient-card border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0) ?? 'W'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-tertiary">{user?.email}</p>
                </div>
                <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Warga
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="card p-5">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <FileText size={12} /> Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Contoh: Jalan Berlubang di Depan Sekolah"
                className="input-field"
                maxLength={100}
                required
              />
              <p className="text-[10px] text-text-tertiary mt-1.5 text-right">
                {form.title.length}/100
              </p>
            </div>

            {/* Category + Priority */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Tag size={12} /> Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Pilih kategori...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="card p-5">
                <label className="block text-xs font-semibold text-text-secondary mb-2">
                  Tingkat Prioritas <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {PRIORITY_OPTIONS.map(({ value, label, color }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                        form.priority === value
                          ? color
                          : 'border-surface-border hover:border-primary/30 hover:bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={value}
                        checked={form.priority === value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span
                        className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                          form.priority === value ? 'border-current bg-current' : 'border-surface-border'
                        }`}
                      />
                      <span className="text-xs font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="card p-5">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <MapPin size={12} /> Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Contoh: Jl. Merdeka No. 12, Bandung"
                className="input-field"
                required
              />
              <p className="text-[10px] text-text-tertiary mt-1.5">
                💡 Masukkan alamat lengkap agar tim dapat menemukan lokasi dengan tepat
              </p>
            </div>

            {/* Description */}
            <div className="card p-5">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <AlignLeft size={12} /> Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Jelaskan masalah secara detail: ukuran, kondisi, dampak terhadap warga..."
                className="input-field resize-none"
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-[10px] text-text-tertiary mt-1.5 text-right">
                {form.description.length}/500
              </p>
            </div>

            {/* Image upload → S3 via CloudFront */}
            <div className="card p-5">
              <label className="block text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1.5">
                <Upload size={12} /> Foto Bukti{' '}
                <span className="text-text-tertiary font-normal">(opsional)</span>
              </label>
              <p className="text-[10px] text-text-tertiary mb-3">
                📦 File akan disimpan di <strong>Amazon S3</strong> dan diakses melalui{' '}
                <strong>CloudFront CDN</strong>
              </p>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={13} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-lg">
                    {imageFile?.name} · {((imageFile?.size ?? 0) / 1024).toFixed(0)} KB
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-surface-border rounded-xl cursor-pointer hover:border-primary/40 hover:bg-surface transition-all duration-200">
                  <Upload size={20} className="text-text-tertiary mb-2" />
                  <p className="text-xs text-text-secondary font-medium">Klik untuk upload foto</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">PNG, JPG, WebP hingga 5MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pb-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary text-sm flex-shrink-0"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!isValid || loading}
                className="btn-primary text-sm flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {imageFile ? 'Mengirim & Upload Foto...' : 'Mengirim...'}
                  </span>
                ) : (
                  'Kirim Laporan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
