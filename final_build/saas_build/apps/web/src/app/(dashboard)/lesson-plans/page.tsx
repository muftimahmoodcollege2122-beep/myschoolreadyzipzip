'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';
import { DataTable } from '../../../components/shared/data-table';

const STATUSES_LP = ['DRAFT','SUBMITTED','APPROVED','REJECTED'];
const SV: Record<string,any> = { DRAFT:'gray', SUBMITTED:'blue', APPROVED:'green', REJECTED:'red' };

export default function LessonPlansPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'plans'|'substitutions'|'training'>('plans');
  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState<any>(null);
  const [subModal, setSubModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title:'', objectives:'', materials:'', methodology:'', activities:'', assessment:'', scheduledDate:new Date().toISOString().split('T')[0], duration:45 });
  const [subForm, setSubForm] = useState({ absentTeacherId:'', substituteTeacherId:'', date:new Date().toISOString().split('T')[0], reason:'' });

  const { data: plans, isLoading } = useQuery({ queryKey:['lesson-plans',filterStatus], queryFn:()=>apiClient.get(`/hr-extended/lesson-plans?status=${filterStatus}`) });
  const { data: subs, isLoading:sl } = useQuery({ queryKey:['substitutions'], queryFn:()=>apiClient.get('/hr-extended/substitutions'), enabled:tab==='substitutions' });
  const { data: training, isLoading:tl } = useQuery({ queryKey:['training'], queryFn:()=>apiClient.get('/hr-extended/training'), enabled:tab==='training' });
  const { data: teachers } = useQuery({ queryKey:['teachers-list'], queryFn:()=>apiClient.get('/teachers') });

  const create = useMutation({ mutationFn:(d:any)=>apiClient.post('/hr-extended/lesson-plans',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['lesson-plans']});setCreateModal(false);setForm({title:'',objectives:'',materials:'',methodology:'',activities:'',assessment:'',scheduledDate:new Date().toISOString().split('T')[0],duration:45});} });
  const approve = useMutation({ mutationFn:(id:string)=>apiClient.put(`/hr-extended/lesson-plans/${id}/approve`,{}), onSuccess:()=>qc.invalidateQueries({queryKey:['lesson-plans']}) });
  const reject = useMutation({ mutationFn:(id:string)=>apiClient.put(`/hr-extended/lesson-plans/${id}/reject`,{}), onSuccess:()=>qc.invalidateQueries({queryKey:['lesson-plans']}) });
  const createSub = useMutation({ mutationFn:(d:any)=>apiClient.post('/hr-extended/substitutions',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['substitutions']});setSubModal(false);} });

  const planList: any[] = Array.isArray(plans) ? plans : [];
  const subList: any[] = Array.isArray(subs) ? subs : [];
  const trainingList: any[] = Array.isArray(training) ? training : [];
  const teacherList: any[] = Array.isArray(teachers) ? teachers : ((teachers as any)?.data ?? []);

  const planCols = [
    { key:'title', header:'Lesson Plan', render:(p:any)=><div><p className="font-bold text-sm">{p.title}</p><p className="text-xs text-gray-400">{p.teacher?.user?.profile?.firstName} · {p.subject?.name}</p></div> },
    { key:'date', header:'Scheduled', render:(p:any)=><span className="text-xs text-gray-500">{new Date(p.scheduledDate).toLocaleDateString()}</span> },
    { key:'dur', header:'Duration', render:(p:any)=><span className="text-sm font-medium">{p.duration} min</span> },
    { key:'status', header:'Status', render:(p:any)=><Badge variant={SV[p.status]}>{p.status}</Badge> },
    { key:'act', header:'', render:(p:any)=>(
      <div className="flex gap-2">
        <button onClick={()=>setViewModal(p)} className="px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded font-bold">View</button>
        {p.status==='SUBMITTED'&&<><button onClick={()=>approve.mutate(p.id)} className="px-2 py-1 text-xs text-green-700 bg-green-50 rounded font-bold">✓</button><button onClick={()=>reject.mutate(p.id)} className="px-2 py-1 text-xs text-red-700 bg-red-50 rounded font-bold">✕</button></>}
      </div>
    )},
  ];
  const subCols = [
    { key:'absent', header:'Absent Teacher', render:(s:any)=><span className="font-semibold text-sm">{s.absentTeacher?.user?.profile?.firstName??'—'}</span> },
    { key:'sub', header:'Substitute', render:(s:any)=><span className="text-sm">{s.substituteTeacher?.user?.profile?.firstName??'—'}</span> },
    { key:'date', header:'Date', render:(s:any)=><span className="text-xs">{new Date(s.date).toLocaleDateString()}</span> },
    { key:'reason', header:'Reason', render:(s:any)=><span className="text-xs text-gray-400">{s.reason}</span> },
    { key:'status', header:'Status', render:(s:any)=><Badge variant={s.status==='CONFIRMED'?'green':'yellow'}>{s.status}</Badge> },
  ];
  const trainingCols = [
    { key:'title', header:'Training Program', render:(t:any)=><div><p className="font-bold text-sm">{t.title}</p>{t.provider&&<p className="text-xs text-gray-400">{t.provider}</p>}</div> },
    { key:'type', header:'Type', render:(t:any)=><span className="text-xs text-gray-500">{t.type}</span> },
    { key:'date', header:'Date', render:(t:any)=><span className="text-xs">{t.startDate?new Date(t.startDate).toLocaleDateString():'—'}</span> },
    { key:'status', header:'Status', render:(t:any)=><Badge variant={t.status==='COMPLETED'?'green':t.status==='ONGOING'?'blue':'gray'}>{t.status}</Badge> },
    { key:'cert', header:'Certificate', render:(t:any)=>t.certificateUrl&&<a href={t.certificateUrl} target="_blank" className="text-xs text-blue-600 underline">Download</a> },
  ];

  const draftCount = planList.filter((p:any)=>p.status==='DRAFT').length;
  const pendingCount = planList.filter((p:any)=>p.status==='SUBMITTED').length;

  return (
    <>
      <Topbar title="HR Tools" subtitle="Lesson plans, substitutions, and training"/>
      <div className="p-6">
        <PageHeader title="HR Tools" subtitle={`${draftCount} drafts · ${pendingCount} pending approval`}
          action={<div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">{(['plans','substitutions','training'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize ${tab===t?'bg-white shadow':''}`}>{t}</button>)}</div>
            {tab==='plans'&&<button onClick={()=>setCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">+ Lesson Plan</button>}
            {tab==='substitutions'&&<button onClick={()=>setSubModal(true)} className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg">+ Substitution</button>}
          </div>}/>

        {tab==='plans'&&(<>
          <div className="flex gap-2 mb-4">{['','DRAFT','SUBMITTED','APPROVED','REJECTED'].map(s=><button key={s} onClick={()=>setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${filterStatus===s?'bg-blue-600 text-white border-blue-600':'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{s||'All'}</button>)}</div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={planCols} data={planList} isLoading={isLoading} emptyMessage="No lesson plans found"/></div>
        </>)}
        {tab==='substitutions'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={subCols} data={subList} isLoading={sl} emptyMessage="No substitutions recorded"/></div>}
        {tab==='training'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={trainingCols} data={trainingList} isLoading={tl} emptyMessage="No training records found"/></div>}

        <Modal isOpen={createModal} onClose={()=>setCreateModal(false)} title="Create Lesson Plan" size="lg">
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Introduction to Algebra" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Scheduled Date</label><input type="date" value={form.scheduledDate} onChange={e=>setForm(f=>({...f,scheduledDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Duration (min)</label><input type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:+e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Learning Objectives</label><textarea value={form.objectives} onChange={e=>setForm(f=>({...f,objectives:e.target.value}))} rows={2} placeholder="Students will be able to..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Materials Needed</label><textarea value={form.materials} onChange={e=>setForm(f=>({...f,materials:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Teaching Methodology</label><textarea value={form.methodology} onChange={e=>setForm(f=>({...f,methodology:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Activities</label><textarea value={form.activities} onChange={e=>setForm(f=>({...f,activities:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Assessment Method</label><textarea value={form.assessment} onChange={e=>setForm(f=>({...f,assessment:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="flex gap-2 sticky bottom-0 bg-white pt-2"><button onClick={()=>setCreateModal(false)} className="flex-1 py-2 text-sm border rounded-lg">Cancel</button><button onClick={()=>create.mutate({...form,status:'DRAFT'})} disabled={!form.title||create.isPending} className="flex-1 py-2 text-sm bg-gray-600 text-white font-bold rounded-lg">Save Draft</button><button onClick={()=>create.mutate({...form,status:'SUBMITTED'})} disabled={!form.title||create.isPending} className="flex-1 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg">{create.isPending?'Submitting...':'Submit for Approval'}</button></div>
          </div>
        </Modal>

        <Modal isOpen={!!viewModal} onClose={()=>setViewModal(null)} title={viewModal?.title??''} size="lg">
          {viewModal&&<div className="space-y-3">
            <div className="flex gap-2"><Badge variant={SV[viewModal.status]}>{viewModal.status}</Badge><span className="text-xs text-gray-400">{viewModal.duration} min</span></div>
            {[{label:'Objectives',text:viewModal.objectives},{label:'Materials',text:viewModal.materials},{label:'Methodology',text:viewModal.methodology},{label:'Activities',text:viewModal.activities},{label:'Assessment',text:viewModal.assessment}].filter(s=>s.text).map(s=>(
              <div key={s.label} className="bg-gray-50 rounded-xl p-3"><p className="text-xs font-bold text-gray-400 uppercase mb-1">{s.label}</p><p className="text-sm text-gray-700">{s.text}</p></div>
            ))}
          </div>}
        </Modal>

        <Modal isOpen={subModal} onClose={()=>setSubModal(false)} title="Record Substitution">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Absent Teacher</label><select value={subForm.absentTeacherId} onChange={e=>setSubForm(f=>({...f,absentTeacherId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Select teacher</option>{teacherList.map((t:any)=><option key={t.id} value={t.id}>{t.user?.profile?.firstName} {t.user?.profile?.lastName}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Substitute Teacher</label><select value={subForm.substituteTeacherId} onChange={e=>setSubForm(f=>({...f,substituteTeacherId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Select teacher</option>{teacherList.map((t:any)=><option key={t.id} value={t.id}>{t.user?.profile?.firstName} {t.user?.profile?.lastName}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label><input type="date" value={subForm.date} onChange={e=>setSubForm(f=>({...f,date:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Reason</label><input value={subForm.reason} onChange={e=>setSubForm(f=>({...f,reason:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>createSub.mutate(subForm)} disabled={!subForm.absentTeacherId||!subForm.substituteTeacherId||createSub.isPending} className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-lg disabled:opacity-50">{createSub.isPending?'Saving...':'Save Substitution'}</button>
          </div>
        </Modal>
      </div>
    </>
  );
}
