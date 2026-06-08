'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';

export default function GradesPage() {
  const qc = useQueryClient();
  const [examId, setExamId]       = useState('');
  const [sectionId, setSectionId] = useState('');
  const [grades, setGrades]       = useState<Record<string, string>>({});
  const [saved, setSaved]         = useState(false);

  const { data: exams } = useQuery({
    queryKey: ['my-exams'],
    queryFn:  () => api.get('/exams?limit=100').catch(() => []),
  });

  const { data: sections } = useQuery({
    queryKey: ['my-sections'],
    queryFn:  () => api.get('/teachers/my-sections').catch(() => []),
  });

  const { data: students } = useQuery({
    queryKey: ['section-students', sectionId],
    queryFn:  () => sectionId ? api.get(`/students?sectionId=${sectionId}&limit=100`).catch(() => []) : Promise.resolve([]),
    enabled: !!sectionId,
  });

  const { data: existing } = useQuery({
    queryKey: ['exam-results', examId, sectionId],
    queryFn:  () => examId && sectionId ? api.get(`/results?examId=${examId}&sectionId=${sectionId}`).catch(() => []) : Promise.resolve([]),
    enabled: !!examId && !!sectionId,
  });

  const studentList: any[] = Array.isArray(students) ? students : [];
  const existingResults: any[] = Array.isArray(existing) ? existing : [];

  const getMarks = (sid: string) => {
    if (grades[sid] !== undefined) return grades[sid];
    return existingResults.find((r: any) => r.studentId === sid)?.marksObtained?.toString() || '';
  };

  const saveMutation = useMutation({
    mutationFn: () => api.post('/results/bulk', {
      examId, sectionId,
      results: studentList.map((s: any) => ({ studentId: s.id, marksObtained: Number(grades[s.id] || 0) })),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exam-results'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); },
    onError: (e: any) => alert(e?.message || 'Failed to save grades'),
  });

  const examData = Array.isArray(exams) ? (exams as any[]).find((e: any) => e.id === examId) : null;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Enter Grades</h1>
        <p className="text-gray-500 text-sm">Record exam results for your students</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Exam</label>
          <select value={examId} onChange={e => setExamId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select exam…</option>
            {Array.isArray(exams) && (exams as any[]).map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
          <select value={sectionId} onChange={e => setSectionId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select section…</option>
            {Array.isArray(sections) && (sections as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.class?.name}-{s.name}</option>)}
          </select>
        </div>
      </div>

      {examId && sectionId && studentList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">{studentList.length} Students · Total Marks: {examData?.totalMarks || '—'}</h3>
            <div className="flex items-center gap-3">
              {saved && <span className="text-xs text-green-600 font-semibold">✅ Saved!</span>}
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs">
                {saveMutation.isPending ? 'Saving…' : '💾 Save Grades'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">#</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">Student</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">Roll #</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">Marks Obtained</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {studentList.map((s: any, i: number) => {
                  const m = grades[s.id] ?? getMarks(s.id);
                  const pct = examData?.totalMarks && m ? Math.round(Number(m) / examData.totalMarks * 100) : null;
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">{s.name?.[0]}</div>
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-600">{s.rollNumber}</td>
                      <td className="px-5 py-3">
                        <input type="number" value={m} onChange={e => setGrades(g => ({ ...g, [s.id]: e.target.value }))}
                          min={0} max={examData?.totalMarks || 100} placeholder="0"
                          className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center" />
                        {examData?.totalMarks && <span className="text-xs text-gray-400 ml-2">/ {examData.totalMarks}</span>}
                      </td>
                      <td className="px-5 py-3">
                        {pct != null && (
                          <span className={`text-sm font-bold ${pct >= 50 ? 'text-green-700' : 'text-red-700'}`}>{pct}%</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(!examId || !sectionId) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          <p className="text-3xl mb-3">📊</p>
          Select an exam and section to enter grades.
        </div>
      )}
    </div>
  );
}
