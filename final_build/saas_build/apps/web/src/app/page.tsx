'use client';
/**
 * MySchool marketing homepage — the main landing page at myschool.pk.
 * Sections: Hero, Features, Pricing, Testimonials, FAQ, CTA, Footer.
 * Server-rendered for SEO. No authentication required.
 * Pricing: STARTER (PKR 2,999/mo), PROFESSIONAL (PKR 5,999/mo), ENTERPRISE (PKR 9,999/mo).
 */
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const FEATURES = [
  {
    title: 'School Website',
    desc: 'Professional web presence with zero developer cost.',
    color: 'bg-blue-600',
    items: ['Custom domain & SSL', 'Admissions page', 'News & events', 'Staff directory', 'Photo gallery', 'SEO optimized'],
  },
  {
    title: 'Administration',
    desc: 'Complete institutional control from one dashboard.',
    color: 'bg-indigo-600',
    items: ['Student management', 'Staff management', 'Admissions CRM', 'Timetable builder', 'Multi-campus', 'Audit logs'],
  },
  {
    title: 'Academics',
    desc: 'End-to-end academic lifecycle management.',
    color: 'bg-violet-600',
    items: ['Attendance tracking', 'Exam management', 'Results & grades', 'LMS & courses', 'Assignments', 'Digital certificates'],
  },
  {
    title: 'Finance',
    desc: 'Automated fee collection and financial reporting.',
    color: 'bg-emerald-600',
    items: ['Fee collection', 'Online invoicing', 'JazzCash / Stripe', 'Scholarships', 'Financial reports', 'Budget tracking'],
  },
  {
    title: 'Communication',
    desc: 'Keep every stakeholder informed in real time.',
    color: 'bg-amber-600',
    items: ['SMS alerts', 'Email notifications', 'Parent portal', 'WhatsApp integration', 'Announcements', 'Emergency alerts'],
  },
  {
    title: 'AI Automation',
    desc: 'Reduce manual work by 10× with embedded AI.',
    color: 'bg-rose-600',
    items: ['Notice generation', 'AI timetable builder', 'Report card AI', 'Dropout prediction', 'AI chatbot', 'Exam paper generation'],
  },
];

const PRICING = [
  {
    name: 'Starter',
    urdu: 'ابتدائی',
    monthlyPrice: 5000,
    annualPrice: 4000,
    limit: 'Up to 500 students',
    highlight: false,
    badge: '',
    color: 'from-gray-700 to-gray-900',
    glow: '',
    features: ['500 students & 30 staff', 'School website + custom domain', 'Admin dashboard', 'Attendance & fee management', 'JazzCash & EasyPaisa payments', 'Student & parent portals', 'WhatsApp notifications (500/mo)', 'Basic reports', '5 GB storage', 'Email support'],
  },
  {
    name: 'Professional',
    urdu: 'پیشہ ورانہ',
    monthlyPrice: 12000,
    annualPrice: 9600,
    limit: 'Up to 2,000 students',
    highlight: true,
    badge: 'Most Popular',
    color: 'from-blue-600 to-blue-700',
    glow: 'shadow-2xl shadow-blue-500/25',
    features: ['2,000 students & 100 staff', 'Everything in Starter', 'Teacher portal', 'LMS & online courses', 'AI analytics & dropout prediction', 'WhatsApp notifications (5,000/mo)', 'Advanced reports & analytics', 'Priority support', '25 GB storage', 'Question bank & digital exams'],
  },
  {
    name: 'Enterprise',
    urdu: 'انٹرپرائز',
    monthlyPrice: 20000,
    annualPrice: 16000,
    limit: 'Unlimited students',
    highlight: false,
    badge: 'Enterprise',
    color: 'from-purple-600 to-purple-700',
    glow: '',
    features: ['Unlimited students & staff', 'Everything in Professional', 'Multi-campus management', 'White-label branding', 'API access', 'Unlimited WhatsApp & SMS', 'Unlimited storage', 'Dedicated account manager', 'Custom SLA & uptime guarantee', 'Priority feature requests'],
  },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Fatima Malik',
    role: 'Principal',
    org: 'Beacon House School System',
    initials: 'FM',
    text: 'MySchool transformed how we manage 3,200 students across 4 campuses. Fee collection efficiency improved by 42% in the first month. The parent app eliminated 80% of phone enquiries.',
    metric: '+42% fee collection',
  },
  {
    name: 'Ahmed Hassan',
    role: 'Director',
    org: 'City Grammar School',
    initials: 'AH',
    text: 'The AI timetable generator saved our admin team two full working days every semester. Setup took under 30 minutes. The ROI was clear within the first week.',
    metric: '2 days saved/semester',
  },
  {
    name: 'Sarah Khan',
    role: 'CFO',
    org: 'Roots International Schools',
    initials: 'SK',
    text: 'Real-time fee analytics and automated SMS reminders cut our outstanding dues by 60%. The financial reporting module alone justifies the entire subscription cost.',
    metric: '-60% outstanding dues',
  },
  {
    name: 'Bilal Akhtar',
    role: 'IT Director',
    org: 'The Educators Network',
    initials: 'BA',
    text: 'We replaced 6 different systems with MySchool. API integration was seamless. Our IT overhead dropped significantly and teachers are actually enjoying the platform.',
    metric: '6 systems consolidated',
  },
];

