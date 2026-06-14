'use client';
import React, { useState, useEffect } from 'react';
import { Topbar } from '../../../../components/layout/topbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { useToast } from '../../../../components/shared/toast';

type PortalKey = 'teacher' | 'student' | 'parent' | 'website' | 'domain';

const TEACHER_FLAGS = [
  { key: 'attendance',   label: 'Attendance',    icon: '📝', desc: 'Mark & view class attendance' },
  { key: 'timetable',    label: 'Timetable',     icon: '📅', desc: 'Class schedule & periods' },
  { key: 'gradebook',    label: 'Gradebook',     icon: '📊', desc: 'Grade students & view results' },
  { key: 'assignments',  label: 'Assignments',   icon: '📋', desc: 'Create & manage assignments' },
  { key: 'exams',        label: 'Exams',         icon: '📝', desc: 'Exam management & results' },
  { key: 'lms',          label: 'LMS / Courses', icon: '📚', desc: 'Online courses & materials' },
  { key: 'lessonPlans',  label: 'Lesson Plans',  icon: '🗒️', desc: 'Create & share lesson plans' },
  { key: 'announcements',label: 'Announcements', icon: '📢', desc: 'Post school notices' },
  { key: 'students',     label: 'My Students',   icon: '👩‍🎓', desc: 'View enrolled students' },
  { key: 'resources',    label: 'Resources',     icon: '🗂️', desc: 'Learning materials & files' },
];

const STUDENT_FLAGS = [
  { key: 'timetable',    label: 'Timetable',     icon: '📅', desc: 'Class schedule' },
  { key: 'assignments',  label: 'Assignments',   icon: '📋', desc: 'View & submit assignments' },
  { key: 'grades',       label: 'Grades',        icon: '📊', desc: 'Academic grades' },
  { key: 'attendance',   label: 'Attendance',    icon: '✅', desc: 'Attendance record' },
  { key: 'fees',         label: 'Fee Status',    icon: '💰', desc: 'Fee invoices & payments' },
  { key: 'announcements',label: 'Announcements', icon: '📢', desc: 'School notices' },
  { key: 'library',      label: 'Library',       icon: '📖', desc: 'Book issues & returns' },
  { key: 'lms',          label: 'LMS / Courses', icon: '📚', desc: 'Online learning courses' },
  { key: 'resources',    label: 'Resources',     icon: '🗂️', desc: 'Study materials' },
  { key: 'results',      label: 'Results',       icon: '🏆', desc: 'Exam results & report cards' },
];

const PARENT_FLAGS = [
  { key: 'attendance',   label: 'Attendance',    icon: '✅', desc: "Child's attendance" },
  { key: 'grades',       label: 'Grades',        icon: '📊', desc: "Academic performance" },
  { key: 'fees',         label: 'Fees',          icon: '💰', desc: 'Fee status & payments' },
  { key: 'timetable',    label: 'Timetable',     icon: '📅', desc: "Child's class schedule" },
  { key: 'announcements',label: 'Announcements', icon: '📢', desc: 'School notices' },
  { key: 'assignments',  label: 'Assignments',   icon: '📋', desc: "Child's assignments" },
  { key: 'results',      label: 'Results',       icon: '🏆', desc: 'Exam results' },
  { key: 'transport',    label: 'Transport',     icon: '🚌', desc: 'Bus tracking & routes' },
];

