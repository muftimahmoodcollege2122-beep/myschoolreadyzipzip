'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { useAdminAuth } from '../../../stores/auth.store';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { user, slug } = useAdminAuth();
  const [saved, setSaved] = useState(false);

  const { data: school } = useQuery({
    queryKey: ['school-settings'],
    queryFn:  () => api.get('/schools/me').catch(() => null),
  });

  const [form, setForm] = useState({
    name: (school as any)?.name || '',
    email: (school as any)?.email || '',
    phone: (school as any)?.phone || '',
    address: (school as any)?.address || '',
    website: (school as any)?.website || '',
    maxStudents: (school as any)?.maxStudents || '',
    currentPassword: '',
    newPassword: '',
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => api.patch('/schools/me', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['school-settings'] }); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (d: any) => api.post('/auth/change-password', d),
    onSuccess: () => alert('Password changed successfully!'),
    onError: (e: any) => alert(e?.message || 'Failed to change password'),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your school profile and preferences</p>
      </div>

      {/* School Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">School Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl">🏫</div>
            <div>
              <p className="font-bold text-indigo-900">{slug?.toUpperCase()}</p>
              <p className="text-sm text-indigo-600">School ID (cannot be changed)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'School Name', key: 'name', type: 'text', placeholder: 'Beaconhouse School' },
              { label: 'Contact Email', key: 'email', type: 'email', placeholder: 'info@school.edu.pk' },
              { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '021-1234567' },
              { label: 'Website', key: 'website', type: 'url', placeholder: 'https://school.edu.pk' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
              <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="School full address…" rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-green-600 font-semibold">✅ Settings saved!</span>}
            <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm ml-auto">
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">Change Password</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
              <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min 8 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button onClick={() => changePasswordMutation.mutate({ currentPassword: form.currentPassword, newPassword: form.newPassword })}
            disabled={changePasswordMutation.isPending || !form.currentPassword || !form.newPassword}
            className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
            {changePasswordMutation.isPending ? 'Changing…' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Portal Links */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-1">📡 Your Portal URLs</h3>
        <p className="text-sm text-indigo-200 mb-4">Share these links with your community</p>
        <div className="space-y-2">
          {[
            { label: '👨‍🏫 Teacher Portal',  url: `https://teach.myschool.pk?school=${slug}` },
            { label: '👩‍🎓 Student Portal',  url: `https://learn.myschool.pk?school=${slug}` },
            { label: '👨‍👩‍👧 Parent Portal', url: `https://parent.myschool.pk?school=${slug}` },
            { label: '🌐 Marketing Site',   url: `https://${slug}.myschool.pk` },
          ].map(({ label, url }) => (
            <div key={url} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-indigo-200 font-mono flex-1 truncate">{url}</span>
              <button onClick={() => navigator.clipboard?.writeText(url)} className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-all">Copy</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
