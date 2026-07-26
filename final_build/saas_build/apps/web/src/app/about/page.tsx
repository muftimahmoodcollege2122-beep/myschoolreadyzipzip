'use client';
import React from 'react';
import Link from 'next/link';

const TEAM = [
  { name: 'Ahmad Raza', role: 'Chief Executive Officer', initials: 'AR', color: 'from-gray-900 to-black' },
  { name: 'Sara Khan', role: 'Chief Technology Officer', initials: 'SK', color: 'from-indigo-700 to-indigo-900' },
  { name: 'Usman Ali', role: 'Head of Product', initials: 'UA', color: 'from-amber-600 to-amber-700' },
  { name: 'Fatima Malik', role: 'Head of Partnerships', initials: 'FM', color: 'from-emerald-600 to-emerald-700' },
];

const WHY_ITEMS = [
  { icon: '🛡️', title: 'Secure & Reliable', desc: 'Enterprise-grade security to keep your data safe.' },
  { icon: '🎧', title: 'Dedicated Support', desc: 'Our experts are always here to help you.' },
  { icon: '☁️', title: 'Cloud-Based', desc: 'Access anytime, anywhere, from any device.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Powerful mobile apps for parents, teachers & students.' },
  { icon: '📈', title: 'Scalable', desc: 'Built to grow with your institution.' },
  { icon: '⚙️', title: 'Always Improving', desc: 'We innovate constantly to serve you better.' },
];

