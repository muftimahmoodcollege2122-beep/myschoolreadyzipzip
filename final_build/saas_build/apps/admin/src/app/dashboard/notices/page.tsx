'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const NOTICE_TYPES = ['General','Academic','Fee','Examination','Holiday','Meeting','Sports','Other'];
const EMPTY = { title: '', type: 'General', content: '', issuedDate: new Date().toISOString().split('T')[0], expiresDate: '', issuedBy: '', priority: 'NORMAL', audience: 'All' };

export default function NoticesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: notices = [], isLoading } = useSchoolSection('notices');
  const create = useCreateSchoolItem('notices');
  const del = useDeleteSchoolItem('notices');

  const noticeList: any[] = Array.isArray(notices) ? notices : [];
  const now = new Date();
  const filtered = noticeList
    .filter(n =>
      (!search || n.title?.toLowerCase().includes(search.toLowerCase())) &&
      (!typeFilter || n.type === typeFilter)
    )
    .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());

  const active = noticeList.filter(n => !n.expiresDate || new Date(n.expiresDate) >= now);
  const expired = noticeList.filter(n => n.expiresDate && new Date(n.expiresDate) < now);

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    try {
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const PRIORITY_COLOR: Record<string, string> = { URGENT: 'red', HIGH: 'red', NORMAL: 'blue', LOW: 'gray' };

  return (
    <>
      <Topbar title="Notices" subtitle="Official school notice board" />
      <div className="p-6">
        <PageHeader title="Notice Board" subtitle={`${noticeList.length} notices · ${active.length} active`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Post Notice</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: noticeList.length, icon: '📌', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: active.length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Expired', value: expired.length, icon: '⏰', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'This Week', value: noticeList.filter(n => new Date(n.issuedDate) > new Date(Date.now() - 7*864e5)).length, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notices..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Types</option>
            {NOTICE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading notices...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📌</p>
              <p className="font-medium">{search || typeFilter ? 'No notices found' : 'No notices posted yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((notice: any) => {
                const isExpired = notice.expiresDate && new Date(notice.expiresDate) < now;
                return (
                  <div key={notice.id} onClick={() => setSelected(notice)} className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">📌</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{notice.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {notice.type} · {formatDate(notice.issuedDate)}
                            {notice.issuedBy ? ` · By ${notice.issuedBy}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={PRIORITY_COLOR[notice.priority] as any}>{notice.priority}</Badge>
                        {isExpired && <Badge variant="gray">Expired</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 ml-8">{notice.content}</p>
                  </div>
                );
              })}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Post Notice">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Notice Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Notice title..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {NOTICE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['NORMAL','HIGH','URGENT','LOW'].map(p => <option key={p}>{p}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Content *</label>
            <textarea rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Notice content..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
              <input type="date" value={form.issuedDate} onChange={e => setForm({ ...form, issuedDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Expires Date</label>
              <input type="date" value={form.expiresDate} onChange={e => setForm({ ...form, expiresDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Issued By</label>
            <input value={form.issuedBy} onChange={e => setForm({ ...form, issuedBy: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Principal / Admin" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Posting...' : 'Post Notice'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <Badge variant="blue">{selected.type}</Badge>
              <Badge variant={PRIORITY_COLOR[selected.priority] as any}>{selected.priority}</Badge>
              <span className="text-xs text-gray-400">{formatDate(selected.issuedDate)}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{selected.content}</p>
            {selected.issuedBy && <p className="text-xs text-gray-400">Issued by: {selected.issuedBy}</p>}
            {selected.expiresDate && <p className="text-xs text-gray-400">Expires: {formatDate(selected.expiresDate)}</p>}
            <button onClick={() => { del.mutate(selected.id); setSelected(null); }} className="mt-4 w-full py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100">Delete Notice</button>
          </div>
        )}
      </Modal>
    </>
  );
}
