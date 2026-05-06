'use client';

import { useState } from 'react';
import { User, Mail, Shield, Edit3, Save, X, Bell, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { ROLE_LABELS, ROLE_COLORS } from '@/app/lib/auth';
import clsx from 'clsx';

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-surface-border last:border-0">
      <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-text-secondary" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const role = user?.role ?? 'user';
  const roleLabel = ROLE_LABELS[role];
  const roleColor = ROLE_COLORS[role];

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 bg-white border-b border-surface-border flex-shrink-0">
        <h1 className="text-lg font-bold text-text-primary">Profil Pengguna</h1>
        <p className="text-xs text-text-tertiary mt-0.5">Kelola informasi akun Anda</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Profile card */}
          <div className="card p-6">
            <div className="flex items-start gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-apple-md">
                  <span className="text-white text-3xl font-bold">
                    {user?.name?.charAt(0) ?? 'A'}
                  </span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-surface-border shadow-apple flex items-center justify-center hover:bg-surface transition-colors">
                  <Edit3 size={12} className="text-text-secondary" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
                    <p className="text-sm text-text-secondary mt-0.5">{user?.email}</p>
                    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2', roleColor)}>
                      {roleLabel}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className={editing ? 'btn-secondary text-xs py-2 px-3 gap-1.5' : 'btn-primary text-xs py-2 px-3 gap-1.5'}
                  >
                    {editing ? <><X size={12} /> Batal</> : <><Edit3 size={12} /> Edit Profil</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div className="card p-6 animate-slide-up border-primary/20">
              <h3 className="text-sm font-bold text-text-primary mb-4">Edit Informasi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Nama Lengkap</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="btn-primary text-sm gap-2"><Save size={14} /> Simpan Perubahan</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Batal</button>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-text-primary mb-4">Informasi Akun</h3>
            <div className="space-y-0">
              <InfoRow icon={User} label="Nama Lengkap" value={user?.name ?? '-'} />
              <InfoRow icon={Mail} label="Email" value={user?.email ?? '-'} />
              <InfoRow icon={Shield} label="Peran" value={roleLabel} />
              <InfoRow icon={Globe} label="Wilayah" value="Kota Bandung, Jawa Barat" />
            </div>
          </div>

          {/* Settings */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-text-primary mb-4">Pengaturan</h3>
            <div className="space-y-0">
              {[
                { icon: Bell, label: 'Notifikasi Email', desc: 'Terima update laporan via email', enabled: true },
                { icon: Bell, label: 'Notifikasi Push', desc: 'Notifikasi real-time di browser', enabled: false },
                { icon: Lock, label: 'Autentikasi 2 Faktor', desc: 'Keamanan tambahan untuk akun', enabled: false },
              ].map(({ icon: Icon, label, desc, enabled }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
                      <Icon size={16} className="text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{label}</p>
                      <p className="text-xs text-text-tertiary">{desc}</p>
                    </div>
                  </div>
                  <button
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary' : 'bg-surface-border'}`}
                    aria-label={`Toggle ${label}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
