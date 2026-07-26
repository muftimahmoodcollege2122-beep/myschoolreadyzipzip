'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const SETUP_STEPS = [
  {
    id: 1,
    title: 'Create Your Account',
    description: 'Register your school/college on MySchool',
    duration: '5 min',
    icon: '📝',
    content: [
      {
        subtitle: 'Step 1: Go to Sign Up',
        details: [
          'Visit myschool.pk/signup',
          'You will see a registration form for institutional setup',
        ]
      },
      {
        subtitle: 'Step 2: Fill School Details',
        details: [
          '• School/College Name (official name)',
          '• School Code (unique identifier, e.g., "ABC001")',
          '• Email Address (admin/principal email)',
          '• Phone Number (contact for support)',
          '��� Address (city, area, full address)',
          '• Academic Year (e.g., 2025-2026)',
        ]
      },
      {
        subtitle: 'Step 3: Create Admin Account',
        details: [
          '• Set strong password (min. 8 chars, special symbols)',
          '• Confirm password',
          '• Agree to Terms & Privacy Policy',
          '• Click "Create Account"',
        ]
      },
      {
        subtitle: '✅ What You Get',
        details: [
          '• Admin access to full platform',
          '• 14-day free trial (STARTER plan)',
          '• Welcome email with login link',
          '• Demo tenant data for practice',
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Configure School Settings',
    description: 'Set up your school profile, logo, and basic settings',
    duration: '10 min',
    icon: '⚙️',
    content: [
      {
        subtitle: 'Step 1: Login to Dashboard',
        details: [
          'Use credentials from Step 1 to login',
          'You will land on the Admin Dashboard',
          'Click "Settings" in the left sidebar',
        ]
      },
      {
        subtitle: 'Step 2: School Profile Settings',
        details: [
          '📍 Edit School Information:',
          '  • School name, code, address',
          '  • Phone, email, website URL',
          '  • Timezone (e.g., "Asia/Karachi")',
          '  • Locale (language: English, Urdu)',
          '  • Academic Year format',
        ]
      },
      {
        subtitle: 'Step 3: Upload Logo & Branding',
        details: [
          '🎨 Customization:',
          '  • Upload school logo (PNG/JPG, max 5MB)',
          '  • Set primary color (e.g., #1a56db)',
          '  • Set secondary color for accents',
          '  • These appear on portals + certificates',
        ]
      },
      {
        subtitle: 'Step 4: Configure Grading Scale',
        details: [
          '📊 Set up your grading system:',
          '  • A+ (90-100), A (80-89), B+ (70-79), etc.',
          '  • OR custom scale (1-5, 1-10)',
          '  • Set as default for all classes',
          '  • Tip: Can override per class if needed',
        ]
      },
      {
        subtitle: '✅ Result',
        details: [
          '• School branded portal ready',
          '• All student documents use your logo',
          '• Consistent branding across website + portals',
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Add Academic Structure',
    description: 'Create classes, sections, and assign teachers',
    duration: '15 min',
    icon: '📚',
    content: [
      {
        subtitle: 'Step 1: Create Classes',
        details: [
          'Go to: Admin Dashboard > Academic > Classes',
          'Click "+ Create Class"',
          'Fill:',
          '  • Class Name (e.g., "Grade 10", "Form 4")',
          '  • Level (numeric, for sorting: 10 = Grade 10)',
          '  • Academic Year (2025-2026)',
          '  • Department (optional: Science, Arts, etc.)',
          'Click Create',
        ]
      },
      {
        subtitle: 'Step 2: Create Sections (Divisions)',
        details: [
          'Go to: Academic > Classes > [Select Class]',
          'Click "+ Add Section"',
          'Fill:',
          '  • Section Name (A, B, Blue, 10-A)',
          '  • Capacity (max students: 40, 50, etc.)',
          '  • Room Number (optional)',
          'Click Add',
          '💡 Tip: Create 2-3 sections per class for smaller batches',
        ]
      },
      {
        subtitle: 'Step 3: Add Subjects',
        details: [
          'Go to: Academic > Subjects',
          'Click "+ Add Subject"',
          'Fill:',
          '  • Subject Name (English, Math, Science)',
          '  • Subject Code (ENG, MATH, SCI)',
          '  • Credit Hours (optional: 3, 4)',
          '  • Elective? (Yes/No)',
          'Create all subjects for your school',
        ]
      },
      {
        subtitle: 'Step 4: Assign Subjects to Classes',
        details: [
          'Go to: Academic > Classes > [Class] > Subjects',
          'Click "+ Add Subject to Class"',
          'Select:',
          '  • Subject (from list)',
          '  • Teacher (assign from teacher list)',
          '  • Weekly Hours (4, 5, etc.)',
          'Repeat for all subjects',
        ]
      },
      {
        subtitle: '✅ Result',
        details: [
          '• Academic structure complete',
          '• Classes, sections, subjects configured',
          '• Teachers assigned to subjects',
          '• Ready to add students',
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Add Users (Teachers & Staff)',
    description: 'Create teacher and staff accounts',
    duration: '20 min',
    icon: '👨‍🏫',
    content: [
      {
        subtitle: 'Step 1: Add Teachers One-by-One',
        details: [
          'Go to: Users > Teachers',
          'Click "+ Add Teacher"',
          'Fill Teacher Form:',
          '  • Email (teacher@myschool.edu)',
          '  • First Name & Last Name',
          '  • Employee ID (T001, T002, etc.)',
          '  • Joining Date',
          '  • Department (Science, English, etc.)',
          '  • Qualifications (B.A., M.Sc, etc.)',
          '  • Specializations (Physics, Literature)',
          'Click Create',
          '→ Teacher gets login email with auto-generated password',
        ]
      },
      {
        subtitle: 'Step 2: Bulk Import Teachers (Faster)',
        details: [
          'Go to: Users > Teachers > "Bulk Import"',
          'Download CSV template',
          'Fill CSV with teacher data:',
          '  email | firstName | lastName | employeeId | joiningDate | department',
          'Upload CSV',
          '→ All teachers created instantly',
          '✅ Faster for 50+ teachers',
        ]
      },
      {
        subtitle: 'Step 3: Add Staff (Support Staff)',
        details: [
          'Go to: Users > Staff',
          'Click "+ Add Staff"',
          'Fill:',
          '  • Email, Name, Employee ID',
          '  • Designation (Accountant, Driver, etc.)',
          '  • Department (Finance, Transport)',
          '  • Joining Date',
          'Click Create',
        ]
      },
      {
        subtitle: '✅ Result',
        details: [
          '• All teachers have login accounts',
          '• Teachers can reset password on first login',
          '• Email invites sent to all staff',
          '• Ready for student enrollment',
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Add Students & Parents',
    description: 'Enroll students and link parent accounts',
    duration: '25 min',
    icon: '👨‍🎓',
    content: [
      {
        subtitle: 'Step 1: Add Students One-by-One',
        details: [
          'Go to: Students > All Students',
          'Click "+ Add Student"',
          'Fill Student Form:',
          '  • Email (student@myschool.edu)',
          '  • First Name & Last Name',
          '  • Roll Number (S001, S002) - UNIQUE',
          '  • Admission Number (ADM2025001) - UNIQUE',
          '  • Admission Date',
          '  • Gender, Date of Birth',
          '  • Blood Group (optional)',
          '  • Medical Notes (encrypted)',
          'Click Create',
        ]
      },
      {
        subtitle: 'Step 2: Bulk Import Students (Recommended)',
        details: [
          'Go to: Students > "Bulk Import"',
          'Download Excel template',
          'Fill columns:',
          '  email | firstName | lastName | rollNumber | admissionNo | admissionDate | gender | dob',
          'Upload Excel',
          '→ 1000+ students added in seconds',
          '✅ Fastest method for existing schools',
        ]
      },
      {
        subtitle: 'Step 3: Enroll Students in Sections',
        details: [
          'Go to: Academic > Classes > [Class] > [Section]',
          'Click "Assign Students"',
          'Select students from list (checkbox)',
          'Click "Enroll Selected"',
          '→ Students now appear in that section',
          '💡 Can move students between sections anytime',
        ]
      },
      {
        subtitle: 'Step 4: Link Parents',
        details: [
          'Go to: Students > [Student] > Parents',
          'Click "+ Add Parent"',
          'Option A: Parent has existing account? → Link by email',
          'Option B: New parent? → Create account:',
          '  • Email (parent@email.com)',
          '  • Name, Phone',
          '  • Relationship (Father, Mother, Guardian)',
          'Click Create & Link',
          '→ Parent gets login access to student data',
        ]
      },
      {
        subtitle: '✅ Result',
        details: [
          '• All students enrolled in sections',
          '• Parents linked and can view child progress',
          '• Students can access portal',
          '• Ready for attendance & grades',
        ]
      }
    ]
  },
  {
    id: 6,
    title: 'Setup Fee Structure & Payments',
    description: 'Configure student fees and payment methods',
    duration: '15 min',
    icon: '💰',
    content: [
      {
        subtitle: 'Step 1: Create Fee Structure',
        details: [
          'Go to: Finance > Fee Structures',
          'Click "+ Create Fee Structure"',
          'Fill:',
          '  • Name (e.g., "Annual Fee 2025-26")',
          '  • Academic Year (2025-2026)',
          '  • Classes Applied To (select classes)',
          '  • Frequency (Monthly, Quarterly, Annually)',
        ]
      },
      {
        subtitle: 'Step 2: Add Fee Components',
        details: [
          'In Fee Structure, click "+ Add Component"',
          'For each component:',
          '  • Component Name (Tuition, Labs, etc.)',
          '  • Amount (PKR, USD, etc.)',
          '  • Due Date (date of month)',
          '  • Optional? (Yes/No)',
          '  • Late Fee (additional charge if late)',
          'Example:',
          '  ├─ Tuition Fee: PKR 50,000 (Due 1st)',
          '  ├─ Lab Fee: PKR 5,000 (Optional)',
          '  └─ Exam Fee: PKR 3,000 (Due 20th)',
        ]
      },
      {
        subtitle: 'Step 3: Generate Invoices',
        details: [
          'Go to: Finance > Fee Invoices',
          'Click "Generate Invoices from Structure"',
          'Select:',
          '  • Fee Structure',
          '  • Classes/Sections',
          '  • Period (this month, quarter, year)',
          'Click Generate',
          '→ Invoice created for each student',
        ]
      },
      {
        subtitle: 'Step 4: Enable Payment Methods',
        details: [
          'Go to: Settings > Payment Gateway',
          'Enable methods:',
          '  ✅ Stripe (Card payments)',
          '  ✅ Bank Transfer (manual verification)',
          '  ✅ EasyPaisa (Pakistan)',
          '  ✅ JazzCash (Pakistan)',
          '  ✅ Cash (offline)',
          'Add your Stripe API key (if using)',
          'Configure bank account details',
        ]
      },
      {
        subtitle: '✅ Result',
        details: [
          '• Students get fee invoices',
          '• Parents can pay online (Stripe)',
          '• Manual verification for local methods',
          '• Payment dashboard shows pending/paid',
        ]
      }
    ]
  },
  {
    id: 7,
    title: 'Create Timetable & Calendar',
    description: 'Set up class schedules and academic calendar',
    duration: '20 min',
    icon: '📅',
    content: [
      {
        subtitle: 'Step 1: Create Academic Calendar',
        details: [
          'Go to: Academic > Calendar',
          'Click "+ Create Calendar"',
          'Fill:',
          '  • Academic Year (2025-2026)',
          '  • Term Name (Term 1, Semester 1, etc.)',
          '  • Start Date & End Date',
          '  • Add Holidays:',
          '    ├─ Independence Day: 14-Aug',
          '    ├─ Winter Break: 21-Dec to 5-Jan',
          '    └─ Eid (date TBD)',
          'Click Create',
        ]
      },
      {
        subtitle: 'Step 2: Create Timetable Slots',
        details: [
          'Go to: Academic > Timetable',
          'Click "+ Create Slot"',
          'For each class session:',
          '  • Section (select)',
          '  • Subject (English, Math, etc.)',
          '  • Teacher (select)',
          '  • Day of Week (Monday-Friday)',
          '  • Start Time (09:00 AM)',
          '  • End Time (10:00 AM)',
          '  • Room Number (A-101, Lab-2)',
          '  • Academic Year & Period',
          'Click Create',
          '💡 Build weekly grid: 5 days × 6-8 periods',
        ]
      },
      {
        subtitle: 'Step 3: View Timetable',
        details: [
          'Go to: Academic > Timetable > View Weekly',
          'Select:',
          '  • Class/Section',
          '  • Week Date',
          'View displays:',
          '  ├─ Mon-Fri, 8 time slots',
          '  ├─ Subject, Teacher, Room',
          '  └─ Color-coded by subject',
        ]
      },
      {
        subtitle: '✅ Result',
        details: [
          '• Complete timetable for all classes',
          '• Teachers see their daily schedule',
          '• Students get schedule view',
          '• Ready for attendance marking',
        ]
      }
    ]
  },
  {
    id: 8,
    title: 'Test & Go Live',
    description: 'Test all features and activate your school',
    duration: '30 min',
    icon: '✅',
    content: [
      {
        subtitle: 'Step 1: Invite Test Users',
        details: [
          'Invite 2-3 teachers to test:',
          'Go to: Users > Teachers > [Teacher] > Copy Invite Link',
          'Share link via email or WhatsApp',
          'Teachers login with auto-generated password',
          'They can:',
          '  ✓ View timetable',
          '  ✓ Mark attendance',
          '  ✓ Enter grades',
          '  ✓ Send messages to parents',
        ]
      },
      {
        subtitle: 'Step 2: Invite Test Parents',
        details: [
          'Link 2-3 parents to test accounts',
          'Send parent portal login link',
          'Parents can:',
          '  ✓ View child attendance',
          '  ✓ Check fees & payment status',
          '  ✓ View grades & report cards',
          '  ✓ Receive notifications',
          '  ✓ Pay fees online',
        ]
      },
      {
        subtitle: 'Step 3: Test Key Features',
        details: [
          'Attendance:',
          '  1. Teacher marks 5 students present',
          '  2. Check student attendance report',
          '  3. Verify parents get notification',
          '',
          'Grades:',
          '  1. Teacher enters quiz scores',
          '  2. Check student report card',
          '  3. Verify grade calculation',
          '',
          'Fees:',
          '  1. Create test invoice',
          '  2. Parent pays via Stripe',
          '  3. Verify payment marked as PAID',
        ]
      },
      {
        subtitle: 'Step 4: Upgrade from Trial',
        details: [
          'Go to: Settings > Billing > Subscription',
          'Choose plan:',
          '  • STARTER: PKR 5,000/mo (up to 300 students)',
          '  • PROFESSIONAL: PKR 15,000/mo (up to 1000)',
          '  • ENTERPRISE: Custom (unlimited)',
          'Select Plan > Add Payment Method > Subscribe',
          '→ Automatic billing every month',
          '💡 Pause/cancel anytime, no long-term lock-in',
        ]
      },
      {
        subtitle: 'Step 5: Full School Rollout',
        details: [
          'Once comfortable:',
          '  1. Mass-invite all teachers (bulk email)',
          '  2. Teachers mark attendance starting Monday',
          '  3. Send parent invites (auto SMS/email)',
          '  4. Generate invoices & share payment links',
          '  5. Start recording grades in portal',
          '  6. Monitor dashboard for activity',
        ]
      },
      {
        subtitle: '✅ Your School is Live!',
        details: [
          '✓ Teachers use daily attendance marking',
          '✓ Parents monitor children in real-time',
          '✓ Instant notifications (attendance, fees, etc.)',
          '✓ Automated report card generation',
          '✓ Financial transparency with digital payments',
          '✓ Complete audit trail of all actions',
        ]
      }
    ]
  },
];

export default function SetupGuidePage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/brand/logo.png" alt="MySchool" className="w-8 h-8 object-contain" />
            <span className="font-black text-lg text-gray-900">MySchool</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/40 rounded-full mb-5">
            <span className="text-blue-100 text-xs font-semibold">📖 Getting Started</span>
          </div>
          <h1 className="text-5xl font-black mb-4">Setup Your School Account</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Complete step-by-step guide to launch MySchool at your institution. From registration to going live — everything explained with screenshots and examples.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-blue-100">
            <span>⏱️ Total time: ~2 hours</span>
            <span>•</span>
            <span>📱 Works on desktop & mobile</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Setup Progress</h2>
            <span className="text-sm font-semibold text-blue-600">{expandedStep}/{SETUP_STEPS.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${expandedStep ? (expandedStep / SETUP_STEPS.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {SETUP_STEPS.map((step) => (
            <div 
              key={step.id} 
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-white"
            >
              {/* Step Header */}
              <button
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="w-full p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="text-3xl flex-shrink-0">{step.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      Step {step.id}: {step.title}
                    </h3>
                    <span className="px-2.5 py-1 bg-gray-100 text-xs font-semibold text-gray-700 rounded-full">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <div className={`text-2xl transform transition-transform flex-shrink-0 ${expandedStep === step.id ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              {/* Step Content */}
              {expandedStep === step.id && (
                <div className="border-t border-gray-100 px-6 py-6 bg-gray-50/50 space-y-6">
                  {step.content.map((section, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        {section.subtitle.includes('✅') ? '✅' : '📌'} {section.subtitle}
                      </h4>
                      <ul className="space-y-2">
                        {section.details.map((detail, dIdx) => (
                          <li key={dIdx} className="text-sm text-gray-700 leading-relaxed ml-6 list-disc">
                            {detail.split('\n').map((line, lIdx) => (
                              <span key={lIdx}>
                                {line}
                                {lIdx < detail.split('\n').length - 1 && <br />}
                              </span>
                            ))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Follow the steps above and your school will be fully operational within 2 hours. Need help? Our support team is available 24/7.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
            >
              Start Free Trial →
            </Link>
            <a 
              href="mailto:support@myschool.pk" 
              className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-lg transition-all"
            >
              Schedule Live Demo
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'How long does setup take?', a: 'Most schools complete setup in 1-2 hours with bulk import. Smaller institutions may take 30 minutes.' },
              { q: 'Can I change settings later?', a: 'Yes! All settings are flexible. Change academic calendar, fee structure, grading scale anytime.' },
              { q: 'What if I make a mistake?', a: 'Our support team can help fix data issues. We recommend testing with a few users first.' },
              { q: 'Can I import from Excel?', a: 'Yes! We support bulk import for students, teachers, and staff via Excel/CSV files.' },
              { q: 'Is training provided?', a: 'Free onboarding call included. We help set up your first class and explain teacher workflow.' },
              { q: 'What if I need help?', a: 'Email support@myschool.pk or call +92 300 XXXX. Response within 2 hours, 24/7.' },
            ].map((faq, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm">© 2026 MySchool Technologies. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <Link href="/privacy-policy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <a href="mailto:support@myschool.pk" className="hover:text-white transition">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
