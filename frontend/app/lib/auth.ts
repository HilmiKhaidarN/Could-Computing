export type UserRole = 'admin' | 'supervisor' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  token?: string; // JWT token from backend
}

const SESSION_KEY = 'aegisops_user';

// ─── No dummy users - use real backend authentication ─────────────────────────

export function login(email: string, password: string): AuthUser | null {
  // This function is deprecated - use apiClient.login() instead
  console.warn('Direct login() is deprecated. Use apiClient.login() from lib/api.ts');
  return null;
}

export function saveSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  console.log('✅ Session saved:', user);
}

export function getSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    console.log('❌ No session found in localStorage');
    return null;
  }
  try {
    const user = JSON.parse(raw) as AuthUser;
    console.log('✅ Session loaded:', user);
    return user;
  } catch {
    console.log('❌ Failed to parse session');
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

// ─── Role helpers ──────────────────────────────────────────────────────────────

export function getCurrentUser(): AuthUser | null {
  return getSession();
}

export function getUserRole(): UserRole | null {
  return getSession()?.role ?? null;
}

export function isAdmin(): boolean {
  return getUserRole() === 'admin';
}

export function isSupervisor(): boolean {
  return getUserRole() === 'supervisor';
}

export function isUser(): boolean {
  return getUserRole() === 'user';
}

/** Returns true if the current user has at least one of the given roles */
export function hasRole(...roles: UserRole[]): boolean {
  const role = getUserRole();
  if (!role) return false;
  return roles.includes(role);
}

// ─── Permission matrix ─────────────────────────────────────────────────────────

export const PERMISSIONS = {
  viewMap: ['admin', 'supervisor', 'user'] as UserRole[],
  viewAllReports: ['admin', 'supervisor'] as UserRole[],
  createReport: ['admin', 'user'] as UserRole[],
  editReport: ['admin'] as UserRole[],
  updateStatus: ['admin'] as UserRole[],
  viewAnalytics: ['admin', 'supervisor'] as UserRole[],
  viewDecisionInsight: ['supervisor'] as UserRole[],
} as const;

export function can(permission: keyof typeof PERMISSIONS): boolean {
  return hasRole(...PERMISSIONS[permission]);
}

// ─── Role display helpers ──────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  supervisor: 'Supervisor',
  user: 'Warga',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-primary/10 text-primary',
  supervisor: 'bg-accent-purple/10 text-accent-purple',
  user: 'bg-green-50 text-green-700',
};
