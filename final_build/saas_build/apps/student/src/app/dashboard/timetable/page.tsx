'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TODAY = dayjs().format('dddd').toUpperCase();

const COLORS = ['bg-violet-100 border-violet-200 text-violet-800', 'bg-blue-100 border-blue-200 text-blue-800', 'bg-teal-100 border-teal-200 text-teal-800',
  'bg-orange-100 border-orange-200 text-orange-800', 'bg-pink-100 border-pink-200 text-pink-800', 'bg-green-100 border-green-200 text-green-800'];

export default function StudentTimetablePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-timetable'],
    queryFn:  () => api.get('/timetable/mine').catch(() => []),
  });

  const slots: any[] = Array.isArray(data) ? data : [];

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = slots.filter(s => s.dayOfWeek === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, any[]>);

  const subjectColorMap: Record<string, string> = {};
  let colorIdx = 0;
  slots.forEach(s => {
    const key = s.subject?.id || s.subjectName;
    if (!subjectColorMap[key]) subjectColorMap[key] = COLORS[colorIdx++ % COLORS.length];
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Weekly Timetable</h1>
        <p className="text-gray-500 text-sm">Your class schedule for the week</p>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : slots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📅</p>
            No timetable available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS.filter(d => byDay[d].length > 0).map(day => (
              <div key={day} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${day === TODAY ? 'border-violet-300 ring-2 ring-violet-200' : 'border-gray-100'}`}>
                <div className={`px-5 py-3 flex items-center gap-2 ${day === TODAY ? 'bg-violet-600 text-white' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-sm ${day === TODAY ? 'text-white' : 'text-gray-700'}`}>{day}</h3>
                  {day === TODAY && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">TODAY</span>}
                  <span className={`ml-auto text-xs ${day === TODAY ? 'text-violet-200' : 'text-gray-400'}`}>{byDay[day].length} class{byDay[day].length !== 1 ? 'es' : ''}</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {byDay[day].map((slot: any, i: number) => {
                    const colorKey = slot.subject?.id || slot.subjectName;
                    const isNow = day === TODAY && slot.startTime <= dayjs().format('HH:mm') && slot.endTime >= dayjs().format('HH:mm');
                    return (
                      <div key={i} className={`rounded-xl border p-3 ${subjectColorMap[colorKey] || COLORS[0]} ${isNow ? 'ring-2 ring-violet-400' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{slot.startTime} — {slot.endTime}</span>
                          {isNow && <span className="text-[9px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">NOW</span>}
                        </div>
                        <p className="font-bold text-sm truncate">{slot.subject?.name || slot.subjectName}</p>
                        <p className="text-xs opacity-70 mt-0.5 truncate">{slot.teacher?.user?.name || 'TBA'}</p>
                        {slot.roomNumber && <p className="text-xs opacity-60">Room {slot.roomNumber}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
