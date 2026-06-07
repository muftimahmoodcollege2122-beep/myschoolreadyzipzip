'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';

const SPORT_ICONS: Record<string, string> = { Cricket: '🏏', Football: '⚽', Basketball: '🏀', Volleyball: '🏐', Athletics: '🏃', Swimming: '🏊', Badminton: '🏸', Table_Tennis: '🏓', Chess: '♟️', Other: '🏅' };
const EMPTY = { name: '', sport: 'Cricket', coach: '', members: '', wins: '0', losses: '0', nextMatch: '', status: 'Active' };

export default function SportsPage() {
  const [tab, setTab] = useState<'teams' | 'schedule'>('teams');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: teams = [], isLoading: teamsLoading } = useSchoolSection('sports');
  const { data: schedule = [], isLoading: schedLoading } = useSchoolSection('sportsSchedule');
  const create = useCreateSchoolItem('sports');
  const del = useDeleteSchoolItem('sports');

  const teamList: any[] = Array.isArray(teams) ? teams : [];
  const schedList: any[] = Array.isArray(schedule) ? schedule : [];

  const totalWins = teamList.reduce((a, t) => a + (Number(t.wins) || 0), 0);
  const totalMembers = teamList.reduce((a, t) => a + (Number(t.members) || 0), 0);

  const handleCreate = async () => {
    if (!form.name) return;
    await create.mutateAsync({ ...form, wins: Number(form.wins), losses: Number(form.losses) });
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Sports" subtitle="School sports teams & activities" />
      <div className="p-6">
        <PageHeader title="Sports Management" subtitle={`${teamList.length} teams registered`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Team</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Teams', value: teamList.length, icon: '🏆', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Athletes', value: totalMembers, icon: '🏃', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Wins', value: totalWins, icon: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Active Teams', value: teamList.filter(t => t.status === 'Active').length, icon: '✅', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['teams','schedule'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${tab === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>

        {tab === 'teams' && (
          teamsLoading ? <div className="text-center py-12 text-gray-400">Loading teams...</div>
          : teamList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🏆</p>
              <p className="font-medium">No sports teams yet</p>
              <p className="text-sm mt-1">Add your school's sports teams</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamList.map((team: any) => (
                <div key={team.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{SPORT_ICONS[team.sport] || '🏅'}</span>
                      <div>
                        <p className="font-bold text-gray-900">{team.name}</p>
                        <p className="text-xs text-gray-500">{team.sport}</p>
                      </div>
                    </div>
                    <Badge variant={team.status === 'Active' ? 'green' : 'gray'}>{team.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-400">Wins</p><p className="font-bold text-green-600">{team.wins || 0}</p></div>
                    <div className="bg-red-50 rounded-lg p-2"><p className="text-xs text-gray-400">Losses</p><p className="font-bold text-red-500">{team.losses || 0}</p></div>
                    <div className="bg-blue-50 rounded-lg p-2"><p className="text-xs text-gray-400">Players</p><p className="font-bold text-blue-600">{team.members || 0}</p></div>
                  </div>
                  {team.coach && <p className="text-xs text-gray-400">Coach: {team.coach}</p>}
                  {team.nextMatch && <p className="text-xs text-gray-400 mt-0.5">Next Match: {new Date(team.nextMatch).toLocaleDateString()}</p>}
                  <button onClick={() => del.mutate(team.id)} className="mt-3 w-full py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">Remove Team</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'schedule' && (
          schedLoading ? <div className="text-center py-12 text-gray-400">Loading schedule...</div>
          : schedList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🗓️</p><p className="font-medium">No matches scheduled</p></div>
          ) : (
            <div className="space-y-3">
              {schedList.map((s: any) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{s.homeTeam} vs {s.awayTeam}</p>
                      <p className="text-xs text-gray-400">{s.sport} · {new Date(s.date).toLocaleDateString()} · {s.venue}</p>
                    </div>
                    <Badge variant="blue">{s.status || 'SCHEDULED'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Sports Team">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Team Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Senior Cricket Team" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Sport</label>
              <select value={form.sport} onChange={e => setForm({ ...form, sport: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {Object.keys(SPORT_ICONS).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">No. of Players</label>
              <input type="number" value={form.members} onChange={e => setForm({ ...form, members: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Coach Name</label>
            <input value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Coach name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Wins</label>
              <input type="number" value={form.wins} onChange={e => setForm({ ...form, wins: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Losses</label>
              <input type="number" value={form.losses} onChange={e => setForm({ ...form, losses: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Next Match Date</label>
            <input type="date" value={form.nextMatch} onChange={e => setForm({ ...form, nextMatch: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Team'}
          </button>
        </div>
      </Modal>
    </>
  );
}
