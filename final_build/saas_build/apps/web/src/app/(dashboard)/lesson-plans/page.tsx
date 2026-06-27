'use client';
import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useLessonPlans, useCreateLessonPlan, useSubmitLessonPlan, useSubjects, useSections } from '@/hooks/use-api';

const STATUS_COLOR: Record<string, string> = { DRAFT: 'gray', SUBMITTED: 'blue', APPROVED: 'green', REJECTED: 'red' };
const EMPTY = { title: '', subjectId: '', sectionId: '', week: new Date().toISOString().split('T')[0].substring(0, 7), objectives: '', content: '', resources: '', activities: '', assessment: '' };

export default function LessonPlansPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: plans = [], isLoading } = useLessonPlans({ status: statusFilter });
  const { data: subjects = [] } = useSubjects();
  const { data: sections = [] } = useSections();
  const create = useCreateLessonPlan();
  const submit = useSubmitLessonPlan();

  const planList: any[] = Array.isArray(plans) ? plans : [];
  const filtered = planList.filter(p =>
    (!search || p.title?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || p.status === statusFilter)
  );

  const handleCreate = async () => {
    if (!form.title) return;
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
  };

  const handleSubmit = async (id: string) => {
    await submit.mutateAsync(id);
    // Notify admin that a lesson plan needs review
    const plan = planList.find((p: any) => p.id === id);
    await apiClient.post('/notifications/broadcast', {
      title: '📋 Lesson Plan Submitted for Review',
      body: `A lesson plan "${plan?.title || 'Untitled'}" has been submitted and is awaiting your approval.`,
      audience: 'ALL_STAFF', channels: ['IN_APP'],
    }).catch(() => {});
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <>
      <Topbar title="Lesson Plans" subtitle="Teaching plan management" />
      <div className="p-6">
        <PageHeader title="Lesson Plans" subtitle={`${planList.length} lesson plans`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Create Plan</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Plans', value: planList.length, icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Approved', value: planList.filter(p => p.status === 'APPROVED').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Submitted', value: planList.filter(p => p.status === 'SUBMITTED').length, icon: '📤', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Drafts', value: planList.filter(p => p.status === 'DRAFT').length, icon: '✏️', color: 'text-gray-600', bg: 'bg-gray-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lesson plans..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s || 'all'} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${statusFilter === s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{s || 'All'}</button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading lesson plans...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-medium">{search || statusFilter ? 'No plans found' : 'No lesson plans yet'}</p>
              {!search && !statusFilter && <p className="text-sm mt-1">Create your first lesson plan</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((plan: any) => (
                <div key={plan.id} onClick={() => setSelected(plan)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{plan.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {plan.subject?.name || 'N/A'} · {plan.section ? `${plan.section.class?.name} - ${plan.section.name}` : 'N/A'}
                        {plan.week ? ` · Week: ${plan.week}` : ''}
                      </p>
                    </div>
                    <Badge variant={STATUS_COLOR[plan.status] as any}>{plan.status}</Badge>
                  </div>
                  {plan.objectives && <p className="text-xs text-gray-500 mb-3 line-clamp-2">🎯 {plan.objectives}</p>}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{formatDate(plan.createdAt)}</span>
                    {plan.status === 'DRAFT' && (
                      <button onClick={e => { e.stopPropagation(); handleSubmit(plan.id); }} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">📤 Submit</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Lesson Plan">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Plan Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 5: Photosynthesis" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Subject</label>
              <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select Subject</option>
                {(Array.isArray(subjects) ? subjects : []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Section</label>
              <select value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select Section</option>
                {(Array.isArray(sections) ? sections : []).map((s: any) => <option key={s.id} value={s.id}>{s.class?.name} - {s.name}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Week</label>
            <input type="week" value={form.week} onChange={e => setForm({ ...form, week: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          {[['objectives','Learning Objectives'],['content','Content / Topics'],['activities','Activities'],['resources','Resources / Materials'],['assessment','Assessment Method']].map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <textarea rows={2} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} /></div>
          ))}
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Creating...' : 'Save as Draft'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="p-6 space-y-3">
            <div className="flex gap-2 mb-2">
              <Badge variant={STATUS_COLOR[selected.status] as any}>{selected.status}</Badge>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{selected.subject?.name || 'N/A'}</span>
            </div>
            {[['Objectives',selected.objectives],['Content',selected.content],['Activities',selected.activities],['Resources',selected.resources],['Assessment',selected.assessment]].filter(([,v]) => v).map(([k,v]) => (
              <div key={k}>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{k}</p>
                <p className="text-sm text-gray-700">{String(v)}</p>
              </div>
            ))}
            {selected.status === 'DRAFT' && (
              <button onClick={() => { handleSubmit(selected.id); setSelected(null); }} className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg">📤 Submit for Approval</button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
