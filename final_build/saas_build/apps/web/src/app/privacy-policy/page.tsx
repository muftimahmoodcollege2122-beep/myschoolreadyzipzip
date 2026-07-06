'use client';
/**
 * Privacy Policy page — legal privacy policy for MySchool platform.
 * Covers: data collection, security, student data protection, PDPA compliance,
 * retention, user rights, and contact information.
 * Static page, no authentication required.
 */
import React from 'react';
import Link from 'next/link';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: [
      'We collect information you provide directly to us when you register your school, use our services, or contact us for support.',
      '**School & Institutional Data:** School name, address, contact details, and administrative information provided during registration.',
      '**User Account Data:** Names, email addresses, roles (admin, teacher, student, parent), and login credentials for all users added to your school account.',
      '**Student & Academic Records:** Attendance records, grades, exam results, fee payment history, and other academic data entered by your institution.',
      '**Usage Data:** Log data, IP addresses, browser type, pages visited, and actions taken within the platform — used solely for security and service improvement.',
      '**Payment Information:** Fee transaction data processed through JazzCash, EasyPaisa, or bank transfer. We do not store full card numbers or payment credentials.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'We use the information we collect to:',
      '• Provide, maintain, and improve the MySchool platform\n• Process fee payments and generate financial reports\n• Send notifications, alerts, and communications to parents, teachers, and students\n• Provide customer support and respond to inquiries\n• Monitor platform security and prevent fraudulent activity\n• Comply with legal obligations and regulatory requirements\n• Generate anonymized, aggregated analytics to improve our services',
      'We do not sell, rent, or trade your personal data to third parties for marketing purposes.',
    ],
  },
  {
    title: '3. Data Storage & Security',
    content: [
      'Your data is stored on secure servers in Pakistan and protected by:',
      '• AES-256 encryption for data at rest and in transit (TLS 1.3)\n• Role-based access control (RBAC) ensuring users only access data relevant to their role\n• Automated daily backups with 30-day retention\n• Multi-tenant data isolation — your school\'s data is never accessible to other schools\n• Audit logs tracking all administrative actions\n• Regular security assessments and penetration testing',
      'We maintain technical and organizational measures aligned with ISO 27001 and SOC 2 Type II standards.',
    ],
  },
  {
    title: '4. Data Sharing',
    content: [
      'We share your data only in the following limited circumstances:',
      '**Service Providers:** Third-party vendors who assist in operating our platform (hosting, email delivery, SMS gateways) under strict data processing agreements.',
      '**Payment Processors:** JazzCash, EasyPaisa, and banking partners for processing fee payments — they receive only the minimum data required for transaction processing.',
      '**Legal Requirements:** When required by Pakistani law, court order, or government authority with valid legal process.',
      '**Business Transfer:** In the event of a merger, acquisition, or sale of assets, user data may be transferred with advance notice provided to affected institutions.',
      'We never share student personal data with advertisers or for commercial marketing.',
    ],
  },
  {
    title: '5. Student Data Protection',
    content: [
      'We treat student data with the highest level of protection:',
      '• Student data is owned entirely by the institution — not by MySchool Technologies\n• We act as a data processor; your school is the data controller\n• Student personally identifiable information (PII) is never used for advertising\n• Schools can export all student data at any time in standard formats\n• Upon subscription termination, institutions can request complete data deletion within 30 days\n• We comply with Pakistan\'s Personal Data Protection Act (PDPA) framework',
      'Parents and guardians may request access to, correction of, or deletion of their child\'s data by contacting their school administrator.',
    ],
  },
  {
    title: '6. Cookies & Tracking',
    content: [
      'We use only essential cookies required for platform functionality:',
      '**Session Cookies:** Maintain your login state and security tokens.\n**Preference Cookies:** Remember your language and display settings.\n**Security Cookies:** CSRF protection and fraud prevention.',
      'We do not use third-party advertising cookies or cross-site tracking technologies.',
    ],
  },
  {
    title: '7. Data Retention',
    content: [
      '• Active accounts: Data retained for the duration of the subscription\n• Cancelled accounts: Data retained for 90 days post-cancellation to allow data export\n• After 90 days: All personal data is permanently deleted\n• Audit logs: Retained for 3 years for regulatory compliance\n• Financial records: Retained for 7 years per Pakistani tax regulations',
    ],
  },
  {
    title: '8. Your Rights',
    content: [
      'As an institution or individual user, you have the right to:',
      '• **Access:** Request a complete export of your school\'s data at any time\n• **Correction:** Update or correct inaccurate personal information\n• **Deletion:** Request deletion of personal data (subject to legal retention requirements)\n• **Portability:** Export your data in standard formats (CSV, JSON)\n• **Restriction:** Restrict certain types of data processing',
      'To exercise these rights, contact your school administrator or email privacy@myschool.pk.',
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      'We may update this Privacy Policy periodically. We will notify registered institutions via email and in-platform notifications at least 30 days before material changes take effect. Continued use of the platform after the effective date constitutes acceptance of the updated policy.',
    ],
  },
  {
    title: '10. Contact Us',
    content: [
      '**MySchool Technologies**\nEmail: privacy@myschool.pk\nSupport: support@myschool.pk\nAddress: D.I. Khan, KPK, Pakistan\n\nData Protection Officer: dpo@myschool.pk\nResponse time: Within 5 business days',
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <span className="font-black text-lg text-gray-900">MySchool</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-16" style={{ background: 'linear-gradient(150deg, #0C1E35 0%, #0F2D50 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/25 rounded-full mb-5">
            <span className="text-blue-300 text-xs font-semibold">Legal</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Last updated: June 1, 2026 &nbsp;·&nbsp; Effective: June 1, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
          <p className="text-blue-900 text-sm leading-relaxed">
            MySchool Technologies ("MySchool", "we", "us") is committed to protecting the privacy and security of your institutional and personal data. This Privacy Policy explains how we collect, use, store, and protect information when you use the MySchool school management platform.
          </p>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title} className="border-b border-gray-100 pb-10 last:border-0">
              <h2 className="text-xl font-black text-gray-900 mb-4">{section.title}</h2>
              <div className="space-y-3">
                {section.content.map((para, i) => (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    <RenderContent text={para} />
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-100 py-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm mb-4">Have questions about our privacy practices?</p>
          <a href="mailto:privacy@myschool.pk" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Contact Privacy Team
          </a>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
            <a href="mailto:support@myschool.pk" className="hover:text-gray-700 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
