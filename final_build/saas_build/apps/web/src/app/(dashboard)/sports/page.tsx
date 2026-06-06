'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const SPORTS = [
  { id: 1, name: 'Cricket', icon: '🏏', coach: 'Mr. Omar Qureshi', players: 22, practiceDay: 'Mon & Wed', practiceTime: '3:00 PM', facility: 'School Ground', category: 'Team Sport', achievements: ['District Cricket Champions 2025', 'Inter-School League — Runners Up 2025'] },
  { id: 2, name: 'Football', icon: '⚽', coach: 'Mr. Kamran Shah', players: 25, practiceDay: 'Tue & Thu', practiceTime: '3:30 PM', facility: 'School Ground', category: 'Team Sport', achievements: ['City Football Cup 2025 — 3rd Place'] },
  { id: 3, name: 'Basketball', icon: '🏀', coach: 'Mr. Bilal Hassan', players: 15, practiceDay: 'Wed & Fri', practiceTime: '2:30 PM', facility: 'Indoor Court', category: 'Team Sport', achievements: [] },
  { id: 4, name: 'Table Tennis', icon: '🏓', coach: 'Mrs. Sara Khan', players: 12, practiceDay: 'Monday', practiceTime: '1:00 PM', facility: 'Sports Room', category: 'Individual', achievements: ['National Junior Champion — Ahmed Ali 2025'] },
  { id: 5, name: 'Badminton', icon: '🏸', coach: 'Mr. Ibrahim Ali', players: 18, practiceDay: 'Tuesday & Friday', practiceTime: '2:00 PM', facility: 'Indoor Court', category: 'Individual', achievements: ['City Badminton Tournament — Gold Medal'] },
  { id: 6, name: 'Athletics (Track)', icon: '🏃', coach: 'Mr. Ahmed Raza', players: 30, practiceDay: 'Mon–Fri', practiceTime: '7:00 AM', facility: 'Athletic Track', category: 'Individual', achievements: ['Regional 100m — 1st Place', '400m Relay — District Champions'] },
  { id: 7, name: 'Swimming', icon: '🏊', coach: 'Mrs. Nadia Rehman', players: 20, practiceDay: 'Sat & Sun', practiceTime: '8:00 AM', facility: 'Community Pool', category: 'Individual', achievements: [] },
  { id: 8, name: 'Volleyball', icon: '🏐', coach: 'Mr. Zain Malik', players: 18, practiceDay: 'Thu & Sat', practiceTime: '3:00 PM', facility: 'School Ground', category: 'Team Sport', achievements: ['Inter-School Volleyball — Semi-Finalists'] },
];

const COMPETITIONS = [
  { name: 'District Cricket Championship', sport: 'Cricket', date: 'Jun 15, 2026', venue: 'National Stadium, Karachi', result: 'UPCOMING', our_position: '-' },
  { name: 'City Football Cup 2026', sport: 'Football', date: 'Jun 22, 2026', venue: 'SMBB Ground', result: 'UPCOMING', our_position: '-' },
  { name: 'Athletics District Meet', sport: 'Athletics', date: 'Jul 5, 2026', venue: 'Athletic Complex', result: 'UPCOMING', our_position: '-' },
  { name: 'Inter-School Table Tennis', sport: 'Table Tennis', date: 'May 20, 2026', venue: 'City Sports Club', result: 'COMPLETED', our_position: '1st' },
  { name: 'National Cricket League (Jr)', sport: 'Cricket', date: 'Apr 10, 2026', venue: 'PSB Ground', result: 'COMPLETED', our_position: '3rd' },
];

const ATHLETES = [
  { name: 'Ahmed Ali', class: '10-A', sport: 'Table Tennis', level: 'National', achievements: ['National Junior Champion 2025'], coach: 'Mrs. Sara Khan' },
  { name: 'Bilal Shah', class: '11-A', sport: 'Cricket', level: 'District', achievements: ['Best Bowler — District League'], coach: 'Mr. Omar Qureshi' },
  { name: 'Sara Qureshi', class: '9-B', sport: 'Athletics', level: 'Regional', achievements: ['100m Sprint — Gold'], coach: 'Mr. Ahmed Raza' },
  { name: 'Ibrahim Khan', class: '12-A', sport: 'Football', level: 'District', achievements: ['Top Scorer — City Cup'], coach: 'Mr. Kamran Shah' },
];

