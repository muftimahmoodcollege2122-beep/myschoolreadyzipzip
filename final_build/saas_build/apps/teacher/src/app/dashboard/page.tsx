'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useTeacherAuth } from '../../stores/auth.store';
import dayjs from 'dayjs';

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-black mt-1 ${color}`}>{value ?? '—'}</p>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gray-50">{icon}</div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user, slug } = useTeacherAuth();
  const [now, setNow] = useState(dayjs());
  useEffect(() => { const t = setInterval(() => setNow(dayjs()), 60_000); return () => clearInterval(t); }, []);

  const { data: profile } = useQuery({
    queryKey: ['teacher-profile'],
    queryFn:  () => api.get('/teachers/me').catch(() => null),
  });

  const { data: timetable } = useQuery({
    queryKey: ['teacher-timetable'],
    queryFn:  () => api.get('/timetable/mine').catch(() => []),
  });

  const { data: assignments } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn:  () => api.get('/assignments/mine?limit=5').catch(() => []),
  });

  const { data: announcements } = useQuery({
    queryKey: ['teacher-announcements'],
    queryFn:  () => api.get('/announcements?limit=4').catch(() => []),
  });

  const todayDay = now.format('dddd').toUpperCase();
  const todaySlots = Array.isArray(timetable) ? (timetable as any[]).filter((t: any) => t.dayOfWeek === todayDay) : [];
  const p = (profile as any) || {};
  const greeting = now.hour() < 12 ? 'Good morning' : now.hour() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{greeting}, {user?.name?.split(' ')[0] || 'Teacher'} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">{now.format('dddd, MMMM D, YYYY')} · {slug?.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Today's Classes</p>
          <p className="text-2xl font-black text-teal-600">{todaySlots.length}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👩‍🎓" label="My Students"      value={p.studentCount}   color="text-teal-700" />
        <StatCard icon="📚" label="Subjects"          value={p.subjectCount}   color="text-indigo-700" />
        <StatCard icon="📋" label="Assignments"       value={Array.isArray(assignments) ? assignments.length : 0} color="text-orange-700" />
        <StatCard icon="📅" label="Classes This Week" value={Array.isArray(timetable) ? timetable.length : 0} color="text-violet-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📅 Today's Schedule ({todayDay})</h3>
            <a href="/dashboard/timetable" className="text-xs text-teal-600 font-semibold hover:underline">Full Week →</a>
          </div>
          <div className="p-4 space-y-2">
            {todaySlots.length > 0 ? todaySlots.map((slot: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
                <div className="text-center min-w-[52px]">
                  <p className="text-xs font-bold text-teal-700">{slot.startTime}</p>
                  <p className="text-[10px] text-teal-500">{slot.endTime}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{slot.subject?.name || slot.subjectName}</p>
                  <p className="text-xs text-gray-500">{slot.section?.name || slot.class?.name} · Room {slot.roomNumber || 'TBA'}</p>
                </div>
                <a href="/dashboard/attendance" className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded-lg font-medium hover:bg-teal-700 transition-colors whitespace-nowrap">
                  Attendance
                </a>
              </div>
            )) : (
              <div className="text-center py-8 text-sm text-gray-400">
                <span className="text-2xl block mb-2">🎉</span>
                No classes today. Enjoy your day!
              </div>
            )}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📋 Recent Assignments</h3>
            <a href="/dashboard/assignments" className="text-xs text-teal-600 font-semibold hover:underline">Manage →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(assignments) && (assignments as any[]).length > 0
              ? (assignments as any[]).slice(0, 5).map((a: any, i: number) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">📋</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">Due: {dayjs(a.dueDate).format('MMM D, YYYY')}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{a.status}</span>
                  </div>
                ))
              : (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No assignments yet. <a href="/dashboard/assignments?action=add" className="text-teal-600 font-medium">Create one →</a>
                </div>
              )
            }
          </div>
        </div>

        {/* Quick Grade Entry */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">⚡ Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { icon: '✅', label: 'Mark Attendance', href: '/dashboard/attendance', color: 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100' },
              { icon: '📝', label: 'New Assignment',  href: '/dashboard/assignments?action=add', color: 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100' },
              { icon: '📊', label: 'Enter Grades',    href: '/dashboard/grades', color: 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100' },
              { icon: '📚', label: 'Upload Resource', href: '/dashboard/resources?action=add', color: 'bg-violet-50 border-violet-100 text-violet-700 hover:bg-violet-100' },
            ].map(({ icon, label, href, color }) => (
              <a key={href} href={href}
                className={`flex items-center gap-2.5 ${color} border rounded-xl p-3 text-sm font-semibold transition-all`}>
                <span className="text-xl">{icon}</span> {label}
              </a>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📢 Announcements</h3>
            <a href="/dashboard/announcements" className="text-xs text-teal-600 font-semibold hover:underline">All →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(announcements) && (announcements as any[]).length > 0
              ? (announcements as any[]).slice(0, 4).map((a: any, i: number) => (
                  <div key={i} className="px-5 py-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{dayjs(a.createdAt).format('MMM D, YYYY')}</p>
                  </div>
                ))
              : <div className="px-5 py-8 text-center text-sm text-gray-400">No announcements from school.</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