const STATS = [
  { icon: '🏛️', value: '500+', label: 'Institutions Trust MySchool' },
  { icon: '👥', value: '120,000+', label: 'Students Managed' },
  { icon: '🎓', value: '50,000+', label: 'Teachers Empowered' },
  { icon: '🛡️', value: '99.9%', label: 'Uptime Reliability' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAF7F1' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
            <div className="leading-none">
              <span className="block font-black text-lg text-gray-900">MySchool</span>
              <span className="block text-[10px] font-medium text-gray-400">Smart School Management</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">Home</Link>
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/security-center" className="text-sm font-medium text-gray-600 hover:text-gray-900">Security</Link>
            <Link href="/about" className="text-sm font-semibold text-amber-700 relative">
              Company
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">Login</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-lg bg-gray-950 hover:bg-gray-800 text-white transition-colors flex items-center gap-1.5">
              Book a Demo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative z-10 lg:pb-24">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">About Us</span>
                <span className="w-8 h-px bg-amber-400" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Empowering Education.<br />Enriching Futures.
              </h1>
              <p className="text-gray-500 text-base leading-relaxed max-w-md mb-7">
                MySchool is on a mission to simplify school management and empower educational institutions with cutting-edge technology, so they can focus on what truly matters — shaping the future.
              </p>
              <Link href="#story" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors">
                Our Journey
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
            </div>
            <div className="relative lg:pb-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero/campus-building.png"
                alt="MySchool campus"
                className="w-full h-56 sm:h-80 object-cover rounded-3xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Mission / Vision / Values card — overlaps hero bottom */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-6 lg:-mt-16">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-4">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Our Mission</h3>
              <p className="text-gray-500 text-sm leading-relaxed">To eliminate administrative burden so principals can lead, teachers can teach, and students can learn — without paperwork slowing them down.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-4">👁️</div>
              <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Our Vision</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Every school — regardless of size, location, or budget — deserves to operate with the same efficiency as the world's best institutions.</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-4">💎</div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>Our Values</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {['Student-Centric', 'Excellence', 'Innovation', 'Collaboration', 'Integrity', 'Responsibility'].map(v => (
                  <div key={v} className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="text-amber-500 text-xs">✓</span>{v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats band */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 sm:mt-14">
        <div className="rounded-3xl p-8 sm:p-10 grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ background: 'linear-gradient(150deg, #14161C 0%, #22252E 100%)' }}>
          {STATS.map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/40 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div id="story" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Our Story</span>
              <span className="w-8 h-px bg-amber-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              A Journey Built on<br />Passion and Purpose.
            </h2>
            <div className="space-y-4 text-gray-500 text-sm leading-relaxed mb-7">
              <p>MySchool was founded after seeing a principal in Lahore manage 500 students in a spreadsheet. We knew there had to be a better way for schools to run.</p>
              <p>We brought together a team of educators, technologists, and problem-solvers who understood the daily challenges schools face — and built a modern, all-in-one platform that connects students, teachers, parents, and administrators on a single, secure, intelligent system.</p>
              <p>Today, MySchool is proud to partner with hundreds of institutions across Pakistan, driving digital transformation in education and creating a better tomorrow.</p>
            </div>
            <Link href="/features" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-colors">
              More About Our Journey
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero/campus-building.png"
              alt="MySchool campus pathway"
              className="w-full h-64 sm:h-80 object-cover rounded-3xl shadow-lg"
            />
            <div className="hidden sm:block absolute -bottom-8 -right-6 w-56 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <p className="text-3xl text-amber-300 font-serif leading-none mb-1">&ldquo;</p>
              <p className="text-gray-800 text-sm leading-relaxed font-medium">We don&apos;t just build software. We build solutions that help educators change lives.</p>
              <div className="w-8 h-0.5 bg-amber-400 mt-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Why MySchool */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-8 h-px bg-amber-400" />
          <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Why MySchool?</span>
          <span className="w-8 h-px bg-amber-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-10" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          Designed for Schools. Driven by Excellence.
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {WHY_ITEMS.map(w => (
            <div key={w.title}>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-xl mx-auto mb-3">{w.icon}</div>
              <p className="font-bold text-gray-900 text-sm mb-1">{w.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* People Behind MySchool */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">People Behind MySchool</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              A Team That Cares<br />About Education
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">Our diverse team of educators, developers, designers and support specialists share one common goal — empowering institutions and impacting millions of lives.</p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:shadow-lg transition-shadow">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-black text-lg mx-auto mb-3`}>{m.initials}</div>
                <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ background: 'linear-gradient(150deg, #14161C 0%, #22252E 100%)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-2xl flex-shrink-0">🛡️</div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Join Thousands of Institutions<br className="hidden sm:block" /> Transforming Education with MySchool
            </h2>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link href="/signup" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5">
              Book a Demo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <Link href="mailto:hello@myschool.pk" className="px-6 py-3 border border-white/20 text-white font-semibold rounded-xl text-sm hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 pt-14 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
                <span className="font-black text-lg text-white">MySchool</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-4">Empowering educational institutions with intelligent technology for a better tomorrow.</p>
              <div className="flex gap-3">
                {['LinkedIn', 'Twitter', 'YouTube'].map(s => (
                  <a key={s} href="#" className="text-xs text-gray-600 hover:text-white transition-colors font-medium">{s}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features|/features', 'Pricing|/pricing', 'Security|/security-center'] },
              { title: 'Company', links: ['About|/about'] },
              { title: 'Legal', links: ['Privacy Policy|/privacy-policy', 'Terms of Service|/terms', 'Security|/security-center'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-bold text-white mb-4 text-sm">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(l => {
                    const [label, href] = l.split('|');
                    return <li key={label}><Link href={href} className="text-gray-500 hover:text-white text-sm transition-colors">{label}</Link></li>;
                  })}
                </ul>
              </div>
            ))}
            <div>
              <p className="font-bold text-white mb-4 text-sm">Get in Touch</p>
              <ul className="space-y-2.5 text-sm text-gray-500">
                <li>D.I. Khan, KPK, Pakistan</li>
                <li><a href="mailto:hello@myschool.pk" className="hover:text-white transition-colors">hello@myschool.pk</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-sm text-center sm:text-left">© 2026 MySchool Technologies. All rights reserved.</p>
            <p className="text-gray-600 text-sm">Made with ❤️ for education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
