'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const FEATURES = [
  { icon: '🌐', title: 'Instant Website', desc: 'Your school gets a beautiful public website the moment you sign up. Share your URL with parents and students.' },
  { icon: '🎓', title: 'Student Portal', desc: 'Students log in to view timetables, grades, attendance, and fee status — all in one place.' },
  { icon: '👨‍👩‍👧', title: 'Parent Portal', desc: 'Parents track their child\'s progress, receive alerts, and pay fees — from any device.' },
  { icon: '📊', title: 'Admin Dashboard', desc: 'Manage everything — staff, students, exams, fees, reports — from a single powerful dashboard.' },
  { icon: '📱', title: 'Real-time Alerts', desc: 'Instant notifications for attendance, fees, announcements, and exam results via SMS, email, and in-app.' },
  { icon: '🤖', title: 'AI-Powered Reports', desc: 'Auto-generate report cards, predict at-risk students, and get smart insights on school performance.' },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '14-day trial',
    color: 'from-slate-600 to-slate-800',
    border: 'border-slate-600/30',
    badge: null,
    features: ['Up to 200 students', '20 teachers', 'School website', 'Admin dashboard', 'Basic reports', '1 GB storage'],
  },
  {
    name: 'Growth',
    price: '$29',
    period: '/month',
    color: 'from-blue-600 to-blue-800',
    border: 'border-blue-500/50',
    badge: 'Most Popular',
    features: ['Up to 1,000 students', '100 teachers', 'Everything in Starter', 'Student & Parent portal', 'SMS notifications', 'Advanced analytics', '10 GB storage'],
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    color: 'from-violet-600 to-violet-800',
    border: 'border-violet-500/30',
    badge: null,
    features: ['Up to 5,000 students', '500 teachers', 'Everything in Growth', 'AI report cards', 'Custom domain', 'Priority support', '50 GB storage'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    color: 'from-amber-600 to-amber-800',
    border: 'border-amber-500/30',
    badge: null,
    features: ['Unlimited students', 'Unlimited teachers', 'Everything in Pro', 'Dedicated server', 'SLA guarantee', 'White-label option', 'Unlimited storage'],
  },
];

const STATS = [
  { value: '500+', label: 'Schools Onboarded' },
  { value: '2M+', label: 'Students Managed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<30s', label: 'Setup Time' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070C14] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070C14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/30">M</div>
            <span className="font-black text-lg tracking-tight">MySchool</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
              Get Started Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            School Operating System — Now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Your School.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Your Website.
            </span>
            <br />Your OS.
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sign up in 30 seconds. Get your school's own website with a unique URL, admin dashboard,
            student portal, and parent portal — all instantly provisioned.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5">
              🚀 Start Free — Get Your URL Now
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all">
              See How It Works →
            </a>
          </div>
          <p className="text-white/25 text-sm mt-5">No credit card required · 14-day free trial · Setup in &lt;30 seconds</p>

          {/* URL Preview */}
          <div className="mt-16 max-w-lg mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
              <div className="flex-1 bg-white/5 rounded-lg px-3 py-1 text-xs text-white/40 text-center font-mono">
                myschool.app/s/<span className="text-emerald-400">your-school-name</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-xl p-6 border border-emerald-500/10 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-sm">SC</div>
                <div>
                  <div className="font-black text-sm">Springfield College</div>
                  <div className="text-emerald-400 text-xs">Karachi, Pakistan</div>
                </div>
              </div>
              <div className="text-xs text-white/40 leading-relaxed">Quality education since 1998 · Admissions open for 2025...</div>
              <div className="mt-3 flex gap-2">
                <div className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-lg font-bold">Apply Now</div>
                <div className="border border-white/10 text-white/40 text-xs px-3 py-1 rounded-lg">Contact Us</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-black text-emerald-400 mb-1">{s.value}</div>
              <div className="text-white/40 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">How It Works</div>
            <h2 className="text-3xl md:text-5xl font-black">From signup to live in <span className="text-emerald-400">30 seconds</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Enter School Info', desc: 'School name, city, contact details. Takes 20 seconds.' },
              { step: '02', title: 'Create Admin Account', desc: 'Your email and password. You\'re the School Admin.' },
              { step: '03', title: 'Choose Your Plan', desc: 'Start free, upgrade anytime. No lock-in.' },
              { step: '04', title: 'Go Live Instantly', desc: 'Your website, dashboard, portals — all ready.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 3 && <div className="hidden md:block absolute top-8 left-[calc(100%-12px)] w-6 h-0.5 bg-white/10" />}
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 hover:border-emerald-500/20 transition-all">
                  <div className="text-4xl font-black text-white/10 mb-4">{item.step}</div>
                  <div className="font-bold text-sm mb-2">{item.title}</div>
                  <div className="text-white/40 text-xs leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20">
              Start Now — It's Free →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Everything Included</div>
            <h2 className="text-3xl md:text-5xl font-black">One platform.<br /><span className="text-white/40">Every need covered.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:border-emerald-500/20 hover:bg-white/[0.05] transition-all group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-black text-base mb-2 group-hover:text-emerald-300 transition-colors">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Transparent Pricing</div>
            <h2 className="text-3xl md:text-5xl font-black">Start free.<br /><span className="text-white/40">Scale as you grow.</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {PLANS.map((plan, i) => (
              <div key={i} className={`relative bg-white/[0.03] border rounded-2xl p-6 flex flex-col hover:scale-[1.02] transition-all ${plan.border} ${i === 1 ? 'ring-1 ring-blue-500/30' : ''}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className={`w-10 h-10 bg-gradient-to-br ${plan.color} rounded-xl mb-4`} />
                <div className="font-black text-sm text-white/60 mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black">{plan.price}</span>
                  <span className="text-white/30 text-xs">{plan.period}</span>
                </div>
                <div className="border-t border-white/8 my-4" />
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-xs text-white/50">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${plan.name.toUpperCase()}`}
                  className={`text-center text-xs font-black py-2.5 rounded-xl transition-all ${
                    i === 1
                      ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20'
                      : 'border border-white/10 hover:border-white/20 text-white/60 hover:text-white'
                  }`}>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-3xl p-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to launch<br />your school online?</h2>
            <p className="text-white/40 mb-8 text-lg">Join 500+ schools already running on MySchool. Get your URL in 30 seconds.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg px-10 py-4 rounded-2xl transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5">
              🚀 Create Your School Now — Free
            </Link>
            <p className="text-white/20 text-xs mt-4">No credit card · Instant setup · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center font-black text-sm">M</div>
            <span className="font-black text-sm">MySchool</span>
            <span className="text-white/20 text-sm">· School Operating System</span>
          </div>
          <div className="flex gap-6 text-white/30 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
