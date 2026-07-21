'use client';
import React, { useState } from 'react';
import { useClasses, useCreateClass, useCreateSection, useSections } from '@/hooks/use-api';
import { PageHeader } from '@/components/shared/page-header';
import { Topbar } from '@/components/layout/topbar';
import { Modal } from '@/components/shared/modal';
import { Badge } from '@/components/shared/badge';

export default function ClassesPage() {
  const { data: classes, isLoading } = useClasses();
  const { data: allSections } = useSections();
  const createClass = useCreateClass();
  const createSection = useCreateSection();
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classForm, setClassForm] = useState({ name: '', level: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', capacity: '40', roomNumber: '' });
  const [classErr, setClassErr] = useState('');
  const [sectionErr, setSectionErr] = useState('');

  const classList: any[] = Array.isArray(classes) ? classes : [];
  const totalStudents = classList.reduce((s: number, c: any) =>
    s + (c.sections?.reduce((ss: number, sec: any) => ss + (sec._count?.students ?? 0), 0) ?? 0), 0);

  const handleCreateClass = async () => {
    setClassErr('');
    if (!classForm.name.trim()) { setClassErr('Class name is required.'); return; }
    if (!classForm.level || isNaN(Number(classForm.level))) { setClassErr('A valid level (number) is required.'); return; }
    try {
      await createClass.mutateAsync({ name: classForm.name.trim(), level: Number(classForm.level) });
      setClassForm({ name: '', level: '' });
      setShowClassModal(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to create class.';
      setClassErr(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleCreateSection = async () => {
    setSectionErr('');
    if (!selectedClass?.id) { setSectionErr('No class selected.'); return; }
    if (!sectionForm.name.trim()) { setSectionErr('Section name is required.'); return; }
    try {
      await createSection.mutateAsync({ ...sectionForm, classId: selectedClass.id, capacity: Number(sectionForm.capacity || 40) });
      setSectionForm({ name: '', capacity: '40', roomNumber: '' });
      setShowSectionModal(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to create section.';
      setSectionErr(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <>
      <Topbar title="Classes" subtitle="Manage grades, sections & enrollment" />
      <div className="p-6">
        <PageHeader
          title="Classes & Sections"
          subtitle={`${classList.length} grades · ${totalStudents} enrolled students`}
          action={<button onClick={() => { setClassErr(''); setShowClassModal(true); }} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Class</button>}
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Classes',   value: classList.length, icon: '🏫' },
            { label: 'Total Sections',  value: classList.reduce((s: number, c: any) => s + (c.sections?.length ?? 0), 0), icon: '📋' },
            { label: 'Total Students',  value: totalStudents, icon: '👩‍🎓' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div><p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs text-gray-500 font-medium">{s.label}</p></div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : classList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">🏫</p>
            <p className="text-gray-400 mb-4">No classes added yet</p>
            <button onClick={() => setShowClassModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add First Class</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {classList.map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{c.name}</h3>
                    <p className="text-xs text-gray-400">Level {c.level} · {c.academicYear}</p>
                  </div>
                  <button onClick={() => { setSectionErr(''); setSelectedClass(c); setShowSectionModal(true); }}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100">
                    + Section
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(c.sections ?? []).map((sec: any) => (
                    <div key={sec.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium">{sec.name}</span>
                      <span className="text-xs text-gray-400">{sec._count?.students ?? 0} students</span>
                    </div>
                  ))}
                  {(!c.sections || c.sections.length === 0) && (
                    <p className="text-xs text-gray-400 py-2">No sections yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Class Modal */}
        <Modal isOpen={showClassModal} onClose={() => setShowClassModal(false)} title="Add New Class">
          <div className="space-y-4">
            {classErr && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{classErr}</div>}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Class Name *</label>
              <input value={classForm.name} onChange={e => setClassForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Grade 9, Form 4" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Level (Number) *</label>
              <input type="number" min="1" max="20" value={classForm.level} onChange={e => setClassForm(f => ({ ...f, level: e.target.value }))}
                placeholder="e.g. 9" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowClassModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateClass} disabled={createClass.isPending} className="px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
                {createClass.isPending ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Create Section Modal */}
        <Modal isOpen={showSectionModal} onClose={() => setShowSectionModal(false)} title={`Add Section to ${selectedClass?.name ?? ''}`}>
          <div className="space-y-4">
            {sectionErr && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{sectionErr}</div>}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Section Name *</label>
              <input value={sectionForm.name} onChange={e => setSectionForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. A, Blue, Science" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Capacity</label>
              <input type="number" min="1" max="100" value={sectionForm.capacity} onChange={e => setSectionForm(f => ({ ...f, capacity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Room Number</label>
              <input value={sectionForm.roomNumber} onChange={e => setSectionForm(f => ({ ...f, roomNumber: e.target.value }))}
                placeholder="e.g. R-101" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowSectionModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateSection} disabled={createSection.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50">
                {createSection.isPending ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
