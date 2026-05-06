'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, BarChart3, Zap, Shield, CheckCircle, ChevronRight } from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Monitoring Laporan',
    description:
      'Pantau seluruh laporan infrastruktur secara real-time dengan peta interaktif berbasis lokasi.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Analisis Data',
    description:
      'Visualisasi data mendalam dengan grafik tren, distribusi kategori, dan insight otomatis.',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
  },
  {
    icon: Zap,
    title: 'Sistem Prioritas',
    description:
      'AI-powered prioritization untuk menentukan urutan penanganan berdasarkan urgensi dan dampak.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

const stats = [
  { value: '1,248', label: 'Total Laporan' },
  { value: '87%', label: 'Tingkat Penyelesaian' },
  { value: '342', label: 'Rata-rata Hari Selesai' },
  { value: '24', label: 'Kecamatan Terpantau' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">AegisOps</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Beranda', 'Fitur', 'Tentang', 'Kontak'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <Link
            href="/login"
            className="btn-primary text-sm px-4 py-2"
          >
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-hero relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary">Platform Infrastruktur Digital</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-5">
                Membangun Kota{' '}
                <span className="text-gradient">Lebih Baik</span>{' '}
                dengan Data &amp; Teknologi
              </h1>

              <p className="text-base text-text-secondary leading-relaxed mb-8 max-w-lg">
                Laporan masalah infrastruktur di seluruh kota, analisis prioritas penanganan, dan
                pantau progres perbaikan secara real-time berbasis data.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="btn-primary gap-2">
                  Laporan Sekarang
                  <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="btn-secondary gap-2">
                  Pelajari Lebih Lanjut
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 mt-8">
                {['Aman & Terenkripsi', 'Data Real-time', 'AI-Powered'].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-green-500" />
                    <span className="text-xs text-text-secondary">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Hero Image */}
            <div className="relative animate-fade-in hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-apple-lg border border-surface-border">
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&q=80"
                  alt="Kota modern"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Floating card */}
                <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Laporan Aktif</p>
                      <p className="text-2xl font-bold text-primary">87</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-text-primary">Selesai Hari Ini</p>
                      <p className="text-2xl font-bold text-green-600">12</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 glass rounded-2xl px-4 py-2.5 shadow-apple border border-white/50">
                <p className="text-xs font-semibold text-text-primary">🏙️ Kota Bandung</p>
                <p className="text-[10px] text-text-tertiary">24 Kecamatan Terpantau</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-surface-border bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-gradient mb-1">{value}</p>
                <p className="text-sm text-text-secondary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Fitur Unggulan
            </p>
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-base text-text-secondary max-w-xl mx-auto">
              Platform terintegrasi untuk monitoring, analisis, dan penentuan prioritas
              infrastruktur kota secara cerdas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className="card-hover p-6">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium">
                  Pelajari lebih lanjut <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-primary mb-6 shadow-apple-md">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Siap Memulai?
          </h2>
          <p className="text-base text-text-secondary mb-8">
            Bergabung dengan ribuan warga dan petugas yang sudah menggunakan AegisOps
            untuk kota yang lebih baik.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login" className="btn-primary gap-2 px-6 py-3">
              Mulai Sekarang — Gratis
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary gap-2 px-6 py-3">
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-surface-border bg-surface">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">AegisOps</span>
          </div>
          <p className="text-xs text-text-tertiary">
            © 2025 AegisOps. Sistem Prioritas Infrastruktur Kota.
          </p>
          <div className="flex gap-6">
            {['Privasi', 'Syarat', 'Kontak'].map((item) => (
              <a key={item} href="#" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
