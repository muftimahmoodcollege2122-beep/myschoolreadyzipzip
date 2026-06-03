'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const FEATURES = [
  { icon: '🎓', title: 'Student Management', desc: 'Complete student lifecycle from admission to graduation with profiles, grades, and parent communication.' },
  { icon: '👨‍🏫', title: 'Teacher Portal', desc: 'Attendance, assignments, grade books, and lesson planning — all in one powerful teacher workspace.' },
  { icon: '💰', title: 'Fee Management', desc: 'Automated invoicing, installment plans, multi-gateway payments, and real-time collection reports.' },
  { icon: '📊', title: 'Analytics & Reports', desc: 'Executive dashboards with AI-powered insights, trend forecasting, and custom report generation.' },
  { icon: '📚', title: 'LMS Integration', desc: 'Full learning management with courses, quizzes, video lessons, and student progress tracking.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Generate timetables, notices, report cards, and exam papers instantly with built-in AI.' },
];
const STATS = [{ value: '10,000+', label: 'Students Managed' }, { value: '500+', label: 'Schools Onboarded' }, { value: 'Rs. 2B+', label: 'Fees Processed' }, { value: '99.9%', label: 'Uptime SLA' }];
const PRICING = [
  { name: 'Starter', price: '4,999', color: 'border-gray-200', badge: '', textColor: 'text-gray-900', features: ['Up to 500 students', 'Basic modules', 'Email support', '1 school branch', 'Standard reports'] },
  { name: 'Growth', price: '12,999', color: 'border-blue-500', badge: 'Most Popular', textColor: 'text-blue-600', features: ['Up to 2,000 students', 'All modules + LMS', 'Priority support', '3 branches', 'AI-powered reports', 'Custom branding'] },
  { name: 'Pro', price: '29,999', color: 'border-purple-500', badge: 'Enterprise', textColor: 'text-purple-600', features: ['Unlimited students', 'All modules', '24/7 dedicated support', 'Unlimited branches', 'White-label', 'API access', 'SLA guarantee'] },
];
const TESTIMONIALS = [
  { name: 'Dr. Fatima Malik', role: 'Principal, Beacon House', text: 'MySchool transformed how we manage 3,000 students. Fee collection efficiency improved by 40% in the first month.' },
  { name: 'Ahmed Hassan', role: 'Director, City Grammar', text: 'The AI timetable generator saved our admin team 2 full days every semester. Incredible platform.' },
  { name: 'Sarah Khan', role: 'CFO, Roots International', text: 'Real-time fee analytics and automated reminders reduced our outstanding dues by 60%. Game changer.' },
];

