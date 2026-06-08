'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';

export default function ClassesPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showAddSection, setShowAddSection] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: '', capacity: '40' });

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes-admin'],
    queryFn:  () => api.get('/classes?includeSections=true').catch(() => []),
  });

  const addClass = useMutation({
    mutationFn: (d: any) => api.post('/classes', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes-admin'] }); setShowAdd(false); setForm({ name: '', description: '' }); },
  });

  const addSection = useMutation({
    mutationFn: ({ classId, data }: any) => api.post(`/classes/${classId}/sections`, { ...data, capacity: Number(data.capacity) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes-admin'] }); setShowAddSection(null); setSectionForm({ name: '', capacity: '40' }); },
  });

  const deleteClass = useMutation({
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['classes-admin'] }),
  });

  const classList: any[] = Array.isArray(classes) ? classes : [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Classes & Sections</h1>
          <p className="text-gray-500 text-sm">Manage grade levels and their sections</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          ➕ Add Class
        </button>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : classList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">🏫</p>
            No classes yet. <button onClick={() => setShowAdd(true)} className="text-violet-600 font-semibold">Add your first →</button>
          </div>
        ) : (
          <div className="space-y-4">
            {classList.map((cls: any) => (
              <div key={cls.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-lg font-black text-violet-700">
                      {cls.name?.[0] || 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{cls.name}</h3>
                      {cls.description && <p className="text-xs text-gray-400">{cls.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{cls.sections?.length || 0} section{cls.sections?.length !== 1 ? 's' : ''}</span>
                    <button onClick={() => setShowAddSection(cls.id)}
                      className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-violet-100 transition-colors">
                      + Section
                    </button>
                    <button onClick={() => deleteClass.mutate(cls.id)} className="text-gray-400 hover:text-red-600 transition-colors text-sm">🗑️</button>
                  </div>
                </div>
                {cls.sections?.length > 0 && (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {cls.sections.map((sec: any) => (
                      <div key={sec.id} className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                        <p className="font-bold text-violet-800 text-sm">{sec.name}</p>
                        <p className="text-xs text-violet-500 mt-0.5">Capacity: {sec.capacity || 40}</p>
                        <p className="text-xs text-violet-400 mt-0.5">{sec._count?.students || 0} students</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }

      {/* Add Class Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-black">Add Class</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Class Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Grade 9, Class VI"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 font-semibold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={() => addClass.mutate(form)} disabled={addClass.isPending || !form.name}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                {addClass.isPending ? 'Adding…' : 'Add Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-black">Add Section</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Section Name *</label>
              <input value={sectionForm.name} onChange={e => setSectionForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. A, B, Red, Blue"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity</label>
              <input type="number" value={sectionForm.capacity} onChange={e => setSectionForm(f => ({ ...f, capacity: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddSection(null)} className="flex-1 border border-gray-200 font-semibold py-3 rounded-xl text-sm">Cancel</button>
              <button onClick={() => addSection.mutate({ classId: showAddSection, data: sectionForm })}
                disabled={addSection.isPending || !sectionForm.name}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                {addSection.isPending ? 'Adding…' : 'Add Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
