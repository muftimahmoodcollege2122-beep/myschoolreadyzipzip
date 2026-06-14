'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Topbar } from '../../../../components/layout/topbar';

type Portal = 'teacher' | 'student' | 'parent' | 'admin';

const PORTALS: { id: Portal; label: string; icon: string; defaultBg: string }[] = [
  { id: 'student', label: 'Student Portal', icon: '👩‍🎓', defaultBg: '#2e1065' },
  { id: 'teacher', label: 'Teacher Portal', icon: '👨‍🏫', defaultBg: '#042f2e' },
  { id: 'parent',  label: 'Parent Portal',  icon: '👨‍👩‍👧', defaultBg: '#4c0519' },
  { id: 'admin',   label: 'Admin Panel',    icon: '⚙️',  defaultBg: '#0f172a' },
];

const PRESETS = [
  { name: 'Dark Navy',   bg: '#0f172a', text: '#94a3b8', accent: '#2563eb' },
  { name: 'Deep Violet', bg: '#2e1065', text: '#ddd6fe', accent: '#7c3aed' },
  { name: 'Teal Dark',   bg: '#042f2e', text: '#99f6e4', accent: '#0d9488' },
  { name: 'Rose Dark',   bg: '#4c0519', text: '#fecdd3', accent: '#e11d48' },
  { name: 'Deep Blue',   bg: '#1e3a8a', text: '#bfdbfe', accent: '#3b82f6' },
  { name: 'Forest',      bg: '#14532d', text: '#bbf7d0', accent: '#16a34a' },
  { name: 'Charcoal',    bg: '#1c1917', text: '#d6d3d1', accent: '#f97316' },
  { name: 'Indigo',      bg: '#1e1b4b', text: '#c7d2fe', accent: '#6366f1' },
];

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        <input value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
    </div>
  );
}

export default function PortalBrandingPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Portal>('student');
  const [branding, setBranding] = useState<Record<Portal, any>>({
    teacher: { sidebarBg: '#042f2e', sidebarText: '#99f6e4', sidebarAccent: '#0d9488', logo: '' },
    student: { sidebarBg: '#2e1065', sidebarText: '#ddd6fe', sidebarAccent: '#7c3aed', logo: '' },
    parent:  { sidebarBg: '#4c0519', sidebarText: '#fecdd3', sidebarAccent: '#e11d48', logo: '' },
    admin:   { sidebarBg: '#0f172a', sidebarText: '#94a3b8', sidebarAccent: '#2563eb', logo: '' },
  });
  const [saved, setSaved] = useState(false);

  const { data } = useQuery({
    queryKey: ['portal-branding'],
    queryFn: () => apiClient.get('/themes/portal-branding'),
    staleTime: 60000,
  });

  useEffect(() => {
    if (!data) return;
    const d = data as any;
    setBranding(prev => ({
      teacher: { ...prev.teacher, ...(d.teacher || {}) },
      student: { ...prev.student, ...(d.student || {}) },
      parent:  { ...prev.parent,  ...(d.parent  || {}) },
      admin:   { ...prev.admin,   ...(d.admin   || {}) },
    }));
  }, [data]);

  const mut = useMutation({
    mutationFn: (b: any) => apiClient.put('/themes/portal-branding', b),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: ['portal-branding'] }); },
  });

  const set = (key: string, val: string) =>
    setBranding(p => ({ ...p, [tab]: { ...p[tab], [key]: val } }));

  const applyPreset = (preset: typeof PRESETS[0]) =>
    setBranding(p => ({ ...p, [tab]: { ...p[tab], sidebarBg: preset.bg, sidebarText: preset.text, sidebarAccent: preset.accent } }));

  const current = branding[tab];

  return (
    <>
      <Topbar title="Portal Branding" subtitle="Customize sidebar colors for each portal" />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Portal Branding</h1>
            <p className="text-gray-500 text-sm mt-1">Set sidebar colors, accents, and branding per portal</p>
          </div>
          <button onClick={() => mut.mutate(branding)}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">
            {mut.isPending ? 'Saving…' : saved ? '✅ Saved!' : 'Save Branding'}
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {PORTALS.map(p => (
            <button key={p.id} onClick={() => setTab(p.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === p.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Color Settings</h3>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">Quick Presets</p>
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map(pr => (
                  <button key={pr.name} onClick={() => applyPreset(pr)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-gray-100 hover:border-blue-300 transition-colors group">
                    <div className="w-8 h-8 rounded-lg" style={{ background: pr.bg, border: `3px solid ${pr.accent}` }} />
                    <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors text-center leading-tight">{pr.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <ColorInput label="Sidebar Background" value={current.sidebarBg} onChange={v => set('sidebarBg', v)} />
            <ColorInput label="Sidebar Text Color" value={current.sidebarText} onChange={v => set('sidebarText', v)} />
            <ColorInput label="Active / Accent Color" value={current.sidebarAccent} onChange={v => set('sidebarAccent', v)} />

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Logo URL (optional)</label>
              <input value={current.logo || ''} onChange={e => set('logo', e.target.value)}
                placeholder="https://..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Live Preview</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 360 }}>
              <div className="h-full flex flex-col" style={{ background: current.sidebarBg, width: '100%' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: current.sidebarAccent + '40' }}>
                  <div className="flex items-center gap-2">
                    {current.logo
                      ? <img src={current.logo} className="w-8 h-8 rounded-lg object-cover" alt="logo" />
                      : <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: current.sidebarAccent, color: '#fff' }}>S</div>}
                    <div>
                      <p className="font-bold text-xs" style={{ color: '#fff' }}>DEMO SCHOOL</p>
                      <p className="text-xs opacity-60" style={{ color: current.sidebarText }}>
                        {PORTALS.find(p => p.id === tab)?.label}
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="flex-1 px-2 py-3 space-y-1">
                  {['Dashboard', 'Attendance', 'Grades', 'Announcements'].map((item, i) => (
                    <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                      style={{ background: i === 0 ? current.sidebarAccent : 'transparent', color: i === 0 ? '#fff' : current.sidebarText }}>
                      <span>•</span> {item}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
