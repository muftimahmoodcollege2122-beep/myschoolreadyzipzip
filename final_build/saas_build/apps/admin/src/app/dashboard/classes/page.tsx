'use client';
import React, { useState } from 'react';
import { useClasses, useCreateClass, useCreateSection, useSections } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';
import { useToast } from '../../../components/shared/toast';

export default function ClassesPage() {
  const { data: classes, isLoading } = useClasses();
  const { data: allSections } = useSections();
  const createClass = useCreateClass();
  const createSection = useCreateSection();
  const { toast } = useToast();
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classForm, setClassForm] = useState({ name: '', level: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', capacity: '40', roomNumber: '' });
  const [classErr, setClassErr] = useState('');
  const [sectionErr, setSectionErr] = useState('');

  const classList: any[] = Array.isArray(classes) ? classes : [];
  const totalStudents = classList.reduce((s: number, c: any) => s + (c.sections?.reduce((ss: number, sec: any) => ss + (sec._count?.students ?? 0), 0) ?? 0), 0);

  const handleCreateClass = async () => {
    setClassErr('');
    try {
      await createClass.mutateAsync(classForm);
      setClassForm({ name: '', level: '' });
      setShowClassModal(false);
      toast('Class created successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to create class';
      setClassErr(msg);
      toast(msg, 'error');
    }
  };

  const handleCreateSection = async () => {
    setSectionErr('');
    try {
      await createSection.mutateAsync({ ...sectionForm, classId: selectedClass?.id });
      setSectionForm({ name: '', capacity: '40', roomNumber: '' });
      setShowSectionModal(false);
      toast('Section created successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to create section';
      setSectionErr(msg);
      toast(msg, 'error');
    }
  };

  return (
    <>
      <Topbar title="Classes" subtitle="Manage grades, sections & enrollment" />
      <div className="p-6">
        <PageHeader
          title="Classes & Sections"
          subtitle={`${classList.length} grades · ${totalStudents} enrolled students`}
          action={
            <button onClick={() => setShowClassModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">
              + Add Class
            </button>
          }
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Classes', value: classList.length, icon: '🏫' },
            { label: 'Total Sections', value: classList.reduce((s: number, c: any) => s + (c.sections?.length ?? 0), 0), icon: '📋' },
            { label: 'Total Students', value: totalStudents, icon: '👩‍🎓' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <span className="text-3xl">{s.icon}</span>
              <div><p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs text-gray-500 font-medium">{s.label}</p></div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">{[...Array(6)].map((_,i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {classList.map((cls: any) => (
              <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{cls.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Level {cls.level} · {cls.academicYear}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue">{cls.sections?.length ?? 0} sections</Badge>
                    <button onClick={() => { setSelectedClass(cls); setShowSectionModal(true); }}
                      className="text-xs px-2 py-1 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 font-medium">
                      + Section
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(cls.sections ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-3 border border-dashed border-gray-200 rounded-lg">No sections yet</p>
                  ) : (
                    (cls.sections ?? []).map((sec: any) => (
                      <div key={sec.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">{sec.name}</div>
                          <span className="text-sm font-medium text-gray-700">{cls.name}-{sec.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{sec._count?.students ?? 0}/{sec.capacity} students</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, ((sec._count?.students ?? 0) / (sec.capacity || 40)) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showClassModal} onClose={() => { setShowClassModal(false); setClassErr(''); }} title="Create New Class">
        <div className="space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Name</label>
            <input value={classForm.name} onChange={e => setClassForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Grade 11" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level (for sorting)</label>
            <input type="number" value={classForm.level} onChange={e => setClassForm(f => ({...f, level: e.target.value}))} placeholder="e.g. 11" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          {classErr && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{classErr}</div>}
          <button onClick={handleCreateClass} disabled={createClass.isPending || !classForm.name} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createClass.isPending ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showSectionModal} onClose={() => { setShowSectionModal(false); setSectionErr(''); }} title={`Add Section to ${selectedClass?.name}`}>
        <div className="space-y-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section Name</label>
            <input value={sectionForm.name} onChange={e => setSectionForm(f => ({...f, name: e.target.value}))} placeholder="e.g. A, B, C" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
            <input type="number" value={sectionForm.capacity} onChange={e => setSectionForm(f => ({...f, capacity: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Room Number</label>
            <input value={sectionForm.roomNumber} onChange={e => setSectionForm(f => ({...f, roomNumber: e.target.value}))} placeholder="e.g. Room 101" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          {sectionErr && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{sectionErr}</div>}
          <button onClick={handleCreateSection} disabled={createSection.isPending || !sectionForm.name} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createSection.isPending ? 'Creating...' : 'Create Section'}
          </button>
        </div>
      </Modal>
    </>
  );
}
