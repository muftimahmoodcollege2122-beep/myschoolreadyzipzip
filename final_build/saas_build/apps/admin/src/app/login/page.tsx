'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setTokens } from '../../lib/api-client';
import { useAdminAuth } from '../../stores/auth.store';

export default function AdminLogin() {
  const router     = useRouter();
  const params     = useSearchParams();
  const { setAuth, isAuthenticated } = useAdminAuth();

  const [slug,     setSlug]     = useState(params.get('school') || '');
  const [email,    setEmail]    = useState(params.get('email')  || '');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => { if (isAuthenticated()) router.replace('/dashboard'); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) { setError('Please enter your school ID'); return; }
    setLoading(true); setError('');
    try {
      const data: any = await api.post('/auth/login', { email, password, slug: slug.trim(), expectedRole: 'SCHOOL_ADMIN' });
      if (data?.accessToken) {
        setTokens(data.accessToken, slug.trim());
        setAuth(data.accessToken, data.user, slug.trim());
        router.push('/dashboard');
      } else { setError(data?.message || 'Invalid credentials'); }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-2xl">🏫</div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-2 text-sm">EduOS School Management System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Sign in to your school</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">School ID (Slug)</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. beaconhouse" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono" />
              <p className="text-xs text-gray-400 mt-1">Your unique school identifier provided at signup</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@school.edu.pk" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all text-sm mt-2">
              {loading ? 'Signing in…' : 'Sign In to Admin Dashboard'}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-xs text-gray-400">Share portals with your staff:</p>
            <div className="flex justify-center gap-4 text-xs">
              <span className="text-teal-600 font-medium">👨‍🏫 teach.myschool.pk</span>
              <span className="text-violet-600 font-medium">👩‍🎓 learn.myschool.pk</span>
              <span className="text-rose-600 font-medium">👨‍👩‍👧 parent.myschool.pk</span>
            </div>
          </div>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6">Powered by <span className="text-white font-bold">EduOS</span></p>
      </div>
    </div>
  );
}
