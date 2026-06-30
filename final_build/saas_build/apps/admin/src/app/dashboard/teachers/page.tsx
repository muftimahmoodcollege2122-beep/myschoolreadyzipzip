'use client';
import React, { useState } from 'react';
import { useTeachers, useCreateTeacher } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { Topbar } from '../../../components/layout/topbar';
import type { Teacher } from '../../../types';

const INIT = { firstName:'', lastName:'', email:'', employeeId:'', joiningDate:'', phone:'', gender:'' };

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
      setErr(e?.response?.data?.message ?? e?.message ?? 'Failed to add teacher.');
    }
  };

  const columns = [
    { key:'name', header:'Teacher', render:(t:Teacher)=>(
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
          {t.user?.profile?.firstName?.[0] ?? '?'}{t.user?.profile?.lastName?.[0] ?? ''}
        </div>
        <div>
          <p className="font-semibold text-sm">{t.user?.profile?.firstName} {t.user?.profile?.lastName}</p>
          <p className="text-xs text-gray-400">{t.user?.email}</p>
        </div>
      </div>
    )},
    { key:'employeeId', header:'Employee ID', render:(t:Teacher)=><span className="font-mono text-xs text-gray-600">{t.employeeId}</span> },
    { key:'department', header:'Department', render:(t:Teacher)=><span className="text-sm">{(t as any).department?.name ?? '—'}</span> },
    { key:'phone', header:'Phone', render:(t:Teacher)=><span className="text-xs text-gray-500">{t.user?.profile?.phone ?? '—'}</span> },
    { key:'joined', header:'Joined', render:(t:Teacher)=><span className="text-xs text-gray-400">{new Date(t.joiningDate).toLocaleDateString('en-PK')}</span> },
    { key:'status', header:'Status', render:(t:Teacher)=><Badge variant={t.isActive?'green':'red'}>{t.isActive?'Active':'Inactive'}</Badge> },
  ];

  return (
    <>
      <Topbar title="Teachers" subtitle="Manage teaching staff"/>
      <div className="p-6">
        <PageHeader
          title="Teaching Staff"
          subtitle={`${data?.meta.total ?? 0} teachers`}
          action={
            <button onClick={()=>setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">
              + Add Teacher
            </button>
          }
        />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search teachers..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-400"
              />
            </div>
          </div>
          <DataTable columns={columns} data={data?.data??[]} isLoading={isLoading} emptyMessage="No teachers found"/>
        </div>
      </div>

      <Modal isOpen={modal} onClose={()=>{setModal(false);setForm(INIT);setErr('');}} title="Add New Teacher">
        <div className="space-y-3">
          {err && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
              <input value={form.firstName} onChange={set('firstName')} placeholder="e.g. Ahmed" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
              <input value={form.lastName} onChange={set('lastName')} placeholder="e.g. Khan" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="teacher@school.edu" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee ID *</label>
              <input value={form.employeeId} onChange={set('employeeId')} placeholder="e.g. TCH-001" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Joining Date *</label>
              <input type="date" value={form.joiningDate} onChange={set('joiningDate')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+92-300-1234567" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
              <select value={form.gender} onChange={set('gender')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-green-400">
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={create.isPending}
            className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-colors disabled:opacity-60"
          >
            {create.isPending ? 'Adding…' : 'Add Teacher'}
          </button>
        </div>
      </Modal>
    </>
  );
}