export default function MarketingPage() {
  const [active, setActive] = useState('Growth');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><span className="text-white font-black text-lg">M</span></div>
            <span className="font-black text-gray-900 text-xl tracking-tight">MySchool</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {['Features','Pricing','Solutions','Demo'].map(n => <a key={n} href={`#${n.toLowerCase()}`} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{n}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600 hidden md:block transition-colors">Sign In</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-sm">Get Started →</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-6">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 70% 20%, #3b82f6 0%, transparent 50%)'}} />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">🚀 Complete School Operating System</div>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">Run Your School<br/><span style={{background:'linear-gradient(135deg,#60a5fa,#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Smarter.</span></h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">One platform for student management, fee collection, LMS, HR, transport, hostel, and AI-powered analytics. Trusted by 500+ schools across Pakistan.</p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href="/login" className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all shadow-lg" style={{boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>Start Free Trial →</Link>
              <a href="#demo" className="px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all">▶ Watch Demo</a>
            </div>
            <p className="text-slate-400 text-sm">✓ No credit card required &nbsp;✓ 30-day free trial &nbsp;✓ Setup in minutes</p>
          </div>
          {/* Dashboard Mockup */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/70"/><div className="w-3 h-3 rounded-full bg-yellow-500/70"/><div className="w-3 h-3 rounded-full bg-green-500/70"/>
              <span className="ml-2 text-slate-500 text-xs font-mono">myschool.edu.pk/dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[{l:'Students',v:'2,847',bg:'#1e40af20',border:'#3b82f640',c:'#60a5fa'},{l:'Attendance',v:'94.2%',bg:'#16653420',border:'#16a34a40',c:'#4ade80'},{l:'Revenue',v:'Rs. 8.4M',bg:'#6d28d920',border:'#8b5cf640',c:'#c084fc'},{l:'Teachers',v:'142',bg:'#92400e20',border:'#f59e0b40',c:'#fbbf24'}].map(s=>(
                <div key={s.l} className="rounded-xl p-3" style={{background:s.bg,border:`1px solid ${s.border}`}}>
                  <p className="text-xl font-black" style={{color:s.c}}>{s.v}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-900/60 rounded-xl p-3 mb-2">
              <p className="text-slate-400 text-xs mb-2 font-medium">Monthly Revenue Trend</p>
              <div className="flex items-end gap-1 h-14">
                {[40,55,45,70,60,85,75,90,80,95,88,100].map((h,i)=>(
                  <div key={i} className="flex-1 rounded-t-sm transition-colors" style={{height:`${h}%`,background:i===11?'#3b82f6':'rgba(59,130,246,0.35)'}}/>
                ))}
              </div>
              <div className="flex justify-between text-slate-500 text-[10px] mt-1">
                {['Jan','','','Apr','','','Jul','','','Oct','','Dec'].map((m,i)=><span key={i}>{m}</span>)}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {['📊 Dashboard','👩‍🎓 Students','💰 Fees','🤖 AI'].map(t=>(
                <div key={t} className="bg-slate-700/50 rounded-lg py-1.5 text-center text-[11px] text-slate-400 font-medium">{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 bg-blue-600">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s=><div key={s.label} className="text-center text-white"><p className="text-3xl font-black">{s.value}</p><p className="text-blue-200 text-sm mt-1">{s.label}</p></div>)}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Everything Your School Needs</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">From admissions to alumni — manage every aspect in one unified platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f=>(
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group cursor-default">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100 transition-colors">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {['📋 Admissions CRM','🚌 Transport','🏠 Hostel','📦 Inventory','🌐 Website Builder','👨‍👩‍👧 Parent Portal'].map(m=>(
              <div key={m} className="bg-white rounded-xl px-3 py-3 border border-gray-100 text-xs font-semibold text-gray-600 hover:border-blue-200 transition-colors">{m}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16"><h2 className="text-4xl font-black text-gray-900 mb-4">Built for Every Role</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon:'👨‍💼', role:'School Admin', color:'bg-blue-50 border-blue-100', tag:'bg-blue-600', features:['Complete school oversight','Financial reporting','Staff & HR management','AI-powered dashboards','Website builder'] },
              { icon:'👨‍🏫', role:'Teachers', color:'bg-green-50 border-green-100', tag:'bg-green-600', features:['Attendance marking','Grade management','Assignment builder','Student performance tracking','LMS content creation'] },
              { icon:'👩‍🎓', role:'Students & Parents', color:'bg-purple-50 border-purple-100', tag:'bg-purple-600', features:['Real-time grades & attendance','Fee payment online','Homework & assignments','School notices','Direct teacher messaging'] },
            ].map(r=>(
              <div key={r.role} className={`${r.color} border rounded-2xl p-6`}>
                <div className="text-4xl mb-3">{r.icon}</div>
                <h3 className="text-xl font-black text-gray-900 mb-4">{r.role}</h3>
                <ul className="space-y-2">{r.features.map(f=><li key={f} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span>{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16"><h2 className="text-4xl font-black text-gray-900 mb-4">Simple, Transparent Pricing</h2><p className="text-gray-500">No hidden fees. Cancel anytime.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map(p=>(
              <div key={p.name} onClick={()=>setActive(p.name)} className={`bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all ${active===p.name?p.color+' shadow-xl scale-[1.02]':'border-gray-100 hover:border-gray-200'}`}>
                {p.badge&&<span className={`inline-block text-xs font-bold px-2 py-1 rounded-full mb-3 ${p.name==='Growth'?'bg-blue-100 text-blue-700':'bg-purple-100 text-purple-700'}`}>{p.badge}</span>}
                <h3 className="text-xl font-black text-gray-900">{p.name}</h3>
                <div className="my-4"><span className={`text-4xl font-black ${active===p.name?p.textColor:'text-gray-900'}`}>Rs. {p.price}</span><span className="text-gray-400 text-sm">/mo</span></div>
                <ul className="space-y-2 mb-6">{p.features.map(f=><li key={f} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-green-500">✓</span>{f}</li>)}</ul>
                <Link href="/login" className={`w-full block text-center py-3 rounded-xl font-bold text-sm transition-colors ${active===p.name?'bg-blue-600 text-white hover:bg-blue-500':'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">Trusted by School Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t=>(
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-yellow-400 text-lg mb-4">★★★★★</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">{t.name[0]}</div>
                  <div><p className="font-bold text-sm text-gray-900">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="py-24 px-6" style={{background:'linear-gradient(135deg,#1d4ed8,#1e40af)'}}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-black mb-4">Ready to Transform Your School?</h2>
          <p className="text-blue-200 text-lg mb-8">Join 500+ schools already using MySchool. Start your 30-day free trial today.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your school email" className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 outline-none focus:border-white text-sm" />
            <Link href="/login" className="px-5 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">Get Started →</Link>
          </div>
          <p className="text-blue-300 text-xs mt-3">No credit card · Free trial · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-black">M</span></div>
                <span className="font-black text-white text-lg">MySchool</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">The complete School Operating System for modern educational institutions across Pakistan.</p>
              <div className="flex gap-3">
                {['📧 hello@myschool.pk','📞 +92-21-1234567'].map(c=><span key={c} className="text-xs bg-slate-800 px-2 py-1 rounded-lg">{c}</span>)}
              </div>
            </div>
            {[{title:'Product',links:['Features','Pricing','Security','API','Roadmap']},{title:'Solutions',links:['K-12 Schools','Universities','Coaching Centers','Madrasas','Colleges']},{title:'Company',links:['About Us','Blog','Careers','Contact','Support']}].map(col=>(
              <div key={col.title}><p className="font-bold text-white text-sm mb-3">{col.title}</p><ul className="space-y-2">{col.links.map(l=><li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>)}</ul></div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 MySchool. All rights reserved. Powered by NexGen Edu.</p>
            <div className="flex gap-6 text-sm">{['Privacy Policy','Terms of Service','Cookie Policy','Support'].map(l=><a key={l} href="#" className="hover:text-white transition-colors">{l}</a>)}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
