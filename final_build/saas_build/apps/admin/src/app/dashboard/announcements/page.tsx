'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', audience: 'ALL', priority: 'NORMAL' });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['announcements-admin'],
    queryFn:  () => api.get('/announcements?limit=50').catch(() => []),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/announcements', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements-admin'] }); setShowAdd(false); setForm({ title: '', body: '', audience: 'ALL', priority: 'NORMAL' }); },
    onError: (e: any) => setError(e?.message || 'Failed to create announcement'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements-admin'] }),
  });

  const items: any[] = Array.isArray(data) ? data : [];

  const AUDIENCE_BADGE: any = {
    ALL: 'bg-blue-100 text-blue-700',
    TEACHERS: 'bg-teal-100 text-teal-700',
    STUDENTS: 'bg-violet-100 text-violet-700',
    PARENTS: 'bg-rose-100 text-rose-700',
  };

  const PRIORITY_BADGE: any = {
    HIGH: 'bg-red-100 text-red-700',
    NORMAL: 'bg-gray-100 text-gray-600',
    LOW: 'bg-green-100 text-green-700',
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm">Broadcast notices to teachers, students and parents</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          📢 New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
          : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">📢</p>
              <p className="text-gray-500 text-sm">No announcements yet.</p>
              <button onClick={() => setShowAdd(true)} className="mt-3 text-blue-600 font-semibold text-sm hover:underline">Create your first →</button>
            </div>
          ) : items.map((a: any) => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${PRIORITY_BADGE[a.priority] || 'bg-gray-100 text-gray-600'}`}>{a.priority}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${AUDIENCE_BADGE[a.audience] || 'bg-gray-100 text-gray-600'}`}>
                      {a.audience || 'ALL'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.body || a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{dayjs(a.createdAt).format('MMMM D, YYYY [at] h:mm A')}</p>
                </div>
                <button onClick={() => deleteMutation.mutate(a.id)} disabled={deleteMutation.isPending}
                  className="text-gray-400 hover:text-red-600 transition-colors text-sm flex-shrink-0 mt-1">🗑️</button>
              </div>
            </div>
          ))
        }
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">New Announcement</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. School Holiday Announcement"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message *</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your announcement here…" rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Audience</label>
                  <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="ALL">Everyone</option>
                    <option value="TEACHERS">Teachers Only</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="PARENTS">Parents Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High (Urgent)</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">Cancel</button>
                <button onClick={() => { setError(''); addMutation.mutate(form); }}
                  disabled={addMutation.isPending || !form.title || !form.body}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                  {addMutation.isPending ? 'Publishing…' : 'Publish Announcement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
