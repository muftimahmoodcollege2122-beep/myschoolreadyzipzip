'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({ v, prefix = '', suffix = '', l, c, up, delay }: { v: number; prefix?: string; suffix?: string; l: string; c: string; up: string; delay: number }) {
  const n = useCountUp(v, 1200 + delay * 1000);
  return (
    <div className="msk-fade rounded-xl p-2.5 border border-white/5" style={{ background: '#151B30', animationDelay: `${0.2 + delay}s` }}>
      <p className="font-black text-[13px] leading-none" style={{ color: c }}>{prefix}{n.toLocaleString()}{suffix}</p>
      <p className="text-[8px] text-white/30 mt-1.5 font-medium leading-snug">{l}</p>
      <p className="text-[7px] text-emerald-400 mt-0.5">↑ {up}</p>
    </div>
  );
}

const FEATURE_GRID = [
  { icon: '👩‍🎓', title: 'Student Management', desc: 'Manage student records, admissions, attendance, and performance.', color: 'bg-blue-50 text-blue-600' },
  { icon: '📅', title: 'Attendance Tracking', desc: 'Real-time attendance tracking with reports and analytics.', color: 'bg-purple-50 text-purple-600' },
  { icon: '💳', title: 'Fee Management', desc: 'Automate fee collection, generate invoices, and send reminders.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: '📝', title: 'Exams & Grading', desc: 'Create exams, grade assignments, and generate report cards.', color: 'bg-amber-50 text-amber-600' },
  { icon: '💬', title: 'Communication', desc: 'Connect with parents, students, and teachers instantly.', color: 'bg-rose-50 text-rose-600' },
  { icon: '📚', title: 'Library Management', desc: 'Manage books, issue/return, track inventory and fines.', color: 'bg-teal-50 text-teal-600' },
  { icon: '🚌', title: 'Transport Management', desc: 'Track vehicles, manage routes, and ensure student safety.', color: 'bg-orange-50 text-orange-600' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Powerful dashboards and reports for better decision making.', color: 'bg-indigo-50 text-indigo-600' },
];


const PRICING = [
  {
    name: 'Starter', monthlyPrice: 5000, annualPrice: 4000,
    limit: 'Up to 500 students', highlight: false, badge: '',
    color: 'from-gray-700 to-gray-900', glow: '', ring: 'hover:ring-gray-400',
    features: ['500 students & 30 staff', 'School website + custom domain', 'Admin dashboard', 'Attendance & fee management', 'JazzCash & EasyPaisa payments', 'Student & parent portals', 'WhatsApp notifications (500/mo)', 'Basic reports', '5 GB storage', 'Email support'],
  },
  {
    name: 'Professional', monthlyPrice: 12000, annualPrice: 9600,
    limit: 'Up to 2,000 students', highlight: true, badge: 'Most Popular',
    color: 'from-blue-600 to-blue-700', glow: 'shadow-2xl shadow-blue-500/25', ring: 'hover:ring-blue-500',
    features: ['2,000 students & 100 staff', 'Everything in Starter', 'Teacher portal', 'LMS & online courses', 'AI analytics & dropout prediction', 'WhatsApp notifications (5,000/mo)', 'Advanced reports & analytics', 'Priority support', '25 GB storage', 'Question bank & digital exams'],
  },
  {
    name: 'Enterprise', monthlyPrice: 20000, annualPrice: 16000,
    limit: 'Unlimited students', highlight: false, badge: 'Enterprise',
    color: 'from-purple-600 to-purple-700', glow: '', ring: 'hover:ring-purple-500',
    features: ['Unlimited students & staff', 'Everything in Professional', 'Multi-campus management', 'White-label branding', 'API access', 'Unlimited WhatsApp & SMS', 'Unlimited storage', 'Dedicated account manager', 'Custom SLA & uptime guarantee', 'Priority feature requests'],
  },
];

const TESTIMONIALS = [
  { name: 'Dr. Fatima Malik', role: 'Principal', org: 'Beacon House School System', initials: 'FM', text: 'MySchool transformed how we manage 3,200 students across 4 campuses. Fee collection efficiency improved by 42% in the first month.', rating: 5 },
  { name: 'Ahmed Hassan', role: 'Director', org: 'City Grammar School', initials: 'AH', text: 'The AI timetable generator saved our admin team two full working days every semester. Setup took under 30 minutes.', rating: 5 },
  { name: 'Sarah Khan', role: 'CFO', org: 'Roots International Schools', initials: 'SK', text: 'Real-time fee analytics and automated SMS reminders cut our outstanding dues by 60%. The reporting module alone justifies the cost.', rating: 5 },
  { name: 'Bilal Akhtar', role: 'IT Director', org: 'The Educators Network', initials: 'BA', text: 'We replaced 6 different systems with MySchool. API integration was seamless and teachers are actually enjoying the platform.', rating: 5 },
];

const SCHOOLS = [
  { name: 'Beacon House', count: '4,200+ Students' },
  { name: 'The Educators', count: '3,160+ Students' },
  { name: 'City Grammar', count: '2,800+ Students' },
  { name: 'Roots International', count: '2,450+ Students' },
  { name: 'Headstart School', count: '3,600+ Students' },
];

const STATS = [
  { icon: '🏫', value: '500+', label: 'Schools' },
  { icon: '👥', value: '50,000+', label: 'Active Users' },
  { icon: '🎓', value: '120,000+', label: 'Students Managed' },
  { icon: '🛡️', value: '99.9%', label: 'Uptime' },
  { icon: '🎧', value: '24/7', label: 'Customer Support' },
];

const WHY_US = [
  'User-friendly interface for all users',
  'Secure data with enterprise-grade security',
  'Accessible anytime, anywhere',
  'Scalable solution for any size of institution',
  'Regular updates & new features',
];

export default function MarketingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [testimonialStart, setTestimonialStart] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [heroVideoOk, setHeroVideoOk] = useState(true);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const isScrolled = scrollY > 60;
  const visibleTestimonials = [0, 1, 2].map(i => TESTIMONIALS[(testimonialStart + i) % TESTIMONIALS.length]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <div className="leading-none">
              <span className={`block font-black text-lg tracking-tight ${isScrolled ? 'text-gray-900' : 'text-white'}`}>MySchool</span>
              <span className={`block text-[10px] font-medium ${isScrolled ? 'text-gray-400' : 'text-white/40'}`}>School Management SaaS</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {[['Home', '/'], ['Features', '/features'], ['Pricing', '/pricing'], ['Security', '/security-center'], ['About Us', '/about']].map(([label, href]) => (
              <Link key={label} href={href} className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/75 hover:text-white'}`}>{label}</Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${isScrolled ? 'text-gray-700 border-gray-200 hover:bg-gray-50' : 'text-white/90 border-white/25 hover:bg-white/10'}`}>Login</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-lg text-white transition-all bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 flex items-center gap-1.5">
              Request Demo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
            {mobileMenu ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg px-4 py-4 space-y-1">
            {[['Home', '/'], ['Features', '/features'], ['Pricing', '/pricing'], ['Security', '/security-center'], ['About Us', '/about']].map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setMobileMenu(false)} className="block px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">{label}</Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenu(false)} className="block text-center py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">Login</Link>
              <Link href="/signup" onClick={() => setMobileMenu(false)} className="block text-center py-2.5 text-sm font-bold text-white rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">Request Demo</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 sm:pt-32 sm:pb-32 overflow-hidden" style={{ background: 'linear-gradient(150deg, #0B0E1A 0%, #10142A 55%, #0F1A3D 100%)' }}>
        {/* Background video (Veo 3 generated clip) — drop your file at /public/videos/hero-bg.mp4 */}
        {heroVideoOk && (
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            src="/videos/hero-bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setHeroVideoOk(false)}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(150deg, rgba(11,14,26,0.75) 0%, rgba(16,20,42,0.8) 55%, rgba(15,26,61,0.85) 100%)' }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.08]" style={{ background: 'radial-gradient(circle at 70% 30%, #7C3AED, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 border border-purple-400/25 rounded-full mb-6">
              <span className="text-purple-300 text-xs font-semibold">⚡ All-in-One School Management Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.12] mb-5 tracking-tight">
              Manage Schools<br />
              Like <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Never Before.</span><br />
              Focus on Education,<br />
              We Handle the Rest.
            </h1>
            <p className="text-base sm:text-lg text-white/55 mb-7 leading-relaxed max-w-lg">
              MySchool is a powerful, secure, and easy-to-use platform that simplifies school operations, improves communication, and enhances learning outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl transition-all text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90">
                Request Demo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
              <button onClick={() => setVideoOpen(true)} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/8 hover:bg-white/12 text-white font-semibold rounded-xl border border-white/15 transition-all text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Watch Video
              </button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40 font-medium">
              {[['☁️', 'Cloud Based'], ['🛡️', 'Secure & Reliable'], ['⚡', 'Easy to Use'], ['🎧', '24/7 Support']].map(([icon, t]) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span>{icon}</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard Preview + Phone mockup — animated, matches EduSmart-style reference */}
          <div className="relative mt-6 sm:mt-0 max-w-[380px] sm:max-w-none mx-auto sm:mx-0">
            <style>{`
              @keyframes msk-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
              @keyframes msk-float-2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
              @keyframes msk-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(1.4); } }
              @keyframes msk-draw { to { stroke-dashoffset: 0; } }
              @keyframes msk-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
              .msk-monitor { animation: msk-float 7s ease-in-out infinite; }
              .msk-phone { animation: msk-float-2 7s ease-in-out infinite; animation-delay: -2.5s; }
              .msk-dot { animation: msk-pulse 2s ease-in-out infinite; }
              .msk-chart-line { stroke-dasharray: 340; stroke-dashoffset: 340; animation: msk-draw 1.8s ease forwards 0.4s; }
              .msk-fade { opacity: 0; animation: msk-fadein .6s ease forwards; }
            `}</style>

            {/* Monitor */}
            <div className="msk-monitor rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: '#0F1424' }}>
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#151B30] border-b border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <div className="flex-1 mx-3 bg-[#0F1424] rounded-md px-3 py-1.5 text-[11px] text-purple-300/40 font-mono">app.myschool.pk/dashboard</div>
              </div>
              <div className="flex" style={{ minHeight: 340 }}>
                {/* Sidebar */}
                <div className="w-28 flex-shrink-0 border-r border-white/5 p-3" style={{ background: '#0D1120' }}>
                  <div className="flex items-center gap-1.5 mb-5 px-1">
                    <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[9px] font-black">M</div>
                    <span className="text-white text-[10px] font-black">MySchool</span>
                  </div>
                  <div className="space-y-1">
                    {[['📊', 'Dashboard', true], ['👩‍🎓', 'Students', false], ['👨‍🏫', 'Teachers', false], ['🏫', 'Classes', false], ['📅', 'Attendance', false], ['💳', 'Fees', false]].map(([icon, label, active]) => (
                      <div key={label as string} className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[9px] font-semibold ${active ? 'bg-blue-600 text-white' : 'text-white/35'}`}>
                        <span className="text-[10px]">{icon}</span>{label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main content */}
                <div className="flex-1 p-4">
                  {/* Topbar */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <p className="text-white text-[12px] font-black leading-none">Good morning, Admin 👋</p>
                      <p className="text-white/30 text-[9px] mt-1">Here&apos;s what&apos;s happening today</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#151B30' }}>
                        🔔<span className="msk-dot absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                    </div>
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { v: 1245, prefix: '', l: 'Students', c: '#3B82F6', up: '12.5%' },
                      { v: 78, prefix: '', l: 'Teachers', c: '#10B981', up: '7.8%' },
                      { v: 93, prefix: '', suffix: '%', l: 'Attendance', c: '#8B5CF6', up: '4.3%' },
                      { v: 45320, prefix: 'Rs ', l: 'Fees Collected', c: '#F59E0B', up: '8.2%' },
                    ].map((s, i) => (
                      <StatCard key={s.l} v={s.v} prefix={s.prefix} suffix={s.suffix} l={s.l} c={s.c} up={s.up} delay={i * 0.1} />
                    ))}
                  </div>

                  {/* Attendance chart */}
                  <div className="msk-fade rounded-xl p-3 border border-white/5 mb-3" style={{ background: '#151B30', animationDelay: '0.6s' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] text-white/30 font-medium">Attendance Overview</p>
                      <span className="text-[8px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">92% Live</span>
                    </div>
                    <svg viewBox="0 0 280 50" className="w-full h-12">
                      <polyline
                        className="msk-chart-line"
                        points="0,38 40,20 80,30 120,12 160,24 200,8 240,16 280,4"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Recent activities */}
                  <div className="msk-fade rounded-xl p-3 border border-white/5" style={{ background: '#151B30', animationDelay: '0.8s' }}>
                    <p className="text-[9px] text-white/30 font-medium mb-2">Recent Activities</p>
                    <div className="space-y-1.5">
                      {[['🟢', 'New student admission', '2m ago'], ['🔵', 'Fee payment received', '1h ago'], ['🟣', 'Library book issued', 'Yesterday']].map(([dot, t, time], i) => (
                        <div key={t as string} className="msk-fade flex items-center justify-between" style={{ animationDelay: `${1 + i * 0.15}s` }}>
                          <span className="text-[8.5px] text-white/60 flex items-center gap-1.5"><span className="text-[8px]">{dot}</span>{t}</span>
                          <span className="text-[7.5px] text-white/25">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Monitor stand */}
            <div className="msk-monitor mx-auto" style={{ animationDelay: '0s' }}>
              <div className="w-20 h-3 mx-auto" style={{ background: 'linear-gradient(#1a2038,#0D1120)', clipPath: 'polygon(35% 0, 65% 0, 80% 100%, 20% 100%)' }} />
              <div className="w-32 h-2 mx-auto rounded-full" style={{ background: '#0D1120' }} />
            </div>

            {/* Phone mockup */}
            <div className="msk-phone mt-5 mx-auto sm:mt-0 sm:mx-0 sm:absolute sm:-bottom-6 sm:-right-8 w-32 aspect-[9/19] rounded-[1.6rem] overflow-hidden border-4 border-[#111827] shadow-2xl flex flex-col" style={{ background: '#0F1424' }}>
              {/* Notch */}
              <div className="flex justify-center pt-1">
                <div className="w-10 h-2.5 rounded-full bg-black" />
              </div>
              <div className="flex items-center justify-between px-3 pt-1 text-white text-[7px] font-bold">
                <span>9:41</span>
                <span>🔋 📶</span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col">
                <p className="text-white text-[10px] font-bold mb-3 flex items-center gap-1">Hello, Admin <span>👋</span></p>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="msk-fade rounded-lg p-2" style={{ background: '#1A2038', animationDelay: '1.1s' }}>
                    <p className="text-[10px] font-black text-blue-400">1,245</p>
                    <p className="text-[6.5px] text-white/30 mt-0.5">Students</p>
                  </div>
                  <div className="msk-fade rounded-lg p-2" style={{ background: '#1A2038', animationDelay: '1.2s' }}>
                    <p className="text-[10px] font-black text-emerald-400">78</p>
                    <p className="text-[6.5px] text-white/30 mt-0.5">Teachers</p>
                  </div>
                </div>
                <div className="msk-fade rounded-lg p-2 mb-2" style={{ background: '#1A2038', animationDelay: '1.3s' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[6.5px] text-white/40">Attendance</span>
                    <span className="text-[8px] font-black text-purple-400">92.6%</span>
                  </div>
                  <svg viewBox="0 0 100 20" className="w-full h-4">
                    <polyline className="msk-chart-line" points="0,16 20,10 40,13 60,5 80,9 100,3" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="msk-fade rounded-lg p-2 flex-1" style={{ background: '#1A2038', animationDelay: '1.4s' }}>
                  <p className="text-[6.5px] text-white/40 mb-1">Fees Collected</p>
                  <p className="text-[10px] font-black text-amber-400">Rs 45,320</p>
                </div>
                <div className="flex items-center justify-center gap-1 mt-2 pb-1">
                  <span className="msk-dot w-1 h-1 rounded-full bg-rose-500" />
                  <span className="text-[6px] text-white/30">Live sync active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm mb-6">
            <span className="text-gray-400">Trusted by </span>
            <span className="font-bold text-blue-600">500+</span>
            <span className="text-gray-400"> schools & institutions worldwide</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {SCHOOLS.map(s => (
              <div key={s.name} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">🛡️</div>
                <div>
                  <p className="text-sm font-bold text-gray-700 leading-tight">{s.name}</p>
                  <p className="text-xs text-gray-400 leading-tight">{s.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-purple-600 font-bold text-xs uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4 tracking-tight">
              All-in-One Solution for <span className="text-purple-600">Modern Schools</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">Powerful modules to automate tasks, save time, and improve productivity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {FEATURE_GRID.map(f => (
              <div key={f.title} className="rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 text-xl`}>
                  {f.icon}
                </div>
                <h3 className="font-black text-base text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="py-10" style={{ background: 'linear-gradient(120deg, #4F46E5 0%, #7C3AED 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-5 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl mb-1.5">{s.icon}</div>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">{s.value}</p>
              <p className="text-xs text-white/70 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Illustration side */}
          <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-6 sm:p-8 border border-gray-100 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/features/12-all-in-one-platform.png"
              alt="MySchool — all-in-one school management platform"
              className="w-full h-auto max-h-[420px] object-contain"
              loading="lazy"
            />
            <div className="mt-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl">🏫</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">One School, One Platform</p>
                <p className="text-xs text-gray-500">Everyone connected in real time</p>
              </div>
            </div>
            <button
              onClick={() => setVideoOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              See MySchool in Action
            </button>
          </div>

          {/* Checklist side */}
          <div>
            <span className="text-purple-600 font-bold text-xs uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-6 tracking-tight leading-tight">
              Smart Platform. Better Experience.<br /><span className="text-purple-600">Brighter Future.</span>
            </h2>
            <div className="space-y-4">
              {WHY_US.map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-16 sm:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <span className="text-purple-600 font-bold text-xs uppercase tracking-widest">Flexible Pricing Plans</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 tracking-tight">Choose the Perfect Plan for Your School</h2>
            </div>
            <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1 relative flex-shrink-0">
              <div className={`absolute inset-y-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out ${billing === 'annual' ? 'left-[calc(50%+2px)] right-1' : 'left-1 right-[calc(50%+2px)]'}`} />
              <button onClick={() => setBilling('monthly')} className={`relative px-5 py-2 rounded-lg text-sm font-bold transition-colors z-10 ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</button>
              <button onClick={() => setBilling('annual')} className={`relative px-5 py-2 rounded-lg text-sm font-bold transition-colors z-10 flex items-center gap-2 ${billing === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly<span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`group relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ease-out ring-2 ring-transparent hover:ring-4 hover:-translate-y-3 hover:scale-[1.03] hover:z-20 hover:shadow-2xl cursor-pointer ${p.ring} ${p.highlight ? `sm:scale-[1.03] ${p.glow}` : ''}`}
              >
                <div className={`bg-gradient-to-br ${p.color} p-6 sm:p-7 text-white transition-all duration-300`}>
                  {p.badge ? (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full mb-4 ${p.highlight ? 'bg-white/20' : 'bg-white/15 text-white/90'}`}>
                      {p.highlight && <span className="animate-pulse">⭐</span>}{p.badge.toUpperCase()}
                    </div>
                  ) : <div className="h-7 mb-4" />}
                  <h3 className="text-2xl font-black">{p.name}</h3>
                  <div className="flex items-end gap-1 mt-4">
                    <span className="text-white/70 text-sm font-medium pb-1">PKR</span>
                    <span className="text-4xl sm:text-5xl font-black tracking-tight transition-transform duration-300 group-hover:scale-110 origin-left">{(billing === 'annual' ? p.annualPrice : p.monthlyPrice).toLocaleString()}</span>
                    <span className="text-white/70 text-sm pb-1">/mo</span>
                  </div>
                  {billing === 'annual' && (
                    <p className="text-white/60 text-xs mt-1">PKR {((p.monthlyPrice - p.annualPrice) * 12).toLocaleString()} saved/year</p>
                  )}
                  <p className="text-white/50 text-xs mt-1">{p.limit}</p>
                </div>
                <div className="bg-white flex-1 p-5 sm:p-6 border border-gray-100 transition-colors duration-300 group-hover:border-transparent">
                  <Link href="/signup" className={`block text-center py-3 rounded-xl text-sm font-black transition-all mb-5 bg-gradient-to-r ${p.color} text-white group-hover:opacity-90 group-hover:shadow-lg`}>
                    Get Started
                  </Link>
                  <ul className="space-y-2.5">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs mt-8">
            All prices in Pakistani Rupees (PKR) · Yearly billing saves 20% ·{' '}
            <Link href="/pricing" className="text-blue-600 hover:underline">Full pricing details</Link>
            {' '}·{' '}
            <a href="mailto:sales@myschool.pk" className="text-blue-600 hover:underline">Contact sales</a>
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 sm:mb-14">
            <div>
              <span className="text-purple-600 font-bold text-xs uppercase tracking-widest">Loved by Educators</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 tracking-tight">What Schools Say About MySchool</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setTestimonialStart(t => (t - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={() => setTestimonialStart(t => (t + 1) % TESTIMONIALS.length)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {visibleTestimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <p className="text-3xl text-purple-200 font-serif mb-1 leading-none">&ldquo;</p>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{t.initials}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}, {t.org}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[...Array(t.rating)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-14 sm:py-16 relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #2563EB 0%, #7C3AED 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <span className="hidden sm:block text-5xl flex-shrink-0">🏫</span>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Ready to Transform Your School?</h2>
            <p className="text-white/70 text-sm sm:text-base mb-6 sm:mb-0">Join hundreds of schools already using MySchool.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/signup" className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl transition-all text-sm text-center hover:bg-white/90">
              Request Demo →
            </Link>
            <Link href="mailto:sales@myschool.pk" className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/25 transition-all text-sm text-center">
              Contact Us
            </Link>
          </div>
          <span className="hidden sm:block text-5xl flex-shrink-0">🎒</span>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 pt-12 sm:pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
                <span className="font-black text-lg text-white">MySchool</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 max-w-xs">The all-in-one operating system for modern schools, colleges, and universities.</p>
              <div className="flex gap-4">
                {['WhatsApp', 'LinkedIn', 'Twitter'].map(s => (
                  <a key={s} href="#" className="text-xs text-gray-600 hover:text-white transition-colors font-medium">{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features|/features', 'Pricing|/pricing', 'Security|/security-center', 'API Docs'] },
              { title: 'Solutions', links: ['Schools', 'Colleges', 'Universities', 'Madrassas'] },
              { title: 'Company', links: ['About|/about', 'Blog', 'Privacy Policy|/privacy-policy', 'Terms|/terms'] },
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
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-sm text-center sm:text-left">
              © 2026 MySchool Technologies. Built in Pakistan.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
              <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
              <span className="text-gray-700">·</span>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <span className="text-gray-700">·</span>
              <Link href="/security-center" className="hover:text-white">Security</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Demo Video Modal — drop your Veo 3 export at /public/videos/demo.mp4 ── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setVideoOpen(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              aria-label="Close video"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <video
              className="w-full h-full"
              src="/videos/demo.mp4"
              poster="/videos/demo-poster.jpg"
              controls
              autoPlay
            />
          </div>
        </div>
      )}
    </div>
  );
}
