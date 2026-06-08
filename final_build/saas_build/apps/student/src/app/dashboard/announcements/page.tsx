'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentAnnouncementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-announcements-all'],
    queryFn:  () => api.get('/announcements?limit=50').catch(() => []),
  });

  const items: any[] = Array.isArray(data) ? data : [];

  const PRIORITY_STYLE: any = {
    HIGH:   'bg-red-50 border-red-200',
    NORMAL: 'bg-white border-gray-100',
    LOW:    'bg-gray-50 border-gray-100',
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Announcements</h1>
        <p className="text-gray-500 text-sm">School notices and important updates</p>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📢</p>
            No announcements yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a: any) => (
              <div key={a.id} className={`rounded-2xl border shadow-sm p-5 ${PRIORITY_STYLE[a.priority] || 'bg-white border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📢</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {a.priority === 'HIGH' && <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">URGENT</span>}
                    </div>
                    <h3 className="font-bold text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{a.body || a.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{dayjs(a.createdAt).format('MMMM D, YYYY [at] h:mm A')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
