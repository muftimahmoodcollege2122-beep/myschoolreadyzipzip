'use client';
import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { useSchoolInfo, useWebsiteSettings, useSaveWebsiteSettings } from '@/hooks/use-api';

const COMPONENTS = [
  { icon: '🦸', label: 'Hero Section', desc: 'Eye-catching banner with CTA' },
  { icon: '📋', label: 'About Us', desc: 'School mission & vision' },
  { icon: '🏆', label: 'Features', desc: 'Key school highlights' },
  { icon: '🖼️', label: 'Photo Gallery', desc: 'Image grid & slider' },
  { icon: '👥', label: 'Our Staff', desc: 'Teacher profiles grid' },
  { icon: '📋', label: 'Admissions', desc: 'Enrollment form & info' },
  { icon: '🎉', label: 'Events', desc: 'Upcoming school events' },
  { icon: '📊', label: 'Statistics', desc: 'Achievement counters' },
  { icon: '💬', label: 'Testimonials', desc: 'Parent & student reviews' },
  { icon: '📞', label: 'Contact', desc: 'Map, phone & inquiry form' },
  { icon: '🔗', label: 'Footer', desc: 'Links & social media' },
  { icon: '📢', label: 'News Ticker', desc: 'Scrolling announcements' },
];

const THEMES = [
  { name: 'Academic Blue', primary: '#2563EB', secondary: '#0F172A', preview: 'bg-blue-600' },
  { name: 'Forest Green', primary: '#16A34A', secondary: '#14532D', preview: 'bg-green-600' },
  { name: 'Royal Purple', primary: '#7C3AED', secondary: '#1E1B4B', preview: 'bg-purple-600' },
  { name: 'Sunset Orange', primary: '#EA580C', secondary: '#431407', preview: 'bg-orange-600' },
];

const PAGES_BUILT = [
  { name: 'Home', status: 'Published', components: 7, lastEdit: '2 days ago' },
  { name: 'About Us', status: 'Published', components: 4, lastEdit: '1 week ago' },
  { name: 'Admissions', status: 'Draft', components: 3, lastEdit: '3 days ago' },
  { name: 'Contact', status: 'Published', components: 2, lastEdit: '5 days ago' },
  { name: 'Faculty', status: 'Draft', components: 2, lastEdit: '1 day ago' },
];

const DEFAULT_COMPONENTS = ['Hero Section', 'About Us', 'Statistics', 'Events', 'Contact'];

