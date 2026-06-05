'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const preSlug  = params.get('slug')  || '';
  const preEmail = params.get('email') || '';
  const firstLogin = params.get('firstLogin') === 'true';

  const [slug,     setSlug]     = useState(preSlug);
  const [email,    setEmail]    = useState(preEmail);
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { setAuth, setTenantSlug } = useAuthStore();

  /* Autofill from URL params after mount */
  useEffect(() => {
    if (preSlug)  setSlug(preSlug);
    if (preEmail) setEmail(preEmail);
  }, [preSlug, preEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const tenantSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tenantSlug) { setError('Please enter your school domain.'); setLoading(false); return; }

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantSlug,
        },
        body: JSON.stringify({ email: email.trim(), password, tenantSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message;
        setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Invalid credentials. Please try again.'));
        setLoading(false);
        return;
      }

      if (data.tenantSlug) setTenantSlug(data.tenantSlug);
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');

    } catch {
      setError('Connection error — please check your internet and try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex w-[42%] flex-col justify-between p-12"
        style={{ background: 'linear-gradient(150deg, #0C1E35, #0F3D6E)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
          <span className="text-white font-black text-lg">MySchool</span>
        </Link>

        <div>
          <h2 className="text-3xl font-black text-white mb-3 leading-tight">
            Your School&apos;s<br />Complete Operating System
          </h2>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Manage students, staff, fees, academics, and communications from one place.
          </p>

          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              ['500+', 'Schools Onboarded'],
              ['120K+', 'Students Managed'],
              ['Rs 2B+', 'Fees Processed'],
              ['99.9%', 'Platform Uptime'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl p-3.5 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-white font-black text-xl leading-none">{v}</p>
                <p className="text-white/35 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
            </div>
            <p className="text-white/70 text-sm leading-relaxed italic">&ldquo;Fee collection improved 42% in the first month. The parent portal eliminated 80% of phone enquiries.&rdquo;</p>
            <p className="text-white/40 text-xs mt-2 font-semibold">Dr. Fatima Malik — Beacon House School System</p>
          </div>
        </div>

        <p className="text-white/20 text-xs">
          © {new Date().getFullYear()} MySchool Technologies. All rights reserved.
        </p>
      </div>

      {/* ── Right: Login form ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <span className="text-gray-900 font-black text-lg">MySchool</span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-1">Sign in to your portal</h1>
          <p className="text-gray-400 text-sm mb-7">Enter your school domain and credentials to continue.</p>

          {/* First-login banner */}
          {firstLogin && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-amber-800 font-bold text-xs">Welcome to your new school portal!</p>
                <p className="text-amber-700 text-xs mt-0.5">Please change your temporary password after your first login via Settings → Security.</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex gap-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"/>
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* School Domain */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                School Domain <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all bg-white">
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                  placeholder="yourschool"
                  required
                  autoComplete="organization"
                  className="flex-1 px-4 py-3 text-sm outline-none font-medium"
                />
                <span className="px-3 bg-gray-50 text-gray-400 text-xs border-l border-gray-200 py-3 font-mono">.myschool.pk</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">The domain you chose during registration.</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourschool.edu.pk"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Password <span className="text-red-500">*</span>
                </label>
                <button type="button" tabIndex={-1} className="text-xs text-blue-600 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all bg-white pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-blue-600/20 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>

          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <p className="font-bold mb-1">Demo credentials</p>
            <p>Domain: <span className="font-mono font-semibold">demo</span></p>
            <p>Email: <span className="font-mono font-semibold">admin@demo.edu</span></p>
            <p>Password: <span className="font-mono font-semibold">Admin@123456</span></p>
          </div>

          <p className="text-center text-gray-400 text-xs mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Register your school →</Link>
          </p>

          <p className="text-center text-gray-300 text-xs mt-3">
            By signing in, you agree to our{' '}
            <a href="#" className="underline">Terms</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
