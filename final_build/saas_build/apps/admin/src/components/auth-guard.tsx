'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function readAuthFromStorage(): boolean {
  try {
    const token = localStorage.getItem('admin_access_token');
    if (token) return true;
    const raw = localStorage.getItem('admin-auth');
    if (!raw) return false;
    const s = JSON.parse(raw)?.state ?? {};
    return !!(s.token || s.accessToken);
  } catch {
    return false;
  }
}

const Spinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    if (readAuthFromStorage()) {
      setStatus('allowed');
    } else {
      setStatus('denied');
      router.replace('/login');
    }
  }, [router]);

  if (status !== 'allowed') return <Spinner />;
  return <>{children}</>;
}
