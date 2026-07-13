'use client';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTeachers, useCreateTeacher, useDeleteTeacher } from '@/hooks/use-api';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { BulkImportExport } from '@/components/shared/bulk-import-export';

const EMPTY = { firstName:'', lastName:'', email:'', employeeId:'', phone:'', specialization:'', qualifications:'', gender:'Male', joiningDate:'' };

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const qc = useQueryClient();

  const { data, isLoading } = useTeachers({ search, limit:50 });
  const create = useCreateTeacher();
  const remove = useDeleteTeacher();
  const teachers: any[] = (data as any)?.data ?? [];

  return (
    <>
      <Topbar title="Teachers" subtitle={`${teachers.length} staff members`}
        action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">+ Add Teacher</button>} />
      <div className="page-padding">
        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
        </div>
        <div className="mb-4">
          <BulkImportExport entity="teachers" label="Teachers" onImported={() => qc.invalidateQueries({ queryKey: ['teachers'] })} />
        </div>

        {isLoading ? <div className="text-center py-16 text-gray-400">Loading...</div> :
        teachers.length === 0 ? <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">👨‍🏫</div><p className="font-semibold">No teachers found</p></div> : (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Teacher','Specialization','Phone','Joined','Status',''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}
                </tr></thead>
                <tbody>
                  {teachers.map((t: any) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center flex-shrink-0">{t.user?.profile?.firstName?.[0] ?? 'T'}</div>
                          <div><p className="font-semibold text-sm">{t.user?.profile?.firstName} {t.user?.profile?.lastName}</p><p className="text-xs text-gray-400">{t.user?.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.specialization || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{t.user?.profile?.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{t.joiningDate ? new Date(t.joiningDate).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                      <td className="px-4 py-3"><Badge variant={t.isActive ? 'green':'red'}>{t.isActive ? 'Active':'Inactive'}</Badge></td>
                      <td className="px-4 py-3"><button onClick={() => { if(confirm('Remove?')) remove.mutate(t.id); }} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {teachers.map((t: any) => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">{t.user?.profile?.firstName?.[0] ?? 'T'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{t.user?.profile?.firstName} {t.user?.profile?.lastName}</p>
                      <p className="text-xs text-gray-400">{t.user?.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {t.specialization && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{t.specialization}</span>}
                        <Badge variant={t.isActive ? 'green':'red'}>{t.isActive ? 'Active':'Inactive'}</Badge>
                      </div>
                    </div>
                    <button onClick={() => { if(confirm('Remove?')) remove.mutate(t.id); }} className="text-red-400 hover:text-red-600 text-lg">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modal && (
        <Modal title="Add New Teacher" onClose={() => { setModal(false); setForm(EMPTY); }}>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[['First Name','firstName','text'],['Last Name','lastName','text'],['Email','email','email'],['Employee ID','employeeId','text'],['Phone','phone','tel'],['Specialization','specialization','text'],['Qualifications','qualifications','text'],['Joining Date','joiningDate','date']].map(([l,k,t]) => (
                <div key={k}><label className="block text-xs font-bold text-gray-500 uppercase mb-1">{l}</label>
                <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
              ))}
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender:e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">{['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setModal(false); setForm(EMPTY); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={async () => {
                  await create.mutateAsync({
                    firstName: form.firstName, lastName: form.lastName, email: form.email,
                    employeeId: form.employeeId, phone: form.phone || undefined, gender: form.gender || undefined,
                    joiningDate: form.joiningDate,
                    specializations: form.specialization ? [form.specialization] : undefined,
                    qualifications: form.qualifications ? [form.qualifications] : undefined,
                  });
                  setModal(false); setForm(EMPTY);
                }} disabled={!form.firstName||!form.email||!form.employeeId||!form.joiningDate||create.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40">{create.isPending ? 'Adding...':'Add Teacher'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
