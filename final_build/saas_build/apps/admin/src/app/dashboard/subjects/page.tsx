'use client';
import React, { useState } from 'react';
import { useSubjects, useCreateSubject } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const EMPTY = { name: '', code: '', description: '', isElective: false, creditHours: '1' };

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');

  const list: any[] = Array.isArray(subjects) ? subjects : [];
  const filtered = search ? list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())) : list;

  const handleCreate = async () => {
    await createSubject.mutateAsync(form);
    setForm(EMPTY);
    setModal(false);
  };

  const coreCount = list.filter(s => !s.isElective).length;
  const electiveCount = list.filter(s => s.isElective).length;

  return (
    <>
      <Topbar title="Subjects" subtitle="Curriculum & subject management" />
      <div className="p-6">
        <PageHeader
          title="Subjects & Curriculum"
          subtitle={`${list.length} subjects · ${coreCount} core · ${electiveCount} elective`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Subject</button>}
        />

        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects..." className="flex-1 max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">{[...Array(9)].map((_,i)=><div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
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
                    {s.code.substring(0,3)}
                  </div>
                  <Badge variant={s.isElective ? 'yellow' : 'green'}>{s.isElective ? 'Elective' : 'Core'}</Badge>
                </div>
                <h3 className="font-bold text-gray-900 mt-2">{s.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{s.code}</p>
                {s.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">{s.creditHours} credit hrs</span>
                  {s._count?.classSubjects > 0 && <span className="text-xs text-gray-400">· {s._count.classSubjects} classes</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="Add Subject">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject Name *</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Mathematics" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Code *</label>
              <input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} placeholder="e.g. MATH101" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400 resize-none" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Credit Hours</label>
            <input type="number" value={form.creditHours} onChange={e=>setForm(f=>({...f,creditHours:e.target.value}))} min="1" max="6" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isElective} onChange={e=>setForm(f=>({...f,isElective:e.target.checked}))} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">This is an elective subject</span>
          </label>
          <button onClick={handleCreate} disabled={createSubject.isPending||!form.name||!form.code} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createSubject.isPending ? 'Adding...' : 'Add Subject'}
          </button>
        </div>
      </Modal>
    </>
  );
}
