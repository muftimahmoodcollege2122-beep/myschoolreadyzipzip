'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useStudentBehaviors, useCreateBehavior, useStudents } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const TYPE_COLOR: Record<string, string> = { POSITIVE: 'green', NEGATIVE: 'red', NEUTRAL: 'gray' };
const SEVERITY_COLOR: Record<string, string> = { LOW: 'green', MEDIUM: 'yellow', HIGH: 'red', CRITICAL: 'red' };
const EMPTY = { studentId: '', type: 'NEGATIVE', category: 'DISCIPLINE', description: '', severity: 'MEDIUM', actionTaken: '' };

export default function ConductPage() {
  const { toast } = useToast();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [typeFilter, setTypeFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const { data: records = [], isLoading } = useStudentBehaviors();
  const { data: studentsData } = useStudents({ limit: 100 });
  const create = useCreateBehavior();

  const allRecords: any[] = Array.isArray(records) ? records : [];
  const students: any[] = studentsData?.data ?? [];
  const filtered = allRecords.filter(r =>
    (!typeFilter || r.type === typeFilter) &&
    (!studentSearch || r.student?.user?.profile?.firstName?.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleCreate = async () => {
    if (!form.studentId || !form.description) return;
    try {
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  return (
    <>
      <Topbar title="Conduct" subtitle="Student behavior & discipline records" />
      <div className="p-6">
        <PageHeader title="Conduct Records" subtitle={`${allRecords.length} behavior records`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Log Behavior</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Records', value: allRecords.length, icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Positive', value: allRecords.filter(r => r.type === 'POSITIVE').length, icon: '⭐', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Negative', value: allRecords.filter(r => r.type === 'NEGATIVE').length, icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Critical', value: allRecords.filter(r => r.severity === 'CRITICAL').length, icon: '🚨', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search student..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['', 'POSITIVE', 'NEGATIVE', 'NEUTRAL'].map(t => (
              <button key={t || 'all'} onClick={() => setTypeFilter(t)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${typeFilter === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{t || 'All'}</button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading records...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-medium">{typeFilter || studentSearch ? 'No records found' : 'No conduct records yet'}</p>
              {!typeFilter && !studentSearch && <p className="text-sm mt-1">Log positive achievements or discipline incidents</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r: any) => {
                const name = r.student?.user?.profile ? `${r.student.user.profile.firstName} ${r.student.user.profile.lastName}` : 'Unknown Student';
                return (
                  <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${r.type === 'POSITIVE' ? 'bg-green-100 text-green-600' : r.type === 'NEGATIVE' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                          {r.type === 'POSITIVE' ? '⭐' : r.type === 'NEGATIVE' ? '⚠️' : '📝'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{name}</p>
                          <p className="text-xs text-gray-400">{r.category} · {formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={TYPE_COLOR[r.type] as any}>{r.type}</Badge>
                        {r.severity && <Badge variant={SEVERITY_COLOR[r.severity] as any}>{r.severity}</Badge>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-12">{r.description}</p>
                    {r.actionTaken && <p className="text-xs text-blue-600 ml-12 mt-1">Action: {r.actionTaken}</p>}
                    {r.isResolved && <p className="text-xs text-green-600 ml-12 mt-1">✅ Resolved</p>}
                  </div>
                );
              })}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Log Behavior Record">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Student *</label>
            <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Select Student</option>
              {students.map((s: any) => {
                const name = s.user?.profile ? `${s.user.profile.firstName} ${s.user.profile.lastName}` : s.admissionNo;
                return <option key={s.id} value={s.id}>{name}</option>;
              })}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['POSITIVE','NEGATIVE','NEUTRAL'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['DISCIPLINE','ACADEMIC','ATTENDANCE','SPORTS','SOCIAL'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description *</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the behavior incident..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Action Taken</label>
            <input value={form.actionTaken} onChange={e => setForm({ ...form, actionTaken: e.target.value })} placeholder="e.g. Warning issued, parent notified..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Logging...' : 'Log Record'}
          </button>
        </div>
      </Modal>
    </>
  );
}
