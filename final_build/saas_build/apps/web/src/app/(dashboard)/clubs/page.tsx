'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const CLUBS = [
  { id: 1, name: 'Science Club', icon: '🔬', category: 'Academic', teacher: 'Dr. Fatima Shah', members: 32, maxMembers: 40, meetDay: 'Thursday', meetTime: '2:00 PM', room: 'Lab-1', description: 'Experiments, science fairs & STEM projects', achievements: ['1st Place — Inter-School Science Fair 2025', 'Best Project Award — Regional STEM Exhibition'], active: true },
  { id: 2, name: 'Debate Society', icon: '🎤', category: 'Literary', teacher: 'Mrs. Sara Khan', members: 28, maxMembers: 35, meetDay: 'Tuesday', meetTime: '3:00 PM', room: 'Hall-B', description: 'Public speaking, debates & MUN', achievements: ['National Debate Championship 2025 — Runners Up'], active: true },
  { id: 3, name: 'Coding Club', icon: '💻', category: 'Technology', teacher: 'Mr. Ibrahim Ali', members: 25, maxMembers: 30, meetDay: 'Wednesday', meetTime: '1:30 PM', room: 'Computer Lab', description: 'Programming, web dev & app development', achievements: ['App Development Hackathon — 2nd Place'], active: true },
  { id: 4, name: 'Art & Craft Club', icon: '🎨', category: 'Arts', teacher: 'Mrs. Nadia Rehman', members: 35, maxMembers: 40, meetDay: 'Friday', meetTime: '2:30 PM', room: 'Art Room', description: 'Drawing, painting, ceramics & digital art', achievements: ['City Art Exhibition — 3 Gold Awards'], active: true },
  { id: 5, name: 'Math Olympiad Club', icon: '📐', category: 'Academic', teacher: 'Mr. Ahmed Malik', members: 20, maxMembers: 25, meetDay: 'Monday', meetTime: '3:30 PM', room: 'Room-201', description: 'Mathematical competitions & problem-solving', achievements: ['AMO Gold Medalist 2025'], active: true },
  { id: 6, name: 'Environmental Club', icon: '🌱', category: 'Social', teacher: 'Mr. Omar Qureshi', members: 18, maxMembers: 30, meetDay: 'Saturday', meetTime: '9:00 AM', room: 'Garden Area', description: 'Tree plantation, recycling & eco-awareness', achievements: [], active: true },
  { id: 7, name: 'Photography Club', icon: '📷', category: 'Arts', teacher: 'Ms. Zara Ali', members: 22, maxMembers: 25, meetDay: 'Thursday', meetTime: '1:00 PM', room: 'Media Room', description: 'Photography, videography & digital media', achievements: ['School Magazine Photography Award'], active: true },
  { id: 8, name: 'Drama Club', icon: '🎭', category: 'Arts', teacher: 'Mrs. Rukhsana Malik', members: 30, maxMembers: 40, meetDay: 'Wednesday', meetTime: '3:00 PM', room: 'Auditorium', description: 'Theater, storytelling & drama productions', achievements: ['Annual Drama Production — Best Performance'], active: false },
];

const ACTIVITIES = [
  { club: 'Science Club', activity: 'Chemistry Experiment — Acids & Bases', date: 'Jun 5, 2026', participants: 28, type: 'Workshop' },
  { club: 'Debate Society', activity: 'Inter-School Debate Competition', date: 'Jun 8, 2026', participants: 12, type: 'Competition' },
  { club: 'Coding Club', activity: 'Python Workshop for Beginners', date: 'Jun 10, 2026', participants: 25, type: 'Workshop' },
  { club: 'Art Club', activity: 'Watercolor Painting Session', date: 'Jun 7, 2026', participants: 35, type: 'Activity' },
  { club: 'Environmental Club', activity: 'Tree Plantation Drive', date: 'Jun 15, 2026', participants: 18, type: 'Drive' },
];

