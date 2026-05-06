'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  User,
  LogOut,
  MapPin,
  Zap,
  Plus,
  History,
  Brain,
  ClipboardList,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/app/hooks/useAuth';
import { ROLE_LABELS, ROLE_COLORS } from '@/app/lib/auth';
import type { UserRole } from '@/app/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  user: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reports/create', label: 'Buat Laporan', icon: Plus },
    { href: '/reports/history', label: 'Riwayat Saya', icon: History },
    { href: '/profile', label: 'Profil', icon: User },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reports', label: 'Laporan', icon: FileText, badge: 3 },
    { href: '/reports/manage', label: 'Kelola Laporan', icon: ClipboardList },
    { href: '/profile', label: 'Profil', icon: User },
  ],
  supervisor: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reports', label: 'Semua Laporan', icon: FileText },
    { href: '/analytics', label: 'Analitik', icon: BarChart3 },
    { href: '/decision', label: 'Decision Insight', icon: Brain },
    { href: '/profile', label: 'Profil', icon: User },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const role = user?.role ?? 'user';
  const navItems = NAV_BY_ROLE[role];

  return (
    <aside className="w-60 h-screen bg-white border-r border-surface-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-apple transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary leading-none">AegisOps</p>
            <p className="text-[10px] text-text-tertiary mt-0.5">Infrastruktur Kota</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-3">
          Menu Utama
        </p>

        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                active
                  ? 'bg-primary/8 text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary',
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge !== undefined && (
                <span
                  className="flex items-center justify-center rounded-full bg-red-500 text-white font-bold"
                  style={{ width: 18, height: 18, fontSize: 10 }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Location chip */}
        <div className="pt-4">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-3">
            Lokasi
          </p>
          <div className="px-3 py-2.5 rounded-xl bg-gradient-card border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Kota Bandung</span>
            </div>
            <p className="text-[10px] text-text-tertiary">Jawa Barat, Indonesia</p>
          </div>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0) ?? 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary truncate">{user?.name ?? 'User'}</p>
            <span
              className={clsx(
                'inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold',
                ROLE_COLORS[role],
              )}
            >
              {ROLE_LABELS[role]}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-red-50 text-text-tertiary hover:text-red-500 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
