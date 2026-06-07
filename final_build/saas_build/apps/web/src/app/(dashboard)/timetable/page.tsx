'use client';
import React, { useState } from 'react';
import { useSections, useTimetable } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Modal } from '../../../components/shared/modal';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const PERIODS = ['08:00','08:45','09:30','10:15','11:15','12:00','12:45','13:30','14:15'];
const COLORS = ['bg-blue-100 text-blue-800 border-blue-200','bg-green-100 text-green-800 border-green-200','bg-purple-100 text-purple-800 border-purple-200','bg-yellow-100 text-yellow-800 border-yellow-200','bg-red-100 text-red-800 border-red-200','bg-indigo-100 text-indigo-800 border-indigo-200','bg-pink-100 text-pink-800 border-pink-200','bg-teal-100 text-teal-800 border-teal-200'];

const DEFAULT_SUBJECTS = ['Mathematics','English','Science','Urdu','Social Studies','Islamiyat','Computer','Physics','Chemistry','Biology','History'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function generateTimetable(subjects: string[], days: string[], periods: string[]) {
  const result: Record<string, Record<string, { subject: string; room: string }>> = {};
  const shuffled = [...subjects].sort(() => Math.random() - 0.5);
  days.forEach((day, dIdx) => {
    result[day] = {};
    periods.forEach((period, pIdx) => {
      const subjectIdx = (dIdx * periods.length + pIdx) % shuffled.length;
      result[day][period] = {
        subject: shuffled[subjectIdx],
        room: `Room ${100 + Math.floor(Math.random() * 20)}`,
      };
    });
  });
  return result;
}

export default function TimetablePage() {
  const [selectedSection, setSelectedSection] = useState('');
  const [autoModal, setAutoModal] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState<Record<string, Record<string, { subject: string; room: string }>> | null>(null);
  const [genSubjects, setGenSubjects] = useState(DEFAULT_SUBJECTS.slice(0, 7).join(', '));
  const [periodsPerDay, setPeriodsPerDay] = useState(8);
  const [workingDays, setWorkingDays] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: sections } = useSections();
  const { data: timetableSlots, isLoading } = useTimetable(selectedSection);

  const sectionList: any[] = Array.isArray(sections) ? sections : [];
  const slots: any[] = Array.isArray(timetableSlots) ? timetableSlots : [];

  const subjectColors: Record<string, string> = {};
  let colorIdx = 0;
  slots.forEach(slot => {
    const name = slot.subject?.name ?? slot.subjectName ?? 'Unknown';
    if (!subjectColors[name]) { subjectColors[name] = COLORS[colorIdx % COLORS.length]; colorIdx++; }
  });

  if (generatedTimetable) {
    const genSubjectList = genSubjects.split(',').map(s => s.trim()).filter(Boolean);
    genSubjectList.forEach(name => {
      if (!subjectColors[name]) { subjectColors[name] = COLORS[colorIdx % COLORS.length]; colorIdx++; }
    });
  }

  const getSlot = (day: string, period: string) =>
    slots.find(s => s.day?.toUpperCase() === day.toUpperCase() && s.startTime?.startsWith(period));

  const selectedSec = sectionList.find(s => s.id === selectedSection);

  const activeDays = DAYS.slice(0, workingDays);
  const activePeriods = PERIODS.slice(0, periodsPerDay);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1000));
    const subjects = genSubjects.split(',').map(s => s.trim()).filter(Boolean);
    const tt = generateTimetable(subjects, activeDays, activePeriods);
    setGeneratedTimetable(tt);
    setIsGenerating(false);
    setAutoModal(false);
  };

  const displaySlots = generatedTimetable
    ? activeDays.reduce((arr, day) =>
        [...arr, ...activePeriods.map(period => ({ day, startTime: period, ...generatedTimetable[day]?.[period] }))], [] as any[])
    : slots;

  const hasData = generatedTimetable ? true : slots.length > 0;

  return (
    <>
      <Topbar title="Timetable" subtitle="Weekly class schedule" />
      <div className="p-6">
        <PageHeader
          title="Class Timetable"
          action={
            <button
              onClick={() => setAutoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500"
            >
              Auto-Generate Timetable
            </button>
          }
        />

        <div className="flex gap-3 mb-6">
          <select value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setGeneratedTimetable(null); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[220px]">
            <option value="">Select Class & Section</option>
            {sectionList.map((s: any) => <option key={s.id} value={s.id}>{s.class?.name} — Section {s.name}</option>)}
          </select>
          {selectedSec && (
            <span className="self-center text-sm text-gray-500 font-medium">
              {selectedSec.class?.name} · Section {selectedSec.name} · {selectedSec._count?.students ?? 0} students
            </span>
          )}
          {generatedTimetable && (
            <div className="flex items-center gap-2 self-center">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">Auto-Generated Preview</span>
              <button onClick={() => setGeneratedTimetable(null)} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
          )}
        </div>

        {!selectedSection && !generatedTimetable ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-3">🗓️</p>
            <p className="text-gray-500 font-medium">Select a class section to view its timetable</p>
            <p className="text-gray-400 text-sm mt-2">or use the <span className="font-bold text-blue-600">Auto-Generate</span> button to create a timetable instantly</p>
          </div>
        ) : isLoading && !generatedTimetable ? (
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        ) : !hasData ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-gray-500 font-medium">No timetable configured for this section</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">Use the Auto-Generate button to create one instantly</p>
            <button onClick={() => setAutoModal(true)} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500">
              Auto-Generate Timetable
            </button>
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(subjectColors).map(([name, cls]) => (
                <span key={name} className={`text-xs font-bold px-2 py-1 rounded-md border ${cls}`}>{name}</span>
              ))}
            </div>

            {/* Timetable Grid */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase w-24">Time</th>
                      {(generatedTimetable ? activeDays : DAYS).map(d => (
                        <th key={d} className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase">{d.slice(0,3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(generatedTimetable ? activePeriods : PERIODS).map((period, idx) => (
                      <tr key={period} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                        <td className="px-3 py-2.5 text-xs font-mono text-gray-400 whitespace-nowrap">
                          <div>{formatTime(period)}</div>
                          {idx < (generatedTimetable ? activePeriods : PERIODS).length - 1 && <div className="text-gray-300">↓ {formatTime((generatedTimetable ? activePeriods : PERIODS)[idx+1])}</div>}
                        </td>
                        {(generatedTimetable ? activeDays : DAYS).map(day => {
                          if (generatedTimetable) {
                            const cell = generatedTimetable[day]?.[period];
                            if (!cell) return <td key={day} className="px-2 py-2 text-center"><span className="text-gray-200 text-xs">—</span></td>;
                            const colorCls = subjectColors[cell.subject] ?? COLORS[0];
                            return (
                              <td key={day} className="px-2 py-2">
                                <div className={`rounded-lg border px-2 py-1.5 text-center ${colorCls}`}>
                                  <p className="text-xs font-bold leading-tight">{cell.subject}</p>
                                  <p className="text-[10px] opacity-60">{cell.room}</p>
                                </div>
                              </td>
                            );
                          }
                          const slot = slots.find(s => s.day?.toUpperCase() === day.toUpperCase() && s.startTime?.startsWith(period));
                          if (!slot) return <td key={day} className="px-2 py-2 text-center"><span className="text-gray-200 text-xs">—</span></td>;
                          const name = slot.subject?.name ?? slot.subjectName ?? 'Unknown';
                          const colorCls = subjectColors[name] ?? COLORS[0];
                          return (
                            <td key={day} className="px-2 py-2">
                              <div className={`rounded-lg border px-2 py-1.5 text-center ${colorCls}`}>
                                <p className="text-xs font-bold leading-tight">{name}</p>
                                {slot.teacher && <p className="text-[10px] opacity-75 leading-tight mt-0.5">{slot.teacher?.user?.profile?.firstName} {slot.teacher?.user?.profile?.lastName?.charAt(0)}.</p>}
                                {slot.room && <p className="text-[10px] opacity-60">{slot.room}</p>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {generatedTimetable && (
              <div className="mt-4 flex items-center gap-3 justify-end">
                <p className="text-xs text-gray-400">This is a preview. Save to apply to the selected section.</p>
                <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">Print</button>
                <button className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">
                  Save Timetable
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={autoModal} onClose={() => setAutoModal(false)} title="Auto-Generate Timetable">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            The auto-generator creates a balanced weekly timetable ensuring each subject appears evenly across all days.
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section (optional)</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Preview only (no section)</option>
              {sectionList.map((s: any) => <option key={s.id} value={s.id}>{s.class?.name} — Section {s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subjects (comma-separated)</label>
            <textarea rows={3} value={genSubjects} onChange={e => setGenSubjects(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Periods Per Day</label>
              <select value={periodsPerDay} onChange={e => setPeriodsPerDay(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {[6,7,8,9].map(n => <option key={n} value={n}>{n} periods</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Working Days</label>
              <select value={workingDays} onChange={e => setWorkingDays(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value={5}>Mon-Fri (5 days)</option>
                <option value={6}>Mon-Sat (6 days)</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <p className="font-bold text-gray-700">Preview:</p>
            <p>{genSubjects.split(',').filter(s=>s.trim()).length} subjects · {periodsPerDay} periods/day · {workingDays} days/week = {periodsPerDay * workingDays} total slots</p>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !genSubjects.trim()}
            className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50">
            {isGenerating ? 'Generating...' : 'Generate Timetable'}
          </button>
        </div>
      </Modal>
    </>
  );
}
