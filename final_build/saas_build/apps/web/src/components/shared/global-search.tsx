'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => apiClient.get(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = data as any;
  const hasResults = results && (results.students?.length || results.teachers?.length || results.exams?.length);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-64 focus-within:border-green-400 transition-colors">
        <span className="text-gray-400 text-sm">🔍</span>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Search students, teachers..." className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full" />
        {q && <button onClick={() => { setQ(''); setOpen(false); }} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>}
      </div>
      {open && q.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {isLoading ? <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
          : !hasResults ? <div className="p-4 text-center text-sm text-gray-400">No results for &quot;{q}&quot;</div>
          : <>
              {results.students?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50">Students</p>
                  {results.students.map((s: any) => (
                    <button key={s.id} onClick={() => { router.push(`/students/${s.id}`); setOpen(false); setQ(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{s.first_name?.[0]}</div>
                      <div><p className="text-sm font-semibold">{s.first_name} {s.last_name}</p><p className="text-xs text-gray-400">Roll #{s.roll_number}</p></div>
                    </button>
                  ))}
                </div>
              )}
              {results.teachers?.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase bg-gray-50">Teachers</p>
                  {results.teachers.map((t: any) => (
                    <button key={t.id} onClick={() => { router.push(`/teachers/${t.id}`); setOpen(false); setQ(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{t.first_name?.[0]}</div>
                      <div><p className="text-sm font-semibold">{t.first_name} {t.last_name}</p><p className="text-xs text-gray-400">ID: {t.employee_id}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </>
          }
        </div>
      )}
    </div>
  );
}
