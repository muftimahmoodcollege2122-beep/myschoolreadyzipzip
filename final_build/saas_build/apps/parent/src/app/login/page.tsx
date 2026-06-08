'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setTokens } from '../../lib/api-client';
import { useParentAuth } from '../../stores/auth.store';

export default function ParentLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth, isAuthenticated } = useParentAuth();

  const [slug,     setSlug]     = useState(params.get('school') || '');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => { if (isAuthenticated()) router.replace('/dashboard'); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) { setError('Please enter your school ID'); return; }
    setLoading(true); setError('');
    try {
      const data: any = await api.post('/auth/login', { email, password, slug: slug.trim(), expectedRole: 'PARENT' });
      if (data?.accessToken) {
        setTokens(data.accessToken, slug.trim());
        setAuth(data.accessToken, data.user, slug.trim());
        router.push('/dashboard');
      } else { setError(data?.message || 'Invalid credentials'); }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Contact your school admin.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-rose-800 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-2xl">👨‍👩‍👧</div>
          <h1 className="text-3xl font-black text-white">Parent Portal</h1>
          <p className="text-rose-300 mt-2 text-sm">EduOS School Management System</p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Sign in to your portal</h2>
          <p className="text-sm text-gray-500 mb-6">Monitor your child's attendance, grades and fees in real time</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">School ID</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. beaconhouse" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="parent@email.com" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all text-sm mt-2">
              {loading ? 'Signing in…' : 'Sign In to Parent Portal'}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 text-center">
              First time? Credentials were emailed to you by your school.
            </div>
          </div>
        </div>
        <p className="text-center text-rose-400 text-xs mt-6">Powered by <span className="text-white font-bold">EduOS</span></p>
      </div>
    </div>
  );
}
