'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function TeacherAttendancePage() {
  const qc = useQueryClient();
  const [date, setDate]           = useState(dayjs().format('YYYY-MM-DD'));
  const [sectionId, setSectionId] = useState('');
  const [records, setRecords]     = useState<Record<string, string>>({});

  const { data: mySections } = useQuery({
    queryKey: ['teacher-sections'],
    queryFn:  () => api.get('/teachers/my-sections').catch(() => []),
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['section-students', sectionId],
    queryFn:  () => sectionId ? api.get(`/students?sectionId=${sectionId}&limit=100`).catch(() => []) : Promise.resolve([]),
    enabled: !!sectionId,
  });

  const { data: existing } = useQuery({
    queryKey: ['teacher-att-existing', sectionId, date],
    queryFn:  () => sectionId ? api.get(`/attendance?sectionId=${sectionId}&date=${date}`).catch(() => []) : Promise.resolve([]),
    enabled: !!sectionId,
  });

  const studentList: any[] = Array.isArray(students) ? students : [];
  const existingList: any[] = Array.isArray(existing) ? existing : [];

  const getStatus = (sid: string) => {
    if (records[sid]) return records[sid];
    return existingList.find((e: any) => e.studentId === sid)?.status || 'PRESENT';
  };

  const toggleStatus = (sid: string, cur: string) => {
    const cycle: any = { PRESENT: 'ABSENT', ABSENT: 'LATE', LATE: 'PRESENT' };
    setRecords(r => ({ ...r, [sid]: cycle[cur] }));
  };

  const saveMutation = useMutation({
    mutationFn: () => api.post('/attendance/bulk', {
      date, sectionId,
      records: studentList.map((s: any) => ({ studentId: s.id, status: getStatus(s.id) })),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher-att-existing'] }),
    onError: (e: any) => alert(e?.message || 'Failed to save'),
  });

  const STATUS_STYLE: any = { PRESENT: 'bg-green-600 text-white', ABSENT: 'bg-red-600 text-white', LATE: 'bg-orange-500 text-white' };
  const counts = studentList.reduce((a, s) => { const st = getStatus(s.id); a[st] = (a[st] || 0) + 1; return a; }, {} as any);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm">Record daily attendance for your classes</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={dayjs().format('YYYY-MM-DD')}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold text-gray-700 mb-1">My Section</label>
          <select value={sectionId} onChange={e => { setSectionId(e.target.value); setRecords({}); }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select section…</option>
            {Array.isArray(mySections) && (mySections as any[]).map((s: any) => (
              <option key={s.id} value={s.id}>{s.class?.name} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {sectionId && studentList.length > 0 && (
        <>
          <div className="flex gap-3">
            {[['✅ Present', counts.PRESENT || 0, 'bg-green-100 text-green-700'], ['❌ Absent', counts.ABSENT || 0, 'bg-red-100 text-red-700'], ['⏰ Late', counts.LATE || 0, 'bg-orange-100 text-orange-700']].map(([label, n, cls]) => (
              <div key={label as string} className={`${cls} rounded-xl px-4 py-2 text-sm font-bold`}>{label}: {n as number}</div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">{studentList.length} Students — Tap to toggle</h3>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs">
                {saveMutation.isPending ? 'Saving…' : '💾 Save'}
              </button>
            </div>
            {saveMutation.isSuccess && (
              <div className="px-5 py-2.5 bg-green-50 border-b border-green-100 text-xs text-green-700 font-semibold">
                ✅ Attendance saved successfully!
              </div>
            )}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {studentList.map((s: any, i: number) => {
                const st = getStatus(s.id);
                return (
                  <div key={s.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleStatus(s.id, st)}>
                    <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">{s.name?.[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.rollNumber}</p>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${STATUS_STYLE[st]}`}>{st}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {!sectionId && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          <p className="text-3xl mb-3">✅</p>
          Select a section to start marking attendance.
        </div>
      )}
    </div>
  );
}
