'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useCommunicationThreads, useCreateThread, useSchoolSection, useCreateSchoolItem } from '../../../hooks/use-api';

const MSG_EMPTY = { to: '', subject: '', message: '', type: 'SMS', audience: 'All Parents' };
const AUDIENCE = ['All Parents','All Students','All Staff','Class 10','Class 9','Class 8','Custom'];

export default function CommunicationsPage() {
  const [tab, setTab] = useState<'inbox' | 'send' | 'logs'>('inbox');
  const [sendModal, setSendModal] = useState(false);
  const [form, setForm] = useState(MSG_EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: threads = [], isLoading: threadsLoading } = useCommunicationThreads({});
  const { data: logs = [] } = useSchoolSection('messageLogs');
  const createThread = useCreateThread();
  const createLog = useCreateSchoolItem('messageLogs');

  const threadList: any[] = Array.isArray(threads) ? threads : (threads as any)?.data ?? [];
  const logList: any[] = Array.isArray(logs) ? logs : [];

  const handleSend = async () => {
    if (!form.subject || !form.message) return;
    await createLog.mutateAsync({ ...form, sentAt: new Date().toISOString(), status: 'SENT' });
    setForm(MSG_EMPTY); setSendModal(false);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <>
      <Topbar title="Communications" subtitle="School messaging & notifications" />
      <div className="p-6">
        <PageHeader title="Communications" subtitle={`${threadList.length} conversations`}
          action={<button onClick={() => setSendModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Send Message</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Conversations', value: threadList.length, icon: '💬', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Messages Sent', value: logList.length, icon: '📤', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'SMS', value: logList.filter((l: any) => l.type === 'SMS').length, icon: '📱', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Email', value: logList.filter((l: any) => l.type === 'Email').length, icon: '📧', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['inbox','send','logs'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${tab === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
              {v === 'inbox' ? 'Inbox' : v === 'send' ? 'Sent Messages' : 'Message Logs'}
            </button>
          ))}
        </div>

        {tab === 'inbox' && (
          threadsLoading ? <div className="text-center py-12 text-gray-400">Loading...</div>
          : threadList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">💬</p><p className="font-medium">No conversations yet</p></div>
          ) : (
            <div className="space-y-2">
              {threadList.map((thread: any) => (
                <div key={thread.id} onClick={() => setSelected(thread)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">💬</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{thread.subject || 'No Subject'}</p>
                        <p className="text-xs text-gray-400">{thread.participants?.map((p: any) => p.user?.profile?.firstName || 'User').join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{formatDate(thread.lastMessageAt || thread.updatedAt)}</p>
                      {!thread.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                    </div>
                  </div>
                  {thread.lastMessage && <p className="text-xs text-gray-500 ml-12 mt-1 line-clamp-1">{thread.lastMessage}</p>}
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'send' && (
          logList.filter((l: any) => l.status === 'SENT').length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">📤</p><p className="font-medium">No sent messages yet</p></div>
          ) : (
            <div className="space-y-3">
              {logList.filter((l: any) => l.status === 'SENT').map((log: any) => (
                <div key={log.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{log.subject}</p>
                      <p className="text-xs text-gray-400">To: {log.audience} · {log.type} · {formatDate(log.sentAt)}</p>
                    </div>
                    <Badge variant="green">SENT</Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{log.message}</p>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'logs' && (
          logList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">📋</p><p className="font-medium">No message logs yet</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Audience</th><th className="px-4 py-3 text-left">Sent</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {logList.map((log: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-800">{log.subject}</td>
                      <td className="px-4 py-3 text-gray-500">{log.type}</td>
                      <td className="px-4 py-3 text-gray-500">{log.audience}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(log.sentAt)}</td>
                      <td className="px-4 py-3"><Badge variant="green">{log.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <Modal isOpen={sendModal} onClose={() => setSendModal(false)} title="Send Message">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Message Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['SMS','Email','WhatsApp','Push Notification','In-App'].map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Audience</label>
              <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {AUDIENCE.map(a => <option key={a}>{a}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Subject *</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Message subject..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Message *</label>
            <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Write your message here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            📢 This will send a {form.type} message to {form.audience}
          </div>
          <button onClick={handleSend} disabled={createLog.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createLog.isPending ? 'Sending...' : `Send ${form.type}`}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || 'Conversation'}>
        {selected && (
          <div className="p-6">
            <p className="text-sm text-gray-600">{selected.lastMessage || 'No messages yet'}</p>
            <p className="text-xs text-gray-400 mt-2">{formatDate(selected.lastMessageAt || selected.updatedAt)}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
