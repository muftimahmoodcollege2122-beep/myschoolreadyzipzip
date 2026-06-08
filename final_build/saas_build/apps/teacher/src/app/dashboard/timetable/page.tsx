'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TODAY = dayjs().format('dddd').toUpperCase();

export default function TeacherTimetablePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-timetable-full'],
    queryFn:  () => api.get('/timetable/mine').catch(() => []),
  });

  const slots: any[] = Array.isArray(data) ? data : [];
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = slots.filter(s => s.dayOfWeek === d).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Timetable</h1>
          <p className="text-gray-500 text-sm">Weekly teaching schedule</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">This week</p>
          <p className="text-2xl font-black text-teal-600">{slots.length} classes</p>
        </div>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : slots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📅</p>
            No timetable assigned yet. Contact your school admin.
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS.filter(d => byDay[d].length > 0).map(day => (
              <div key={day} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${day === TODAY ? 'border-teal-300 ring-2 ring-teal-200' : 'border-gray-100'}`}>
                <div className={`px-5 py-3 flex items-center gap-2 ${day === TODAY ? 'bg-teal-600 text-white' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-sm ${day === TODAY ? 'text-white' : 'text-gray-700'}`}>{day}</h3>
                  {day === TODAY && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">TODAY</span>}
                  <span className={`ml-auto text-xs ${day === TODAY ? 'text-teal-200' : 'text-gray-400'}`}>{byDay[day].length} period{byDay[day].length !== 1 ? 's' : ''}</span>
                </div>
                <div className="p-3 space-y-2">
                  {byDay[day].map((slot: any, i: number) => {
                    const isNow = day === TODAY && slot.startTime <= dayjs().format('HH:mm') && slot.endTime >= dayjs().format('HH:mm');
                    return (
                      <div key={i} className={`flex items-center gap-4 rounded-xl border p-3 ${isNow ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-300' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="text-center min-w-[64px]">
                          <p className={`text-xs font-black ${isNow ? 'text-teal-700' : 'text-gray-700'}`}>{slot.startTime}</p>
                          <p className="text-[10px] text-gray-400">{slot.endTime}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold truncate ${isNow ? 'text-teal-800' : 'text-gray-800'}`}>{slot.subject?.name || slot.subjectName}</p>
                          <p className="text-xs text-gray-500 truncate">{slot.section?.class?.name} - {slot.section?.name} · Room {slot.roomNumber || 'TBA'}</p>
                        </div>
                        {isNow && <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse flex-shrink-0">NOW</span>}
                        <a href="/dashboard/attendance"
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 ${isNow ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                          Attendance
                        </a>
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
