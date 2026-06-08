'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentAttendancePage() {
  const { data: summary } = useQuery({
    queryKey: ['my-att-summary'],
    queryFn:  () => api.get('/attendance/my-summary').catch(() => null),
  });

  const { data: records } = useQuery({
    queryKey: ['my-att-records'],
    queryFn:  () => api.get('/attendance/mine?limit=90').catch(() => []),
  });

  const att = (summary as any) || {};
  const list: any[] = Array.isArray(records) ? records : [];
  const pct = att.percentage != null ? Math.round(att.percentage) : null;

  const STATUS_STYLE: any = {
    PRESENT: 'bg-green-100 text-green-700 border-green-200',
    ABSENT:  'bg-red-100 text-red-700 border-red-200',
    LATE:    'bg-orange-100 text-orange-700 border-orange-200',
    HOLIDAY: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm">Track your daily attendance record</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Attendance Overview</h3>
          {pct != null && (
            <span className={`text-2xl font-black ${pct >= 75 ? 'text-green-700' : 'text-red-700'}`}>{pct}%</span>
          )}
        </div>
        {pct != null && (
          <>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
            </div>
            {pct < 75 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
                ⚠️ Your attendance is below 75%. Minimum required attendance may affect your exam eligibility.
              </div>
            )}
          </>
        )}
        <div className="grid grid-cols-3 gap-3">
          {[
            ['✅', 'Present', att.presentDays || 0, 'bg-green-50 text-green-700'],
            ['❌', 'Absent',  att.absentDays || 0,  'bg-red-50 text-red-700'],
            ['⏰', 'Late',    att.lateDays || 0,    'bg-orange-50 text-orange-700'],
          ].map(([icon, label, val, cls]) => (
            <div key={label as string} className={`${cls} rounded-xl p-3 text-center`}>
              <p className="text-2xl">{icon}</p>
              <p className="text-xl font-black">{val as number}</p>
              <p className="text-xs font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Record List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Recent Attendance Records</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {list.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400">No attendance records yet.</div>
          ) : list.slice(0, 30).map((r: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className="text-center min-w-[48px]">
                <p className="text-xs font-bold text-gray-700">{dayjs(r.date).format('MMM D')}</p>
                <p className="text-[10px] text-gray-400">{dayjs(r.date).format('ddd')}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">{r.subject?.name || r.section?.class?.name || '—'}</p>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
