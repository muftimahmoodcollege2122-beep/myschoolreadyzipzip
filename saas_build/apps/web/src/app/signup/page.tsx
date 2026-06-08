'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 'Free',
    period: '14-day trial',
    color: '#475569',
    highlight: false,
    limits: '200 students · 20 teachers · 1GB',
    features: ['School website', 'Admin dashboard', 'Basic reports', '1 GB storage'],
  },
  {
    id: 'GROWTH',
    name: 'Growth',
    price: '$29',
    period: '/month',
    color: '#2563EB',
    highlight: true,
    limits: '1,000 students · 100 teachers · 10GB',
    features: ['Student & Parent portal', 'SMS notifications', 'Advanced analytics', '10 GB storage'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$79',
    period: '/month',
    color: '#7C3AED',
    highlight: false,
    limits: '5,000 students · 500 teachers · 50GB',
    features: ['AI report cards', 'Custom domain', 'Priority support', '50 GB storage'],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    color: '#D97706',
    highlight: false,
    limits: 'Unlimited everything',
    features: ['Dedicated server', 'SLA guarantee', 'White-label', 'Unlimited storage'],
  },
];

const INSTITUTION_TYPES = [
  'Primary School', 'Secondary School', 'High School', 'College',
  'University', 'Madrasa', 'Coaching Center', 'Other',
];

const TIMEZONES = [
  { label: 'Pakistan (PKT)', value: 'Asia/Karachi' },
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'Bangladesh (BST)', value: 'Asia/Dhaka' },
  { label: 'UAE (GST)', value: 'Asia/Dubai' },
  { label: 'UK (GMT)', value: 'Europe/London' },
  { label: 'US Eastern', value: 'America/New_York' },
  { label: 'US Pacific', value: 'America/Los_Angeles' },
  { label: 'Other (UTC)', value: 'UTC' },
];

