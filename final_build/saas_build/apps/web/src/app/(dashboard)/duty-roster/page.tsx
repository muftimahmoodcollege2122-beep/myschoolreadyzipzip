'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DUTY_TYPES = ['Gate Duty', 'Canteen Supervision', 'Corridor Patrol', 'Library Duty', 'Assembly Duty', 'Exam Invigilation', 'Sports Supervision', 'Staff Room'];

const ROSTER: Record<string, { teacher: string; duty: string; time: string; location: string }[]> = {
  Monday: [
    { teacher: 'Mr. Ahmed Malik', duty: 'Gate Duty', time: '7:30–8:30 AM', location: 'Main Gate' },
    { teacher: 'Mrs. Sara Khan', duty: 'Assembly Duty', time: '8:00–8:30 AM', location: 'Assembly Hall' },
    { teacher: 'Dr. Fatima Shah', duty: 'Canteen Supervision', time: '12:30–1:30 PM', location: 'Canteen' },
    { teacher: 'Mr. Omar Qureshi', duty: 'Sports Supervision', time: '2:30–4:00 PM', location: 'School Ground' },
  ],
  Tuesday: [
    { teacher: 'Mrs. Nadia Rehman', duty: 'Gate Duty', time: '7:30–8:30 AM', location: 'Main Gate' },
    { teacher: 'Mr. Ibrahim Ali', duty: 'Corridor Patrol', time: '10:00–10:30 AM', location: 'Block A & B' },
    { teacher: 'Mrs. Rukhsana Malik', duty: 'Library Duty', time: '1:00–3:00 PM', location: 'Library' },
    { teacher: 'Mr. Bilal Hassan', duty: 'Canteen Supervision', time: '12:30–1:30 PM', location: 'Canteen' },
  ],
  Wednesday: [
    { teacher: 'Dr. Fatima Shah', duty: 'Gate Duty', time: '7:30–8:30 AM', location: 'Main Gate' },
    { teacher: 'Mr. Ahmed Malik', duty: 'Assembly Duty', time: '8:00–8:30 AM', location: 'Assembly Hall' },
    { teacher: 'Mrs. Sara Khan', duty: 'Corridor Patrol', time: '11:00–11:30 AM', location: 'All Blocks' },
    { teacher: 'Mr. Omar Qureshi', duty: 'Canteen Supervision', time: '12:30–1:30 PM', location: 'Canteen' },
  ],
  Thursday: [
    { teacher: 'Mr. Ibrahim Ali', duty: 'Gate Duty', time: '7:30–8:30 AM', location: 'Main Gate' },
    { teacher: 'Mrs. Nadia Rehman', duty: 'Library Duty', time: '11:00 AM–1:00 PM', location: 'Library' },
    { teacher: 'Mr. Bilal Hassan', duty: 'Corridor Patrol', time: '10:00–10:30 AM', location: 'Block C & D' },
    { teacher: 'Mrs. Rukhsana Malik', duty: 'Sports Supervision', time: '2:30–4:00 PM', location: 'Sports Ground' },
  ],
  Friday: [
    { teacher: 'Mr. Ahmed Malik', duty: 'Gate Duty', time: '7:30–8:30 AM', location: 'Main Gate' },
    { teacher: 'Dr. Fatima Shah', duty: 'Assembly Duty', time: '1:00–2:00 PM', location: 'Assembly Hall (Jummah)' },
    { teacher: 'Mrs. Sara Khan', duty: 'Canteen Supervision', time: '12:00–1:00 PM', location: 'Canteen' },
  ],
  Saturday: [
    { teacher: 'Mr. Omar Qureshi', duty: 'Gate Duty', time: '8:00–9:00 AM', location: 'Main Gate' },
    { teacher: 'Mrs. Nadia Rehman', duty: 'Sports Supervision', time: '9:00 AM–12:00 PM', location: 'Ground' },
  ],
};

const TEACHERS = ['Mr. Ahmed Malik', 'Mrs. Sara Khan', 'Dr. Fatima Shah', 'Mr. Omar Qureshi', 'Mrs. Nadia Rehman', 'Mr. Ibrahim Ali', 'Mr. Bilal Hassan', 'Mrs. Rukhsana Malik'];

