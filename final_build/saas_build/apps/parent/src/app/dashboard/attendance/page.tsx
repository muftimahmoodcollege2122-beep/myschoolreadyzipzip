'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { useParentAuth } from '../../../stores/auth.store';
import dayjs from 'dayjs';

export default function ParentAttendancePage() {
  const { children: storedChildren } = useParentAuth();
  const [activeChild, setActiveChild] = useState(0);

  const { data: children } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  () => api.get('/parents/my-children').catch(() => storedChildren || []),
  });

  const childList = Array.isArray(children) ? children as any[] : storedChildren;
  const child = childList?.[activeChild];

  const { data: summary } = useQuery({
    queryKey: ['child-att-summary', child?.id],
    queryFn:  () => child?.id ? api.get(`/attendance/student/${child.id}/summary`).catch(() => null) : Promise.resolve(null),
    enabled: !!child?.id,
  });

  const { data: records } = useQuery({
    queryKey: ['child-att-records', child?.id],
    queryFn:  () => child?.id ? api.get(`/attendance/student/${child.id}?limit=60`).catch(() => []) : Promise.resolve([]),
    enabled: !!child?.id,
  });

  const att = (summary as any) || {};
  const list: any[] = Array.isArray(records) ? records : [];
  const pct = att.percentage != null ? Math.round(att.percentage) : null;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm">Track your child's daily attendance</p>
      </div>

      {childList?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {childList.map((c: any, i: number) => (
            <button key={i} onClick={() => setActiveChild(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap ${
                activeChild === i ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {child && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{child.name} — Attendance</h3>
            {pct != null && <span className={`text-2xl font-black ${pct >= 75 ? 'text-green-700' : 'text-red-700'}`}>{pct}%</span>}
          </div>
          {pct != null && (
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full ${pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {[['✅ Present', att.presentDays || 0, 'bg-green-50 text-green-700'], ['❌ Absent', att.absentDays || 0, 'bg-red-50 text-red-700'], ['⏰ Late', att.lateDays || 0, 'bg-orange-50 text-orange-700']].map(([label, val, cls]) => (
              <div key={label as string} className={`${cls} rounded-xl p-3 text-center`}>
                <p className="text-xl font-black">{val as number}</p>
                <p className="text-xs font-semibold">{label}</p>
              </div>
            ))}
          </div>
          {pct != null && pct < 75 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              ⚠️ {child.name}'s attendance is below 75%. Please ensure they attend school regularly to avoid academic issues.
            </div>
          )}
        </div>
      )}

      {list.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Recent Attendance Records</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {list.slice(0, 30).map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-[56px]">
                  <p className="text-xs font-bold text-gray-700">{dayjs(r.date).format('MMM D')}</p>
                  <p className="text-[10px] text-gray-400">{dayjs(r.date).format('dddd')}</p>
                </div>
                <div className="flex-1 text-xs text-gray-500">{r.subject?.name || '—'}</div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  r.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                  r.status === 'ABSENT'  ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
