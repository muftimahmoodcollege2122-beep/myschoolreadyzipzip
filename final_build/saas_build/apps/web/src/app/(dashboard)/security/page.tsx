'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useLoginHistory, useIpRestrictions, useSuspiciousActivities, useSecurityDashboard, useAddIpRestriction } from '../../../hooks/use-api';

export default function SecurityPage() {
  const [view, setView] = useState<'overview' | 'logins' | 'ip' | 'alerts'>('overview');
  const [ipModal, setIpModal] = useState(false);
  const [ipForm, setIpForm] = useState({ ipAddress: '', description: '', type: 'WHITELIST' });

  const { data: dashboard } = useSecurityDashboard();
  const { data: logins = [], isLoading: loginsLoading } = useLoginHistory({});
  const { data: ipRules = [] } = useIpRestrictions();
  const { data: suspicious = [] } = useSuspiciousActivities();
  const addIp = useAddIpRestriction();

  const loginList: any[] = Array.isArray(logins) ? logins : (logins as any)?.data ?? [];
  const ipList: any[] = Array.isArray(ipRules) ? ipRules : [];
  const suspiciousList: any[] = Array.isArray(suspicious) ? suspicious : [];

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleAddIp = async () => {
    if (!ipForm.ipAddress) return;
    await addIp.mutateAsync(ipForm);
    setIpForm({ ipAddress: '', description: '', type: 'WHITELIST' }); setIpModal(false);
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
          {(['overview','logins','ip','alerts'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
              {v === 'ip' ? 'IP Rules' : v === 'logins' ? 'Login Logs' : v.charAt(0).toUpperCase() + v.slice(1)}
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
