'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentResultsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-results-page'],
    queryFn:  () => api.get('/results/mine?limit=100').catch(() => []),
  });

  const results: any[] = Array.isArray(data) ? data : [];
  const avg = results.length ? Math.round(results.reduce((a, r) => a + (r.percentage || 0), 0) / results.length) : null;
  const GRADE = (p: number) => p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : 'F';

  const byExam = results.reduce((acc, r) => {
    const key = r.exam?.title || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Results</h1>
          <p className="text-gray-500 text-sm">All exam results and academic performance</p>
        </div>
        {avg != null && (
          <div className="text-center bg-violet-50 border border-violet-200 rounded-2xl px-5 py-3">
            <p className="text-xs text-violet-600 font-semibold">Overall Average</p>
            <p className={`text-3xl font-black ${avg >= 50 ? 'text-violet-700' : 'text-red-700'}`}>{avg}%</p>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full mt-0.5 inline-block ${avg >= 50 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>{GRADE(avg)}</span>
          </div>
        )}
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">🏆</p>
            No results published yet.
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byExam).map(([examTitle, examResults]: [string, any[]]) => {
              const examAvg = Math.round(examResults.reduce((a, r) => a + (r.percentage || 0), 0) / examResults.length);
              return (
                <div key={examTitle} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">{examTitle}</h3>
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${examAvg >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Avg: {examAvg}% ({GRADE(examAvg)})
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {examResults.map((r: any, i: number) => (
                      <div key={i} className={`rounded-xl p-3 border text-center ${r.percentage >= 50 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <p className="text-xs font-semibold text-gray-600 mb-1 truncate">{r.subject?.name || '—'}</p>
                        <p className={`text-2xl font-black ${r.percentage >= 50 ? 'text-green-700' : 'text-red-700'}`}>{r.percentage}%</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.marksObtained}/{r.totalMarks}</p>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${r.percentage >= 50 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{GRADE(r.percentage)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
