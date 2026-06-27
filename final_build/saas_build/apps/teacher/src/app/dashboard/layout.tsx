'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, AlertBanner } from '../../components/Sidebar';
import { useTeacherAuth } from '../../stores/auth.store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, slug } = useTeacherAuth();
  useEffect(() => { if (!isAuthenticated()) router.replace('/login'); }, []);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden flex flex-col">
        <AlertBanner slug={slug || ''} />
        {children}
      </main>
    </div>
  );
}
