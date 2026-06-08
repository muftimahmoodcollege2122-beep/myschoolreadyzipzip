'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function AssignmentsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', sectionId: '', dueDate: '', totalMarks: '100' });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-assignments-all'],
    queryFn:  () => api.get('/assignments/mine?limit=50').catch(() => []),
  });

  const { data: subjects } = useQuery({
    queryKey: ['my-subjects'],
    queryFn:  () => api.get('/teachers/my-subjects').catch(() => []),
  });

  const { data: sections } = useQuery({
    queryKey: ['my-sections'],
    queryFn:  () => api.get('/teachers/my-sections').catch(() => []),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/assignments', { ...d, totalMarks: Number(d.totalMarks) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher-assignments-all'] }); setShowAdd(false); setForm({ title: '', description: '', subjectId: '', sectionId: '', dueDate: '', totalMarks: '100' }); },
    onError: (e: any) => setError(e?.message || 'Failed to create assignment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/assignments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher-assignments-all'] }),
  });

  const items: any[] = Array.isArray(data) ? data : [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Assignments</h1>
          <p className="text-gray-500 text-sm">Create and manage class assignments</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          📝 New Assignment
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
          : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              <p className="text-3xl mb-3">📋</p>
              No assignments yet. <button onClick={() => setShowAdd(true)} className="text-orange-600 font-semibold">Create one →</button>
            </div>
          ) : items.map((a: any) => {
            const overdue = dayjs(a.dueDate).isBefore(dayjs());
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {overdue ? 'Overdue' : 'Active'}
                      </span>
                      <span className="text-[10px] text-gray-400">{a.subject?.name || '—'} · {a.section?.class?.name}-{a.section?.name}</span>
                    </div>
                    <h3 className="font-bold text-gray-900">{a.title}</h3>
                    {a.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>📅 Due: {dayjs(a.dueDate).format('MMM D, YYYY')}</span>
                      <span>📊 {a.totalMarks} marks</span>
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(a.id)} className="text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
                </div>
              </div>
            );
          })
        }
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black">New Assignment</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapter 5 Questions"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Assignment instructions…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                  <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="">Select…</option>
                    {Array.isArray(subjects) && (subjects as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                  <select value={form.sectionId} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="">Select…</option>
                    {Array.isArray(sections) && (sections as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.class?.name}-{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date *</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Marks</label>
                  <input type="number" value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">Cancel</button>
                <button onClick={() => { setError(''); addMutation.mutate(form); }}
                  disabled={addMutation.isPending || !form.title || !form.dueDate}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                  {addMutation.isPending ? 'Creating…' : 'Create Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
