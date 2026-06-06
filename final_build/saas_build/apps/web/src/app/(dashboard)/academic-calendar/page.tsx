'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EVENTS: Array<{ id: number; title: string; date: string; endDate?: string; type: string; description: string; category: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'MEETING' | 'ACADEMIC' }> = [
  { id: 1, title: 'Academic Year Begins', date: '2026-04-01', type: 'ACADEMIC', description: 'Start of academic year 2026-27', category: 'ACADEMIC' },
  { id: 2, title: 'Mid-Term Exams (Primary)', date: '2026-06-05', endDate: '2026-06-10', type: 'EXAM', description: 'Mid-term examinations for Classes 1-5', category: 'EXAM' },
  { id: 3, title: 'Mid-Term Exams (Secondary)', date: '2026-06-08', endDate: '2026-06-14', type: 'EXAM', description: 'Mid-term examinations for Classes 6-12', category: 'EXAM' },
  { id: 4, title: 'Eid ul-Adha Holiday', date: '2026-06-16', endDate: '2026-06-18', type: 'HOLIDAY', description: 'School closed for Eid ul-Adha', category: 'HOLIDAY' },
  { id: 5, title: 'Parent-Teacher Meeting', date: '2026-06-20', type: 'MEETING', description: 'Annual PTM for all classes', category: 'MEETING' },
  { id: 6, title: 'Sports Day', date: '2026-06-25', type: 'EVENT', description: 'Annual sports day celebrations', category: 'EVENT' },
  { id: 7, title: 'Summer Vacations Begin', date: '2026-07-01', endDate: '2026-08-15', type: 'HOLIDAY', description: 'Summer vacation period', category: 'HOLIDAY' },
  { id: 8, title: 'School Reopens', date: '2026-08-16', type: 'ACADEMIC', description: 'School reopens after summer vacations', category: 'ACADEMIC' },
  { id: 9, title: 'Annual Exams Begin', date: '2026-10-01', endDate: '2026-10-20', type: 'EXAM', description: 'Annual final examinations', category: 'EXAM' },
  { id: 10, title: 'Result Day', date: '2026-11-01', type: 'ACADEMIC', description: 'Annual examination results', category: 'ACADEMIC' },
  { id: 11, title: 'Annual Prize Giving', date: '2026-11-15', type: 'EVENT', description: 'Annual prize distribution ceremony', category: 'EVENT' },
  { id: 12, title: 'Winter Vacations', date: '2026-12-20', endDate: '2027-01-05', type: 'HOLIDAY', description: 'Winter vacation period', category: 'HOLIDAY' },
  { id: 13, title: 'Independence Day', date: '2026-08-14', type: 'HOLIDAY', description: 'Pakistan Independence Day — school celebration', category: 'HOLIDAY' },
  { id: 14, title: 'Quaid-e-Azam Day', date: '2026-12-25', type: 'HOLIDAY', description: 'National holiday', category: 'HOLIDAY' },
  { id: 15, title: 'Science Fair', date: '2026-09-15', type: 'EVENT', description: 'Annual inter-school science fair', category: 'EVENT' },
  { id: 16, title: 'Staff Training Day', date: '2026-08-17', type: 'MEETING', description: 'Mandatory staff professional development', category: 'MEETING' },
  { id: 17, title: 'Board Meeting (Annual)', date: '2026-09-01', type: 'MEETING', description: 'Annual board of governors meeting', category: 'MEETING' },
  { id: 18, title: 'Arts & Culture Festival', date: '2026-10-25', type: 'EVENT', description: 'Annual cultural festival', category: 'EVENT' },
];

const CAT_COLOR: Record<string, string> = {
  HOLIDAY: 'red', EXAM: 'orange', EVENT: 'blue', MEETING: 'purple', ACADEMIC: 'green',
};
const CAT_BG: Record<string, string> = {
  HOLIDAY: 'bg-red-100 border-red-200', EXAM: 'bg-orange-100 border-orange-200', EVENT: 'bg-blue-100 border-blue-200', MEETING: 'bg-purple-100 border-purple-200', ACADEMIC: 'bg-green-100 border-green-200',
};

