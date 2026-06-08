'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { useParentAuth } from '../../../stores/auth.store';
import dayjs from 'dayjs';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TODAY = dayjs().format('dddd').toUpperCase();

export default function ParentTimetablePage() {
  const { children: storedChildren } = useParentAuth();
  const [activeChild, setActiveChild] = useState(0);

  const { data: children } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  () => api.get('/parents/my-children').catch(() => storedChildren || []),
  });

  const childList = Array.isArray(children) ? children as any[] : storedChildren;
  const child = childList?.[activeChild];

  const { data } = useQuery({
    queryKey: ['child-timetable', child?.id],
    queryFn:  () => child?.id ? api.get(`/timetable/student/${child.id}`).catch(() => []) : Promise.resolve([]),
    enabled: !!child?.id,
  });

  const slots: any[] = Array.isArray(data) ? data : [];
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = slots.filter(s => s.dayOfWeek === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Class Timetable</h1>
        <p className="text-gray-500 text-sm">Weekly schedule for your child</p>
      </div>

      {childList?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {childList.map((c: any, i: number) => (
            <button key={i} onClick={() => setActiveChild(i)}
              className={`px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap ${
                activeChild === i ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}>{c.name}</button>
          ))}
        </div>
      )}

      {slots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-3xl mb-3">📅</p>
          No timetable available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.filter(d => byDay[d].length > 0).map(day => (
            <div key={day} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${day === TODAY ? 'border-rose-300 ring-2 ring-rose-200' : 'border-gray-100'}`}>
              <div className={`px-5 py-3 flex items-center gap-2 ${day === TODAY ? 'bg-rose-600 text-white' : 'bg-gray-50'}`}>
                <h3 className={`font-bold text-sm ${day === TODAY ? 'text-white' : 'text-gray-700'}`}>{day}</h3>
                {day === TODAY && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">TODAY</span>}
                <span className={`ml-auto text-xs ${day === TODAY ? 'text-rose-200' : 'text-gray-400'}`}>{byDay[day].length} period{byDay[day].length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {byDay[day].map((slot: any, i: number) => (
                  <div key={i} className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-rose-700">{slot.startTime} — {slot.endTime}</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5 truncate">{slot.subject?.name || slot.subjectName}</p>
                    <p className="text-xs text-gray-500 truncate">{slot.teacher?.user?.name || 'TBA'}</p>
                    {slot.roomNumber && <p className="text-xs text-gray-400">Room {slot.roomNumber}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
