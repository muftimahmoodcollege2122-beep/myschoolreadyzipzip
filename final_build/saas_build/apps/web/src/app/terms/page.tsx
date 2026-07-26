'use client';
/**
 * Terms of Service page — legal terms for using MySchool.
 * Covers: service description, subscription/payment terms, acceptable use,
 * data ownership, liability, governing law (Pakistan).
 * Static page, no authentication required.
 */
import React, { useState } from 'react';
import Link from 'next/link';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By registering an account, accessing, or using the MySchool platform ("Service"), you ("Institution", "School", "you") agree to be bound by these Terms of Service ("Terms"). If you are entering into these Terms on behalf of an educational institution, you represent that you have the authority to bind that institution.',
      'If you do not agree to these Terms, do not use the Service. These Terms apply to all users including school administrators, teachers, students, and parents accessing the platform.',
    ],
  },
  {
    title: '2. Description of Service',
    content: [
      'MySchool Technologies provides a cloud-based school management platform that includes:',
      '• School website builder with custom domain support\n• Student information system (SIS)\n• Attendance, grading, and examination management\n• Fee collection and financial reporting\n• Teacher, student, and parent portals\n• Learning management system (LMS)\n• HR, payroll, and staff management\n• Communication and notification tools\n• AI-powered automation features\n• Analytics and reporting dashboards',
      'We reserve the right to modify, suspend, or discontinue any feature of the Service with reasonable notice.',
    ],
  },
  {
    title: '3. Account Registration & Responsibilities',
    content: [
      'To use the Service, you must register and provide accurate, complete information about your institution. You are responsible for:',
      '• Maintaining the confidentiality of all account credentials\n• All activities that occur under your account\n• Ensuring all users (staff, teachers, students, parents) comply with these Terms\n• Promptly notifying us of any unauthorized access or security breach at support@myschool.pk\n• Keeping your institution\'s contact and billing information current',
      'You must be at least 18 years old and authorized to enter into legally binding agreements on behalf of your institution.',
    ],
  },
  {
    title: '4. Subscription Plans & Payment',
    content: [
      '**Subscription Plans:** MySchool offers Starter, Professional, and Enterprise plans with different feature sets and student limits as described on our pricing page.',
      '**Free Trial:** All plans include a 30-day free trial with full feature access. No credit card is required to start a trial.',
      '**Billing:** Subscriptions are billed monthly or annually in Pakistani Rupees (PKR). Annual plans are billed upfront at a discounted rate.',
      '**Payment Methods:** We accept JazzCash, EasyPaisa, bank transfer, and Stripe for international payments.',
      '**Late Payment:** Accounts with overdue payments will receive a 7-day grace period before service suspension. Data is retained for 90 days after suspension before permanent deletion.',
      '**Price Changes:** We will provide 30 days\' notice before any price changes. Continued use after the notice period constitutes acceptance.',
    ],
  },
  {
    title: '5. Cancellation & Refunds',
    content: [
      '**Cancellation:** You may cancel your subscription at any time through the admin dashboard or by contacting support@myschool.pk. Cancellation takes effect at the end of the current billing period.',
      '**Refunds:** Monthly subscriptions are non-refundable. Annual subscriptions may receive a pro-rated refund for unused months if cancelled within 30 days of the annual renewal date.',
      '**Trial Cancellation:** You may cancel during the free trial period at any time with no charges.',
      '**Data After Cancellation:** Your data remains accessible for 90 days after cancellation to allow export. After 90 days, all data is permanently deleted.',
    ],
  },
  {
    title: '6. Acceptable Use Policy',
    content: [
      'You agree not to use the Service to:',
      '• Upload, store, or transmit content that is unlawful, harmful, or violates any third-party rights\n• Harass, abuse, or harm any person, particularly minors\n• Transmit spam, viruses, malware, or any malicious code\n• Attempt to gain unauthorized access to any part of the platform\n• Scrape, data-mine, or reverse-engineer the Service\n• Use the Service for any purpose other than legitimate educational administration\n• Violate any applicable Pakistani law or regulation\n• Impersonate any person or institution',
      'Violation of this Acceptable Use Policy may result in immediate account suspension without refund.',
    ],
  },
  {
    title: '7. Data Ownership & License',
    content: [
      '**Your Data:** All institutional data, student records, and content you upload to the platform ("Your Data") remains your property. MySchool claims no ownership over Your Data.',
      '**License to Us:** You grant MySchool a limited, non-exclusive license to process, store, and display Your Data solely to provide the Service as described in these Terms and our Privacy Policy.',
      '**Data Export:** You may export Your Data at any time through the admin dashboard. We provide export in standard formats (CSV, JSON, PDF).',
      '**Aggregated Data:** We may use anonymized, aggregated, non-identifiable data derived from platform usage to improve our services and publish industry insights.',
    ],
  },
  {
    title: '8. Intellectual Property',
    content: [
      'The MySchool platform, including its software, design, logos, trademarks, and documentation, is owned by MySchool Technologies and protected by Pakistani and international intellectual property laws.',
      'You may not copy, modify, distribute, sell, or lease any part of the platform without our written permission. You may not reverse-engineer or extract source code from the Service.',
      'Your institution\'s name, logo, and branding uploaded to the platform remain your intellectual property.',
    ],
  },
  {
    title: '9. Privacy & Data Protection',
    content: [
      'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the data practices described in our Privacy Policy.',
      'As a data controller for your students and staff, you are responsible for obtaining necessary consents and complying with applicable data protection laws, including Pakistan\'s Personal Data Protection Act (PDPA).',
    ],
  },
  {
    title: '10. Service Availability & Uptime',
    content: [
      'We strive to maintain 99.9% platform uptime as specified in our Service Level Agreement (SLA). Planned maintenance is typically scheduled during off-peak hours (2:00 AM – 5:00 AM PKT) with advance notice.',
      'We are not responsible for downtime caused by: internet outages, third-party service failures, acts of God, or events outside our reasonable control.',
      'In the event of extended unplanned downtime exceeding 24 hours, affected institutions may be eligible for service credits as per our SLA.',
    ],
  },
  {
    title: '11. Limitation of Liability',
    content: [
      'To the maximum extent permitted by Pakistani law, MySchool Technologies shall not be liable for:',
      '• Indirect, incidental, special, or consequential damages\n• Loss of profits, revenue, data, or business opportunities\n• Damages resulting from unauthorized access to your account\n• Any errors or omissions in platform content\n• Service interruptions or data loss beyond our reasonable control',
      'Our total aggregate liability to you shall not exceed the amount you paid to us in the 12 months preceding the claim.',
    ],
  },
  {
    title: '12. Indemnification',
    content: [
      'You agree to indemnify, defend, and hold harmless MySchool Technologies, its officers, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:',
      '• Your use or misuse of the Service\n• Your violation of these Terms\n• Your violation of any third-party rights\n• Any data you upload to the platform\n• Your institution\'s failure to comply with applicable laws',
    ],
  },
  {
    title: '13. Termination',
    content: [
      'Either party may terminate the subscription at any time. We may suspend or terminate your access immediately if:',
      '• You violate these Terms or our Acceptable Use Policy\n• Your payment is overdue beyond the grace period\n• We reasonably believe your use poses a security risk\n• Required by law or court order',
      'Upon termination, your right to use the Service ceases immediately. Data export must be completed within the 90-day post-cancellation window.',
    ],
  },
  {
    title: '14. Governing Law & Disputes',
    content: [
      'These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation.',
      'If negotiation fails, disputes shall be submitted to binding arbitration in D.I. Khan, KPK, Pakistan under the Arbitration Act 1940. The language of arbitration shall be English or Urdu.',
      'Nothing in this clause prevents either party from seeking emergency injunctive relief from a court of competent jurisdiction.',
    ],
  },
  {
    title: '15. Changes to Terms',
    content: [
      'We may update these Terms periodically. We will notify you via email and in-platform notification at least 30 days before material changes take effect.',
      'Your continued use of the Service after the effective date of changes constitutes your acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the Service and cancel your subscription.',
    ],
  },
  {
    title: '16. Contact Information',
    content: [
      '**MySchool Technologies**\nEmail: legal@myschool.pk\nSupport: support@myschool.pk\nAddress: D.I. Khan, KPK, Pakistan\n\nFor billing inquiries: billing@myschool.pk\nResponse time: Within 3 business days',
    ],
  },
];

