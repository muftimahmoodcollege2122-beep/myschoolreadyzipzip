'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Topbar } from '../../../../components/layout/topbar';

type Portal = 'teacher' | 'student' | 'parent';

const TABS: { id: Portal; label: string; icon: string }[] = [
  { id: 'student', label: 'Student Dashboard', icon: '👩‍🎓' },
  { id: 'teacher', label: 'Teacher Dashboard', icon: '👨‍🏫' },
  { id: 'parent',  label: 'Parent Dashboard',  icon: '👨‍👩‍👧' },
];

export default function DashboardWidgetsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Portal>('student');
  const [widgets, setWidgets] = useState<Record<Portal, any[]>>({ teacher: [], student: [], parent: [] });
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: () => apiClient.get('/themes/dashboard-widgets'),
    staleTime: 60000,
  });

  useEffect(() => {
    if (!data) return;
    const d = data as any;
    setWidgets({ teacher: d.teacher || [], student: d.student || [], parent: d.parent || [] });
  }, [data]);

  const mut = useMutation({
    mutationFn: (w: any) => apiClient.put('/themes/dashboard-widgets', w),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: ['dashboard-widgets'] }); },
  });

  const toggle = (key: string) =>
    setWidgets(p => ({ ...p, [tab]: p[tab].map(w => w.key === key ? { ...w, enabled: !w.enabled } : w) }));

  const moveUp = (idx: number) =>
    setWidgets(p => {
      if (idx === 0) return p;
      const arr = [...p[tab]];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...p, [tab]: arr.map((x, i) => ({ ...x, order: i })) };
    });

  const moveDown = (idx: number) =>
    setWidgets(p => {
      const arr = [...p[tab]];
      if (idx >= arr.length - 1) return p;
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { ...p, [tab]: arr.map((x, i) => ({ ...x, order: i })) };
    });

  const items = widgets[tab] || [];
  const enabledCount = items.filter(w => w.enabled).length;

  return (
    <>
      <Topbar title="Dashboard Widgets" subtitle="Control what widgets appear on each portal dashboard" />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Dashboard Widgets</h1>
            <p className="text-gray-500 text-sm mt-1">Choose which widgets appear on each portal's homepage and their order</p>
          </div>
          <button onClick={() => mut.mutate(widgets)}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">
            {mut.isPending ? 'Saving…' : saved ? '✅ Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>Widget</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">{enabledCount} of {items.length} visible</span>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : items.map((widget, idx) => (
            <div key={widget.key}
              className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!widget.enabled ? 'opacity-50' : ''}`}>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-800">{widget.label}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{widget.key}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-xs transition-colors">↑</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-xs transition-colors">↓</button>
                </div>

                <button onClick={() => toggle(widget.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${widget.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${widget.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800">💡 Tip</p>
          <p className="text-xs text-blue-600 mt-1">Changes take effect on the next portal login or page refresh. Students, teachers, and parents will see updated dashboards automatically.</p>
        </div>
      </div>
    </>
  );
}
