'use client';
import React, { useState, useMemo } from 'react';
import {
  useClasses, useSections, useStudents,
  useAttendance, useMarkAttendance, useAttendanceReport, useTodayAttendanceSummary,
} from '@/hooks/use-api';
import { Topbar } from '@/components/layout/topbar';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
type Status = typeof STATUSES[number];

const STATUS_STYLE: Record<Status, string> = {
  PRESENT: 'bg-green-600 text-white',
  ABSENT: 'bg-red-600 text-white',
  LATE: 'bg-amber-500 text-white',
  EXCUSED: 'bg-gray-400 text-white',
};

export default function AttendancePage() {
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [reportFrom, setReportFrom] = useState(() => new Date(new Date().setDate(1)).toISOString().slice(0, 10));
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [showReport, setShowReport] = useState(false);

  const { data: classes } = useClasses();
  const { data: sections } = useSections(classId || undefined);
  const { data: students, isLoading: loadingStudents } = useStudents(
    sectionId ? { sectionId, limit: 200, isActive: true } : { limit: 0 }
  );
  const { data: existing } = useAttendance(sectionId, date);
  const { data: todaySummary } = useTodayAttendanceSummary();
  const { data: report, isLoading: loadingReport } = useAttendanceReport(
    showReport ? sectionId : '', reportFrom, reportTo
  );
  const markMutation = useMarkAttendance();

  const studentList = (students as any)?.data ?? [];
  const summary: any = todaySummary ?? {};

  // Pre-fill marks from already-saved attendance for the date
  useMemo(() => {
    if (Array.isArray(existing)) {
      const m: Record<string, Status> = {};
      existing.forEach((r: any) => { m[r.studentId] = r.status; });
      setMarks(m);
    } else {
      setMarks({});
    }
  }, [existing, sectionId, date]);

  const setStatus = (studentId: string, status: Status) =>
    setMarks(prev => ({ ...prev, [studentId]: status }));

  const markAll = (status: Status) => {
    const m: Record<string, Status> = {};
    studentList.forEach((s: any) => { m[s.id] = status; });
    setMarks(m);
  };

  const handleSave = () => {
    if (!sectionId) return;
    const records = studentList.map((s: any) => ({
      studentId: s.id,
      status: marks[s.id] ?? 'PRESENT',
      date,
    }));
    markMutation.mutate({ sectionId, records });
  };

  const presentCount = Object.values(marks).filter(s => s === 'PRESENT').length;

  return (
    <>
      <Topbar title="Attendance" subtitle="Mark and review student attendance" />
      <div className="page-padding space-y-5">

        {/* Today's summary */}
        <div className="grid-responsive-3" style={{ gap: '0.75rem' }}>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-xl">✅</div>
            <div>
              <p className="text-lg font-black text-gray-900">{summary.present ?? '—'}</p>
              <p className="text-xs text-gray-500">Present today</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center text-xl">❌</div>
            <div>
              <p className="text-lg font-black text-gray-900">{summary.absent ?? '—'}</p>
              <p className="text-xs text-gray-500">Absent today</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">📊</div>
            <div>
              <p className="text-lg font-black text-gray-900">{summary.presentRate != null ? `${summary.presentRate}%` : '—'}</p>
              <p className="text-xs text-gray-500">Attendance rate</p>
            </div>
          </div>
        </div>

        {/* Selectors */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400">
              <option value="">Select Class</option>
              {((classes as any) ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)}
              disabled={!classId} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 disabled:opacity-50">
              <option value="">Select Section</option>
              {((sections as any) ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            <button onClick={() => setShowReport(v => !v)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
              {showReport ? 'Hide Report' : 'View Report'}
            </button>
          </div>
        </div>

        {/* Report view */}
        {showReport && sectionId && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-xs font-semibold text-gray-500">From</label>
              <input type="date" value={reportFrom} onChange={e => setReportFrom(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              <label className="text-xs font-semibold text-gray-500">To</label>
              <input type="date" value={reportTo} onChange={e => setReportTo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            {loadingReport ? (
              <p className="text-sm text-gray-400 py-6 text-center">Loading report...</p>
            ) : (
              <pre className="text-xs bg-gray-50 rounded-xl p-3 overflow-x-auto">{JSON.stringify(report, null, 2)}</pre>
            )}
          </div>
        )}

        {/* Mark attendance grid */}
        {!sectionId ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🗓️</div>
            <p className="font-semibold">Select a class and section to mark attendance</p>
          </div>
        ) : loadingStudents ? (
          <div className="text-center py-16 text-gray-400">Loading students...</div>
        ) : studentList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No students in this section</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-600">{presentCount}/{studentList.length} marked present</p>
              <div className="flex gap-2">
                {STATUSES.map(st => (
                  <button key={st} onClick={() => markAll(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLE[st]} opacity-80 hover:opacity-100`}>
                    All {st.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {studentList.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-gray-400">Roll #{s.rollNumber ?? '—'}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {STATUSES.map(st => (
                      <button key={st} onClick={() => setStatus(s.id, st)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                          marks[s.id] === st ? STATUS_STYLE[st] : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                        title={st}>
                        {st === 'PRESENT' ? 'P' : st === 'ABSENT' ? 'A' : st === 'LATE' ? 'L' : 'E'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={handleSave} disabled={markMutation.isPending}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {markMutation.isPending ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
