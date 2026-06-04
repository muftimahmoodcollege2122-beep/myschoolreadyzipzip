'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';

const AUDIT_LOGS = [
  { user:'admin@demo.edu', action:'Student record updated', resource:'Student #ADM-2024-001', ip:'192.168.1.10', time:'Jun 3, 2026 10:32 AM', level:'INFO', status:'SUCCESS' },
  { user:'sarah.j@demo.edu', action:'Fee payment recorded', resource:'Invoice #INV-0892', ip:'192.168.1.25', time:'Jun 3, 2026 09:48 AM', level:'INFO', status:'SUCCESS' },
  { user:'unknown@external.com', action:'Failed login attempt', resource:'Auth endpoint', ip:'203.0.113.55', time:'Jun 3, 2026 08:15 AM', level:'WARN', status:'FAILED' },
  { user:'admin@demo.edu', action:'Settings updated — Branding', resource:'Settings / Branding', ip:'192.168.1.10', time:'Jun 2, 2026 04:22 PM', level:'INFO', status:'SUCCESS' },
  { user:'admin@demo.edu', action:'New teacher account created', resource:'User #USR-0048', ip:'192.168.1.10', time:'Jun 2, 2026 02:10 PM', level:'INFO', status:'SUCCESS' },
  { user:'unknown@bot.net', action:'Brute force login attempt (12x)', resource:'Auth endpoint', ip:'198.51.100.42', time:'Jun 2, 2026 01:33 AM', level:'CRITICAL', status:'BLOCKED' },
  { user:'bilal.t@demo.edu', action:'Exam paper downloaded', resource:'Exam #EXM-2026-05', ip:'10.0.0.34', time:'Jun 1, 2026 03:45 PM', level:'INFO', status:'SUCCESS' },
  { user:'admin@demo.edu', action:'Staff salary exported', resource:'Payroll Report June', ip:'192.168.1.10', time:'Jun 1, 2026 11:20 AM', level:'WARN', status:'SUCCESS' },
];

const ACTIVE_SESSIONS = [
  { device:'Chrome · Windows 11', location:'Karachi, Pakistan', ip:'192.168.1.10', lastActive:'Active now', current:true },
  { device:'Safari · iPhone 14', location:'Karachi, Pakistan', ip:'192.168.1.22', lastActive:'2 hours ago', current:false },
  { device:'Chrome · MacBook Pro', location:'Islamabad, Pakistan', ip:'10.0.0.5', lastActive:'Yesterday 3:00 PM', current:false },
];

const THREATS = [
  { type:'Brute Force Attempt', ip:'198.51.100.42', count:12, time:'Jun 2, 2026 01:33 AM', action:'IP Blocked' },
  { type:'Unusual Login Location', ip:'203.0.113.55', count:1, time:'Jun 3, 2026 08:15 AM', action:'Flagged' },
  { type:'Rapid API Requests', ip:'172.16.0.99', count:450, time:'Jun 1, 2026 11:00 PM', action:'Rate Limited' },
];

const IP_WHITELIST = ['192.168.1.0/24', '10.0.0.0/8'];
const BLOCKED_IPS = ['198.51.100.42', '203.0.113.55', '172.16.0.99'];

type Tab = 'overview' | 'audit' | 'sessions' | 'threats' | 'access' | 'backup';

