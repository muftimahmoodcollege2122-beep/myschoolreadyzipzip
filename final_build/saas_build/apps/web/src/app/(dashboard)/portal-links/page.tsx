'use client';
import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/auth.store';

const COPY_ICON = '📋';
const CHECK_ICON = '✅';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="ml-2 text-gray-400 hover:text-gray-700 transition-colors text-sm flex-shrink-0"
      title="Copy to clipboard">
      {copied ? CHECK_ICON : COPY_ICON}
    </button>
  );
}

export default function PortalLinksPage() {
  const user = useAuthStore(s => s.user) as any;
  const slug = user?.school?.slug || user?.tenantSlug || 'your-school';

  const PORTALS = [
    {
      icon:  '🌐',
      label: 'School Website',
      desc:  'Public-facing website for parents and prospective students',
      url:   `https://${slug}.myschool.pk`,
      color: 'border-blue-200 bg-blue-50',
      badge: 'bg-blue-600',
    },
    {
      icon:  '🏫',
      label: 'Admin Dashboard',
      desc:  'Full control panel for school administrators',
      url:   `https://${slug}.myschool.pk/dashboard`,
      color: 'border-indigo-200 bg-indigo-50',
      badge: 'bg-indigo-600',
    },
    {
      icon:  '👨‍🏫',
      label: 'Teacher Portal',
      desc:  'Mark attendance, enter grades, manage classes and apply for leave',
      url:   `https://${slug}.myschool.pk/t/${slug}`,
      loginUrl: `https://${slug}.myschool.pk/t/${slug}/login`,
      color: 'border-teal-200 bg-teal-50',
      badge: 'bg-teal-600',
    },
    {
      icon:  '👩‍🎓',
      label: 'Student Portal',
      desc:  'View grades, attendance, timetable, LMS courses and fee status',
      url:   `https://${slug}.myschool.pk/learn/${slug}`,
      loginUrl: `https://${slug}.myschool.pk/learn/${slug}/login`,
      color: 'border-violet-200 bg-violet-50',
      badge: 'bg-violet-600',
    },
    {
      icon:  '👨‍👩‍👧',
      label: 'Parent Portal',
      desc:  'Monitor your child\'s progress, attendance, fees and school notices',
      url:   `https://${slug}.myschool.pk/parent/${slug}`,
      loginUrl: `https://${slug}.myschool.pk/parent/${slug}/login`,
      color: 'border-rose-200 bg-rose-50',
      badge: 'bg-rose-600',
    },
  ];

  const [shareTab, setShareTab] = useState<'sms' | 'email' | 'whatsapp'>('whatsapp');

  const shareMessages = {
    whatsapp: `Dear Parents/Students,

Welcome to ${slug.replace(/-/g, ' ')} School Management Portal! 🎓

Your dedicated portals are now live:

👩‍🎓 Student Portal: https://${slug}.myschool.pk/learn/${slug}/login
👨‍👩‍👧 Parent Portal: https://${slug}.myschool.pk/parent/${slug}/login

Login with the credentials shared by your school.
Powered by EduOS`,

    sms: `Your school portals are live! Student: ${slug}.myschool.pk/learn/${slug}/login | Parent: ${slug}.myschool.pk/parent/${slug}/login`,

    email: `Subject: Your School Portal Access — ${slug.replace(/-/g, ' ')}

Dear [Name],

Your school management portal is now ready. Please use the links below to access your portal:

TEACHER PORTAL: https://${slug}.myschool.pk/t/${slug}/login
STUDENT PORTAL: https://${slug}.myschool.pk/learn/${slug}/login
PARENT PORTAL:  https://${slug}.myschool.pk/parent/${slug}/login

Use your registered email and the temporary password shared by your school administrator.
Change your password immediately after first login.

Best regards,
School Administration`,
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Your School Portals</h1>
        <p className="text-gray-500 mt-1">
          Share these links with your teachers, students and parents to get them started.
        </p>
      </div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 gap-4 mb-10">
        {PORTALS.map(portal => (
          <div key={portal.label} className={`border-2 rounded-2xl p-5 ${portal.color}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 ${portal.badge} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                  {portal.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-800">{portal.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{portal.desc}</p>
                  <div className="flex items-center mt-2 min-w-0">
                    <span className="text-xs font-mono text-gray-600 truncate">{portal.url}</span>
                    <CopyButton text={portal.url} />
                  </div>
                  {portal.loginUrl && (
                    <div className="flex items-center mt-1 min-w-0">
                      <span className="text-xs text-gray-400 mr-1">Login:</span>
                      <span className="text-xs font-mono text-gray-600 truncate">{portal.loginUrl}</span>
                      <CopyButton text={portal.loginUrl} />
                    </div>
                  )}
                </div>
              </div>
              <a href={portal.url} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                Open →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Share Templates */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Share with Staff & Parents</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ready-to-send messages for different channels</p>
        </div>

        <div className="flex border-b border-gray-100">
          {(['whatsapp', 'sms', 'email'] as const).map(tab => (
            <button key={tab} onClick={() => setShareTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
                shareTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'whatsapp' ? '📱 WhatsApp' : tab === 'sms' ? '💬 SMS' : '📧 Email'}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="relative">
            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {shareMessages[shareTab]}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(shareMessages[shareTab])}
              className="absolute top-3 right-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
              Copy {COPY_ICON}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
