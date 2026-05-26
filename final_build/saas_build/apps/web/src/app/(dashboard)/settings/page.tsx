'use client';
import React, { useState } from 'react';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { useAuthStore } from '../../../stores/auth.store';
const TABS = [{ id:'profile', label:'Profile', icon:'👤' }, { id:'school', label:'School', icon:'🏫' }, { id:'billing', label:'Billing', icon:'💳' }, { id:'security', label:'Security', icon:'🔐' }] as const;
export default function SettingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'profile'|'school'|'billing'|'security'>('profile');
  return (
    <>
      <Topbar title="Settings"/>
      <div className="p-6">
        <PageHeader title="Settings"/>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
              {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab===t.id?'bg-green-50 text-green-700':'text-gray-600 hover:bg-gray-50'}`}><span>{t.icon}</span>{t.label}</button>)}
            </div>
          </div>
          <div className="col-span-9">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              {tab==='profile' && (
                <div><h3 className="font-bold text-gray-900 mb-5">Profile Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[['First Name',user?.profile?.firstName??''],['Last Name',user?.profile?.lastName??''],['Email',user?.email??''],['Phone',user?.profile?.phone??'']].map(([l,v])=>(
                      <div key={l}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{l}</label><input defaultValue={v} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400"/></div>
                    ))}
                  </div>
                  <button className="mt-5 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">Save Changes</button>
                </div>
              )}
              {tab==='billing' && (
                <div><h3 className="font-bold text-gray-900 mb-5">Billing & Subscription</h3>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-5 flex items-center justify-between">
                    <div><p className="font-black text-green-800 text-lg">Pro Plan</p><p className="text-green-600 text-sm">Rs. 4,999/month</p></div>
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Active</span>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50">Manage Billing →</button>
                </div>
              )}
              {tab==='security' && (
                <div><h3 className="font-bold text-gray-900 mb-5">Security</h3>
                  <div className="space-y-3">
                    {[['Change Password','Update your password','Change'],['Two-Factor Auth','2FA adds extra security','Enable 2FA'],['Active Sessions','Manage logged-in devices','View']].map(([t,d,a])=>(
                      <div key={t} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                        <div><p className="font-semibold text-sm text-gray-800">{t}</p><p className="text-xs text-gray-400 mt-0.5">{d}</p></div>
                        <button className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white">{a}</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab==='school' && (
                <div><h3 className="font-bold text-gray-900 mb-5">School Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['School Name','Contact Email','Phone','Address'].map(l=>(
                      <div key={l}><label className="block text-xs font-bold text-gray-400 uppercase mb-1">{l}</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400"/></div>
                    ))}
                  </div>
                  <button className="mt-5 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">Save Settings</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
