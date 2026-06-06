'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const PARENTS = [
  { id: 'PAR-001', name: 'Mr. Hassan Ali', children: ['Ahmed Ali (10-A)', 'Zara Ali (7-B)'], phone: '0300-1234567', email: 'hassan.ali@gmail.com', cnic: '42201-1234567-1', occupation: 'Engineer', address: 'Gulshan-e-Iqbal, Karachi', feeStatus: 'CURRENT', appInstalled: true, lastLogin: '2 hours ago', meetings: 2 },
  { id: 'PAR-002', name: 'Mrs. Fatima Khan', children: ['Sara Khan (8-A)'], phone: '0321-9876543', email: 'fatima.k@hotmail.com', cnic: '42201-9876543-0', occupation: 'Homemaker', address: 'Defence, Karachi', feeStatus: 'CURRENT', appInstalled: true, lastLogin: 'Yesterday', meetings: 1 },
  { id: 'PAR-003', name: 'Mr. Bilal Akhtar', children: ['Omar Akhtar (6-C)'], phone: '0311-5556666', email: 'bilal.akhtar@yahoo.com', cnic: '42201-5556666-3', occupation: 'Business', address: 'Clifton, Karachi', feeStatus: 'OVERDUE', appInstalled: false, lastLogin: '3 days ago', meetings: 0 },
  { id: 'PAR-004', name: 'Dr. Nadia Qureshi', children: ['Bilal Qureshi (9-B)', 'Hira Qureshi (4-A)'], phone: '0333-2223334', email: 'dr.nadia@med.pk', cnic: '42201-2223334-2', occupation: 'Doctor', address: 'PECHS, Karachi', feeStatus: 'CURRENT', appInstalled: true, lastLogin: '1 day ago', meetings: 3 },
  { id: 'PAR-005', name: 'Mr. Kamran Shah', children: ['Ibrahim Shah (12-A)'], phone: '0345-7778889', email: 'kamran.shah@gmail.com', cnic: '42201-7778889-5', occupation: 'Lawyer', address: 'North Nazimabad, Karachi', feeStatus: 'OVERDUE', appInstalled: false, lastLogin: '1 week ago', meetings: 0 },
  { id: 'PAR-006', name: 'Mrs. Rukhsana Malik', children: ['Fatima Malik (3-B)'], phone: '0312-4445556', email: 'rukhsana.m@gmail.com', cnic: '42201-4445556-8', occupation: 'Teacher', address: 'Gulberg, Karachi', feeStatus: 'CURRENT', appInstalled: true, lastLogin: '3 hours ago', meetings: 1 },
];

const MEETINGS = [
  { id: 1, parent: 'Mr. Hassan Ali', teacher: 'Mr. Ahmed Malik', child: 'Ahmed Ali', reason: 'Academic Progress', date: 'Jun 10, 2026', time: '10:00 AM', status: 'SCHEDULED' },
  { id: 2, parent: 'Mrs. Fatima Khan', teacher: 'Mrs. Sara Khan', child: 'Sara Khan', reason: 'Attendance Concern', date: 'Jun 8, 2026', time: '2:00 PM', status: 'COMPLETED' },
  { id: 3, parent: 'Dr. Nadia Qureshi', teacher: 'Dr. Fatima Shah', child: 'Bilal Qureshi', reason: 'Fee Discussion', date: 'Jun 12, 2026', time: '11:30 AM', status: 'SCHEDULED' },
];

