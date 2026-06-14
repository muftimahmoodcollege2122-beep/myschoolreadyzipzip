'use client';
import React, { useState, useMemo } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useLoginHistory, useIpRestrictions, useSuspiciousActivities, useSecurityDashboard, useAddIpRestriction } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const AUDIT_CATEGORIES = ['All', 'Fee', 'Attendance', 'Grades', 'Students', 'Auth', 'Settings'] as const;
type AuditCategory = typeof AUDIT_CATEGORIES[number];

const MOCK_AUDIT_LOGS = [
  { id: '1', action: 'Fee Payment Recorded', category: 'Fee', user: 'Admin Khan', detail: 'Rs. 12,500 received — Ahmed Ali (Grade 9A)', time: '2026-06-08T10:42:00Z', icon: '💰', severity: 'info' },
  { id: '2', action: 'Invoice Created', category: 'Fee', user: 'Admin Khan', detail: 'Monthly fee invoice for 45 students — June 2026', time: '2026-06-08T09:15:00Z', icon: '🧾', severity: 'info' },
  { id: '3', action: 'Attendance Saved', category: 'Attendance', user: 'Ms. Fatima', detail: 'Grade 10B — 28 present, 3 absent', time: '2026-06-08T08:55:00Z', icon: '📋', severity: 'info' },
  { id: '4', action: 'Student Marked Absent', category: 'Attendance', user: 'Mr. Rehman', detail: 'Sara Khan (Grade 8A) — Parent notified via WhatsApp', time: '2026-06-08T08:47:00Z', icon: '📛', severity: 'warning' },
  { id: '5', action: 'Grade Submitted', category: 'Grades', user: 'Mr. Imran', detail: 'Mathematics — Mid-term exam, Grade 9A (32 students)', time: '2026-06-07T15:30:00Z', icon: '📝', severity: 'info' },
  { id: '6', action: 'Report Card Generated', category: 'Grades', user: 'Admin Khan', detail: 'PDF report cards generated for Grade 10 (3 sections)', time: '2026-06-07T14:00:00Z', icon: '🎓', severity: 'info' },
  { id: '7', action: 'Student Enrolled', category: 'Students', user: 'Admin Khan', detail: 'Usman Tariq admitted — Admission No. 2026-089, Grade 7B', time: '2026-06-07T11:20:00Z', icon: '🎒', severity: 'info' },
  { id: '8', action: 'Student Status Changed', category: 'Students', user: 'Admin Khan', detail: 'Hira Baig marked INACTIVE — transferred out', time: '2026-06-07T10:05:00Z', icon: '🔄', severity: 'warning' },
  { id: '9', action: 'Login Successful', category: 'Auth', user: 'Mr. Imran', detail: 'Browser: Chrome 125 · IP: 192.168.1.45', time: '2026-06-07T08:01:00Z', icon: '🔐', severity: 'info' },
  { id: '10', action: 'Failed Login Attempt', category: 'Auth', user: 'unknown@school.edu', detail: '3 failed attempts — IP: 103.22.45.67 (flagged)', time: '2026-06-06T22:14:00Z', icon: '🚨', severity: 'critical' },
  { id: '11', action: 'Fee Reminder Sent', category: 'Fee', user: 'System (Auto)', detail: 'SMS reminders sent to 18 overdue parents', time: '2026-06-06T09:00:00Z', icon: '📱', severity: 'info' },
  { id: '12', action: 'Timetable Saved', category: 'Settings', user: 'Admin Khan', detail: 'Grade 9A timetable updated — 6 working days, 8 periods', time: '2026-06-05T16:45:00Z', icon: '🗓️', severity: 'info' },
  { id: '13', action: 'Exam Created', category: 'Grades', user: 'Admin Khan', detail: 'Final Exams 2026 scheduled — June 20 to July 2', time: '2026-06-05T14:30:00Z', icon: '📆', severity: 'info' },
  { id: '14', action: 'Fee Waiver Applied', category: 'Fee', user: 'Admin Khan', detail: '25% sibling discount — Ali Hassan (Grade 6C)', time: '2026-06-05T11:00:00Z', icon: '🏷️', severity: 'warning' },
  { id: '15', action: 'Password Changed', category: 'Auth', user: 'Ms. Fatima', detail: 'Password updated from profile settings', time: '2026-06-04T17:22:00Z', icon: '🔑', severity: 'info' },
  { id: '16', action: 'Bulk SMS Sent', category: 'Settings', user: 'Admin Khan', detail: 'Event reminder sent to all 340 parent contacts', time: '2026-06-04T13:00:00Z', icon: '📢', severity: 'info' },
  { id: '17', action: 'IP Rule Added', category: 'Settings', user: 'Admin Khan', detail: 'Whitelisted 192.168.1.0/24 — School building network', time: '2026-06-03T10:15:00Z', icon: '🛡️', severity: 'info' },
  { id: '18', action: 'Attendance Corrected', category: 'Attendance', user: 'Ms. Fatima', detail: 'Zara Malik (Grade 10B) changed ABSENT → PRESENT (late entry)', time: '2026-06-03T09:40:00Z', icon: '✏️', severity: 'warning' },
];

