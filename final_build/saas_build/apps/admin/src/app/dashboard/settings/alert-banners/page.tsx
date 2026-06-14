'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Topbar } from '../../../../components/layout/topbar';

type BannerType = 'info' | 'warning' | 'error' | 'success';
type Portal = 'teacher' | 'student' | 'parent' | 'admin';

interface Banner {
  id: string;
  message: string;
  type: BannerType;
  portals: Portal[];
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

const TYPE_STYLES: Record<BannerType, { bg: string; text: string; border: string; icon: string; label: string }> = {
  info:    { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', icon: 'ℹ️', label: 'Info' },
  warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', icon: '⚠️', label: 'Warning' },
  error:   { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', icon: '🚨', label: 'Emergency' },
  success: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', icon: '✅', label: 'Success' },
};

const ALL_PORTALS: Portal[] = ['teacher', 'student', 'parent', 'admin'];

function newBanner(): Banner {
  return {
    id: crypto.randomUUID(),
    message: '',
    type: 'info',
    portals: ['teacher', 'student', 'parent'],
    active: true,
    expiresAt: '',
    createdAt: new Date().toISOString(),
  };
}

export default function AlertBannersPage() {
  const qc = useQueryClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['alert-banners-all'],
    queryFn: () => apiClient.get('/themes/alert-banners'),
    staleTime: 30000,
  });

  useEffect(() => {
    if (data) setBanners((data as any) || []);
  }, [data]);

  const mut = useMutation({
    mutationFn: (b: Banner[]) => apiClient.put('/themes/alert-banners', { banners: b }),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: ['alert-banners-all'] }); },
  });

  const addBanner = () => setBanners(p => [newBanner(), ...p]);

  const updateBanner = (id: string, patch: Partial<Banner>) =>
    setBanners(p => p.map(b => b.id === id ? { ...b, ...patch } : b));

  const deleteBanner = (id: string) => setBanners(p => p.filter(b => b.id !== id));

  const togglePortal = (id: string, portal: Portal) =>
    setBanners(p => p.map(b => {
      if (b.id !== id) return b;
      const has = b.portals.includes(portal);
      return { ...b, portals: has ? b.portals.filter(x => x !== portal) : [...b.portals, portal] };
    }));

  return (
    <>
      <Topbar title="Alert Banners" subtitle="Send emergency alerts and notices across all portals" />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Alert Banners</h1>
            <p className="text-gray-500 text-sm mt-1">Show emergency notices, announcements, and alerts across any portal</p>
          </div>
          <div className="flex gap-3">
            <button onClick={addBanner}
              className="px-4 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800">
              + New Banner
            </button>
            <button onClick={() => mut.mutate(banners)}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">
              {mut.isPending ? 'Saving…' : saved ? '✅ Saved!' : 'Save All'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📢</p>
            <p className="font-bold text-gray-700">No banners yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "New Banner" to create your first alert</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map(banner => {
              const style = TYPE_STYLES[banner.type];
              return (
                <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b" style={{ background: style.bg, borderColor: style.border }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{style.icon}</span>
                        <span className="font-bold text-sm" style={{ color: style.text }}>{style.label} Banner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateBanner(banner.id, { active: !banner.active })}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${banner.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${banner.active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                        </button>
                        <span className="text-xs font-medium" style={{ color: style.text }}>{banner.active ? 'Active' : 'Inactive'}</span>
                        <button onClick={() => deleteBanner(banner.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center text-xs transition-colors">✕</button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Message</label>
                      <textarea value={banner.message} onChange={e => updateBanner(banner.id, { message: e.target.value })}
                        rows={2} placeholder="e.g. School will be closed tomorrow due to public holiday"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Type</label>
                        <select value={banner.type} onChange={e => updateBanner(banner.id, { type: e.target.value as BannerType })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                          {Object.entries(TYPE_STYLES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expires At (optional)</label>
                        <input type="datetime-local" value={banner.expiresAt || ''} onChange={e => updateBanner(banner.id, { expiresAt: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Show In Portals</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {ALL_PORTALS.map(p => (
                            <button key={p} onClick={() => togglePortal(banner.id, p)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors capitalize ${banner.portals.includes(p) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {banner.message && (
                      <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                        {style.icon} {banner.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
