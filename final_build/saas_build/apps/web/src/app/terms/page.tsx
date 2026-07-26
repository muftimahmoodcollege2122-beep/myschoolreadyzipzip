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

function AccordionSection({ section, isOpen, onToggle, id }: { section: typeof SECTIONS[number]; isOpen: boolean; onToggle: () => void; id: string }) {
  return (
    <div id={id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white scroll-mt-32">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left hover:bg-gray-50/80 transition-colors"
      >
        <h2 className="text-base sm:text-lg font-bold text-gray-900">{section.title}</h2>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-600' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="grid transition-all duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 space-y-3 border-t border-gray-50">
            {section.content.map((para, i) => (
              <p key={i} className="text-gray-600 text-sm leading-relaxed whitespace-pre-line pt-3 first:pt-4">
                <RenderContent text={para} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [navOpen, setNavOpen] = useState(false);

  const toggle = (i: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(SECTIONS.map((_, i) => i)));
  const collapseAll = () => setOpenSections(new Set());

  const jumpTo = (i: number) => {
    setOpenSections(prev => new Set(prev).add(i));
    setNavOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
            <span className="font-black text-lg text-gray-900">MySchool</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-16" style={{ background: 'linear-gradient(150deg, #14161C 0%, #22252E 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 border border-amber-400/25 rounded-full mb-5">
            <span className="text-amber-300 text-xs font-semibold">Legal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-white/50 text-sm">Last updated: June 1, 2026 &nbsp;·&nbsp; Effective: June 1, 2026</p>
        </div>
      </div>

      {/* Dropdown: Table of Contents */}
      <div className="bg-gray-50 border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => setNavOpen(o => !o)}
            className="w-full flex items-center justify-between gap-3 py-4"
          >
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Jump to Section</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${navOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: navOpen ? '1fr' : '0fr' }}>
            <div className="overflow-hidden">
              <div className="pb-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.title}
                    onClick={() => jumpTo(i)}
                    className="text-left text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm transition-all font-medium"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8">
          <p className="text-amber-900 text-sm leading-relaxed">
            <strong>Please read these Terms carefully.</strong> These Terms of Service constitute a legally binding agreement between your educational institution and MySchool Technologies governing your use of the MySchool school management platform. By using our Service, you agree to these Terms.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400 font-medium">{openSections.size} of {SECTIONS.length} sections expanded</p>
          <div className="flex items-center gap-3">
            <button onClick={expandAll} className="text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">Expand all</button>
            <span className="text-gray-200">|</span>
            <button onClick={collapseAll} className="text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">Collapse all</button>
          </div>
        </div>

        <div className="space-y-3">
          {SECTIONS.map((section, i) => (
            <AccordionSection
              key={section.title}
              id={`section-${i}`}
              section={section}
              isOpen={openSections.has(i)}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-100 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 text-sm mb-4">Have questions about our Terms of Service?</p>
          <a href="mailto:legal@myschool.pk" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-950 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
            Contact Legal Team
          </a>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <Link href="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
            <a href="mailto:support@myschool.pk" className="hover:text-gray-700 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
