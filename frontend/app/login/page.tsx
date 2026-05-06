'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Zap, ArrowLeft, AlertCircle } from 'lucide-react';
import { saveSession, type UserRole } from '@/app/lib/auth';
import { apiClient } from '@/app/lib/api';

const ROLE_HINTS: Record<UserRole, { email: string; password: string }> = {
  admin: { email: 'admin@aegisops.id', password: 'admin123' },
  supervisor: { email: 'supervisor@aegisops.id', password: 'super123' },
  user: { email: 'user@aegisops.id', password: 'user123' },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    setEmail(ROLE_HINTS[r].email);
    setPassword(ROLE_HINTS[r].password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend API
      const response = await apiClient.login({ email, password });
      
      // Map backend roles to frontend roles
      const roleMap: Record<string, UserRole> = {
        'admin': 'admin',
        'analyst': 'supervisor',
        'viewer': 'user',
      };
      
      // Save session with user data from backend
      const user = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: roleMap[response.user.role] || 'user',
        token: response.accessToken,
      };
      
      saveSession(user);
      
      // Force page reload to ensure session is loaded
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Email atau password salah. Coba gunakan akun demo di bawah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-purple/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Kembali ke Beranda
        </Link>

        <div className="card p-8 shadow-apple-lg animate-slide-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-3xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-apple-md">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Masuk ke AegisOps</h1>
            <p className="text-sm text-text-secondary mt-1.5">
              Pilih peran dan masukkan kredensial Anda
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-text-secondary mb-2.5">Masuk sebagai</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ROLE_HINTS) as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all duration-200 capitalize ${
                    role === r
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-text-secondary border-surface-border hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {r === 'user' ? 'Warga' : r === 'admin' ? 'Admin' : 'Supervisor'}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="input-field pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl bg-surface border border-surface-border">
            <p className="text-[11px] font-semibold text-text-secondary mb-2">
              💡 Akun Demo — klik peran di atas untuk auto-isi
            </p>
            <div className="space-y-1">
              {(Object.entries(ROLE_HINTS) as [UserRole, { email: string; password: string }][]).map(
                ([r, { email: e, password: p }]) => (
                  <div key={r} className="flex items-center gap-2 text-[10px] text-text-tertiary">
                    <span className="font-semibold capitalize w-16">
                      {r === 'user' ? 'Warga' : r === 'admin' ? 'Admin' : 'Supervisor'}:
                    </span>
                    <span>{e}</span>
                    <span className="text-text-tertiary">/ {p}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
