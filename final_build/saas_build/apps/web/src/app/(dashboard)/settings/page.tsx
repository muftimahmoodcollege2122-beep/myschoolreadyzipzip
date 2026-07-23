'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Topbar } from '@/components/layout/topbar';
import { Badge } from '@/components/shared/badge';
import { useSchoolInfo, useUpdateSchoolInfo } from '@/hooks/use-api';
import {
  usePaymentGatewaySettings, useUpdatePaymentGatewaySettings,
  useNotificationSettings, useUpdateNotificationSettings,
  useBillingSubscription, useBillingCheckout, useBillingPortal, useSchoolStats, useRolesOverview,
  useCurrentTenant, useUpdateBranding, useUploadLogo,
  useSecurityDashboard, useLoginHistory, useSetupMfa, useEnableMfa, useDisableMfa,
} from '@/hooks/use-api';

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
  const [logoUrl, setLogoUrl] = useState('');
  const { data: tenantData, isLoading: tenantLoading } = useCurrentTenant();
  const updateBranding = useUpdateBranding();
  const uploadLogo = useUploadLogo();
  useEffect(() => {
    const t = tenantData as any;
    if (t) {
      setLogoText(prev => prev || t.name || '');
      setLogoUrl(prev => prev || t.logoUrl || '');
      setPrimaryColor(prev => (t.primaryColor && prev === '#2563EB') ? t.primaryColor : prev);
    }
  }, [tenantData]);
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

  // Payment Gateways
  const { data: gatewayData, isLoading: gatewaysLoading } = usePaymentGatewaySettings();
  const updateGateway = useUpdatePaymentGatewaySettings();
  const [gatewayForms, setGatewayForms] = useState<Record<string, Record<string, string>>>({});
  const [gatewaySaved, setGatewaySaved] = useState<string>('');

  // Notification Settings (SMS / Email)
  const { data: notifData, isLoading: notifLoading } = useNotificationSettings();
  const updateNotif = useUpdateNotificationSettings();
  const [smsForm, setSmsForm] = useState<any>(null);
  const [emailForm, setEmailForm] = useState<any>(null);
  useEffect(() => { if (notifData) { setSmsForm((notifData as any).sms); setEmailForm((notifData as any).email); } }, [notifData]);

  // Billing
  const { data: subData, isLoading: subLoading } = useBillingSubscription();
  const checkout = useBillingCheckout();
  const portal = useBillingPortal();
  const { data: schoolStats } = useSchoolStats();
  const { data: rolesData, isLoading: rolesLoading } = useRolesOverview();

  // Security
  const { data: secDashboard } = useSecurityDashboard();
  const { data: loginHistory } = useLoginHistory({ limit: 5 });
  const setupMfa = useSetupMfa();
  const enableMfa = useEnableMfa();
  const [mfaStep, setMfaStep] = useState<'idle'|'setup'|'verify'>('idle');
  const [mfaSecret, setMfaSecret] = useState<{ secret?: string; qrCodeUrl?: string; backupCodes?: string[] }>({});
  const [mfaToken, setMfaToken] = useState('');

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
                  {tenantLoading ? <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"/> : (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">School Display Name</label>
                        <input value={logoText} onChange={e=>setLogoText(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
                        <p className="text-xs text-gray-400 mt-1">Shown on your public website header and browser tab.</p>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo</label>
                        <div className="flex items-center gap-3 mb-2">
                          <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors">
                            {uploadLogo.isPending ? 'Uploading…' : '📁 Upload from device'}
                            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploadLogo.isPending}
                              onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo.mutate(f, { onSuccess: res => setLogoUrl(res.logoUrl) }); }}/>
                          </label>
                          {uploadLogo.isSuccess && <span className="text-green-600 text-xs font-bold">✅ Uploaded</span>}
                          {uploadLogo.isError && <span className="text-red-600 text-xs">{(uploadLogo.error as any)?.response?.data?.message || 'Upload failed'}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">PNG, JPEG, or WebP — max 2MB. Or paste a link instead:</p>
                        <input value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} placeholder="https://…/logo.png" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"/>
                          <input value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-blue-400"/>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Live Preview</p>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 p-2 rounded-xl" style={{background:primaryColor+'20',border:`1px solid ${primaryColor}40`}}>
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{background:primaryColor}}>{(logoText||'M')[0]}</div>
                          )}
                          <span className="font-bold text-sm" style={{color:primaryColor}}>{logoText||'MySchool'}</span>
                        </div>
                        <button className="w-full py-2 rounded-xl text-white text-sm font-bold mb-2" style={{background:primaryColor}}>Primary Button</button>
                        <div className="p-3 rounded-xl border" style={{borderColor:primaryColor+'40',background:primaryColor+'10'}}>
                          <p className="text-xs font-semibold" style={{color:primaryColor}}>Card with theme color</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                  <button
                    onClick={()=>updateBranding.mutate({ name: logoText, logoUrl, primaryColor })}
                    disabled={updateBranding.isPending || tenantLoading}
                    className="mt-5 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 disabled:opacity-60">
                    {updateBranding.isPending ? 'Applying…' : updateBranding.isSuccess ? '✅ Applied — live on your website' : 'Apply Theme'}
                  </button>
                  {updateBranding.isError && <p className="text-red-600 text-xs mt-2">Failed to save — please try again.</p>}
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
                  {gatewaysLoading ? (
                    <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { key:'stripe', name:'Stripe', icon:'💳', color:'bg-blue-50', fields:[['publishableKey','Publishable Key'],['secretKey','Secret Key']] },
                        { key:'jazzcash', name:'JazzCash', icon:'🟠', color:'bg-orange-50', fields:[['merchantId','Merchant ID'],['password','Password'],['integritySalt','Integrity Salt']] },
                        { key:'easypaisa', name:'EasyPaisa', icon:'🟢', color:'bg-green-50', fields:[['storeId','Store ID'],['accountNumber','Account Number']] },
                        { key:'bankTransfer', name:'Bank Transfer', icon:'🏦', color:'bg-gray-50', fields:[['bankName','Bank Name'],['accountTitle','Account Title'],['accountNo','Account No.'],['iban','IBAN']] },
                      ].map(g=>{
                        const saved = (gatewayData as any)?.[g.key] || { enabled:false, configured:false, fields:{} };
                        const form = gatewayForms[g.key] || {};
                        const setF = (k: string, v: string) => setGatewayForms(p => ({ ...p, [g.key]: { ...p[g.key], [k]: v } }));
                        const save = () => updateGateway.mutate({ gateway: g.key, enabled: true, ...form }, {
                          onSuccess: () => { setGatewaySaved(g.key); setTimeout(()=>setGatewaySaved(''), 2000); },
                        });
                        return (
                          <div key={g.key} className={`${g.color} border border-gray-100 rounded-2xl p-5`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2"><span className="text-2xl">{g.icon}</span><p className="font-bold text-gray-900">{g.name}</p></div>
                              <Badge variant={saved.configured?'green':'gray'}>{saved.configured?'Configured':'Not Configured'}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {g.fields.map(([fk,fl])=>(
                                <div key={fk}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{fl}</label>
                                  <input
                                    type={fk.toLowerCase().includes('key')||fk.toLowerCase().includes('salt')||fk.toLowerCase().includes('password')?'password':'text'}
                                    placeholder={saved.fields?.[fk] || `Enter ${fl}`}
                                    value={form[fk] ?? ''}
                                    onChange={e=>setF(fk, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 bg-white"/></div>
                              ))}
                            </div>
                            <button onClick={save} disabled={updateGateway.isPending} className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 disabled:opacity-60">
                              {gatewaySaved===g.key ? '✅ Saved' : updateGateway.isPending ? 'Saving…' : 'Save Config'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SMS */}
              {tab==='sms' && smsForm && (()=>{
                const TRIGGERS: [string,string][] = [
                  ['feeDueReminder','Fee due reminder (3 days before)'],
                  ['feeOverdueAlert','Fee overdue alert'],
                  ['absenceAlert','Student marked absent'],
                  ['examResultPublished','Exam result published'],
                  ['newAnnouncement','New announcement'],
                ];
                const save = () => updateNotif.mutate({ channel: 'sms', ...smsForm });
                return (
                  <div>
                    <h3 className="font-black text-gray-900 text-lg mb-5">📱 SMS Configuration</h3>
                    <div className={`${smsForm.enabled?'bg-green-50 border-green-200':'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-5`}>
                      <div className="flex items-center justify-between">
                        <div><p className="font-bold text-gray-800">Twilio SMS</p><p className="text-gray-500 text-xs">{smsForm.enabled?'Enabled for this school':'Disabled'}</p></div>
                        <button onClick={()=>setSmsForm({...smsForm, enabled: !smsForm.enabled})} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${smsForm.enabled?'bg-red-50 text-red-600 border border-red-200':'bg-green-50 text-green-700 border border-green-200'}`}>
                          {smsForm.enabled?'Disable':'Enable'}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Sender Number</label>
                        <input value={smsForm.senderNumber} onChange={e=>setSmsForm({...smsForm, senderNumber:e.target.value})} placeholder="+1234567890" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                    </div>
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Auto SMS Triggers</p>
                      <div className="space-y-2">
                        {TRIGGERS.map(([k,label])=>{
                          const on = !!smsForm.triggers?.[k];
                          return (
                            <label key={k} className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors" onClick={()=>setSmsForm({...smsForm, triggers:{...smsForm.triggers,[k]:!on}})}>
                              <div className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${on?'bg-green-500':'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${on?'right-1':'left-1'}`}/></div>
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <button onClick={save} disabled={updateNotif.isPending} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 disabled:opacity-60">
                      {updateNotif.isPending ? 'Saving…' : updateNotif.isSuccess ? '✅ Saved' : 'Save SMS Settings'}
                    </button>
                  </div>
                );
              })()}

              {/* Email */}
              {tab==='email' && emailForm && (()=>{
                const TRIGGERS: [string,string][] = [
                  ['welcomeEmail','Welcome email on student registration'],
                  ['feeReceipt','Fee receipt after payment'],
                  ['monthlyReportCard','Monthly report card'],
                  ['examSchedule','Exam schedule notification'],
                  ['newAnnouncement','New announcement'],
                ];
                const save = () => updateNotif.mutate({ channel: 'email', ...emailForm });
                return (
                  <div>
                    <h3 className="font-black text-gray-900 text-lg mb-5">📧 Email Configuration</h3>
                    <div className={`${emailForm.enabled?'bg-blue-50 border-blue-200':'bg-gray-50 border-gray-200'} border rounded-xl p-4 mb-5`}>
                      <div className="flex items-center justify-between">
                        <div><p className="font-bold text-gray-800">Email Notifications</p><p className="text-gray-500 text-xs">{emailForm.enabled?'Enabled for this school':'Disabled'}</p></div>
                        <button onClick={()=>setEmailForm({...emailForm, enabled: !emailForm.enabled})} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${emailForm.enabled?'bg-red-50 text-red-600 border border-red-200':'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                          {emailForm.enabled?'Disable':'Enable'}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">From Name</label>
                        <input value={emailForm.fromName} onChange={e=>setEmailForm({...emailForm, fromName:e.target.value})} placeholder="MySchool Academy" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                      <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">From Email</label>
                        <input value={emailForm.fromEmail} onChange={e=>setEmailForm({...emailForm, fromEmail:e.target.value})} placeholder="noreply@myschool.edu.pk" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                    </div>
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Auto Email Triggers</p>
                      <div className="space-y-2">
                        {TRIGGERS.map(([k,label])=>{
                          const on = !!emailForm.triggers?.[k];
                          return (
                            <label key={k} className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors" onClick={()=>setEmailForm({...emailForm, triggers:{...emailForm.triggers,[k]:!on}})}>
                              <div className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${on?'bg-blue-500':'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow transition-all ${on?'right-1':'left-1'}`}/></div>
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <button onClick={save} disabled={updateNotif.isPending} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 disabled:opacity-60">
                      {updateNotif.isPending ? 'Saving…' : updateNotif.isSuccess ? '✅ Saved' : 'Save Email Settings'}
                    </button>
                  </div>
                );
              })()}

              {/* Roles & Permissions */}
              {tab==='roles' && (
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-5">🔐 Roles & Permissions</h3>
                  {rolesLoading ? (
                    <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
                  ) : (
                    <div className="space-y-4">
                      {((rolesData as any[]) || []).map(r=>(
                        <div key={r.role} className="border border-gray-100 rounded-2xl p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-black ${r.color}`}>{r.name}</span>
                              <span className="text-sm text-gray-500">{r.users.toLocaleString()} users</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {r.permissions.map((p: string)=>(
                              <span key={p} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">{p}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button disabled title="Custom roles require a schema change beyond this pass — permissions are currently fixed per role in code" className="mt-4 px-4 py-2 border border-gray-200 text-gray-400 bg-gray-50 text-sm font-bold rounded-xl cursor-not-allowed">
                    + Create Custom Role (not yet supported)
                  </button>
                </div>
              )}

              {/* Billing */}
              {tab==='billing' && (()=>{
                const sub = (subData as any) || {};
                const stats = (schoolStats as any) || {};
                return (
                  <div>
                    <h3 className="font-black text-gray-900 text-lg mb-5">💰 Billing & Subscription</h3>
                    {subLoading ? (
                      <div className="h-32 bg-gray-100 rounded-2xl animate-pulse mb-5"/>
                    ) : (
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 mb-5 text-white">
                        <p className="text-white/70 text-sm">Current Plan</p>
                        <p className="text-3xl font-black">{sub.tier || 'No Active Plan'}</p>
                        <p className="text-white/80 text-sm mt-1">Status: {sub.status || 'inactive'}</p>
                        <div className="flex gap-3 mt-4">
                          <button onClick={()=>checkout.mutate('PRO')} disabled={checkout.isPending} className="px-4 py-2 bg-white text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-50 disabled:opacity-60">
                            {checkout.isPending ? 'Loading…' : 'Upgrade to Pro'}
                          </button>
                          <button onClick={()=>portal.mutate()} disabled={portal.isPending || !sub.stripeSubId} className="px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 disabled:opacity-60">
                            {portal.isPending ? 'Loading…' : 'Manage Billing'}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="border border-gray-100 rounded-2xl p-5">
                      <p className="font-bold text-gray-900 mb-3">Current Usage</p>
                      <div className="grid grid-cols-2 gap-3">
                        {([['Students', stats.totalStudents], ['Teachers', stats.totalTeachers], ['Classes', stats.totalClasses], ['Overdue Invoices', stats.overdueInvoices]] as [string, any][])
                          .filter(([,v])=>v!==undefined)
                          .map(([l,v])=>(
                            <div key={l} className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-500">{l}</p><p className="text-xl font-black text-gray-900">{v}</p>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Security */}
              {tab==='security' && (()=>{
                const dash = (secDashboard as any) || {};
                const history = ((loginHistory as any)?.items || loginHistory || []) as any[];
                const startMfa = () => setupMfa.mutate(undefined, { onSuccess: (res: any) => { setMfaSecret(res); setMfaStep('verify'); } });
                const confirmMfa = () => enableMfa.mutate(mfaToken, { onSuccess: () => { setMfaStep('idle'); setMfaToken(''); } });
                return (
                  <div>
                    <h3 className="font-black text-gray-900 text-lg mb-5">🛡️ Security Settings</h3>

                    <div className="p-4 border border-gray-100 rounded-xl mb-3">
                      <div className="flex items-center justify-between">
                        <div><p className="font-semibold text-sm text-gray-800">Two-Factor Authentication</p><p className="text-xs text-gray-400 mt-0.5">2FA adds an extra security layer</p></div>
                        {mfaStep==='idle' && <button onClick={startMfa} disabled={setupMfa.isPending} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl hover:bg-white">{setupMfa.isPending?'Loading…':'Enable 2FA'}</button>}
                      </div>
                      {mfaStep==='verify' && (
                        <div className="mt-3">
                          {mfaSecret.secret && <p className="text-xs text-gray-500 mb-2">Enter this key in your authenticator app: <span className="font-mono font-bold text-gray-800">{mfaSecret.secret}</span></p>}
                          <div className="flex items-center gap-2">
                            <input value={mfaToken} onChange={e=>setMfaToken(e.target.value)} placeholder="6-digit code" className="px-3 py-2 border border-gray-200 rounded-xl text-sm flex-1"/>
                            <button onClick={confirmMfa} disabled={enableMfa.isPending} className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl">{enableMfa.isPending?'Verifying…':'Confirm'}</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border border-gray-100 rounded-xl mb-3">
                      <p className="font-semibold text-sm text-gray-800 mb-2">Recent Login Activity</p>
                      {history.length===0 ? <p className="text-xs text-gray-400">No recent logins recorded.</p> : (
                        <div className="space-y-2">
                          {history.slice(0,5).map((h:any, i:number)=>(
                            <div key={i} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                              <span>{h.ipAddress || h.ip || 'Unknown IP'} · {h.userAgent ? h.userAgent.slice(0,40) : ''}</span>
                              <span className="text-gray-400">{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">MFA Adoption</p><p className="text-xl font-black text-gray-900">{dash.mfaAdoption ?? '—'}%</p></div>
                      <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Active Users</p><p className="text-xl font-black text-gray-900">{dash.totalUsers ?? '—'}</p></div>
                      <div className="p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Unresolved Alerts</p><p className="text-xl font-black text-gray-900">{dash.unresolvedSuspiciousActivities ?? '—'}</p></div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="font-bold text-yellow-800 text-sm">⚠️ Danger Zone</p>
                      <p className="text-yellow-600 text-xs mt-1 mb-3">These actions are irreversible. Proceed with caution.</p>
                      <button className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-100" disabled title="Not yet implemented — requires confirmation flow">Delete School Account</button>
                    </div>
                  </div>
                );
              })()}

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
