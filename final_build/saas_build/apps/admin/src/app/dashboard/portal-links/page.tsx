'use client';
import React, { useState, useMemo } from 'react';
import { useAdminAuth } from '../../../stores/auth.store';

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
    <button onClick={copy} className="ml-2 text-gray-400 hover:text-gray-700 transition-colors text-sm flex-shrink-0" title="Copy">
      {copied ? CHECK_ICON : COPY_ICON}
    </button>
  );
}

function getPortalBaseUrl(port: number): string {
  if (typeof window === 'undefined') return `http://localhost:${port}`;
  const host = window.location.hostname;
  if (host.endsWith('.replit.dev') || host.endsWith('.repl.co')) {
    const baseDomain = host.replace(/^\d+-/, '');
    return `https://${port}-${baseDomain}`;
  }
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://localhost:${port}`;
  }
  return '';
}

export default function PortalLinksPage() {
  const { slug } = useAdminAuth();
  const schoolSlug = slug || 'your-school';

  const devUrls = useMemo(() => {
    const base = typeof window !== 'undefined'
      ? window.location.hostname.replace(/^\d+-/, '')
      : 'localhost';
    const isReplit = base.endsWith('.replit.dev') || base.endsWith('.repl.co');
    if (isReplit) {
      return {
        web:     `https://${base}`,
        admin:   `https://8080-${base}`,
        teacher: `https://3002-${base}`,
        student: `https://3003-${base}`,
        parent:  `https://4200-${base}`,
      };
    }
    return {
      web:     'http://localhost:5000',
      admin:   'http://localhost:8080',
      teacher: 'http://localhost:3002',
      student: 'http://localhost:3003',
      parent:  'http://localhost:4200',
    };
  }, []);

  const isProd = !devUrls.teacher;
  const prodBase = `https://${schoolSlug}.myschool.pk`;

  const PORTALS = [
    {
      icon:     '🌐',
      label:    'School Website',
      desc:     'Public-facing website for parents and prospective students',
      url:      isProd ? prodBase : devUrls.web,
      loginUrl: null as string | null,
      color:    'border-blue-200 bg-blue-50',
      badge:    'bg-blue-600',
      port:     5000,
    },
    {
      icon:     '🏫',
      label:    'Admin Dashboard',
      desc:     'Full control panel — you are here',
      url:      isProd ? `${prodBase}/dashboard` : `${devUrls.admin}/dashboard`,
      loginUrl: isProd ? `${prodBase}/login` : `${devUrls.admin}/login`,
      color:    'border-indigo-200 bg-indigo-50',
      badge:    'bg-indigo-600',
      port:     3005,
    },
    {
      icon:     '👨‍🏫',
      label:    'Teacher Portal',
      desc:     'Mark attendance, enter grades, manage classes and apply for leave',
      url:      isProd ? `${prodBase}/t/${schoolSlug}` : `${devUrls.teacher}/dashboard`,
      loginUrl: isProd ? `${prodBase}/t/${schoolSlug}/login` : `${devUrls.teacher}/login`,
      color:    'border-teal-200 bg-teal-50',
      badge:    'bg-teal-600',
      port:     3002,
    },
    {
      icon:     '👩‍🎓',
      label:    'Student Portal',
      desc:     'View grades, attendance, timetable, LMS courses and fee status',
      url:      isProd ? `${prodBase}/learn/${schoolSlug}` : `${devUrls.student}/dashboard`,
      loginUrl: isProd ? `${prodBase}/learn/${schoolSlug}/login` : `${devUrls.student}/login`,
      color:    'border-violet-200 bg-violet-50',
      badge:    'bg-violet-600',
      port:     3003,
    },
    {
      icon:     '👨‍👩‍👧',
      label:    'Parent Portal',
      desc:     "Monitor child's progress, attendance, fees and school notices",
      url:      isProd ? `${prodBase}/parent/${schoolSlug}` : `${devUrls.parent}/dashboard`,
      loginUrl: isProd ? `${prodBase}/parent/${schoolSlug}/login` : `${devUrls.parent}/login`,
      color:    'border-rose-200 bg-rose-50',
      badge:    'bg-rose-600',
      port:     3004,
    },
  ];

  const [shareTab, setShareTab] = useState<'sms' | 'email' | 'whatsapp'>('whatsapp');

  const teacherLogin = isProd ? `${prodBase}/t/${schoolSlug}/login` : `${devUrls.teacher}/login`;
  const studentLogin = isProd ? `${prodBase}/learn/${schoolSlug}/login` : `${devUrls.student}/login`;
  const parentLogin  = isProd ? `${prodBase}/parent/${schoolSlug}/login` : `${devUrls.parent}/login`;

  const shareMessages = {
    whatsapp: `Dear Parents/Students,\n\nWelcome to ${schoolSlug.replace(/-/g, ' ')} School Portal! 🎓\n\n👩‍🎓 Student Portal: ${studentLogin}\n👨‍👩‍👧 Parent Portal: ${parentLogin}\n\nLogin with your registered credentials.\nPowered by EduOS`,
    sms: `School portals live! Student: ${studentLogin} | Parent: ${parentLogin}`,
    email: `Subject: Your School Portal Access\n\nDear [Name],\n\nYour portals are ready:\n\nTEACHER: ${teacherLogin}\nSTUDENT: ${studentLogin}\nPARENT:  ${parentLogin}\n\nBest regards,\nSchool Administration`,
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Your School Portals</h1>
        <p className="text-gray-500 mt-1 text-sm">Share these links with staff, students and parents to get them started.</p>
      </div>

      {!isProd && (
        <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <span className="text-lg mt-0.5">🔧</span>
          <div>
            <strong>Development Preview URLs</strong> — clicking "Open →" will open each portal in a new tab using its preview port.
            In production these will be served under <code className="font-mono text-xs bg-amber-100 px-1 rounded">{schoolSlug}.myschool.pk</code>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-10">
        {PORTALS.map(portal => (
          <div key={portal.label} className={`border-2 rounded-2xl p-5 ${portal.color}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 ${portal.badge} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                  {portal.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800">{portal.label}</p>
                    {!isProd && (
                      <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                        :{portal.port}
                      </span>
                    )}
                  </div>
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
                className="flex-shrink-0 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all hover:shadow-sm">
                Open →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Share with Staff & Parents</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ready-to-send messages — copy and send directly</p>
        </div>
        <div className="flex border-b border-gray-100">
          {(['whatsapp', 'sms', 'email'] as const).map(tab => (
            <button key={tab} onClick={() => setShareTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${
                shareTab === tab ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
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
            <button onClick={() => navigator.clipboard.writeText(shareMessages[shareTab])}
              className="absolute top-3 right-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
              Copy {COPY_ICON}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
