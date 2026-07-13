'use client';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStudents, useCreateStudent, useDeleteStudent, useSchoolInfo } from '@/hooks/use-api';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { BulkImportExport } from '@/components/shared/bulk-import-export';

const EMPTY = { firstName:'', lastName:'', email:'', phone:'', gender:'Male', admissionNo:'', rollNumber:'', dateOfBirth:'', admissionDate:'' };

export default function StudentsPage() {
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const qc = useQueryClient();

  const { data, isLoading }   = useStudents({ search, page, limit: 20 });
  const { data: school }      = useSchoolInfo();
  const create                = useCreateStudent();
  const remove                = useDeleteStudent();

  const students = (data as any)?.data ?? [];
  const meta     = (data as any)?.meta ?? {};

  const handleCreate = async () => {
    await create.mutateAsync({ ...form, gender: form.gender ? form.gender.toUpperCase() : undefined, schoolId: (school as any)?.id });
    setModal(false); setForm(EMPTY);
  };

  return (
    <>
      <Topbar title="Students" subtitle={`${meta.total ?? 0} enrolled`}
        action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">+ Add Student</button>} />
      <div className="page-padding">
        {/* Search */}
        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, roll no, admission no..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
        </div>
        <div className="mb-4">
          <BulkImportExport entity="students" label="Students" onImported={() => qc.invalidateQueries({ queryKey: ['students'] })} />
        </div>

        {/* Mobile: Card view, Desktop: Table */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">👩‍🎓</div><p className="font-semibold">No students found</p></div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="table-responsive">
                <table className="w-full">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">
                    {['Student','Roll No','Admission No','Class','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {students.map((s: any) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                              {s.user?.profile?.firstName?.[0] ?? 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{s.user?.profile?.firstName} {s.user?.profile?.lastName}</p>
                              <p className="text-xs text-gray-400 truncate">{s.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{s.rollNumber || '—'}</td>
                        <td className="px-4 py-3 font-mono text-sm">{s.admissionNo || '—'}</td>
                        <td className="px-4 py-3 text-sm">{s.enrollments?.[0]?.section?.class?.name ?? '—'} {s.enrollments?.[0]?.section?.name ?? ''}</td>
                        <td className="px-4 py-3"><Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="px-4 py-3">
                          <button onClick={() => { if(confirm('Remove student?')) remove.mutate(s.id); }} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {students.map((s: any) => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                      {s.user?.profile?.firstName?.[0] ?? 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{s.user?.profile?.firstName} {s.user?.profile?.lastName}</p>
                      <p className="text-xs text-gray-400">{s.user?.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {s.rollNumber && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full font-mono">{s.rollNumber}</span>}
                        {s.enrollments?.[0]?.section?.class?.name && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s.enrollments[0].section.class.name} {s.enrollments[0].section.name}</span>}
                        <Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </div>
                    <button onClick={() => { if(confirm('Remove?')) remove.mutate(s.id); }} className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40">← Prev</button>
                  <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <Modal title="Add New Student" onClose={() => { setModal(false); setForm(EMPTY); }}>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['First Name', 'firstName', 'text'],['Last Name', 'lastName', 'text'],
                ['Email', 'email', 'email'],['Phone', 'phone', 'tel'],
                ['Admission No', 'admissionNo', 'text'],['Roll Number', 'rollNumber', 'text'],
                ['Date of Birth', 'dateOfBirth', 'date'],['Admission Date', 'admissionDate', 'date'],
              ].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
                  <input type={type as string} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                  {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setModal(false); setForm(EMPTY); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={!form.firstName || !form.email || create.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40">
                {create.isPending ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
