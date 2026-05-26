import React from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { RealtimeProvider } from '../../components/layout/realtime-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 ml-[240px] min-h-screen flex flex-col">
          {children}
        </main>
      </div>
    </RealtimeProvider>
  );
}
