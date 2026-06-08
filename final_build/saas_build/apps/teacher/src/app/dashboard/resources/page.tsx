'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function TeacherResourcesPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', type: 'DOCUMENT', subjectId: '', description: '' });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-resources'],
    queryFn:  () => api.get('/resources/mine?limit=50').catch(() => []),
  });

  const { data: subjects } = useQuery({
    queryKey: ['my-subjects'],
    queryFn:  () => api.get('/teachers/my-subjects').catch(() => []),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/resources', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher-resources'] }); setShowAdd(false); setForm({ title: '', url: '', type: 'DOCUMENT', subjectId: '', description: '' }); },
    onError: (e: any) => setError(e?.message || 'Failed to add resource'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resources/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher-resources'] }),
  });

  const items: any[] = Array.isArray(data) ? data : [];

  const TYPE_ICON: any = { DOCUMENT: '📄', VIDEO: '🎥', LINK: '🔗', IMAGE: '🖼️', AUDIO: '🎵', OTHER: '📦' };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Resources</h1>
          <p className="text-gray-500 text-sm">Share study materials with students</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          📚 Upload Resource
        </button>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📚</p>
            No resources yet. <button onClick={() => setShowAdd(true)} className="text-teal-600 font-semibold">Share your first →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{TYPE_ICON[r.type] || '📦'}</span>
                  <button onClick={() => deleteMutation.mutate(r.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">🗑️</button>
                </div>
                <h3 className="font-bold text-gray-900 truncate">{r.title}</h3>
                {r.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.description}</p>}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    {r.subject?.name && <p className="text-xs text-teal-600 font-medium">{r.subject.name}</p>}
                    <p className="text-xs text-gray-400">{dayjs(r.createdAt).format('MMM D, YYYY')}</p>
                  </div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-100 transition-colors">
                      Open →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-black">Add Resource</h2>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapter 5 Notes"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">URL / Link *</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://drive.google.com/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {['DOCUMENT', 'VIDEO', 'LINK', 'IMAGE', 'AUDIO', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <select value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select…</option>
                  {Array.isArray(subjects) && (subjects as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 font-semibold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={() => { setError(''); addMutation.mutate(form); }} disabled={addMutation.isPending || !form.title || !form.url}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                {addMutation.isPending ? 'Adding…' : 'Share Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
