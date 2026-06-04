'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const STEPS = ['School Info', 'Contact', 'Domain', 'Plan'];

const COUNTRIES = ['Pakistan', 'Saudi Arabia', 'UAE', 'UK', 'USA', 'Canada', 'Australia', 'Other'];
const PLANS = [
  { name:'Starter', price:'4,999', students:'500 students', color:'border-gray-200', active:'border-blue-500 bg-blue-50' },
  { name:'Professional', price:'12,999', students:'2,000 students', color:'border-gray-200', active:'border-blue-500 bg-blue-50', recommended: true },
  { name:'Enterprise', price:'29,999', students:'Unlimited', color:'border-gray-200', active:'border-blue-500 bg-blue-50' },
];

const PROVISIONING_STEPS = [
  'Creating tenant database...',
  'Generating school website...',
  'Configuring subdomain...',
  'Setting up admin account...',
  'Configuring RBAC roles...',
  'Enabling billing module...',
  'Sending welcome credentials...',
  'Launching onboarding wizard...',
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [provisioning, setProvisioning] = useState(false);
  const [provStep, setProvStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    schoolName: '', principalName: '', email: '', phone: '', country: 'Pakistan',
    studentCount: '', domain: '', plan: 'Professional',
  });

  const next = () => {
    if (step < 4) setStep(s => s + 1);
    else startProvisioning();
  };

  const startProvisioning = async () => {
    setProvisioning(true);
    for (let i = 0; i < PROVISIONING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setProvStep(i + 1);
    }
    await new Promise(r => setTimeout(r, 800));
    setDone(true);
  };

  const suggestedDomain = form.schoolName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g,'') || 'yourschool';

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🎉</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Your School is Live!</h1>
          <p className="text-gray-500 mb-6">Your complete school management system has been created successfully.</p>
          <div className="bg-gray-50 rounded-2xl p-5 text-left mb-6 space-y-2 text-sm">
            <p><span className="text-gray-400">Website URL:</span> <span className="font-bold text-blue-600">{suggestedDomain}.myschool.pk</span></p>
            <p><span className="text-gray-400">Admin Portal:</span> <span className="font-bold text-blue-600">{suggestedDomain}.myschool.pk/dashboard</span></p>
            <p><span className="text-gray-400">Email:</span> <span className="font-bold text-gray-900">{form.email}</span></p>
            <p><span className="text-gray-400">Temp Password:</span> <span className="font-mono font-bold text-gray-900">School@{new Date().getFullYear()}</span></p>
          </div>
          <p className="text-xs text-gray-400 mb-5">Login credentials sent via email and SMS to {form.phone}</p>
          <Link href="/login" className="block w-full py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 text-center">Go to Admin Portal →</Link>
        </div>
      </div>
    );
  }

  if (provisioning) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-[#0F2137] rounded-3xl border border-white/10 p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">⚡</div>
            <h2 className="text-2xl font-black text-white">Setting Up Your School</h2>
            <p className="text-blue-300/60 text-sm mt-1">This takes about 30 seconds...</p>
          </div>
          <div className="space-y-3">
            {PROVISIONING_STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i < provStep ? 'text-green-400' : i === provStep ? 'text-blue-300' : 'text-white/20'}`}>
                <span className="flex-shrink-0 w-5 h-5 text-xs">
                  {i < provStep ? '✅' : i === provStep ? '⏳' : '○'}
                </span>
                {s}
              </div>
            ))}
          </div>
          {provStep > 0 && (
            <div className="mt-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(provStep / PROVISIONING_STEPS.length) * 100}%` }} />
              </div>
              <p className="text-blue-300/40 text-xs text-center mt-2">{Math.round((provStep / PROVISIONING_STEPS.length) * 100)}% complete</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#0F2137] to-[#1E4D7B] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xl">M</div>
          <span className="text-white font-black text-xl">MySchool</span>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">Your Complete School OS — Live in Minutes</h1>
          <p className="text-blue-200/70 mb-8">Everything your school needs: website, management, AI, portals — all automatically provisioned.</p>
          <div className="space-y-3">
            {['School website + custom domain', 'Admin, teacher, parent & student portals', 'AI-powered automation', 'Fee collection & financial reports', 'QR attendance & digital report cards', 'WhatsApp & SMS notifications'].map(f => (
              <div key={f} className="flex items-center gap-3 text-blue-100/80 text-sm">
                <span className="text-green-400 font-black">✓</span>{f}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['F','A','S','B'].map((l,i)=><div key={i} className="w-9 h-9 rounded-full bg-blue-500 border-2 border-white/20 flex items-center justify-center text-white font-bold text-sm">{l}</div>)}
          </div>
          <div>
            <p className="text-white font-bold text-sm">500+ schools trust MySchool</p>
            <p className="text-blue-300/60 text-xs">Join Pakistan&apos;s largest school network</p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${i < step - 1 ? 'text-blue-600' : i === step - 1 ? 'text-gray-900' : 'text-gray-300'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i < step - 1 ? 'bg-blue-600 text-white' : i === step - 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < step - 1 ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-bold hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step - 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            {step === 1 && (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Tell us about your school</h2>
                <p className="text-gray-400 text-sm mb-6">This takes 2 minutes. No technical knowledge needed.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">School / Institution Name *</label>
                    <input value={form.schoolName} onChange={e=>setForm(f=>({...f,schoolName:e.target.value}))} placeholder="e.g. Beacon House School System" className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Principal / Owner Name *</label>
                    <input value={form.principalName} onChange={e=>setForm(f=>({...f,principalName:e.target.value}))} placeholder="Dr. Ahmed Khan" className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Country</label>
                    <select value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white outline-none focus:border-blue-400">
                      {COUNTRIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Approx. Student Count</label>
                    <select value={form.studentCount} onChange={e=>setForm(f=>({...f,studentCount:e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white outline-none focus:border-blue-400">
                      <option value="">Select range</option>
                      {['1-100','101-500','501-1000','1001-2000','2001-5000','5000+'].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Contact Information</h2>
                <p className="text-gray-400 text-sm mb-6">We&apos;ll send your login credentials to these details.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Email Address *</label>
                    <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="principal@yourschool.com" className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">WhatsApp / Phone *</label>
                    <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+92-300-1234567" className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"/>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                    <p className="font-bold mb-1">📧 After setup, we&apos;ll automatically send:</p>
                    <ul className="space-y-1 text-blue-600/80 text-xs">
                      <li>• Login URL for your admin portal</li>
                      <li>• Username & temporary password</li>
                      <li>• School website link</li>
                      <li>• Onboarding video guide</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Choose Your Domain</h2>
                <p className="text-gray-400 text-sm mb-6">Your school website will be live at this address instantly.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Subdomain Preference</label>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-2xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50">
                      <input value={form.domain || suggestedDomain} onChange={e=>setForm(f=>({...f,domain:e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}))} className="flex-1 px-4 py-3 text-sm outline-none" placeholder={suggestedDomain}/>
                      <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-l border-gray-200 font-mono">.myschool.pk</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1.5 font-semibold">✓ Available: {form.domain||suggestedDomain}.myschool.pk</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">Custom Domain (Optional)</p>
                    <input placeholder="www.yourschool.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white"/>
                    <p className="text-xs text-gray-400 mt-1.5">Connect your own domain after setup in Settings → Domain</p>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 text-sm">
                    <p className="font-bold text-blue-800 mb-2">🌐 Your school website will include:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-blue-600">
                      {['Homepage','About Us','Admissions','Staff Directory','News & Events','Gallery','Contact Form','SEO Optimized'].map(p=><span key={p}>✓ {p}</span>)}
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Choose Your Plan</h2>
                <p className="text-gray-400 text-sm mb-6">Start free for 30 days. No credit card needed.</p>
                <div className="space-y-3 mb-4">
                  {PLANS.map(p => (
                    <label key={p.name} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.plan===p.name?p.active:'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="plan" value={p.name} checked={form.plan===p.name} onChange={e=>setForm(f=>({...f,plan:e.target.value}))} className="sr-only"/>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.plan===p.name?'border-blue-500 bg-blue-500':'border-gray-300'}`}>
                        {form.plan===p.name&&<div className="w-2 h-2 rounded-full bg-white"/>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-900">{p.name}</p>
                          {p.recommended&&<span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full">POPULAR</span>}
                        </div>
                        <p className="text-xs text-gray-400">{p.students}</p>
                      </div>
                      <p className="font-black text-gray-900 text-sm">Rs. {p.price}<span className="text-gray-400 font-normal">/mo</span></p>
                    </label>
                  ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800">
                  <p className="font-bold">🎁 30-day free trial included</p>
                  <p className="text-green-600 text-xs mt-0.5">Full access to all features. Cancel anytime. No credit card required.</p>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && <button onClick={()=>setStep(s=>s-1)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50">← Back</button>}
              <button
                onClick={next}
                disabled={(step===1&&(!form.schoolName||!form.principalName))||(step===2&&(!form.email||!form.phone))}
                className="flex-1 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {step===4?'🚀 Create My School →':'Continue →'}
              </button>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
