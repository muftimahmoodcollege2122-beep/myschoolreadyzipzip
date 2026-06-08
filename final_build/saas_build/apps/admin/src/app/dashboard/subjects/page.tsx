'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';

export default function SubjectsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', classId: '', teacherId: '' });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['subjects-admin'],
    queryFn:  () => api.get('/subjects?limit=100').catch(() => []),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes-dropdown'],
    queryFn:  () => api.get('/classes?limit=50').catch(() => []),
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers-dropdown'],
    queryFn:  () => api.get('/teachers?limit=100').catch(() => []),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/subjects', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects-admin'] }); setShowAdd(false); setForm({ name: '', code: '', description: '', classId: '', teacherId: '' }); },
    onError: (e: any) => setError(e?.message || 'Failed to add subject'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/subjects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects-admin'] }),
  });

  const subjects: any[] = Array.isArray(data) ? data : [];

  const SUBJECT_ICONS: Record<string, string> = {
    Math: '➗', Mathematics: '➗', Physics: '⚛️', Chemistry: '⚗️', Biology: '🌿',
    English: '📖', Urdu: '🖊️', Computer: '💻', History: '📜', Geography: '🌍',
    Islamiyat: '🕌', Science: '🔬', Art: '🎨', 'Physical Education': '⚽',
  };

  const getIcon = (name: string) => {
    for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
      if (name?.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    return '📚';
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Subjects</h1>
          <p className="text-gray-500 text-sm">{subjects.length} subjects across all classes</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          📚 Add Subject
        </button>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : subjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📚</p>
            No subjects yet. <button onClick={() => setShowAdd(true)} className="text-teal-600 font-semibold">Add your first →</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((s: any) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{getIcon(s.name)}</span>
                  <button onClick={() => deleteMutation.mutate(s.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm">
                    🗑️
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 mt-2 truncate">{s.name}</h3>
                {s.code && <p className="text-xs font-mono text-gray-400">{s.code}</p>}
                <p className="text-xs text-gray-500 mt-1 truncate">{s.class?.name || 'All Classes'}</p>
                {s.teacher?.user?.name && <p className="text-xs text-teal-600 mt-0.5 truncate">👨‍🏫 {s.teacher.user.name}</p>}
              </div>
            ))}
          </div>
        )
      }

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-black">Add Subject</h2>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mathematics"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Code</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="MATH101"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Class</label>
                <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">All Classes</option>
                  {Array.isArray(classes) && (classes as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Teacher</label>
                <select value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select teacher…</option>
                  {Array.isArray(teachers) && (teachers as any[]).map((t: any) => (
                    <option key={t.id} value={t.id}>{t.user?.name || t.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 font-semibold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={() => { setError(''); addMutation.mutate(form); }} disabled={addMutation.isPending || !form.name}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                {addMutation.isPending ? 'Adding…' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
