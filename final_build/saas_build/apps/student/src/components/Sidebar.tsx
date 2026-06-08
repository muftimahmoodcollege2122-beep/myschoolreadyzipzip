'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStudentAuth } from '../stores/auth.store';
import { clearTokens } from '../lib/api-client';

const NAV = [
  { icon: '🏠', label: 'Dashboard',   href: '/dashboard' },
  { icon: '📅', label: 'Timetable',   href: '/dashboard/timetable' },
  { icon: '📝', label: 'Assignments',  href: '/dashboard/assignments' },
  { icon: '📊', label: 'Grades',       href: '/dashboard/grades' },
  { icon: '✅', label: 'Attendance',   href: '/dashboard/attendance' },
  { icon: '💰', label: 'Fee Status',   href: '/dashboard/fees' },
  { icon: '💬', label: 'Announcements',href: '/dashboard/announcements' },
  { icon: '📚', label: 'Resources',    href: '/dashboard/resources' },
  { icon: '🏆', label: 'Results',      href: '/dashboard/results' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, slug, clear } = useStudentAuth();

  const logout = () => { clearTokens(); clear(); router.push('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-violet-950 text-white flex flex-col fixed left-0 top-0 z-40 shadow-xl">
      <div className="px-6 py-5 border-b border-violet-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0">👩‍🎓</div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{slug?.toUpperCase() || 'SCHOOL'}</p>
            <p className="text-violet-400 text-xs">Student Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-violet-600 text-white shadow-lg' : 'text-violet-300 hover:bg-violet-900 hover:text-white'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-violet-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0] || 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Student'}</p>
            <p className="text-violet-500 text-xs truncate">{user?.rollNumber || user?.email || ''}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-violet-400 hover:bg-red-900 hover:text-red-300 transition-all">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