export default function DutyRosterPage() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [view, setView] = useState<'weekly' | 'teacher' | 'substitution'>('weekly');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [subModal, setSubModal] = useState(false);

  const teacherDuties = TEACHERS.map(t => ({
    teacher: t,
    duties: Object.entries(ROSTER).flatMap(([day, duties]) => duties.filter(d => d.teacher === t).map(d => ({ ...d, day }))),
  }));

  const weeklyCount = (t: string) => teacherDuties.find(td => td.teacher === t)?.duties.length || 0;

  return (
    <>
      <Topbar title="Duty Roster" subtitle="Weekly staff duty assignments & supervision schedule" />
      <div className="p-6">
        <PageHeader title="Staff Duty Roster" subtitle="Week of June 9–14, 2026"
          action={
            <div className="flex gap-2">
              <button onClick={() => setSubModal(true)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⇄ Substitution</button>
              <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Assign Duty</button>
            </div>
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['weekly', 'teacher', 'substitution'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'teacher' ? 'By Teacher' : v === 'substitution' ? 'Substitutions' : 'Weekly View'}
            </button>
          ))}
        </div>

        {/* Weekly View */}
        {view === 'weekly' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {DAYS.map(d => (
                <button key={d} onClick={() => setSelectedDay(d)}
                  className={`px-4 py-2 text-sm rounded-xl border transition-all ${selectedDay === d ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                  {d}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">{selectedDay} Duties</h3>
                <p className="text-xs text-gray-400">{ROSTER[selectedDay]?.length || 0} assignments</p>
              </div>
              <div className="p-4 space-y-3">
                {(ROSTER[selectedDay] || []).map((duty, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                          {duty.teacher.split(' ').pop()![0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{duty.teacher}</p>
                          <p className="text-xs text-gray-400">{duty.duty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">{duty.time}</p>
                        <p className="text-xs text-gray-400">📍 {duty.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Edit</button>
                      <button className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100">Substitute</button>
                      <button className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Remove</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setAddModal(true)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-green-300 hover:text-green-600 text-sm">
                  + Add {selectedDay} Duty
                </button>
              </div>
            </div>
          </div>
        )}

        {/* By Teacher */}
        {view === 'teacher' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {TEACHERS.slice(0, 4).map(t => (
                <div key={t} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 mx-auto mb-2">{t.split(' ').pop()![0]}</div>
                  <p className="text-xs font-medium text-gray-700 truncate">{t}</p>
                  <p className="text-sm font-bold text-green-600">{weeklyCount(t)} duties</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
              <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select teacher to view duties...</option>
                {TEACHERS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {selectedTeacher && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">Weekly Duties: {selectedTeacher}</h3>
                </div>
                <div className="p-4 space-y-2">
                  {teacherDuties.find(td => td.teacher === selectedTeacher)?.duties.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div><p className="text-sm font-medium text-gray-800">{d.duty}</p><p className="text-xs text-gray-400">{d.day} · {d.time}</p></div>
                      <p className="text-xs text-gray-500">📍 {d.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Substitutions */}
        {view === 'substitution' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Substitution Requests</h3>
              <button onClick={() => setSubModal(true)} className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg">+ New Request</button>
            </div>
            <div className="text-center py-12 text-gray-300">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-sm">No pending substitution requests this week</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Duty Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Assign Duty">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Teacher</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {TEACHERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Duty Type</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {DUTY_TYPES.map(dt => <option key={dt}>{dt}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Day</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Start Time</label>
              <input type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">End Time</label>
              <input type="time" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Location</label>
            <input type="text" placeholder="e.g. Main Gate" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg">Assign Duty</button>
        </div>
      </Modal>

      {/* Substitution Modal */}
      <Modal isOpen={subModal} onClose={() => setSubModal(false)} title="Request Substitution">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Absent Teacher</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {TEACHERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Date of Absence</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Substitute Teacher</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Auto-assign (system)</option>
              {TEACHERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Reason</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Sick Leave</option><option>Emergency</option><option>Training</option><option>Personal</option>
            </select>
          </div>
          <button className="w-full py-2 bg-orange-600 text-white text-sm rounded-lg">Submit Request</button>
        </div>
      </Modal>
    </>
  );
}
