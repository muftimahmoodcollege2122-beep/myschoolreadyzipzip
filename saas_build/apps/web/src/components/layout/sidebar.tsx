'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
const nav = [
  { href:'/dashboard',     icon:'📊', label:'Dashboard',    roles:['SCHOOL_ADMIN','TEACHER','SUPER_ADMIN'] },
  { href:'/students',      icon:'👩‍🎓', label:'Students',     roles:['SCHOOL_ADMIN','TEACHER'] },
  { href:'/attendance',    icon:'✅', label:'Attendance',   roles:['SCHOOL_ADMIN','TEACHER'] },
  { href:'/fees',          icon:'💰', label:'Fees',         roles:['SCHOOL_ADMIN','ACCOUNTANT'] },
  { href:'/exams',         icon:'📝', label:'Exams',        roles:['SCHOOL_ADMIN','TEACHER'] },
  { href:'/teachers',      icon:'👨‍🏫', label:'Teachers',     roles:['SCHOOL_ADMIN'] },
  { href:'/notifications', icon:'🔔', label:'Notifications',roles:['SCHOOL_ADMIN','TEACHER','STUDENT','PARENT'] },
  { href:'/settings',      icon:'⚙️', label:'Settings',     roles:['SCHOOL_ADMIN'] },
];
export function Sidebar() {
  const path = usePathname();
  const { user } = useAuthStore();
  const visible = nav.filter(i => user && i.roles.includes(user.role));
  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#0F2137] flex flex-col z-40">
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">M</div>
        <div><p className="text-white font-bold text-sm">MySchool App</p><p className="text-white/30 text-xs uppercase tracking-wide">School Portal</p></div>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-none">
        {visible.map(item => {
          const active = path === item.href || path.startsWith(item.href+'/');
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${active?'bg-green-500/20 text-white':'text-white/50 hover:text-white/90 hover:bg-white/5'}`}>
              <span className="text-base">{item.icon}</span><span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400"/>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-green-500/30 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.profile?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0"><p className="text-white text-xs font-semibold truncate">{user?.profile?.firstName ?? user?.email}</p><p className="text-white/30 text-xs">{user?.role}</p></div>
        </div>
      </div>
    </aside>
  );
}
