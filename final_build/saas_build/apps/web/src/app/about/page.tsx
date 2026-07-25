'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const TEAM = [
  { name: 'Ahmad Raza',      role: 'Chief Executive Officer', emoji: '👨‍💼', bio: '15+ years in EdTech. Former school principal turned entrepreneur. Passionate about democratizing education across Pakistan and beyond.', tags: ['Strategy', 'Education Policy', 'Leadership'] },
  { name: 'Sara Khan',       role: 'Chief Technology Officer', emoji: '👩‍💻', bio: 'Full-stack architect with expertise in multi-tenant SaaS platforms. Built systems serving 1M+ users. Alumna of LUMS CS program.', tags: ['Architecture', 'Cloud', 'Security'] },
  { name: 'Usman Ali',       role: 'Head of Product',          emoji: '👨‍🎨', bio: 'Product designer who spent 3 years visiting schools across Pakistan understanding real pain points. Designs for teachers, not boardrooms.', tags: ['UX Research', 'Product', 'Design'] },
  { name: 'Fatima Malik',    role: 'Head of Partnerships',     emoji: '👩‍🤝‍👩', bio: 'Previously worked with Punjab Education Department. Speaks Urdu, Punjabi, and English. Leads all school onboarding.', tags: ['Partnerships', 'Sales', 'Training'] },
  { name: 'Bilal Hussain',   role: 'Lead Engineer',            emoji: '👨‍🔧', bio: 'Backend expert who built the multi-tenant infrastructure powering MySchool. FAST-NUCES graduate passionate about clean, scalable systems.', tags: ['Node.js', 'PostgreSQL', 'DevOps'] },
  { name: 'Ayesha Siddiqui', role: 'Customer Success',         emoji: '👩‍🏫', bio: 'Former school teacher. Now helps schools get the most from MySchool through training, onboarding, and hands-on support.', tags: ['Training', 'Support', 'Urdu'] },
];

const MILESTONES = [
  { year: '2021', title: 'The Idea',        desc: 'Founded after seeing a principal in Lahore manage 500 students in Excel. We knew there had to be a better way.' },
  { year: '2022', title: 'First Product',   desc: 'Launched a basic fee management system for 3 pilot schools. Gathered feedback from 50+ teachers and parents in month one.' },
  { year: '2023', title: 'Full Platform',   desc: 'Released the complete MySchool platform with 25+ modules including attendance, exams, LMS, and the website builder.' },
  { year: '2024', title: 'Growing Fast',    desc: 'Onboarded 150+ schools across Pakistan and the Gulf. Added Urdu content, multi-campus support, and parent mobile access.' },
  { year: '2025', title: 'AI Integration',  desc: 'Launched AI dropout risk detection, performance prediction, and smart fee reminders — reducing dropout rates by 23%.' },
  { year: '2026', title: 'Going Global',    desc: 'Expanding to the UK, UAE, Saudi Arabia, and Malaysia. Building towards 1,000 schools by end of year.' },
];

const VALUES = [
  { icon: '🎓', title: 'Education First',     desc: 'Every decision starts with: does this make education better? Technology is the tool — education is the mission.' },
  { icon: '🌍', title: 'Accessible to All',   desc: 'From a small rural madrassa to a large urban chain — every school deserves modern tools. Our pricing reflects this.' },
  { icon: '🔒', title: 'Privacy & Trust',     desc: "Student data is sacred. We never sell it, share it, or use it for anything beyond making your school run better." },
  { icon: '🤝', title: 'Built With Schools',  desc: 'We visit schools, sit with teachers, watch principals work. Every feature comes from real pain — not assumptions.' },
  { icon: '⚡', title: 'Ship Fast',           desc: 'We push updates every week. When a school tells us something is broken, we fix it fast. Your feedback shapes the product.' },
  { icon: '🌱', title: 'Long-term Thinking',  desc: 'We are not chasing metrics. We are building a company that will serve schools for the next 50 years.' },
];

const STATS = [
  { value: '500+',  label: 'Schools Served',          icon: '🏫' },
  { value: '200K+', label: 'Students on Platform',    icon: '👩‍🎓' },
  { value: '12K+',  label: 'Teachers Using MySchool', icon: '👨‍🏫' },
  { value: '98%',   label: 'School Retention Rate',   icon: '❤️' },
  { value: '6',     label: 'Countries Active',         icon: '🌍' },
  { value: '23%',   label: 'Dropout Rate Reduction',  icon: '📉' },
];

