'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';

const CLUB_ICONS: Record<string, string> = { Science: '🔬', Arts: '🎨', Drama: '🎭', Debate: '🎙️', Music: '🎵', Environment: '🌱', Technology: '💻', Literature: '📚', Math: '🔢', Photography: '📷', Other: '🏛️' };
const EMPTY = { name: '', type: 'Science', president: '', advisor: '', members: '', meetingDay: 'Monday', description: '', status: 'Active' };

export default function ClubsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: clubs = [], isLoading } = useSchoolSection('clubs');
  const create = useCreateSchoolItem('clubs');
  const del = useDeleteSchoolItem('clubs');

  const clubList: any[] = Array.isArray(clubs) ? clubs : [];
  const filtered = clubList.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));
  const totalMembers = clubList.reduce((a, c) => a + (Number(c.members) || 0), 0);

  const handleCreate = async () => {
    if (!form.name) return;
    await create.mutateAsync({ ...form, members: Number(form.members) || 0 });
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Clubs" subtitle="Student clubs & societies" />
      <div className="p-6">
        <PageHeader title="Clubs & Societies" subtitle={`${clubList.length} clubs registered`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Club</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Clubs', value: clubList.length, icon: '🏛️', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Members', value: totalMembers, icon: '👥', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Active', value: clubList.filter(c => c.status === 'Active').length, icon: '✅', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Avg Size', value: clubList.length ? Math.round(totalMembers / clubList.length) : 0, icon: '👤', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clubs..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading clubs...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🏛️</p>
              <p className="font-medium">{search ? 'No clubs found' : 'No clubs added yet'}</p>
              {!search && <p className="text-sm mt-1">Add your school's clubs and societies</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((club: any) => (
                <div key={club.id} onClick={() => setSelected(club)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{CLUB_ICONS[club.type] || '🏛️'}</span>
                      <div>
                        <p className="font-bold text-gray-900">{club.name}</p>
                        <p className="text-xs text-gray-500">{club.type}</p>
                      </div>
                    </div>
                    <Badge variant={club.status === 'Active' ? 'green' : 'gray'}>{club.status}</Badge>
                  </div>
                  {club.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{club.description}</p>}
                  <div className="space-y-1 text-xs text-gray-400">
                    <p>👥 {club.members || 0} members</p>
                    {club.president && <p>🎖️ President: {club.president}</p>}
                    {club.advisor && <p>👨‍🏫 Advisor: {club.advisor}</p>}
                    {club.meetingDay && <p>📅 Meets: {club.meetingDay}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Club / Society">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Club Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Science Club" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {Object.keys(CLUB_ICONS).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Members</label>
              <input type="number" value={form.members} onChange={e => setForm({ ...form, members: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          {[['president','Club President'],['advisor','Faculty Advisor'],['description','Description']].map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              {k === 'description' ? (
                <textarea rows={2} value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              ) : (
                <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} />
              )}
            </div>
          ))}
          <div><label className="text-xs text-gray-500 mb-1 block">Meeting Day</label>
            <select value={form.meetingDay} onChange={e => setForm({ ...form, meetingDay: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Club'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''}>
        {selected && (
          <div className="p-6 space-y-3">
            <div className="text-center text-5xl mb-2">{CLUB_ICONS[selected.type] || '🏛️'}</div>
            {[['Type',selected.type],['Status',selected.status],['Members',selected.members||0],['President',selected.president||'N/A'],['Advisor',selected.advisor||'N/A'],['Meeting Day',selected.meetingDay||'N/A']].map(([k,v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
                <span className="text-gray-400">{k}</span><span className="font-medium text-gray-800">{String(v)}</span>
              </div>
            ))}
            {selected.description && <p className="text-sm text-gray-600 pt-2">{selected.description}</p>}
            <button onClick={() => { del.mutate(selected.id); setSelected(null); }} className="w-full py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 mt-2">Delete Club</button>
          </div>
        )}
      </Modal>
    </>
  );
}
