'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';

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

function TiltShell({ highlight, className, children }: { highlight: boolean; className: string; children: React.ReactNode }) {
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
    const rotateX = (0.5 - y) * 14;
    const rotateY = (x - 0.5) * 14;
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
      className={`relative will-change-transform cursor-pointer ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 rounded-3xl"
        style={{ opacity: spot.opacity, background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, ${highlight ? 'rgba(255,255,255,0.5)' : 'rgba(180,131,46,0.14)'}, transparent 70%)` }}
      />
      {children}
    </div>
  );
}

const PLANS = [
  {
    name: 'Starter',
    price: { monthly: 5000, annual: 4000 },
    students: '500',
    desc: 'Perfect for small schools and academies just getting started with digital management.',
    color: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-700',
    btn: 'bg-gray-900 hover:bg-gray-800 text-white',
    highlight: false,
    features: [
      { text: 'Up to 500 students', included: true },
      { text: 'Up to 30 staff members', included: true },
      { text: 'School website with custom domain', included: true },
      { text: 'Admin dashboard', included: true },
      { text: 'Student management', included: true },
      { text: 'Attendance tracking', included: true },
      { text: 'Fee management', included: true },
      { text: 'JazzCash & EasyPaisa payments', included: true },
      { text: 'Exam & grades management', included: true },
      { text: 'Parent portal', included: true },
      { text: 'Student portal', included: true },
      { text: 'WhatsApp notifications (500/mo)', included: true },
      { text: 'SMS notifications', included: true },
      { text: 'Basic reports', included: true },
      { text: '5 GB storage', included: true },
      { text: 'Email support', included: true },
      { text: 'Teacher portal', included: false },
      { text: 'LMS & online courses', included: false },
      { text: 'AI analytics & predictions', included: false },
      { text: 'Multi-campus support', included: false },
      { text: 'API access', included: false },
      { text: 'Custom branding (white-label)', included: false },
    ],
  },
  {
    name: 'Professional',
    price: { monthly: 12000, annual: 9600 },
    students: '2,000',
    desc: 'The most popular plan for growing schools that want powerful features and full automation.',
    color: 'border-amber-500',
    badge: 'bg-gray-950 text-white',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    highlight: true,
    features: [
      { text: 'Up to 2,000 students', included: true },
      { text: 'Up to 100 staff members', included: true },
      { text: 'School website with custom domain', included: true },
      { text: 'Admin dashboard', included: true },
      { text: 'Student management', included: true },
      { text: 'Attendance tracking', included: true },
      { text: 'Fee management', included: true },
      { text: 'JazzCash & EasyPaisa payments', included: true },
      { text: 'Exam & grades management', included: true },
      { text: 'Parent portal', included: true },
      { text: 'Student portal', included: true },
      { text: 'WhatsApp notifications (5,000/mo)', included: true },
      { text: 'SMS notifications', included: true },
      { text: 'Advanced reports & analytics', included: true },
      { text: '25 GB storage', included: true },
      { text: 'Priority support', included: true },
      { text: 'Teacher portal', included: true },
      { text: 'LMS & online courses', included: true },
      { text: 'AI analytics & predictions', included: true },
      { text: 'Multi-campus support', included: false },
      { text: 'API access', included: false },
      { text: 'Custom branding (white-label)', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: 20000, annual: 16000 },
    students: 'Unlimited',
    desc: 'For large schools, college systems, and education groups that need unlimited scale and custom solutions.',
    color: 'border-indigo-700',
    badge: 'bg-purple-600 text-white',
    btn: 'bg-indigo-800 hover:bg-indigo-900 text-white',
    highlight: false,
    features: [
      { text: 'Unlimited students', included: true },
      { text: 'Unlimited staff', included: true },
      { text: 'School website with custom domain', included: true },
      { text: 'Admin dashboard', included: true },
      { text: 'Student management', included: true },
      { text: 'Attendance tracking', included: true },
      { text: 'Fee management', included: true },
      { text: 'JazzCash & EasyPaisa payments', included: true },
      { text: 'Exam & grades management', included: true },
      { text: 'Parent portal', included: true },
      { text: 'Student portal', included: true },
      { text: 'Unlimited WhatsApp notifications', included: true },
      { text: 'SMS notifications', included: true },
      { text: 'Full analytics suite', included: true },
      { text: 'Unlimited storage', included: true },
      { text: 'Dedicated account manager + SLA', included: true },
      { text: 'Teacher portal', included: true },
      { text: 'LMS & online courses', included: true },
      { text: 'AI analytics & predictions', included: true },
      { text: 'Multi-campus support', included: true },
      { text: 'API access', included: true },
      { text: 'Custom branding (white-label)', included: true },
    ],
  },
];

const FAQS = [
  {
    q: 'How does the 30-day free trial work?',
    a: 'You get full access to the Professional plan for 30 days — no credit card required. At the end of the trial, you choose a plan and pay. If you don\'t pay, your account is paused (not deleted) for 90 days so you can export your data.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept JazzCash, EasyPaisa, bank transfer to HBL/UBL/MCB, and Stripe for international payments. You can pay monthly or annually. Annual payment gets 20% discount.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes, anytime. Upgrades take effect immediately. Downgrades take effect at the start of the next billing cycle. If you downgrade and exceed the new plan\'s student limit, we\'ll notify you to remove students or upgrade again.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your data remains accessible for 90 days after cancellation so you can export everything. After 90 days, all data is permanently deleted from our servers. You can export students, fees, results, and all records as Excel/CSV at any time.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No setup fee. No hidden charges. The monthly price is all you pay. We help you set up your school on MySchool for free as part of onboarding.',
  },
  {
    q: 'Do you offer discounts for NGOs or government schools?',
    a: 'Yes. Government schools, non-profit organizations, and madrassas get a 30% discount on all plans. Contact us at sales@myschool.pk with your registration documents.',
  },
  {
    q: 'What is included in the SLA for Enterprise?',
    a: 'Enterprise customers get a 99.9% uptime guarantee, 4-hour response time for critical issues, a dedicated account manager, monthly check-in calls, and priority feature requests.',
  },
  {
    q: 'Can multiple campuses use one account?',
    a: 'Multi-campus support is available on the Enterprise plan. Each campus gets its own data, staff, and students — all managed from one central admin account.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-950 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <span className="font-black text-lg text-gray-900">MySchool</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="text-sm font-semibold text-blue-600">Pricing</Link>
            <Link href="/security-center" className="text-sm font-medium text-gray-600 hover:text-gray-900">Security</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 bg-gray-950 text-white rounded-lg hover:bg-gray-800">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16" style={{ background: 'linear-gradient(150deg, #0C1E35 0%, #0F2D50 60%, #1a3a6b 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/25 rounded-full mb-6">
            <span className="text-blue-300 text-xs font-semibold">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Honest pricing for<br /><span className="text-blue-400">Pakistani schools</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            No hidden fees. No per-user charges. One flat price covers your entire school.
            Start free for 30 days — no credit card needed.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white/10 rounded-xl p-1.5">
            <button onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${!annual ? 'bg-white text-gray-900' : 'text-white/60'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${annual ? 'bg-white text-gray-900' : 'text-white/60'}`}>
              Annual
              <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">Save 20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 pb-10 sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {PLANS.map(plan => (
            <TiltShell
              key={plan.name}
              highlight={plan.highlight}
              className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden flex flex-col ${plan.highlight ? 'shadow-2xl shadow-amber-500/10 -mt-4' : ''} ${plan.color}`}
            >
              {plan.highlight && (
                <div className="bg-amber-600 text-white text-center py-2 text-xs font-black tracking-wider uppercase">
                  ⭐ Most Popular
                </div>
              )}
              <div className="p-6 sm:p-8 flex-1">
                {/* Plan name */}
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-2xl font-black text-gray-900">{plan.name}</h2>
                </div>
                <p className="text-gray-500 text-sm mb-6">{plan.desc}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-sm font-bold text-gray-500">PKR</span>
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">
                      {(annual ? plan.price.annual : plan.price.monthly).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm mb-1">/month</span>
                  </div>
                  {annual && (
                    <p className="text-green-600 text-xs font-bold mt-1">
                      PKR {((plan.price.monthly - plan.price.annual) * 12).toLocaleString()} saved annually
                    </p>
                  )}
                  {annual && (
                    <p className="text-gray-400 text-xs mt-0.5">
                      Billed PKR {(plan.price.annual * 12).toLocaleString()}/year
                    </p>
                  )}
                </div>

                {/* Students */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                  <span className="text-2xl">👨‍🎓</span>
                  <div>
                    <p className="font-black text-gray-900">{plan.students} Students</p>
                    <p className="text-xs text-gray-500">Included in this plan</p>
                  </div>
                </div>

                {/* CTA */}
                <MagneticButton href="/signup" className={`w-full py-3.5 rounded-xl text-sm font-black mb-8 ${plan.btn}`}>
                  Start 30-Day Free Trial
                </MagneticButton>

                {/* Features */}
                <div className="space-y-2.5">
                  {plan.features.map((f, i) => (
                    <div key={i} className={`flex items-start gap-2.5 ${!f.included ? 'opacity-40' : ''}`}>
                      <span className={`flex-shrink-0 mt-0.5 text-sm ${f.included ? 'text-green-500' : 'text-gray-300'}`}>
                        {f.included ? '✓' : '✕'}
                      </span>
                      <span className={`text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TiltShell>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-gray-400 text-sm mt-8">
          All prices in Pakistani Rupees (PKR) · Annual billing saves 20% · GST applicable as per FBR regulations
        </p>
      </div>

      {/* How pricing works */}
      <div className="bg-gray-50 border-y border-gray-100 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">How Pricing Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to know about how we charge — no surprises.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: '🎯',
                title: 'Flat Monthly Fee',
                desc: 'One price covers your entire school. No per-student charges, no per-teacher charges, no per-SMS charges (within limits). Add 500 students or 5 — same price.',
              },
              {
                icon: '📅',
                title: 'Monthly or Annual Billing',
                desc: 'Pay month-to-month with no commitment, or pay annually upfront and save 20%. Annual plans are billed once per year via bank transfer or JazzCash.',
              },
              {
                icon: '🆓',
                title: '30-Day Free Trial',
                desc: 'Every new school gets 30 days of the Professional plan completely free. No credit card required. Full access to all features so you can truly evaluate the system.',
              },
              {
                icon: '⬆️',
                title: 'Upgrade Anytime',
                desc: 'Need more students or features? Upgrade your plan anytime. The new plan activates immediately and you\'re billed the prorated difference for the current month.',
              },
              {
                icon: '❌',
                title: 'Cancel Anytime',
                desc: 'No lock-in contracts. Cancel anytime from your admin dashboard. Monthly subscribers keep access until the end of the current billing period.',
              },
              {
                icon: '📦',
                title: 'Data Always Yours',
                desc: 'Export all your data anytime — student records, fee history, results, everything. If you cancel, your data stays accessible for 90 days before deletion.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Compare Plans</h2>
          <p className="text-gray-500">Full side-by-side comparison of what each plan includes</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="hidden sm:hidden sm:grid grid-cols-4 border-b border-gray-100">
            <div className="p-5 text-sm font-black text-gray-500 uppercase">Feature</div>
            {PLANS.map(p => (
              <div key={p.name} className={`p-5 text-center ${p.highlight ? 'bg-blue-50' : ''}`}>
                <p className="font-black text-gray-900">{p.name}</p>
                <p className="text-blue-600 text-sm font-black mt-0.5">PKR {(annual ? p.price.annual : p.price.monthly).toLocaleString()}/mo</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {[
            { label: 'Students', values: ['500', '2,000', 'Unlimited'] },
            { label: 'Staff', values: ['30', '100', 'Unlimited'] },
            { label: 'Storage', values: ['5 GB', '25 GB', 'Unlimited'] },
            { label: 'School Website', values: [true, true, true] },
            { label: 'Custom Domain', values: [true, true, true] },
            { label: 'JazzCash & EasyPaisa', values: [true, true, true] },
            { label: 'Student & Parent Portal', values: [true, true, true] },
            { label: 'Attendance & Fees', values: [true, true, true] },
            { label: 'Exams & Grades', values: [true, true, true] },
            { label: 'WhatsApp Notifications', values: ['500/mo', '5,000/mo', 'Unlimited'] },
            { label: 'Teacher Portal', values: [false, true, true] },
            { label: 'LMS & Courses', values: [false, true, true] },
            { label: 'AI Analytics', values: [false, true, true] },
            { label: 'Multi-Campus', values: [false, false, true] },
            { label: 'White-Label Branding', values: [false, false, true] },
            { label: 'API Access', values: [false, false, true] },
            { label: 'Support', values: ['Email', 'Priority', 'Dedicated Manager + SLA'] },
          ].map((row, i) => (
            <div key={row.label} className={`grid grid-cols-4 border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="p-4 text-sm font-semibold text-gray-700">{row.label}</div>
              {row.values.map((val, j) => (
                <div key={j} className={`p-4 text-center ${PLANS[j].highlight ? 'bg-blue-50/50' : ''}`}>
                  {typeof val === 'boolean' ? (
                    <span className={`text-base ${val ? 'text-green-500' : 'text-gray-200'}`}>{val ? '✓' : '✕'}</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">{val}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know before signing up</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <span className="font-bold text-gray-900 text-sm">{faq.q}</span>
                  <span className={`text-gray-400 text-lg transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl font-black mb-3">Start your free trial today</h2>
          <p className="text-blue-200 mb-3">30 days free · No credit card · Full Professional plan access</p>
          <p className="text-blue-300 text-sm mb-8">Questions? Call us: <a href="tel:+923001234567" className="underline">+92 300 123 4567</a> or email <a href="mailto:sales@myschool.pk" className="underline">sales@myschool.pk</a></p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3.5 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 transition-all">
              Start Free Trial
            </Link>
            <a href="mailto:sales@myschool.pk" className="px-8 py-3.5 bg-white/15 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all">
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-950 rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
            <span className="text-white font-black">MySchool</span>
          </Link>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/features" className="hover:text-white">Features</Link>
            <Link href="/security-center" className="hover:text-white">Security</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
