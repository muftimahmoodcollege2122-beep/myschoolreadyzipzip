'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '@/hooks/use-api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DUTIES = ['Gate Duty','Library','Lab Supervision','Assembly','Playground','Exam Hall','Cafeteria','Office'];
const EMPTY = { staffName: '', duty: 'Gate Duty', day: 'Monday', shift: 'Morning', from: '07:00', to: '14:00', location: '' };

export default function DutyRosterPage() {
  const [dayFilter, setDayFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: roster = [], isLoading } = useSchoolSection('dutyroster');
  const create = useCreateSchoolItem('dutyroster');
  const del = useDeleteSchoolItem('dutyroster');

  const rosterList: any[] = Array.isArray(roster) ? roster : [];
  const filtered = rosterList.filter(r => !dayFilter || r.day === dayFilter);

  const handleCreate = async () => {
    if (!form.staffName || !form.duty) return;
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Duty Roster" subtitle="Staff duty assignment schedule" />
      <div className="p-6">
        <PageHeader title="Duty Roster" subtitle={`${rosterList.length} duty assignments`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Assign Duty</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Duties', value: rosterList.length, icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Morning Shift', value: rosterList.filter(r => r.shift === 'Morning').length, icon: '🌅', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Afternoon Shift', value: rosterList.filter(r => r.shift === 'Afternoon').length, icon: '☀️', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Staff Assigned', value: new Set(rosterList.map(r => r.staffName)).size, icon: '👥', color: 'text-green-600', bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {['', ...DAYS].map(d => (
              <button key={d || 'all'} onClick={() => setDayFilter(d)} className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${dayFilter === d ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{d || 'All Days'}</button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading roster...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="font-medium">{dayFilter ? `No duties on ${dayFilter}` : 'No duty assignments yet'}</p>
              {!dayFilter && <p className="text-sm mt-1">Assign duties to staff members</p>}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Staff</th><th className="px-4 py-3 text-left">Duty</th>
                  <th className="px-4 py-3 text-left">Day</th><th className="px-4 py-3 text-left">Shift</th>
                  <th className="px-4 py-3 text-left">Time</th><th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map((r: any) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.staffName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.duty}</td>
                      <td className="px-4 py-3 text-gray-500">{r.day}</td>
                      <td className="px-4 py-3"><Badge variant={r.shift === 'Morning' ? 'orange' : 'yellow'}>{r.shift}</Badge></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.from} - {r.to}</td>
                      <td className="px-4 py-3 text-gray-500">{r.location || '-'}</td>
                      <td className="px-4 py-3"><button onClick={() => del.mutate(r.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Assign Duty">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Staff Name *</label>
            <input value={form.staffName} onChange={e => setForm({ ...form, staffName: e.target.value })} placeholder="Staff member name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Duty</label>
              <select value={form.duty} onChange={e => setForm({ ...form, duty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {DUTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Day</label>
              <select value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Shift</label>
              <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>Morning</option><option>Afternoon</option><option>Evening</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">From</label>
              <input type="time" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">To</label>
              <input type="time" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Location</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Main Gate, Science Lab..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Assigning...' : 'Assign Duty'}
          </button>
        </div>
      </Modal>
    </>
  );
}
