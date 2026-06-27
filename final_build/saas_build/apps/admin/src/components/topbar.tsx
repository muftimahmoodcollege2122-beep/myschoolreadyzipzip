'use client';
import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useNotificationBell } from '../../hooks/use-notification-bell';
import { OnlineIndicator } from '../shared/online-indicator';
import Link from 'next/link';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { logout } = useAuth();
  const { unread } = useNotificationBell();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-30 shadow-sm">
      <div className="flex-1">
        <h1 className="text-base font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>

      <OnlineIndicator />

      <Link href="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Link>

      <button onClick={logout} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-base">
        ⏻
      </button>
    </header>
  );
}
