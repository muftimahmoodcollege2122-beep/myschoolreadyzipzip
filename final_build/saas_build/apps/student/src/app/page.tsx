'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../stores/auth.store';

export default function Root() {
  const router = useRouter();
  const { isAuthenticated } = useStudentAuth();
  useEffect(() => {
    router.replace(isAuthenticated() ? '/dashboard' : '/login');
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-900">
      <div className="w-8 h-8 border-4 border-violet-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
