'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function ExamsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'MIDTERM', startDate: '', endDate: '', totalMarks: '100', passingMarks: '33', classId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['exams-admin'],
    queryFn:  () => api.get('/exams?limit=50').catch(() => []),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes-dropdown'],
    queryFn:  () => api.get('/classes?limit=50').catch(() => []),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/exams', { ...d, totalMarks: Number(d.totalMarks), passingMarks: Number(d.passingMarks) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams-admin'] }); setShowAdd(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/exams/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams-admin'] }),
  });

  const exams: any[] = Array.isArray(data) ? data : [];

  const TYPE_BADGE: any = {
    MIDTERM: 'bg-blue-100 text-blue-700',
    FINAL: 'bg-red-100 text-red-700',
    QUIZ: 'bg-green-100 text-green-700',
    ASSIGNMENT: 'bg-orange-100 text-orange-700',
    CLASS_TEST: 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Exams</h1>
          <p className="text-gray-500 text-sm">Schedule and manage examinations</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          📋 Schedule Exam
        </button>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : exams.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📋</p>
            No exams scheduled. <button onClick={() => setShowAdd(true)} className="text-orange-600 font-semibold">Schedule one →</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Exam', 'Type', 'Class', 'Dates', 'Marks', 'Passing', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exams.map((e: any) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-bold text-gray-900">{e.title}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TYPE_BADGE[e.type] || 'bg-gray-100 text-gray-600'}`}>{e.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">{e.class?.name || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">
                        <p>{dayjs(e.startDate).format('MMM D')}</p>
                        {e.endDate && <p className="text-gray-400">→ {dayjs(e.endDate).format('MMM D, YYYY')}</p>}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">{e.totalMarks}</td>
                      <td className="px-5 py-3.5 text-gray-600">{e.passingMarks}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => deleteMutation.mutate(e.id)} className="text-gray-400 hover:text-red-600 text-sm">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-black">Schedule Exam</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Exam Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mid-Term Examination 2025"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  {['MIDTERM', 'FINAL', 'QUIZ', 'CLASS_TEST', 'ASSIGNMENT'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Class</label>
                <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="">All Classes</option>
                  {Array.isArray(classes) && (classes as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Total Marks</label>
                <input type="number" value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Passing Marks</label>
                <input type="number" value={form.passingMarks} onChange={e => setForm(f => ({ ...f, passingMarks: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 font-semibold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={() => addMutation.mutate(form)} disabled={addMutation.isPending || !form.title || !form.startDate}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                {addMutation.isPending ? 'Scheduling…' : 'Schedule Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
