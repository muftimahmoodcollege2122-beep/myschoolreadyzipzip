'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const INCIDENTS = [
  { id: 'INC-001', student: 'Ahmed Ali', class: '10-A', type: 'Fighting', severity: 'HIGH', date: 'Jun 5, 2026', reportedBy: 'Mr. Ahmed Malik', action: 'Warning Issued', status: 'RESOLVED', description: 'Student involved in physical altercation during lunch break', parentNotified: true },
  { id: 'INC-002', student: 'Omar Hassan', class: '8-B', type: 'Cheating', severity: 'MEDIUM', date: 'Jun 3, 2026', reportedBy: 'Mrs. Sara Khan', action: 'Zero Marks', status: 'RESOLVED', description: 'Caught copying during Math exam', parentNotified: true },
  { id: 'INC-003', student: 'Bilal Qureshi', class: '6-C', type: 'Bullying', severity: 'HIGH', date: 'Jun 1, 2026', reportedBy: 'Dr. Fatima Shah', action: 'Suspension (1 day)', status: 'PENDING', description: 'Repeatedly harassing younger student', parentNotified: false },
  { id: 'INC-004', student: 'Zara Malik', class: '11-A', type: 'Late Arrival', severity: 'LOW', date: 'May 30, 2026', reportedBy: 'Security', action: 'Verbal Warning', status: 'RESOLVED', description: '3rd consecutive late arrival this week', parentNotified: false },
  { id: 'INC-005', student: 'Ibrahim Shah', class: '9-C', type: 'Mobile Phone', severity: 'MEDIUM', date: 'May 28, 2026', reportedBy: 'Mr. Bilal Hassan', action: 'Phone Confiscated', status: 'RESOLVED', description: 'Using mobile phone during class', parentNotified: false },
];

const REWARDS = [
  { student: 'Sara Ahmed', class: '10-A', award: 'Best Student of Month', reason: 'Highest academic performance', date: 'Jun 1, 2026', by: 'Principal' },
  { student: 'Fatima Khan', class: '8-B', award: 'Perfect Attendance', reason: '100% attendance for the term', date: 'Jun 1, 2026', by: 'Admin' },
  { student: 'Bilal Shah', class: '12-A', award: 'Sports Excellence', reason: 'Won inter-school cricket tournament', date: 'May 25, 2026', by: 'Sports Coach' },
  { student: 'Nadia Qureshi', class: '6-A', award: 'Art & Creativity', reason: 'First prize in science fair', date: 'May 20, 2026', by: 'Science Teacher' },
];

const POLICIES = [
  { rule: 'Punctuality', desc: '3 late arrivals = parent notification; 5 = detention', category: 'Attendance' },
  { rule: 'Uniform', desc: 'Full uniform mandatory; 3 violations = written warning', category: 'Dress Code' },
  { rule: 'Mobile Phones', desc: 'Strictly banned during school hours; 1st offense = confiscation', category: 'Technology' },
  { rule: 'Academic Honesty', desc: 'Cheating results in zero marks + disciplinary record', category: 'Academics' },
  { rule: 'Bullying', desc: 'Zero tolerance — immediate suspension', category: 'Behavior' },
  { rule: 'Vandalism', desc: 'Responsible student to pay damage cost + suspension', category: 'Property' },
  { rule: 'Violence', desc: 'Zero tolerance — potential expulsion', category: 'Safety' },
];

const SEV_COLOR: Record<string, string> = { HIGH: 'red', MEDIUM: 'orange', LOW: 'yellow' };
const STS_COLOR: Record<string, string> = { RESOLVED: 'green', PENDING: 'yellow', ESCALATED: 'red' };

