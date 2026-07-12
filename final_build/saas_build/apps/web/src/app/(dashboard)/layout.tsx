import React from 'react';
import { RealtimeProvider } from '@/components/layout/realtime-provider';
import { AuthGuard } from '@/components/layout/auth-guard';
import { LayoutProvider } from '@/contexts/layout-context';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RealtimeProvider>
        <LayoutProvider>
          <DashboardShell>{children}</DashboardShell>
        </LayoutProvider>
      </RealtimeProvider>
    </AuthGuard>
  );
}
