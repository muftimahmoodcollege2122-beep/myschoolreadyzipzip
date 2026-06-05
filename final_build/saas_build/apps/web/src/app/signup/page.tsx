'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STEPS = ['School Info', 'Contact', 'Domain', 'Plan'];

const COUNTRIES = [
  'Pakistan', 'Saudi Arabia', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Canada', 'Australia', 'Bangladesh', 'India', 'Other',
];

const PLANS = [
  {
    name: 'Starter', price: '4,999', students: 'Up to 500 students',
    features: ['School website', 'Admin portal', 'Attendance & fees', 'Email support'],
  },
  {
    name: 'Professional', price: '12,999', students: 'Up to 2,000 students', recommended: true,
    features: ['All Starter features', 'LMS & courses', 'Teacher & parent portals', 'AI Assistant', 'SMS integration'],
  },
  {
    name: 'Enterprise', price: '29,999', students: 'Unlimited students',
    features: ['All Pro features', 'White-label branding', 'Custom domain', 'API access', 'Dedicated SLA'],
  },
];

const PROV_STEPS = [
  'Creating tenant database...',
  'Generating school website...',
  'Configuring subdomain...',
  'Setting up admin account...',
  'Configuring access roles...',
  'Enabling billing module...',
  'Sending login credentials...',
  'Launching onboarding wizard...',
];

