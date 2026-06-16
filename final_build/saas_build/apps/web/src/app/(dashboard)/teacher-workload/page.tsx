'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const MAX_PERIODS = 8;
const LOAD_COLOR = (periods: number) => periods > 6 ? 'text-red-600' : periods > 4 ? 'text-amber-600' : 'text-green-600';
const LOAD_BG    = (periods: number) => periods > 6 ? 'bg-red-100' : periods > 4 ? 'bg-amber-100' : 'bg-green-100';
const LOAD_LABEL = (periods: number) => periods > 6 ? 'Overloaded' : periods > 4 ? 'Moderate' : 'Balanced';

export default function TeacherWorkloadPage() {
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const { data: teachersData } = useQuery({ queryKey:['teachers-all'], queryFn:()=>apiClient.get('/teachers?limit=200') });
  const { data: timetableData } = useQuery({
    queryKey: ['timetable-all'],
    queryFn: () => apiClient.get('/timetable/all'),
    retry: false,
  });
  const { data: leaveData } = useQuery({ queryKey:['leave-requests'], queryFn:()=>apiClient.get('/hr/leave-requests?status=PENDING') });

  const teachers: any[] = (teachersData as any)?.data ?? [];
  const timetable: any[] = Array.isArray(timetableData) ? timetableData : (timetableData as any)?.data ?? [];
  const leaves: any[] = Array.isArray(leaveData) ? leaveData : (leaveData as any)?.data ?? [];

  // Compute workload per teacher from timetable
  const workload = teachers.map(t => {
    const slots = timetable.filter(s => s.teacherId === t.id);
    const byDay: Record<number, number> = {};
    slots.forEach(s => { byDay[s.dayOfWeek] = (byDay[s.dayOfWeek] || 0) + 1; });
    const totalPeriods = slots.length;
    const subjects = [...new Set(slots.map(s => s.subject?.name).filter(Boolean))];
    const sections = [...new Set(slots.map(s => s.sectionId).filter(Boolean))];
    const pendingLeave = leaves.filter(l => l.teacherId === t.id).length;
    return {
      teacher: t,
      totalPeriods, byDay, subjects, sections: sections.length, pendingLeave,
      name: `${t.user?.profile?.firstName || ''} ${t.user?.profile?.lastName || ''}`.trim(),
    };
  }).sort((a,b) => b.totalPeriods - a.totalPeriods);

  const selected = workload.find(w => w.teacher.id === selectedTeacher);

  return (
    <>
      <Topbar title="Teacher Workload" subtitle="Monitor teaching load, leave requests and assignments across all staff" />
      <div className="p-6 space-y-6">

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:'Total Teachers',    value: teachers.length,                                                     icon:'👩‍🏫', color:'bg-blue-600' },
            { label:'Overloaded (>6)',   value: workload.filter(w=>w.totalPeriods>6).length,                         icon:'🔴', color:'bg-red-600' },
            { label:'Pending Leaves',    value: leaves.length,                                                       icon:'📋', color:'bg-amber-500' },
            { label:'Avg Periods/Week',  value: workload.length ? Math.round(workload.reduce((a,w)=>a+w.totalPeriods,0)/workload.length) : 0, icon:'📊', color:'bg-green-600' },
          ].map(s=>(
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Workload Table */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-black text-gray-900">Teaching Load Overview</h3>
              <p className="text-sm text-gray-500 mt-0.5">Periods per week per teacher — recommended max is 6</p>
            </div>
            <table className="w-full">
              <thead><tr className="bg-gray-50">
                {['Teacher','Subjects','Sections','Periods/Week','Load','Pending Leave','Details'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {workload.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No timetable data yet. Add periods in the Timetable section.</td></tr>
                ) : workload.map(w=>(
                  <tr key={w.teacher.id} className={`border-t border-gray-50 hover:bg-gray-50 cursor-pointer ${selectedTeacher===w.teacher.id?'bg-blue-50':''}`}
                    onClick={()=>setSelectedTeacher(selectedTeacher===w.teacher.id?'':w.teacher.id)}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">{w.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{w.teacher.specialization}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{w.subjects.slice(0,2).join(', ')}{w.subjects.length>2?` +${w.subjects.length-2}`:''}</td>
                    <td className="px-4 py-3 text-sm font-medium">{w.sections}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${w.totalPeriods>6?'bg-red-500':w.totalPeriods>4?'bg-amber-400':'bg-green-500'}`}
                            style={{width:`${Math.min(100,(w.totalPeriods/MAX_PERIODS)*100)}%`}}/>
                        </div>
                        <span className={`font-black text-sm ${LOAD_COLOR(w.totalPeriods)}`}>{w.totalPeriods}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${LOAD_BG(w.totalPeriods)} ${LOAD_COLOR(w.totalPeriods)}`}>{LOAD_LABEL(w.totalPeriods)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {w.pendingLeave > 0 ? <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{w.pendingLeave} pending</span> : <span className="text-gray-400 text-xs">None</span>}
                    </td>
                    <td className="px-4 py-3 text-blue-600 text-xs font-bold">{selectedTeacher===w.teacher.id?'▲ Hide':'▼ View'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Expanded Day-by-Day for selected teacher */}
            {selected && (
              <div className="border-t border-blue-100 bg-blue-50 p-4">
                <h4 className="font-bold text-blue-900 mb-3">📅 {selected.name} — Daily Schedule</h4>
                <div className="grid grid-cols-6 gap-2">
                  {DAYS.map((day, i) => (
                    <div key={day} className="bg-white rounded-lg p-2 text-center border border-blue-100">
                      <p className="text-xs font-bold text-gray-500 mb-1">{day}</p>
                      <p className={`text-xl font-black ${LOAD_COLOR(selected.byDay[i+1]||0)}`}>{selected.byDay[i+1]||0}</p>
                      <p className="text-xs text-gray-400">periods</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.subjects.map((s:string) => <span key={s} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Pending Leave Requests */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-black text-gray-900">📋 Pending Leave Requests</h3>
              <p className="text-sm text-gray-500">{leaves.length} awaiting approval</p>
            </div>
            {leaves.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-sm font-semibold">No pending leaves</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {leaves.slice(0,10).map((l:any)=>(
                  <div key={l.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{l.teacher?.user?.profile?.firstName} {l.teacher?.user?.profile?.lastName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{l.leaveType} — {new Date(l.startDate).toLocaleDateString('en-PK',{day:'numeric',month:'short'})} to {new Date(l.endDate).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</p>
                        {l.reason && <p className="text-xs text-gray-400 mt-0.5 italic">"{l.reason}"</p>}
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{l.status}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={()=>apiClient.patch(`/hr/leave-requests/${l.id}`,{status:'APPROVED'}).then(()=>alert('Approved — teacher notified'))}
                        className="flex-1 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">✅ Approve</button>
                      <button onClick={()=>apiClient.patch(`/hr/leave-requests/${l.id}`,{status:'REJECTED'}).then(()=>alert('Rejected — teacher notified'))}
                        className="flex-1 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100">❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
