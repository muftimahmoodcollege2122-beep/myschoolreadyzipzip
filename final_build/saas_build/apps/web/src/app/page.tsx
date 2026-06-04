'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ── Data ─────────────────────────────────────────── */
const FEATURE_GROUPS = [
  {
    icon: '🌐', title: 'School Website', color: 'from-blue-500 to-blue-600',
    items: ['Custom domain', 'Admissions page', 'News & events', 'Photo gallery', 'Staff directory', 'SEO optimized'],
  },
  {
    icon: '🏫', title: 'Administration', color: 'from-indigo-500 to-indigo-600',
    items: ['Student management', 'Staff management', 'Admissions CRM', 'Timetables', 'Multi-branch support', 'Audit logs'],
  },
  {
    icon: '📚', title: 'Academics', color: 'from-purple-500 to-purple-600',
    items: ['Attendance tracking', 'Exam management', 'Results & grades', 'LMS & courses', 'Assignments', 'Certificates'],
  },
  {
    icon: '💰', title: 'Finance', color: 'from-green-500 to-green-600',
    items: ['Fee collection', 'Online invoicing', 'JazzCash / Stripe', 'Scholarships', 'Financial reports', 'Budget tracking'],
  },
  {
    icon: '📣', title: 'Communication', color: 'from-yellow-500 to-orange-500',
    items: ['SMS alerts', 'Email notifications', 'Parent portal', 'WhatsApp integration', 'Announcements', 'Emergency alerts'],
  },
  {
    icon: '🤖', title: 'AI Automation', color: 'from-pink-500 to-red-500',
    items: ['Notice generation', 'Timetable AI', 'Report card AI', 'Dropout prediction', 'AI chatbot', 'Exam paper generation'],
  },
];

const PRICING = [
  {
    name: 'Starter', price: '4,999', period: '/month', color: 'border-gray-200 bg-white', badge: '', badgeBg: '',
    textColor: 'text-gray-900', btnClass: 'bg-gray-900 hover:bg-gray-700 text-white',
    limit: 'Up to 500 students',
    features: ['500 students', 'School website', 'Admin portal', 'Attendance & fees', 'Email support', '5 GB storage', 'Standard reports'],
  },
  {
    name: 'Professional', price: '12,999', period: '/month', color: 'border-blue-500 bg-blue-600', badge: 'Most Popular', badgeBg: 'bg-yellow-400 text-gray-900',
    textColor: 'text-white', btnClass: 'bg-white text-blue-700 hover:bg-blue-50',
    limit: 'Up to 2,000 students',
    features: ['2,000 students', 'All Starter features', 'LMS + courses', 'Teacher & parent portals', 'AI Assistant', 'SMS integration', 'Priority support', 'Custom branding', '25 GB storage'],
  },
  {
    name: 'Enterprise', price: '29,999', period: '/month', color: 'border-purple-400 bg-white', badge: 'Enterprise', badgeBg: 'bg-purple-100 text-purple-700',
    textColor: 'text-gray-900', btnClass: 'bg-purple-600 hover:bg-purple-500 text-white',
    limit: 'Unlimited students',
    features: ['Unlimited students', 'All Pro features', 'White-label branding', 'Custom domain', 'API access', '24/7 dedicated support', 'SLA guarantee', 'Multi-campus', 'Unlimited storage', 'GraphQL API'],
  },
];

const TESTIMONIALS = [
  { name: 'Dr. Fatima Malik', role: 'Principal, Beacon House School System', avatar: 'F', rating: 5, text: 'MySchool transformed how we manage 3,200 students across 4 campuses. Fee collection efficiency improved by 42% in the very first month. The parent app is a game changer.' },
  { name: 'Ahmed Hassan', role: 'Director, City Grammar School', avatar: 'A', rating: 5, text: 'The AI timetable generator saved our admin team 2 full working days every semester. Setup took under 30 minutes. I wish we had found this sooner.' },
  { name: 'Sarah Khan', role: 'CFO, Roots International Schools', avatar: 'S', rating: 5, text: 'Real-time fee analytics and automated SMS reminders cut our outstanding dues by 60%. The financial reporting alone is worth the entire subscription.' },
  { name: 'Bilal Akhtar', role: 'IT Director, The Educators', avatar: 'B', rating: 5, text: 'We replaced 6 different systems with MySchool. It just works. API integration was seamless and the support team is excellent.' },
];