const COMPLAINTS = [
  { id: 'CMP-001', parent: 'Mr. Hassan Ali', subject: 'Transport delay complaint', date: 'Jun 4, 2026', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  { id: 'CMP-002', parent: 'Mr. Bilal Akhtar', subject: 'Teacher behavior concern', date: 'Jun 1, 2026', priority: 'HIGH', status: 'RESOLVED' },
  { id: 'CMP-003', parent: 'Mrs. Rukhsana Malik', subject: 'Canteen food quality', date: 'Jun 3, 2026', priority: 'LOW', status: 'OPEN' },
];

const PRIORITY_COLOR: Record<string, string> = { HIGH: 'red', MEDIUM: 'yellow', LOW: 'blue' };
const STATUS_COLOR: Record<string, string> = { OPEN: 'red', IN_PROGRESS: 'yellow', RESOLVED: 'green', SCHEDULED: 'blue', COMPLETED: 'green' };

export default function ParentsPage() {
  const [view, setView] = useState<'directory' | 'meetings' | 'complaints' | 'sms'>('directory');
  const [search, setSearch] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [selectedParent, setSelectedParent] = useState<typeof PARENTS[0] | null>(null);
  const [meetingModal, setMeetingModal] = useState(false);
  const [smsModal, setSmsModal] = useState(false);

  const filtered = PARENTS.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.children.some(c => c.toLowerCase().includes(search.toLowerCase()))) &&
    (!feeFilter || p.feeStatus === feeFilter)
  );

  return (
    <>
      <Topbar title="Parents" subtitle="Parent directory, meetings & communications" />
      <div className="p-6">
        <PageHeader title="Parent Management" subtitle={`${PARENTS.length} registered parents · ${PARENTS.filter(p => p.appInstalled).length} using app`}
          action={
            <div className="flex gap-2">
              <button onClick={() => setSmsModal(true)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">📱 Bulk SMS</button>
              <button onClick={() => setMeetingModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Schedule Meeting</button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Parents', value: PARENTS.length, icon: '👨‍👩‍👧', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'App Installed', value: PARENTS.filter(p => p.appInstalled).length, icon: '📱', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Fee Overdue', value: PARENTS.filter(p => p.feeStatus === 'OVERDUE').length, icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Meetings (Jun)', value: MEETINGS.length, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['directory', 'meetings', 'complaints', 'sms'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'sms' ? 'Communications' : v}
            </button>
          ))}
        </div>

        {/* Directory */}
        {view === 'directory' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 flex gap-3 border-b border-gray-100">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by parent or child name..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={feeFilter} onChange={e => setFeeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">All Status</option><option>CURRENT</option><option>OVERDUE</option>
              </select>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Parent', 'Children', 'Phone', 'Occupation', 'Fee Status', 'App', 'Last Active', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">{p.name.split(' ').slice(-1)[0][0]}</div>
                        <div><p className="font-medium text-gray-800">{p.name}</p><p className="text-xs text-gray-400">{p.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{p.children.map(c => <p key={c} className="text-xs text-gray-600">{c}</p>)}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{p.phone}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.occupation}</td>
                    <td className="px-4 py-3"><Badge variant={p.feeStatus === 'CURRENT' ? 'green' : 'red'}>{p.feeStatus}</Badge></td>
                    <td className="px-4 py-3 text-center">{p.appInstalled ? '✅' : '❌'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedParent(p)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">View</button>
                        <button className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">📱</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Meetings */}
        {view === 'meetings' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <p className="text-sm text-gray-600">{MEETINGS.length} meetings scheduled</p>
              <button onClick={() => setMeetingModal(true)} className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg">+ Schedule</button>
            </div>
            <div className="p-4 space-y-3">
              {MEETINGS.map(m => (
                <div key={m.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{m.parent}</p>
                      <p className="text-xs text-gray-400">Regarding: {m.child} · Teacher: {m.teacher}</p>
                    </div>
                    <Badge variant={STATUS_COLOR[m.status] as any}>{m.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{m.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>📅 {m.date}</span><span>⏰ {m.time}</span>
                  </div>
                  {m.status === 'SCHEDULED' && (
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg">Mark Complete</button>
                      <button className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg">Reschedule</button>
                      <button className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complaints */}
        {view === 'complaints' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">{COMPLAINTS.length} complaints/feedback received</p>
              <div className="flex gap-2">
                <Badge variant="red">{COMPLAINTS.filter(c => c.status === 'OPEN').length} Open</Badge>
                <Badge variant="yellow">{COMPLAINTS.filter(c => c.status === 'IN_PROGRESS').length} In Progress</Badge>
                <Badge variant="green">{COMPLAINTS.filter(c => c.status === 'RESOLVED').length} Resolved</Badge>
              </div>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['ID', 'Parent', 'Subject', 'Date', 'Priority', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {COMPLAINTS.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.id}</td>
                    <td className="px-4 py-3 font-medium">{c.parent}</td>
                    <td className="px-4 py-3 text-gray-600">{c.subject}</td>
                    <td className="px-4 py-3 text-gray-400">{c.date}</td>
                    <td className="px-4 py-3"><Badge variant={PRIORITY_COLOR[c.priority] as any}>{c.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={STATUS_COLOR[c.status] as any}>{c.status.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">Respond</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Communications */}
        {view === 'sms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Send Message to Parents</h3>
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Send To</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>All Parents</option><option>Fee Defaulters Only</option><option>By Class</option><option>Without App</option>
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Channel</label>
                  <div className="flex gap-3">
                    {['SMS', 'WhatsApp', 'Email', 'In-App'].map(ch => (
                      <label key={ch} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked={ch === 'SMS'} className="rounded" />{ch}
                      </label>
                    ))}
                  </div>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Message</label>
                  <textarea rows={4} placeholder="Type your message..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">Send Now</button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Quick Templates</h3>
              {[
                'Fee payment reminder for June 2026',
                'Parent-Teacher Meeting on June 15, 2026 at 10 AM',
                'School closed tomorrow for national holiday',
                'Results published — please check the parent portal',
                'Sports Day on June 20 — students must bring sports kit',
              ].map(t => (
                <button key={t} className="w-full text-left px-3 py-2.5 border border-gray-100 rounded-lg mb-2 text-sm text-gray-600 hover:border-green-300 hover:bg-green-50">
                  📋 {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meeting Modal */}
      <Modal isOpen={meetingModal} onClose={() => setMeetingModal(false)} title="Schedule Parent Meeting">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Parent</label>
            <input type="text" placeholder="Search parent..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Teacher</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Select teacher...</option>
              <option>Mr. Ahmed Malik</option><option>Mrs. Sara Khan</option><option>Dr. Fatima Shah</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Reason / Agenda</label>
            <input type="text" placeholder="e.g. Academic progress review" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Time</label>
              <input type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">Schedule & Notify</button>
            <button onClick={() => setMeetingModal(false)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Parent Detail Modal */}
      <Modal isOpen={!!selectedParent} onClose={() => setSelectedParent(null)} title="Parent Profile">
        {selectedParent && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">{selectedParent.name.split(' ').slice(-1)[0][0]}</div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selectedParent.name}</h3>
                <p className="text-sm text-gray-500">{selectedParent.occupation} · {selectedParent.address}</p>
                <p className="text-xs text-gray-400">CNIC: {selectedParent.cnic}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Contact</p>
                <p className="font-medium">{selectedParent.phone}</p>
                <p className="text-gray-500">{selectedParent.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Children</p>
                {selectedParent.children.map(c => <p key={c} className="font-medium">{c}</p>)}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Fee Status</p>
                <Badge variant={selectedParent.feeStatus === 'CURRENT' ? 'green' : 'red'}>{selectedParent.feeStatus}</Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">App Status</p>
                <p className="font-medium">{selectedParent.appInstalled ? '✅ Installed' : '❌ Not Installed'}</p>
                <p className="text-xs text-gray-400">Last: {selectedParent.lastLogin}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg">📱 Send Message</button>
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">📅 Schedule Meeting</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