const SECTION_ICONS = [
  '📖', '📄', '👤', '💳', '🔄', '✅', '🗄️', '🏛️',
  '🔒', '⏱️', '🛡️', '📋', '⛔', '⚖️', '🔔', '✉️',
];

function RenderContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i} className="text-gray-900 font-semibold">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

function firstLine(section: typeof SECTIONS[number]) {
  const raw = section.content[0].replace(/\*\*/g, '');
  return raw.length > 140 ? raw.slice(0, 140) + '…' : raw;
}

function SectionCard({ section, index, isOpen, onToggle, id }: { section: typeof SECTIONS[number]; index: number; isOpen: boolean; onToggle: () => void; id: string }) {
  return (
    <div id={id} className="scroll-mt-32">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <button onClick={onToggle} className="w-full flex items-start gap-4 px-5 sm:px-7 py-5 sm:py-6 text-left hover:bg-gray-50/60 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">
            {SECTION_ICONS[index]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>{section.title}</h2>
            {!isOpen && <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{firstLine(section)}</p>}
          </div>
          <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
          <div className="overflow-hidden">
            <div className="px-5 sm:px-7 pb-6 pl-[4.75rem] sm:pl-[5.25rem] space-y-3 -mt-1">
              {section.content.map((para, i) => (
                <p key={i} className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  <RenderContent text={para} />
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* decorative connector */}
      <div className="flex justify-center py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
      </div>
    </div>
  );
}

export default function TermsPage() {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [activeSection, setActiveSection] = useState(0);

  const toggle = (i: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const jumpTo = (i: number) => {
    setActiveSection(i);
    setOpenSections(prev => new Set(prev).add(i));
    requestAnimationFrame(() => {
      document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F1' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
            <span className="font-black text-lg text-gray-900">MySchool</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span>›</span>
          <span>Legal</span>
          <span>›</span>
          <span className="text-gray-600">Terms of Service</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Legal</span>
              <span className="w-8 h-px bg-amber-400" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.05]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
              Terms of Service
            </h1>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg mb-7">
              These Terms of Service govern your access to and use of the MySchool platform and all related services.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Last Updated</p>
                  <p className="text-sm text-gray-700 font-semibold">June 1, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Version</p>
                  <p className="text-sm text-gray-700 font-semibold">2.4</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Reading Time</p>
                  <p className="text-sm text-gray-700 font-semibold">12 min</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1741636371995-875bf17ca657?fm=jpg&q=70&w=900&auto=format&fit=crop"
              alt="MySchool — institutional building"
              className="w-full h-56 sm:h-72 object-cover rounded-3xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <p className="text-amber-700 text-xs font-bold uppercase tracking-widest mb-3">On This Page</p>
                <div className="space-y-1 max-h-[50vh] lg:max-h-none overflow-y-auto pr-1">
                  {SECTIONS.map((s, i) => (
                    <button
                      key={s.title}
                      onClick={() => jumpTo(i)}
                      className={`w-full flex items-center gap-2.5 text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                        activeSection === i ? 'bg-gray-950 text-white font-semibold' : 'text-gray-600 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      <span className="text-xs opacity-70 flex-shrink-0">{SECTION_ICONS[i]}</span>
                      <span className="truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg mx-auto mb-3">🎧</div>
                <p className="font-bold text-gray-900 text-sm mb-1">Need legal assistance?</p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">Our legal team is here to help with any questions about these Terms.</p>
                <a href="mailto:legal@myschool.pk" className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2.5 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors">
                  Contact Legal Team →
                </a>
              </div>
            </div>
          </div>

          {/* Content cards */}
          <div className="lg:col-span-3">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
              <p className="text-amber-900 text-sm leading-relaxed">
                <strong>Please read these Terms carefully.</strong> These Terms of Service constitute a legally binding agreement between your educational institution and MySchool Technologies governing your use of the MySchool school management platform. By using our Service, you agree to these Terms.
              </p>
            </div>

            {SECTIONS.map((section, i) => (
              <SectionCard
                key={section.title}
                id={`section-${i}`}
                section={section}
                index={i}
                isOpen={openSections.has(i)}
                onToggle={() => toggle(i)}
              />
            ))}

            {/* Trust bar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-950 flex items-center justify-center text-2xl flex-shrink-0">🛡️</div>
                  <div>
                    <p className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>Your trust and data security</p>
                    <p className="font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>are our top priorities.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {[['🔐', 'Industry-standard', 'Security'], ['🔒', 'Encrypted', 'Data'], ['☁️', 'Regular', 'Backups'], ['⏱️', '99.9%', 'Uptime']].map(([icon, l1, l2]) => (
                    <div key={l1 + l2} className="text-center">
                      <div className="text-lg mb-1">{icon}</div>
                      <p className="text-xs font-bold text-gray-700 leading-tight">{l1}</p>
                      <p className="text-xs text-gray-400 leading-tight">{l2}</p>
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="text-gray-400 text-xs mb-1">Learn more about our security practices.</p>
                  <Link href="/security-center" className="text-amber-700 font-bold hover:underline">View Security Overview →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 pt-14 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
                <span className="font-black text-lg text-white">MySchool</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">Empowering schools and educational institutions with intelligent technology.</p>
            </div>
            {[
              { title: 'Product', links: ['Features|/features', 'Pricing|/pricing', 'Security|/security-center'] },
              { title: 'Company', links: ['About|/about', 'Contact|mailto:hello@myschool.pk'] },
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