export default function WebsiteBuilderPage() {
  const [view, setView] = useState<'builder'|'pages'|'settings'>('builder');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [addedComponents, setAddedComponents] = useState(DEFAULT_COMPONENTS);
  const [publishStatus, setPublishStatus] = useState<'idle'|'saving'|'saved'>('idle');

  const { data: schoolInfo } = useSchoolInfo();
  const { data: websiteData } = useWebsiteSettings();
  const saveSettings = useSaveWebsiteSettings();
  const school = schoolInfo as any;
  const wsData = websiteData as any;

  useEffect(() => {
    if (!wsData) return;
    if (wsData.theme !== undefined) setSelectedTheme(wsData.theme);
    if (wsData.components) setAddedComponents(wsData.components);
  }, [wsData]);

  const toggleComponent = (label: string) => {
    setAddedComponents(prev => prev.includes(label) ? prev.filter(c=>c!==label) : [...prev, label]);
  };

  const COMPONENT_TO_SECTION: Record<string, string> = {
    'Hero Section': 'hero',
    'About Us': 'about',
    'Statistics': 'stats',
    'Events': 'events',
    'Contact': 'contact',
    'Gallery': 'gallery',
    'Admissions': 'admissions',
    'Staff': 'staff',
    'Testimonials': 'testimonials',
    'News': 'news',
  };

  const handlePublish = async () => {
    setPublishStatus('saving');
    try {
      const theme = THEMES[selectedTheme];
      // Build the sections object the public site expects: { hero: true, about: true, ... }
      const sectionFlags: Record<string, boolean> = {};
      Object.values(COMPONENT_TO_SECTION).forEach(key => { sectionFlags[key] = false; });
      addedComponents.forEach(label => {
        const key = COMPONENT_TO_SECTION[label];
        if (key) sectionFlags[key] = true;
      });

      await saveSettings.mutateAsync({
        theme: {
          primaryColor: theme.primary,
          secondaryColor: theme.secondary,
        },
        components: sectionFlags,
        publishedAt: new Date().toISOString(),
      });
      setPublishStatus('saved');
      setTimeout(() => setPublishStatus('idle'), 3000);
    } catch {
      setPublishStatus('idle');
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <>
      <Topbar title="Website Builder" subtitle="Build your school's public website" />
      <div className="p-6">
        <PageHeader
          title="Website Builder"
          subtitle="Design and publish your school website — no coding required"
          action={
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                👁️ Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={publishStatus === 'saving'}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors disabled:opacity-60 ${publishStatus==='saved'?'bg-green-100 text-green-700 border border-green-200':'bg-green-600 text-white hover:bg-green-500'}`}
              >
                {publishStatus==='saving' ? '⏳ Saving…' : publishStatus==='saved' ? '✅ Published!' : '🌐 Publish'}
              </button>
            </div>
          }
        />

        {/* Status Bar */}
        <div className="flex items-center gap-4 mb-5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <p className="text-sm text-green-800 font-medium">Website is <strong>Live</strong> at <span className="font-mono text-blue-700 hover:underline cursor-pointer">demo.myschool.pk</span></p>
          {wsData?.publishedAt && <span className="text-xs text-gray-400">Last published: {new Date(wsData.publishedAt).toLocaleDateString()}</span>}
          <span className="ml-auto"/>
          <button className="px-3 py-1.5 text-xs bg-green-100 text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-200">🌐 Open Site</button>
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['builder','pages','settings'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {v==='builder'?'🎨 Page Builder':v==='pages'?'📄 Pages':'⚙️ Settings'}
            </button>
          ))}
        </div>

        {view === 'builder' && (
          <div className="grid grid-cols-12 gap-5">
            {/* Component Palette */}
            <div className="col-span-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Components</p>
              <div className="space-y-1.5">
                {COMPONENTS.map(c=>(
                  <div key={c.label} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${addedComponents.includes(c.label)?'bg-blue-50 border-blue-200':'bg-white border-gray-100 hover:border-blue-200'}`}
                    onClick={()=>toggleComponent(c.label)}>
                    <span className="text-lg">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs">{c.label}</p>
                      <p className="text-gray-400 text-[10px]">{c.desc}</p>
                    </div>
                    {addedComponents.includes(c.label)?<span className="text-blue-500 text-xs font-bold flex-shrink-0">✓</span>:<span className="text-gray-300 text-xs flex-shrink-0">+</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="col-span-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</p>
                <div className="flex gap-1">
                  {['💻','📱'].map((d,i)=><button key={i} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50 transition-colors">{d}</button>)}
                </div>
              </div>
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg" style={{minHeight:500}}>
                <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"/><div className="w-2.5 h-2.5 rounded-full bg-green-400"/></div>
                  <div className="flex-1 mx-2 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200">demo.myschool.pk</div>
                </div>
                <div className="overflow-y-auto max-h-[520px]">
                  {addedComponents.includes('Hero Section') && (
                    <div className="py-10 px-6 text-center" style={{background:`linear-gradient(135deg, ${THEMES[selectedTheme].primary}, ${THEMES[selectedTheme].secondary})`}}>
                      <p className="text-white/60 text-xs font-medium mb-2">{school?.name ?? 'MySchool Academy'}</p>
                      <h1 className="text-white font-black text-2xl mb-3">Shaping Future Leaders</h1>
                      <p className="text-white/70 text-sm mb-5">Excellence in Education Since 1995</p>
                      <div className="flex gap-2 justify-center">
                        <button className="px-4 py-2 bg-white text-sm font-bold rounded-lg" style={{color:THEMES[selectedTheme].primary}}>Apply Now</button>
                        <button className="px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-lg border border-white/30">Learn More</button>
                      </div>
                    </div>
                  )}
                  {addedComponents.includes('Statistics') && (
                    <div className="grid grid-cols-4 py-4 px-6 bg-gray-50 border-b border-gray-100">
                      {[{v:'2,500+',l:'Students'},{v:'120+',l:'Teachers'},{v:'30+',l:'Years'},{v:'98%',l:'Pass Rate'}].map(s=>(
                        <div key={s.l} className="text-center"><p className="font-black text-gray-900 text-xl">{s.v}</p><p className="text-gray-400 text-xs">{s.l}</p></div>
                      ))}
                    </div>
                  )}
                  {addedComponents.includes('About Us') && (
                    <div className="px-6 py-5">
                      <h2 className="font-black text-lg text-gray-900 mb-2">About Our School</h2>
                      <p className="text-gray-500 text-xs leading-relaxed">Founded in 1995, we are committed to providing quality education that nurtures intellectual growth, character development, and holistic learning experiences for every student.</p>
                    </div>
                  )}
                  {addedComponents.includes('Events') && (
                    <div className="px-6 py-5 bg-gray-50">
                      <h2 className="font-black text-lg text-gray-900 mb-3">Upcoming Events</h2>
                      <div className="space-y-2">
                        {[{t:'Annual Sports Day',d:'Jun 15'},{t:'Parent-Teacher Meeting',d:'Jun 20'},{t:'Science Exhibition',d:'Jun 28'}].map(e=>(
                          <div key={e.t} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-100">
                            <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center text-white font-black text-xs" style={{background:THEMES[selectedTheme].primary}}>
                              <span className="text-[9px]">JUN</span><span>{e.d.split(' ')[1]}</span>
                            </div>
                            <p className="text-xs font-semibold text-gray-800">{e.t}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {addedComponents.includes('Contact') && (
                    <div className="px-6 py-5">
                      <h2 className="font-black text-lg text-gray-900 mb-2">Contact Us</h2>
                      <div className="space-y-1.5 text-xs text-gray-500">
                        <p>📍 {(school?.address as any)?.street ?? '123 School Street'}, {(school?.address as any)?.city ?? 'Karachi'}, Pakistan</p>
                        <p>📞 {school?.phone ?? '+92-21-1234567'}</p>
                        <p>📧 {school?.email ?? 'info@demo.myschool.pk'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="col-span-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Settings</p>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Color Theme</p>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((t,i)=>(
                      <button key={t.name} onClick={()=>setSelectedTheme(i)} className={`p-2 rounded-xl border-2 transition-all ${selectedTheme===i?'border-blue-500':'border-gray-100 hover:border-gray-300'}`}>
                        <div className={`w-full h-5 rounded-lg mb-1 ${t.preview}`}/>
                        <p className="text-[10px] font-medium text-gray-600">{t.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Active Sections ({addedComponents.length})</p>
                  <div className="space-y-1">
                    {addedComponents.map(c=>(
                      <div key={c} className="flex items-center justify-between px-2 py-1.5 bg-blue-50 rounded-lg">
                        <span className="text-xs font-medium text-blue-800">{c}</span>
                        <button onClick={()=>toggleComponent(c)} className="text-blue-400 hover:text-red-500 text-xs transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">SEO Settings</p>
                  <div className="space-y-2">
                    <input placeholder="Page Title" defaultValue={`Home — ${school?.name ?? 'MySchool Academy'}`} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400"/>
                    <textarea placeholder="Meta Description" defaultValue="Quality education since 1995" rows={2} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400 resize-none"/>
                  </div>
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishStatus === 'saving'}
                  className={`w-full py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-60 ${publishStatus==='saved'?'bg-green-100 text-green-700 border border-green-200':'bg-green-600 text-white hover:bg-green-500'}`}
                >
                  {publishStatus==='saving' ? '⏳ Saving…' : publishStatus==='saved' ? '✅ Saved!' : '🌐 Publish Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'pages' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Website Pages</h3>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100">+ New Page</button>
            </div>
            <div className="divide-y divide-gray-50">
              {PAGES_BUILT.map(p=>(
                <div key={p.name} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600 text-sm">📄</div>
                    <div><p className="font-semibold text-sm text-gray-900">{p.name}</p><p className="text-xs text-gray-400">{p.components} components · {p.lastEdit}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={p.status==='Published'?'green':'yellow'}>{p.status}</Badge>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg font-semibold hover:bg-blue-100">Edit</button>
                      <button className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Preview</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Domain Settings</h3>
              <div className="space-y-3">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subdomain</label>
                  <div className="flex items-center gap-1"><input defaultValue="demo" className="px-3 py-2 border border-gray-200 rounded-l-xl text-sm outline-none focus:border-blue-400 flex-1"/><span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl text-sm text-gray-500">.myschool.pk</span></div></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Domain</label>
                  <input placeholder="www.yourdomain.com" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                <div className="flex items-center gap-2 text-sm"><span className="text-green-500">✓</span><span className="text-gray-600">SSL Certificate Active</span><Badge variant="green">Secure</Badge></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Integrations</h3>
              <div className="space-y-3">
                {[{name:'Google Analytics',status:'Connected',icon:'📊'},{name:'Facebook Pixel',status:'Disconnected',icon:'📘'},{name:'WhatsApp Chat',status:'Connected',icon:'💬'},{name:'Google Maps',status:'Connected',icon:'🗺️'}].map(i=>(
                  <div key={i.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2"><span>{i.icon}</span><span className="text-sm font-medium text-gray-700">{i.name}</span></div>
                    <Badge variant={i.status==='Connected'?'green':'gray'}>{i.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
