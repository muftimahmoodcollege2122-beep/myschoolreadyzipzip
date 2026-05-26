'use client';
import React, { useState, useEffect } from 'react';
import { useAttendance, useMarkAttendance } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
const STATUSES = ['PRESENT','ABSENT','LATE','EXCUSED'] as const;
type S = typeof STATUSES[number];
const SC: Record<S,string> = { PRESENT:'bg-green-500 text-white border-green-500', ABSENT:'bg-red-500 text-white border-red-500', LATE:'bg-yellow-500 text-white border-yellow-500', EXCUSED:'bg-blue-500 text-white border-blue-500' };
export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [sectionId,setSectionId] = useState('');
  const [date,setDate] = useState(today);
  const [local,setLocal] = useState<Record<string,S>>({});
  const [saved,setSaved] = useState(false);
  const { data:records, isLoading } = useAttendance(sectionId, date);
  const mark = useMarkAttendance();
  useEffect(() => { if (records) { const m: Record<string,S> = {}; (records as any[]).forEach((r:any)=>{ m[r.studentId]=r.status; }); setLocal(m); } }, [records]);
  const save = async () => { await mark.mutateAsync({ sectionId, date, records: Object.entries(local).map(([studentId,status])=>({studentId,status,date,sectionId})) }); setSaved(true); setTimeout(()=>setSaved(false),3000); };
  const stats = Object.values(local).reduce((a,s)=>({...a,[s]:(a[s]??0)+1}),{} as Record<string,number>);
  return (
    <>
      <Topbar title="Attendance" subtitle="Mark daily class attendance"/>
      <div className="p-6">
        <PageHeader title="Attendance" action={sectionId && <button onClick={save} disabled={mark.isPending} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">{mark.isPending?'Saving...':saved?'✓ Saved!':'Save Attendance'}</button>}/>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Section ID</label><input value={sectionId} onChange={e=>setSectionId(e.target.value)} placeholder="Enter section ID" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400"/></div>
          <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} max={today} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400"/></div>
        </div>
        {sectionId && <div className="grid grid-cols-4 gap-3 mb-5">{STATUSES.map(s=><div key={s} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm"><p className="text-2xl font-black text-gray-800">{stats[s]??0}</p><p className="text-xs font-bold text-gray-400 mt-0.5">{s}</p></div>)}</div>}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {!sectionId ? <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">✅</p><p className="font-medium">Enter a section ID to begin</p></div>
            : isLoading ? <div className="p-4 space-y-2">{[...Array(6)].map((_,i)=><div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"/>)}</div>
            : !(records as any[])?.length ? <div className="text-center py-12 text-gray-400">No students in this section</div>
            : <div className="divide-y divide-gray-50">{(records as any[]).map((r:any)=>(
                <div key={r.studentId} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{r.student?.user?.profile?.firstName?.[0]??'?'}</div>
                    <div><p className="font-semibold text-sm">{r.student?.user?.profile?.firstName} {r.student?.user?.profile?.lastName}</p><p className="text-xs text-gray-400">Roll #{r.student?.rollNumber}</p></div>
                  </div>
                  <div className="flex gap-1.5">{STATUSES.map(s=><button key={s} onClick={()=>setLocal(p=>({...p,[r.studentId]:s}))} className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all border ${local[r.studentId]===s?SC[s]:'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}>{s[0]}</button>)}</div>
                </div>
              ))}</div>
          }
        </div>
      </div>
    </>
  );
}
