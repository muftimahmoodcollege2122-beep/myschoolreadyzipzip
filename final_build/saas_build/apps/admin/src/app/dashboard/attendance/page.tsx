'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function AttendancePage() {
  const qc = useQueryClient();
  const [date, setDate]         = useState(dayjs().format('YYYY-MM-DD'));
  const [sectionId, setSectionId] = useState('');

  const { data: sections } = useQuery({
    queryKey: ['sections-list'],
    queryFn:  () => api.get('/sections?limit=100').catch(() => []),
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['attendance-students', sectionId],
    queryFn:  () => sectionId ? api.get(`/students?sectionId=${sectionId}&limit=100`).catch(() => []) : Promise.resolve([]),
    enabled: !!sectionId,
  });

  const { data: existing } = useQuery({
    queryKey: ['attendance-existing', sectionId, date],
    queryFn:  () => sectionId ? api.get(`/attendance?sectionId=${sectionId}&date=${date}`).catch(() => []) : Promise.resolve([]),
    enabled: !!sectionId,
  });

  const [records, setRecords] = useState<Record<string, string>>({});

  const studentList: any[] = Array.isArray(students) ? students : [];
  const existingList: any[] = Array.isArray(existing) ? existing : [];

  const getStatus = (sid: string) => {
    if (records[sid]) return records[sid];
    const e = existingList.find((e: any) => e.studentId === sid);
    return e?.status || 'PRESENT';
  };

  const toggleStatus = (sid: string, cur: string) => {
    const cycle = { PRESENT: 'ABSENT', ABSENT: 'LATE', LATE: 'PRESENT' } as any;
    setRecords(r => ({ ...r, [sid]: cycle[cur] || 'PRESENT' }));
  };

  const saveMutation = useMutation({
    mutationFn: () => api.post('/attendance/bulk', {
      date, sectionId,
      records: studentList.map((s: any) => ({ studentId: s.id, status: getStatus(s.id) })),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance-existing'] }); alert('Attendance saved!'); },
    onError: (e: any) => alert(e?.message || 'Save failed'),
  });

  const STATUS_STYLE: any = {
    PRESENT: 'bg-green-600 text-white',
    ABSENT:  'bg-red-600 text-white',
    LATE:    'bg-orange-500 text-white',
  };

  const counts = studentList.reduce((acc, s) => {
    const st = getStatus(s.id);
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {} as any);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm">Mark daily attendance by class and section</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={dayjs().format('YYYY-MM-DD')}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
          <select value={sectionId} onChange={e => { setSectionId(e.target.value); setRecords({}); }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select a section…</option>
            {Array.isArray(sections) && (sections as any[]).map((s: any) => (
              <option key={s.id} value={s.id}>{s.class?.name} - {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {sectionId && studentList.length > 0 && (
        <>
          {/* Summary */}
          <div className="flex gap-3">
            {[['Present', counts.PRESENT || 0, 'bg-green-100 text-green-700'], ['Absent', counts.ABSENT || 0, 'bg-red-100 text-red-700'], ['Late', counts.LATE || 0, 'bg-orange-100 text-orange-700']].map(([label, n, cls]) => (
              <div key={label as string} className={`${cls} rounded-2xl px-4 py-2.5 text-sm font-bold`}>
                {label}: {n as number}
              </div>
            ))}
          </div>

          {/* Student Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">{studentList.length} Students · Click to toggle status</h3>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all">
                {saveMutation.isPending ? 'Saving…' : '💾 Save Attendance'}
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {studentList.map((s: any, i: number) => {
                const st = getStatus(s.id);
                return (
                  <div key={s.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => toggleStatus(s.id, st)}>
                    <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">{s.name?.[0]}</div>
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

      {sectionId && !isLoading && studentList.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          No students enrolled in this section yet.
        </div>
      )}

      {!sectionId && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          <p className="text-3xl mb-3">📋</p>
          Select a section above to mark attendance.
        </div>
      )}
    </div>
  );
}