export default function AcademicCalendarPage() {
  const [view, setView] = useState<'list' | 'month' | 'term'>('list');
  const [filter, setFilter] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null);
  const [currentMonth, setCurrentMonth] = useState(5);

  const filtered = EVENTS.filter(e => !filter || e.category === filter).sort((a, b) => a.date.localeCompare(b.date));
  const monthEvents = EVENTS.filter(e => new Date(e.date).getMonth() === currentMonth);

  const terms = [
    { name: 'Term 1 (Spring)', dates: 'Apr 1 — Jun 30, 2026', weeks: 13, workingDays: 78, holidays: 3 },
    { name: 'Term 2 (Autumn)', dates: 'Aug 16 — Nov 15, 2026', weeks: 13, workingDays: 80, holidays: 4 },
    { name: 'Term 3 (Winter)', dates: 'Nov 16 — Dec 19, 2026', weeks: 5, workingDays: 25, holidays: 2 },
  ];

  return (
    <>
      <Topbar title="Academic Calendar" subtitle="School events, exams & holiday planner" />
      <div className="p-6">
        <PageHeader title="Academic Calendar 2026–27" subtitle={`${EVENTS.length} events planned`}
          action={
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⬇ Export PDF</button>
              <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Event</button>
            </div>
          }
        />

        {/* Category Legend */}
        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${!filter ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>All</button>
          {Object.entries({ ACADEMIC: 'Academic', EXAM: 'Exams', HOLIDAY: 'Holidays', EVENT: 'Events', MEETING: 'Meetings' }).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(filter === k ? '' : k)} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${filter === k ? `${CAT_BG[k]} border-current` : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              ● {v}
            </button>
          ))}
        </div>

        {/* Views */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['list', 'month', 'term'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'month' ? 'Month View' : v === 'term' ? 'Term Overview' : 'All Events'}
            </button>
          ))}
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-2">
            {filtered.map(e => (
              <div key={e.id} onClick={() => setSelectedEvent(e)} className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${CAT_BG[e.category]}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={CAT_COLOR[e.category] as any}>{e.category}</Badge>
                    <p className="font-bold text-sm text-gray-800">{e.title}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{new Date(e.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {e.endDate && <p>→ {new Date(e.endDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-0">{e.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Month View */}
        {view === 'month' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">← Prev</button>
              <h3 className="font-bold text-gray-800">{MONTHS[currentMonth]} 2026</h3>
              <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Next →</button>
            </div>
            {monthEvents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">No events in {MONTHS[currentMonth]}</div>
            ) : (
              <div className="space-y-3">
                {monthEvents.sort((a, b) => a.date.localeCompare(b.date)).map(e => (
                  <div key={e.id} className={`border rounded-xl p-4 ${CAT_BG[e.category]}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[48px]">
                        <p className="text-2xl font-bold text-gray-800">{new Date(e.date).getDate()}</p>
                        <p className="text-xs text-gray-400">{MONTHS[currentMonth].slice(0, 3)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{e.title}</p>
                        <p className="text-xs text-gray-500">{e.description}</p>
                        {e.endDate && <p className="text-xs text-gray-400">Ends: {new Date(e.endDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>}
                      </div>
                      <div className="ml-auto"><Badge variant={CAT_COLOR[e.category] as any}>{e.category}</Badge></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Term Overview */}
        {view === 'term' && (
          <div className="space-y-4">
            {terms.map(t => (
              <div key={t.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">{t.name}</h3>
                  <Badge variant="blue">{t.dates}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{t.weeks}</p>
                    <p className="text-xs text-gray-500">Weeks</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{t.workingDays}</p>
                    <p className="text-xs text-gray-500">Working Days</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{t.holidays}</p>
                    <p className="text-xs text-gray-500">Public Holidays</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold text-gray-600 mb-2">Events This Term:</p>
                  <div className="flex flex-wrap gap-2">
                    {EVENTS.filter(e => {
                      const d = new Date(e.date);
                      if (t.name.includes('Spring')) return d >= new Date('2026-04-01') && d <= new Date('2026-06-30');
                      if (t.name.includes('Autumn')) return d >= new Date('2026-08-16') && d <= new Date('2026-11-15');
                      return d >= new Date('2026-11-16') && d <= new Date('2026-12-19');
                    }).map(e => (
                      <span key={e.id} className={`text-xs px-2 py-1 rounded-full border ${CAT_BG[e.category]}`}>{e.title}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Calendar Event">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Event Title</label>
            <input type="text" placeholder="e.g. Sports Day 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>ACADEMIC</option><option>EXAM</option><option>HOLIDAY</option><option>EVENT</option><option>MEETING</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Start Date</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">End Date (optional)</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Event details..." />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" />Notify all parents</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" />Notify all staff</label>
          </div>
          <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">Add to Calendar</button>
        </div>
      </Modal>

      {/* Event Detail Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details">
        {selectedEvent && (
          <div className="p-6">
            <div className={`${CAT_BG[selectedEvent.category]} border rounded-xl p-4 mb-4`}>
              <Badge variant={CAT_COLOR[selectedEvent.category] as any}>{selectedEvent.category}</Badge>
              <h3 className="font-bold text-lg text-gray-900 mt-2">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
              <div className="mt-3 text-sm">
                <p className="text-gray-500">📅 {new Date(selectedEvent.date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {selectedEvent.endDate && <p className="text-gray-500">→ {new Date(selectedEvent.endDate).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg">Edit Event</button>
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">Send Notification</button>
              <button className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