export default function ConductPage() {
  const [view, setView] = useState<'incidents' | 'rewards' | 'warnings' | 'policies'>('incidents');
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState<typeof INCIDENTS[0] | null>(null);
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('');

  const filtered = INCIDENTS.filter(i =>
    (!search || i.student.toLowerCase().includes(search.toLowerCase())) &&
    (!sevFilter || i.severity === sevFilter)
  );

  const warnings: Record<string, number> = {};
  INCIDENTS.forEach(i => {
    if (!warnings[i.student]) warnings[i.student] = 0;
    warnings[i.student]++;
  });

  return (
    <>
      <Topbar title="Conduct & Discipline" subtitle="Behavior tracking, incidents & recognition" />
      <div className="p-6">
        <PageHeader title="Student Conduct" subtitle="Discipline management & positive reinforcement"
          action={<button onClick={() => setAddModal(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-500">+ Report Incident</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Incidents', value: INCIDENTS.length, sub: 'This month', color: 'text-red-600', bg: 'bg-red-50', icon: '⚠️' },
            { label: 'Unresolved', value: INCIDENTS.filter(i => i.status === 'PENDING').length, sub: 'Needs action', color: 'text-orange-600', bg: 'bg-orange-50', icon: '⏳' },
            { label: 'Students Rewarded', value: REWARDS.length, sub: 'This month', color: 'text-green-600', bg: 'bg-green-50', icon: '🏆' },
            { label: 'Repeat Offenders', value: Object.values(warnings).filter(v => v > 1).length, sub: '2+ incidents', color: 'text-purple-600', bg: 'bg-purple-50', icon: '🔄' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['incidents', 'rewards', 'warnings', 'policies'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'warnings' ? 'Warning Log' : v === 'policies' ? 'School Policies' : v}
            </button>
          ))}
        </div>

        {/* Incidents */}
        {view === 'incidents' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 flex gap-3 border-b border-gray-100">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">All Severity</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option>
              </select>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['ID', 'Student', 'Incident Type', 'Severity', 'Date', 'Reported By', 'Action Taken', 'Status', 'Parent', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{i.id}</td>
                    <td className="px-4 py-3"><p className="font-medium">{i.student}</p><p className="text-xs text-gray-400">{i.class}</p></td>
                    <td className="px-4 py-3 text-gray-700">{i.type}</td>
                    <td className="px-4 py-3"><Badge variant={SEV_COLOR[i.severity] as any}>{i.severity}</Badge></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{i.date}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{i.reportedBy}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{i.action}</td>
                    <td className="px-4 py-3"><Badge variant={STS_COLOR[i.status] as any}>{i.status}</Badge></td>
                    <td className="px-4 py-3 text-center">{i.parentNotified ? '✅' : '❌'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setDetailModal(i)} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">View</button>
                        {!i.parentNotified && <button className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">Notify</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rewards */}
        {view === 'rewards' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Recognizing positive behavior & achievements</p>
              <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg">+ Award Recognition</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REWARDS.map(r => (
                <div key={r.student} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 border-l-yellow-400">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🏆</span>
                    <div><p className="font-bold text-gray-800">{r.student}</p><p className="text-xs text-gray-400">{r.class}</p></div>
                  </div>
                  <p className="font-medium text-sm text-yellow-700 mb-1">{r.award}</p>
                  <p className="text-xs text-gray-500 mb-2">{r.reason}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>By {r.by}</span><span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Log */}
        {view === 'warnings' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Warning Count by Student</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Total Incidents</th>
                <th className="px-4 py-3 text-left">Latest</th>
                <th className="px-4 py-3 text-left">Risk Level</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody>
                {Object.entries(warnings).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
                  const inc = INCIDENTS.find(i => i.student === name)!;
                  return (
                    <tr key={name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{name}<p className="text-xs text-gray-400">{inc?.class}</p></td>
                      <td className="px-4 py-3 font-bold">{count}</td>
                      <td className="px-4 py-3 text-gray-500">{inc?.date}</td>
                      <td className="px-4 py-3"><Badge variant={count >= 3 ? 'red' : count >= 2 ? 'orange' : 'yellow'}>{count >= 3 ? 'HIGH' : count >= 2 ? 'MEDIUM' : 'LOW'}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">History</button>
                          <button className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">Escalate</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Policies */}
        {view === 'policies' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">School Conduct Policies</h3>
              <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg">+ Add Rule</button>
            </div>
            <div className="space-y-3">
              {POLICIES.map(p => (
                <div key={p.rule} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p.category}</span>
                        <p className="font-bold text-sm text-gray-800">{p.rule}</p>
                      </div>
                      <p className="text-sm text-gray-600">{p.desc}</p>
                    </div>
                    <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded ml-4">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Incident Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Report Disciplinary Incident">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Student</label>
              <input type="text" placeholder="Search student..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Incident Type</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>Fighting</option><option>Cheating</option><option>Bullying</option><option>Late Arrival</option>
                <option>Mobile Phone</option><option>Uniform Violation</option><option>Vandalism</option><option>Other</option>
              </select>
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Severity</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Describe the incident..." />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Action Taken</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Verbal Warning</option><option>Written Warning</option><option>Parent Notification</option>
              <option>Detention</option><option>Suspension</option><option>Zero Marks</option><option>Phone Confiscated</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" />Notify parent immediately</label>
          <button className="w-full py-2 bg-red-600 text-white text-sm rounded-lg">Submit Report</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Incident Details">
        {detailModal && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={SEV_COLOR[detailModal.severity] as any}>{detailModal.severity}</Badge>
                <Badge variant={STS_COLOR[detailModal.status] as any}>{detailModal.status}</Badge>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{detailModal.type}</h3>
              <p className="text-sm text-gray-600">{detailModal.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[['Student', `${detailModal.student} (${detailModal.class})`], ['Date', detailModal.date], ['Reported By', detailModal.reportedBy], ['Action Taken', detailModal.action]].map(([k, v]) => (
                <div key={String(k)} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{k}</p>
                  <p className="font-medium text-gray-800">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {!detailModal.parentNotified && <button className="flex-1 py-2 bg-orange-600 text-white text-sm rounded-lg">Notify Parent</button>}
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">Update Status</button>
              <button className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg">Escalate</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
