'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentGradesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-results-all'],
    queryFn:  () => api.get('/results/mine?limit=100').catch(() => []),
  });

  const results: any[] = Array.isArray(data) ? data : [];
  const avg = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : null;

  const GRADE = (pct: number) => {
    if (pct >= 90) return { label: 'A+', color: 'text-emerald-700 bg-emerald-50' };
    if (pct >= 80) return { label: 'A',  color: 'text-green-700 bg-green-50' };
    if (pct >= 70) return { label: 'B',  color: 'text-teal-700 bg-teal-50' };
    if (pct >= 60) return { label: 'C',  color: 'text-blue-700 bg-blue-50' };
    if (pct >= 50) return { label: 'D',  color: 'text-yellow-700 bg-yellow-50' };
    return { label: 'F', color: 'text-red-700 bg-red-50' };
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Grades</h1>
          <p className="text-gray-500 text-sm">{results.length} exam results</p>
        </div>
        {avg != null && (
          <div className="text-center bg-violet-50 border border-violet-200 rounded-2xl px-5 py-3">
            <p className="text-xs text-violet-600 font-semibold">Overall Average</p>
            <p className={`text-3xl font-black ${avg >= 50 ? 'text-violet-700' : 'text-red-700'}`}>{avg}%</p>
            <p className={`text-xs font-bold mt-0.5 px-2 py-0.5 rounded-full inline-block ${GRADE(avg).color}`}>{GRADE(avg).label}</p>
          </div>
        )}
      </div>

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
                    {['Exam', 'Subject', 'Marks', 'Total', '%', 'Grade', 'Date'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {results.map((r: any) => {
                    const g = GRADE(r.percentage);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3.5 font-semibold text-gray-900">{r.exam?.title || r.examName || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-600">{r.subject?.name || '—'}</td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">{r.marksObtained}</td>
                        <td className="px-5 py-3.5 text-gray-400">{r.totalMarks}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[60px]">
                              <div className={`h-full rounded-full ${r.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${r.percentage}%` }} />
                            </div>
                            <span className={`font-bold text-sm ${r.percentage >= 50 ? 'text-green-700' : 'text-red-700'}`}>{r.percentage}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${g.color}`}>{g.label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{dayjs(r.createdAt).format('MMM D, YYYY')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  );
}
