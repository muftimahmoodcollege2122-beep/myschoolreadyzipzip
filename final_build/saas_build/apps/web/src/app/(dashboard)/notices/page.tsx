'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const NOTICES = [
  { id: 'NTC-001', title: 'Parent-Teacher Meeting — June 20, 2026', category: 'General', audience: 'Parents', date: 'Jun 6, 2026', sentBy: 'Admin', status: 'SENT', channel: ['SMS', 'Email', 'App'], reads: 234, total: 660 },
  { id: 'NTC-002', title: 'School Closed on June 16 (Eid ul-Adha)', category: 'Holiday', audience: 'All', date: 'Jun 5, 2026', sentBy: 'Principal', status: 'SENT', channel: ['SMS', 'WhatsApp', 'App'], reads: 580, total: 680 },
  { id: 'NTC-003', title: 'Fee Payment Reminder — June Due Date: June 15', category: 'Fee', audience: 'Parents', date: 'Jun 3, 2026', sentBy: 'Accountant', status: 'SENT', channel: ['SMS', 'Email'], reads: 412, total: 660 },
  { id: 'NTC-004', title: 'Annual Sports Day Registration Open', category: 'Event', audience: 'Students', date: 'Jun 2, 2026', sentBy: 'Sports Dept', status: 'SENT', channel: ['App'], reads: 198, total: 660 },
  { id: 'NTC-005', title: 'Staff Training Day — All Staff Report at 8 AM', category: 'Staff', audience: 'Staff', date: 'Jun 1, 2026', sentBy: 'Admin', status: 'SENT', channel: ['Email', 'App'], reads: 48, total: 52 },
  { id: 'NTC-006', title: 'Examination Schedule Released for Mid-Terms', category: 'Academic', audience: 'All', date: 'May 30, 2026', sentBy: 'Admin', status: 'SENT', channel: ['App', 'Website'], reads: 520, total: 680 },
  { id: 'NTC-007', title: 'Science Fair 2026 — Entries Due by June 30', category: 'Event', audience: 'Students', date: 'Jun 4, 2026', sentBy: 'Science Dept', status: 'SCHEDULED', channel: ['App'], reads: 0, total: 660 },
  { id: 'NTC-008', title: 'Library Closure for Renovation — Jun 10-12', category: 'General', audience: 'All', date: 'Jun 7, 2026', sentBy: 'Librarian', status: 'DRAFT', channel: ['App'], reads: 0, total: 680 },
];

const TEMPLATES = [
  { name: 'Fee Reminder', icon: '💰', text: 'Dear Parent, This is a reminder that the fee for {month} is due by {date}. Total amount: Rs {amount}. Please pay to avoid penalty. — MySchool Admin' },
  { name: 'Holiday Notice', icon: '🎉', text: 'Dear Parents/Students, School will remain closed on {date} on account of {reason}. Classes will resume on {resume_date}. — Principal' },
  { name: 'PTM Notice', icon: '📅', text: 'Dear Parent, You are cordially invited to the Parent-Teacher Meeting on {date} at {time} in {venue}. Your presence is important. — Admin' },
  { name: 'Exam Notice', icon: '📝', text: 'Dear Students, Examination schedule for {term} has been published. Date sheet available in student portal. — Examination Dept' },
  { name: 'Event Notice', icon: '🎖️', text: 'Dear All, {event_name} is scheduled on {date} at {venue}. {instructions}. — School Management' },
  { name: 'Emergency Notice', icon: '🚨', text: 'URGENT: School is closed today due to {reason}. Stay safe. Further updates on the school app. — Principal' },
];

const STATUS_COLOR: Record<string, string> = { SENT: 'green', SCHEDULED: 'blue', DRAFT: 'yellow' };

