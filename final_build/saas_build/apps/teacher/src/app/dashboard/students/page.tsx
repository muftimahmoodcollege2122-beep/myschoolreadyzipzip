'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';

export default function TeacherStudentsPage() {
  const [sectionId, setSectionId] = useState('');
  const [search, setSearch] = useState('');

  const { data: sections } = useQuery({
    queryKey: ['my-sections'],
    queryFn:  () => api.get('/teachers/my-sections').catch(() => []),
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['section-students', sectionId, search],
    queryFn:  () => sectionId
      ? api.get(`/students?sectionId=${sectionId}&search=${search}&limit=100`).catch(() => [])
      : Promise.resolve([]),
    enabled: !!sectionId,
  });

  const list: any[] = Array.isArray(students) ? students : [];

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Students</h1>
        <p className="text-gray-500 text-sm">View students in your sections</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
          <select value={sectionId} onChange={e => setSectionId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select section…</option>
            {Array.isArray(sections) && (sections as any[]).map((s: any) => (
              <option key={s.id} value={s.id}>{s.class?.name} - {s.name}</option>
            ))}
          </select>
        </div>
        {sectionId && (
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll number…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        )}
      </div>

      {sectionId ? (
        isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
          : list.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
              No students found in this section.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">{list.length} students</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                {list.map((s: any) => (
                  <div key={s.id} className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-black text-sm mx-auto mb-2">
                      {s.name?.[0]}
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.rollNumber}</p>
                    {s.gender && <p className="text-xs text-gray-400 mt-0.5">{s.gender}</p>}
                  </div>
                ))}
              </div>
            </div>
          )
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <p className="text-3xl mb-3">👩‍🎓</p>
          Select a section to view students.
        </div>
      )}
    </div>
  );
}
