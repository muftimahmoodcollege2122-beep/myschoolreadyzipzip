'use client';
import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';

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

function getPortalBaseUrl(port: number): string {
  if (typeof window === 'undefined') return `http://localhost:${port}`;
  const host = window.location.hostname;
  // Replit dev environment: hostname is like "3005-abc123.sisko.replit.dev"
  if (host.endsWith('.replit.dev') || host.endsWith('.repl.co')) {
    const baseDomain = host.replace(/^\d+-/, ''); // strip leading port prefix if present
    return `https://${port}-${baseDomain}`;
  }
  // Local development
  if (host === 'localhost' || host === '127.0.0.1') {
    return `http://localhost:${port}`;
  }
  // Production — caller should use slug-based URL
  return '';
}

export default function PortalLinksPage() {
  const user = useAuthStore(s => s.user) as any;
  const slug = user?.school?.slug || user?.tenantSlug || 'your-school';

  const currentBase = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : '';

  const devUrls = useMemo(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const isReplit  = hostname.endsWith('.replit.dev') || hostname.endsWith('.repl.co');
    const isLocal   = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isReplit) {
      const base = hostname.replace(/^\d+-/, '');
      return {
        web:     `https://${base}`,
        admin:   `https://8080-${base}`,
        teacher: `https://3002-${base}`,
        student: `https://3003-${base}`,
        parent:  `https://4200-${base}`,
      };
    }
    if (!isLocal) {
      // Railway or any single-domain production — all portals on same base URL
      return {
        web:     currentBase,
        admin:   currentBase,
        teacher: currentBase,
        student: currentBase,
        parent:  currentBase,
      };
    }
    return {
      web:     'http://localhost:5000',
      admin:   'http://localhost:8080',
      teacher: 'http://localhost:3002',
      student: 'http://localhost:3003',
      parent:  'http://localhost:4200',
    };
  }, [currentBase]);

  const hostname    = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isLocal     = hostname === 'localhost' || hostname === '127.0.0.1';
  const isReplit    = hostname.endsWith('.replit.dev') || hostname.endsWith('.repl.co');
  const isSingleDomain = !isLocal && !isReplit;

  const isProd = isSingleDomain && !devUrls.teacher.includes('localhost');

  const prodBase = `https://${slug}.myschool.pk`;

  const base = isSingleDomain ? currentBase : '';

  const PORTALS = [
    {
      icon:     '🌐',
      label:    'School Website',
      desc:     'Public-facing website for parents and prospective students',
      url:      isSingleDomain ? `${base}/s/${slug}` : devUrls.web,
      loginUrl: null,
      color:    'border-blue-200 bg-blue-50',
      badge:    'bg-blue-600',
    },
    {
      icon:     '🏫',
      label:    'Admin Dashboard',
      desc:     'Full control panel for school administrators',
      url:      isSingleDomain ? `${base}/dashboard` : `${devUrls.admin}/dashboard`,
      loginUrl: isSingleDomain ? `${base}/login?slug=${slug}` : `${devUrls.admin}/login?slug=${slug}`,
      color:    'border-indigo-200 bg-indigo-50',
      badge:    'bg-indigo-600',
    },
    {
      icon:     '👨\u200d🏫',
      label:    'Teacher Portal',
      desc:     'Mark attendance, enter grades, manage classes and apply for leave',
      url:      isSingleDomain ? `${base}/t/${slug}` : `${devUrls.teacher}/dashboard`,
      loginUrl: isSingleDomain ? `${base}/t/${slug}/login` : `${devUrls.teacher}/login`,
      color:    'border-teal-200 bg-teal-50',
      badge:    'bg-teal-600',
    },
    {
      icon:     '👩\u200d🎓',
      label:    'Student Portal',
      desc:     'View grades, attendance, timetable, LMS courses and fee status',
      url:      isSingleDomain ? `${base}/learn/${slug}` : `${devUrls.student}/dashboard`,
      loginUrl: isSingleDomain ? `${base}/learn/${slug}/login` : `${devUrls.student}/login`,
      color:    'border-violet-200 bg-violet-50',
      badge:    'bg-violet-600',
    },
    {
      icon:     '👨\u200d👩\u200d👧',
      label:    'Parent Portal',
      desc:     "Monitor your child's progress, attendance, fees and school notices",
      url:      isSingleDomain ? `${base}/parent/${slug}` : `${devUrls.parent}/dashboard`,
      loginUrl: isSingleDomain ? `${base}/parent/${slug}/login` : `${devUrls.parent}/login`,
      color:    'border-rose-200 bg-rose-50',
      badge:    'bg-rose-600',
    },
  ];

  const [shareTab, setShareTab] = useState<'sms' | 'email' | 'whatsapp'>('whatsapp');

  const teacherLogin = isSingleDomain ? `${currentBase}/t/${slug}/login`     : `${devUrls.teacher}/login`;
  const studentLogin = isSingleDomain ? `${currentBase}/learn/${slug}/login`  : `${devUrls.student}/login`;
  const parentLogin  = isSingleDomain ? `${currentBase}/parent/${slug}/login` : `${devUrls.parent}/login`;

  const shareMessages = {
    whatsapp: `Dear Parents/Students,\n\nWelcome to ${slug.replace(/-/g, ' ')} School Management Portal! 🎓\n\nYour dedicated portals are now live:\n\n👩‍🎓 Student Portal: ${studentLogin}\n👨‍👩‍👧 Parent Portal: ${parentLogin}\n\nLogin with the credentials shared by your school.\nPowered by EduOS`,
    sms: `Your school portals are live! Student: ${studentLogin} | Parent: ${parentLogin}`,
    email: `Subject: Your School Portal Access — ${slug.replace(/-/g, ' ')}\n\nDear [Name],\n\nYour school management portal is now ready. Please use the links below:\n\nTEACHER PORTAL: ${teacherLogin}\nSTUDENT PORTAL: ${studentLogin}\nPARENT PORTAL:  ${parentLogin}\n\nUse your registered email and the temporary password shared by your administrator.\n\nBest regards,\nSchool Administration`,
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Your School Portals</h1>
        <p className="text-gray-500 mt-1">Share these links with your teachers, students and parents to get them started.</p>
        {!isProd && (
          <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 w-fit">
            <span>🔧</span>
            <span><strong>Development mode</strong> — showing local preview URLs. Production URLs will use <code className="font-mono text-xs bg-amber-100 px-1 rounded">{slug}.myschool.pk</code></span>
          </div>
        )}
      </div>

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

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Share with Staff & Parents</h2>
          <p className="text-sm text-gray-500 mt-0.5">Ready-to-send messages for different channels</p>
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
