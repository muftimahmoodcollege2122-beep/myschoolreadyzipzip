'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const storeState = useAuthStore.getState();
      if (storeState.isAuthenticated && storeState.accessToken) {
        setChecked(true);
      } else {
        try {
          const raw = localStorage.getItem('auth-storage');
          if (raw) {
            const parsed = JSON.parse(raw);
            const s = parsed?.state ?? {};
            if (s.isAuthenticated && s.accessToken) {
              setChecked(true);
              return;
            }
          }
        } catch {}
        router.replace('/login');
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      checkAuth();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(checkAuth);
      useAuthStore.persist.rehydrate();
      return unsub;
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
