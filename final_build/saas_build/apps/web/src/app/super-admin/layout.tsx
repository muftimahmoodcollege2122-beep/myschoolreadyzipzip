'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user && !isRole('SUPER_ADMIN')) { router.replace('/dashboard'); }
  }, [isAuthenticated, user, isRole, router]);

  if (!isAuthenticated || !user || !isRole('SUPER_ADMIN')) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-sm">Checking access…</div>;
  }

  return <div className="min-h-screen bg-slate-950">{children}</div>;
}
