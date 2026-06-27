'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTeacherAuth } from '../stores/auth.store';
import { clearTokens } from '../lib/api-client';

const DEFAULT_NAV = [
  { key: 'dashboard',     icon: '📊', label: 'Dashboard',     href: '/dashboard',               flag: null,           order: 0, enabled: true },
  { key: 'attendance',    icon: '📝', label: 'Attendance',    href: '/dashboard/attendance',    flag: 'attendance',   order: 1, enabled: true },
  { key: 'assignments',   icon: '📋', label: 'Assignments',   href: '/dashboard/assignments',   flag: 'assignments',  order: 2, enabled: true },
  { key: 'grades',        icon: '📊', label: 'Grades',        href: '/dashboard/grades',        flag: 'gradebook',    order: 3, enabled: true },
  { key: 'timetable',     icon: '📅', label: 'Timetable',     href: '/dashboard/timetable',     flag: 'timetable',    order: 4, enabled: true },
  { key: 'announcements', icon: '💬', label: 'Announcements', href: '/dashboard/announcements', flag: 'announcements',order: 5, enabled: true },
  { key: 'students',      icon: '👩‍🎓', label: 'My Students',  href: '/dashboard/students',      flag: 'students',     order: 6, enabled: true },
  { key: 'resources',     icon: '🗂️', label: 'Resources',     href: '/dashboard/resources',     flag: 'resources',    order: 7, enabled: true },
];

const DEFAULT_BRANDING = { sidebarBg: '#042f2e', sidebarText: '#99f6e4', sidebarAccent: '#0d9488', logo: '' };

export function AlertBanner({ slug }: { slug: string }) {
  const [banners, setBanners] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!slug) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/v1/themes/alert-banners/slug/${slug}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setBanners(Array.isArray(d) ? d.filter((b: any) => b.portals?.includes('teacher')) : []))
      .catch(() => {});
  }, [slug]);

  const STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    info:    { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', icon: 'ℹ️' },
    warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', icon: '⚠️' },
    error:   { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', icon: '🚨' },
    success: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', icon: '✅' },
  };

  const visible = banners.filter(b => !dismissed.has(b.id));
  if (!visible.length) return null;

  return (
    <div>
      {visible.map(b => {
        const s = STYLES[b.type] || STYLES.info;
        return (
          <div key={b.id} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium"
            style={{ background: s.bg, color: s.text, borderBottom: `1px solid ${s.border}` }}>
            <span>{s.icon} {b.message}</span>
            <button onClick={() => setDismissed(d => new Set([...d, b.id]))} className="ml-3 text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, slug, clear } = useTeacherAuth();
  const [flags, setFlags]      = useState<Record<string, boolean> | null>(null);
  const [navItems, setNavItems] = useState(DEFAULT_NAV);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);

  useEffect(() => {
    if (!slug) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    fetch(`${apiUrl}/api/v1/themes/portal-settings/slug/${slug}`)
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.teacher) setFlags(d.teacher); }).catch(() => {});

    fetch(`${apiUrl}/api/v1/themes/nav-config/slug/${slug}`)
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.teacher?.length) setNavItems(d.teacher); }).catch(() => {});

    fetch(`${apiUrl}/api/v1/themes/portal-branding/slug/${slug}`)
      .then(r => r.ok ? r.json() : null).then(d => { if (d?.teacher) setBranding({ ...DEFAULT_BRANDING, ...d.teacher }); }).catch(() => {});
  }, [slug]);

  const nav = navItems
    .filter(item => item.enabled !== false)
    .filter(item => { if (!item.flag || !flags) return true; return flags[item.flag] !== false; })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const logout = () => { clearTokens(); clear(); router.push('/login'); };

  return (
    <aside className="w-64 min-h-screen flex flex-col fixed left-0 top-0 z-40 shadow-xl"
      style={{ background: branding.sidebarBg }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: branding.sidebarAccent + '40' }}>
        <div className="flex items-center gap-3">
          {branding.logo
            ? <img src={branding.logo} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" alt="logo" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: branding.sidebarAccent }}>👨‍🏫</div>}
          <div className="min-w-0">
            <p className="font-bold text-sm text-white truncate">{slug?.toUpperCase() || 'SCHOOL'}</p>
            <p className="text-xs opacity-60" style={{ color: branding.sidebarText }}>Teacher Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.key} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: active ? branding.sidebarAccent : 'transparent', color: active ? '#fff' : branding.sidebarText }}>
              <span className="text-base">{item.icon}</span>{item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t" style={{ borderColor: branding.sidebarAccent + '40' }}>
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: branding.sidebarAccent }}>{user?.name?.[0] || 'T'}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Teacher'}</p>
            <p className="text-xs truncate opacity-60" style={{ color: branding.sidebarText }}>{user?.email || ''}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:bg-red-900 hover:text-red-300"
          style={{ color: branding.sidebarText }}>🚪 Sign Out</button>
      </div>
    </aside>
  );
}
