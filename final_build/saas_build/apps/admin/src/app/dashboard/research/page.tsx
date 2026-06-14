'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const SUBJECTS = ['Science','Mathematics','Social Studies','Language Arts','History','Technology','Environment','Health','Other'];
const STATUS_COLOR: Record<string, string> = { 'IN_PROGRESS': 'yellow', 'COMPLETED': 'green', 'SUBMITTED': 'blue', 'APPROVED': 'green', 'REJECTED': 'red' };
const EMPTY = { title: '', subject: 'Science', students: '', supervisor: '', description: '', status: 'IN_PROGRESS', startDate: new Date().toISOString().split('T')[0], endDate: '', level: 'School', award: '' };

export default function ResearchPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: projects = [], isLoading } = useSchoolSection('research');
  const create = useCreateSchoolItem('research');
  const del = useDeleteSchoolItem('research');

  const projectList: any[] = Array.isArray(projects) ? projects : [];
  const filtered = projectList.filter(p =>
    (!search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.students?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || p.status === statusFilter)
  );

  const handleCreate = async () => {
    if (!form.title) return;
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
      <Topbar title="Research" subtitle="Student research projects & science fair" />
      <div className="p-6">
        <PageHeader title="Research Projects" subtitle={`${projectList.length} research projects`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ New Project</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Projects', value: projectList.length, icon: '🔬', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Progress', value: projectList.filter(p => p.status === 'IN_PROGRESS').length, icon: '⚙️', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Completed', value: projectList.filter(p => p.status === 'COMPLETED').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Awards Won', value: projectList.filter(p => p.award).length, icon: '🏆', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or students..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['', 'IN_PROGRESS', 'COMPLETED', 'SUBMITTED', 'APPROVED'].map(s => (
              <button key={s || 'all'} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${statusFilter === s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{s || 'All'}</button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading projects...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔬</p>
              <p className="font-medium">{search || statusFilter ? 'No projects found' : 'No research projects yet'}</p>
              {!search && !statusFilter && <p className="text-sm mt-1">Add your school's research projects and science fair entries</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((project: any) => (
                <div key={project.id} onClick={() => setSelected(project)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">🔬</span>
                      <div>
                        <p className="font-bold text-gray-900">{project.title}</p>
                        <p className="text-xs text-gray-500">{project.subject} · {project.level}</p>
                      </div>
                    </div>
                    <Badge variant={STATUS_COLOR[project.status] as any}>{project.status}</Badge>
                  </div>
                  {project.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>}
                  <div className="space-y-1 text-xs text-gray-400">
                    {project.students && <p>👥 {project.students}</p>}
                    {project.supervisor && <p>👨‍🏫 Supervisor: {project.supervisor}</p>}
                    <p>📅 {formatDate(project.startDate)} → {project.endDate ? formatDate(project.endDate) : 'Ongoing'}</p>
                    {project.award && <p className="text-yellow-600 font-bold">🏆 {project.award}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Research Project">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Project Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Research project title..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Subject</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Level</label>
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['School','District','Provincial','National'].map(l => <option key={l}>{l}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Students (names)</label>
            <input value={form.students} onChange={e => setForm({ ...form, students: e.target.value })} placeholder="e.g. Ahmed Ali, Sara Khan" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Supervisor</label>
            <input value={form.supervisor} onChange={e => setForm({ ...form, supervisor: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Teacher/supervisor name" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Brief description of the research..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Project'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <Badge variant={STATUS_COLOR[selected.status] as any}>{selected.status}</Badge>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{selected.subject}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{selected.level}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{selected.description}</p>
            {[['Students',selected.students],['Supervisor',selected.supervisor],['Start',formatDate(selected.startDate)],['End',selected.endDate ? formatDate(selected.endDate) : 'Ongoing'],['Award',selected.award||'None']].filter(([,v]) => v).map(([k,v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
                <span className="text-gray-400">{k}</span><span className="font-medium text-gray-800">{String(v)}</span>
              </div>
            ))}
            <button onClick={() => { del.mutate(selected.id); setSelected(null); }} className="mt-4 w-full py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100">Delete Project</button>
          </div>
        )}
      </Modal>
    </>
  );
}
