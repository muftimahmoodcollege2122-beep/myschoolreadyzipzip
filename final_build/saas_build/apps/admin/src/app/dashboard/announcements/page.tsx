'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const CAT_ICON: Record<string, string> = { Academic: '📚', Sports: '⚽', Holiday: '🎉', General: '📢', Event: '🎖️', Health: '🏥' };

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedAnn, setSelectedAnn] = useState<any>(null);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'General', isPinned: false });

  const { data, isLoading } = useAnnouncements(1);
  const createAnn = useCreateAnnouncement();
  const deleteAnn = useDeleteAnnouncement();

  const announcements: any[] = data?.data ?? [];
  const filtered = announcements.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter(a => a.isPinned);
  const regular = filtered.filter(a => !a.isPinned);

  const handleCreate = async () => {
    if (!form.title || !form.body) return;
    try {
    await createAnn.mutateAsync({ title: form.title, body: form.body, isPinned: form.isPinned });
    setForm({ title: '', body: '', category: 'General', isPinned: false });
    setCreateModal(false);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <Topbar title="Announcements" subtitle="School-wide announcements & notice board" />
      <div className="p-6">
        <PageHeader title="Announcement Board" subtitle={`${announcements.length} announcements · ${pinned.length} pinned`}
          action={<button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Post Announcement</button>}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: announcements.length, icon: '📢', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pinned', value: pinned.length, icon: '📌', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'This Week', value: announcements.filter(a => new Date(a.createdAt) > new Date(Date.now() - 7*864e5)).length, icon: '🗓️', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Active', value: announcements.filter(a => !a.expiresAt || new Date(a.expiresAt) > new Date()).length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading announcements...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📢</p>
            <p className="font-medium">No announcements yet</p>
            <p className="text-sm">Post the first announcement for your school</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📌 Pinned</p>
                <div className="space-y-3">
                  {pinned.map((ann: any) => (
                    <div key={ann.id} onClick={() => setSelectedAnn(ann)} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <span className="text-xl mt-0.5">📌</span>
                          <div>
                            <p className="font-bold text-gray-900">{ann.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(ann.createdAt)}</p>
                          </div>
                        </div>
                        {ann.expiresAt && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">Expires {formatDate(ann.expiresAt)}</span>}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 ml-8">{ann.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Announcements</p>
              <div className="space-y-3">
                {regular.map((ann: any) => (
                  <div key={ann.id} onClick={() => setSelectedAnn(ann)} className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">📢</span>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{ann.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(ann.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 ml-8">{ann.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={!!selectedAnn} onClose={() => setSelectedAnn(null)} title={selectedAnn?.title || ''}>
        {selectedAnn && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {selectedAnn.isPinned && <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">📌 Pinned</span>}
              <span className="text-xs text-gray-400">{formatDate(selectedAnn.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedAnn.body}</p>
            {selectedAnn.targetRoles?.length > 0 && (
              <p className="text-xs text-gray-400 mb-4">Audience: {selectedAnn.targetRoles.join(', ')}</p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={async () => { try { await deleteAnn.mutateAsync(selectedAnn.id); toast('Announcement deleted', 'success'); } catch(e: any) { toast(e?.message || 'Operation failed', 'error'); } setSelectedAnn(null); }}
                className="flex-1 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100">Delete</button>
              <button onClick={() => setSelectedAnn(null)} className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">Close</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Post Announcement">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Body *</label>
            <textarea rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Announcement details..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} />
            📌 Pin this announcement (shows at top)
          </label>
          <button onClick={handleCreate} disabled={createAnn.isPending}
            className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createAnn.isPending ? 'Posting...' : 'Post Announcement'}
          </button>
        </div>
      </Modal>
    </>
  );
}
