'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useSupportTickets, useCreateTicket, useTicketStats, useUpdateTicketStatus } from '@/hooks/use-api';

const EMPTY = { title: '', description: '', category: 'TECHNICAL', priority: 'MEDIUM' };
const STATUS_COLOR: Record<string, string> = { OPEN: 'blue', IN_PROGRESS: 'yellow', RESOLVED: 'green', CLOSED: 'gray' };
const PRIORITY_COLOR: Record<string, string> = { LOW: 'green', MEDIUM: 'yellow', HIGH: 'red', URGENT: 'red' };

export default function SupportTicketsPage() {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useSupportTickets({ status, priority });
  const { data: statsData } = useTicketStats();
  const create = useCreateTicket();
  const updateStatus = useUpdateTicketStatus();

  const tickets: any[] = data?.data ?? [];
  const stats = statsData || {};

  const handleCreate = async () => {
    if (!form.title || !form.description) return;
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <Topbar title="Support Tickets" subtitle="Help desk & issue tracking" />
      <div className="p-6">
        <PageHeader title="Support Tickets" subtitle={`${data?.meta?.total ?? 0} total tickets`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ New Ticket</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open', value: stats.open ?? tickets.filter((t: any) => t.status === 'OPEN').length, icon: '🔓', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Progress', value: stats.inProgress ?? tickets.filter((t: any) => t.status === 'IN_PROGRESS').length, icon: '⚙️', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Resolved', value: stats.resolved ?? tickets.filter((t: any) => t.status === 'RESOLVED').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Urgent', value: stats.urgent ?? tickets.filter((t: any) => t.priority === 'URGENT').length, icon: '🚨', color: 'text-red-600', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
              <button key={s || 'all'} onClick={() => setStatus(s)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${status === s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Priorities</option>
            {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading tickets...</div>
          : tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🎫</p>
              <p className="font-medium">No support tickets found</p>
              <p className="text-sm mt-1">Create a ticket to get help with any issue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t: any) => (
                <div key={t.id} onClick={() => setSelected(t)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">🎫</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{t.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.category} · {formatDate(t.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={PRIORITY_COLOR[t.priority] as any}>{t.priority}</Badge>
                      <Badge variant={STATUS_COLOR[t.status] as any}>{t.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 ml-8">{t.description}</p>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Support Ticket">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief description of the issue..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description *</label>
            <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['TECHNICAL','ACADEMIC','FINANCIAL','HR','GENERAL'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50">
            {create.isPending ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <Badge variant={PRIORITY_COLOR[selected.priority] as any}>{selected.priority}</Badge>
              <Badge variant={STATUS_COLOR[selected.status] as any}>{selected.status}</Badge>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{selected.category}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{selected.description}</p>
            <p className="text-xs text-gray-400 mb-4">Created: {formatDate(selected.createdAt)}</p>
            {selected.status === 'OPEN' && (
              <div className="flex gap-2">
                <button onClick={async () => { await updateStatus.mutateAsync({ id: selected.id, status: 'IN_PROGRESS' }); setSelected(null); }} className="flex-1 py-2 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100">Mark In Progress</button>
                <button onClick={async () => { await updateStatus.mutateAsync({ id: selected.id, status: 'RESOLVED' }); setSelected(null); }} className="flex-1 py-2 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100">Resolve</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
