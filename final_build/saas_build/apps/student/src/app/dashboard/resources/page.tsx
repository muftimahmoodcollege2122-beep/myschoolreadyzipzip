'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentResourcesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student-resources'],
    queryFn:  () => api.get('/resources/mine?limit=100').catch(() => []),
  });

  const items: any[] = Array.isArray(data) ? data : [];
  const bySubject = items.reduce((acc, r) => {
    const key = r.subject?.name || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  const TYPE_ICON: any = { DOCUMENT: '📄', VIDEO: '🎥', LINK: '🔗', IMAGE: '🖼️', AUDIO: '🎵', OTHER: '📦' };
  const TYPE_COLORS: any = { DOCUMENT: 'bg-blue-50 border-blue-100 text-blue-700', VIDEO: 'bg-red-50 border-red-100 text-red-700',
    LINK: 'bg-green-50 border-green-100 text-green-700', IMAGE: 'bg-orange-50 border-orange-100 text-orange-700',
    AUDIO: 'bg-violet-50 border-violet-100 text-violet-700', OTHER: 'bg-gray-50 border-gray-100 text-gray-700' };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Study Resources</h1>
        <p className="text-gray-500 text-sm">Materials shared by your teachers</p>
      </div>

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p>
        : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            <p className="text-3xl mb-3">📚</p>
            No resources shared yet. Check back later!
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(bySubject).map(([subject, resources]: [string, any[]]) => (
              <div key={subject} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm">📚 {subject}</h3>
                  <span className="text-xs text-gray-400">{resources.length} resource{resources.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {resources.map((r: any) => (
                    <a key={r.id} href={r.url || '#'} target={r.url ? '_blank' : '_self'} rel="noopener noreferrer"
                      className={`flex items-center gap-3 rounded-xl border p-3 hover:shadow-md transition-all ${TYPE_COLORS[r.type] || 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                      <span className="text-2xl flex-shrink-0">{TYPE_ICON[r.type] || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{r.title}</p>
                        {r.description && <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{r.description}</p>}
                        <p className="text-xs opacity-50 mt-0.5">{dayjs(r.createdAt).format('MMM D')}</p>
                      </div>
                      {r.url && <span className="text-sm flex-shrink-0">→</span>}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