interface ProvisionResult {
  slug: string;
  schoolName: string;
  adminEmail: string;
  tempPassword: string;
  websiteUrl: string;
  loginUrl: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]             = useState(1);
  const [provisioning, setProvisioning] = useState(false);
  const [provStep, setProvStep]     = useState(0);
  const [result, setResult]         = useState<ProvisionResult | null>(null);
  const [countdown, setCountdown]   = useState(10);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const [form, setForm] = useState({
    schoolName: '', principalName: '', email: '', phone: '',
    country: 'Pakistan', studentCount: '', domain: '', plan: 'Professional',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const suggestedDomain = form.schoolName
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30) || 'yourschool';

  /* Countdown → auto-redirect to login after success */
  useEffect(() => {
    if (!result) return;
    if (countdown <= 0) {
      const params = new URLSearchParams({ slug: result.slug, email: result.adminEmail, firstLogin: 'true' });
      router.push(`/login?${params.toString()}`);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [result, countdown, router]);

  const canAdvance = () => {
    if (step === 1) return form.schoolName.trim().length >= 3 && form.principalName.trim().length >= 2;
    if (step === 2) return form.email.includes('@') && form.phone.trim().length >= 7;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const domain = form.domain || suggestedDomain;

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, domain }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message || 'Registration failed. Please try again.';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
        setLoading(false);
        return;
      }

      setLoading(false);
      setProvisioning(true);
      for (let i = 0; i < PROV_STEPS.length; i++) {
        await new Promise(r => setTimeout(r, 450 + Math.random() * 250));
        setProvStep(i + 1);
      }
      await new Promise(r => setTimeout(r, 500));
      setResult(data);
      setProvisioning(false);

    } catch {
      setLoading(false);
      setError('Network error — please check your connection and try again.');
    }
  };

  const next = () => {
    if (step < 4) { setStep(s => s + 1); setError(''); }
    else handleSubmit();
  };

  /* ── Success Screen ── */
  if (result) {
    const loginUrl = `/login?slug=${result.slug}&email=${encodeURIComponent(result.adminEmail)}&firstLogin=true`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <h1 className="text-2xl font-black text-gray-900 text-center mb-2">Your School is Live!</h1>
          <p className="text-gray-500 text-center text-sm mb-7 leading-relaxed">
            Your complete school management system is ready. Login credentials below — also sent to your email.
          </p>

          <div className="bg-gray-50 rounded-xl p-5 mb-5 space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">School Website</span>
              <span className="text-sm font-bold text-blue-600">{result.websiteUrl}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Admin Portal</span>
              <span className="text-sm font-bold text-blue-600">{result.slug}.myschool.pk/dashboard</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Login Email</span>
              <span className="text-sm font-mono font-semibold text-gray-900">{result.adminEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Temp Password</span>
              <span className="text-sm font-mono font-bold text-gray-900 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-lg">
                {result.tempPassword}
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-800">
            <p className="font-bold mb-0.5">Change your password after first login</p>
            <p className="text-amber-700">Your school portal is on a 30-day free trial with full access.</p>
          </div>

          <Link href={loginUrl} className="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-center text-sm transition-colors mb-3">
            Go to Admin Portal →
          </Link>

          <p className="text-center text-xs text-gray-400">
            Redirecting automatically in <span className="font-bold text-gray-600">{countdown}s</span>...
            <button onClick={() => setCountdown(0)} className="ml-2 text-blue-600 hover:underline">Go now</button>
          </p>
        </div>
      </div>
    );
  }

  /* ── Provisioning Screen ── */
  if (provisioning) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0C1E35' }}>
        <div className="rounded-2xl border border-white/10 p-10 max-w-md w-full" style={{ background: '#0F2D50' }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <h2 className="text-xl font-black text-white">Provisioning Your School</h2>
            <p className="text-white/40 text-sm mt-1">Building your complete school OS — about 30 seconds</p>
          </div>
          <div className="space-y-2.5 mb-6">
            {PROV_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i < provStep ? 'text-emerald-400' : i === provStep ? 'text-blue-300' : 'text-white/15'}`}>
                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  {i < provStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  ) : i === provStep ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                  )}
                </span>
                <span className="font-medium">{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(provStep / PROV_STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-white/25 text-xs text-center mt-2">{Math.round((provStep / PROV_STEPS.length) * 100)}% complete</p>
        </div>
      </div>
    );
  }

  /* ── Registration Form ── */
  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Left panel */}
      <div className="hidden lg:flex w-[42%] flex-col justify-between p-12"
        style={{ background: 'linear-gradient(150deg, #0C1E35, #0F3D6E)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
          <span className="text-white font-black text-lg">MySchool</span>
        </Link>
        <div>
          <h2 className="text-3xl font-black text-white mb-3 leading-tight">Your Complete School OS — Live in Minutes</h2>
          <p className="text-white/50 text-sm mb-7 leading-relaxed">No developers. No technical setup. Everything provisioned automatically.</p>
          <ul className="space-y-3">
            {['School website with custom domain', 'Admin, teacher, parent & student portals', 'AI-powered automation & reports', 'Online fee collection & financial analytics', 'QR attendance & digital report cards', 'WhatsApp & SMS parent notifications'].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['F', 'A', 'S', 'B'].map((l, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-blue-500/60 border-2 border-white/20 flex items-center justify-center text-white text-xs font-bold">{l}</div>
            ))}
          </div>
          <div>
            <p className="text-white font-bold text-sm">500+ schools trust MySchool</p>
            <p className="text-white/40 text-xs">Pakistan&apos;s largest school management platform</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${i < step - 1 ? 'text-blue-600' : i === step - 1 ? 'text-gray-900' : 'text-gray-300'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${i < step - 1 ? 'bg-blue-600 text-white' : i === step - 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < step - 1 ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step - 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Step 1 — School Info */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-black text-gray-900 mb-1">Tell us about your school</h2>
                <p className="text-gray-400 text-sm mb-6">Takes 2 minutes. No technical knowledge needed.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">School / Institution Name <span className="text-red-500">*</span></label>
                    <input value={form.schoolName} onChange={e => set('schoolName', e.target.value)} placeholder="e.g. Beacon House School System"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Principal / Owner Full Name <span className="text-red-500">*</span></label>
                    <input value={form.principalName} onChange={e => set('principalName', e.target.value)} placeholder="Dr. Ahmed Khan"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Country</label>
                    <select value={form.country} onChange={e => set('country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-blue-400 transition-all">
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Approximate Student Count</label>
                    <select value={form.studentCount} onChange={e => set('studentCount', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-blue-400 transition-all">
                      <option value="">Select a range</option>
                      {['1–100', '101–500', '501–1,000', '1,001–2,000', '2,001–5,000', '5,000+'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Step 2 — Contact */}
            {step === 2 && (
              <>
                <h2 className="text-xl font-black text-gray-900 mb-1">Contact Information</h2>
                <p className="text-gray-400 text-sm mb-6">We&apos;ll send your login credentials to these details.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Work Email Address <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="principal@yourschool.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">WhatsApp / Phone Number <span className="text-red-500">*</span></label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+92-300-1234567"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"/>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                    <p className="font-bold text-blue-800 mb-2 text-xs">After provisioning, we automatically send:</p>
                    <ul className="space-y-1 text-xs text-blue-700">
                      {['Admin portal login URL', 'Username & temporary password', 'School website link', 'Onboarding checklist & guide'].map(i => (
                        <li key={i} className="flex items-center gap-2"><span className="text-blue-400">•</span>{i}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 — Domain */}
            {step === 3 && (
              <>
                <h2 className="text-xl font-black text-gray-900 mb-1">Choose Your Domain</h2>
                <p className="text-gray-400 text-sm mb-6">Your school website will be live at this address instantly.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subdomain Preference</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                      <input
                        value={form.domain || suggestedDomain}
                        onChange={e => set('domain', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30))}
                        className="flex-1 px-4 py-3 text-sm outline-none font-mono"
                        placeholder={suggestedDomain}
                      />
                      <span className="px-3 py-3 bg-gray-50 text-gray-400 text-xs border-l border-gray-200 font-mono font-semibold">.myschool.pk</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1.5 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      Available: {form.domain || suggestedDomain}.myschool.pk
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-xs">
                    <p className="font-bold text-blue-800 mb-2">Your school website will include:</p>
                    <div className="grid grid-cols-2 gap-1 text-blue-700">
                      {['Homepage', 'About Us', 'Admissions', 'Staff Directory', 'News & Events', 'Gallery', 'Contact Form', 'SEO Optimized'].map(p => (
                        <span key={p} className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4 — Plan */}
            {step === 4 && (
              <>
                <h2 className="text-xl font-black text-gray-900 mb-1">Choose Your Plan</h2>
                <p className="text-gray-400 text-sm mb-6">Start free for 30 days. No credit card required.</p>
                <div className="space-y-3 mb-4">
                  {PLANS.map(p => (
                    <label key={p.name} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.plan === p.name ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" name="plan" value={p.name} checked={form.plan === p.name} onChange={e => set('plan', e.target.value)} className="sr-only"/>
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.plan === p.name ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                        {form.plan === p.name && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-gray-900 text-sm">{p.name}</p>
                          {p.recommended && <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full">POPULAR</span>}
                        </div>
                        <p className="text-xs text-gray-400 mb-1.5">{p.students}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {p.features.slice(0, 3).map(f => <span key={f} className="text-xs text-gray-500">{f}</span>)}
                        </div>
                      </div>
                      <p className="font-black text-gray-900 text-sm whitespace-nowrap">Rs. {p.price}<span className="text-gray-400 font-normal text-xs">/mo</span></p>
                    </label>
                  ))}
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs">
                  <p className="font-bold text-emerald-800">30-day free trial included — full access, no card required</p>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button onClick={() => { setStep(s => s - 1); setError(''); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm transition-all">
                  ← Back
                </button>
              )}
              <button onClick={next} disabled={!canAdvance() || loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Processing...
                  </>
                ) : step === 4 ? 'Create My School →' : 'Continue →'}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
