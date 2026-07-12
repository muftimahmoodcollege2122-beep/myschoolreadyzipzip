'use client';
import React from 'react';
import { Sidebar } from './sidebar';
import { useLayout } from '@/contexts/layout-context';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { mobileOpen, closeMobileMenu, openMobileMenu } = useLayout();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar mobileOpen={mobileOpen} onClose={closeMobileMenu} />
      <main className="flex-1 min-h-screen flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
