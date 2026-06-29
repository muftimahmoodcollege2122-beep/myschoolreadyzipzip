'use client';
import React, { useState } from 'react';
import { useSubjects, useCreateSubject } from '@/hooks/use-api';
import { PageHeader } from '@/components/shared/page-header';
import { Topbar } from '@/components/layout/topbar';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';

const EMPTY = { name: '', code: '', description: '', isElective: false, creditHours: '1' };

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');

  const list: any[] = Array.isArray(subjects) ? subjects : [];
  const filtered = search
    ? list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
    : list;

  const handleCreate = async () => {
    setErr('');
    if (!form.name.trim()) { setErr('Subject name is required.'); return; }
    if (!form.code.trim()) { setErr('Subject code is required.'); return; }
    try {
      await createSubject.mutateAsync({ ...form, creditHours: Number(form.creditHours || 1) });
      setForm(EMPTY);
      setModal(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to create subject.';
      setErr(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <>
      <Topbar title="Subjects" subtitle="Curriculum & subject management" />
      <div className="p-6">
        <PageHeader
          title="Subjects & Curriculum"
          subtitle={`${list.length} subjects · ${list.filter(s => !s.isElective).length} core · ${list.filter(s => s.isElective).length} elective`}
          action={<button onClick={() => { setErr(''); setForm(EMPTY); setModal(true); }} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Subject</button>}
        />
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects..."
            className="flex-1 max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">{[...Array(9)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">📚</p>
            <p className="text-gray-400">{search ? 'No subjects match your search' : 'No subjects added yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center font-black text-green-700 text-sm flex-shrink-0">
                    {s.code.substring(0, 3).toUpperCase()}
                  </div>
                  <Badge variant={s.isElective ? 'yellow' : 'green'}>{s.isElective ? 'Elective' : 'Core'}</Badge>
                </div>
                <h3 className="font-bold text-sm text-gray-900 mt-2">{s.name}</h3>
                <p className="text-xs text-gray-400">{s.code} · {s.creditHours} credit{s.creditHours !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add New Subject">
          <div className="space-y-4">
            {err && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{err}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Mathematics" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. MATH-10" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Credit Hours</label>
                <input type="number" min="1" max="10" value={form.creditHours} onChange={e => setForm(f => ({ ...f, creditHours: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                <select value={form.isElective ? 'elective' : 'core'} onChange={e => setForm(f => ({ ...f, isElective: e.target.value === 'elective' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400">
                  <option value="core">Core</option>
                  <option value="elective">Elective</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={createSubject.isPending} className="px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
                {createSubject.isPending ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
