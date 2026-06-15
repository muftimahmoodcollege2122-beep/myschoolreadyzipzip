'use client';
import React, { useState } from 'react';
import { useStudents, useCreateStudent } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { Topbar } from '../../../components/layout/topbar';
import type { Student } from '../../../types';

const INIT = {
  firstName: '', lastName: '', email: '', admissionNo: '', rollNumber: '',
  phone: '', gender: 'MALE', admissionDate: '', academicYear: '2025-2026',
  dateOfBirth: '', sectionId: '',
};

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(INIT);
  const [err, setErr] = useState('');

  const { data, isLoading } = useStudents({ page, limit: 20, search: search || undefined });
  const create = useCreateStudent();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const columns = [
    { key: 'rollNumber', header: 'Roll No', render: (s: Student) => <span className="font-mono font-bold text-sm">{s.rollNumber}</span> },
    { key: 'name', header: 'Student', render: (s: Student) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
          {s.user.profile.firstName[0]}{s.user.profile.lastName[0]}
        </div>
        <div>
          <p className="font-semibold text-sm">{s.user.profile.firstName} {s.user.profile.lastName}</p>
          <p className="text-xs text-gray-400">{s.user.email}</p>
        </div>
      </div>
    )},
    { key: 'admissionNo', header: 'Adm. No', render: (s: Student) => <span className="font-mono text-xs text-gray-600">{s.admissionNo}</span> },
    { key: 'class', header: 'Class', render: (s: Student) => <span className="text-sm">{(s as any).enrollments?.[0]?.section?.class?.name ?? '—'}</span> },
    { key: 'status', header: 'Status', render: (s: Student) => <Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'date', header: 'Admitted', render: (s: Student) => <span className="text-xs text-gray-400">{new Date(s.admissionDate).toLocaleDateString('en-PK')}</span> },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.firstName || !form.lastName || !form.email || !form.admissionNo || !form.rollNumber || !form.admissionDate || !form.academicYear) {
      setErr('Please fill in all required fields.');
      return;
    }
    try {
      const payload: any = {
        firstName: form.firstName, lastName: form.lastName, email: form.email,
        admissionNo: form.admissionNo, rollNumber: form.rollNumber,
        admissionDate: form.admissionDate, academicYear: form.academicYear,
      };
      if (form.phone) payload.phone = form.phone;
      if (form.gender) payload.gender = form.gender;
      if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
      if (form.sectionId) payload.sectionId = form.sectionId;
      await create.mutateAsync(payload);
      setModal(false);
      setForm(INIT);
    } catch (e: any) {
      const msg = e?.message ?? e?.error ?? 'Failed to create student.';
      setErr(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <>
      <Topbar title="Students" subtitle="Manage enrolled students" />
      <div className="p-6">
        <PageHeader title="Students" subtitle={`${data?.meta.total ?? 0} enrolled`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500 transition-colors">+ Add Student</button>} />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search students..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-400" />
            </div>
          </div>
          <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No students found" />
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">Page {page} of {data.meta.totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                <button onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))} disabled={page === data.meta.totalPages} className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
              </div>
            </div>
          )}
        </div>

        <Modal isOpen={modal} onClose={() => { setModal(false); setErr(''); setForm(INIT); }} title="Add New Student" size="lg">
          <form onSubmit={submit} className="space-y-3">
            {err && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">{err}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                <input value={form.firstName} onChange={set('firstName')} placeholder="e.g. Ahmed" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
                <input value={form.lastName} onChange={set('lastName')} placeholder="e.g. Khan" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="student@school.edu" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admission No *</label>
                <input value={form.admissionNo} onChange={set('admissionNo')} placeholder="e.g. ADM-2025-001" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Roll Number *</label>
                <input value={form.rollNumber} onChange={set('rollNumber')} placeholder="e.g. 001" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admission Date *</label>
                <input type="date" value={form.admissionDate} onChange={set('admissionDate')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Academic Year *</label>
                <select value={form.academicYear} onChange={set('academicYear')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-green-400">
                  {['2025-2026','2024-2025','2026-2027'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+92-300-1234567" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                <select value={form.gender} onChange={set('gender')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-green-400">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setModal(false); setErr(''); setForm(INIT); }} className="flex-1 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={create.isPending} className="flex-1 py-2 text-sm bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50">
                {create.isPending ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
