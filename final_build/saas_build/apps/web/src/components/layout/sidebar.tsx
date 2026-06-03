'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';

type NavItem = { href: string; icon: string; label: string; roles: string[] };
type NavSection = { title: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/dashboard',      icon: '📊', label: 'Dashboard',     roles: ['SCHOOL_ADMIN','TEACHER','SUPER_ADMIN','STUDENT','PARENT'] },
      { href: '/analytics',      icon: '📈', label: 'Analytics',     roles: ['SCHOOL_ADMIN','SUPER_ADMIN'] },
    ],
  },
  {
    title: 'Academic',
    items: [
      { href: '/students',       icon: '👩‍🎓', label: 'Students',      roles: ['SCHOOL_ADMIN','TEACHER'] },
      { href: '/teachers',       icon: '👨‍🏫', label: 'Teachers',      roles: ['SCHOOL_ADMIN'] },
      { href: '/classes',        icon: '🏫', label: 'Classes',       roles: ['SCHOOL_ADMIN','TEACHER'] },
      { href: '/subjects',       icon: '📚', label: 'Subjects',      roles: ['SCHOOL_ADMIN','TEACHER'] },
      { href: '/timetable',      icon: '🗓️', label: 'Timetable',     roles: ['SCHOOL_ADMIN','TEACHER','STUDENT'] },
      { href: '/attendance',     icon: '✅', label: 'Attendance',    roles: ['SCHOOL_ADMIN','TEACHER'] },
      { href: '/grades',         icon: '🎯', label: 'Grades',        roles: ['SCHOOL_ADMIN','TEACHER'] },
      { href: '/exams',          icon: '📝', label: 'Exams',         roles: ['SCHOOL_ADMIN','TEACHER'] },
    ],
  },
  {
    title: 'Admissions & HR',
    items: [
      { href: '/admissions',     icon: '📋', label: 'Admissions',    roles: ['SCHOOL_ADMIN'] },
      { href: '/staff',          icon: '👥', label: 'Staff',         roles: ['SCHOOL_ADMIN'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { href: '/fees',           icon: '💰', label: 'Fees',          roles: ['SCHOOL_ADMIN','ACCOUNTANT'] },
      { href: '/reports',        icon: '📄', label: 'Reports',       roles: ['SCHOOL_ADMIN'] },
    ],
  },
  {
    title: 'Resources',
    items: [
      { href: '/library',        icon: '📖', label: 'Library',       roles: ['SCHOOL_ADMIN','TEACHER','STUDENT'] },
      { href: '/transport',      icon: '🚌', label: 'Transport',     roles: ['SCHOOL_ADMIN','TEACHER','STUDENT','PARENT'] },
      { href: '/events',         icon: '🎉', label: 'Events',        roles: ['SCHOOL_ADMIN','TEACHER','STUDENT','PARENT'] },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/notifications',  icon: '🔔', label: 'Notifications', roles: ['SCHOOL_ADMIN','TEACHER','STUDENT','PARENT'] },
      { href: '/settings',       icon: '⚙️', label: 'Settings',      roles: ['SCHOOL_ADMIN'] },
    ],
  },
];

export function Sidebar() {
  const path = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => path === href || path.startsWith(href + '/');
  const canSee = (roles: string[]) => user && roles.includes(user.role);

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[#0F2137] flex flex-col z-40 transition-all duration-200 ${collapsed ? 'w-[64px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">M</div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">MySchool</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wide">School Portal</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} /></svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-none py-2">
        {sections.map(section => {
          const visible = section.items.filter(i => canSee(i.roles));
          if (!visible.length) return null;
          return (
            <div key={section.title} className="mb-1">
              {!collapsed && <p className="px-4 py-1.5 text-[10px] font-bold text-white/25 uppercase tracking-wider">{section.title}</p>}
              {visible.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all group ${active ? 'bg-green-500/20 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'}`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {active && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-2 border-t border-white/10 flex-shrink-0">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-green-500/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.profile?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.profile?.firstName ?? user?.email}</p>
              <p className="text-white/30 text-[10px]">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
