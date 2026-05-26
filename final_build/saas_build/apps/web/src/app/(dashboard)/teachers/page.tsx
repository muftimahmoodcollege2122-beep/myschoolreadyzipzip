'use client';
import React, { useState } from 'react';
import { useTeachers } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Topbar } from '../../../components/layout/topbar';
import type { Teacher } from '../../../types';
export default function TeachersPage() {
  const [search,setSearch] = useState('');
  const { data, isLoading } = useTeachers({ search: search||undefined });
  const columns = [
    { key:'name', header:'Teacher', render:(t:Teacher)=>(
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">{t.user.profile.firstName[0]}{t.user.profile.lastName[0]}</div>
        <div><p className="font-semibold text-sm">{t.user.profile.firstName} {t.user.profile.lastName}</p><p className="text-xs text-gray-400">{t.user.email}</p></div>
      </div>
    )},
    { key:'employeeId', header:'Employee ID', render:(t:Teacher)=><span className="font-mono text-xs text-gray-600">{t.employeeId}</span> },
    { key:'department', header:'Department', render:(t:Teacher)=><span className="text-sm">{t.department?.name??'—'}</span> },
    { key:'joined', header:'Joined', render:(t:Teacher)=><span className="text-xs text-gray-400">{new Date(t.joiningDate).toLocaleDateString('en-PK')}</span> },
    { key:'status', header:'Status', render:(t:Teacher)=><Badge variant={t.isActive?'green':'red'}>{t.isActive?'Active':'Inactive'}</Badge> },
  ];
  return (
    <>
      <Topbar title="Teachers" subtitle="Manage teaching staff"/>
      <div className="p-6">
        <PageHeader title="Teaching Staff" subtitle={`${data?.meta.total??0} teachers`}
          action={<button className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Teacher</button>}/>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50"><div className="relative max-w-xs"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teachers..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-400"/></div></div>
          <DataTable columns={columns} data={data?.data??[]} isLoading={isLoading} emptyMessage="No teachers found"/>
        </div>
      </div>
    </>
  );
}