export default function SecurityPage() {
  const [view, setView] = useState<Tab>('overview');
  const [logFilter, setLogFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [sessionLock, setSessionLock] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const filteredLogs = AUDIT_LOGS.filter(l =>
    (!logFilter || l.user.includes(logFilter) || l.action.toLowerCase().includes(logFilter.toLowerCase())) &&
    (!levelFilter || l.level === levelFilter)
  );

  const securityScore = [mfaEnabled, sessionLock, autoBackup, true, true].filter(Boolean).length;

  return (
    <>
      <Topbar title="Security" subtitle="Audit logs, sessions & threat monitoring" />
      <div className="p-6">
        <PageHeader
          title="Security Center"
          subtitle="Monitor activity, manage sessions, control access, and protect your school's data"
        />

        {/* Security Score */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className="col-span-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
            <p className="text-gray-400 text-xs font-bold uppercase mb-2">Security Score</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-6xl font-black text-white">{securityScore * 20}</span>
              <span className="text-gray-400 text-xl mb-1">/100</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full mb-3">
              <div className={`h-full rounded-full transition-all ${securityScore >= 4 ? 'bg-green-400' : securityScore >= 3 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${securityScore * 20}%` }} />
            </div>
            <p className={`text-xs font-bold ${securityScore >= 4 ? 'text-green-400' : securityScore >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
              {securityScore >= 4 ? '✅ Good' : securityScore >= 3 ? '⚠️ Needs Attention' : '❌ Critical'}
            </p>
          </div>
          <div className="col-span-9 grid grid-cols-4 gap-4">
            {[
              { label:'Failed Logins Today', value:3, icon:'🔐', color:'text-red-600 bg-red-50' },
              { label:'Blocked IPs', value:BLOCKED_IPS.length, icon:'🚫', color:'text-orange-600 bg-orange-50' },
              { label:'Active Sessions', value:ACTIVE_SESSIONS.length, icon:'💻', color:'text-blue-600 bg-blue-50' },
              { label:'Last Backup', value:'2h ago', icon:'💾', color:'text-green-600 bg-green-50' },
            ].map(k => (
              <div key={k.label} className={`${k.color.split(' ')[1]} rounded-2xl p-4`}>
                <span className="text-2xl">{k.icon}</span>
                <p className={`text-3xl font-black mt-2 ${k.color.split(' ')[0]}`}>{k.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {([
            { id:'overview', label:'🛡️ Overview' },
            { id:'audit', label:'📋 Audit Logs' },
            { id:'sessions', label:'💻 Sessions' },
            { id:'threats', label:'⚠️ Threats' },
            { id:'access', label:'🔑 Access Control' },
            { id:'backup', label:'💾 Backup & DR' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setView(t.id)} className={`px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${view === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {view === 'overview' && (
          <div className="grid grid-cols-2 gap-5">
            {/* Security Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">🔐 Security Controls</h3>
              <div className="space-y-4">
                {[
                  { label: 'Two-Factor Authentication', desc: 'Require MFA for all admin accounts', state: mfaEnabled, set: setMfaEnabled },
                  { label: 'Session Timeout Lock', desc: 'Auto-logout after 30 min inactivity', state: sessionLock, set: setSessionLock },
                  { label: 'IP Restriction', desc: 'Restrict login to whitelisted IPs only', state: ipRestriction, set: setIpRestriction },
                  { label: 'Auto Backup', desc: 'Daily encrypted backups to cloud', state: autoBackup, set: setAutoBackup },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                    <button
                      onClick={() => s.set(!s.state)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${s.state ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all duration-200 top-1 ${s.state ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Threats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">⚠️ Recent Threats</h3>
                {THREATS.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl mb-2 border border-red-100">
                    <span className="text-red-500 text-lg flex-shrink-0">🚨</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{t.type}</p>
                      <p className="text-xs text-gray-500">IP: {t.ip} · {t.count} attempts · {t.time}</p>
                    </div>
                    <Badge variant="red">{t.action}</Badge>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">📊 Security Events (7 days)</h3>
                {[['Successful Logins', 847, 'green'], ['Failed Attempts', 23, 'red'], ['Password Resets', 12, 'yellow'], ['Data Exports', 8, 'blue']].map(([l, v, c]) => (
                  <div key={l as string} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{l}</span>
                    <span className={`font-black text-sm text-${c}-600`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'audit' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex gap-3">
              <input value={logFilter} onChange={e => setLogFilter(e.target.value)} placeholder="Search by user or action..." className="flex-1 max-w-sm px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
              <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                <option value="">All Levels</option>
                <option>INFO</option><option>WARN</option><option>CRITICAL</option>
              </select>
              <button className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200">Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Level', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.map((l, i) => (
                    <tr key={i} className={`hover:bg-gray-50 transition-colors ${l.level === 'CRITICAL' ? 'bg-red-50/50' : l.level === 'WARN' ? 'bg-yellow-50/50' : ''}`}>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">{l.time}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-700">{l.user}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">{l.action}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{l.resource}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{l.ip}</td>
                      <td className="px-4 py-3">
                        <Badge variant={l.level === 'CRITICAL' ? 'red' : l.level === 'WARN' ? 'yellow' : 'blue'}>{l.level}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={l.status === 'SUCCESS' ? 'green' : l.status === 'BLOCKED' ? 'red' : 'yellow'}>{l.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-400">{filteredLogs.length} of {AUDIT_LOGS.length} entries</p>
              <p className="text-xs text-gray-400">Logs retained for 90 days</p>
            </div>
          </div>
        )}

        {view === 'sessions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Active Sessions</h3>
                <button className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100">Revoke All Others</button>
              </div>
              <div className="space-y-3">
                {ACTIVE_SESSIONS.map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${s.current ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.current ? 'bg-green-100' : 'bg-gray-200'}`}>
                        {s.device.includes('iPhone') ? '📱' : '💻'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-gray-900">{s.device}</p>
                          {s.current && <Badge variant="green">Current</Badge>}
                        </div>
                        <p className="text-xs text-gray-400">{s.location} · IP: {s.ip}</p>
                        <p className="text-xs text-gray-500">{s.lastActive}</p>
                      </div>
                    </div>
                    {!s.current && (
                      <button className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-200 hover:bg-red-100">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'threats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-2">
              {[{ l: 'Blocked IPs', v: BLOCKED_IPS.length, icon: '🚫', c: 'bg-red-50 text-red-600' }, { l: 'Active Threats', v: THREATS.length, icon: '⚠️', c: 'bg-yellow-50 text-yellow-600' }, { l: 'Clean Since', v: '4h ago', icon: '✅', c: 'bg-green-50 text-green-600' }].map(k => (
                <div key={k.l} className={`${k.c.split(' ')[0]} rounded-2xl p-4 flex items-center gap-3`}>
                  <span className="text-3xl">{k.icon}</span>
                  <div><p className={`text-3xl font-black ${k.c.split(' ')[1]}`}>{k.v}</p><p className="text-xs text-gray-500">{k.l}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">🚨 Threat Detection Log</h3>
              {THREATS.map((t, i) => (
                <div key={i} className="flex items-start justify-between p-4 bg-red-50 rounded-2xl border border-red-100 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><span className="text-red-500">🚨</span><p className="font-bold text-red-800">{t.type}</p></div>
                    <p className="text-xs text-gray-500">IP: <span className="font-mono font-bold text-gray-700">{t.ip}</span> · {t.count} events · {t.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="red">{t.action}</Badge>
                    <button className="text-xs text-gray-400 hover:text-blue-600">Details</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3">🚫 Blocked IPs</h3>
              <div className="space-y-2">
                {BLOCKED_IPS.map(ip => (
                  <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-mono text-sm text-gray-700">{ip}</span>
                    <button className="text-xs text-red-500 hover:text-red-700 font-semibold">Unblock</button>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full py-2 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50">+ Block IP Address</button>
            </div>
          </div>
        )}

        {view === 'access' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">🔑 Password Policy</h3>
              <div className="space-y-3">
                {[
                  { label: 'Minimum Length', value: '12 characters', type: 'text' },
                  { label: 'Session Timeout', value: '30 minutes', type: 'text' },
                  { label: 'Max Login Attempts', value: '5 attempts', type: 'text' },
                  { label: 'Password Expiry', value: '90 days', type: 'text' },
                ].map(p => (
                  <div key={p.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{p.label}</span>
                    <input defaultValue={p.value} className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-xs text-right outline-none focus:border-blue-400" />
                  </div>
                ))}
                {['Require uppercase', 'Require numbers', 'Require symbols', 'Prevent reuse (last 5)'].map(r => (
                  <div key={r} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600">{r}</span>
                    <div className="w-9 h-5 bg-blue-600 rounded-full relative"><div className="w-3.5 h-3.5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" /></div>
                  </div>
                ))}
              </div>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500">Save Policy</button>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">🌐 IP Whitelist</h3>
                <div className="space-y-2 mb-3">
                  {IP_WHITELIST.map(ip => (
                    <div key={ip} className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl border border-green-100">
                      <span className="font-mono text-sm text-gray-700">{ip}</span>
                      <button className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input placeholder="e.g. 10.0.0.0/8" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400" />
                  <button className="px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-500">Add</button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">🔐 MFA Configuration</h3>
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 text-sm text-yellow-800 mb-3">
                  <p className="font-bold">MFA is currently disabled</p>
                  <p className="text-xs mt-0.5">Enable MFA to protect admin accounts with a second verification step.</p>
                </div>
                <div className="space-y-2">
                  {['Authenticator App (TOTP)', 'SMS OTP', 'Email OTP'].map(m => (
                    <label key={m} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">{m}</span>
                    </label>
                  ))}
                </div>
                <button onClick={() => setMfaEnabled(true)} className="mt-3 w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500">Enable MFA</button>
              </div>
            </div>
          </div>
        )}

        {view === 'backup' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">💾 Backup History</h3>
              <div className="space-y-2">
                {[
                  { date: 'Jun 3, 2026 02:00 AM', size: '4.8 GB', type: 'Auto', status: 'SUCCESS' },
                  { date: 'Jun 2, 2026 02:00 AM', size: '4.7 GB', type: 'Auto', status: 'SUCCESS' },
                  { date: 'Jun 1, 2026 02:00 AM', size: '4.6 GB', type: 'Auto', status: 'SUCCESS' },
                  { date: 'May 31, 2026 02:00 AM', size: '4.5 GB', type: 'Auto', status: 'SUCCESS' },
                  { date: 'May 30, 2026 12:00 PM', size: '4.4 GB', type: 'Manual', status: 'SUCCESS' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-green-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-gray-700">{b.date}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={b.type === 'Auto' ? 'blue' : 'purple'}>{b.type}</Badge>
                        <span className="text-xs text-gray-400">{b.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="green">{b.status}</Badge>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Restore</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500">⬇ Run Manual Backup Now</button>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">⚙️ Backup Configuration</h3>
                <div className="space-y-3">
                  {[['Frequency', 'Daily at 02:00 AM'], ['Retention', '30 days'], ['Destination', 'AWS S3 (Encrypted)'], ['Compression', 'Enabled (gzip)']].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">{l}</span>
                      <span className="text-sm font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-5 text-white">
                <h3 className="font-bold text-lg mb-1">Disaster Recovery</h3>
                <p className="text-green-100/80 text-sm mb-4">RTO: 4 hours · RPO: 24 hours · Last DR Test: May 15, 2026</p>
                <div className="space-y-1 text-xs text-green-100/70">
                  <p>✅ Multi-region backup enabled</p>
                  <p>✅ Point-in-time recovery available</p>
                  <p>✅ Encrypted at rest (AES-256)</p>
                  <p>✅ Encrypted in transit (TLS 1.3)</p>
                </div>
                <button className="mt-4 px-4 py-2 bg-white text-green-700 font-bold rounded-xl text-xs hover:bg-green-50">Run DR Test</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-2">📤 Data Export (GDPR)</h3>
                <p className="text-xs text-gray-400 mb-3">Export all school data in compliance with privacy regulations.</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Student Data', 'Staff Records', 'Financial Data', 'Full Database'].map(e => (
                    <button key={e} className="py-2 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:bg-gray-50 text-center">⬇ {e}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
