'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';
import { useSchoolInfo, useUpdateSchoolInfo } from '../../../hooks/use-api';

const TABS = [
  { id:'profile', label:'School Profile', icon:'🏫' },
  { id:'branding', label:'Branding', icon:'🎨' },
  { id:'academic', label:'Academic Year', icon:'📅' },
  { id:'integrations', label:'Integrations', icon:'🔗' },
  { id:'payments', label:'Payment Gateways', icon:'💳' },
  { id:'sms', label:'SMS Settings', icon:'📱' },
  { id:'email', label:'Email Settings', icon:'📧' },
  { id:'roles', label:'Roles & Permissions', icon:'🔐' },
  { id:'billing', label:'Billing', icon:'💰' },
  { id:'security', label:'Security', icon:'🛡️' },
  { id:'backup', label:'Backup & Restore', icon:'💾' },
] as const;
type TabId = typeof TABS[number]['id'];

const ROLES = [
  { name:'Super Admin', users:1, permissions:['All permissions'], color:'bg-red-100 text-red-700' },
  { name:'School Admin', users:3, permissions:['Manage students','Manage staff','View reports','Manage fees','Settings'], color:'bg-blue-100 text-blue-700' },
  { name:'Teacher', users:42, permissions:['Take attendance','Grade students','View timetable','LMS access'], color:'bg-green-100 text-green-700' },
  { name:'Accountant', users:2, permissions:['Manage fees','View reports','Generate invoices'], color:'bg-purple-100 text-purple-700' },
  { name:'Student', users:2847, permissions:['View grades','View timetable','LMS access'], color:'bg-yellow-100 text-yellow-700' },
  { name:'Parent', users:5200, permissions:['View child progress','Chat with teacher','Pay fees'], color:'bg-orange-100 text-orange-700' },
];