function generateSlug(name: string) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .replace(/^-|-$/g, '');
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'STARTER';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [result, setResult] = useState<{ slug: string; tenantId: string } | null>(null);

  const [form, setForm] = useState({
    schoolName: '',
    institutionType: 'High School',
    city: '',
    phone: '',
    timezone: 'Asia/Karachi',
    currency: 'PKR',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    plan: planFromUrl,
  });

  const slug = generateSlug(form.schoolName);

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!form.schoolName || form.schoolName.length < 3) {
      setSlugAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const res = await axios.post(`${API_URL}/api/v1/public/check-slug`, { schoolName: form.schoolName });
        setSlugAvailable(res.data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.schoolName]);

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.schoolName || form.schoolName.length < 3) return setError('School name must be at least 3 characters'), false;
      if (!form.city) return setError('City is required'), false;
      if (slugAvailable === false) return setError('This school name is already taken. Try a different name.'), false;
      return true;
    }
    if (step === 2) {
      if (!form.adminFirstName) return setError('First name is required'), false;
      if (!form.adminLastName) return setError('Last name is required'), false;
      if (!form.adminEmail || !/\S+@\S+\.\S+/.test(form.adminEmail)) return setError('Valid email is required'), false;
      if (!form.adminPassword || form.adminPassword.length < 8) return setError('Password must be at least 8 characters'), false;
      if (form.adminPassword !== form.confirmPassword) return setError('Passwords do not match'), false;
      return true;
    }
    if (step === 3) {
      if (!form.plan) return setError('Please select a plan'), false;
      return true;
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        schoolName: form.schoolName,
        institutionType: form.institutionType,
        city: form.city,
        phone: form.phone,
        timezone: form.timezone,
        currency: form.currency,
        adminFirstName: form.adminFirstName,
        adminLastName: form.adminLastName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminPhone: form.phone,
        plan: form.plan,
        address: { city: form.city },
      };
      const res = await axios.post(`${API_URL}/api/v1/public/signup`, payload);
      setResult({ slug: res.data.slug, tenantId: res.data.tenantId });
      setStep(4);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  return (
    <div className="min-h-screen bg-[#070C14] text-white flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center font-black text-sm">M</div>
          <span className="font-black">MySchool</span>
        </Link>
        {step < 4 && (
          <div className="text-white/30 text-xs">
            Step {step} of 3
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Step indicators */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-3 mb-10">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    step === s ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                    step > s ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-white/5 text-white/20'
                  }`}>
                    {step > s ? '✓' : s}
                  </div>
                  {s < 3 && <div className={`flex-1 max-w-16 h-0.5 transition-all ${step > s ? 'bg-emerald-500/50' : 'bg-white/5'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* STEP 1: School Info */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-black mb-1">School Details</h1>
              <p className="text-white/40 text-sm mb-8">Tell us about your school. This becomes your unique URL.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">School / Institution Name *</label>
                  <input
                    value={form.schoolName}
                    onChange={e => set('schoolName', e.target.value)}
                    placeholder="Springfield College of Excellence"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all text-sm"
                  />
                  {form.schoolName.length >= 3 && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-white/30 font-mono">myschool.app/s/{slug}</span>
                      {checkingSlug ? (
                        <span className="text-white/30">checking...</span>
                      ) : slugAvailable === true ? (
                        <span className="text-emerald-400 font-bold">✓ Available</span>
                      ) : slugAvailable === false ? (
                        <span className="text-red-400 font-bold">✗ Taken</span>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Institution Type *</label>
                  <select
                    value={form.institutionType}
                    onChange={e => set('institutionType', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all text-sm"
                  >
                    {INSTITUTION_TYPES.map(t => <option key={t} value={t} className="bg-gray-900">{t}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">City *</label>
                    <input
                      value={form.city}
                      onChange={e => set('city', e.target.value)}
                      placeholder="Karachi"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Phone</label>
                    <input
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Timezone</label>
                    <select
                      value={form.timezone}
                      onChange={e => set('timezone', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all text-sm"
                    >
                      {TIMEZONES.map(t => <option key={t.value} value={t.value} className="bg-gray-900">{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Currency</label>
                    <select
                      value={form.currency}
                      onChange={e => set('currency', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 transition-all text-sm"
                    >
                      {[['PKR','Pakistani Rupee'],['USD','US Dollar'],['INR','Indian Rupee'],['BDT','Bangladeshi Taka'],['AED','UAE Dirham'],['GBP','British Pound']].map(([v, l]) => (
                        <option key={v} value={v} className="bg-gray-900">{v} — {l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

              <button onClick={next} className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                Continue →
              </button>
            </div>
          )}

          {/* STEP 2: Admin Account */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-black mb-1">Admin Account</h1>
              <p className="text-white/40 text-sm mb-8">You'll be the School Admin. You can add more staff later.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">First Name *</label>
                    <input
                      value={form.adminFirstName}
                      onChange={e => set('adminFirstName', e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Last Name *</label>
                    <input
                      value={form.adminLastName}
                      onChange={e => set('adminLastName', e.target.value)}
                      placeholder="Smith"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={form.adminEmail}
                    onChange={e => set('adminEmail', e.target.value)}
                    placeholder="admin@yourschool.edu"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Password *</label>
                  <input
                    type="password"
                    value={form.adminPassword}
                    onChange={e => set('adminPassword', e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-bold py-3.5 rounded-xl transition-all">
                  ← Back
                </button>
                <button onClick={next} className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Plan Selection */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-black mb-1">Choose Your Plan</h1>
              <p className="text-white/40 text-sm mb-8">Start free, upgrade anytime. No credit card required for Starter.</p>

              <div className="space-y-3">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => set('plan', plan.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      form.plan === plan.id
                        ? 'border-emerald-500/50 bg-emerald-500/10'
                        : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        form.plan === plan.id ? 'border-emerald-400' : 'border-white/20'
                      }`}>
                        {form.plan === plan.id && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: plan.color, flexShrink: 0, marginRight: 4 }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm">{plan.name}</span>
                          {plan.highlight && <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">POPULAR</span>}
                        </div>
                        <div className="text-white/30 text-xs mt-0.5">{plan.limits}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm">{plan.price}</div>
                        <div className="text-white/30 text-xs">{plan.period}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {error && <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-bold py-3.5 rounded-xl transition-all">
                  ← Back
                </button>
                <button
                  onClick={submit}
                  disabled={loading}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-wait text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Launching your school...
                    </span>
                  ) : '🚀 Launch My School →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && result && (
            <div className="text-center">
              <div className="text-6xl mb-6 animate-bounce">🎉</div>
              <h1 className="text-3xl font-black mb-2">Your school is live!</h1>
              <p className="text-white/40 mb-8">Everything is set up and ready. Your school has its own website, admin dashboard, and portals.</p>

              <div className="bg-white/[0.03] border border-emerald-500/30 rounded-2xl p-6 mb-8 text-left space-y-4">
                <div>
                  <div className="text-white/30 text-xs font-bold uppercase tracking-wider mb-1">Your School Website URL</div>
                  <a
                    href={`${appUrl}/s/${result.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-400 font-bold text-sm hover:text-emerald-300 transition-colors break-all"
                  >
                    {appUrl || ''}/s/{result.slug}
                  </a>
                </div>
                <div className="border-t border-white/5" />
                <div>
                  <div className="text-white/30 text-xs font-bold uppercase tracking-wider mb-1">Admin Dashboard</div>
                  <div className="font-mono text-white/60 text-sm">{appUrl}/dashboard</div>
                </div>
                <div className="border-t border-white/5" />
                <div>
                  <div className="text-white/30 text-xs font-bold uppercase tracking-wider mb-1">Login Email</div>
                  <div className="font-mono text-white/60 text-sm">{form.adminEmail}</div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-center"
                >
                  Go to Admin Dashboard →
                </Link>
                <a
                  href={`${appUrl}/s/${result.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-bold py-4 rounded-2xl transition-all text-center"
                >
                  View My School Website ↗
                </a>
              </div>

              <p className="text-white/20 text-xs mt-6">
                Share your school URL with parents, students, and staff — it's live right now!
              </p>
            </div>
          )}

          {step < 4 && (
            <p className="text-center text-white/20 text-xs mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300">Log in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070C14] flex items-center justify-center"><div className="text-white/30">Loading...</div></div>}>
      <SignupForm />
    </Suspense>
  );
}
