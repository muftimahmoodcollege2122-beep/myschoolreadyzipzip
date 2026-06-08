'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api-client';
import { useAuthStore } from '../../../../stores/auth.store';

export default function ParentLogin() {
  const { slug }   = useParams<{ slug: string }>();
  const router     = useRouter();
  const setAuth    = useAuthStore(s => s.setAuth);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data: any = await apiClient.post('/auth/login', { email, password, slug, expectedRole: 'PARENT' });
      if (data?.accessToken) {
        setAuth(data.accessToken, data.user);
        router.push(`/parent/${slug}`);
      } else {
        setError(data?.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-rose-800 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">👨‍👩‍👧</div>
          <h1 className="text-2xl font-black text-white">Parent Portal</h1>
          <p className="text-rose-300 mt-1 text-sm capitalize">
            {slug.replace(/-/g, ' ')} School
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Sign in to your portal</h2>
          <p className="text-sm text-gray-500 mb-6">Monitor your child's attendance, grades and fees</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="parent@email.com"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all text-sm mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In to Parent Portal'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 mb-4">
              <span className="font-bold">First time?</span> Your account credentials were sent to this email by your school's administrator. Check your inbox.
            </div>
            <p className="text-xs text-gray-400 text-center">
              Not a parent?{' '}
              <a href={`/t/${slug}/login`} className="text-rose-600 hover:underline font-medium">Teacher Portal</a>
              {' · '}
              <a href={`/learn/${slug}/login`} className="text-rose-600 hover:underline font-medium">Student Portal</a>
            </p>
          </div>
        </div>

        <p className="text-center text-rose-400 text-xs mt-6">
          Powered by <span className="font-bold text-white">EduOS</span>
        </p>
      </div>
    </div>
  );
}