export default function SportsPage() {
  const [view, setView] = useState<'overview' | 'teams' | 'competitions' | 'athletes'>('overview');
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState<typeof SPORTS[0] | null>(null);

  const totalPlayers = SPORTS.reduce((a, s) => a + s.players, 0);
  const totalTrophies = SPORTS.reduce((a, s) => a + s.achievements.length, 0);

  return (
    <>
      <Topbar title="Sports" subtitle="Teams, competitions & athletic excellence" />
      <div className="p-6">
        <PageHeader title="Sports Management" subtitle={`${SPORTS.length} sports programs · ${totalPlayers} student athletes`}
          action={<button onClick={() => setAddModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Sport</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Sports Programs', value: SPORTS.length, icon: '🏅', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Student Athletes', value: totalPlayers, icon: '🏃', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Trophies Won', value: totalTrophies, icon: '🏆', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Competitions (Jun)', value: COMPETITIONS.filter(c => c.result === 'UPCOMING').length, icon: '🎯', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['overview', 'teams', 'competitions', 'athletes'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'athletes' ? 'Star Athletes' : v}
            </button>
          ))}
        </div>

        {/* Overview */}
        {view === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Sports at a Glance</h3>
              {SPORTS.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.icon}</span>
                    <div><p className="text-sm font-medium text-gray-800">{s.name}</p><p className="text-xs text-gray-400">Coach: {s.coach}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">{s.players} players</p>
                    {s.achievements.length > 0 && <p className="text-xs text-yellow-600">🏆 {s.achievements.length} award(s)</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3">Upcoming Competitions</h3>
                {COMPETITIONS.filter(c => c.result === 'UPCOMING').map(c => (
                  <div key={c.name} className="border border-blue-100 bg-blue-50 rounded-lg p-3 mb-2">
                    <p className="font-medium text-sm text-blue-800">{c.name}</p>
                    <p className="text-xs text-blue-600">{c.sport} · {c.date}</p>
                    <p className="text-xs text-gray-500">📍 {c.venue}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3">Recent Achievements</h3>
                {SPORTS.flatMap(s => s.achievements.slice(0, 1).map(a => ({ sport: s.name, icon: s.icon, achievement: a }))).slice(0, 5).map(a => (
                  <div key={a.achievement} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span>{a.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{a.achievement}</p>
                      <p className="text-xs text-gray-400">{a.sport}</p>
                    </div>
                    <span className="ml-auto text-yellow-500">🏆</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teams */}
        {view === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPORTS.map(sport => (
              <div key={sport.id} onClick={() => setDetailModal(sport)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{sport.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800">{sport.name}</p>
                    <p className="text-xs text-gray-400">{sport.category}</p>
                  </div>
                  <div className="ml-auto">{sport.achievements.length > 0 && <span className="text-yellow-500">🏆</span>}</div>
                </div>
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  <p>👨‍🏫 {sport.coach}</p>
                  <p>📅 {sport.practiceDay} at {sport.practiceTime}</p>
                  <p>📍 {sport.facility}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">{sport.players} members</span>
                  <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg">Manage Team</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Competitions */}
        {view === 'competitions' && (
          <div className="space-y-3">
            {COMPETITIONS.map(c => (
              <div key={c.name} className={`bg-white rounded-xl border shadow-sm p-4 ${c.result === 'UPCOMING' ? 'border-blue-100' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.sport} · 📅 {c.date} · 📍 {c.venue}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.result === 'COMPLETED' && c.our_position !== '-' && <span className="text-sm font-bold text-yellow-600">🏆 {c.our_position} Place</span>}
                    <Badge variant={c.result === 'UPCOMING' ? 'blue' : 'green'}>{c.result}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Athletes */}
        {view === 'athletes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ATHLETES.map(a => (
              <div key={a.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-xl">⭐</div>
                  <div>
                    <p className="font-bold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.class} · {a.sport}</p>
                  </div>
                  <Badge variant={a.level === 'National' ? 'red' : a.level === 'Regional' ? 'orange' : 'blue'}>{a.level}</Badge>
                </div>
                <div className="space-y-1">
                  {a.achievements.map(ach => <p key={ach} className="text-xs text-gray-600">🏆 {ach}</p>)}
                </div>
                <p className="text-xs text-gray-400 mt-2">Coach: {a.coach}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name || ''}>
        {detailModal && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{detailModal.icon}</span>
              <div><h3 className="font-bold text-lg">{detailModal.name}</h3><p className="text-sm text-gray-500">{detailModal.category} · Coach: {detailModal.coach}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Players</p><p className="text-xl font-bold text-green-600">{detailModal.players}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400">Facility</p><p className="font-medium">{detailModal.facility}</p></div>
              <div className="bg-gray-50 rounded-lg p-3 col-span-2"><p className="text-xs text-gray-400 mb-1">Practice Schedule</p><p className="font-medium">{detailModal.practiceDay} at {detailModal.practiceTime}</p></div>
            </div>
            {detailModal.achievements.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-bold text-yellow-800 mb-2">🏆 Achievements</p>
                {detailModal.achievements.map(a => <p key={a} className="text-sm text-yellow-700">• {a}</p>)}
              </div>
            )}
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">View Members</button>
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">Add Competition</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Sport Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Sport Program">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Sport Name</label>
            <input type="text" placeholder="e.g. Hockey" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Team Sport</option><option>Individual</option><option>Racket Sport</option><option>Water Sport</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Coach</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Select coach...</option>
              <option>Mr. Omar Qureshi</option><option>Mr. Kamran Shah</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Practice Days</label>
              <input type="text" placeholder="e.g. Mon & Wed" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Facility</label>
              <input type="text" placeholder="e.g. School Ground" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg">Create Sport Program</button>
        </div>
      </Modal>
    </>
  );
}
