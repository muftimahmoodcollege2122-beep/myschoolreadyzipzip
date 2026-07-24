'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useAuth } from '@/hooks/use-auth';

type NavItem = { href: string; icon: string; label: string; roles: string[]; children?: NavItem[] };
type NavSection = { title: string; items: NavItem[] };

const sections: NavSection[] = [
  { title: 'Overview', items: [
    { href: '/dashboard',         icon: '📊', label: 'Dashboard',           roles: ['SCHOOL_ADMIN','TEACHER','SUPER_ADMIN','STUDENT','PARENT'] },
  ]},
  { title: 'Academic', items: [
    { href: '/students',          icon: '👩‍🎓', label: 'Students',           roles: ['SCHOOL_ADMIN','TEACHER'], children: [
      { href: '/students',                  icon: '📋', label: 'All Students',        roles: ['SCHOOL_ADMIN','TEACHER'] },
      { href: '/students/id-cards',         icon: '🪪', label: 'ID Cards',            roles: ['SCHOOL_ADMIN'] },
      { href: '/students/promotions',       icon: '⬆️', label: 'Promotions & Transfers', roles: ['SCHOOL_ADMIN'] },
    ]},
    { href: '/teachers',          icon: '👨‍🏫', label: 'Teachers',           roles: ['SCHOOL_ADMIN'] },
  ]},
  { title: 'Portals', items: [
    { href: '/teacher-portal',    icon: '👨‍🏫', label: 'Teacher Portal',    roles: ['TEACHER','SCHOOL_ADMIN'] },
    { href: '/student-portal',    icon: '👩‍🎓', label: 'Student Portal',    roles: ['STUDENT','SCHOOL_ADMIN'] },
    { href: '/parent-portal',     icon: '👨‍👩‍👧', label: 'Parent Portal',     roles: ['PARENT','SCHOOL_ADMIN'] },
  ]},
  { title: 'Content', items: [
    { href: '/website-builder',   icon: '🌐', label: 'Website Builder',    roles: ['SCHOOL_ADMIN'] },
    { href: '/portal-links',      icon: '🔗', label: 'Portal Links',       roles: ['SCHOOL_ADMIN'] },
  ]},
  { title: 'System', items: [
    { href: '/settings',          icon: '⚙️', label: 'Settings',           roles: ['SCHOOL_ADMIN'] },
  ]},
];

