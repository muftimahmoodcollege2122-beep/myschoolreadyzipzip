'use client';
import React, { useState } from 'react';
import Link from 'next/link';

// MODULES below retains the full detailed feature catalogue (9 modules × 8 features each)
// for potential future deep-dive pages; the current page renders a condensed 12-card summary further down.
const MODULES = [
  {
    id: 'administration',
    icon: '🏫',
    title: 'School Administration',
    subtitle: 'Run your entire school from a single powerful dashboard',
    color: 'from-gray-900 to-black',
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
    color: 'from-indigo-800 to-indigo-900',
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

const FEATURE_CARDS = [
  { title: 'Student Information Management', desc: 'Maintain complete student records, profiles, admission details and history in one secure place.', icon: '👥', color: 'bg-violet-50 text-violet-600', category: 'Administration' },
  { title: 'Attendance Management', desc: 'Track attendance in real-time with biometric, RFID or manual entry and get insightful reports.', icon: '📅', color: 'bg-emerald-50 text-emerald-600', category: 'Academic Management' },
  { title: 'Examination Management', desc: 'Create exams, schedule, grade efficiently and generate detailed performance analytics.', icon: '📝', color: 'bg-orange-50 text-orange-600', category: 'Academic Management' },
  { title: 'Timetable Management', desc: 'Create conflict-free timetables with an intelligent scheduler for classes, teachers and resources.', icon: '🗓️', color: 'bg-blue-50 text-blue-600', category: 'Academic Management' },
  { title: 'Fee & Finance Management', desc: 'Automate fee collection, expenses, invoices and financial reporting seamlessly.', icon: '💵', color: 'bg-green-50 text-green-600', category: 'Finance' },
  { title: 'Learning Management System (LMS)', desc: 'Share materials, manage assignments, conduct online classes and track progress.', icon: '💻', color: 'bg-indigo-50 text-indigo-600', category: 'Learning' },
  { title: 'Communication Management', desc: 'Send instant notifications, announcements and messages to students, parents & staff.', icon: '💬', color: 'bg-teal-50 text-teal-600', category: 'Communication' },
  { title: 'Human Resource Management', desc: 'Manage staff records, leaves, payroll, appraisals and HR workflows effortlessly.', icon: '👔', color: 'bg-amber-50 text-amber-600', category: 'Administration' },
  { title: 'Transport Management', desc: 'Manage routes, vehicles, drivers and ensure student safety with live tracking.', icon: '🚌', color: 'bg-rose-50 text-rose-600', category: 'Administration' },
  { title: 'Library Management', desc: 'Catalog books, issue/return, manage inventory and digital library resources.', icon: '📚', color: 'bg-sky-50 text-sky-600', category: 'Learning' },
  { title: 'Inventory Management', desc: 'Track and manage stock, supplies and assets across your institution.', icon: '📦', color: 'bg-slate-100 text-slate-600', category: 'Administration' },
  { title: 'Reports & Analytics', desc: 'Get real-time insights with custom reports and data visualizations.', icon: '📊', color: 'bg-purple-50 text-purple-600', category: 'Security & Access' },
];

const CATEGORIES = ['All Features', 'Academic Management', 'Administration', 'Finance', 'Communication', 'Learning', 'Security & Access'];
const CATEGORY_ICONS: Record<string, string> = {
  'All Features': '⊞', 'Academic Management': '🎓', 'Administration': '🏛️', 'Finance': '💰',
  'Communication': '💬', 'Learning': '💻', 'Security & Access': '🛡️',
};

export default function FeaturesPage() {
  const [category, setCategory] = useState('All Features');
  const visibleCards = category === 'All Features' ? FEATURE_CARDS : FEATURE_CARDS.filter(c => c.category === category);

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
            <Link href="/features" className="text-sm font-semibold text-amber-700 relative">
              Features
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/security-center" className="text-sm font-medium text-gray-600 hover:text-gray-900">Security</Link>
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">Company</Link>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-700 text-xs font-bold uppercase tracking-widest">Features</span>
            <span className="w-8 h-px bg-amber-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.08]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Everything You Need,<br />All in One Platform
          </h1>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-md mb-9">
            MySchool brings together all the tools your institution needs to manage, teach, learn and grow — smarter, faster and simpler.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Secure & Reliable', desc: 'Enterprise-grade security to protect your data.' },
              { icon: '⏱️', title: 'Save Time', desc: 'Automate daily tasks and focus on what matters.' },
              { icon: '📈', title: 'Drive Growth', desc: 'Powerful insights to help your institution grow.' },
            ].map(f => (
              <div key={f.title}>
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-base mb-2.5">{f.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{f.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-8">
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors border ${
                category === cat ? 'bg-gray-950 text-white border-gray-950' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleCards.map(f => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-shadow">
              <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center text-xl mb-4`}>{f.icon}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">{f.desc}</p>
              <Link href="/pricing" className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold hover:gap-1.5 transition-all">
                Learn more
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </Link>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber-300 text-amber-800 font-bold text-sm hover:bg-amber-50 transition-colors">
            Explore All Modules
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </Link>
        </div>
      </div>

      {/* Stats band */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #14161C 0%, #22252E 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Built for Impact</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-3 leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                Trusted by Institutions<br />Making a Difference
              </h2>
              <p className="text-white/50 text-sm max-w-sm">MySchool empowers schools and colleges to operate efficiently and deliver a better learning experience every day.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                ['🏛️', '500+', 'Institutions', 'trust MySchool'],
                ['🎓', '120,000+', 'Students', 'managed'],
                ['👥', '50,000+', 'Teachers', 'empowered'],
                ['🛡️', '99.9%', 'Uptime', 'guaranteed'],
              ].map(([icon, value, l1, l2]) => (
                <div key={l1} className="text-center sm:text-left">
                  <div className="text-xl mb-2">{icon}</div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{l1} {l2}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="bg-white border border-amber-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl flex-shrink-0">🛡️</div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>Ready to Transform Your Institution?</h2>
            <p className="text-gray-500 text-sm">Join thousands of institutions using MySchool to simplify operations, improve communication and focus on what matters most.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/signup" className="px-6 py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold rounded-xl text-sm text-center transition-colors flex items-center justify-center gap-1.5">
              Book a Demo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </Link>
            <Link href="/pricing" className="px-6 py-3 border border-amber-300 text-amber-800 font-bold rounded-xl text-sm text-center hover:bg-amber-50 transition-colors">
              View Pricing
            </Link>
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
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-4">Empowering educational institutions with intelligent technology for a better tomorrow.</p>
              <div className="flex gap-3">
                {['LinkedIn', 'Twitter', 'YouTube'].map(s => (
                  <a key={s} href="#" className="text-xs text-gray-600 hover:text-white transition-colors font-medium">{s}</a>
                ))}
              </div>
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