const FAQS = [
  { q: 'How long does setup take?', a: 'Your school website and management system go live in under 10 minutes. Our automated provisioning creates everything — database, website, accounts, and roles — instantly after signup.' },
  { q: 'Do I need to hire a developer?', a: 'Absolutely not. Everything is managed through intuitive dashboards. The website builder requires no coding. If you can use WhatsApp, you can run MySchool.' },
  { q: 'Can I use my own domain?', a: 'Yes. You get a free subdomain (yourschool.myschool.pk) immediately, and you can connect your own custom domain (www.yourschool.com) in the settings.' },
  { q: 'Which payment methods are supported?', a: 'JazzCash, EasyPaisa, Bank Transfer, and Stripe (international). Parents can pay directly from the app or parent portal.' },
  { q: 'Is there a mobile app?', a: 'Yes. Students, parents, and teachers all get dedicated mobile experiences via the progressive web app — works on all devices without App Store installation.' },
  { q: 'What happens to my data?', a: 'Your data is 100% yours. We use enterprise-grade encryption, daily backups, and you can export everything at any time. Full GDPR-style privacy controls.' },
  { q: 'Can I migrate from my existing system?', a: 'Yes. We offer free data migration support for students, fees, and academic records. Our team will guide you step-by-step at no extra cost.' },
  { q: 'Is there a free trial?', a: 'Yes — 30 days free, no credit card required. You get full access to all features including the AI assistant, LMS, and parent portal.' },
];

const STEPS = [
  { step: '01', title: 'Visit & Register', desc: 'Fill in your school name, principal name, email, and student count. Takes 2 minutes.' },
  { step: '02', title: 'Auto-Provisioning', desc: 'System instantly creates your database, website, subdomain, admin account, and default settings.' },
  { step: '03', title: 'Setup Wizard', desc: 'Configure classes, sections, subjects, staff, and payment gateway through a guided wizard.' },
  { step: '04', title: 'Go Live', desc: 'Your school website and management system are live. Share the URL with parents immediately.' },
];

const MODULES = [
  'Student Information System', 'Learning Management System', 'Finance & Billing', 'HR & Payroll',
  'Attendance (QR/RFID)', 'Exam Management', 'Library Management', 'Hostel Management',
  'Transport Management', 'Website Builder', 'AI Automation', 'Parent Portal',
  'Teacher Portal', 'Student Portal', 'Alumni Portal', 'Communication Center',
  'Analytics & Reports', 'Multi-Tenant SaaS', 'Custom Domains', 'White-Label Branding',
];

