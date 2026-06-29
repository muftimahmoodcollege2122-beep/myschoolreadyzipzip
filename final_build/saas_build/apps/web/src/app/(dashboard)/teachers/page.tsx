'use client';
import React, { useState } from 'react';
import { useTeachers, useCreateTeacher } from '@/hooks/use-api';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { Topbar } from '@/components/layout/topbar';
import type { Teacher } from '@/types';

const INIT = { firstName: '', lastName: '', email: '', employeeId: '', joiningDate: '', phone: '', gender: 'MALE' };

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(INIT);
  const [err, setErr] = useState('');
  const { data, isLoading } = useTeachers({ search: search || undefined });
  const create = useCreateTeacher();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setErr('');
    if (!form.firstName || !form.lastName || !form.email || !form.employeeId || !form.joiningDate) {
      setErr('Please fill in all required fields.');
      return;
    }
    try {
      await create.mutateAsync(form);
      setModal(false);
      setForm(INIT);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Failed to add teacher.';
      setErr(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const columns = [
    { key: 'name', header: 'Teacher', render: (t: Teacher) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
          {t.user?.profile?.firstName?.[0]}{t.user?.profile?.lastName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-sm">{t.user?.profile?.firstName} {t.user?.profile?.lastName}</p>
          <p className="text-xs text-gray-400">{t.user?.email}</p>
        </div>
      </div>
    )},
    { key: 'employeeId', header: 'Employee ID', render: (t: Teacher) => <span className="font-mono text-xs text-gray-600">{t.employeeId}</span> },
    { key: 'phone',  header: 'Phone',  render: (t: Teacher) => <span className="text-xs text-gray-500">{t.user?.profile?.phone ?? '—'}</span> },
    { key: 'joined', header: 'Joined', render: (t: Teacher) => <span className="text-xs text-gray-400">{new Date(t.joiningDate).toLocaleDateString('en-PK')}</span> },
    { key: 'status', header: 'Status', render: (t: Teacher) => <Badge variant={t.isActive ? 'green' : 'red'}>{t.isActive ? 'Active' : 'Inactive'}</Badge> },
  ];

  return (
    <>
      <Topbar title="Teachers" subtitle="Manage teaching staff" />
      <div className="p-6">
        <PageHeader title="Teachers" subtitle={`${(data as any)?.meta?.total ?? (Array.isArray(data) ? data.length : 0)} teachers`}
          action={<button onClick={() => { setErr(''); setForm(INIT); setModal(true); }} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-500 transition-colors">+ Add Teacher</button>} />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..." className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
          </div>
          <DataTable columns={columns} data={(data as any)?.data ?? (Array.isArray(data) ? data : [])} isLoading={isLoading} emptyMessage="No teachers found" />
        </div>
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Add New Teacher" size="lg">
          <div className="grid grid-cols-2 gap-4">
            {err && <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{err}</div>}
            {([['firstName','First Name','text'],['lastName','Last Name','text'],['email','Email','email'],['employeeId','Employee ID','text'],['joiningDate','Joining Date','date'],['phone','Phone','tel']] as [string,string,string][]).map(([k, label, type]) => (
              <div key={k}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{label} {['firstName','lastName','email','employeeId','joiningDate'].includes(k) ? '*' : ''}</label>
                <input type={type} value={(form as any)[k] ?? ''} onChange={set(k)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gender</label>
              <select value={form.gender} onChange={set('gender')} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-400">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={create.isPending} className="px-4 py-2 text-sm bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 disabled:opacity-50">{create.isPending ? 'Adding...' : 'Add Teacher'}</button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