export default function ClubsPage() {
  const [view, setView] = useState<'clubs' | 'activities' | 'members'>('clubs');
  const [filter, setFilter] = useState('All');
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState<typeof CLUBS[0] | null>(null);

  const categories = ['All', 'Academic', 'Literary', 'Technology', 'Arts', 'Social'];
  const filtered = CLUBS.filter(c => filter === 'All' || c.category === filter);
  const totalMembers = CLUBS.reduce((a, c) => a + c.members, 0);

  return (
    <>
      <Topbar title="Clubs & Societies" subtitle="Extra-curricular activities & student organizations" />
      <div className="p-6">
        <PageHeader title="Clubs & Societies" subtitle={`${CLUBS.length} clubs · ${totalMembers} student members`}
          action={<button onClick={() => setAddModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ New Club</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Clubs', value: CLUBS.filter(c => c.active).length, icon: '🏛️', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Members', value: totalMembers, icon: '👥', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Activities This Month', value: ACTIVITIES.length, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Awards Won (2026)', value: 8, icon: '🏆', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {(['clubs', 'activities', 'members'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'clubs' ? 'All Clubs' : v === 'activities' ? 'Upcoming Activities' : 'Members Overview'}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        {view === 'clubs' && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${filter === c ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Clubs Grid */}
        {view === 'clubs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(club => (
              <div key={club.id} onClick={() => setDetailModal(club)} className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${club.active ? 'border-gray-100 hover:border-green-300' : 'border-gray-200 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{club.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{club.name}</p>
                      <p className="text-xs text-gray-400">{club.category}</p>
                    </div>
                  </div>
                  <Badge variant={club.active ? 'green' : 'red'}>{club.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-xs text-gray-500 mb-3">{club.description}</p>
                <div className="space-y-1 text-xs text-gray-400 mb-3">
                  <p>👨‍🏫 {club.teacher}</p>
                  <p>📅 {club.meetDay} at {club.meetTime} — {club.room}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Members</span><span>{club.members}/{club.maxMembers}</span></div>
                    <div className="bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(club.members / club.maxMembers) * 100}%` }} /></div>
                  </div>
                  <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg">Details</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activities */}
        {view === 'activities' && (
          <div className="space-y-3">
            {ACTIVITIES.map(a => (
              <div key={a.activity} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[48px]">
                    <p className="text-xl font-bold text-gray-800">{new Date(a.date).getDate()}</p>
                    <p className="text-xs text-gray-400">Jun</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{a.activity}</p>
                    <p className="text-xs text-gray-400">{a.club} · {a.participants} participants</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{a.type}</Badge>
                  <button className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">Manage</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members Overview */}
        {view === 'members' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left">Club</th>
                <th className="px-4 py-3 text-left">Advisor</th>
                <th className="px-4 py-3 text-left">Members</th>
                <th className="px-4 py-3 text-left">Capacity Used</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr></thead>
              <tbody>
                {CLUBS.sort((a, b) => b.members - a.members).map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><span>{c.icon}</span><span className="font-medium">{c.name}</span></div></td>
                    <td className="px-4 py-3 text-gray-500">{c.teacher}</td>
                    <td className="px-4 py-3 font-bold">{c.members}/{c.maxMembers}</td>
                    <td className="px-4 py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(c.members / c.maxMembers) * 100}%` }} /></div>
                        <span className="text-xs text-gray-400">{Math.round((c.members / c.maxMembers) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={c.active ? 'green' : 'red'}>{c.active ? 'Active' : 'Inactive'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Club Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name || ''}>
        {detailModal && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{detailModal.icon}</span>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{detailModal.name}</h3>
                <p className="text-sm text-gray-500">{detailModal.category} · {detailModal.teacher}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{detailModal.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Meeting Schedule</p><p className="font-medium">{detailModal.meetDay}s at {detailModal.meetTime}</p><p className="text-gray-500">{detailModal.room}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Membership</p><p className="font-bold text-xl text-green-600">{detailModal.members}</p><p className="text-gray-400">of {detailModal.maxMembers} seats</p></div>
            </div>
            {detailModal.achievements.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600 mb-2">🏆 Achievements</p>
                {detailModal.achievements.map(a => <p key={a} className="text-sm text-gray-600 mb-1">• {a}</p>)}
              </div>
            )}
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">Manage Members</button>
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">Schedule Activity</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Club Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Create New Club/Society">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Club Name</label>
            <input type="text" placeholder="e.g. Robotics Club" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Faculty Advisor</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Select teacher...</option>
              <option>Dr. Fatima Shah</option><option>Mr. Ahmed Malik</option><option>Mrs. Sara Khan</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Meeting Day</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Max Members</label>
              <input type="number" placeholder="30" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Club description & objectives..." />
          </div>
          <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg">Create Club</button>
        </div>
      </Modal>
    </>
  );
}
