'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../stores/auth.store';

export default function Root() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();
  useEffect(() => {
    router.replace(isAuthenticated() ? '/dashboard' : '/login');
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
