'use client';
import React, { useState } from 'react';
import { useExams, useCreateExam, useSubjects } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { Topbar } from '../../../components/layout/topbar';

const EXAM_TYPES = ['QUIZ','MIDTERM','FINAL','ASSIGNMENT','PROJECT'];
const INIT = { title: '', subjectId: '', examType: 'MIDTERM', academicYear: '2025-2026', term: 'Term 1', startDate: '', maxMarks: '100', passMarks: '40', venue: '' };

export default function ExamsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(INIT);
  const [err, setErr] = useState('');

  const { data: exams, isLoading } = useExams(undefined, year);
  const create = useCreateExam();
  const { data: subjects } = useSubjects();
  const subjectList: any[] = Array.isArray(subjects) ? subjects : [];

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    setErr('');
    if (!form.title || !form.subjectId || !form.startDate) {
      setErr('Please fill in all required fields.');
      return;
    }
    try {
      await create.mutateAsync({
        title: form.title,
        subjectId: form.subjectId,
        examType: form.examType,
        academicYear: form.academicYear,
        term: form.term,
        startDate: form.startDate,
        maxMarks: Number(form.maxMarks),
        passMarks: Number(form.passMarks),
        venue: form.venue || undefined,
      });
      setModal(false);
      setForm(INIT);
    } catch (e: any) {
      const msg = e?.message ?? e?.error ?? 'Failed to create exam.';
      setErr(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const examList: any[] = Array.isArray(exams) ? exams : [];

  const columns = [
    { key: 'name', header: 'Exam', render: (e: any) => (
      <div>
        <p className="font-semibold text-sm">{e.name}</p>
        <p className="text-xs text-gray-400">{e.examType}</p>
      </div>
    )},
    { key: 'subject', header: 'Subject', render: (e: any) => <span className="text-sm">{e.subject?.name ?? '—'}</span> },
    { key: 'date', header: 'Scheduled', render: (e: any) => <span className="text-sm">{new Date(e.scheduledAt).toLocaleDateString('en-PK')}</span> },
    { key: 'maxMarks', header: 'Max Marks', render: (e: any) => <span className="font-mono text-sm">{e.maxMarks}</span> },
    { key: 'pass', header: 'Pass Marks', render: (e: any) => <span className="font-mono text-sm text-yellow-600">{e.passingMarks}</span> },
    { key: 'year', header: 'Year', render: (e: any) => <Badge variant="blue">{e.academicYear}</Badge> },
    { key: 'status', header: 'Results', render: (e: any) => (
      <Badge variant={e.isPublished ? 'green' : new Date(e.scheduledAt) < new Date() ? 'yellow' : 'blue'}>
        {e.isPublished ? 'Published' : new Date(e.scheduledAt) < new Date() ? 'Pending' : 'Upcoming'}
      </Badge>
    )},
  ];

  return (
    <>
      <Topbar title="Exams" subtitle="Schedule and manage examinations" />
      <div className="p-6">
        <PageHeader title="Examinations" subtitle={`${examList.length} exams`}
          action={
            <div className="flex gap-3">
              <select value={year} onChange={e => setYear(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {[0, 1, 2].map(i => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
              </select>
              <button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ New Exam</button>
            </div>
          }
        />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <DataTable columns={columns} data={examList} isLoading={isLoading} emptyMessage="No exams scheduled" />
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); setErr(''); setForm(INIT); }} title="Schedule New Exam">
        <div className="space-y-3">
          {err && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">{err}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Mid-Term Mathematics" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
              <select value={form.subjectId} onChange={set('subjectId')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-green-400">
                <option value="">Select subject</option>
                {subjectList.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Type</label>
              <select value={form.examType} onChange={set('examType')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-green-400">
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date & Time *</label>
              <input type="datetime-local" value={form.startDate} onChange={set('startDate')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Academic Year</label>
              <select value={form.academicYear} onChange={set('academicYear')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-green-400">
                {['2025-2026','2024-2025','2026-2027'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Term</label>
              <select value={form.term} onChange={set('term')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-green-400">
                {['Term 1','Term 2','Term 3'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Marks</label>
              <input type="number" value={form.maxMarks} onChange={set('maxMarks')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pass Marks</label>
              <input type="number" value={form.passMarks} onChange={set('passMarks')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Venue</label>
            <input value={form.venue} onChange={set('venue')} placeholder="e.g. Main Hall, Room 101" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setModal(false); setErr(''); setForm(INIT); }} className="flex-1 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button onClick={handleCreate} disabled={create.isPending} className="flex-1 py-2 text-sm bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50">
              {create.isPending ? 'Scheduling...' : 'Schedule Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