const ROLES = [
  { icon: '🏫', title: 'For Schools',   desc: 'Complete management platform. Run your entire school from one dashboard — no IT team required.' },
  { icon: '👨‍🏫', title: 'For Teachers',  desc: 'Less paperwork, more teaching. Mark attendance in 30 seconds. Enter grades from your phone.' },
  { icon: '👩‍🎓', title: 'For Students',  desc: 'Access timetables, results, assignments, and the library from any device, anywhere.' },
  { icon: '👨‍👩‍👧', title: 'For Parents',   desc: 'Never miss an update. Get instant alerts on attendance, fees, results, and school notices.' },
];

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navLinks = [['Home', '/'], ['Features', '/#features'], ['Pricing', '/#pricing'], ['About', '/about']];

  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-950 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <span className={`font-black text-lg ${scrolled ? 'text-gray-900' : 'text-white'}`}>MySchool</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(([label, href]) => (
              <Link key={label} href={href}
                className={`text-sm font-medium transition-colors ${label === 'About' ? 'text-blue-500 font-bold' : scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/75 hover:text-white'}`}>
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={`text-sm font-semibold px-3 py-2 rounded-lg ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/80 hover:text-white'}`}>Sign In</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 bg-gray-950 text-white rounded-lg hover:bg-gray-800">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 text-center" style={{background:'linear-gradient(150deg,#0C1E35,#0F2D50 55%,#0F3D6E)'}}>
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold rounded-full mb-5 tracking-widest uppercase">Our Story</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
            We&apos;re on a mission to<br /><span className="text-blue-400">transform education</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            MySchool was born in 2021 when we watched a school principal in Lahore managing 500 students on paper registers and Excel. That day changed everything.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-7 py-3.5 bg-gray-950 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors">Start Free Trial</Link>
            <Link href="/#features" className="px-7 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors">See Features</Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats ── */}
      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mission / Vision / Goal ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">What Drives Us</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Three pillars that guide every decision we make.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon:'🎯', label:'OUR MISSION', color:'from-gray-900 to-black',    title:'Automate the work. Amplify the teaching.',         body:"Eliminate administrative burden so principals can lead, teachers can teach, and students can learn — without paperwork or manual processes slowing them down.", points:['Remove paper-based processes','Automate fee collection and reminders','Connect parents, teachers and students in real time','Give principals instant visibility'] },
              { icon:'🌟', label:'OUR VISION',  color:'from-indigo-700 to-indigo-900', title:'A world-class school in every community.',          body:"Every school — regardless of size, location, or budget — deserves to operate with the same efficiency as the world's best institutions.",                         points:['1 million students on MySchool by 2030','Available in 25+ countries','10 language support','AI-powered personalized learning'] },
              { icon:'🚀', label:'OUR GOAL',    color:'from-emerald-600 to-teal-700',  title:'Measurable impact on education outcomes.',         body:"Every feature is measured against one standard: does it improve educational outcomes? We track attendance, fee collection, dropout rates, and performance.",      points:['Reduce dropout rates by 30%','Fee collection above 95%','Cut admin work by 80%','Increase parent engagement 5x'] },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className={`bg-gradient-to-br ${c.color} p-6 text-white`}>
                  <div className="text-4xl mb-3">{c.icon}</div>
                  <span className="text-[10px] font-black tracking-widest opacity-70">{c.label}</span>
                  <h3 className="text-xl font-black mt-2 leading-snug">{c.title}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{c.body}</p>
                  <ul className="space-y-2">
                    {c.points.map(p => (
                      <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">Our Journey</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">From one school in Lahore to hundreds across the world.</p>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 sm:-translate-x-px" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`relative flex gap-6 sm:gap-0 ${i%2===0?'sm:flex-row':'sm:flex-row-reverse'}`}>
                  <div className="sm:w-1/2 sm:px-8 pl-12 sm:pl-0">
                    <div className={`bg-gray-50 rounded-2xl p-5 border border-gray-100 ${i%2!==0?'sm:text-right':''}`}>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full mb-2">{m.year}</span>
                      <h3 className="text-base font-black text-gray-900 mb-1">{m.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-3 sm:left-1/2 sm:-translate-x-1/2 top-4 w-4 h-4 bg-gray-950 rounded-full border-4 border-white shadow" />
                  <div className="hidden sm:block sm:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">What We Believe</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Not on a poster — in every line of code, every support call, every pricing decision.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-base font-black text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-4">The Team Behind MySchool</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Former teachers, engineers, and education policy experts — united by one goal.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map(m => (
              <div key={m.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{m.emoji}</div>
                <h3 className="text-base font-black text-gray-900">{m.name}</h3>
                <p className="text-blue-600 text-sm font-semibold mb-3">{m.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{m.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.tags.map(t => <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Role ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6" style={{background:'linear-gradient(135deg,#0C1E35,#0F3D6E)'}}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-4">Our Role in Education</h2>
          <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">We don&apos;t teach students. We give schools the infrastructure to teach better.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map(r => (
              <div key={r.title} className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="text-4xl mb-4">{r.icon}</div>
                <h3 className="text-base font-black text-white mb-2">{r.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Ready to transform your school?</h2>
          <p className="text-gray-500 text-lg mb-8">Join 500+ schools on MySchool. Setup takes less than 10 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-gray-950 text-white font-bold rounded-2xl hover:bg-gray-800 text-lg">Start Free Trial</Link>
            <Link href="/" className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 text-lg">← Back to Home</Link>
          </div>
          <p className="text-gray-400 text-sm mt-5">No credit card required · Free 30-day trial · Cancel anytime</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-950 rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
            <span className="font-black">MySchool</span>
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} MySchool. Built with ❤️ for educators worldwide.</p>
          <div className="flex gap-5 text-sm text-gray-400">
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/signup" className="hover:text-white">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
