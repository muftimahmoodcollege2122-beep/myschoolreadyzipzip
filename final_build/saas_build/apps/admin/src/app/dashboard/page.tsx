'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useAdminAuth } from '../../stores/auth.store';
import dayjs from 'dayjs';

function StatCard({ icon, label, value, sub, color }: any) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-black mt-1 ${color}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-50`}>{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick, color }: any) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all text-sm font-semibold ${color}`}>
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  );
}

export default function AdminDashboard() {
  const { user, slug } = useAdminAuth();
  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 60_000);
    return () => clearInterval(t);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats', slug],
    queryFn:  () => api.get('/dashboard/stats').catch(() => null),
    retry: 1,
  });

  const { data: announcements } = useQuery({
    queryKey: ['admin-announcements', slug],
    queryFn:  () => api.get('/announcements', { limit: 5 }).catch(() => []),
    retry: 1,
  });

  const { data: recentStudents } = useQuery({
    queryKey: ['admin-recent-students', slug],
    queryFn:  () => api.get('/students', { limit: 5, sortBy: 'createdAt', order: 'desc' }).catch(() => []),
    retry: 1,
  });

  const s = (stats as any) || {};
  const greeting = now.hour() < 12 ? 'Good morning' : now.hour() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">{now.format('dddd, MMMM D, YYYY')} · {slug?.toUpperCase()} Admin Panel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">School Status</p>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👩‍🎓" label="Total Students"  value={s.totalStudents}  sub="enrolled this session"  color="text-indigo-700" />
        <StatCard icon="👨‍🏫" label="Total Teachers"  value={s.totalTeachers}  sub="active staff members"  color="text-teal-700" />
        <StatCard icon="📚" label="Total Classes"   value={s.totalClasses}   sub="active classes"         color="text-violet-700" />
        <StatCard icon="💰" label="Fee Collection"  value={s.feeCollection ? `Rs. ${Number(s.feeCollection).toLocaleString()}` : 'N/A'} sub="this month" color="text-emerald-700" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="✅" label="Present Today"   value={s.presentToday}   sub="students attended"      color="text-green-700" />
        <StatCard icon="❌" label="Absent Today"    value={s.absentToday}    sub="students absent"        color="text-red-700" />
        <StatCard icon="📋" label="Pending Exams"   value={s.pendingExams}   sub="upcoming assessments"   color="text-orange-700" />
        <StatCard icon="💬" label="Announcements"   value={Array.isArray(announcements) ? announcements.length : 0} sub="active notices" color="text-blue-700" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <QuickAction icon="➕" label="Add Student"  color="text-indigo-600" onClick={() => window.location.href='/dashboard/students?action=add'} />
          <QuickAction icon="👨‍🏫" label="Add Teacher"  color="text-teal-600"   onClick={() => window.location.href='/dashboard/teachers?action=add'} />
          <QuickAction icon="📝" label="Take Attendance" color="text-green-600" onClick={() => window.location.href='/dashboard/attendance'} />
          <QuickAction icon="💰" label="Add Fee"      color="text-emerald-600" onClick={() => window.location.href='/dashboard/fees?action=add'} />
          <QuickAction icon="📢" label="Announce"    color="text-blue-600"   onClick={() => window.location.href='/dashboard/announcements?action=add'} />
          <QuickAction icon="📊" label="Reports"     color="text-violet-600" onClick={() => window.location.href='/dashboard/reports'} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Recently Enrolled Students</h3>
            <a href="/dashboard/students" className="text-xs text-indigo-600 font-semibold hover:underline">View All →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(recentStudents) && (recentStudents as any[]).length > 0
              ? (recentStudents as any[]).slice(0, 5).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
                      {s.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.rollNumber} · {s.class?.name || s.section?.class?.name || '—'}</p>
                    </div>
                    <span className="text-xs text-gray-400">{dayjs(s.createdAt).format('MMM D')}</span>
                  </div>
                ))
              : <div className="px-5 py-8 text-center text-sm text-gray-400">No students yet. <a href="/dashboard/students?action=add" className="text-indigo-600 font-medium">Add your first →</a></div>
            }
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Recent Announcements</h3>
            <a href="/dashboard/announcements" className="text-xs text-indigo-600 font-semibold hover:underline">Manage →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(announcements) && (announcements as any[]).length > 0
              ? (announcements as any[]).slice(0, 5).map((a: any, i: number) => (
                  <div key={i} className="px-5 py-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.body || a.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{dayjs(a.createdAt).format('MMM D, YYYY')}</p>
                  </div>
                ))
              : <div className="px-5 py-8 text-center text-sm text-gray-400">No announcements. <a href="/dashboard/announcements?action=add" className="text-indigo-600 font-medium">Create one →</a></div>
            }
          </div>
        </div>
      </div>

      {/* Portal Links */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-3 text-sm">📡 Share Portal Links with Your Community</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: '👨‍🏫 Teacher Portal',  url: `teach.myschool.pk?school=${slug}`,  bg: 'bg-teal-500/30 hover:bg-teal-500/40' },
            { label: '👩‍🎓 Student Portal',  url: `learn.myschool.pk?school=${slug}`,  bg: 'bg-violet-500/30 hover:bg-violet-500/40' },
            { label: '👨‍👩‍👧 Parent Portal', url: `parent.myschool.pk?school=${slug}`, bg: 'bg-rose-500/30 hover:bg-rose-500/40' },
          ].map(({ label, url, bg }) => (
            <button key={url} onClick={() => navigator.clipboard?.writeText(url)}
              className={`${bg} border border-white/20 rounded-xl p-3 text-left transition-all`}>
              <p className="text-xs font-bold mb-0.5">{label}</p>
              <p className="text-[10px] text-white/70 font-mono truncate">{url}</p>
              <p className="text-[9px] text-white/50 mt-1">Click to copy</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
