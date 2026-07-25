'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const NAV = [
  { label: 'Administration', id: 'administration' },
  { label: 'Academics', id: 'academics' },
  { label: 'Finance', id: 'finance' },
  { label: 'Communication', id: 'communication' },
  { label: 'HR & Staff', id: 'hr' },
  { label: 'Portals', id: 'portals' },
  { label: 'Website', id: 'website' },
  { label: 'Analytics & AI', id: 'analytics' },
  { label: 'Security', id: 'security' },
];

const MODULES = [
  {
    id: 'administration',
    icon: '🏫',
    title: 'School Administration',
    subtitle: 'Run your entire school from a single powerful dashboard',
    color: 'from-blue-600 to-blue-700',
    accent: 'bg-blue-50 text-blue-700 border-blue-200',
    image: '/images/features/1-school-dashboard.png',
    features: [
      { name: 'Student Management', desc: 'Complete student profiles with admission records, contact info, medical history, and documents. Full CRUD with soft-delete and GDPR-compliant erasure.', icon: '👨‍🎓' },
      { name: 'Class & Section Management', desc: 'Create unlimited classes and sections. Set capacity limits, assign class teachers, and manage student enrollments with one click.', icon: '🏛️' },
      { name: 'Admissions CRM', desc: 'Online application forms, document collection, interview scheduling, and admission decision workflow with status tracking for each applicant.', icon: '📋' },
      { name: 'Multi-Campus Support', desc: 'Manage multiple campuses under one account. Each campus has its own staff, students, and settings while sharing central administration.', icon: '🌐' },
      { name: 'Timetable Builder', desc: 'Drag-and-drop timetable creation with automatic conflict detection. Assign subjects, teachers, rooms, and periods in minutes.', icon: '🗓️' },
      { name: 'Audit Logs', desc: 'Every action — who did what, when, from where. Immutable audit trail for compliance, dispute resolution, and security monitoring.', icon: '🔍' },
      { name: 'Document Management', desc: 'Upload, organize, and share school documents. Student certificates, teacher contracts, and administrative records in one secure place.', icon: '📁' },
      { name: 'Academic Calendar', desc: 'School-wide calendar with holidays, exam periods, events, and custom schedules. Visible to all stakeholders with reminder notifications.', icon: '📅' },
    ],
  },
  {
    id: 'academics',
    icon: '📚',
    title: 'Academic Management',
    subtitle: 'Complete end-to-end academic lifecycle from enrollment to results',
    color: 'from-violet-600 to-violet-700',
    accent: 'bg-violet-50 text-violet-700 border-violet-200',
    image: '/images/features/6-lms-online-learning.png',
    features: [
      { name: 'Attendance Tracking', desc: 'Mark attendance period-by-period or daily. Real-time dashboards show present/absent/late counts. Automatic alerts to parents when a child is absent.', icon: '✅' },
      { name: 'Exam Management', desc: 'Schedule exams, assign hall tickets, and manage seating arrangements. Support for internal, board, and mock examinations.', icon: '📝' },
      { name: 'Grades & Results', desc: 'Subject-wise mark entry by teachers. Automatic GPA calculation. Grade boundaries configurable per school (A+≥90, A≥80, etc.).', icon: '🏆' },
      { name: 'Report Cards', desc: 'Auto-generated PDF report cards with school branding. Include attendance, grades, teacher remarks, and principal signatures.', icon: '📊' },
      { name: 'Subject Management', desc: 'Core and elective subjects with credit hours. Assign subjects to classes and teachers. Track syllabus completion percentage.', icon: '📖' },
      { name: 'Learning Management (LMS)', desc: 'Upload lesson notes, videos, and assignments. Students submit work online. Teachers grade digitally with feedback.', icon: '💻' },
      { name: 'Question Bank', desc: 'Build a reusable bank of questions organized by subject, topic, and difficulty. Auto-generate exam papers from the bank.', icon: '❓' },
      { name: 'Digital Certificates', desc: 'Generate and download student certificates for completion, achievement, and participation. Digital signatures and QR code verification.', icon: '🎓' },
    ],
  },
  {
    id: 'finance',
    icon: '💰',
    title: 'Finance & Fees',
    subtitle: 'Complete fee management with Pakistani payment gateway integration',
    color: 'from-green-600 to-green-700',
    accent: 'bg-green-50 text-green-700 border-green-200',
    image: '/images/features/5-fee-management.png',
    features: [
      { name: 'Fee Structure Builder', desc: 'Create custom fee structures per class, session, or category. Tuition, transport, hostel, activity — unlimited fee heads.', icon: '🏗️' },
      { name: 'Invoice Generation', desc: 'Auto-generate monthly/quarterly invoices for all students. Bulk generate for entire classes or sections in one click.', icon: '🧾' },
      { name: 'JazzCash Integration', desc: 'Accept fee payments via JazzCash mobile wallet. HMAC-SHA256 signed payment requests with instant verification.', icon: '📱' },
      { name: 'EasyPaisa Integration', desc: 'EasyPaisa OTP-based payments directly from parent phones. No app download required for parents.', icon: '💳' },
      { name: 'Bank Transfer Tracking', desc: 'Record manual bank transfers with reference numbers. Bank reconciliation reports with unmatched payment tracking.', icon: '🏦' },
      { name: 'Discount & Scholarships', desc: 'Sibling discounts, merit scholarships, need-based waivers. Apply percentage or fixed discounts to individual students or classes.', icon: '🎁' },
      { name: 'Fee Defaulters Report', desc: 'Real-time list of students with overdue fees. One-click WhatsApp/SMS reminders to parents. Aging report shows how long fees are overdue.', icon: '⚠️' },
      { name: 'Financial Reports', desc: 'Monthly collection summary, outstanding fees analysis, category-wise income breakdown. Export to Excel for accountants.', icon: '📈' },
    ],
  },
  {
    id: 'communication',
    icon: '📢',
    title: 'Communication',
    subtitle: 'Keep parents, teachers, and students informed in real time',
    color: 'from-orange-600 to-orange-700',
    accent: 'bg-orange-50 text-orange-700 border-orange-200',
    image: '/images/features/11-communication-hub.png',
    features: [
      { name: 'WhatsApp Notifications', desc: 'Automated WhatsApp messages for attendance, fee reminders, exam schedules, and results. Parents receive updates on their existing WhatsApp.', icon: '💬' },
      { name: 'SMS Gateway', desc: 'SMS alerts for critical announcements, emergencies, and exam results. Works on any mobile phone without internet.', icon: '📲' },
      { name: 'Email Notifications', desc: 'Professional email communications via AWS SES. Newsletters, fee receipts, report cards, and admission confirmations.', icon: '📧' },
      { name: 'In-App Notifications', desc: 'Real-time notifications inside student, teacher, and parent portals. Instant delivery via WebSocket with read receipts.', icon: '🔔' },
      { name: 'School Announcements', desc: 'Broadcast announcements to all parents, all teachers, all students, or specific classes. Pin important notices to the top.', icon: '📣' },
      { name: 'Notice Board', desc: 'Digital notice board visible on the school website and portals. Attach PDFs, images, and documents to notices.', icon: '📌' },
      { name: 'Event Management', desc: 'Create school events with date, venue, and description. Automatically notify relevant stakeholders with countdown reminders.', icon: '🎉' },
      { name: 'Parent-Teacher Communication', desc: 'Direct messaging between parents and teachers for student progress discussions, without sharing personal phone numbers.', icon: '🤝' },
    ],
  },
  {
    id: 'hr',
    icon: '👥',
    title: 'HR & Staff Management',
    subtitle: 'Full human resource management for teaching and non-teaching staff',
    color: 'from-rose-600 to-rose-700',
    accent: 'bg-rose-50 text-rose-700 border-rose-200',
    image: '/images/features/3-teacher-management.png',
    features: [
      { name: 'Staff Profiles', desc: 'Complete employee records: CNIC, qualifications, joining date, salary, documents. Separate profiles for teaching and non-teaching staff.', icon: '👤' },
      { name: 'Payroll Management', desc: 'Monthly salary calculation with allowances and deductions. Generate payslips and track salary disbursement. Export for bank transfer.', icon: '💵' },
      { name: 'Leave Management', desc: 'Staff leave applications with approval workflow. Casual, sick, annual, and maternity leave tracking with automatic balance calculation.', icon: '🏖️' },
      { name: 'Duty Roster', desc: 'Weekly duty assignments for gate duty, exam supervision, and library management. Conflict-free scheduling with workload balancing.', icon: '📋' },
      { name: 'Teacher Workload', desc: 'Track periods per week per teacher. Identify overloaded or underutilized teachers. Workload distribution reports for management.', icon: '⚖️' },
      { name: 'Performance Tracking', desc: 'Teacher performance metrics: class attendance rates, result percentages, lesson plan submission rates, and parent feedback scores.', icon: '📊' },
      { name: 'Training Records', desc: 'Log professional development, workshops, and certifications for each staff member. Track CPD hours and training compliance.', icon: '🎯' },
      { name: 'Substitute Management', desc: 'When a teacher is absent, instantly assign a substitute. Automatic notification to the substitute and students affected.', icon: '🔄' },
    ],
  },
  {
    id: 'portals',
    icon: '🚪',
    title: 'Student, Teacher & Parent Portals',
    subtitle: 'Dedicated role-based portals for every stakeholder',
    color: 'from-teal-600 to-teal-700',
    accent: 'bg-teal-50 text-teal-700 border-teal-200',
    image: '/images/features/7-parent-portal.png',
    features: [
      { name: 'Student Portal', desc: 'Students see their timetable, attendance, grades, assignments, fee status, and exam schedule. Mobile-friendly for on-the-go access.', icon: '🎓' },
      { name: 'Parent Portal', desc: 'Parents monitor all children from one login. See daily attendance, exam results, fee dues, and school announcements.', icon: '👨‍👩‍👧' },
      { name: 'Teacher Portal', desc: 'Teachers view their schedule, mark attendance, submit grades, upload lesson notes, and communicate with parents.', icon: '👩‍🏫' },
      { name: 'Role-Based Access', desc: 'Every user sees only what they need. Admins, teachers, students, and parents each have tailored dashboards with appropriate permissions.', icon: '🔐' },
      { name: 'Mobile Responsive', desc: 'All portals work perfectly on smartphones. Parents in Pakistan primarily use mobile — our portals are mobile-first by design.', icon: '📱' },
      { name: 'Offline-Friendly', desc: 'Key data cached locally so portals remain usable during internet outages. Data syncs automatically when connection restores.', icon: '📶' },
      { name: 'Multi-Language Support', desc: 'Interface available in English and Urdu. Parents can switch language based on preference, improving accessibility across all demographics.', icon: '🌐' },
      { name: 'Parent Leave Requests', desc: 'Parents submit leave applications for their children directly from the portal. Teachers approve or reject with a reason.', icon: '📝' },
    ],
  },
  {
    id: 'website',
    icon: '🌐',
    title: 'School Website Builder',
    subtitle: 'A professional school website included with every plan — no developer needed',
    color: 'from-cyan-600 to-cyan-700',
    accent: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    features: [
      { name: 'Custom Domain', desc: 'Connect your school\'s own domain (e.g. mmcollege.edu.pk). Free SSL certificate automatically configured. One-time setup, no technical knowledge required.', icon: '🔗' },
      { name: 'School Branding', desc: 'Upload your logo, set school colors, choose fonts. Your website looks exactly like your school, not a template.', icon: '🎨' },
      { name: 'Admissions Page', desc: 'Online admission form integrated into your website. Applications go directly into the admissions CRM for processing.', icon: '📋' },
      { name: 'News & Events', desc: 'Post news articles, events, and announcements from the admin dashboard. Automatically published to the school website.', icon: '📰' },
      { name: 'Photo Gallery', desc: 'Showcase school events, classrooms, and activities with a beautiful photo gallery. Upload from admin dashboard, displayed instantly.', icon: '🖼️' },
      { name: 'Staff Directory', desc: 'Professional staff directory with photos and designations. Parents can see who teaches their children before the year starts.', icon: '👥' },
      { name: 'Fee Structure Page', desc: 'Public fee schedule page so parents know costs before applying. Reduces fee-related calls and inquiries to the school office.', icon: '💰' },
      { name: 'SEO Optimized', desc: 'School website ranks on Google for local searches like "best school in DI Khan". Built-in meta tags, sitemaps, and structured data.', icon: '🔍' },
    ],
  },
  {
    id: 'analytics',
    icon: '🤖',
    title: 'Analytics & AI',
    subtitle: 'Data-driven insights to improve academic and operational performance',
    color: 'from-purple-600 to-purple-700',
    accent: 'bg-purple-50 text-purple-700 border-purple-200',
    image: '/images/features/4-analytics-reports.png',
    features: [
      { name: 'Executive Dashboard', desc: 'Real-time overview of students, attendance rates, fee collection, and upcoming exams. Everything a principal needs in one glance.', icon: '📊' },
      { name: 'Attendance Analytics', desc: 'Class-wise, teacher-wise, and month-wise attendance trends. Identify chronic absentees before they fail. Automated reports every Monday.', icon: '📈' },
      { name: 'Financial Analytics', desc: 'Fee collection trends, defaulter analysis, and revenue forecasting. Know which months have highest fee delinquency.', icon: '💹' },
      { name: 'Academic Performance', desc: 'Subject-wise pass rates, class rankings, and year-over-year improvement tracking. Identify weak subjects and underperforming sections.', icon: '🏆' },
      { name: 'AI Dropout Risk', desc: 'AI model identifies students at risk of dropping out based on attendance patterns and grade trends. Early intervention saves students.', icon: '🤖' },
      { name: 'Teacher Performance', desc: 'Data-driven teacher metrics: student result rates, attendance marking consistency, lesson plan submission rates, and parent feedback.', icon: '⭐' },
      { name: 'Custom Reports', desc: 'Generate any report on demand: attendance by date range, fees by category, results by subject, staff by department. Export to PDF or Excel.', icon: '📋' },
      { name: 'Real-Time Updates', desc: 'Dashboard updates live as attendance is marked, fees are paid, and events happen. No page refresh needed — powered by WebSocket.', icon: '⚡' },
    ],
  },
  {
    id: 'security',
    icon: '🔒',
    title: 'Security & Compliance',
    subtitle: 'Bank-grade security protecting your school\'s sensitive data',
    color: 'from-slate-700 to-slate-800',
    accent: 'bg-slate-50 text-slate-700 border-slate-200',
    features: [
      { name: 'Data Encryption', desc: 'AES-256 encryption for all data at rest. TLS 1.3 for all data in transit. Your data is unreadable even if physically stolen.', icon: '🔐' },
      { name: 'Multi-Tenant Isolation', desc: 'Each school\'s data is completely isolated. One school cannot access another\'s data — enforced at the database level, not just application logic.', icon: '🏛️' },
      { name: 'Role-Based Access', desc: 'Granular permissions: admins, teachers, students, and parents each see only their data. No role can exceed its defined access scope.', icon: '🛡️' },
      { name: 'Audit Logs', desc: 'Every login, data change, and admin action is logged with timestamp and IP address. Immutable logs for compliance and forensic investigation.', icon: '📋' },
      { name: 'PDPA Compliance', desc: 'Fully compliant with Pakistan\'s Personal Data Protection Act. Student data is never sold or shared. Right to erasure supported.', icon: '⚖️' },
      { name: 'Automated Backups', desc: 'Daily automated backups with 30-day retention. Point-in-time recovery available. Your data is never lost, even in the worst scenario.', icon: '💾' },
      { name: 'IP Restrictions', desc: 'Restrict admin access to specific IP addresses. School admin login can be limited to the school premises only for maximum security.', icon: '🌐' },
      { name: '99.9% Uptime SLA', desc: 'Hosted on enterprise-grade infrastructure with automatic failover. Planned maintenance during off-peak hours with advance notice.', icon: '⚡' },
    ],
  },
];

