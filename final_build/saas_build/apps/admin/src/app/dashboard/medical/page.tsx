'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const RECORD_TYPES = ['Sick Visit','Injury','Vaccination','Checkup','Allergy','Medication','First Aid','Other'];
const SEVERITY_COLOR: Record<string, string> = { LOW: 'green', MEDIUM: 'yellow', HIGH: 'red', CRITICAL: 'red' };
const EMPTY = { studentName: '', className: '', date: new Date().toISOString().split('T')[0], type: 'Sick Visit', complaint: '', treatment: '', medication: '', severity: 'LOW', parentNotified: false, followUp: '' };

export default function MedicalPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: records = [], isLoading } = useSchoolSection('medicalrecords');
  const create = useCreateSchoolItem('medicalrecords');
  const del = useDeleteSchoolItem('medicalrecords');

  const recordList: any[] = Array.isArray(records) ? records : [];
  const filtered = recordList
    .filter(r =>
      (!search || r.studentName?.toLowerCase().includes(search.toLowerCase())) &&
      (!typeFilter || r.type === typeFilter)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const highSeverity = recordList.filter(r => r.severity === 'HIGH' || r.severity === 'CRITICAL');
  const today = new Date().toISOString().split('T')[0];
  const todayVisits = recordList.filter(r => r.date === today);

  const handleCreate = async () => {
    if (!form.studentName || !form.complaint) return;
    try {
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <>
      <Topbar title="Medical" subtitle="School health & medical records" />
      <div className="p-6">
        <PageHeader title="Medical Records" subtitle={`${recordList.length} total records`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Record</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Records', value: recordList.length, icon: '🏥', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: "Today's Visits", value: todayVisits.length, icon: '📅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'High Severity', value: highSeverity.length, icon: '🚨', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Parent Notified', value: recordList.filter(r => r.parentNotified).length, icon: '📱', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {highSeverity.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-bold text-red-800 text-sm">{highSeverity.length} high severity case(s) require attention</p>
              <p className="text-xs text-red-600">{highSeverity.map(r => r.studentName).join(', ')}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student name..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Types</option>
            {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {isLoading ? <div className="text-center py-12 text-gray-400">Loading medical records...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🏥</p>
              <p className="font-medium">{search || typeFilter ? 'No records found' : 'No medical records yet'}</p>
              {!search && !typeFilter && <p className="text-sm mt-1">Log student health visits and medical records</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((record: any) => (
                <div key={record.id} onClick={() => setSelected(record)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${record.severity === 'HIGH' || record.severity === 'CRITICAL' ? 'bg-red-100' : 'bg-blue-100'}`}>🏥</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{record.studentName}</p>
                        <p className="text-xs text-gray-400">{record.className || 'N/A'} · {formatDate(record.date)} · {record.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={SEVERITY_COLOR[record.severity] as any}>{record.severity}</Badge>
                      {record.parentNotified && <span className="text-xs text-blue-500">📱 Notified</span>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 ml-12">{record.complaint}</p>
                  {record.treatment && <p className="text-xs text-gray-400 ml-12 mt-0.5">Treatment: {record.treatment}</p>}
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Medical Record">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Student Name *</label>
              <input value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Student name" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Class</label>
              <input value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Class 8-A" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(s => <option key={s}>{s}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Complaint *</label>
            <textarea rows={2} value={form.complaint} onChange={e => setForm({ ...form, complaint: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Describe the complaint/symptoms..." /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Treatment Given</label>
            <input value={form.treatment} onChange={e => setForm({ ...form, treatment: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Treatment or first aid given..." /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Medication</label>
            <input value={form.medication} onChange={e => setForm({ ...form, medication: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Medication given if any..." /></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.parentNotified} onChange={e => setForm({ ...form, parentNotified: e.target.checked })} />
            Parent/Guardian Notified
          </label>
          <div><label className="text-xs text-gray-500 mb-1 block">Follow-up Required</label>
            <input value={form.followUp} onChange={e => setForm({ ...form, followUp: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Any follow-up instructions..." /></div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Record'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.studentName || ''}>
        {selected && (
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <Badge variant={SEVERITY_COLOR[selected.severity] as any}>{selected.severity}</Badge>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{selected.type}</span>
              <span className="text-xs text-gray-400">{formatDate(selected.date)}</span>
            </div>
            {[['Complaint',selected.complaint],['Treatment',selected.treatment||'None'],['Medication',selected.medication||'None'],['Class',selected.className||'N/A'],['Parent Notified',selected.parentNotified?'Yes':'No'],['Follow-up',selected.followUp||'None']].map(([k,v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
                <span className="text-gray-400">{k}</span><span className="font-medium text-gray-800 text-right ml-4">{String(v)}</span>
              </div>
            ))}
            <button onClick={() => { del.mutate(selected.id); setSelected(null); }} className="mt-4 w-full py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100">Delete Record</button>
          </div>
        )}
      </Modal>
    </>
  );
}
