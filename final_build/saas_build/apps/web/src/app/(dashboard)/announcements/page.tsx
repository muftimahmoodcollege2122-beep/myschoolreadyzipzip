'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const ANNOUNCEMENTS = [
  { id: 'ANN-001', title: 'Mid-Term Examination Results Announced', body: 'Dear Students & Parents, We are pleased to announce that the mid-term examination results have been published on the student portal. Students can view their detailed results, grade breakdown, and class rankings. For any queries, contact your class teacher.', category: 'Academic', priority: 'HIGH', date: 'Jun 6, 2026', author: 'Principal', pinned: true, views: 456 },
  { id: 'ANN-002', title: 'Sports Day 2026 — Registration Open', body: 'The Annual Sports Day is scheduled for June 25, 2026 at the school grounds. All students are encouraged to participate. Registration forms are available at the sports office. Events include cricket, football, athletics, and many more.', category: 'Sports', priority: 'MEDIUM', date: 'Jun 5, 2026', author: 'Sports Dept', pinned: false, views: 312 },
  { id: 'ANN-003', title: 'School Closed on June 16 — Eid ul-Adha', body: 'This is to inform all students, parents, and staff that the school will remain closed on Monday, June 16, 2026 on account of Eid ul-Adha. Classes will resume on Tuesday, June 17, 2026. Eid Mubarak to all!', category: 'Holiday', priority: 'HIGH', date: 'Jun 4, 2026', author: 'Admin', pinned: true, views: 589 },
  { id: 'ANN-004', title: 'New Library Hours Effective from June 10', body: 'The school library will operate under new hours starting June 10, 2026: Monday-Friday 8:00 AM - 5:00 PM, Saturday 9:00 AM - 1:00 PM. Book borrowing limit increased to 3 books per student per week.', category: 'General', priority: 'LOW', date: 'Jun 3, 2026', author: 'Librarian', pinned: false, views: 178 },
  { id: 'ANN-005', title: 'Canteen Menu Updated for June 2026', body: 'The school canteen has introduced healthy new menu items including fresh fruit salads, wholesome meals, and sugar-free beverages. Prices remain unchanged. Student feedback is welcome.', category: 'General', priority: 'LOW', date: 'Jun 2, 2026', author: 'Canteen Manager', pinned: false, views: 245 },
  { id: 'ANN-006', title: 'Science Fair 2026 — Call for Projects', body: 'The Annual Science Fair 2026 is accepting project entries until June 30. Projects will be judged on creativity, scientific method, and presentation. Winners will represent the school at the district level.', category: 'Academic', priority: 'MEDIUM', date: 'Jun 1, 2026', author: 'Science Dept', pinned: false, views: 334 },
];

const PRIORITY_COLOR: Record<string, string> = { HIGH: 'red', MEDIUM: 'yellow', LOW: 'green' };
const CAT_ICON: Record<string, string> = { Academic: '📚', Sports: '⚽', Holiday: '🎉', General: '📢', Event: '🎖️', Health: '🏥' };

export default function AnnouncementsPage() {
  const [view, setView] = useState<'board' | 'create' | 'manage'>('board');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selectedAnn, setSelectedAnn] = useState<typeof ANNOUNCEMENTS[0] | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'General', priority: 'MEDIUM', pinned: false });

  const filtered = ANNOUNCEMENTS.filter(a =>
    (!search || a.title.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || a.category === catFilter)
  );

  const pinned = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);

  return (
    <>
      <Topbar title="Announcements" subtitle="School-wide announcements & notice board" />
      <div className="p-6">
        <PageHeader title="Announcement Board" subtitle={`${ANNOUNCEMENTS.length} announcements · ${ANNOUNCEMENTS.filter(a => a.pinned).length} pinned`}
          action={<button onClick={() => setCreateModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Post Announcement</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Announcements', value: ANNOUNCEMENTS.length, icon: '📢', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'High Priority', value: ANNOUNCEMENTS.filter(a => a.priority === 'HIGH').length, icon: '🔴', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Views', value: ANNOUNCEMENTS.reduce((a, ann) => a + ann.views, 0), icon: '👁️', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Pinned', value: ANNOUNCEMENTS.filter(a => a.pinned).length, icon: '📌', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['', 'Academic', 'Sports', 'Holiday', 'General'].map(cat => (
              <button key={cat || 'all'} onClick={() => setCatFilter(cat)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${catFilter === cat ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Announcements */}
        {pinned.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">📌 Pinned</p>
            <div className="space-y-3">
              {pinned.map(ann => (
                <div key={ann.id} onClick={() => setSelectedAnn(ann)}
                  className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{CAT_ICON[ann.category] || '📢'}</span>
                      <div>
                        <p className="font-bold text-gray-900">{ann.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">By {ann.author} · {ann.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={PRIORITY_COLOR[ann.priority] as any}>{ann.priority}</Badge>
                      <span className="text-xs text-gray-400">👁️ {ann.views}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 ml-8">{ann.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Announcements</p>
          <div className="space-y-3">
            {regular.map(ann => (
              <div key={ann.id} onClick={() => setSelectedAnn(ann)}
                className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{CAT_ICON[ann.category] || '📢'}</span>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{ann.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">By {ann.author} · {ann.date} · {ann.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={PRIORITY_COLOR[ann.priority] as any}>{ann.priority}</Badge>
                    <span className="text-xs text-gray-400">👁️ {ann.views}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 ml-8">{ann.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Announcement Modal */}
      <Modal isOpen={!!selectedAnn} onClose={() => setSelectedAnn(null)} title={selectedAnn?.title || ''}>
        {selectedAnn && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={PRIORITY_COLOR[selectedAnn.priority] as any}>{selectedAnn.priority} PRIORITY</Badge>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{selectedAnn.category}</span>
              {selectedAnn.pinned && <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">📌 Pinned</span>}
            </div>
            <div className="prose max-w-none mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedAnn.body}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p>Posted by: {selectedAnn.author}</p>
              <p>Date: {selectedAnn.date}</p>
              <p>Views: {selectedAnn.views}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Edit</button>
              <button className="flex-1 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100">Delete</button>
              <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">{selectedAnn.pinned ? 'Unpin' : 'Pin'}</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Post Announcement">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Body</label>
            <textarea rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Announcement details..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>General</option><option>Academic</option><option>Sports</option><option>Holiday</option><option>Event</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} />
            📌 Pin this announcement (shows at top)
          </label>
          <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">Post Announcement</button>
        </div>
      </Modal>
    </>
  );
}
