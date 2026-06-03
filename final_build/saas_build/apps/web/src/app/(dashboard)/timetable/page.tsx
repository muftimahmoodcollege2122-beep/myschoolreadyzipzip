'use client';
import React, { useState } from 'react';
import { useClasses, useSections, useTimetable } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const PERIODS = ['08:00','08:45','09:30','10:15','11:15','12:00','12:45','13:30','14:15'];
const COLORS = ['bg-blue-100 text-blue-800 border-blue-200','bg-green-100 text-green-800 border-green-200','bg-purple-100 text-purple-800 border-purple-200','bg-yellow-100 text-yellow-800 border-yellow-200','bg-red-100 text-red-800 border-red-200','bg-indigo-100 text-indigo-800 border-indigo-200','bg-pink-100 text-pink-800 border-pink-200'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function TimetablePage() {
  const [selectedSection, setSelectedSection] = useState('');
  const { data: sections } = useSections();
  const { data: timetableSlots, isLoading } = useTimetable(selectedSection);

  const sectionList: any[] = Array.isArray(sections) ? sections : [];
  const slots: any[] = Array.isArray(timetableSlots) ? timetableSlots : [];

  // Map subject names to consistent colors
  const subjectColors: Record<string, string> = {};
  let colorIdx = 0;
  slots.forEach(slot => {
    const name = slot.subject?.name ?? slot.subjectName ?? 'Unknown';
    if (!subjectColors[name]) { subjectColors[name] = COLORS[colorIdx % COLORS.length]; colorIdx++; }
  });

  const getSlot = (day: string, period: string) =>
    slots.find(s => s.day?.toUpperCase() === day.toUpperCase() && s.startTime?.startsWith(period));

  const selectedSec = sectionList.find(s => s.id === selectedSection);

  return (
    <>
      <Topbar title="Timetable" subtitle="Weekly class schedule" />
      <div className="p-6">
        <PageHeader title="Class Timetable" />

        <div className="flex gap-3 mb-6">
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[220px]">
            <option value="">Select Class & Section</option>
            {sectionList.map((s: any) => <option key={s.id} value={s.id}>{s.class?.name} — Section {s.name}</option>)}
          </select>
          {selectedSec && (
            <span className="self-center text-sm text-gray-500 font-medium">
              {selectedSec.class?.name} · Section {selectedSec.name} · {selectedSec._count?.students ?? 0} students
            </span>
          )}
        </div>

        {!selectedSection ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-3">🗓️</p>
            <p className="text-gray-500 font-medium">Select a class section to view its timetable</p>
          </div>
        ) : isLoading ? (
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        ) : slots.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-gray-500 font-medium">No timetable configured for this section</p>
            <p className="text-gray-400 text-sm mt-1">Timetable slots will appear here once added via the API</p>
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
                      {DAYS.map(d => <th key={d} className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase">{d.slice(0,3)}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {PERIODS.map((period, idx) => (
                      <tr key={period} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                        <td className="px-3 py-2.5 text-xs font-mono text-gray-400 whitespace-nowrap">
                          <div>{formatTime(period)}</div>
                          {idx < PERIODS.length - 1 && <div className="text-gray-300">↓ {formatTime(PERIODS[idx+1])}</div>}
                        </td>
                        {DAYS.map(day => {
                          const slot = getSlot(day, period);
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
          </>
        )}
      </div>
    </>
  );
}
