'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '@/hooks/use-api';

const CERT_TYPES = ['Merit Certificate', 'Character Certificate', 'Completion Certificate', 'Achievement Certificate', 'Participation Certificate', 'Custom'];
const EMPTY = { studentName: '', className: '', certType: 'Merit Certificate', issuedDate: new Date().toISOString().split('T')[0], description: '', status: 'ISSUED' };

export default function CertificatesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: certs = [], isLoading } = useSchoolSection('certificates');
  const create = useCreateSchoolItem('certificates');
  const del = useDeleteSchoolItem('certificates');

  const certList: any[] = Array.isArray(certs) ? certs : [];
  const filtered = certList.filter(c =>
    (!search || c.studentName?.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || c.certType === typeFilter)
  );

  const handleCreate = async () => {
    if (!form.studentName || !form.certType) return;
    await create.mutateAsync({ ...form, issuedAt: new Date().toISOString() });
    setForm(EMPTY); setModal(false);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <>
      <Topbar title="Certificates" subtitle="Student certificate management" />
      <div className="p-6">
        <PageHeader title="Certificates" subtitle={`${certList.length} certificates issued`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Issue Certificate</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Issued', value: certList.length, icon: '🎖️', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Merit', value: certList.filter(c => c.certType === 'Merit Certificate').length, icon: '🏅', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Character', value: certList.filter(c => c.certType === 'Character Certificate').length, icon: '📜', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'This Month', value: certList.filter(c => new Date(c.issuedDate) > new Date(Date.now() - 30*864e5)).length, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student name..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Types</option>
            {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading certificates...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🎖️</p>
              <p className="font-medium">{search || typeFilter ? 'No certificates found' : 'No certificates issued yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((cert: any) => (
                <div key={cert.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">🎖️</div>
                      <div>
                        <p className="font-bold text-gray-900">{cert.studentName}</p>
                        <p className="text-xs text-gray-500">{cert.className || 'N/A'}</p>
                      </div>
                    </div>
                    <Badge variant="green">{cert.status || 'ISSUED'}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>📜 {cert.certType}</p>
                    <p>📅 Issued: {formatDate(cert.issuedDate)}</p>
                    {cert.description && <p className="line-clamp-2">{cert.description}</p>}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100">🖨 Print</button>
                    <button onClick={() => del.mutate(cert.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Issue Certificate">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Student Name *</label>
            <input value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} placeholder="Full student name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Class</label>
            <input value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} placeholder="e.g. Class 10-A" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Certificate Type *</label>
            <select value={form.certType} onChange={e => setForm({ ...form, certType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {CERT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
            <input type="date" value={form.issuedDate} onChange={e => setForm({ ...form, issuedDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description / Achievement</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. For outstanding academic performance..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Issuing...' : 'Issue Certificate'}
          </button>
        </div>
      </Modal>
    </>
  );
}
