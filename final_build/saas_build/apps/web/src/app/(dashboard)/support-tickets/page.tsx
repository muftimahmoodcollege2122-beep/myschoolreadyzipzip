'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';
import { DataTable } from '../../../components/shared/data-table';

const STATUSES = ['OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','URGENT'];
const CATS = ['BILLING','TECHNICAL','ACADEMIC','FEATURE_REQUEST','OTHER'];
const PV: Record<string,any> = { LOW:'gray', MEDIUM:'blue', HIGH:'orange', URGENT:'red' };
const SV: Record<string,any> = { OPEN:'blue', IN_PROGRESS:'yellow', WAITING:'orange', RESOLVED:'green', CLOSED:'gray' };

export default function SupportTicketsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState({ status:'', priority:'' });
  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [form, setForm] = useState({ subject:'', description:'', priority:'MEDIUM', category:'TECHNICAL' });

  const { data: tickets, isLoading } = useQuery({ queryKey:['tickets', filter], queryFn:()=>apiClient.get(`/support-tickets?status=${filter.status}&priority=${filter.priority}`) });
  const { data: stats } = useQuery({ queryKey:['ticket-stats'], queryFn:()=>apiClient.get('/support-tickets/stats') });
  const { data: ticketDetail } = useQuery({ queryKey:['ticket', viewModal?.id], queryFn:()=>apiClient.get(`/support-tickets/${viewModal?.id}`), enabled:!!viewModal?.id });

  const createTicket = useMutation({ mutationFn:(d:any)=>apiClient.post('/support-tickets',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['tickets']});setCreateModal(false);setForm({subject:'',description:'',priority:'MEDIUM',category:'TECHNICAL'});} });
  const updateStatus = useMutation({ mutationFn:({id,status}:any)=>apiClient.put(`/support-tickets/${id}/status`,{status}), onSuccess:()=>{qc.invalidateQueries({queryKey:['tickets']});qc.invalidateQueries({queryKey:['ticket']});} });
  const respond = useMutation({ mutationFn:({id,content}:any)=>apiClient.post(`/support-tickets/${id}/respond`,{content}), onSuccess:()=>{qc.invalidateQueries({queryKey:['ticket',viewModal?.id]});setResponse('');} });

  const t = tickets as any;
  const ticketList: any[] = t?.data ?? (Array.isArray(t) ? t : []);
  const s = stats as any;
  const detail = ticketDetail as any;

  const columns = [
    { key:'no', header:'Ticket', render:(t:any)=><div><p className="font-mono text-xs font-bold text-blue-700">{t.ticketNo}</p><p className="text-sm text-gray-900">{t.subject}</p></div> },
    { key:'cat', header:'Category', render:(t:any)=><span className="text-xs text-gray-500">{t.category}</span> },
    { key:'priority', header:'Priority', render:(t:any)=><Badge variant={PV[t.priority]}>{t.priority}</Badge> },
    { key:'status', header:'Status', render:(t:any)=><Badge variant={SV[t.status]}>{t.status}</Badge> },
    { key:'sla', header:'SLA', render:(t:any)=>{
      if(!t.slaDeadline) return null;
      const breached = new Date(t.slaDeadline)<new Date()&&t.status!=='RESOLVED'&&t.status!=='CLOSED';
      return <span className={`text-xs font-medium ${breached?'text-red-600':'text-gray-400'}`}>{breached?'⚠ Breached':new Date(t.slaDeadline).toLocaleDateString()}</span>;
    }},
    { key:'created', header:'Created', render:(t:any)=><span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span> },
    { key:'act', header:'', render:(t:any)=><button onClick={()=>setViewModal(t)} className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-lg">View</button> },
  ];

  return (
    <>
      <Topbar title="Support Tickets" subtitle="Track and resolve support requests"/>
      <div className="p-6">
        <PageHeader title="Support Tickets" subtitle={`${ticketList.length} tickets`}
          action={<button onClick={()=>setCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">+ New Ticket</button>}/>

        <div className="grid grid-cols-5 gap-3 mb-5">
          {[{label:'Total',value:s?.total??0,color:'text-gray-900'},{label:'Open',value:s?.open??0,color:'text-blue-700'},{label:'In Progress',value:s?.inProgress??0,color:'text-yellow-700'},{label:'Resolved',value:s?.resolved??0,color:'text-green-700'},{label:'SLA Breached',value:s?.slaBreached??0,color:'text-red-700'}].map(st=>(
            <div key={st.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-black ${st.color}`}>{st.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{st.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <select value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option value="">All Statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
          <select value={filter.priority} onChange={e=>setFilter(f=>({...f,priority:e.target.value}))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option value="">All Priorities</option>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <DataTable columns={columns} data={ticketList} isLoading={isLoading} emptyMessage="No tickets found"/>
        </div>

        <Modal isOpen={createModal} onClose={()=>setCreateModal(false)} title="Create Support Ticket">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject</label><input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="Brief description of your issue" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Priority</label><select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} placeholder="Describe your issue in detail..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>createTicket.mutate(form)} disabled={!form.subject||!form.description||createTicket.isPending} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50">{createTicket.isPending?'Submitting...':'Submit Ticket'}</button>
          </div>
        </Modal>

        <Modal isOpen={!!viewModal} onClose={()=>setViewModal(null)} title={viewModal?.ticketNo} size="lg">
          {detail&&<div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Badge variant={PV[detail.priority]}>{detail.priority}</Badge>
              <Badge variant={SV[detail.status]}>{detail.status}</Badge>
              <span className="text-xs text-gray-400">{detail.category}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4"><p className="font-bold text-sm text-gray-900">{detail.subject}</p><p className="text-sm text-gray-600 mt-2">{detail.description}</p></div>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.filter(s=>s!==detail.status).map(s=><button key={s} onClick={()=>updateStatus.mutate({id:detail.id,status:s})} className="px-3 py-1 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">{s}</button>)}
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {detail.responses?.map((r:any)=>(
                <div key={r.id} className={`p-3 rounded-xl text-sm ${r.isInternal?'bg-yellow-50 border border-yellow-100':'bg-blue-50'}`}>
                  {r.isInternal&&<span className="text-xs font-bold text-yellow-700 mb-1 block">🔒 Internal Note</span>}
                  <p>{r.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {!detail.responses?.length&&<p className="text-center text-gray-300 py-4">No responses yet</p>}
            </div>
            <div className="flex gap-2">
              <textarea value={response} onChange={e=>setResponse(e.target.value)} placeholder="Write a response..." rows={2} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"/>
              <button onClick={()=>respond.mutate({id:detail.id,content:response})} disabled={!response.trim()||respond.isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg disabled:opacity-50">Send</button>
            </div>
          </div>}
        </Modal>
      </div>
    </>
  );
}
