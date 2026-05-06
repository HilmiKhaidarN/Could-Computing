export type UserRole = 'admin' | 'supervisor' | 'user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

const SESSION_KEY = 'aegisops_user';

// ─── Dummy users ──────────────────────────────────────────────────────────────

export const DUMMY_USERS: Record<string, { password: string; user: AuthUser }> = {
  'admin@aegisops.id': {
    password: 'admin123',
    user: { id: '1', name: 'Admin User', email: 'admin@aegisops.id', role: 'admin' },
  },
  'supervisor@aegisops.id': {
    password: 'super123',
    user: { id: '2', name: 'Supervisor Kota', email: 'supervisor@aegisops.id', role: 'supervisor' },
  },
  'user@aegisops.id': {
    password: 'user123',
    user: { id: '3', name: 'Warga Bandung', email: 'user@aegisops.id', role: 'user' },
  },
};

// ─── Core auth functions ───────────────────────────────────────────────────────

export function login(email: string, password: string): AuthUser | null {
  const entry = DUMMY_USERS[email];
  if (!entry || entry.password !== password) return null;
  return entry.user;
}

export function saveSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
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
