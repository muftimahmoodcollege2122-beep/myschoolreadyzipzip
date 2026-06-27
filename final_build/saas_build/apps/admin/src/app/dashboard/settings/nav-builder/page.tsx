'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Topbar } from '../../../../components/layout/topbar';

type Portal = 'teacher' | 'student' | 'parent';

const ICONS = ['📊','🏠','📝','📋','📅','✅','💰','💬','🗂️','🏆','🚌','👩‍🎓','📚','🔔','📌','⚙️','📈','🎯','🧪','📞','🗓️','🏅','💡','🔐'];

export default function NavBuilderPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Portal>('student');
  const [config, setConfig] = useState<Record<Portal, any[]>>({ teacher: [], student: [], parent: [] });
  const [saved, setSaved] = useState(false);
  const [editingIcon, setEditingIcon] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['nav-config'],
    queryFn: () => apiClient.get('/themes/nav-config'),
    staleTime: 60000,
  });

  useEffect(() => {
    if (!data) return;
    const d = data as any;
    setConfig({
      teacher: d.teacher || [],
      student: d.student || [],
      parent:  d.parent  || [],
    });
  }, [data]);

  const mut = useMutation({
    mutationFn: (cfg: any) => apiClient.put('/themes/nav-config', cfg),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: ['nav-config'] }); },
  });

  const items = config[tab] || [];

  const setLabel = (key: string, label: string) =>
    setConfig(p => ({ ...p, [tab]: p[tab].map(i => i.key === key ? { ...i, label } : i) }));

  const setIcon = (key: string, icon: string) => {
    setConfig(p => ({ ...p, [tab]: p[tab].map(i => i.key === key ? { ...i, icon } : i) }));
    setEditingIcon(null);
  };

  const toggle = (key: string) =>
    setConfig(p => ({ ...p, [tab]: p[tab].map(i => i.key === key ? { ...i, enabled: !i.enabled } : i) }));

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setConfig(p => {
      const arr = [...p[tab]];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...p, [tab]: arr.map((x, i) => ({ ...x, order: i })) };
    });
  };

  const moveDown = (idx: number) => {
    setConfig(p => {
      const arr = [...p[tab]];
      if (idx >= arr.length - 1) return p;
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { ...p, [tab]: arr.map((x, i) => ({ ...x, order: i })) };
    });
  };

  const TABS: { id: Portal; label: string; color: string }[] = [
    { id: 'student', label: '👩‍🎓 Student Portal', color: 'violet' },
    { id: 'teacher', label: '👨‍🏫 Teacher Portal', color: 'teal' },
    { id: 'parent',  label: '👨‍👩‍👧 Parent Portal',  color: 'rose' },
  ];

  return (
    <>
      <Topbar title="Nav Builder" subtitle="Reorder, rename, and customize portal navigation" />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Portal Navigation Builder</h1>
            <p className="text-gray-500 text-sm mt-1">Customize sidebar menus for each portal — reorder, rename, change icons</p>
          </div>
          <button onClick={() => mut.mutate(config)}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-colors">
            {mut.isPending ? 'Saving…' : saved ? '✅ Saved!' : 'Save Changes'}
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span className="w-8" />
              <span className="w-10">Icon</span>
              <span className="flex-1">Label</span>
              <span className="w-20 text-center">Visible</span>
              <span className="w-20 text-center">Order</span>
            </div>
            {items.map((item, idx) => (
              <div key={item.key} className={`flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!item.enabled ? 'opacity-50' : ''}`}>
                <span className="w-8 text-gray-300 text-xs font-mono">{idx + 1}</span>

                <div className="relative w-10">
                  <button onClick={() => setEditingIcon(editingIcon === item.key ? null : item.key)}
                    className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg hover:bg-gray-200 transition-colors">
                    {item.icon}
                  </button>
                  {editingIcon === item.key && (
                    <div className="absolute z-20 top-11 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-52">
                      <p className="text-xs font-bold text-gray-500 mb-2">Pick icon</p>
                      <div className="grid grid-cols-6 gap-1.5">
                        {ICONS.map(ic => (
                          <button key={ic} onClick={() => setIcon(item.key, ic)}
                            className="w-8 h-8 rounded-lg hover:bg-blue-100 flex items-center justify-center text-lg transition-colors">
                            {ic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <input value={item.label} onChange={e => setLabel(item.key, e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium" />
                  <p className="text-xs text-gray-400 mt-0.5 pl-1 font-mono">{item.href}</p>
                </div>

                <div className="w-20 flex justify-center">
                  <button onClick={() => toggle(item.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="w-20 flex items-center justify-center gap-1">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-xs transition-colors">↑</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === items.length - 1}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-xs transition-colors">↓</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
