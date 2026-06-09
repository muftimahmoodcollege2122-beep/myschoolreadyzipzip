'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';
import { DataTable } from '../../../components/shared/data-table';
import { useStudents } from '../../../hooks/use-api';

const TYPES = ['MERIT','NEED_BASED','SPORTS','SPECIAL','SIBLING','STAFF'];

export default function ScholarshipsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'scholarships'|'grants'|'discounts'|'installments'>('scholarships');
  const [schModal, setSchModal] = useState(false);
  const [grantModal, setGrantModal] = useState(false);
  const [discModal, setDiscModal] = useState(false);
  const [instModal, setInstModal] = useState(false);
  const [schForm, setSchForm] = useState({ name:'', type:'MERIT', amount:'', isPercentage:false, description:'', maxRecipients:'' });
  const [grantForm, setGrantForm] = useState({ scholarshipId:'', studentId:'', amount:'', remarks:'' });
  const [discForm, setDiscForm] = useState({ name:'', type:'PERCENTAGE', value:'', reason:'' });
  const [instForm, setInstForm] = useState({ invoiceId:'', noOfInstallments:3, startDate:new Date().toISOString().split('T')[0] });

  const { data: scholarships, isLoading:sl } = useQuery({ queryKey:['scholarships'], queryFn:()=>apiClient.get('/discounts/scholarships') });
  const { data: grants, isLoading:gl } = useQuery({ queryKey:['grants'], queryFn:()=>apiClient.get('/discounts/scholarships/grants'), enabled:tab==='grants' });
  const { data: discounts, isLoading:dl } = useQuery({ queryKey:['discounts'], queryFn:()=>apiClient.get('/discounts'), enabled:tab==='discounts' });
  const { data: instPlans, isLoading:il } = useQuery({ queryKey:['installment-plans'], queryFn:()=>apiClient.get('/discounts/installment-plans'), enabled:tab==='installments' });
  const { data: studentsData } = useStudents({ limit:200 });
  const students: any[] = (studentsData as any)?.data ?? [];

  const createSch = useMutation({ mutationFn:(d:any)=>apiClient.post('/discounts/scholarships',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['scholarships']});setSchModal(false);setSchForm({name:'',type:'MERIT',amount:'',isPercentage:false,description:'',maxRecipients:''});} });
  const grantSch = useMutation({ mutationFn:(d:any)=>apiClient.post('/discounts/scholarships/grant',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['grants']});setGrantModal(false);} });
  const revokeSch = useMutation({ mutationFn:(id:string)=>apiClient.put(`/discounts/scholarships/grants/${id}/revoke`,{}), onSuccess:()=>qc.invalidateQueries({queryKey:['grants']}) });
  const createDisc = useMutation({ mutationFn:(d:any)=>apiClient.post('/discounts',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['discounts']});setDiscModal(false);} });
  const createInst = useMutation({ mutationFn:(d:any)=>apiClient.post('/discounts/installment-plans',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['installment-plans']});setInstModal(false);} });

  const schList: any[] = Array.isArray(scholarships)?scholarships:[];
  const grantList: any[] = Array.isArray(grants)?grants:[];
  const discList: any[] = Array.isArray(discounts)?discounts:[];
  const instList: any[] = Array.isArray(instPlans)?instPlans:[];

  const schCols = [
    { key:'name', header:'Scholarship', render:(s:any)=><div><p className="font-bold text-sm">{s.name}</p><p className="text-xs text-gray-400">{s.type}</p></div> },
    { key:'amount', header:'Benefit', render:(s:any)=><span className="font-bold text-green-700">{s.isPercentage?`${s.amount}%`:`Rs. ${Number(s.amount).toLocaleString()}`}</span> },
    { key:'recipients', header:'Recipients', render:(s:any)=><span className="text-sm">{s.currentRecipients}{s.maxRecipients?`/${s.maxRecipients}`:''}</span> },
    { key:'status', header:'Status', render:(s:any)=><Badge variant={s.isActive?'green':'red'}>{s.isActive?'Active':'Inactive'}</Badge> },
    { key:'act', header:'', render:(s:any)=><button onClick={()=>{setGrantForm(f=>({...f,scholarshipId:s.id,amount:String(s.amount)}));setGrantModal(true);}} className="px-3 py-1 text-xs font-bold text-green-700 bg-green-50 rounded-lg">Grant</button> },
  ];
  const grantCols = [
    { key:'sch', header:'Scholarship', render:(g:any)=><span className="font-semibold text-sm">{g.scholarship?.name??'—'}</span> },
    { key:'student', header:'Student', render:(_g:any)=><span className="text-sm text-gray-600">—</span> },
    { key:'amount', header:'Amount', render:(g:any)=><span className="font-bold text-green-700">Rs. {Number(g.amount).toLocaleString()}</span> },
    { key:'status', header:'Status', render:(g:any)=><Badge variant={g.status==='ACTIVE'?'green':g.status==='REVOKED'?'red':'yellow'}>{g.status}</Badge> },
    { key:'act', header:'', render:(g:any)=>g.status==='ACTIVE'&&<button onClick={()=>revokeSch.mutate(g.id)} className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded-lg font-bold">Revoke</button> },
  ];
  const discCols = [
    { key:'name', header:'Discount', render:(d:any)=><div><p className="font-bold text-sm">{d.name}</p>{d.reason&&<p className="text-xs text-gray-400">{d.reason}</p>}</div> },
    { key:'value', header:'Value', render:(d:any)=><span className="font-bold text-orange-700">{d.type==='PERCENTAGE'?`${d.value}%`:`Rs. ${Number(d.value).toLocaleString()}`}</span> },
    { key:'status', header:'Status', render:(d:any)=><Badge variant={d.isActive?'green':'red'}>{d.isActive?'Active':'Inactive'}</Badge> },
  ];
  const instCols = [
    { key:'total', header:'Invoice Total', render:(p:any)=><span className="font-bold">Rs. {Number(p.totalAmount).toLocaleString()}</span> },
    { key:'installments', header:'Installments', render:(p:any)=><span className="text-sm">{p.noOfInstallments} payments</span> },
    { key:'status', header:'Status', render:(p:any)=><Badge variant={p.status==='ACTIVE'?'green':p.status==='COMPLETED'?'blue':'red'}>{p.status}</Badge> },
    { key:'paid', header:'Paid', render:(p:any)=>{const paid=(p.installments||[]).filter((i:any)=>i.status==='PAID').length;return<span className="text-sm font-bold">{paid}/{p.noOfInstallments}</span>;} },
  ];

  const totalGrants = grantList.reduce((s:number,g:any)=>s+Number(g.amount),0);

  return (
    <>
      <Topbar title="Scholarships & Discounts" subtitle="Manage financial assistance and fee discounts"/>
      <div className="p-6">
        <PageHeader title="Scholarships & Discounts" subtitle={`${schList.length} scholarships · ${grantList.length} active grants`}
          action={<div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">{(['scholarships','grants','discounts','installments'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize ${tab===t?'bg-white shadow':''}`}>{t}</button>)}</div>
            {tab==='scholarships'&&<button onClick={()=>setSchModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg">+ Scholarship</button>}
            {tab==='grants'&&<button onClick={()=>setGrantModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">+ Grant</button>}
            {tab==='discounts'&&<button onClick={()=>setDiscModal(true)} className="px-4 py-2 bg-orange-600 text-white text-sm font-bold rounded-lg">+ Discount</button>}
            {tab==='installments'&&<button onClick={()=>setInstModal(true)} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg">+ Installment Plan</button>}
          </div>}/>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{label:'Total Scholarships',value:schList.length,color:'text-green-700',bg:'bg-green-50'},{label:'Active Grants',value:grantList.filter((g:any)=>g.status==='ACTIVE').length,color:'text-blue-700',bg:'bg-blue-50'},{label:'Total Assistance',value:`Rs. ${totalGrants.toLocaleString()}`,color:'text-purple-700',bg:'bg-purple-50'},{label:'Installment Plans',value:instList.length,color:'text-orange-700',bg:'bg-orange-50'}].map(s=>(
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {tab==='scholarships'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={schCols} data={schList} isLoading={sl} emptyMessage="No scholarships created yet"/></div>}
        {tab==='grants'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={grantCols} data={grantList} isLoading={gl} emptyMessage="No grants issued yet"/></div>}
        {tab==='discounts'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={discCols} data={discList} isLoading={dl} emptyMessage="No discounts configured"/></div>}
        {tab==='installments'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={instCols} data={instList} isLoading={il} emptyMessage="No installment plans created"/></div>}

        <Modal isOpen={schModal} onClose={()=>setSchModal(false)} title="Create Scholarship">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label><input value={schForm.name} onChange={e=>setSchForm(f=>({...f,name:e.target.value}))} placeholder="Merit Scholarship" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label><select value={schForm.type} onChange={e=>setSchForm(f=>({...f,type:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount / %</label><input type="number" value={schForm.amount} onChange={e=>setSchForm(f=>({...f,amount:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={schForm.isPercentage} onChange={e=>setSchForm(f=>({...f,isPercentage:e.target.checked}))} id="isPct"/><label htmlFor="isPct" className="text-sm text-gray-700">Is Percentage (%)</label></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max Recipients (optional)</label><input type="number" value={schForm.maxRecipients} onChange={e=>setSchForm(f=>({...f,maxRecipients:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><textarea value={schForm.description} onChange={e=>setSchForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>createSch.mutate({...schForm,amount:parseFloat(schForm.amount),maxRecipients:schForm.maxRecipients?parseInt(schForm.maxRecipients):undefined})} disabled={!schForm.name||!schForm.amount||createSch.isPending} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg disabled:opacity-50">{createSch.isPending?'Creating...':'Create Scholarship'}</button>
          </div>
        </Modal>
        <Modal isOpen={grantModal} onClose={()=>setGrantModal(false)} title="Grant Scholarship">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Scholarship</label><select value={grantForm.scholarshipId} onChange={e=>setGrantForm(f=>({...f,scholarshipId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Select scholarship</option>{schList.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Student</label><select value={grantForm.studentId} onChange={e=>setGrantForm(f=>({...f,studentId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Select student</option>{students.map((s:any)=><option key={s.id} value={s.id}>{s.user?.profile?.firstName} {s.user?.profile?.lastName}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount Override (optional)</label><input type="number" value={grantForm.amount} onChange={e=>setGrantForm(f=>({...f,amount:e.target.value}))} placeholder="Leave empty to use scholarship amount" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Remarks</label><input value={grantForm.remarks} onChange={e=>setGrantForm(f=>({...f,remarks:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>grantSch.mutate({...grantForm,amount:grantForm.amount?parseFloat(grantForm.amount):undefined})} disabled={!grantForm.scholarshipId||!grantForm.studentId||grantSch.isPending} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50">{grantSch.isPending?'Granting...':'Grant Scholarship'}</button>
          </div>
        </Modal>
        <Modal isOpen={discModal} onClose={()=>setDiscModal(false)} title="Create Discount">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Discount Name</label><input value={discForm.name} onChange={e=>setDiscForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label><select value={discForm.type} onChange={e=>setDiscForm(f=>({...f,type:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED">Fixed (Rs.)</option></select></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Value</label><input type="number" value={discForm.value} onChange={e=>setDiscForm(f=>({...f,value:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Reason</label><input value={discForm.reason} onChange={e=>setDiscForm(f=>({...f,reason:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>createDisc.mutate({...discForm,value:parseFloat(discForm.value)})} disabled={!discForm.name||!discForm.value||createDisc.isPending} className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-lg disabled:opacity-50">{createDisc.isPending?'Creating...':'Create Discount'}</button>
          </div>
        </Modal>
        <Modal isOpen={instModal} onClose={()=>setInstModal(false)} title="Create Installment Plan">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Invoice ID</label><input value={instForm.invoiceId} onChange={e=>setInstForm(f=>({...f,invoiceId:e.target.value}))} placeholder="Paste invoice UUID" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">No. of Installments</label><select value={instForm.noOfInstallments} onChange={e=>setInstForm(f=>({...f,noOfInstallments:+e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{[2,3,4,6,12].map(n=><option key={n} value={n}>{n} installments</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start Date</label><input type="date" value={instForm.startDate} onChange={e=>setInstForm(f=>({...f,startDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
            <button onClick={()=>createInst.mutate(instForm)} disabled={!instForm.invoiceId||createInst.isPending} className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50">{createInst.isPending?'Creating...':'Create Plan'}</button>
          </div>
        </Modal>
      </div>
    </>
  );
}
