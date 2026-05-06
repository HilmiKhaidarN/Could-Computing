'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { useAuth } from '@/app/hooks/useAuth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show nothing while checking auth to avoid flash
  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-y-auto scrollbar-hide">
        {children}
      </main>
    </div>
  );
}
