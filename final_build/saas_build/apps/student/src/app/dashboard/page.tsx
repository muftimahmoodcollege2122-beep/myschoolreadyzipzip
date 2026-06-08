'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useStudentAuth } from '../../stores/auth.store';
import dayjs from 'dayjs';

function StatCard({ icon, label, value, sub, color, bg }: any) {
  return (
    <div className={`${bg} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold opacity-70">{label}</p>
          <p className={`text-3xl font-black mt-1 ${color}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, slug } = useStudentAuth();
  const [now, setNow] = useState(dayjs());
  useEffect(() => { const t = setInterval(() => setNow(dayjs()), 60_000); return () => clearInterval(t); }, []);

  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn:  () => api.get('/students/me').catch(() => null),
  });

  const { data: timetable } = useQuery({
    queryKey: ['student-timetable'],
    queryFn:  () => api.get('/timetable/mine').catch(() => []),
  });

  const { data: assignments } = useQuery({
    queryKey: ['student-assignments'],
    queryFn:  () => api.get('/assignments/mine?limit=6').catch(() => []),
  });

  const { data: attendance } = useQuery({
    queryKey: ['student-attendance-summary'],
    queryFn:  () => api.get('/attendance/my-summary').catch(() => null),
  });

  const { data: results } = useQuery({
    queryKey: ['student-results'],
    queryFn:  () => api.get('/results/mine?limit=3').catch(() => []),
  });

  const { data: announcements } = useQuery({
    queryKey: ['student-announcements'],
    queryFn:  () => api.get('/announcements?limit=3').catch(() => []),
  });

  const todayDay = now.format('dddd').toUpperCase();
  const todaySlots = Array.isArray(timetable) ? (timetable as any[]).filter((t: any) => t.dayOfWeek === todayDay) : [];
  const p = (profile as any) || {};
  const att = (attendance as any) || {};
  const greeting = now.hour() < 12 ? 'Good morning' : now.hour() < 17 ? 'Good afternoon' : 'Good evening';
  const attPct = att.percentage != null ? Math.round(att.percentage) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">{greeting}, {user?.name?.split(' ')[0] || 'Student'} 👋</h1>
            <p className="text-violet-200 text-sm mt-1">{now.format('dddd, MMMM D, YYYY')}</p>
            <div className="flex items-center gap-4 mt-3">
              {p.rollNumber && <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-mono">Roll # {p.rollNumber}</span>}
              {p.section?.name && <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{p.section?.class?.name} - {p.section?.name}</span>}
            </div>
          </div>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
              attPct == null ? 'bg-white/20' : attPct >= 75 ? 'bg-green-400/20' : 'bg-red-400/20'
            }`}>
              {attPct != null ? `${attPct}%` : '👩‍🎓'}
            </div>
            <p className="text-xs text-violet-200 mt-1">Attendance</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Classes Today"   value={todaySlots.length}       bg="bg-violet-50 border-violet-100" color="text-violet-700" />
        <StatCard icon="📋" label="Due Assignments"
          value={Array.isArray(assignments) ? (assignments as any[]).filter((a: any) => a.status === 'ACTIVE').length : 0}
          bg="bg-orange-50 border-orange-100" color="text-orange-700" />
        <StatCard icon="✅" label="Present Days"    value={att.presentDays}         bg="bg-green-50 border-green-100"   color="text-green-700" />
        <StatCard icon="📊" label="GPA / Avg"
          value={Array.isArray(results) && (results as any[]).length ? `${(results as any[])[0].percentage || '—'}%` : '—'}
          bg="bg-indigo-50 border-indigo-100" color="text-indigo-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Timetable */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📅 Today's Classes</h3>
            <a href="/dashboard/timetable" className="text-xs text-violet-600 font-semibold hover:underline">Full Week →</a>
          </div>
          <div className="p-4 space-y-2">
            {todaySlots.length > 0 ? todaySlots.map((slot: any, i: number) => {
              const isNow = slot.startTime <= now.format('HH:mm') && slot.endTime >= now.format('HH:mm');
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border ${isNow ? 'bg-violet-50 border-violet-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="text-center min-w-[52px]">
                    <p className={`text-xs font-bold ${isNow ? 'text-violet-700' : 'text-gray-600'}`}>{slot.startTime}</p>
                    <p className="text-[10px] text-gray-400">{slot.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isNow ? 'text-violet-800' : 'text-gray-800'}`}>
                      {slot.subject?.name || slot.subjectName}
                    </p>
                    <p className="text-xs text-gray-400">{slot.teacher?.user?.name || 'Teacher TBA'} · Room {slot.roomNumber || 'TBA'}</p>
                  </div>
                  {isNow && <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">NOW</span>}
                </div>
              );
            }) : (
              <div className="text-center py-8 text-sm text-gray-400">
                <span className="text-2xl block mb-2">🎉</span>
                No classes scheduled today!
              </div>
            )}
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📋 Assignments</h3>
            <a href="/dashboard/assignments" className="text-xs text-violet-600 font-semibold hover:underline">View All →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(assignments) && (assignments as any[]).length > 0
              ? (assignments as any[]).slice(0, 5).map((a: any, i: number) => {
                  const due = dayjs(a.dueDate);
                  const overdue = due.isBefore(now);
                  return (
                    <div key={i} className="px-5 py-3 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-red-500' : 'bg-orange-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                        <p className="text-xs text-gray-400">{a.subject?.name || '—'} · Due {due.format('MMM D')}</p>
                      </div>
                      {overdue && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Overdue</span>}
                    </div>
                  );
                })
              : <div className="px-5 py-8 text-center text-sm text-gray-400">No assignments right now! 🎉</div>
            }
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">🏆 Recent Results</h3>
            <a href="/dashboard/results" className="text-xs text-violet-600 font-semibold hover:underline">All Results →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(results) && (results as any[]).length > 0
              ? (results as any[]).slice(0, 4).map((r: any, i: number) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{r.exam?.title || r.examName}</p>
                      <p className="text-xs text-gray-400">{r.subject?.name || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black ${r.percentage >= 50 ? 'text-green-700' : 'text-red-700'}`}>{r.percentage}%</p>
                      <p className="text-xs text-gray-400">{r.marksObtained}/{r.totalMarks}</p>
                    </div>
                  </div>
                ))
              : <div className="px-5 py-8 text-center text-sm text-gray-400">No results published yet.</div>
            }
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📢 School Announcements</h3>
            <a href="/dashboard/announcements" className="text-xs text-violet-600 font-semibold hover:underline">All →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(announcements) && (announcements as any[]).length > 0
              ? (announcements as any[]).slice(0, 3).map((a: any, i: number) => (
                  <div key={i} className="px-5 py-3">
                    <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.body || a.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{dayjs(a.createdAt).format('MMM D, YYYY')}</p>
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
