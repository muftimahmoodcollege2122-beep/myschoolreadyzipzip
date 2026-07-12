'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Topbar } from '@/components/layout/topbar';
import Link from 'next/link';

const QUICK_LINKS = [
  { icon:'👩‍🎓', label:'Students',   href:'/students',   color:'bg-blue-600' },
  { icon:'👨‍🏫', label:'Teachers',   href:'/teachers',   color:'bg-purple-600' },
  { icon:'✅',   label:'Attendance', href:'/attendance', color:'bg-green-600' },
  { icon:'💰',   label:'Fees',       href:'/fees',       color:'bg-amber-500' },
  { icon:'📝',   label:'Exams',      href:'/exams',      color:'bg-red-600' },
  { icon:'📢',   label:'Notices',    href:'/notices',    color:'bg-indigo-600' },
  { icon:'🗓️',   label:'Timetable',  href:'/timetable',  color:'bg-teal-600' },
  { icon:'🔗',   label:'Portals',    href:'/portal-links',color:'bg-pink-600' },
];

export default function DashboardPage() {
  const { data: stats }   = useQuery({ queryKey:['dash-stats'],   queryFn:()=>apiClient.get('/school/stats'),              staleTime:60000 });
  const { data: attToday} = useQuery({ queryKey:['att-today'],    queryFn:()=>apiClient.get('/attendance/today/summary'), staleTime:30000 });
  const { data: aiDash }  = useQuery({ queryKey:['ai-dashboard'], queryFn:()=>apiClient.get('/ai-analytics/dashboard'),   staleTime:120000 });

  const s: any = stats ?? {};
  const a: any = attToday ?? {};
  const ai: any = aiDash ?? {};

  const STATS = [
    { label:'Total Students', value: s.totalStudents ?? ai.students ?? '—', icon:'👩‍🎓', color:'bg-blue-600',  href:'/students' },
    { label:'Teachers',       value: s.totalTeachers ?? '—',                icon:'👨‍🏫', color:'bg-purple-600', href:'/teachers' },
    { label:'Present Today',  value: a.present != null ? `${a.present} (${a.presentRate ?? 0}%)` : '—', icon:'✅', color:'bg-green-600', href:'/attendance' },
    { label:'Overdue Fees',   value: s.overdueInvoices ?? ai.overdueInvoices ?? '—', icon:'💰', color:'bg-amber-500', href:'/fees' },
    { label:'Active Classes', value: s.totalClasses ?? '—',                 icon:'🏫', color:'bg-indigo-600', href:'/classes' },
    { label:'School Score',   value: ai.kpis?.overall != null ? `${ai.kpis.overall}%` : '—', icon:'🎯', color:'bg-rose-600', href:'/ai-analytics' },
  ];

  return (
    <>
      <Topbar title="Dashboard" subtitle="School overview" />
      <div className="page-padding space-y-5">

        {/* Stats Grid */}
        <div className="grid-responsive-3" style={{gap:'0.75rem'}}>
          {STATS.map(s => (
            <Link key={s.label} href={s.href}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className={`${s.color} w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0`}>{s.icon}</div>
              <div className="min-w-0">
                <p className="text-responsive-stat text-gray-900">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Access</h2>
          <div className="grid-responsive-4" style={{gap:'0.75rem'}}>
            {QUICK_LINKS.map(q => (
              <Link key={q.href} href={q.href}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group hover:-translate-y-0.5">
                <div className={`${q.color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-105 transition-transform`}>{q.icon}</div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        {ai.kpis && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
            <h2 className="font-black text-lg mb-4">🤖 AI School Insights</h2>
            <div className="grid-responsive-3" style={{gap:'0.75rem'}}>
              {[
                { label:'Attendance Rate', value:`${ai.kpis.engagement ?? 0}%`, target:85 },
                { label:'Fee Collection',  value:`${ai.kpis.financial  ?? 0}%`, target:78 },
                { label:'Academic Score',  value:`${ai.kpis.academic   ?? 0}%`, target:75 },
              ].map(m => (
                <div key={m.label} className="bg-white/10 rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-1">{m.label}</p>
                  <p className="text-2xl font-black">{m.value}</p>
                  <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{width:m.value}} />
                  </div>
                  <p className="text-white/50 text-xs mt-1">Target: {m.target}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
