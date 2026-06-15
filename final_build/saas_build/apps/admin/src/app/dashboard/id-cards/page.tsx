'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';
import { useStudents } from '../../../hooks/use-api';

const EMPTY = { studentName: '', className: '', rollNo: '', bloodGroup: '', fatherName: '', address: '', emergencyContact: '', status: 'ISSUED', validUntil: `${new Date().getFullYear() + 1}-12-31` };

export default function IdCardsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: cards = [], isLoading } = useSchoolSection('idcards');
  const create = useCreateSchoolItem('idcards');
  const del = useDeleteSchoolItem('idcards');

  const cardList: any[] = Array.isArray(cards) ? cards : [];
  const filtered = cardList.filter(c => !search || c.studentName?.toLowerCase().includes(search.toLowerCase()) || c.rollNo?.includes(search));

  const handleCreate = async () => {
    if (!form.studentName) return;
    await create.mutateAsync({ ...form, issuedDate: new Date().toISOString().split('T')[0] });
    setForm(EMPTY); setModal(false);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <>
      <Topbar title="ID Cards" subtitle="Student ID card management" />
      <div className="p-6">
        <PageHeader title="ID Card Management" subtitle={`${cardList.length} ID cards issued`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Issue ID Card</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Issued', value: cardList.length, icon: '🪪', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: cardList.filter(c => c.status === 'ISSUED').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Expired', value: cardList.filter(c => new Date(c.validUntil) < new Date()).length, icon: '⏰', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Pending', value: cardList.filter(c => c.status === 'PENDING').length, icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student name or roll no..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading ID cards...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🪪</p>
              <p className="font-medium">{search ? 'No ID cards found' : 'No ID cards issued yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((card: any) => {
                const isExpired = new Date(card.validUntil) < new Date();
                return (
                  <div key={card.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-lg">{card.studentName}</p>
                          <p className="text-green-100 text-sm">{card.className}</p>
                          {card.rollNo && <p className="text-green-200 text-xs">Roll No: {card.rollNo}</p>}
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">👤</div>
                      </div>
                    </div>
                    <div className="p-4 space-y-1 text-xs text-gray-500">
                      {card.fatherName && <p>👨 Father: {card.fatherName}</p>}
                      {card.bloodGroup && <p>🩸 Blood Group: {card.bloodGroup}</p>}
                      {card.emergencyContact && <p>📱 Emergency: {card.emergencyContact}</p>}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span>Valid Until: {formatDate(card.validUntil)}</span>
                        <Badge variant={isExpired ? 'red' : 'green'}>{isExpired ? 'Expired' : 'Valid'}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 px-4 pb-4">
                      <button className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100">🖨 Print</button>
                      <button onClick={() => del.mutate(card.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Issue ID Card">
        <div className="p-6 space-y-4">
          {[['studentName','Student Name *'],['className','Class (e.g. Class 10-A)'],['rollNo','Roll No.'],['fatherName',"Father's Name"],['bloodGroup','Blood Group'],['emergencyContact','Emergency Contact'],['address','Address']].map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} />
            </div>
          ))}
          <div><label className="text-xs text-gray-500 mb-1 block">Valid Until</label>
            <input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Issuing...' : 'Issue ID Card'}
          </button>
        </div>
      </Modal>
    </>
  );
}
