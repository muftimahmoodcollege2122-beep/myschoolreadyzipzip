'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { useParentAuth } from '../../stores/auth.store';
import dayjs from 'dayjs';

function StatCard({ icon, label, value, sub, bg, color }: any) {
  return (
    <div className={`${bg} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold ${color} opacity-70`}>{label}</p>
          <p className={`text-3xl font-black mt-1 ${color}`}>{value ?? '—'}</p>
          {sub && <p className={`text-xs ${color} opacity-60 mt-1`}>{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function ChildSelector({ children, active, onSelect }: any) {
  if (!children || children.length <= 1) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {children.map((c: any, i: number) => (
        <button key={i} onClick={() => onSelect(i)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
            active === i ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-rose-300'
          }`}>
          <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-700">{c.name?.[0]}</span>
          {c.name}
        </button>
      ))}
    </div>
  );
}

export default function ParentDashboard() {
  const { user, slug, children: storedChildren } = useParentAuth();
  const [now, setNow] = useState(dayjs());
  const [activeChild, setActiveChild] = useState(0);
  useEffect(() => { const t = setInterval(() => setNow(dayjs()), 60_000); return () => clearInterval(t); }, []);

  const { data: children } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  () => api.get('/parents/my-children').catch(() => storedChildren || []),
  });

  const childList = Array.isArray(children) ? children as any[] : storedChildren;
  const currentChild = childList?.[activeChild];

  const { data: attendance } = useQuery({
    queryKey: ['parent-attendance', currentChild?.id],
    queryFn:  () => currentChild?.id ? api.get(`/attendance/student/${currentChild.id}/summary`).catch(() => null) : Promise.resolve(null),
    enabled: !!currentChild?.id,
  });

  const { data: results } = useQuery({
    queryKey: ['parent-results', currentChild?.id],
    queryFn:  () => currentChild?.id ? api.get(`/results/student/${currentChild.id}?limit=4`).catch(() => []) : Promise.resolve([]),
    enabled: !!currentChild?.id,
  });

  const { data: fees } = useQuery({
    queryKey: ['parent-fees', currentChild?.id],
    queryFn:  () => currentChild?.id ? api.get(`/fees/student/${currentChild.id}`).catch(() => null) : Promise.resolve(null),
    enabled: !!currentChild?.id,
  });

  const { data: announcements } = useQuery({
    queryKey: ['parent-announcements'],
    queryFn:  () => api.get('/announcements?limit=4').catch(() => []),
  });

  const att = (attendance as any) || {};
  const f   = (fees as any) || {};
  const attPct = att.percentage != null ? Math.round(att.percentage) : null;
  const greeting = now.hour() < 12 ? 'Good morning' : now.hour() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">{greeting}, {user?.name?.split(' ')[0] || 'Parent'} 👋</h1>
            <p className="text-rose-200 text-sm mt-1">{now.format('dddd, MMMM D, YYYY')} · {slug?.toUpperCase()}</p>
            <p className="text-rose-100 text-xs mt-2">Monitoring {childList?.length || 0} child{childList?.length !== 1 ? 'ren' : ''}</p>
          </div>
          <div className="text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
              attPct == null ? 'bg-white/20' : attPct >= 75 ? 'bg-green-400/20' : 'bg-red-400/20'
            }`}>
              {attPct != null ? <span className="text-lg font-black">{attPct}%</span> : '👨‍👩‍👧'}
            </div>
            <p className="text-xs text-rose-200 mt-1">Attendance</p>
          </div>
        </div>
      </div>

      {/* Child selector */}
      {childList?.length > 1 && (
        <ChildSelector children={childList} active={activeChild} onSelect={setActiveChild} />
      )}

      {currentChild && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-11 h-11 bg-rose-100 rounded-xl flex items-center justify-center text-lg font-bold text-rose-700">
            {currentChild.name?.[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900">{currentChild.name}</p>
            <p className="text-xs text-gray-500">
              {currentChild.section?.class?.name || '—'} · {currentChild.section?.name || '—'} · Roll #{currentChild.rollNumber}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {attPct != null && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                attPct >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {attPct >= 75 ? '✅' : '⚠️'} {attPct}% Attendance
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="✅" label="Present Days"   value={att.presentDays}  sub={`of ${att.totalDays || 0} days`} bg="bg-green-50 border-green-100"  color="text-green-800" />
        <StatCard icon="❌" label="Absent Days"    value={att.absentDays}   sub="this session" bg="bg-red-50 border-red-100"     color="text-red-800" />
        <StatCard icon="💰" label="Fee Due"
          value={f.amountDue ? `Rs. ${Number(f.amountDue).toLocaleString()}` : 'Paid ✓'}
          sub={f.dueDate ? `Due: ${dayjs(f.dueDate).format('MMM D')}` : 'No dues'}
          bg="bg-orange-50 border-orange-100" color="text-orange-800" />
        <StatCard icon="📊" label="Last Result"
          value={Array.isArray(results) && (results as any[]).length ? `${(results as any[])[0].percentage}%` : '—'}
          bg="bg-violet-50 border-violet-100" color="text-violet-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">🏆 Academic Results</h3>
            <a href="/dashboard/results" className="text-xs text-rose-600 font-semibold hover:underline">All →</a>
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

        {/* Fee Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">💰 Fee Status</h3>
            <a href="/dashboard/fees" className="text-xs text-rose-600 font-semibold hover:underline">Details →</a>
          </div>
          <div className="p-5">
            {f.amountDue ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount Due</span>
                  <span className="text-lg font-black text-red-700">Rs. {Number(f.amountDue).toLocaleString()}</span>
                </div>
                {f.dueDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Due Date</span>
                    <span className={`text-sm font-semibold ${dayjs(f.dueDate).isBefore(now) ? 'text-red-600' : 'text-orange-600'}`}>
                      {dayjs(f.dueDate).format('MMMM D, YYYY')}
                    </span>
                  </div>
                )}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
                  ⚠️ Please pay your fee on time to avoid penalty charges.
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-bold text-green-700">All fees are paid!</p>
                <p className="text-xs text-gray-400 mt-1">No outstanding dues</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">✅ Attendance Overview</h3>
          </div>
          <div className="p-5">
            {attPct != null ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className={`text-2xl font-black ${attPct >= 75 ? 'text-green-700' : 'text-red-700'}`}>{attPct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${attPct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${attPct}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-lg font-black text-green-700">{att.presentDays || 0}</p>
                    <p className="text-xs text-green-600">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2">
                    <p className="text-lg font-black text-red-700">{att.absentDays || 0}</p>
                    <p className="text-xs text-red-600">Absent</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2">
                    <p className="text-lg font-black text-orange-700">{att.lateDays || 0}</p>
                    <p className="text-xs text-orange-600">Late</p>
                  </div>
                </div>
                {attPct < 75 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                    ⚠️ Attendance is below the required 75% threshold. Please ensure your child attends school regularly.
                  </div>
                )}
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-6">No attendance data available.</p>}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">📢 School Announcements</h3>
            <a href="/dashboard/announcements" className="text-xs text-rose-600 font-semibold hover:underline">All →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.isArray(announcements) && (announcements as any[]).length > 0
              ? (announcements as any[]).slice(0, 4).map((a: any, i: number) => (
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