const INTEGRATIONS = [
  { name:'WhatsApp Business', icon:'💬', status:'Connected', category:'Communication' },
  { name:'Google Analytics', icon:'📊', status:'Connected', category:'Analytics' },
  { name:'Stripe', icon:'💳', status:'Disconnected', category:'Payments' },
  { name:'Twilio SMS', icon:'📱', status:'Connected', category:'Communication' },
  { name:'SendGrid Email', icon:'📧', status:'Connected', category:'Email' },
  { name:'Google Workspace', icon:'🔵', status:'Disconnected', category:'Productivity' },
  { name:'Zoom', icon:'🎥', status:'Disconnected', category:'Video' },
  { name:'QuickBooks', icon:'📒', status:'Disconnected', category:'Accounting' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>('profile');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [logoText, setLogoText] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '', phone: '', email: '', website: '',
    principalName: '', registrationNo: '', city: '', address: '', academicYear: '',
  });

  const { data: schoolData, isLoading: schoolLoading } = useSchoolInfo();
  const updateSchool = useUpdateSchoolInfo();
  const school = schoolData as any;

  useEffect(() => {
    if (!school) return;
    const addr = school.address as any || {};
    const sett = school.settings as any || {};
    setProfile({
      name: school.name ?? '',
      phone: school.phone ?? '',
      email: school.email ?? '',
      website: school.website ?? '',
      principalName: sett.profile?.principalName ?? '',
      registrationNo: sett.profile?.registrationNo ?? '',
      city: addr.city ?? sett.profile?.city ?? '',
      address: addr.street ?? '',
      academicYear: school.academicYear ?? '',
    });
    setLogoText(school.name ?? '');
  }, [school]);

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile(p => ({ ...p, [k]: e.target.value }));

  const saveProfile = async () => {
    setSaveErr('');
    try {
      await updateSchool.mutateAsync(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setSaveErr(e?.response?.data?.message ?? 'Failed to save. Please try again.');
    }
  };

  const downloadBackup = async () => {
    setBackupLoading(true);
    try {
      const { apiClient } = await import('../../../lib/api-client');
      const data = await apiClient.get('/school/backup');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Backup failed. Please try again.');
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Settings" subtitle="School configuration & preferences" />
      <div className="p-6">
        <PageHeader title="Settings & Configuration" subtitle="Manage your school's settings, integrations, and preferences" />
        {saved && <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold text-green-700">✅ Settings saved successfully!</div>}
        {saveErr && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{saveErr}</div>}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${tab===t.id?'bg-blue-600 text-white shadow-sm':'text-gray-600 hover:bg-gray-50'}`}>
                  <span>{t.icon}</span><span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* School Profile — wired to real API */}
              {tab==='profile' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">School Profile</h3>
                  {schoolLoading ? (
                    <div className="space-y-3">{[...Array(6)].map((_,i)=><div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
                  ) : (
                    <>
                      <div className="flex items-start gap-5 mb-5">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl flex-shrink-0">
                          {(profile.name || 'M')[0].toUpperCase()}
                        </div>
                        <div><p className="font-semibold text-gray-900 mb-1">School Logo</p><p className="text-xs text-gray-400 mb-2">PNG or JPG, recommended 200×200px</p><button className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Upload Logo</button></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">School Name *</label><input value={profile.name} onChange={setField('name')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Registration No.</label><input value={profile.registrationNo} onChange={setField('registrationNo')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Principal Name</label><input value={profile.principalName} onChange={setField('principalName')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contact Email</label><input type="email" value={profile.email} onChange={setField('email')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone</label><input value={profile.phone} onChange={setField('phone')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">City</label><input value={profile.city} onChange={setField('city')} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Website</label><input value={profile.website} onChange={setField('website')} placeholder="https://" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                        <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Academic Year</label><input value={profile.academicYear} onChange={setField('academicYear')} placeholder="2025-2026" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                      </div>
                      <div className="mb-5"><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Address</label>
                        <textarea value={profile.address} onChange={setField('address')} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"/></div>
                      <button onClick={saveProfile} disabled={updateSchool.isPending} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 disabled:opacity-60">
                        {updateSchool.isPending ? 'Saving…' : 'Save Profile'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Branding */}
              {tab==='branding' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">🎨 Branding & Theme</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"/>
                          <input value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-blue-400"/>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Font Family</label>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                          <option>Inter (Default)</option><option>Poppins</option><option>Roboto</option><option>Open Sans</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">School Display Name</label>
                        <input value={logoText} onChange={e=>setLogoText(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Live Preview</p>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 p-2 rounded-xl" style={{background:primaryColor+'20',border:`1px solid ${primaryColor}40`}}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{background:primaryColor}}>{(logoText||'M')[0]}</div>
                          <span className="font-bold text-sm" style={{color:primaryColor}}>{logoText||school?.name||'MySchool'}</span>
                        </div>
                        <button className="w-full py-2 rounded-xl text-white text-sm font-bold mb-2" style={{background:primaryColor}}>Primary Button</button>
                        <div className="p-3 rounded-xl border" style={{borderColor:primaryColor+'40',background:primaryColor+'10'}}>
                          <p className="text-xs font-semibold" style={{color:primaryColor}}>Card with theme color</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="mt-5 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">Apply Theme</button>
                </div>
              )}

              {/* Academic Year */}
              {tab==='academic' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">📅 Academic Year Settings</h3>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[['Academic Year','2025-2026'],['Session Start','April 1, 2025'],['Session End','March 31, 2026'],['Working Days','Mon-Sat']].map(([l,v])=>(
                      <div key={l}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{l}</label><input defaultValue={v} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                    <p className="font-bold text-blue-800 mb-2">Grading Scale</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[['A+','90-100'],['A','80-89'],['B','70-79'],['C','60-69'],['F','<60']].map(([g,r])=>(
                        <div key={g} className="text-center bg-white rounded-lg p-2 border border-blue-100">
                          <p className="font-black text-blue-700">{g}</p><p className="text-xs text-gray-400">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 mb-5">
                    {['Promotion system enabled','Auto-generate report cards','Allow grade appeals','Lock grades after 7 days'].map(o=>(
                      <label key={o} className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-6 bg-blue-600 rounded-full relative flex-shrink-0"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow"/></div>
                        <span className="text-sm text-gray-700">{o}</span>
                      </label>
                    ))}
                  </div>
                  <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">Save Settings</button>
                </div>
              )}

              {/* Integrations */}
              {tab==='integrations' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">🔗 Third-Party Integrations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {INTEGRATIONS.map(i=>(
                      <div key={i.name} className="border border-gray-100 rounded-2xl p-4 hover:border-blue-200 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{i.icon}</span>
                            <div><p className="font-bold text-sm text-gray-900">{i.name}</p><p className="text-xs text-gray-400">{i.category}</p></div>
                          </div>
                          <Badge variant={i.status==='Connected'?'green':'gray'}>{i.status}</Badge>
                        </div>
                        <button className={`w-full py-2 text-xs font-bold rounded-xl transition-colors ${i.status==='Connected'?'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100':'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}`}>
                          {i.status==='Connected'?'Disconnect':'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Gateways */}
              {tab==='payments' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">💳 Payment Gateways</h3>
                  <div className="space-y-4">
                    {[
                      { name:'Stripe', icon:'💳', color:'bg-blue-50', status:'Not Configured', fields:['Publishable Key','Secret Key'] },
                      { name:'JazzCash', icon:'🟠', color:'bg-orange-50', status:'Active', fields:['Merchant ID','Password','Integrity Salt'] },
                      { name:'EasyPaisa', icon:'🟢', color:'bg-green-50', status:'Active', fields:['Store ID','Account Number'] },
                      { name:'Bank Transfer', icon:'🏦', color:'bg-gray-50', status:'Active', fields:['Bank Name','Account Title','Account No.','IBAN'] },
                    ].map(g=>(
                      <div key={g.name} className={`${g.color} border border-gray-100 rounded-2xl p-5`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2"><span className="text-2xl">{g.icon}</span><p className="font-bold text-gray-900">{g.name}</p></div>
                          <Badge variant={g.status==='Active'?'green':'gray'}>{g.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {g.fields.map(f=>(
                            <div key={f}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{f}</label>
                              <input type={f.toLowerCase().includes('key')||f.toLowerCase().includes('salt')||f.toLowerCase().includes('password')?'password':'text'} placeholder={`Enter ${f}`} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white"/></div>
                          ))}
                        </div>
                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">Save Config</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SMS */}
              {tab==='sms' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">📱 SMS Configuration</h3>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                    <div className="flex items-center justify-between"><div><p className="font-bold text-green-800">Twilio SMS</p><p className="text-green-600 text-xs">Connected · 1,500 credits remaining</p></div><Badge variant="green">Active</Badge></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[['Account SID',''],['Auth Token',''],['Sender Number','+1234567890'],['SMS Credits','1500']].map(([l,v])=>(
                      <div key={l}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{l}</label><input defaultValue={v} type={l.includes('Token')?'password':'text'} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                    ))}
                  </div>
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Auto SMS Triggers</p>
                    <div className="space-y-2">
                      {['Fee due reminder (3 days before)','Fee overdue alert','Student marked absent','Exam result published','New announcement'].map(t=>(
                        <label key={t} className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-6 bg-green-500 rounded-full relative flex-shrink-0"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow"/></div>
                          <span className="text-sm text-gray-700">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">Save SMS Settings</button>
                </div>
              )}

              {/* Email */}
              {tab==='email' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">📧 Email Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[['SMTP Host','smtp.sendgrid.net'],['SMTP Port','587'],['Username','apikey'],['From Name','MySchool Academy'],['From Email','noreply@myschool.edu.pk'],['Encryption','TLS']].map(([l,v])=>(
                      <div key={l}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{l}</label><input defaultValue={v} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                    ))}
                  </div>
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Auto Email Triggers</p>
                    <div className="space-y-2">
                      {['Welcome email on student registration','Fee receipt after payment','Monthly report card','Exam schedule notification','New announcement'].map(t=>(
                        <label key={t} className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-6 bg-blue-500 rounded-full relative flex-shrink-0"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow"/></div>
                          <span className="text-sm text-gray-700">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">Test & Save</button>
                </div>
              )}

              {/* Roles & Permissions */}
              {tab==='roles' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">🔐 Roles & Permissions</h3>
                  <div className="space-y-4">
                    {ROLES.map(r=>(
                      <div key={r.name} className="border border-gray-100 rounded-2xl p-5 hover:border-blue-200 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${r.color}`}>{r.name}</span>
                            <span className="text-sm text-gray-500">{r.users.toLocaleString()} users</span>
                          </div>
                          <button className="text-xs text-blue-600 font-semibold hover:text-blue-800">Edit Permissions</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.permissions.map(p=>(
                            <span key={p} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">{p}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 text-sm font-bold rounded-xl hover:bg-blue-100">+ Create Custom Role</button>
                </div>
              )}

              {/* Billing */}
              {tab==='billing' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">💰 Billing & Subscription</h3>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 mb-5 text-white">
                    <p className="text-white/70 text-sm">Current Plan</p>
                    <p className="text-3xl font-black">Growth Plan</p>
                    <p className="text-white/80 text-sm mt-1">Rs. 12,999/month · Renews July 1, 2026</p>
                    <div className="flex gap-3 mt-4"><button className="px-4 py-2 bg-white text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-50">Upgrade to Pro</button><button className="px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30">Manage Billing</button></div>
                  </div>
                  <div className="border border-gray-100 rounded-2xl p-5">
                    <p className="font-bold text-gray-900 mb-3">Usage This Month</p>
                    {[{l:'Students',v:1842,max:2000},{l:'Staff',v:48,max:100},{l:'Storage',v:12,max:50}].map(u=>(
                      <div key={u.l} className="mb-3">
                        <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{u.l}</span><span className="text-gray-600 font-bold">{u.v}/{u.max}</span></div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(u.v/u.max)>0.8?'bg-red-500':(u.v/u.max)>0.6?'bg-yellow-500':'bg-blue-500'}`} style={{width:`${(u.v/u.max)*100}%`}}/></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security */}
              {tab==='security' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">🛡️ Security Settings</h3>
                  <div className="space-y-3 mb-5">
                    {[
                      ['Change Password','Update your login password','Change'],
                      ['Two-Factor Authentication','2FA adds extra security layer','Enable 2FA'],
                      ['Active Sessions','Manage all logged-in devices','View Sessions'],
                      ['Login History','View recent login activity','View History'],
                      ['API Keys','Manage API access tokens','Manage Keys'],
                    ].map(([t,d,a])=>(
                      <div key={t as string} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div><p className="font-semibold text-sm text-gray-800">{t}</p><p className="text-xs text-gray-400 mt-0.5">{d}</p></div>
                        <button className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl hover:bg-white transition-colors">{a}</button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="font-bold text-yellow-800 text-sm">⚠️ Danger Zone</p>
                    <p className="text-yellow-600 text-xs mt-1 mb-3">These actions are irreversible. Proceed with caution.</p>
                    <button className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-100">Delete School Account</button>
                  </div>
                </div>
              )}

              {/* Backup & Restore */}
              {tab==='backup' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">💾 Backup & Restore</h3>
                  <p className="text-sm text-gray-500 mb-6">Export all your school data as a JSON file, or restore from a previous backup.</p>

                  <div className="border border-green-200 bg-green-50 rounded-2xl p-5 mb-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">📦</div>
                      <div>
                        <p className="font-bold text-green-900">Full Data Export</p>
                        <p className="text-xs text-green-600">Students, teachers, classes, subjects, sections, announcements, events</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-700 mb-4">The backup file includes all your school data in JSON format. Keep it safe — it can be used to restore your data.</p>
                    <button
                      onClick={downloadBackup}
                      disabled={backupLoading}
                      className="px-5 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {backupLoading ? '⏳ Generating…' : '⬇️ Download Backup'}
                    </button>
                  </div>

                  <div className="border border-blue-200 bg-blue-50 rounded-2xl p-5 mb-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
                      <div>
                        <p className="font-bold text-blue-900">What&apos;s included in the backup</p>
                        <p className="text-xs text-blue-600">All core school data</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['👨‍🎓 Students','👨‍🏫 Teachers','🏫 Classes','📚 Subjects','📋 Sections','📢 Announcements','🎉 Events','🏫 School Profile','⚙️ Settings'].map(item=>(
                        <div key={item} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-100">
                          <span className="text-xs text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-orange-200 bg-orange-50 rounded-2xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">📤</div>
                      <div>
                        <p className="font-bold text-orange-900">Restore from Backup</p>
                        <p className="text-xs text-orange-600">Upload a previously exported JSON backup file</p>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 text-center bg-white">
                      <p className="text-2xl mb-2">📁</p>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Drop your backup file here</p>
                      <p className="text-xs text-gray-400 mb-3">or click to browse — .json files only</p>
                      <button className="px-4 py-2 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200 hover:bg-orange-200">Browse File</button>
                    </div>
                    <p className="text-xs text-orange-600 mt-3">⚠️ Restoring will overwrite existing data. Make sure to backup first.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
