'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Topbar } from '@/components/layout/topbar';
import { Modal } from '@/components/shared/modal';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const PERIODS = ['Period 1','Period 2','Period 3','Period 4','Period 5','Period 6','Period 7','Period 8'];
const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const COLORS = ['bg-blue-100 text-blue-700 border-blue-200','bg-purple-100 text-purple-700 border-purple-200','bg-green-100 text-green-700 border-green-200','bg-amber-100 text-amber-700 border-amber-200','bg-rose-100 text-rose-700 border-rose-200','bg-indigo-100 text-indigo-700 border-indigo-200'];

export default function TimetablePage() {
  const qc = useQueryClient();
  const [selectedSection, setSelectedSection] = useState('');
  const [modal, setModal] = useState(false);
  const [slot, setSlot] = useState({ dayOfWeek:1, period:1, subjectId:'', teacherId:'', startTime:'08:00', endTime:'08:45', room:'' });
  const [conflicts, setConflicts] = useState<any[]>([]);

  const { data: sections = [] } = useQuery({ queryKey:['sections'], queryFn:()=>apiClient.get('/school-data/sections') });
  const { data: teachers = [] } = useQuery({ queryKey:['teachers-list'], queryFn:()=>apiClient.get('/teachers') });
  const { data: subjects = [] } = useQuery({ queryKey:['subjects'], queryFn:()=>apiClient.get('/school-data/subjects') });
  const { data: timetable, isLoading } = useQuery({
    queryKey: ['timetable', selectedSection],
    queryFn: () => apiClient.get(`/timetable?sectionId=${selectedSection}`),
    enabled: !!selectedSection,
  });

  const addSlot = useMutation({
    mutationFn: (d: any) => apiClient.post('/timetable', { ...d, sectionId: selectedSection }),
    onSuccess: (res: any) => {
      if (res.conflicts?.length > 0) { setConflicts(res.conflicts); return; }
      qc.invalidateQueries({ queryKey:['timetable'] });
      setModal(false);
      setConflicts([]);
      // Trigger change notification via outbox
      apiClient.post('/notifications/broadcast', {
        schoolId: '', title: '🗓️ Timetable Updated',
        body: `The timetable for your class has been updated. Please check the latest schedule.`,
        audience: 'ALL_STUDENTS', channels: ['IN_APP'],
      }).catch(() => {});
    },
  });

  const allSections = Array.isArray(sections) ? sections : (sections as any)?.data ?? [];
  const allTeachers = Array.isArray(teachers) ? teachers : (teachers as any)?.data ?? [];
  const allSubjects = Array.isArray(subjects) ? subjects : (subjects as any)?.data ?? [];
  const slots: any[] = Array.isArray(timetable) ? timetable : (timetable as any)?.data ?? [];

  // Build grid: day × period → slot
  const grid: Record<string, any> = {};
  slots.forEach(s => { grid[`${s.dayOfWeek}-${s.period}`] = s; });

  const subjectColorMap: Record<string, string> = {};
  let colorIdx = 0;
  slots.forEach(s => { if (s.subjectId && !subjectColorMap[s.subjectId]) { subjectColorMap[s.subjectId] = COLORS[colorIdx++ % COLORS.length]; } });

  return (
    <>
      <Topbar title="Timetable" subtitle="Visual class schedule with conflict detection" />
      <div className="p-6">
        {/* Section Selector */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Section:</span>
          <select value={selectedSection} onChange={e=>setSelectedSection(e.target.value)} className="flex-1 max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-400">
            <option value="">Select a section</option>
            {allSections.map((s:any)=><option key={s.id} value={s.id}>{s.class?.name} — {s.name}</option>)}
          </select>
          {selectedSection && (
            <button onClick={()=>{ setSlot({dayOfWeek:1,period:1,subjectId:'',teacherId:'',startTime:'08:00',endTime:'08:45',room:''}); setConflicts([]); setModal(true); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 ml-auto">+ Add Period</button>
          )}
        </div>

        {/* Conflicts Warning */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-bold text-red-800 mb-2">⚠️ Schedule Conflicts Detected</p>
            {conflicts.map((c:any,i:number)=>(
              <p key={i} className="text-sm text-red-700">• {c.message || `${c.type}: ${c.details}`}</p>
            ))}
            <button onClick={()=>setConflicts([])} className="mt-2 text-xs text-red-600 underline">Dismiss</button>
          </div>
        )}

        {!selectedSection ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🗓️</div>
            <p className="font-semibold">Select a section to view its timetable</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading timetable...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide w-24">Period</th>
                  {DAYS.map((d,i)=>(
                    <th key={d} className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                      <span className="hidden md:inline">{d}</span>
                      <span className="md:hidden">{DAY_SHORT[i]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pi) => (
                  <tr key={period} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-black text-gray-500 uppercase">{period}</td>
                    {DAYS.map((_, di) => {
                      const s = grid[`${di+1}-${pi+1}`];
                      const color = s?.subjectId ? (subjectColorMap[s.subjectId] ?? COLORS[0]) : '';
                      return (
                        <td key={di} className="px-2 py-2 text-center">
                          {s ? (
                            <div className={`${color} border rounded-lg p-2 text-xs`}>
                              <p className="font-black">{s.subject?.name ?? '—'}</p>
                              <p className="opacity-70 mt-0.5">{s.teacher?.user?.profile?.firstName ?? ''}</p>
                              {s.room && <p className="opacity-60 mt-0.5">🏫 {s.room}</p>}
                              <p className="opacity-50 mt-0.5">{s.startTime}–{s.endTime}</p>
                            </div>
                          ) : (
                            <button
                              onClick={()=>{ setSlot({dayOfWeek:di+1,period:pi+1,subjectId:'',teacherId:'',startTime:'08:00',endTime:'08:45',room:''}); setConflicts([]); setModal(true); }}
                              className="w-full h-14 border-2 border-dashed border-gray-200 rounded-lg text-gray-300 hover:border-blue-300 hover:text-blue-400 transition-colors text-lg"
                            >+</button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {slots.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(subjectColorMap).map(([subId, color]) => {
              const sub = allSubjects.find((s:any)=>s.id===subId);
              if (!sub) return null;
              return <span key={subId} className={`${color} border px-3 py-1 rounded-full text-xs font-bold`}>{sub.name}</span>;
            })}
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {modal && (
        <Modal title={`Add Period — ${DAYS[slot.dayOfWeek-1]}, ${PERIODS[slot.period-1]}`} onClose={()=>setModal(false)}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Day</label>
                <select value={slot.dayOfWeek} onChange={e=>setSlot(s=>({...s,dayOfWeek:+e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {DAYS.map((d,i)=><option key={d} value={i+1}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Period</label>
                <select value={slot.period} onChange={e=>setSlot(s=>({...s,period:+e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {PERIODS.map((p,i)=><option key={p} value={i+1}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
              <select value={slot.subjectId} onChange={e=>setSlot(s=>({...s,subjectId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select subject</option>
                {allSubjects.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teacher *</label>
              <select value={slot.teacherId} onChange={e=>setSlot(s=>({...s,teacherId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select teacher</option>
                {allTeachers.map((t:any)=><option key={t.id} value={t.id}>{t.user?.profile?.firstName} {t.user?.profile?.lastName} — {t.specialization}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                <input type="time" value={slot.startTime} onChange={e=>setSlot(s=>({...s,startTime:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                <input type="time" value={slot.endTime} onChange={e=>setSlot(s=>({...s,endTime:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Room</label>
                <input value={slot.room} onChange={e=>setSlot(s=>({...s,room:e.target.value}))} placeholder="Room 201" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              ⚡ Conflicts are automatically detected — if a teacher is already assigned at this time or a room is double-booked, you will be warned before saving.
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={()=>addSlot.mutate(slot)}
                disabled={!slot.subjectId||!slot.teacherId||addSlot.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40"
              >{addSlot.isPending?'Checking conflicts...':'✅ Save & Notify Students'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