const FAQS = [
  { q: 'How long does the setup take?', a: 'Your school website and management system go live in under 10 minutes. Our automated provisioning creates everything — database, website, accounts, and roles — instantly after signup. No technical knowledge required.' },
  { q: 'Do we need to hire a developer?', a: 'No. Everything is managed through intuitive dashboards. The website builder requires zero coding. Our onboarding wizard guides you step-by-step through school profile, academic setup, staff, and payment configuration.' },
  { q: 'Can we use our own domain?', a: 'Yes. You get a free subdomain (yourschool.myschool.pk) immediately. Connect your custom domain (www.yourschool.com) in Settings → Domain with a guided DNS setup wizard.' },
  { q: 'Which payment methods are supported?', a: 'JazzCash, EasyPaisa, bank transfer, and Stripe (international). Parents can pay from the mobile app or parent portal. Automatic fee reminders reduce outstanding dues.' },
  { q: 'What happens to our data if we leave?', a: 'Your data is always yours. Export everything — students, fees, academic records — at any time in standard formats. We use enterprise-grade AES-256 encryption and daily automated backups.' },
  { q: 'Can we migrate from our existing system?', a: 'Yes. We provide free data migration for student records, fee history, and academic data. Our onboarding team handles the migration with zero downtime for your school operations.' },
  { q: 'Is there a free trial?', a: '30 days free with full access to every feature — AI assistant, LMS, parent portal, financial reports. No credit card required to start. Cancel anytime with no penalties.' },
  { q: 'Do you offer multi-campus support?', a: 'Yes. The Enterprise plan includes unlimited campuses under a single admin console. Separate budgets, attendance, and reporting per campus with consolidated group-level analytics.' },
];

const MODULES = [
  'Student Information System', 'Learning Management System', 'Finance & Billing',
  'HR & Payroll', 'QR / RFID Attendance', 'Exam Management', 'Library System',
  'Hostel Management', 'Transport Tracking', 'Website Builder', 'AI Automation',
  'Parent Portal', 'Teacher Portal', 'Student Portal', 'Communication Center',
  'Analytics & Reports', 'Multi-Tenant SaaS', 'Custom Domains', 'White-Label',
];