export default function FeaturesPage() {
  const [active, setActive] = useState('administration');

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
            <span className="font-black text-lg text-gray-900">MySchool</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-sm font-semibold text-blue-600">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/security-center" className="text-sm font-medium text-gray-600 hover:text-gray-900">Security</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16" style={{ background: 'linear-gradient(150deg, #0C1E35 0%, #0F2D50 60%, #1a3a6b 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-400/25 rounded-full mb-6">
            <span className="text-blue-300 text-xs font-semibold">Complete Feature Set</span>
          </div>
          <h1 className="text-3xl sm:text-4xl sm:text-5xl font-black text-white mb-4 sm:mb-5 leading-tight">
            Everything your school needs,<br />
            <span className="text-blue-400">built into one platform</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            From student enrollment to alumni tracking, from fee collection to AI-powered dropout prediction —
            MySchool replaces 12 different software tools with one integrated system.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/signup" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-sm">
              Start 30-Day Free Trial
            </Link>
            <Link href="/pricing" className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/20 transition-all text-sm">
              View Pricing
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-14 border-t border-white/10 pt-10">
            {[
              { value: '9', label: 'Core Modules' },
              { value: '70+', label: 'Features' },
              { value: '5', label: 'Portals' },
              { value: '3', label: 'Payment Gateways' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-white/50 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky module nav */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {NAV.map(n => (
              <button key={n.id} onClick={() => scrollTo(n.id)}
                className={`px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0
                  ${active === n.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14 sm:space-y-24">
        {MODULES.map((mod, idx) => (
          <section key={mod.id} id={mod.id} className="scroll-mt-32">
            {/* Module header */}
            <div className={`rounded-2xl sm:rounded-3xl bg-gradient-to-r ${mod.color} p-6 sm:p-10 mb-6 sm:mb-10 text-white overflow-hidden`}>
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="flex items-start gap-6 flex-1">
                  <span className="text-5xl">{mod.icon}</span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black mb-2">{mod.title}</h2>
                    <p className="text-white/75 text-lg">{mod.subtitle}</p>
                  </div>
                </div>
                {mod.image && (
                  <div className="w-full sm:w-64 flex-shrink-0 rounded-xl overflow-hidden bg-white/10 border border-white/15">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mod.image} alt={mod.title} className="w-full h-auto block" loading="lazy" />
                  </div>
                )}
              </div>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mod.features.map(feat => (
                <div key={feat.name} className={`border rounded-2xl p-5 hover:shadow-md transition-shadow ${mod.accent}`}>
                  <span className="text-2xl mb-3 block">{feat.icon}</span>
                  <h3 className="font-black text-gray-900 mb-2 text-sm">{feat.name}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* More at a glance */}
      <div className="bg-gray-50 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">More at a Glance</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">See it before you try it</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { img: '/images/features/2-student-management.png', title: 'Student Management', desc: 'Profiles, records, and performance in one place.' },
              { img: '/images/features/9-examinations-results.png', title: 'Examinations & Results', desc: 'Conduct exams and publish results with ease.' },
              { img: '/images/features/10-attendance-timetable.png', title: 'Attendance & Timetable', desc: 'Track attendance and manage timetables smartly.' },
              { img: '/images/features/8-mobile-app-experience.png', title: 'Mobile App Experience', desc: 'Access everything on the go, for every role.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.title} className="w-full h-auto block" loading="lazy" />
                <div className="p-4">
                  <h3 className="font-black text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Ready to modernize your school?</h2>
          <p className="text-blue-200 mb-8">Join hundreds of Pakistani schools already using MySchool. 30-day free trial, no credit card required.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="px-8 py-3.5 bg-white text-blue-700 font-black rounded-xl hover:bg-blue-50 transition-all">
              Start Free Trial
            </Link>
            <Link href="/pricing" className="px-8 py-3.5 bg-white/15 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">M</div>
            <span className="text-white font-black">MySchool</span>
          </Link>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/security-center" className="hover:text-white">Security</Link>
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
