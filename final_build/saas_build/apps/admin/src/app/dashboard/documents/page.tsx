'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const DOC_TYPES = ['Policy','Circular','Form','Template','Report','Minutes','Certificate','Other'];
const EMPTY = { title: '', type: 'Policy', description: '', uploadedBy: '', fileUrl: '', accessLevel: 'All Staff' };

export default function DocumentsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: docs = [], isLoading } = useSchoolSection('documents');
  const create = useCreateSchoolItem('documents');
  const del = useDeleteSchoolItem('documents');

  const docList: any[] = Array.isArray(docs) ? docs : [];
  const filtered = docList.filter(d =>
    (!search || d.title?.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || d.type === typeFilter)
  );

  const handleCreate = async () => {
    if (!form.title) return;
    try {
    await create.mutateAsync({ ...form, uploadedAt: new Date().toISOString() });
    setForm(EMPTY); setModal(false);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  const DOC_ICONS: Record<string, string> = { Policy: '📋', Circular: '📢', Form: '📝', Template: '📄', Report: '📊', Minutes: '📓', Certificate: '🎖️', Other: '📁' };

  return (
    <>
      <Topbar title="Documents" subtitle="School document repository" />
      <div className="p-6">
        <PageHeader title="Document Repository" subtitle={`${docList.length} documents stored`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Document</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Docs', value: docList.length, icon: '📁', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Policies', value: docList.filter(d => d.type === 'Policy').length, icon: '📋', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Forms', value: docList.filter(d => d.type === 'Form').length, icon: '📝', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'This Month', value: docList.filter(d => new Date(d.uploadedAt) > new Date(Date.now() - 30*864e5)).length, icon: '📅', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Types</option>
            {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading documents...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📁</p>
              <p className="font-medium">{search || typeFilter ? 'No documents found' : 'No documents stored yet'}</p>
              {!search && !typeFilter && <p className="text-sm mt-1">Upload your first school document</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((doc: any) => (
                <div key={doc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{DOC_ICONS[doc.type] || '📁'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500">{doc.type} · {formatDate(doc.uploadedAt)}</p>
                    </div>
                  </div>
                  {doc.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{doc.description}</p>}
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                    {doc.uploadedBy && <p>By: {doc.uploadedBy}</p>}
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{doc.accessLevel}</span>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noopener" className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100 text-center">⬇ Download</a>}
                    <button onClick={() => del.mutate(doc.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Document">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Document Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. School Fee Policy 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Access Level</label>
              <select value={form.accessLevel} onChange={e => setForm({ ...form, accessLevel: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['All Staff','Admin Only','Teachers','Public'].map(a => <option key={a}>{a}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Brief description..." />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Uploaded By</label>
            <input value={form.uploadedBy} onChange={e => setForm({ ...form, uploadedBy: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Your name" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">File URL</label>
            <input value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="https://..." /></div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Document'}
          </button>
        </div>
      </Modal>
    </>
  );
}
