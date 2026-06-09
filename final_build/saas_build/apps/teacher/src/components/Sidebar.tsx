'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTeacherAuth } from '../stores/auth.store';
import { clearTokens } from '../lib/api-client';

const ALL_NAV = [
  { icon: '📊', label: 'Dashboard',    href: '/dashboard',              flag: null },
  { icon: '📝', label: 'Attendance',   href: '/dashboard/attendance',   flag: 'attendance' },
  { icon: '📋', label: 'Assignments',  href: '/dashboard/assignments',  flag: 'assignments' },
  { icon: '📊', label: 'Grades',       href: '/dashboard/grades',       flag: 'gradebook' },
  { icon: '📅', label: 'Timetable',    href: '/dashboard/timetable',    flag: 'timetable' },
  { icon: '💬', label: 'Announcements',href: '/dashboard/announcements',flag: 'announcements' },
  { icon: '👩‍🎓', label: 'My Students', href: '/dashboard/students',     flag: 'students' },
  { icon: '📚', label: 'Resources',    href: '/dashboard/resources',    flag: 'resources' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, slug, clear } = useTeacherAuth();
  const [flags, setFlags] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (!slug) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/v1/themes/portal-settings/slug/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.teacher) setFlags(d.teacher); })
      .catch(() => {});
  }, [slug]);

  const nav = ALL_NAV.filter(item => {
    if (!item.flag || !flags) return true;
    return flags[item.flag] !== false;
  });

  const logout = () => { clearTokens(); clear(); router.push('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-teal-950 text-white flex flex-col fixed left-0 top-0 z-40 shadow-xl">
      <div className="px-6 py-5 border-b border-teal-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0">👨‍🏫</div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{slug?.toUpperCase() || 'SCHOOL'}</p>
            <p className="text-teal-400 text-xs">Teacher Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-teal-600 text-white shadow-lg' : 'text-teal-300 hover:bg-teal-900 hover:text-white'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-teal-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.[0] || 'T'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Teacher'}</p>
            <p className="text-teal-500 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-teal-400 hover:bg-red-900 hover:text-red-300 transition-all">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
