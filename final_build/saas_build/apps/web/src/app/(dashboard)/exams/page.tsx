'use client';
import React, { useState } from 'react';
import { useExams } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Topbar } from '../../../components/layout/topbar';
import type { Exam } from '../../../types';
export default function ExamsPage() {
  const [year,setYear] = useState(new Date().getFullYear().toString());
  const { data:exams, isLoading } = useExams(undefined, year);
  const columns = [
    { key:'title', header:'Exam', render:(e:Exam)=><div><p className="font-semibold text-sm">{e.title}</p><p className="text-xs text-gray-400">{e.examType}</p></div> },
    { key:'class', header:'Class', render:(e:Exam)=><span className="text-sm">{e.section.class.name} — {e.section.name}</span> },
    { key:'date', header:'Date', render:(e:Exam)=><span className="text-sm">{new Date(e.startDate).toLocaleDateString('en-PK')}</span> },
    { key:'maxMarks', header:'Total Marks', render:(e:Exam)=><span className="font-mono text-sm">{e.maxMarks}</span> },
    { key:'pass', header:'Pass Marks', render:(e:Exam)=><span className="font-mono text-sm text-yellow-600">{e.passMarks}</span> },
    { key:'status', header:'Results', render:(e:Exam)=><Badge variant={e.resultPublished?'green':new Date(e.endDate)<new Date()?'yellow':'blue'}>{e.resultPublished?'Published':new Date(e.endDate)<new Date()?'Pending':'Upcoming'}</Badge> },
  ];
  return (
    <>
      <Topbar title="Exams" subtitle="Schedule and manage examinations"/>
      <div className="p-6">
        <PageHeader title="Examinations" subtitle={`${exams?.length??0} exams`}
          action={<div className="flex gap-3"><select value={year} onChange={e=>setYear(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">{[0,1,2].map(i=>{const y=new Date().getFullYear()-i;return <option key={y} value={y}>{y}</option>;})}</select><button className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ New Exam</button></div>}/>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <DataTable columns={columns} data={exams??[]} isLoading={isLoading} emptyMessage="No exams scheduled"/>
        </div>
      </div>
    </>
  );
}
