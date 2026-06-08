'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function FeesPage() {
  const qc = useQueryClient();
  const [filter, setFilter]   = useState('ALL');
  const [search, setSearch]   = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ studentId: '', amount: '', dueDate: '', month: '', description: '', feeType: 'TUITION' });
  const [error, setError]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['fees', filter, search],
    queryFn:  () => api.get('/fees', { status: filter === 'ALL' ? undefined : filter, search, limit: 50 }).catch(() => []),
  });

  const { data: students } = useQuery({
    queryKey: ['students-dropdown'],
    queryFn:  () => api.get('/students?limit=200').catch(() => []),
  });

  const { data: summary } = useQuery({
    queryKey: ['fee-summary'],
    queryFn:  () => api.get('/fees/summary').catch(() => null),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/fees', { ...d, amount: Number(d.amount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); qc.invalidateQueries({ queryKey: ['fee-summary'] }); setShowAdd(false); },
    onError: (e: any) => setError(e?.message || 'Failed to create fee record'),
  });

  const markPaid = useMutation({
    mutationFn: (id: string) => api.patch(`/fees/${id}/mark-paid`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); qc.invalidateQueries({ queryKey: ['fee-summary'] }); },
  });

  const fees: any[] = Array.isArray(data) ? data : (data as any)?.data || [];
  const s = (summary as any) || {};

  const STATUS_COLORS: any = {
    PAID: 'bg-green-100 text-green-700',
    UNPAID: 'bg-red-100 text-red-700',
    OVERDUE: 'bg-orange-100 text-orange-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Fee Management</h1>
          <p className="text-gray-500 text-sm">Track tuition and miscellaneous fees</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          ➕ Create Fee Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Collected', value: s.totalCollected ? `Rs. ${Number(s.totalCollected).toLocaleString()}` : '—', bg: 'bg-green-50 border-green-100', color: 'text-green-700', icon: '✅' },
          { label: 'Total Pending',   value: s.totalPending   ? `Rs. ${Number(s.totalPending).toLocaleString()}`   : '—', bg: 'bg-red-50 border-red-100',     color: 'text-red-700',   icon: '⏳' },
          { label: 'Overdue',         value: s.overdueCount   ?? '—', bg: 'bg-orange-50 border-orange-100', color: 'text-orange-700', icon: '⚠️' },
          { label: 'This Month',      value: s.thisMonth      ? `Rs. ${Number(s.thisMonth).toLocaleString()}`       : '—', bg: 'bg-indigo-50 border-indigo-100', color: 'text-indigo-700', icon: '📅' },
        ].map(({ label, value, bg, color, icon }) => (
          <div key={label} className={`${bg} border rounded-2xl p-4 shadow-sm`}>
            <p className="text-xs font-semibold text-gray-500">{label}</p>
            <p className={`text-xl font-black mt-1 ${color}`}>{value}</p>
            <span className="text-lg">{icon}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search student…"
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <div className="flex gap-1.5">
          {['ALL', 'UNPAID', 'PAID', 'OVERDUE'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Student', 'Type', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No fee records found.</td></tr>
              ) : fees.map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-900">{f.student?.name}</p>
                    <p className="text-xs text-gray-400">{f.student?.rollNumber}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">{f.feeType}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">Rs. {Number(f.amount).toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">
                    <span className={dayjs(f.dueDate).isBefore(dayjs()) && f.status !== 'PAID' ? 'text-red-600 font-semibold' : ''}>
                      {dayjs(f.dueDate).format('MMM D, YYYY')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[f.status] || 'bg-gray-100 text-gray-600'}`}>{f.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {f.status !== 'PAID' && (
                      <button onClick={() => markPaid.mutate(f.id)} disabled={markPaid.isPending}
                        className="text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-medium transition-all">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">Create Fee Record</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Student *</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Select student…</option>
                  {Array.isArray(students) && (students as any[]).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fee Type</label>
                  <select value={form.feeType} onChange={e => setForm(f => ({ ...f, feeType: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    {['TUITION', 'ADMISSION', 'EXAM', 'LIBRARY', 'TRANSPORT', 'HOSTEL', 'OTHER'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (Rs.) *</label>
                  <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="5000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
                  <input type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date *</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. January 2025 tuition fee"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">Cancel</button>
                <button onClick={() => { setError(''); addMutation.mutate(form); }}
                  disabled={addMutation.isPending || !form.studentId || !form.amount || !form.dueDate}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                  {addMutation.isPending ? 'Creating…' : 'Create Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
