'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name: '', rollNumber: '', email: '', phone: '', sectionId: '', dateOfBirth: '', gender: 'MALE', fatherName: '', address: '' });
  const [error, setError]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn:  () => api.get('/students', { search, page, limit: 15 }).catch(() => ({ data: [], total: 0 })),
  });

  const { data: sections } = useQuery({
    queryKey: ['sections-list'],
    queryFn:  () => api.get('/sections?limit=100').catch(() => []),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/students', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setShowAdd(false); setForm({ name: '', rollNumber: '', email: '', phone: '', sectionId: '', dateOfBirth: '', gender: 'MALE', fatherName: '', address: '' }); },
    onError: (e: any) => setError(e?.message || 'Failed to add student'),
  });

  const students: any[] = Array.isArray(data) ? data : (data as any)?.data || [];
  const total: number   = Array.isArray(data) ? data.length : (data as any)?.total || 0;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm">{total} total students enrolled</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all">
          ➕ Add Student
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="🔍  Search by name, roll number or email…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Student', 'Roll #', 'Class / Section', 'Father', 'Status', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading students…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No students found. <button onClick={() => setShowAdd(true)} className="text-indigo-600 font-semibold">Add your first →</button></td></tr>
              ) : students.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">{s.name?.[0]}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-700">{s.rollNumber}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">{s.section?.class?.name || '—'} / {s.section?.name || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">{s.fatherName || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{dayjs(s.createdAt).format('MMM D, YYYY')}</td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs text-indigo-600 hover:underline font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 15 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 rounded-lg border disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">Add New Student</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Muhammad Ali' },
                  { label: 'Roll Number *', key: 'rollNumber', type: 'text', placeholder: '2024-001' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'student@school.pk' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '0300-1234567' },
                  { label: "Father's Name", key: 'fatherName', type: 'text', placeholder: 'Ali Khan' },
                  { label: 'Date of Birth', key: 'dateOfBirth', type: 'date', placeholder: '' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Section *</label>
                  <select value={form.sectionId} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="">Select section…</option>
                    {Array.isArray(sections) && (sections as any[]).map((sec: any) => (
                      <option key={sec.id} value={sec.id}>{sec.class?.name} - {sec.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Home address…" rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setError(''); addMutation.mutate(form); }}
                  disabled={addMutation.isPending || !form.name || !form.rollNumber || !form.sectionId}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all">
                  {addMutation.isPending ? 'Adding…' : 'Add Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