export default function MarketingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const isScrolled = scrollY > 60;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <span className={`font-black text-lg tracking-tight ${isScrolled ? 'text-gray-900' : 'text-white'}`}>MySchool</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['How It Works', '#how-it-works'], ['About', '/about'], ['Security', '/security-center']].map(([label, href]) => (
              <a key={label} href={href} className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/75 hover:text-white'}`}>{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/80 hover:text-white'}`}>Sign In</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Request Demo</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center" style={{ background: 'linear-gradient(150deg, #0C1E35 0%, #0F2D50 55%, #0F3D6E 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] opacity-[0.04]" style={{ background: 'radial-gradient(circle at 70% 30%, #3B82F6, transparent 60%)' }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-[0.04]" style={{ background: 'radial-gradient(circle at 30% 70%, #8B5CF6, transparent 60%)' }} />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/25 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">The All-in-One Operating System for Modern Schools</span>
            </div>
            <h1 className="text-5xl lg:text-[3.5rem] font-black text-white leading-[1.1] mb-6 tracking-tight">
              Launch Your School<br />
              Website & Management<br />
              <span className="text-blue-400">System in Minutes</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-lg">
              Admissions, attendance, fees, exams, HR, parent portal, student portal, AI automation — all provisioned automatically. No developers. No setup complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-500/30 text-sm">
                Start Free Trial — 30 Days
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/8 hover:bg-white/12 text-white font-semibold rounded-xl border border-white/15 transition-all text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Watch Demo
              </a>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/40 font-medium">
              <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>No credit card required</span>
              <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Live in under 10 minutes</span>
              <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Cancel anytime</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: '#0A1929' }}>
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#111F30] border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <div className="flex-1 mx-3 bg-[#0A1929] rounded-md px-3 py-1.5 text-[11px] text-blue-300/40 font-mono">demo.myschool.pk/dashboard</div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {[['2,847', 'Total Students', '#3B82F6'], ['94.2%', 'Attendance Rate', '#10B981'], ['Rs 8.4M', 'Monthly Revenue', '#8B5CF6'], ['142', 'Teaching Staff', '#F59E0B']].map(([v, l, c]) => (
                    <div key={l} className="rounded-xl p-3.5 border border-white/5" style={{ background: '#111F30' }}>
                      <p className="font-black text-xl leading-none" style={{ color: c }}>{v}</p>
                      <p className="text-[11px] text-white/30 mt-1 font-medium">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-3.5 border border-white/5 mb-3" style={{ background: '#111F30' }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] text-white/30 font-medium">Revenue Trend — Last 12 Months</p>
                    <span className="text-[10px] text-green-400 font-bold">+18.4%</span>
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    {[38, 52, 46, 67, 59, 75, 71, 83, 90, 82, 95, 100].map((v, i) => (
                      <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: `${v}%`, background: i === 11 ? '#3B82F6' : `rgba(59,130,246,${0.15 + i * 0.015})` }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[['Dashboard', '■'], ['Students', '■'], ['Fees', '■'], ['AI', '■']].map(([l]) => (
                    <div key={l} className="rounded-lg p-2.5 text-center border border-white/5" style={{ background: '#111F30' }}>
                      <div className="w-5 h-5 rounded-md bg-blue-600/30 mx-auto mb-1" />
                      <p className="text-[9px] text-white/30 font-medium">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg">Live in 10 min</div>
            <div className="absolute -bottom-3 -left-3 bg-white text-gray-900 text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg">AI-Powered</div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['500+', 'Schools Onboarded'], ['120,000+', 'Students Managed'], ['Rs 2B+', 'Fees Processed'], ['99.9%', 'Platform Uptime']].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black text-white tracking-tight">{v}</p>
                <p className="text-xs text-white/35 mt-0.5 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-7">Trusted by leading institutions across Pakistan & the Middle East</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['Beacon House', 'The Educators', 'Roots International', 'City Grammar', 'Headstart', 'LGS Network', 'Allied Schools', 'Happy Minds'].map(name => (
              <span key={name} className="text-sm font-bold text-gray-300">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem → Solution ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">The Problem</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3 mb-4 tracking-tight">Most Schools Operate With Fragmented, Costly Systems</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">School administrators spend 20+ hours per week on tasks that should be automated. Here is what that costs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <h3 className="font-black text-lg text-gray-900">Without MySchool</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  ['Manual attendance registers', '3 hrs/day wasted'],
                  ['Excel fee records & parent chasing', 'Rs 500K+ in defaults'],
                  ['Paper report cards every term', '2 weeks printing'],
                  ['Expensive website developers', 'Rs 200K+ one-time'],
                  ['No parent communication system', 'Constant complaints'],
                  ['No AI — 100% manual admin work', 'Staff burnout'],
                ].map(([p, c]) => (
                  <div key={p} className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{p}</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full flex-shrink-0">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #1E3A5F, #1A4D8A)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="font-black text-lg text-white">With MySchool</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  ['Automated QR/RFID attendance', 'Zero manual work'],
                  ['Online fee collection + SMS reminders', '95% collection rate'],
                  ['Digital report cards in one click', 'Instant generation'],
                  ['Professional school website', 'Included in every plan'],
                  ['Parent portal + mobile access', 'Real-time updates'],
                  ['AI generates notices, exams, timetables', '10× productivity'],
                ].map(([p, b]) => (
                  <div key={p} className="flex items-center justify-between p-3 rounded-xl bg-white/8 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-sm text-white/90 font-medium">{p}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full flex-shrink-0">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Module Ticker ── */}
      <div className="py-3.5 bg-blue-600 overflow-hidden border-y border-blue-500">
        <div className="flex gap-8 whitespace-nowrap" style={{ animation: 'marquee 35s linear infinite' }}>
          {[...MODULES, ...MODULES].map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-white/80 text-xs font-semibold flex-shrink-0">
              <span className="w-1 h-1 rounded-full bg-blue-300" />
              {m}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Platform Capabilities</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3 mb-4 tracking-tight">Every Tool Your Institution Needs</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">No add-ons, no per-feature fees. Every module is included in every plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 p-7 hover:shadow-xl hover:border-transparent hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-5`}>
                  <div className="w-4 h-4 bg-white/80 rounded-sm" />
                </div>
                <h3 className="font-black text-lg text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{f.desc}</p>
                <ul className="space-y-2">
                  {f.items.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portal Preview ── */}
      <section id="demo" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Platform Preview</span>
            <h2 className="text-4xl font-black text-white mt-3 mb-4 tracking-tight">Purpose-Built Portals for Every Stakeholder</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">Four dedicated portals — each optimized for the specific needs of that user role.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Admin Dashboard', color: '#3B82F6', desc: 'Real-time KPIs, financial analytics, and institution-wide controls', items: ['Student & staff overview', 'Fee collection analytics', 'Attendance heat maps', 'AI-driven insights'] },
              { title: 'Teacher Portal', color: '#8B5CF6', desc: 'Attendance marking, grade books, assignments, and lesson plans', items: ['Class schedule & roster', 'Digital grade book', 'Quick attendance', 'AI lesson planner'] },
              { title: 'Student Portal', color: '#10B981', desc: 'Grades, timetable, course materials, and library access', items: ['Personal timetable', 'Subject results', 'Homework tracker', 'LMS course access'] },
              { title: 'Parent Portal', color: '#F59E0B', desc: 'Live child tracking, fee payments, results, and teacher messaging', items: ["Child's attendance", 'Fee payment online', 'Message teachers', 'View exam results'] },
            ].map(p => (
              <div key={p.title} className="rounded-2xl border border-white/8 overflow-hidden hover:border-blue-500/30 transition-all" style={{ background: '#111F30' }}>
                <div className="h-1 w-full" style={{ background: p.color }} />
                <div className="p-5">
                  <h3 className="font-black text-white text-base mb-1.5">{p.title}</h3>
                  <p className="text-white/35 text-xs mb-4 leading-relaxed">{p.desc}</p>
                  <ul className="space-y-2">
                    {p.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 h-16 rounded-xl border border-white/5 flex items-center justify-center" style={{ background: `${p.color}08` }}>
                    <div className="w-8 h-8 rounded-lg border-2 opacity-20" style={{ borderColor: p.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Customer Journey</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3 mb-4 tracking-tight">From Signup to Live School in 4 Steps</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">No technical setup. No waiting. Our provisioning engine handles everything automatically.</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { n: '01', title: 'Register', desc: 'Fill in your school name, contact, and student count. Takes under 2 minutes.' },
                { n: '02', title: 'Auto-Provision', desc: 'Database, website, subdomain, admin account, and roles created automatically in 30 seconds.' },
                { n: '03', title: 'Setup Wizard', desc: 'Configure classes, staff, fees, and payment gateway through a guided onboarding wizard.' },
                { n: '04', title: 'Go Live', desc: 'Your school website and management system are live. Share with parents immediately.' },
              ].map(s => (
                <div key={s.n} className="text-center relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-600 flex flex-col items-center justify-center text-white mb-5 shadow-lg shadow-blue-600/20">
                    <span className="text-[10px] font-bold text-blue-200 leading-none">Step</span>
                    <span className="text-2xl font-black leading-none mt-0.5">{s.n}</span>
                  </div>
                  <h3 className="font-black text-lg text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-provisioning callout */}
          <div className="mt-16 rounded-2xl p-8 text-white max-w-4xl mx-auto" style={{ background: 'linear-gradient(135deg, #1E3A5F, #1A4D8A)' }}>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h3 className="text-xl font-black mb-3">What Gets Created Automatically</h3>
                <p className="text-white/60 text-sm mb-5 leading-relaxed">Our provisioning engine creates a complete school operating system in under 60 seconds.</p>
                <div className="grid grid-cols-2 gap-2">
                  {['School database', 'School website', 'Custom subdomain', 'Admin account', 'Role configuration', 'Storage bucket', 'Email settings', 'Billing enabled', 'Onboarding checklist', 'Default timetable'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                      <svg className="w-3 h-3 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-4 border border-white/15 font-mono text-xs" style={{ background: 'rgba(0,0,0,0.25)' }}>
                <p className="text-blue-300 mb-3 font-sans font-semibold text-xs">// Provisioning engine output</p>
                {[
                  ['green', '✓  Creating tenant database...'],
                  ['green', '✓  Generating school website...'],
                  ['green', '✓  Configuring subdomain...'],
                  ['green', '✓  Setting up admin account...'],
                  ['green', '✓  Configuring RBAC roles...'],
                  ['green', '✓  Enabling billing module...'],
                  ['green', '✓  Sending credentials via email...'],
                  ['green', '✓  Launching onboarding wizard...'],
                  ['', ''],
                  ['yellow', '→  School is LIVE  —  elapsed: 42s'],
                ].map(([color, line], i) => (
                  <p key={i} className={`leading-relaxed ${color === 'green' ? 'text-emerald-400' : color === 'yellow' ? 'text-yellow-300 font-bold mt-1' : ''}`}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security & Compliance ── */}
      <section id="security" className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Security & Compliance</span>
            <h2 className="text-3xl font-black text-gray-900 mt-3 mb-3 tracking-tight">Enterprise-Grade Infrastructure You Can Trust</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">Your institutional data is protected by the same security standards used by global financial institutions.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: '99.9% Uptime SLA', sub: 'Guaranteed availability', icon: '◎' },
              { label: 'AES-256 Encryption', sub: 'Data at rest & in transit', icon: '◆' },
              { label: 'Daily Backups', sub: 'Automated with 30-day retention', icon: '◈' },
              { label: 'GDPR-Ready', sub: 'Full data export & deletion rights', icon: '◉' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-600 text-lg font-black">{item.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{item.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
            {['Multi-tenant isolation', 'Role-based access control', 'Audit logs & activity trails', 'ISO 27001 aligned', 'SOC 2 Type II aligned', 'Data residency controls'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5">
                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100 rounded-full opacity-40 animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-100 rounded-full opacity-30 animate-[pulse_8s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full opacity-20 animate-[pulse_10s_ease-in-out_infinite_2s]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">
              <span className="w-4 h-px bg-blue-400" />
              Transparent Pricing
              <span className="w-4 h-px bg-blue-400" />
            </span>
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
              Honest pricing for Pakistani schools
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-8">
              One flat price for your entire school. No per-student charges, no hidden fees.
              <span className="font-semibold text-gray-700"> 30-day free trial on all plans.</span>
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1 relative">
              <div className={`absolute inset-y-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${billing === 'annual' ? 'left-[calc(50%+2px)] right-1' : 'left-1 right-[calc(50%+2px)]'}`} />
              <button onClick={() => setBilling('monthly')}
                className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-colors z-10 ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                Monthly
              </button>
              <button onClick={() => setBilling('annual')}
                className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-colors z-10 flex items-center gap-2 ${billing === 'annual' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                Annual
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((p, idx) => (
              <div key={p.name}
                className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 flex flex-col
                  ${p.highlight ? `scale-[1.03] ${p.glow}` : 'hover:shadow-xl'}`}
                style={{ animationDelay: `${idx * 100}ms` }}>

                {/* Card header gradient */}
                <div className={`bg-gradient-to-br ${p.color} p-7 text-white`}>
                  {p.badge && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full mb-4 ${p.highlight ? 'bg-white/20 text-white' : 'bg-white/15 text-white/90'}`}>
                      {p.highlight && <span className="animate-pulse">⭐</span>}
                      {p.badge.toUpperCase()}
                    </div>
                  )}
                  {!p.badge && <div className="h-7 mb-4" />}

                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-2xl font-black">{p.name}</h3>
                      <p className="text-white/60 text-xs mt-0.5">{p.urdu}</p>
                    </div>
                  </div>

                  {/* Animated price */}
                  <div className="mt-5">
                    <div className="flex items-end gap-1">
                      <span className="text-white/70 text-sm font-medium pb-1">PKR</span>
                      <span className="text-5xl font-black tracking-tight transition-all duration-500">
                        {(billing === 'annual' ? p.annualPrice : p.monthlyPrice).toLocaleString()}
                      </span>
                      <span className="text-white/70 text-sm pb-1">/mo</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-white/60 text-xs mt-1.5 animate-[fadeIn_0.3s_ease]">
                        PKR {(p.monthlyPrice - p.annualPrice).toLocaleString()} saved monthly · PKR {((p.monthlyPrice - p.annualPrice) * 12).toLocaleString()}/year
                      </p>
                    )}
                    <p className="text-white/50 text-xs mt-1">{p.limit}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white flex-1 p-6 border border-gray-100">
                  <Link href="/signup"
                    className={`block text-center py-3 rounded-xl text-sm font-black transition-all mb-5 bg-gradient-to-r ${p.color} text-white hover:opacity-90 shadow-sm`}>
                    Start 30-Day Free Trial →
                  </Link>
                  <ul className="space-y-2.5">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom trust line */}
          <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
            {['✓ 30-day free trial', '✓ No credit card required', '✓ Cancel anytime', '✓ Data always yours'].map(t => (
              <span key={t} className="text-sm text-gray-500 font-medium">{t}</span>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">
            All prices in Pakistani Rupees (PKR) · Annual billing saves 20% ·{' '}
            <Link href="/pricing" className="text-blue-600 hover:underline">Full pricing details</Link>
            {' '}·{' '}
            <a href="mailto:sales@myschool.pk" className="text-blue-600 hover:underline">Contact sales</a>
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Customer Evidence</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3 mb-4 tracking-tight">Results from Real School Leaders</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">{t.metric}</span>
                </div>
                <p className="text-gray-700 text-base leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">{t.initials}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}, {t.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl font-black text-gray-900 mt-3 mb-4 tracking-tight">Common Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className={`rounded-xl border overflow-hidden transition-all ${activeFaq === i ? 'border-blue-200 shadow-sm' : 'border-gray-100'}`}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                  <span className="font-bold text-gray-900 text-base">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${activeFaq === i ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24" style={{ background: 'linear-gradient(150deg, #0C1E35 0%, #0F3D6E 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/25 rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-blue-300 text-xs font-semibold">Join 500+ schools already on MySchool</span>
          </div>
          <h2 className="text-5xl font-black text-white mb-5 leading-tight tracking-tight">
            Start Your School&apos;s<br />
            <span className="text-blue-400">Digital Transformation</span> Today
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            One subscription. Every module. Your complete school operating system — website, management, AI, portals — live in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/signup" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/20 text-sm">
              Start Free 30-Day Trial
            </Link>
            <Link href="/signup" className="px-8 py-4 bg-white/8 hover:bg-white/12 text-white font-semibold rounded-xl border border-white/15 transition-all text-sm">
              Book a Product Demo
            </Link>
          </div>
          <p className="text-white/25 text-xs mt-6">No credit card · Full access · Cancel anytime · Setup in under 10 minutes</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 pt-16 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
                <span className="font-black text-lg text-white">MySchool</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">The all-in-one operating system for modern schools, colleges, and universities. Trusted by 500+ institutions.</p>
              <div className="flex gap-4">
                {['WhatsApp', 'LinkedIn', 'Twitter'].map(s => (
                  <a key={s} href="#" className="text-xs text-gray-600 hover:text-white transition-colors font-medium">{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'API Docs', 'Changelog'] },
              { title: 'Solutions', links: ['Schools', 'Colleges', 'Universities', 'Madrassas', 'Academies'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Privacy Policy|/privacy-policy', 'Terms of Service|/terms', 'Security|/security'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-bold text-white mb-4 text-sm">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(l => {
                    const [label, href] = l.includes('|') ? l.split('|') : [l, '#'];
                    return <li key={label}><Link href={href} className="text-gray-500 hover:text-white text-sm transition-colors">{label}</Link></li>;
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">© 2026 MySchool Technologies. All rights reserved. Built in Pakistan.</p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="text-gray-700">·</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <span className="text-gray-700">·</span>
              <span>99.9% uptime · AES-256 encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
