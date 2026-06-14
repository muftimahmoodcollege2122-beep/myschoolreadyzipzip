'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useAlumni, useCreateAlumni, useAlumniStats } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', graduationYear: new Date().getFullYear(), degree: '', currentOccupation: '', company: '', city: '', country: 'Pakistan' };

export default function AlumniPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useAlumni({ search, year, limit: 50 });
  const { data: stats } = useAlumniStats();
  const create = useCreateAlumni();

  const alumni: any[] = data?.data ?? [];
  const years = [...new Set(alumni.map((a: any) => a.graduationYear))].sort((a, b) => b - a);

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName) return;
    try {
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
  };
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }

  return (
    <>
      <Topbar title="Alumni" subtitle="Alumni network & graduates management" />
      <div className="p-6">
        <PageHeader title="Alumni Network" subtitle={`${data?.meta?.total ?? 0} alumni registered`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Alumni</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Alumni', value: stats?.total ?? data?.meta?.total ?? 0, icon: '🎓', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Employed', value: stats?.employed ?? alumni.filter((a: any) => a.currentOccupation).length, icon: '💼', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Graduation Years', value: years.length, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Verified', value: stats?.verified ?? alumni.filter((a: any) => a.isVerified).length, icon: '✅', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alumni..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={year} onChange={e => setYear(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading alumni...</div>
          : alumni.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🎓</p>
              <p className="font-medium">{search ? 'No alumni found' : 'No alumni records yet'}</p>
              {!search && <p className="text-sm mt-1">Add your first alumni member</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alumni.map((a: any) => (
                <div key={a.id} onClick={() => setSelected(a)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {a.firstName?.[0]}{a.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{a.firstName} {a.lastName}</p>
                        <p className="text-xs text-gray-500">Class of {a.graduationYear}</p>
                      </div>
                    </div>
                    {a.isVerified && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">✅ Verified</span>}
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    {a.degree && <p>🎓 {a.degree}</p>}
                    {a.currentOccupation && <p>💼 {a.currentOccupation}</p>}
                    {a.company && <p>🏢 {a.company}</p>}
                    {a.city && <p>📍 {a.city}, {a.country}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Alumni">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">First Name *</label>
              <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Last Name *</label>
              <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          {[['email','Email','email'],['phone','Phone','text'],['degree','Degree/Qualification','text'],['currentOccupation','Current Occupation','text'],['company','Company/Organization','text'],['city','City','text']].map(([k,label,type]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input type={type} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          ))}
          <div><label className="text-xs text-gray-500 mb-1 block">Graduation Year</label>
            <input type="number" value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Alumni'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.firstName} ${selected.lastName}` : ''}>
        {selected && (
          <div className="p-6 space-y-3 text-sm">
            {[['Full Name',`${selected.firstName} ${selected.lastName}`],['Email',selected.email||'N/A'],['Phone',selected.phone||'N/A'],['Graduation Year',selected.graduationYear],['Degree',selected.degree||'N/A'],['Occupation',selected.currentOccupation||'N/A'],['Company',selected.company||'N/A'],['Location',selected.city?`${selected.city}, ${selected.country}`:'N/A'],['Verified',selected.isVerified?'Yes':'No']].map(([k,v]) => (
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