// Quick access items shown in bottom mobile nav
const MOBILE_QUICK = ['/dashboard', '/students', '/settings'];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const path     = usePathname();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({});

  // Close sidebar on route change (mobile)
  useEffect(() => { onClose(); }, [path, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const isActive = (href: string) => path === href || path.startsWith(href + '/');
  const canSee   = (roles: string[]) => user && roles.includes(user.role);
  const hasActiveChild = (item: NavItem) => item.children?.some(c => isActive(c.href)) ?? false;
  const isExpanded = (item: NavItem) => expanded[item.href] ?? hasActiveChild(item);
  const toggleExpanded = (href: string) => setExpanded(prev => ({ ...prev, [href]: !(prev[href] ?? false) }));

  const SidebarContent = (
    <aside className={`h-full bg-[#0F2137] flex flex-col transition-all duration-200 ${collapsed ? 'w-[64px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">M</div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">MySchool</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wide">School Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 hidden lg:block"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="text-white/50 hover:text-white lg:hidden ml-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
        {sections.map(section => {
          const visible = section.items.filter(i => canSee(i.roles));
          if (!visible.length) return null;
          return (
            <div key={section.title} className="mb-1">
              {!collapsed && (
                <p className="px-4 py-1.5 text-[10px] font-bold text-white/25 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              {visible.map(item => {
                const active = isActive(item.href);
                const kids = item.children?.filter(c => canSee(c.roles)) ?? [];
                const open = kids.length > 0 && isExpanded(item);

                if (kids.length > 0 && !collapsed) {
                  return (
                    <div key={item.href}>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.href)}
                        className={`w-full flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all ${
                          active ? 'bg-blue-600/30 text-white' : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                        }`}
                        style={{ width: 'calc(100% - 16px)' }}
                      >
                        <span className="text-base flex-shrink-0 leading-none">{item.icon}</span>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {open && (
                        <div className="ml-4 pl-3 border-l border-white/10 mb-1">
                          {kids.map(child => {
                            const childActive = isActive(child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg mb-0.5 text-[13px] font-medium transition-all ${
                                  childActive ? 'bg-blue-600/25 text-white' : 'text-white/45 hover:text-white/85 hover:bg-white/5'
                                }`}
                              >
                                <span className="text-sm flex-shrink-0 leading-none">{child.icon}</span>
                                <span className="truncate">{child.label}</span>
                                {childActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all group relative ${
                      active
                        ? 'bg-blue-600/30 text-white'
                        : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base flex-shrink-0 leading-none">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {active && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                    {active && collapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-500 rounded-r-full" />}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="mx-2 mt-2 mb-1">
            <Link href="/super-admin" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all ${collapsed ? 'justify-center' : ''}`}>
              <span>👑</span>
              {!collapsed && <span>Super Admin Panel</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-2 border-t border-white/10 flex-shrink-0">
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          onClick={logout}>
          <div className="w-8 h-8 rounded-lg bg-blue-600/40 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.profile?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim() : user?.email}
              </p>
              <p className="text-white/30 text-[10px]">{user?.role}</p>
            </div>
          )}
          {!collapsed && <span className="text-white/30 text-xs">⏻</span>}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0">
        {SidebarContent}
      </div>

      {/* Mobile/Tablet overlay drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          {/* Drawer — force expanded on mobile */}
          <div className="relative z-10 h-full flex">
            <aside className="h-full w-[280px] bg-[#0F2137] flex flex-col overflow-hidden shadow-2xl">
              {/* Logo + close */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">MySchool</p>
                  <p className="text-white/30 text-[10px] uppercase tracking-wide">School Portal</p>
                </div>
                <button onClick={onClose} className="text-white/50 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
                {sections.map(section => {
                  const visible = section.items.filter(i => canSee(i.roles));
                  if (!visible.length) return null;
                  return (
                    <div key={section.title} className="mb-1">
                      <p className="px-4 py-1.5 text-[10px] font-bold text-white/25 uppercase tracking-wider">{section.title}</p>
                      {visible.map(item => {
                        const active = isActive(item.href);
                        const kids = item.children?.filter(c => canSee(c.roles)) ?? [];
                        const open = kids.length > 0 && isExpanded(item);

                        if (kids.length > 0) {
                          return (
                            <div key={item.href}>
                              <button
                                type="button"
                                onClick={() => toggleExpanded(item.href)}
                                className={`w-full flex items-center gap-3 mx-2 px-3 py-3 rounded-lg mb-0.5 text-sm font-medium transition-all ${active ? 'bg-blue-600/30 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                style={{ width: 'calc(100% - 16px)' }}
                              >
                                <span className="text-lg flex-shrink-0">{item.icon}</span>
                                <span className="flex-1 text-left">{item.label}</span>
                                <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              {open && (
                                <div className="ml-4 pl-3 border-l border-white/10 mb-1">
                                  {kids.map(child => {
                                    const childActive = isActive(child.href);
                                    return (
                                      <Link key={child.href} href={child.href}
                                        className={`flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-lg mb-0.5 text-[13px] font-medium transition-all ${childActive ? 'bg-blue-600/25 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                                        <span className="text-sm flex-shrink-0">{child.icon}</span>
                                        <span>{child.label}</span>
                                        {childActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <Link key={item.href} href={item.href}
                            className={`flex items-center gap-3 mx-2 px-3 py-3 rounded-lg mb-0.5 text-sm font-medium transition-all ${active ? 'bg-blue-600/30 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
                {user?.role === 'SUPER_ADMIN' && (
                  <div className="mx-2 mt-2 mb-1">
                    <Link href="/super-admin" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all">
                      <span className="text-lg flex-shrink-0">👑</span>
                      <span>Super Admin Panel</span>
                    </Link>
                  </div>
                )}
              </nav>
              <div className="p-3 border-t border-white/10">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5" onClick={logout}>
                  <div className="w-9 h-9 rounded-xl bg-blue-600/40 flex items-center justify-center text-white font-bold">
                    {user?.profile?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim() : user?.email}
                    </p>
                    <p className="text-white/40 text-xs">{user?.role} · Tap to logout</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
