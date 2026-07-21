'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function readAuthFromStorage(): boolean {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return false;
    const s = JSON.parse(raw)?.state ?? {};
    return !!(s.isAuthenticated && s.accessToken);
  } catch {
    return false;
  }
}

const Spinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Always start as 'loading' — same on server and client (no hydration mismatch)
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    // Only runs in the browser — safe to use localStorage here
    if (readAuthFromStorage()) {
      setStatus('allowed');
    } else {
      setStatus('denied');
      router.replace('/login');
    }
  }, [router]);

  if (status !== 'allowed') {
    return <Spinner />;
  }

  return <>{children}</>;
}
