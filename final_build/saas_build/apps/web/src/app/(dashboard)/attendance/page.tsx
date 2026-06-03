'use client';
import React, { useState, useEffect } from 'react';
import { useAttendance, useMarkAttendance, useClasses, useSections } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';

const STATUSES = ['PRESENT','ABSENT','LATE','EXCUSED'] as const;
type S = typeof STATUSES[number];
const SC: Record<S,string> = {
  PRESENT: 'bg-green-500 text-white border-green-500',
  ABSENT: 'bg-red-500 text-white border-red-500',
  LATE: 'bg-yellow-500 text-white border-yellow-500',
  EXCUSED: 'bg-blue-500 text-white border-blue-500',
};
const SV: Record<S,any> = { PRESENT: 'green', ABSENT: 'red', LATE: 'yellow', EXCUSED: 'blue' };

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedClass, setSelectedClass] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(today);
  const [local, setLocal] = useState<Record<string,S>>({});
  const [saved, setSaved] = useState(false);

  const { data: classes } = useClasses();
  const { data: allSections } = useSections();
  const { data: records, isLoading } = useAttendance(sectionId, date);
  const mark = useMarkAttendance();

  const classList: any[] = Array.isArray(classes) ? classes : [];
  const sectionList: any[] = Array.isArray(allSections) ? allSections : [];
  const filtered = selectedClass ? sectionList.filter((s: any) => s.classId === selectedClass) : sectionList;

  useEffect(() => {
    if (classList.length > 0 && !selectedClass) setSelectedClass(classList[0].id);
  }, [classList.length]);

  useEffect(() => {
    const firstSec = filtered[0]?.id;
    if (firstSec && !filtered.find((s:any) => s.id === sectionId)) setSectionId(firstSec);
  }, [selectedClass]);

  useEffect(() => {
    if (records) {
      const m: Record<string,S> = {};
      (records as any[]).forEach((r: any) => { m[r.studentId] = r.status; });
      setLocal(m);
    }
  }, [records]);

  const save = async () => {
    await mark.mutateAsync({
      sectionId, date,
      records: Object.entries(local).map(([studentId, status]) => ({ studentId, status, date, sectionId })),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const students: { id: string; name: string; roll: string }[] = records
    ? (records as any[]).map((r: any) => ({
        id: r.studentId,
        name: r.student?.user?.profile ? `${r.student.user.profile.firstName} ${r.student.user.profile.lastName}` : 'Unknown',
        roll: r.student?.rollNumber ?? '',
      }))
    : [];

  const stats = Object.values(local).reduce((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {} as Record<string, number>);
  const total = students.length;
  const presentPct = total ? Math.round(((stats['PRESENT'] ?? 0) / total) * 100) : 0;
  const currentSection = sectionList.find((s: any) => s.id === sectionId);

  return (
    <>
      <Topbar title="Attendance" subtitle="Daily student attendance marking" />
      <div className="p-6">
        <PageHeader title="Attendance" subtitle={currentSection ? `${currentSection.class?.name}-${currentSection.name} · ${date}` : 'Select a class to begin'} />

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Class</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSectionId(''); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[140px]">
              <option value="">All Classes</option>
              {classList.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Section</label>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[160px]">
              <option value="">Select section</option>
              {filtered.map((s: any) => (
                <option key={s.id} value={s.id}>{s.class?.name ?? ''}-{s.name} ({s._count?.students ?? 0} students)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} max={today} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white" />
          </div>
          {saved && <div className="px-4 py-2 bg-green-50 text-green-700 font-bold text-sm rounded-lg border border-green-200">✅ Saved!</div>}
        </div>

        {/* Quick-set all */}
        {sectionId && students.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase">Mark All:</span>
            {(STATUSES as readonly S[]).map(s => (
              <button key={s} onClick={() => {
                const m: Record<string,S> = {};
                students.forEach(st => { m[st.id] = s; });
                setLocal(m);
              }} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${SC[s]}`}>{s}</button>
            ))}
          </div>
        )}

        {!sectionId ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-gray-500 font-medium">Select a class and section to mark attendance</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">{[...Array(8)].map((_,i)=><div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-gray-400 font-medium">No attendance data for this date</p>
            <p className="text-gray-300 text-sm mt-1">Attendance records appear after they are created via the system</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {(STATUSES as readonly S[]).map(s => {
                const bgMap: Record<S,string> = { PRESENT:'bg-green-50 border-green-100', ABSENT:'bg-red-50 border-red-100', LATE:'bg-yellow-50 border-yellow-100', EXCUSED:'bg-blue-50 border-blue-100' };
                const txtMap: Record<S,string> = { PRESENT:'text-green-700', ABSENT:'text-red-700', LATE:'text-yellow-700', EXCUSED:'text-blue-700' };
                return (
                  <div key={s} className={`rounded-xl p-3 border ${bgMap[s]}`}>
                    <p className={`text-2xl font-black ${txtMap[s]}`}>{stats[s] ?? 0}</p>
                    <p className="text-xs text-gray-500 font-medium">{s}</p>
                  </div>
                );
              })}
            </div>

            {/* Rate bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Attendance Rate</span>
                  <span className={`font-black ${presentPct>=90?'text-green-600':presentPct>=75?'text-yellow-600':'text-red-600'}`}>{presentPct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${presentPct>=90?'bg-green-500':presentPct>=75?'bg-yellow-500':'bg-red-500'}`} style={{ width: `${presentPct}%` }} />
                </div>
              </div>
              <span className="text-sm text-gray-500">{stats['PRESENT']??0}/{total} present</span>
            </div>

            {/* Student list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {students.map((st, idx) => (
                <div key={st.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="text-xs text-gray-300 w-6 font-mono">{idx+1}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs flex-shrink-0">
                    {st.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{st.name}</p>
                    {st.roll && <p className="text-xs text-gray-400">Roll #{st.roll}</p>}
                  </div>
                  <div className="flex gap-1">
                    {(STATUSES as readonly S[]).map(s => (
                      <button key={s} onClick={() => setLocal(l => ({...l, [st.id]: s}))}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${local[st.id]===s ? SC[s] : 'border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-500'}`}>
                        {s[0]}
                      </button>
                    ))}
                  </div>
                  {local[st.id] && <Badge variant={SV[local[st.id]]}>{local[st.id]}</Badge>}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={save} disabled={mark.isPending || Object.keys(local).length === 0}
                className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50 shadow-sm">
                {mark.isPending ? 'Saving...' : `💾 Save Attendance (${Object.keys(local).length} records)`}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
