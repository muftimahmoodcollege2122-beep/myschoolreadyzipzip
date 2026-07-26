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
  { icon: '👩‍🎓', title: 'Student Management', desc: 'Manage student records, admissions, attendance, and performance.', color: 'bg-gray-100 text-gray-800' },
  { icon: '📅', title: 'Attendance Tracking', desc: 'Real-time attendance tracking with reports and analytics.', color: 'bg-gray-100 text-gray-800' },
  { icon: '💳', title: 'Fee Management', desc: 'Automate fee collection, generate invoices, and send reminders.', color: 'bg-amber-50 text-amber-700' },
  { icon: '📝', title: 'Exams & Grading', desc: 'Create exams, grade assignments, and generate report cards.', color: 'bg-gray-100 text-gray-800' },
  { icon: '💬', title: 'Communication', desc: 'Connect with parents, students, and teachers instantly.', color: 'bg-indigo-50 text-indigo-700' },
  { icon: '📚', title: 'Library Management', desc: 'Manage books, issue/return, track inventory and fines.', color: 'bg-gray-100 text-gray-800' },
  { icon: '🚌', title: 'Transport Management', desc: 'Track vehicles, manage routes, and ensure student safety.', color: 'bg-gray-100 text-gray-800' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Powerful dashboards and reports for better decision making.', color: 'bg-amber-50 text-amber-700' },
];


function MagneticButton({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [fast, setFast] = useState(true);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setFast(true);
    setPos({ x: (e.clientX - cx) * 0.3, y: (e.clientY - cy) * 0.3 });
  };
  const handleLeave = () => {
    setFast(false);
    setPos({ x: 0, y: 0 });
  };

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transitionDuration: fast ? '20ms' : '400ms', transitionTimingFunction: fast ? 'linear' : 'cubic-bezier(0.22,1,0.36,1)' }}
      className={`relative inline-flex items-center justify-center transition-[transform,box-shadow,filter] hover:scale-[1.04] hover:shadow-xl hover:brightness-110 ${className}`}
    >
      {children}
    </Link>
  );
}

