'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getSession,
  clearSession,
  can,
  type AuthUser,
  type UserRole,
  PERMISSIONS,
} from '@/app/lib/auth';

interface UseAuthReturn {
  user: AuthUser | null;
  role: UserRole | null;
  isLoading: boolean;
  can: (permission: keyof typeof PERMISSIONS) => boolean;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return {
    user,
    role: user?.role ?? null,
    isLoading,
    can,
    logout,
  };
}
