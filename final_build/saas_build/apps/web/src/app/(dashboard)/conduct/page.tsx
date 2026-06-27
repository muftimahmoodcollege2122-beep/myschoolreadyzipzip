'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';

const TYPE_COLOR: Record<string,any> = { POSITIVE:'green', NEGATIVE:'red', NEUTRAL:'gray' };
const SEV_COLOR:  Record<string,any> = { LOW:'green', MEDIUM:'yellow', HIGH:'red', CRITICAL:'red' };
const CATEGORIES = ['DISCIPLINE','ACADEMIC','ATTENDANCE','SOCIAL','ACHIEVEMENT','OTHER'];
const EMPTY = { studentId:'', type:'NEGATIVE', category:'DISCIPLINE', description:'', severity:'MEDIUM', actionTaken:'', notifyParent: true };

export default function ConductPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [alertsSent, setAlertsSent] = useState<string[]>([]);

  const { data: records = [], isLoading } = useQuery({ queryKey:['conduct'], queryFn:()=>apiClient.get('/students/behavior') });
  const { data: studentsData } = useQuery({ queryKey:['students-list'], queryFn:()=>apiClient.get('/students?limit=500') });

  const create = useMutation({
    mutationFn: (d: any) => apiClient.post('/students/behavior', d),
    onSuccess: async (res: any, vars: any) => {
      qc.invalidateQueries({ queryKey:['conduct'] });
      setModal(false); setForm(EMPTY);
      // auto-notify parent if checked
      if (vars.notifyParent && vars.type === 'NEGATIVE') {
        const student = students.find((s:any) => s.id === vars.studentId);
        const name = `${student?.user?.profile?.firstName || ''} ${student?.user?.profile?.lastName || ''}`.trim();
        await apiClient.post('/notifications/broadcast', {
          title: `⚠️ Conduct Alert: ${name}`,
          body: `Dear Parent, a ${vars.severity.toLowerCase()} ${vars.category.toLowerCase()} incident was recorded for ${name} on ${new Date().toLocaleDateString('en-PK', { day:'numeric', month:'short' })}. Category: ${vars.category}. Action taken: ${vars.actionTaken || 'Under review'}. Please contact the school for details.`,
          audience: 'ALL_PARENTS', channels: ['IN_APP','SMS'],
        }).catch(() => {});
        alert('✅ Record saved and parent notified via SMS & in-app.');
      }
    },
  });

  const sendAlert = async (record: any) => {
    const name = `${record.student?.user?.profile?.firstName || ''} ${record.student?.user?.profile?.lastName || ''}`.trim();
    await apiClient.post('/notifications/broadcast', {
      title: `⚠️ Conduct Alert: ${name}`,
      body: `Dear Parent, a ${record.severity?.toLowerCase()} ${record.category?.toLowerCase()} incident was recorded for ${name}. Action taken: ${record.actionTaken || 'Under review'}. Please contact the school.`,
      audience: 'ALL_PARENTS', channels: ['IN_APP','SMS'],
    });
    setAlertsSent(prev => [...prev, record.id]);
    alert('✅ Parent alerted via SMS and in-app notification.');
  };

  const allRecords: any[] = Array.isArray(records) ? records : (records as any)?.data ?? [];
  const students: any[] = (studentsData as any)?.data ?? [];
  const filtered = allRecords.filter(r =>
    (!typeFilter || r.type === typeFilter) &&
    (!search || `${r.student?.user?.profile?.firstName} ${r.student?.user?.profile?.lastName}`.toLowerCase().includes(search.toLowerCase()))
  );

  const positive = allRecords.filter(r => r.type === 'POSITIVE').length;
  const negative = allRecords.filter(r => r.type === 'NEGATIVE').length;
  const critical = allRecords.filter(r => r.severity === 'CRITICAL').length;

  return (
    <>
      <Topbar title="Conduct & Discipline" subtitle="Track student behaviour — auto-notify parents on incidents" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Records', value: allRecords.length, color:'bg-blue-600',   icon:'📋' },
            { label:'Positive',      value: positive,          color:'bg-green-600',  icon:'⭐' },
            { label:'Negative',      value: negative,          color:'bg-red-600',    icon:'⚠️' },
            { label:'Critical',      value: critical,          color:'bg-red-800',    icon:'🚨' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        <PageHeader title="Conduct Records" subtitle="All behaviour incidents and achievements"
          action={
            <div className="flex gap-3">
              {['','POSITIVE','NEGATIVE','NEUTRAL'].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${typeFilter===t?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {t || 'All'}
                </button>
              ))}
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
              <button onClick={() => { setForm(EMPTY); setModal(true); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">+ Log Incident</button>
            </div>
          }
        />

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 text-gray-400">Loading records...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-semibold">No conduct records found</p>
              <p className="text-sm mt-1">Click "Log Incident" to add a record</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                {['Student','Date','Type','Category','Severity','Description','Action Taken','Parent Alert'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">{r.student?.user?.profile?.firstName} {r.student?.user?.profile?.lastName}</p>
                      <p className="text-xs text-gray-400">{r.student?.rollNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td className="px-4 py-3"><Badge variant={TYPE_COLOR[r.type] ?? 'gray'}>{r.type}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.category}</td>
                    <td className="px-4 py-3"><Badge variant={SEV_COLOR[r.severity] ?? 'gray'}>{r.severity}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{r.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{r.actionTaken || '—'}</td>
                    <td className="px-4 py-3">
                      {r.type === 'NEGATIVE' ? (
                        alertsSent.includes(r.id) ? (
                          <span className="text-xs text-green-600 font-bold">✅ Sent</span>
                        ) : (
                          <button onClick={() => sendAlert(r)} className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">Alert Parent</button>
                        )
                      ) : <span className="text-gray-300 text-xs">N/A</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title="Log Conduct Record" onClose={() => setModal(false)}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student *</label>
              <select value={form.studentId} onChange={e => setForm((f:any) => ({...f, studentId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select student</option>
                {students.map((s:any) => <option key={s.id} value={s.id}>{s.user?.profile?.firstName} {s.user?.profile?.lastName} — {s.rollNumber}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select value={form.type} onChange={e => setForm((f:any) => ({...f, type:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {['POSITIVE','NEGATIVE','NEUTRAL'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select value={form.category} onChange={e => setForm((f:any) => ({...f, category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity</label>
                <select value={form.severity} onChange={e => setForm((f:any) => ({...f, severity:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {['LOW','MEDIUM','HIGH','CRITICAL'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm((f:any) => ({...f, description:e.target.value}))} rows={3} placeholder="Describe the incident in detail..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 resize-none"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Action Taken</label>
              <input value={form.actionTaken} onChange={e => setForm((f:any) => ({...f, actionTaken:e.target.value}))} placeholder="e.g. Verbal warning, detention, parent called..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
            </div>
            {form.type === 'NEGATIVE' && (
              <label className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl cursor-pointer">
                <input type="checkbox" checked={form.notifyParent} onChange={e => setForm((f:any) => ({...f, notifyParent:e.target.checked}))} className="w-4 h-4 accent-red-600"/>
                <div>
                  <p className="text-sm font-bold text-red-800">Auto-notify parent via SMS + in-app</p>
                  <p className="text-xs text-red-600">Parent receives instant alert about this incident</p>
                </div>
              </label>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => create.mutate(form)}
                disabled={!form.studentId || !form.description || create.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40"
              >{create.isPending ? 'Saving...' : '💾 Save Record'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
