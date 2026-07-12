'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useLayout } from '@/contexts/layout-context';
import { useNotificationBell } from '@/hooks/use-notification-bell';

interface TopbarProps { title: string; subtitle?: string; action?: React.ReactNode; }

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const { logout } = useAuth();
  const { openMobileMenu } = useLayout();
  const { unread } = useNotificationBell();

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-100 flex items-center px-3 sm:px-5 gap-3 sticky top-0 z-30 shadow-sm flex-shrink-0">
      <button onClick={openMobileMenu} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0" aria-label="Menu">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 truncate hidden sm:block">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0 hidden sm:block">{action}</div>}
      <Link href="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0 text-base">
        🔔
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1">{unread > 99 ? '99+' : unread}</span>}
      </Link>
      <button onClick={logout} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0 text-sm" title="Logout">⏻</button>
    </header>
  );
}