const WEBSITE_SECTIONS = [
  { key: 'hero',         label: 'Hero Banner',   icon: '🎯' },
  { key: 'about',        label: 'About School',  icon: '🏫' },
  { key: 'stats',        label: 'Stats Counter', icon: '📊' },
  { key: 'gallery',      label: 'Gallery',       icon: '🖼️' },
  { key: 'events',       label: 'Events',        icon: '📅' },
  { key: 'admissions',   label: 'Admissions',    icon: '📝' },
  { key: 'staff',        label: 'Staff',         icon: '👥' },
  { key: 'testimonials', label: 'Testimonials',  icon: '💬' },
  { key: 'contact',      label: 'Contact',       icon: '📞' },
  { key: 'news',         label: 'News / Blog',   icon: '📰' },
];

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function FlagGrid({ flags, settings, onChange }: { flags: any[]; settings: Record<string, boolean>; onChange: (key: string, val: boolean) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {flags.map(f => (
        <div key={f.key} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${settings[f.key] ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{f.icon}</span>
            <div>
              <p className="font-semibold text-sm text-gray-800">{f.label}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          </div>
          <Toggle enabled={!!settings[f.key]} onChange={() => onChange(f.key, !settings[f.key])} />
        </div>
      ))}
    </div>
  );
}

export default function PortalControlsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<PortalKey>('website');
  const [saved, setSaved] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [domainMsg, setDomainMsg] = useState('');

  const { data: ps, isLoading } = useQuery({
    queryKey: ['portal-settings'],
    queryFn: () => apiClient.get('/themes/portal-settings'),
    staleTime: 60000,
  });

  const { data: domainData } = useQuery({
    queryKey: ['domain-info'],
    queryFn: () => apiClient.get('/themes/domain'),
    staleTime: 60000,
  });

  const [local, setLocal] = useState<any>(null);

  useEffect(() => { if (ps && !local) setLocal(ps); }, [ps]);
  useEffect(() => { if (domainData && !(domainData as any).customDomain === false) setDomainInput((domainData as any).customDomain || ''); }, [domainData]);

  const saveMut = useMutation({
    mutationFn: (dto: any) => apiClient.put('/themes/portal-settings', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['portal-settings'] }); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const domainMut = useMutation({
    mutationFn: (dto: any) => apiClient.put('/themes/domain', dto),
    onSuccess: (d: any) => {
      qc.invalidateQueries({ queryKey: ['domain-info'] });
      setDomainMsg(d.customDomain ? `Domain set to ${d.customDomain}` : 'Custom domain removed');
      setTimeout(() => setDomainMsg(''), 3000);
    },
  });

  const handleFlag = (portal: string, key: string, val: boolean) => {
    setLocal((prev: any) => ({ ...prev, [portal]: { ...prev[portal], [key]: val } }));
  };

  const handleWebsiteSection = (key: string, val: boolean) => handleFlag('website', key, val);

  const handleWebsiteContent = (key: string, val: string) => {
    setLocal((prev: any) => ({ ...prev, website: { ...prev.website, [key]: val } }));
  };

  if (isLoading || !local) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <Topbar title="Portal Controls" />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const TABS: { id: PortalKey; label: string; icon: string; color: string }[] = [
    { id: 'website',  label: 'School Website', icon: '🌐', color: 'blue'   },
    { id: 'teacher',  label: 'Teacher Portal', icon: '👨‍🏫', color: 'teal'   },
    { id: 'student',  label: 'Student Portal', icon: '👩‍🎓', color: 'violet' },
    { id: 'parent',   label: 'Parent Portal',  icon: '👨‍👩‍👧', color: 'rose'   },
    { id: 'domain',   label: 'Custom Domain',  icon: '🔗', color: 'amber'  },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Topbar title="Portal & Website Controls" />

      <div className="max-w-5xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Portal & Website Controls</h1>
          <p className="text-gray-500 mt-1">Control every feature visible in each portal and on your school website.</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {tab === 'teacher' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-xl">👨‍🏫</div>
                <div><h2 className="font-bold text-gray-900">Teacher Portal Features</h2><p className="text-sm text-gray-500">Toggle what teachers can see and access</p></div>
              </div>
              <FlagGrid flags={TEACHER_FLAGS} settings={local.teacher || {}} onChange={(k, v) => handleFlag('teacher', k, v)} />
            </>
          )}

          {tab === 'student' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">👩‍🎓</div>
                <div><h2 className="font-bold text-gray-900">Student Portal Features</h2><p className="text-sm text-gray-500">Toggle what students can see and access</p></div>
              </div>
              <FlagGrid flags={STUDENT_FLAGS} settings={local.student || {}} onChange={(k, v) => handleFlag('student', k, v)} />
            </>
          )}

          {tab === 'parent' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-xl">👨‍👩‍👧</div>
                <div><h2 className="font-bold text-gray-900">Parent Portal Features</h2><p className="text-sm text-gray-500">Toggle what parents can see and access</p></div>
              </div>
              <FlagGrid flags={PARENT_FLAGS} settings={local.parent || {}} onChange={(k, v) => handleFlag('parent', k, v)} />
            </>
          )}

          {tab === 'website' && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🌐</div>
                <div><h2 className="font-bold text-gray-900">School Website Sections</h2><p className="text-sm text-gray-500">Toggle sections and edit their content</p></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {WEBSITE_SECTIONS.map(s => (
                  <div key={s.key} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${local.website?.[s.key] ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                    </div>
                    <Toggle enabled={!!local.website?.[s.key]} onChange={() => handleWebsiteSection(s.key, !local.website?.[s.key])} />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-800 mb-4">✏️ Edit Website Content</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Hero Title</label>
                      <input value={local.website?.heroTitle || ''} onChange={e => handleWebsiteContent('heroTitle', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Hero CTA Button Text</label>
                      <input value={local.website?.heroCtaText || ''} onChange={e => handleWebsiteContent('heroCtaText', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Hero Subtitle</label>
                    <input value={local.website?.heroSubtitle || ''} onChange={e => handleWebsiteContent('heroSubtitle', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">About School Text</label>
                    <textarea rows={3} value={local.website?.aboutText || ''} onChange={e => handleWebsiteContent('aboutText', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { key: 'statsStudents', label: 'Students' },
                      { key: 'statsTeachers', label: 'Teachers' },
                      { key: 'statsYears',    label: 'Years' },
                      { key: 'statsPassRate', label: 'Pass Rate' },
                    ].map(s => (
                      <div key={s.key}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{s.label}</label>
                        <input value={local.website?.[s.key] || ''} onChange={e => handleWebsiteContent(s.key, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'domain' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🔗</div>
                <div><h2 className="font-bold text-gray-900">Custom Domain</h2><p className="text-sm text-gray-500">Point your own domain to this school website</p></div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-blue-800 mb-1">Current subdomain (always works)</p>
                <code className="text-blue-700 text-sm bg-white px-3 py-1 rounded-lg border border-blue-200">
                  {(domainData as any)?.slug || 'your-school'}.myschool.pk
                </code>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Custom Domain</label>
                  <div className="flex gap-3">
                    <input
                      value={domainInput}
                      onChange={e => setDomainInput(e.target.value)}
                      placeholder="www.myschool.edu.pk"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button onClick={() => domainMut.mutate({ customDomain: domainInput || null })}
                      disabled={domainMut.isPending}
                      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition-colors">
                      {domainMut.isPending ? 'Saving...' : 'Save Domain'}
                    </button>
                    {domainInput && (
                      <button onClick={() => { setDomainInput(''); domainMut.mutate({ customDomain: null }); }}
                        className="px-5 py-3 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold rounded-xl text-sm transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                  {domainMsg && <p className="text-sm text-green-600 mt-2 font-medium">✅ {domainMsg}</p>}
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="font-semibold text-gray-800 mb-3">📋 DNS Setup Instructions</p>
                  <p className="text-sm text-gray-600 mb-3">Add these DNS records at your domain registrar (GoDaddy, Namecheap, etc.):</p>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg border p-3 font-mono text-xs">
                      <span className="text-gray-500">Type:</span> <span className="text-blue-700 font-bold">CNAME</span>
                      {'  '}
                      <span className="text-gray-500">Name:</span> <span className="text-green-700 font-bold">www</span>
                      {'  '}
                      <span className="text-gray-500">Value:</span> <span className="text-purple-700 font-bold">app.myschool.pk</span>
                    </div>
                    <div className="bg-white rounded-lg border p-3 font-mono text-xs">
                      <span className="text-gray-500">Type:</span> <span className="text-blue-700 font-bold">A</span>
                      {'      '}
                      <span className="text-gray-500">Name:</span> <span className="text-green-700 font-bold">@</span>
                      {'   '}
                      <span className="text-gray-500">Value:</span> <span className="text-purple-700 font-bold">your-server-ip</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">DNS changes take 24-48 hours to propagate globally.</p>
                </div>
              </div>
            </>
          )}

          {tab !== 'domain' && (
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => saveMut.mutate(local)}
                disabled={saveMut.isPending}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md text-sm disabled:opacity-50 transition-all">
                {saveMut.isPending ? 'Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
