'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentAssignmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-assignments-all'],
    queryFn:  () => api.get('/assignments/mine?limit=50').catch(() => []),
  });

  const assignments: any[] = Array.isArray(data) ? data : [];
  const active  = assignments.filter(a => dayjs(a.dueDate).isAfter(dayjs()));
  const overdue = assignments.filter(a => dayjs(a.dueDate).isBefore(dayjs()));

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Assignments</h1>
        <p className="text-gray-500 text-sm">{active.length} active · {overdue.length} overdue</p>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p> : (
        <>
          {overdue.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-red-700 mb-3">⚠️ Overdue ({overdue.length})</h2>
              <div className="space-y-3">
                {overdue.map((a: any) => (
                  <div key={a.id} className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{a.title}</h3>
                        {a.description && <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{a.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>📚 {a.subject?.name || '—'}</span>
                          <span>📊 {a.totalMarks} marks</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-red-600">Was due</p>
                        <p className="text-xs text-red-500">{dayjs(a.dueDate).format('MMM D, YYYY')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-800 mb-3">📋 Active Assignments ({active.length})</h2>
              <div className="space-y-3">
                {active.map((a: any) => {
                  const daysLeft = dayjs(a.dueDate).diff(dayjs(), 'day');
                  return (
                    <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{a.title}</h3>
                          {a.description && <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{a.description}</p>}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>📚 {a.subject?.name || '—'}</span>
                            <span>📊 {a.totalMarks} marks</span>
                            <span>👨‍🏫 {a.teacher?.user?.name || '—'}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xs font-bold ${daysLeft <= 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                            {daysLeft === 0 ? 'Due today!' : daysLeft === 1 ? 'Due tomorrow!' : `${daysLeft} days left`}
                          </p>
                          <p className="text-xs text-gray-400">{dayjs(a.dueDate).format('MMM D')}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.max(5, 100 - (daysLeft / 14) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {assignments.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <p className="text-3xl mb-3">🎉</p>
              No assignments right now! Enjoy your free time.
            </div>
          )}
        </>
      )}
    </div>
  );
}