/* ── Component ────────────────────────────────────── */
export default function MarketingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Sticky Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 40 ? 'bg-white/95 backdrop-blur shadow-md border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
            <span className={`font-black text-xl ${scrollY > 40 ? 'text-gray-900' : 'text-white'}`}>MySchool</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Solutions', 'Demo'].map(n => (
              <a key={n} href={`#${n.toLowerCase()}`} className={`text-sm font-semibold transition-colors ${scrollY > 40 ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>{n}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${scrollY > 40 ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:text-white'}`}>Sign In</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30">Get Started →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2137 0%, #1A3A5C 50%, #1E4D7B 100%)' }}>
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold mb-6">
              🚀 The All-in-One Operating System for Modern Schools
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Launch Your School Website &{' '}
              <span className="text-transparent" style={{ WebkitTextStroke: '1px #60A5FA' }}>Management System</span>
              {' '}in Minutes
            </h1>
            <p className="text-xl text-blue-100/80 mb-8 leading-relaxed">
              Admissions, attendance, fees, exams, HR, parent portal, student portal, website, mobile app, and AI automation — all in one platform. No developers needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-blue-500 hover:bg-blue-400 text-white font-black text-lg rounded-2xl transition-all shadow-2xl shadow-blue-500/40 hover:shadow-blue-400/50 hover:scale-105">
                Start Free Trial →
              </Link>
              <a href="#demo" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border border-white/20 transition-all">
                ▶ Book Demo
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-blue-200/60">
              <span>✓ 30-day free trial</span>
              <span>✓ No credit card</span>
              <span>✓ Setup in 10 min</span>
            </div>
          </div>

          {/* Right — Live Product Preview */}
          <div className="relative">
            <div className="bg-[#0A1929] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#1A2D45] border-b border-white/5">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60"/><div className="w-3 h-3 rounded-full bg-yellow-500/60"/><div className="w-3 h-3 rounded-full bg-green-500/60"/></div>
                <div className="flex-1 mx-3 bg-[#0F2137] rounded-lg px-3 py-1.5 text-xs text-blue-300/60 font-mono">demo.myschool.pk/dashboard</div>
              </div>
              {/* Dashboard preview */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[['2,847', 'Students', '#3B82F6'], ['94.2%', 'Attendance', '#10B981'], ['Rs. 8.4M', 'Revenue', '#8B5CF6'], ['142', 'Teachers', '#F59E0B']].map(([v,l,c])=>(
                    <div key={l} className="bg-[#1A2D45] rounded-xl p-3 border border-white/5">
                      <p className="font-black text-xl" style={{color:c}}>{v}</p>
                      <p className="text-xs text-blue-300/50 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#1A2D45] rounded-xl p-3 border border-white/5 mb-3">
                  <p className="text-xs text-blue-300/50 mb-2">Monthly Revenue Trend</p>
                  <div className="flex items-end gap-1 h-16">
                    {[40,55,48,70,62,80,75,88,95,85,100,110].map((v,i)=>(
                      <div key={i} className="flex-1 rounded-t-sm" style={{height:`${v}%`,background:i===11?'#3B82F6':'#3B82F620'}}/>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[['📊','Dashboard'],['👩‍🎓','Students'],['💰','Fees'],['🤖','AI']].map(([icon,l])=>(
                    <div key={l} className="bg-[#1A2D45] rounded-lg p-2 text-center border border-white/5">
                      <p className="text-lg">{icon}</p>
                      <p className="text-[9px] text-blue-300/50 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-black px-3 py-2 rounded-xl shadow-lg">✅ Live in 10 min</div>
            <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 text-xs font-black px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5">🤖 AI Powered</div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/5 border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['500+', 'Schools Onboarded'], ['120K+', 'Students Managed'], ['Rs. 2B+', 'Fees Processed'], ['99.9%', 'Uptime SLA']].map(([v,l])=>(
              <div key={l} className="text-center">
                <p className="text-2xl font-black text-white">{v}</p>
                <p className="text-xs text-blue-300/60 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem → Solution ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Is This Your School Today?</h2>
            <p className="text-xl text-gray-500">Most schools waste 20+ hours a week on tasks that MySchool automates completely.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Without */}
            <div className="bg-white rounded-3xl border-2 border-red-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">😰</div>
                <h3 className="font-black text-xl text-red-700">Without MySchool</h3>
              </div>
              <div className="space-y-3">
                {[
                  ['Manual attendance registers', '3 hrs/day wasted'],
                  ['Excel fee records & chasing parents', 'Rs. 500K+ in defaults'],
                  ['Paper report cards', '2 weeks printing every term'],
                  ['Expensive website developers', 'Rs. 200K+ one-time cost'],
                  ['No parent communication', 'Complaints & confusion'],
                  ['No AI — everything manual', 'Staff burnout'],
                ].map(([p, cost]) => (
                  <div key={p} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2"><span className="text-red-500">✗</span><span className="text-sm font-medium text-gray-700">{p}</span></div>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{cost}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* With */}
            <div className="bg-blue-600 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🚀</div>
                <h3 className="font-black text-xl">With MySchool</h3>
              </div>
              <div className="space-y-3">
                {[
                  ['Automated QR/RFID attendance', 'Zero manual work'],
                  ['Online fee collection + SMS alerts', '95% collection rate'],
                  ['Digital report cards in 1 click', 'Instant generation'],
                  ['Professional school website', 'Included free'],
                  ['Parent portal + mobile app', 'Real-time updates'],
                  ['AI generates notices, timetables, exams', '10× productivity'],
                ].map(([p, benefit]) => (
                  <div key={p} className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2"><span className="text-green-300">✓</span><span className="text-sm font-medium text-white/90">{p}</span></div>
                    <span className="text-xs font-bold text-green-300 bg-white/10 px-2 py-0.5 rounded-full">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── All Modules Ticker ── */}
      <section className="py-4 bg-blue-600 overflow-hidden">
        <div className="flex gap-6 animate-marquee whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite' }}>
          {[...MODULES, ...MODULES].map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300"/>
              {m}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Everything Included</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">One Platform. Every Feature You Need.</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">No add-ons, no per-feature pricing. Every module is included in every plan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_GROUPS.map(g => (
              <div key={g.title} className="group rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>{g.icon}</div>
                <h3 className="font-black text-xl text-gray-900 mb-3">{g.title}</h3>
                <ul className="space-y-2">
                  {g.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Screenshots ── */}
      <section id="demo" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-bold text-sm uppercase tracking-wider">Live Product Preview</span>
            <h2 className="text-4xl font-black text-white mt-2 mb-4">See Every Portal in Action</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Admin Dashboard', icon: '📊', desc: 'Real-time KPIs, analytics, and controls', items: ['Student stats', 'Fee collection', 'Attendance heat map', 'AI insights'] },
              { title: 'Teacher Portal', icon: '👨‍🏫', desc: 'Attendance, grades, assignments', items: ['Class schedule', 'Grade book', 'Quick attendance', 'AI lesson planner'] },
              { title: 'Student Portal', icon: '👩‍🎓', desc: 'Grades, timetable, LMS courses', items: ['My schedule', 'Subject grades', 'Homework due', 'Library access'] },
              { title: 'Parent App', icon: '👨‍👩‍👧', desc: 'Live tracking, fees, results', items: ['Child attendance', 'Fee payment', 'Teacher chat', 'Exam results'] },
            ].map(p => (
              <div key={p.title} className="bg-[#1A2D45] rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/40 transition-all group">
                <div className="p-4 border-b border-white/5">
                  <span className="text-3xl">{p.icon}</span>
                  <h3 className="font-black text-white mt-2">{p.title}</h3>
                  <p className="text-blue-300/60 text-xs mt-1">{p.desc}</p>
                </div>
                <div className="p-4 space-y-2">
                  {p.items.map(i => (
                    <div key={i} className="flex items-center gap-2 text-xs text-blue-200/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60"/>
                      {i}
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4">
                  <div className="h-20 bg-blue-900/30 rounded-xl border border-blue-500/10 flex items-center justify-center">
                    <span className="text-4xl opacity-30">{p.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Customer Journey</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">From Signup to Live School in 4 Steps</h2>
            <p className="text-xl text-gray-500">No technical setup. No waiting. Just fill a form and your school OS is live.</p>
          </div>
          <div className="relative">
            <div className="absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200 to-blue-400 hidden md:block"/>
            <div className="grid md:grid-cols-4 gap-8 relative">
              {STEPS.map((s, i) => (
                <div key={s.step} className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-600 flex flex-col items-center justify-center text-white mb-5 shadow-xl shadow-blue-500/30 relative">
                    <span className="text-xs font-bold text-blue-200">Step</span>
                    <span className="text-3xl font-black">{s.step}</span>
                  </div>
                  <h3 className="font-black text-xl text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-provisioning callout */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-black mb-3">What Your School Gets Automatically</h3>
                <p className="text-blue-100/80 mb-5">When a school signs up, our provisioning engine creates everything in under 60 seconds.</p>
                <div className="grid grid-cols-2 gap-2">
                  {['School database', 'School website', 'Custom subdomain', 'Admin account', 'Role configuration', 'Storage bucket', 'Email setup', 'Billing enabled', 'Onboarding checklist', 'Default timetable'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-blue-100">
                      <span className="text-green-300 flex-shrink-0">⚡</span>{item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-5 border border-white/20 font-mono text-sm">
                <p className="text-green-300 mb-2">// Auto-provisioning (60 seconds)</p>
                {['✅  Creating tenant database...', '✅  Generating school website...', '✅  Configuring subdomain...', '✅  Setting up admin account...', '✅  Configuring RBAC roles...', '✅  Enabling billing module...', '✅  Sending welcome email + SMS...', '✅  Launching onboarding wizard...', '', '🚀  Your school is LIVE!'].map((l,i)=>(
                  <p key={i} className={`text-xs ${l.startsWith('✅')?'text-green-300':l.startsWith('🚀')?'text-yellow-300 font-bold mt-2':l===''?'':' text-blue-200'}`}>{l}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Simple Pricing</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">Pricing That Grows With You</h2>
            <p className="text-xl text-gray-500">All plans include a 30-day free trial. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map(p => (
              <div key={p.name} className={`rounded-3xl border-2 ${p.color} overflow-hidden shadow-xl ${p.name==='Professional'?'scale-105 shadow-blue-500/20':''}`}>
                <div className={`p-8 ${p.name==='Professional'?'':'bg-white/50'}`}>
                  {p.badge && <span className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-4 ${p.badgeBg}`}>{p.badge}</span>}
                  <h3 className={`font-black text-2xl mb-1 ${p.textColor}`}>{p.name}</h3>
                  <p className={`text-sm mb-4 ${p.textColor==='text-white'?'text-white/70':'text-gray-400'}`}>{p.limit}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-sm font-bold ${p.textColor==='text-white'?'text-white/70':'text-gray-500'}`}>Rs.</span>
                    <span className={`text-4xl font-black ${p.textColor}`}>{p.price}</span>
                    <span className={`text-sm ${p.textColor==='text-white'?'text-white/60':'text-gray-400'}`}>{p.period}</span>
                  </div>
                  <Link href="/signup" className={`block text-center py-3 rounded-2xl font-black transition-all mt-5 mb-6 ${p.btnClass}`}>
                    Start Free Trial →
                  </Link>
                  <ul className="space-y-2">
                    {p.features.map(f => (
                      <li key={f} className={`flex items-center gap-2 text-sm ${p.textColor==='text-white'?'text-white/80':'text-gray-600'}`}>
                        <span className={p.textColor==='text-white'?'text-green-300':'text-green-500'}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">All prices in Pakistani Rupees. Annual billing saves 20%. Custom enterprise pricing available.</p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Trusted by School Leaders</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">What Principals Say About Us</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-3xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex text-yellow-400 mb-4">{'★'.repeat(t.rating)}</div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">{t.avatar}</div>
                  <div><p className="font-black text-gray-900">{t.name}</p><p className="text-sm text-gray-500">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-500">Everything you need to know before you start.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className={`bg-white rounded-2xl border overflow-hidden transition-all ${activeFaq===i?'border-blue-200 shadow-md':'border-gray-100'}`}>
                <button onClick={() => setActiveFaq(activeFaq===i?null:i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-bold text-gray-900 text-lg">{faq.q}</span>
                  <span className={`text-2xl transition-transform ${activeFaq===i?'rotate-45 text-blue-600':'text-gray-400'}`}>+</span>
                </button>
                {activeFaq===i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #0F2137 0%, #1E4D7B 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm font-bold mb-8">
            🚀 Join 500+ schools already using MySchool
          </div>
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Start Your School&apos;s<br />
            <span className="text-blue-400">Digital Transformation</span> Today
          </h2>
          <p className="text-xl text-blue-100/70 mb-10 max-w-3xl mx-auto">
            One subscription. Every module. Your complete school operating system — website, management, AI, portals — live in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Enter your school email address"
              className="px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 outline-none focus:border-blue-400 w-full max-w-sm text-sm"
            />
            <Link href="/signup" className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl transition-all hover:scale-105 shadow-xl shadow-blue-500/30 whitespace-nowrap">
              Get Started Free →
            </Link>
          </div>
          <p className="text-blue-300/50 text-sm">30-day free trial · No credit card · Setup in 10 minutes · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
                <span className="font-black text-xl text-white">MySchool</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">The all-in-one operating system for modern schools, colleges, and universities. Trusted by 500+ institutions.</p>
              <div className="flex gap-3">
                {['WhatsApp', 'LinkedIn', 'Twitter'].map(s=><button key={s} className="text-xs text-gray-500 hover:text-white transition-colors">{s}</button>)}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Roadmap', 'Changelog', 'API Docs'] },
              { title: 'Solutions', links: ['Schools', 'Colleges', 'Universities', 'Madrassas', 'Academies'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Privacy', 'Terms'] },
            ].map(col=>(
              <div key={col.title}>
                <p className="font-bold text-white mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l=><li key={l}><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 MySchool. All rights reserved. Made in Pakistan 🇵🇰</p>
            <p className="text-gray-600 text-xs">Enterprise-grade security · 99.9% uptime · ISO 27001 compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
