'use client';
import React, { useState } from 'react';
import { useStudents, useCreateStudent } from '@/hooks/use-api';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { Topbar } from '@/components/layout/topbar';
import type { Student } from '@/types';
const FIELDS = [['firstName','First Name','text'],['lastName','Last Name','text'],['email','Email','email'],['admissionNo','Admission No','text'],['rollNumber','Roll Number','text'],['phone','Phone','tel'],['admissionDate','Admission Date','date']];
export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ email:'', firstName:'', lastName:'', rollNumber:'', phone:'', gender:'MALE', admissionDate:'' });
  const { data, isLoading } = useStudents({ page, limit: 20, search: search||undefined });
  const create = useCreateStudent();
  const columns = [
    { key:'rollNumber', header:'Roll No', render:(s:Student)=><span className="font-mono font-bold text-sm">{s.rollNumber}</span> },
    { key:'name', header:'Student', render:(s:Student)=>(
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{s.user.profile.firstName[0]}{s.user.profile.lastName[0]}</div>
        <div><p className="font-semibold text-sm">{s.user.profile.firstName} {s.user.profile.lastName}</p><p className="text-xs text-gray-400">{s.user.email}</p></div>
      </div>
    )},
    { key:'class', header:'Class', render:(s:Student)=><span className="text-sm">{s.enrollments?.[0]?.section?.class?.name??'—'}</span> },
    { key:'status', header:'Status', render:(s:Student)=><Badge variant={s.isActive?'green':'red'}>{s.isActive?'Active':'Inactive'}</Badge> },
    { key:'date', header:'Admitted', render:(s:Student)=><span className="text-xs text-gray-400">{new Date(s.admissionDate).toLocaleDateString('en-PK')}</span> },
  ];
  const submit = async (e: React.FormEvent) => { e.preventDefault(); await create.mutateAsync(form); setModal(false); };
  return (
    <>
      <Topbar title="Students" subtitle="Manage enrolled students"/>
      <div className="p-6">
        <PageHeader title="Students" subtitle={`${data?.meta.total??0} enrolled`}
          action={<button onClick={()=>setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500 transition-colors">+ Add Student</button>}/>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <div className="relative max-w-xs"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search students..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-400"/>
            </div>
          </div>
          <DataTable columns={columns} data={data?.data??[]} isLoading={isLoading} emptyMessage="No students found"/>
          {data && data.meta.totalPages>1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <span className="text-xs text-gray-400">Page {page} of {data.meta.totalPages}</span>
              <div className="flex gap-2">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                <button onClick={()=>setPage(p=>Math.min(data.meta.totalPages,p+1))} disabled={page===data.meta.totalPages} className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
              </div>
            </div>
          )}
        </div>
        <Modal isOpen={modal} onClose={()=>setModal(false)} title="Add New Student" size="lg">
          <form onSubmit={submit} className="grid grid-cols-2 gap-4">
            {FIELDS.map(([key,label,type])=>(
              <div key={key}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{label}</label>
                <input type={type} value={form[key]} onChange={e=>setForm((f:any)=>({...f,[key]:e.target.value}))} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400"/>
              </div>
            ))}
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={create.isPending} className="px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">{create.isPending?'Creating...':'Create Student'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
