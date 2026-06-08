'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function TeachersPage() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', phone: '', cnic: '', qualification: '', specialization: '', salary: '' });
  const [error, setError]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', search],
    queryFn:  () => api.get('/teachers', { search, limit: 50 }).catch(() => []),
  });

  const addMutation = useMutation({
    mutationFn: (d: any) => api.post('/teachers', { ...d, salary: Number(d.salary) || 0 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); setShowAdd(false); setForm({ name: '', email: '', phone: '', cnic: '', qualification: '', specialization: '', salary: '' }); },
    onError: (e: any) => setError(e?.message || 'Failed to add teacher'),
  });

  const teachers: any[] = Array.isArray(data) ? data : (data as any)?.data || [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Teachers</h1>
          <p className="text-gray-500 text-sm">{teachers.length} teaching staff members</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all">
          ➕ Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name, email or specialization…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 text-center py-12 text-gray-400">Loading teachers…</div>
        ) : teachers.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400">
            No teachers found. <button onClick={() => setShowAdd(true)} className="text-teal-600 font-semibold">Add your first →</button>
          </div>
        ) : teachers.map((t: any) => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-lg font-black text-teal-700 flex-shrink-0">
                {t.user?.name?.[0] || t.name?.[0] || 'T'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{t.user?.name || t.name}</p>
                <p className="text-xs text-gray-400 truncate">{t.user?.email || t.email}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {t.specialization && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-base">📚</span> {t.specialization}
                </div>
              )}
              {t.qualification && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-base">🎓</span> {t.qualification}
                </div>
              )}
              {(t.user?.phone || t.phone) && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-base">📱</span> {t.user?.phone || t.phone}
                </div>
              )}
              {t._count?.subjects != null && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-base">📖</span> {t._count.subjects} subject{t._count.subjects !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {t.isActive !== false ? 'Active' : 'Inactive'}
              </span>
              <span className="text-[10px] text-gray-400">Joined {dayjs(t.createdAt).format('MMM YYYY')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">Add New Teacher</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Dr. Ahmed Khan' },
                  { label: 'Email *', key: 'email', type: 'email', placeholder: 'teacher@school.pk' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '0300-1234567' },
                  { label: 'CNIC', key: 'cnic', type: 'text', placeholder: '42201-1234567-1' },
                  { label: 'Qualification', key: 'qualification', type: 'text', placeholder: 'M.Sc Computer Science' },
                  { label: 'Specialization', key: 'specialization', type: 'text', placeholder: 'Mathematics' },
                  { label: 'Monthly Salary (Rs.)', key: 'salary', type: 'number', placeholder: '50000' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className={key === 'salary' ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
                📧 A welcome email with login credentials will be automatically sent to the teacher's email.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setError(''); addMutation.mutate(form); }}
                  disabled={addMutation.isPending || !form.name || !form.email}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm">
                  {addMutation.isPending ? 'Adding…' : 'Add Teacher'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
