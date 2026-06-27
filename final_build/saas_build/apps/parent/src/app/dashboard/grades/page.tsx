'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { useParentAuth } from '../../../stores/auth.store';
import dayjs from 'dayjs';

export default function ParentGradesPage() {
  const { children: storedChildren } = useParentAuth();
  const [activeChild, setActiveChild] = useState(0);

  const { data: children } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  () => api.get('/parents/my-children').catch(() => storedChildren || []),
  });

  const childList = Array.isArray(children) ? children as any[] : storedChildren;
  const child = childList?.[activeChild];

  const { data, isLoading } = useQuery({
    queryKey: ['child-grades', child?.id],
    queryFn:  () => child?.id ? api.get(`/results/student/${child.id}?limit=100`).catch(() => []) : Promise.resolve([]),
    enabled: !!child?.id,
  });

  const results: any[] = Array.isArray(data) ? data : [];
  const avg = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : null;

  const GRADE = (p: number) => p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : 'F';
  const GC = (p: number) => p >= 50 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50';

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Academic Grades</h1>
          <p className="text-gray-500 text-sm">Performance report by exam</p>
        </div>
        {avg != null && (
          <div className="text-center bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3">
            <p className="text-xs text-rose-600 font-semibold">Overall Average</p>
            <p className={`text-3xl font-black ${avg >= 50 ? 'text-rose-700' : 'text-red-700'}`}>{avg}%</p>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${GC(avg)}`}>{GRADE(avg)}</span>
          </div>
        )}
      </div>

      {childList?.length > 1 && (
        <div className="flex gap-2">
          {childList.map((c: any, i: number) => (
            <button key={i} onClick={() => setActiveChild(i)}
              className={`px-3 py-2 rounded-xl border text-sm font-medium ${activeChild === i ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📊</p>
            No results published yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Exam', 'Subject', 'Marks', 'Total', 'Percentage', 'Grade', 'Date'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{r.exam?.title || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{r.subject?.name || '—'}</td>
                      <td className="px-5 py-3.5 font-bold">{r.marksObtained}</td>
                      <td className="px-5 py-3.5 text-gray-400">{r.totalMarks}</td>
                      <td className="px-5 py-3.5"><span className={`font-black ${r.percentage >= 50 ? 'text-green-700' : 'text-red-700'}`}>{r.percentage}%</span></td>
                      <td className="px-5 py-3.5"><span className={`text-xs font-black px-2.5 py-1 rounded-full ${GC(r.percentage)}`}>{GRADE(r.percentage)}</span></td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{dayjs(r.createdAt).format('MMM D, YYYY')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  );
}
