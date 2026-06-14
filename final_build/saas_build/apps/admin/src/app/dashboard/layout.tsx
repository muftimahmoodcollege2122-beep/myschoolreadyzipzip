import React from 'react';
import { Sidebar } from '../../components/sidebar';
import { RealtimeProvider } from '../../components/realtime-provider';
import { AuthGuard } from '../../components/auth-guard';
import { ToastProvider } from '../../components/shared/toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RealtimeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-[240px] min-h-screen flex flex-col overflow-x-hidden">
              {children}
            </main>
          </div>
        </ToastProvider>
      </RealtimeProvider>
    </AuthGuard>
  );
}
