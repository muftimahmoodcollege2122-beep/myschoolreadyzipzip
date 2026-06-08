'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useParentAuth } from '../stores/auth.store';
import { clearTokens } from '../lib/api-client';

const NAV = [
  { icon: '🏠', label: 'Overview',      href: '/dashboard' },
  { icon: '✅', label: 'Attendance',    href: '/dashboard/attendance' },
  { icon: '📊', label: 'Grades',        href: '/dashboard/grades' },
  { icon: '💰', label: 'Fees',          href: '/dashboard/fees' },
  { icon: '📅', label: 'Timetable',     href: '/dashboard/timetable' },
  { icon: '💬', label: 'Announcements', href: '/dashboard/announcements' },
  { icon: '📋', label: 'Assignments',   href: '/dashboard/assignments' },
  { icon: '🏆', label: 'Results',       href: '/dashboard/results' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, slug, children, clear } = useParentAuth();

  const logout = () => { clearTokens(); clear(); router.push('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-rose-950 text-white flex flex-col fixed left-0 top-0 z-40 shadow-xl">
      <div className="px-6 py-5 border-b border-rose-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0">👨‍👩‍👧</div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{slug?.toUpperCase() || 'SCHOOL'}</p>
            <p className="text-rose-400 text-xs">Parent Portal</p>
          </div>
        </div>
      </div>

      {children.length > 1 && (
        <div className="px-4 py-3 border-b border-rose-800">
          <p className="text-xs text-rose-400 font-medium mb-2">My Children</p>
          <div className="space-y-1">
            {children.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-rose-900 text-xs">
                <div className="w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center text-[10px] font-bold">{c.name?.[0]}</div>
                <span className="truncate text-rose-100">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-rose-600 text-white shadow-lg' : 'text-rose-300 hover:bg-rose-900 hover:text-white'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-rose-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0] || 'P'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Parent'}</p>
            <p className="text-rose-500 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-red-900 hover:text-red-300 transition-all">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
