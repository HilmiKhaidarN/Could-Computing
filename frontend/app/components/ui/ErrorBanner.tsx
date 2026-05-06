'use client';

import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  /** Jika true, tampilkan sebagai banner kecil (fallback mode), bukan full error */
  compact?: boolean;
}

export function ErrorBanner({
  message = 'Gagal memuat data dari server.',
  onRetry,
  compact = false,
}: ErrorBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-100 text-xs">
        <Wifi size={13} className="text-orange-500 flex-shrink-0" />
        <span className="text-orange-700 font-medium">
          Backend tidak tersedia — menampilkan data lokal
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto flex items-center gap-1 text-orange-600 hover:text-orange-800 font-semibold transition-colors"
          >
            <RefreshCw size={11} />
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-3xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <p className="text-sm font-bold text-text-primary mb-1">Gagal Memuat Data</p>
      <p className="text-xs text-text-secondary mb-5 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-xs py-2 px-4 gap-1.5">
          <RefreshCw size={13} />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
