'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '@/hooks/use-api';

const EMPTY = { name: '', phone: '', email: '', cnic: '', occupation: '', address: '', children: '', feeStatus: 'CURRENT' };

export default function ParentsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: parents = [], isLoading } = useSchoolSection('parents');
  const create = useCreateSchoolItem('parents');
  const del = useDeleteSchoolItem('parents');

  const items: any[] = Array.isArray(parents) ? parents : [];
  const filtered = items.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search));

  const handleCreate = async () => {
    if (!form.name || !form.phone) return;
    await create.mutateAsync({ ...form, meetings: 0 });
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Parents" subtitle="Parent & guardian management" />
      <div className="p-6">
        <PageHeader title="Parent Directory" subtitle={`${items.length} parents registered`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Parent</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Parents', value: items.length, icon: '👨‍👩‍👧', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Fee Current', value: items.filter(p => p.feeStatus === 'CURRENT').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Fee Overdue', value: items.filter(p => p.feeStatus === 'OVERDUE').length, icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Meetings', value: items.reduce((a: number, p: any) => a + (Number(p.meetings) || 0), 0), icon: '🤝', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading parents...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">👨‍👩‍👧</p>
              <p className="font-medium">{search ? 'No parents found' : 'No parents added yet'}</p>
              {!search && <p className="text-sm mt-1">Click &quot;+ Add Parent&quot; to register a parent/guardian</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">{p.name?.[0]?.toUpperCase()}</div>
                      <div><p className="font-bold text-gray-900">{p.name}</p><p className="text-xs text-gray-500">{p.occupation || 'N/A'}</p></div>
                    </div>
                    <Badge variant={p.feeStatus === 'CURRENT' ? 'green' : 'red'}>{p.feeStatus}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>📱 {p.phone}</p>
                    {p.email && <p>📧 {p.email}</p>}
                    {p.address && <p>📍 {p.address}</p>}
                    {p.children && <p>👧 {p.children}</p>}
                    <p>🤝 {p.meetings || 0} meetings</p>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => setSelected(p)} className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100">View Details</button>
                    <button onClick={() => del.mutate(p.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Parent / Guardian">
        <div className="p-6 space-y-4">
          {([['name','Full Name *'],['phone','Phone *'],['email','Email'],['cnic','CNIC / ID Number'],['occupation','Occupation'],['address','Address'],['children','Children (e.g. Ahmed Ali - Class 8)']]) .map(([k, label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} />
            </div>
          ))}
          <div><label className="text-xs text-gray-500 mb-1 block">Fee Status</label>
            <select value={form.feeStatus} onChange={e => setForm({ ...form, feeStatus: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="CURRENT">Current</option><option value="OVERDUE">Overdue</option>
            </select>
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Parent'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''}>
        {selected && (
          <div className="p-6 space-y-3 text-sm">
            {[['Name', selected.name],['Phone', selected.phone],['Email', selected.email || 'N/A'],['CNIC', selected.cnic || 'N/A'],['Occupation', selected.occupation || 'N/A'],['Address', selected.address || 'N/A'],['Children', selected.children || 'N/A'],['Fee Status', selected.feeStatus],['Meetings', selected.meetings || 0]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{k}</span><span className="font-medium text-gray-800">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
