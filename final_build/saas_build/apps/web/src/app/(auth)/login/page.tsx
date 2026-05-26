'use client';
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); } catch (err: any) { setError(err?.response?.data?.message ?? 'Invalid credentials'); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F2137] via-[#1a3270] to-[#1A7F5A] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-xl">M</div>
          <h1 className="text-2xl font-black text-white">MySchool App</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to your school portal</p>
        </div>
        <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-8 shadow-2xl">
          {error && <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-white/60 text-xs font-bold uppercase tracking-wide mb-2">Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@school.edu.pk"
                className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/25 outline-none focus:border-green-400 transition-all text-sm"/>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-bold uppercase tracking-wide mb-2">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/25 outline-none focus:border-green-400 transition-all text-sm"/>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-green-500/30 mt-2">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <p className="text-white/25 text-xs text-center mt-6">Powered by NexGen Edu</p>
        </div>
      </div>
    </div>
  );
}