function PricingCard({ p, billing }: { p: any; billing: 'monthly' | 'annual' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)');
  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });
  const [fast, setFast] = useState(true);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 16;
    const rotateY = (x - 0.5) * 16;
    setFast(true);
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.03)`);
    setSpot({ x: x * 100, y: y * 100, opacity: 1 });
  };
  const handleLeave = () => {
    setFast(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)');
    setSpot(s => ({ ...s, opacity: 0 }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform, transitionDuration: fast ? '15ms' : '450ms', transitionTimingFunction: fast ? 'linear' : 'cubic-bezier(0.22,1,0.36,1)', transitionProperty: 'transform, box-shadow' }}
      className={`relative rounded-3xl overflow-hidden flex flex-col will-change-transform cursor-pointer ${p.highlight ? `sm:scale-[1.03] ${p.glow}` : ''}`}
    >
      <div className={`bg-gradient-to-br ${p.color} p-6 sm:p-7 text-white relative overflow-hidden`}>
        {/* Spotlight that follows the cursor */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ opacity: spot.opacity, background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.35), transparent 70%)`, mixBlendMode: 'overlay' }}
        />
        {p.badge ? (
          <div className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full mb-4 relative ${p.highlight ? 'bg-white/20' : 'bg-white/15 text-white/90'}`}>
            {p.highlight && <span className="animate-pulse">⭐</span>}{p.badge.toUpperCase()}
          </div>
        ) : <div className="h-7 mb-4" />}
        <h3 className="text-2xl font-black relative">{p.name}</h3>
        <div className="flex items-end gap-1 mt-4 relative">
          <span className="text-white/70 text-sm font-medium pb-1">PKR</span>
          <span className="text-4xl sm:text-5xl font-black tracking-tight">{(billing === 'annual' ? p.annualPrice : p.monthlyPrice).toLocaleString()}</span>
          <span className="text-white/70 text-sm pb-1">/mo</span>
        </div>
        {billing === 'annual' && (
          <p className="text-white/60 text-xs mt-1 relative">PKR {((p.monthlyPrice - p.annualPrice) * 12).toLocaleString()} saved/year</p>
        )}
        <p className="text-white/50 text-xs mt-1 relative">{p.limit}</p>
      </div>
      <div className="bg-white flex-1 p-5 sm:p-6 border border-gray-100">
        <MagneticButton href="/signup" className={`w-full py-3 rounded-xl text-sm font-black mb-5 bg-gradient-to-r ${p.color} text-white`}>
          Get Started
        </MagneticButton>
        <ul className="space-y-2.5">
          {p.features.map((f: string) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
              <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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
    color: 'from-amber-600 to-amber-700', glow: 'shadow-2xl shadow-amber-500/25', ring: 'hover:ring-amber-500',
    features: ['2,000 students & 100 staff', 'Everything in Starter', 'Teacher portal', 'LMS & online courses', 'AI analytics & dropout prediction', 'WhatsApp notifications (5,000/mo)', 'Advanced reports & analytics', 'Priority support', '25 GB storage', 'Question bank & digital exams'],
  },
  {
    name: 'Enterprise', monthlyPrice: 20000, annualPrice: 16000,
    limit: 'Unlimited students', highlight: false, badge: 'Enterprise',
    color: 'from-indigo-800 to-indigo-900', glow: '', ring: 'hover:ring-indigo-600',
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
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
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
            <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-lg text-white transition-all bg-gray-950 hover:bg-gray-800 flex items-center gap-1.5">
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
              <Link href="/signup" onClick={() => setMobileMenu(false)} className="block text-center py-2.5 text-sm font-bold text-white rounded-lg bg-gray-950">Request Demo</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 sm:pt-32 sm:pb-32 overflow-hidden" style={{ background: 'linear-gradient(150deg, #14161C 0%, #1B1D24 55%, #101114 100%)' }}>
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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(150deg, rgba(20,22,28,0.75) 0%, rgba(27,29,36,0.8) 55%, rgba(16,17,20,0.85) 100%)' }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.08]" style={{ background: 'radial-gradient(circle at 70% 30%, #C08A2E, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 border border-purple-400/25 rounded-full mb-6">
              <span className="text-purple-300 text-xs font-semibold">⚡ All-in-One School Management Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.12] mb-5 tracking-tight">
              Manage Schools<br />
              Like <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Never Before.</span><br />
              Focus on Education,<br />
              We Handle the Rest.
            </h1>
            <p className="text-base sm:text-lg text-white/55 mb-7 leading-relaxed max-w-lg">
              MySchool is a powerful, secure, and easy-to-use platform that simplifies school operations, improves communication, and enhances learning outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-bold rounded-xl transition-all text-sm bg-gray-950 hover:bg-gray-800">
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

          {/* Dashboard Preview + Phone mockup — real product screenshot */}
          <div className="relative mt-6 sm:mt-0 max-w-[380px] sm:max-w-none mx-auto sm:mx-0">
            <style>{`
              @keyframes msk-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
              .msk-hero-shot { animation: msk-float 7s ease-in-out infinite; }
            `}</style>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero/dashboard-mockup.png"
              alt="MySchool admin dashboard and mobile app"
              className="msk-hero-shot w-full h-auto drop-shadow-2xl"
              loading="eager"
            />
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
            <span className="text-amber-700 font-bold text-xs uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-4 tracking-tight">
              All-in-One Solution for <span className="text-indigo-700">Modern Schools</span>
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

      {/* ── Stats Band (continuous marquee) ── */}
      <section className="py-10 overflow-hidden" style={{ background: 'linear-gradient(120deg, #14161C 0%, #22252E 100%)' }}>
        <style>{`
          @keyframes msk-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .msk-marquee-track { animation: msk-marquee 22s linear infinite; }
        `}</style>
        <div className="flex w-max msk-marquee-track">
          {[0, 1].map(dup => (
            <div key={dup} className="flex items-center flex-shrink-0">
              {STATS.map(s => (
                <div key={`${dup}-${s.label}`} className="text-center px-8 sm:px-12 flex-shrink-0">
                  <div className="text-2xl mb-1.5">{s.icon}</div>
                  <p className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap">{s.value}</p>
                  <p className="text-xs text-white/70 mt-0.5 font-medium whitespace-nowrap">{s.label}</p>
                </div>
              ))}
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
              <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center text-xl">🏫</div>
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
            <span className="text-amber-700 font-bold text-xs uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-6 tracking-tight leading-tight">
              Smart Platform. Better Experience.<br /><span className="text-indigo-700">Brighter Future.</span>
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
              <span className="text-amber-700 font-bold text-xs uppercase tracking-widest">Flexible Pricing Plans</span>
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
              <PricingCard key={p.name} p={p} billing={billing} />
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
              <span className="text-amber-700 font-bold text-xs uppercase tracking-widest">Loved by Educators</span>
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
      <section className="py-14 sm:py-16 relative overflow-hidden" style={{ background: 'linear-gradient(120deg, #14161C 0%, #22252E 100%)' }}>
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
                <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
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