export default function NoticesPage() {
  const [view, setView] = useState<'all' | 'compose' | 'templates' | 'analytics'>('all');
  const [composeModal, setComposeModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ title: '', body: '', audience: 'All', category: 'General', channels: ['App'] });

  const filtered = NOTICES.filter(n => !filter || n.category === filter || n.status === filter);
  const totalSent = NOTICES.filter(n => n.status === 'SENT').length;
  const avgReadRate = Math.round(NOTICES.filter(n => n.status === 'SENT').reduce((a, n) => a + (n.reads / n.total), 0) / totalSent * 100);

  return (
    <>
      <Topbar title="Notices & Circulars" subtitle="School-wide communication & announcements" />
      <div className="p-6">
        <PageHeader title="Notices & Circulars" subtitle={`${NOTICES.length} notices this month · ${avgReadRate}% avg read rate`}
          action={
            <div className="flex gap-2">
              <button onClick={() => setView('templates')} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">📋 Templates</button>
              <button onClick={() => setComposeModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Compose Notice</button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Sent This Month', value: NOTICES.filter(n => n.status === 'SENT').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Scheduled', value: NOTICES.filter(n => n.status === 'SCHEDULED').length, icon: '⏰', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Drafts', value: NOTICES.filter(n => n.status === 'DRAFT').length, icon: '📝', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Avg Read Rate', value: `${avgReadRate}%`, icon: '👀', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {(['all', 'compose', 'templates', 'analytics'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'all' ? 'All Notices' : v === 'compose' ? 'Compose' : v === 'templates' ? 'Templates' : 'Analytics'}
            </button>
          ))}
        </div>

        {/* All Notices */}
        {view === 'all' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 flex gap-3 border-b border-gray-100">
              <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">All Categories</option>
                <option>General</option><option>Holiday</option><option>Fee</option><option>Event</option><option>Academic</option><option>Staff</option>
              </select>
              <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">All Status</option>
                <option>SENT</option><option>SCHEDULED</option><option>DRAFT</option>
              </select>
              <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⬇ Export</button>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(n => (
                <div key={n.id} className="p-4 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{n.category === 'Holiday' ? '🎉' : n.category === 'Fee' ? '💰' : n.category === 'Event' ? '🎖️' : n.category === 'Academic' ? '📝' : n.category === 'Staff' ? '👥' : '📢'}</span>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{n.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">To: {n.audience}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">By {n.sentBy}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{n.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_COLOR[n.status] as any}>{n.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-8">
                    {n.channel.map(ch => <span key={ch} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{ch}</span>)}
                    {n.status === 'SENT' && (
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(n.reads / n.total) * 100}%` }} /></div>
                        <span className="text-xs text-gray-500">{n.reads}/{n.total} read</span>
                      </div>
                    )}
                    {n.status === 'DRAFT' && (
                      <div className="ml-auto flex gap-1">
                        <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">Send Now</button>
                        <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Schedule</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compose */}
        {view === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Compose Notice</h3>
              <div className="space-y-4">
                <div><label className="text-xs text-gray-500 mb-1 block">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notice title..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Message Body</label>
                  <textarea rows={6} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Write your notice here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">Send To</label>
                    <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option>All</option><option>Parents</option><option>Students</option><option>Teachers</option><option>Staff</option>
                    </select>
                  </div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                      <option>General</option><option>Holiday</option><option>Fee</option><option>Event</option><option>Academic</option>
                    </select>
                  </div>
                </div>
                <div><label className="text-xs text-gray-500 mb-2 block">Channels</label>
                  <div className="flex gap-3 flex-wrap">
                    {['SMS', 'WhatsApp', 'Email', 'In-App', 'Website'].map(ch => (
                      <label key={ch} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked={['In-App'].includes(ch)} />{ch}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">Send Now</button>
                  <button className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Schedule</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">Save Draft</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Quick Templates</h3>
              <div className="space-y-2">
                {TEMPLATES.map(t => (
                  <button key={t.name} onClick={() => { setForm({ ...form, title: t.name, body: t.text }); }}
                    className="w-full text-left px-3 py-3 border border-gray-100 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{t.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{t.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-7 truncate">{t.text.slice(0, 60)}...</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Templates */}
        {view === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map(t => (
              <div key={t.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-green-300 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{t.icon}</span>
                  <p className="font-bold text-gray-800">{t.name}</p>
                </div>
                <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg p-3">{t.text}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setForm({ ...form, title: t.name, body: t.text }); setView('compose'); }} className="flex-1 py-1.5 bg-green-50 text-green-600 text-xs rounded-lg hover:bg-green-100">Use Template</button>
                  <button className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg hover:bg-gray-50">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics */}
        {view === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Read Rates by Notice</h3>
              {NOTICES.filter(n => n.status === 'SENT').map(n => (
                <div key={n.id} className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-600 truncate flex-1">{n.title}</span><span className="font-bold text-gray-700 ml-2">{Math.round((n.reads / n.total) * 100)}%</span></div>
                  <div className="bg-gray-100 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(n.reads / n.total) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Channel Performance</h3>
              {[
                { channel: 'SMS', sent: 1240, delivered: 1198, read: 980, readPct: 79 },
                { channel: 'WhatsApp', sent: 680, delivered: 672, read: 598, readPct: 88 },
                { channel: 'Email', sent: 680, delivered: 645, read: 412, readPct: 61 },
                { channel: 'In-App', sent: 2040, delivered: 2040, read: 1456, readPct: 71 },
              ].map(c => (
                <div key={c.channel} className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium text-gray-700">{c.channel}</span><span className="text-green-600 font-bold">{c.readPct}% read rate</span></div>
                  <div className="bg-gray-100 h-2.5 rounded-full"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${c.readPct}%` }} /></div>
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>Sent: {c.sent}</span><span>Read: {c.read}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