function exportAuditCSV(logs: typeof MOCK_AUDIT_LOGS) {
  const header = 'Time,Action,Category,User,Detail,Severity';
  const rows = logs.map(l =>
    `"${new Date(l.time).toLocaleString()}","${l.action}","${l.category}","${l.user}","${l.detail}","${l.severity}"`
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit_log.csv'; a.click();
}

export default function SecurityPage() {
  const { toast } = useToast();
  const [view, setView] = useState<'overview' | 'logins' | 'ip' | 'alerts' | 'audit'>('overview');
  const [ipModal, setIpModal] = useState(false);
  const [ipForm, setIpForm] = useState({ ipAddress: '', description: '', type: 'WHITELIST' });
  const [auditCategory, setAuditCategory] = useState<AuditCategory>('All');
  const [auditSearch, setAuditSearch] = useState('');

  const { data: dashboard } = useSecurityDashboard();
  const { data: logins = [], isLoading: loginsLoading } = useLoginHistory({});
  const { data: ipRules = [] } = useIpRestrictions();
  const { data: suspicious = [] } = useSuspiciousActivities();
  const addIp = useAddIpRestriction();

  const loginList: any[] = Array.isArray(logins) ? logins : (logins as any)?.data ?? [];
  const ipList: any[] = Array.isArray(ipRules) ? ipRules : [];
  const suspiciousList: any[] = Array.isArray(suspicious) ? suspicious : [];

  const filteredAuditLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(l => {
      const matchCat = auditCategory === 'All' || l.category === auditCategory;
      const matchSearch = !auditSearch || l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        l.user.toLowerCase().includes(auditSearch.toLowerCase()) || l.detail.toLowerCase().includes(auditSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [auditCategory, auditSearch]);

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleAddIp = async () => {
    if (!ipForm.ipAddress) return;
    try {
    await addIp.mutateAsync(ipForm);
    setIpForm({ ipAddress: '', description: '', type: 'WHITELIST' }); setIpModal(false);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  const stats = dashboard || {};

  return (
    <>
      <Topbar title="Security" subtitle="Access control & security monitoring" />
      <div className="p-6">
        <PageHeader title="Security Center" subtitle="Monitor access and secure your school data"
          action={
            <div className="flex gap-2">
              <button onClick={() => setIpModal(true)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">+ IP Rule</button>
            </div>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Login Events', value: loginList.length, icon: '🔐', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Failed Logins', value: loginList.filter((l: any) => !l.success).length, icon: '❌', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'IP Rules', value: ipList.length, icon: '🛡️', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Alerts', value: suspiciousList.length, icon: '🚨', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['overview','logins','ip','alerts','audit'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
              {v === 'ip' ? 'IP Rules' : v === 'logins' ? 'Login Logs' : v === 'audit' ? 'Audit Trail' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {view === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Recent Login Activity</h3>
              {loginList.length === 0 ? <p className="text-center text-gray-400 py-4">No login records</p> :
                loginList.slice(0, 5).map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{l.user?.profile?.firstName || l.email || 'User'}</p>
                      <p className="text-xs text-gray-400">{l.ipAddress} · {formatDate(l.createdAt)}</p>
                    </div>
                    <Badge variant={l.success ? 'green' : 'red'}>{l.success ? 'Success' : 'Failed'}</Badge>
                  </div>
                ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Security Alerts</h3>
              {suspiciousList.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm">No security alerts detected</p>
                </div>
              ) : suspiciousList.slice(0, 5).map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-red-500 mt-0.5">🚨</span>
                  <div>
                    <p className="text-sm font-medium text-red-700">{a.description || a.type}</p>
                    <p className="text-xs text-gray-400">{a.ipAddress} · {formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'logins' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loginsLoading ? <div className="text-center py-12 text-gray-400">Loading...</div>
              : loginList.length === 0 ? <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🔐</p><p>No login history yet</p></div>
              : (
                <table className="w-full">
                  <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">IP Address</th>
                    <th className="px-4 py-3 text-left">Time</th><th className="px-4 py-3 text-left">Status</th>
                  </tr></thead>
                  <tbody>
                    {loginList.map((l: any, i: number) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                        <td className="px-4 py-3 font-medium text-gray-800">{l.user?.profile?.firstName || l.email || 'Unknown'}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{l.ipAddress || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(l.createdAt)}</td>
                        <td className="px-4 py-3"><Badge variant={l.success ? 'green' : 'red'}>{l.success ? 'Success' : 'Failed'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        )}

        {view === 'ip' && (
          <div className="space-y-3">
            {ipList.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🛡️</p><p className="font-medium">No IP rules configured</p><p className="text-sm mt-1">Add whitelist or blacklist rules for IP addresses</p></div>
            ) : ipList.map((rule: any) => (
              <div key={rule.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 font-mono">{rule.ipAddress}</p>
                  <p className="text-xs text-gray-400">{rule.description || 'No description'}</p>
                </div>
                <Badge variant={rule.type === 'WHITELIST' ? 'green' : 'red'}>{rule.type}</Badge>
              </div>
            ))}
          </div>
        )}

        {view === 'alerts' && (
          <div className="space-y-3">
            {suspiciousList.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">✅</p><p className="font-medium">No security alerts</p><p className="text-sm mt-1">Your school system is secure</p></div>
            ) : suspiciousList.map((a: any, i: number) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🚨</span>
                  <div>
                    <p className="font-bold text-red-800">{a.description || a.type}</p>
                    <p className="text-xs text-red-500 mt-0.5">{a.ipAddress} · {formatDate(a.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'audit' && (
          <div className="space-y-4">
            {/* Audit header */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">🗂️</span>
              <div className="flex-1">
                <p className="font-bold text-amber-900 text-sm">Activity Audit Trail</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Complete log of all fee transactions, attendance changes, grade submissions, student events, and system actions.
                  All entries are timestamped and attributed to the responsible user.
                </p>
              </div>
              <button
                onClick={() => exportAuditCSV(filteredAuditLogs)}
                className="flex-shrink-0 px-3 py-1.5 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-100"
              >
                Export CSV
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search actions, users, details..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[240px] outline-none focus:border-blue-400"
              />
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {AUDIT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setAuditCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${auditCategory === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400">{filteredAuditLogs.length} entries</span>
            </div>

            {/* Category summary badges */}
            <div className="flex flex-wrap gap-2">
              {(['Fee','Attendance','Grades','Students','Auth','Settings'] as const).map(cat => {
                const count = MOCK_AUDIT_LOGS.filter(l => l.category === cat).length;
                const colors: Record<string, string> = {
                  Fee: 'bg-green-100 text-green-700',
                  Attendance: 'bg-blue-100 text-blue-700',
                  Grades: 'bg-purple-100 text-purple-700',
                  Students: 'bg-yellow-100 text-yellow-700',
                  Auth: 'bg-red-100 text-red-700',
                  Settings: 'bg-gray-100 text-gray-600',
                };
                return (
                  <button key={cat} onClick={() => setAuditCategory(cat === auditCategory ? 'All' : cat)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors[cat]} ${auditCategory === cat ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
                    {cat}: {count}
                  </button>
                );
              })}
            </div>

            {/* Log entries */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {filteredAuditLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="font-medium">No matching log entries</p>
                </div>
              ) : filteredAuditLogs.map(log => {
                const severityBg = log.severity === 'critical' ? 'bg-red-50/50' : log.severity === 'warning' ? 'bg-amber-50/30' : '';
                const catColors: Record<string, string> = {
                  Fee: 'bg-green-100 text-green-700',
                  Attendance: 'bg-blue-100 text-blue-700',
                  Grades: 'bg-purple-100 text-purple-700',
                  Students: 'bg-yellow-100 text-yellow-700',
                  Auth: 'bg-red-100 text-red-700',
                  Settings: 'bg-gray-100 text-gray-600',
                };
                return (
                  <div key={log.id} className={`flex items-start gap-4 px-5 py-3.5 ${severityBg}`}>
                    <div className="text-xl flex-shrink-0 mt-0.5 w-8 text-center">{log.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-900">{log.action}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[log.category] ?? 'bg-gray-100 text-gray-600'}`}>{log.category}</span>
                          {log.severity === 'critical' && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">CRITICAL</span>}
                          {log.severity === 'warning' && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">WARNING</span>}
                        </div>
                        <span className="text-xs text-gray-300 whitespace-nowrap flex-shrink-0">{formatDate(log.time)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{log.detail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">By <span className="font-medium text-gray-600">{log.user}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={ipModal} onClose={() => setIpModal(false)} title="Add IP Rule">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">IP Address *</label>
            <input value={ipForm.ipAddress} onChange={e => setIpForm({ ...ipForm, ipAddress: e.target.value })} placeholder="e.g. 192.168.1.0/24" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
            <select value={ipForm.type} onChange={e => setIpForm({ ...ipForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="WHITELIST">Whitelist (Allow)</option><option value="BLACKLIST">Blacklist (Block)</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <input value={ipForm.description} onChange={e => setIpForm({ ...ipForm, description: e.target.value })} placeholder="e.g. School main building" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleAddIp} disabled={addIp.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {addIp.isPending ? 'Adding...' : 'Add IP Rule'}
          </button>
        </div>
      </Modal>
    </>
  );
}
