'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const STATUS_META: any = {
  PENDING:   { label: '⏳ Pending Review', variant: 'yellow' },
  APPROVED:  { label: '✅ Approved',        variant: 'green' },
  REJECTED:  { label: '❌ Rejected',        variant: 'red' },
  WAITLISTED:{ label: '📋 Waitlisted',      variant: 'blue' },
  ENROLLED:  { label: '🎓 Enrolled',        variant: 'green' },
};

export default function AdmissionsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [modal, setModal] = useState<'view'|'enroll'|null>(null);
  const [enrollForm, setEnrollForm] = useState({ sectionId:'', rollNumber:'', admissionNo:'' });
  const [remarksInput, setRemarksInput] = useState('');

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ['admissions', statusFilter],
    queryFn: () => apiClient.get(`/students/admissions/applications${statusFilter ? `?status=${statusFilter}` : ''}`),
  });
  const { data: sections = [] } = useQuery({ queryKey:['sections'], queryFn:()=>apiClient.get('/school-data/sections') });

  const updateStatus = useMutation({
    mutationFn: ({ appId, status, remarks }: any) =>
      apiClient.patch(`/students/admissions/applications/${appId}/status`, { status, remarks }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['admissions'] }); setSelected(null); },
  });
  const enroll = useMutation({
    mutationFn: ({ appId, ...dto }: any) => apiClient.post(`/students/admissions/applications/${appId}/enroll`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['admissions'] }); setModal(null); alert('✅ Student enrolled and credentials sent!'); },
  });

  const allApps = Array.isArray(apps) ? apps : (apps as any)?.data ?? [];
  const counts = { ALL: allApps.length, PENDING: allApps.filter((a:any)=>a.status==='PENDING').length, APPROVED: allApps.filter((a:any)=>a.status==='APPROVED').length, ENROLLED: allApps.filter((a:any)=>a.status==='ENROLLED').length };

  return (
    <>
      <Topbar title="Admissions" subtitle="Manage online admission applications" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Applications', value: counts.ALL,      color:'bg-blue-600',  icon:'📋' },
            { label:'Pending Review',     value: counts.PENDING,  color:'bg-amber-500', icon:'⏳' },
            { label:'Approved',           value: counts.APPROVED, color:'bg-green-600', icon:'✅' },
            { label:'Enrolled',           value: counts.ENROLLED, color:'bg-purple-600',icon:'🎓' },
          ].map(s=>(
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        <PageHeader title="Admission Applications" subtitle="Review and process incoming applications"
          action={
            <div className="flex gap-3">
              {['','PENDING','APPROVED','REJECTED','WAITLISTED','ENROLLED'].map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${statusFilter===s?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s||'All'}
                </button>
              ))}
            </div>
          }
        />

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 text-gray-400">Loading applications...</div>
          ) : allApps.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-semibold">No applications yet</p>
              <p className="text-sm mt-1">Applications submitted through the school website will appear here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                {['Applicant','For Class','Parent Contact','Applied On','Status','Actions'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {allApps.map((app:any)=>(
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">{app.firstName} {app.lastName}</p>
                      <p className="text-xs text-gray-400">{app.id}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-700">{app.applyingForClass}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{app.parentName}</p>
                      <p className="text-xs text-gray-400">{app.parentPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(app.submittedAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_META[app.status]?.variant ?? 'gray'}>{STATUS_META[app.status]?.label ?? app.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={()=>{setSelected(app);setModal('view')}} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">View</button>
                        {app.status==='PENDING' && (<>
                          <button onClick={()=>updateStatus.mutate({appId:app.id,status:'APPROVED'})} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-semibold">Approve</button>
                          <button onClick={()=>updateStatus.mutate({appId:app.id,status:'REJECTED'})} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold">Reject</button>
                          <button onClick={()=>updateStatus.mutate({appId:app.id,status:'WAITLISTED'})} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-semibold">Waitlist</button>
                        </>)}
                        {app.status==='APPROVED' && (
                          <button onClick={()=>{setSelected(app);setEnrollForm({sectionId:'',rollNumber:'',admissionNo:''});setModal('enroll')}} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Enroll →</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Application Modal */}
      {modal==='view' && selected && (
        <Modal title={`Application: ${selected.firstName} ${selected.lastName}`} onClose={()=>{setModal(null);setSelected(null)}}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Full Name',`${selected.firstName} ${selected.lastName}`],['Date of Birth',selected.dateOfBirth],
                ['Gender',selected.gender],['Nationality',selected.nationality],['Religion',selected.religion],
                ['Email',selected.email],['Phone',selected.phone],['Previous School',selected.previousSchool||'—'],
                ['Applying for Class',selected.applyingForClass],['Address',selected.address],
                ['Parent Name',selected.parentName],['Parent Phone',selected.parentPhone],['Parent Email',selected.parentEmail],
              ].map(([k,v])=>(
                <div key={k}><p className="text-xs text-gray-500 uppercase font-bold mb-0.5">{k}</p><p className="font-medium text-gray-900">{v||'—'}</p></div>
              ))}
            </div>
            {selected.notes && <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 font-bold mb-1">NOTES</p><p className="text-sm">{selected.notes}</p></div>}
            {selected.status==='PENDING' && (
              <div className="flex gap-3 pt-2">
                <button onClick={()=>updateStatus.mutate({appId:selected.id,status:'APPROVED'})} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700">✅ Approve</button>
                <button onClick={()=>updateStatus.mutate({appId:selected.id,status:'REJECTED',remarks:remarksInput})} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">❌ Reject</button>
                <button onClick={()=>updateStatus.mutate({appId:selected.id,status:'WAITLISTED'})} className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600">📋 Waitlist</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Enroll Modal */}
      {modal==='enroll' && selected && (
        <Modal title={`Enroll: ${selected.firstName} ${selected.lastName}`} onClose={()=>setModal(null)}>
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">Application approved. Assign a class section and roll number to complete enrollment.</div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign to Section *</label>
              <select value={enrollForm.sectionId} onChange={e=>setEnrollForm(f=>({...f,sectionId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select section</option>
                {(Array.isArray(sections)?sections:(sections as any)?.data??[]).map((s:any)=>(
                  <option key={s.id} value={s.id}>{s.class?.name} — {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Roll Number *</label>
              <input value={enrollForm.rollNumber} onChange={e=>setEnrollForm(f=>({...f,rollNumber:e.target.value}))} placeholder="e.g. 2025-101" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admission Number *</label>
              <input value={enrollForm.admissionNo} onChange={e=>setEnrollForm(f=>({...f,admissionNo:e.target.value}))} placeholder="e.g. ADM-2025-001" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={()=>enroll.mutate({appId:selected.id,...enrollForm})}
                disabled={!enrollForm.sectionId||!enrollForm.rollNumber||!enrollForm.admissionNo||enroll.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40">
                {enroll.isPending?'Enrolling...':'🎓 Complete Enrollment'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
