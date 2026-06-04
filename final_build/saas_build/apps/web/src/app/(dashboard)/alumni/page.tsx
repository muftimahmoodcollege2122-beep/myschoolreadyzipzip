'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const ALUMNI = [
  { id:1, name:'Hamza Sheikh', batch:'Class of 2020', degree:'B.Eng Computer Science', company:'Google Pakistan', role:'Software Engineer', city:'Karachi', linkedin:true, img:'H', achievment:'Forbes 30 Under 30' },
  { id:2, name:'Zara Baig', batch:'Class of 2019', degree:'MBBS', company:'Aga Khan Hospital', role:'Resident Physician', city:'Karachi', linkedin:true, img:'Z', achievment:'' },
  { id:3, name:'Ali Nawaz', batch:'Class of 2021', degree:'BBA Finance', company:'Habib Bank Limited', role:'Investment Analyst', city:'Islamabad', linkedin:true, img:'A', achievment:'' },
  { id:4, name:'Sara Qureshi', batch:'Class of 2018', degree:'M.Arch Architecture', company:'Arcop Associates', role:'Senior Architect', city:'Lahore', linkedin:false, img:'S', achievment:'Award-winning architect' },
  { id:5, name:'Bilal Akhtar', batch:'Class of 2022', degree:'B.Sc Physics', company:'SUPARCO', role:'Research Scientist', city:'Karachi', linkedin:true, img:'B', achievment:'' },
  { id:6, name:'Noor Fatima', batch:'Class of 2020', degree:'LLB Law', company:'Self-Employed', role:'Attorney at Law', city:'Islamabad', linkedin:true, img:'N', achievment:'Top Advocate 2025' },
  { id:7, name:'Faisal Rehman', batch:'Class of 2017', degree:'MBA', company:'McKinsey & Company', role:'Management Consultant', city:'Dubai', linkedin:true, img:'F', achievment:'' },
  { id:8, name:'Ayesha Malik', batch:'Class of 2021', degree:'BSc Mathematics', company:'Math Olympiad Trainer', role:'Educator', city:'Karachi', linkedin:false, img:'A', achievment:'National Math Champion' },
];

const EVENTS = [
  { title:'Annual Alumni Reunion 2026', date:'July 15, 2026', location:'Grand Hyatt, Karachi', registered:128, type:'Reunion' },
  { title:'Career Fair & Networking Night', date:'Aug 5, 2026', location:'Online (Zoom)', registered:245, type:'Career' },
  { title:'Alumni Mentorship Launch', date:'Jun 20, 2026', location:'School Auditorium', registered:67, type:'Mentorship' },
  { title:'Fundraising Gala Dinner', date:'Sep 10, 2026', location:'PC Hotel, Karachi', registered:89, type:'Fundraising' },
];

const JOBS = [
  { title:'Frontend Developer', company:'Systems Ltd.', location:'Karachi', salary:'Rs. 120K-180K', type:'Full-time', posted:'2 days ago', postedBy:'Hamza Sheikh (Alumni)' },
  { title:'Financial Analyst', company:'MCB Bank', location:'Lahore', salary:'Rs. 90K-130K', type:'Full-time', posted:'5 days ago', postedBy:'Ali Nawaz (Alumni)' },
  { title:'Research Associate', company:'LUMS', location:'Lahore', salary:'Rs. 70K-100K', type:'Contract', posted:'1 week ago', postedBy:'School Admin' },
  { title:'Marketing Manager', company:'Nestlé Pakistan', location:'Karachi', salary:'Rs. 150K-200K', type:'Full-time', posted:'3 days ago', postedBy:'Faisal Rehman (Alumni)' },
];

const DONATIONS = [
  { name:'Hamza Sheikh', amount:500000, type:'Scholarship Fund', date:'Jun 1, 2026', anonymous:false },
  { name:'Anonymous Alumni', amount:250000, type:'Library Fund', date:'May 15, 2026', anonymous:true },
  { name:'Faisal Rehman', amount:100000, type:'Sports Equipment', date:'May 10, 2026', anonymous:false },
  { name:'Sara Qureshi', amount:75000, type:'Computer Lab', date:'Apr 28, 2026', anonymous:false },
];

export default function AlumniPage() {
  const [view, setView] = useState<'directory'|'events'|'jobs'|'donations'|'mentorship'>('directory');
  const [search, setSearch] = useState('');
  const [donateModal, setDonateModal] = useState(false);
  const [donateForm, setDonateForm] = useState({ amount:'', fund:'Scholarship Fund', anonymous:false });

  const filtered = ALUMNI.filter(a=>!search||a.name.toLowerCase().includes(search.toLowerCase())||a.company.toLowerCase().includes(search.toLowerCase())||a.batch.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Alumni Portal" subtitle="Connect with graduates & manage alumni relations" />
      <div className="p-6">
        <PageHeader
          title="Alumni Portal"
          subtitle={`${ALUMNI.length} alumni registered · ${DONATIONS.reduce((a,d)=>a+d.amount,0).toLocaleString()} Rs. raised`}
          action={<button onClick={()=>setDonateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">💝 Make Donation</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Alumni', value: ALUMNI.length, icon:'🎓', bg:'from-blue-500 to-blue-600' },
            { label:'Upcoming Events', value: EVENTS.length, icon:'🎉', bg:'from-purple-500 to-purple-600' },
            { label:'Active Jobs', value: JOBS.length, icon:'💼', bg:'from-green-500 to-green-600' },
            { label:'Total Donations', value:`Rs. ${(DONATIONS.reduce((a,d)=>a+d.amount,0)/1000).toFixed(0)}K`, icon:'💝', bg:'from-red-500 to-pink-500' },
          ].map(k=>(
            <div key={k.label} className={`bg-gradient-to-br ${k.bg} rounded-2xl p-5 text-white`}>
              <div className="text-3xl mb-2">{k.icon}</div>
              <p className="text-3xl font-black">{k.value}</p>
              <p className="text-white/70 text-xs mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {(['directory','events','jobs','donations','mentorship'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize whitespace-nowrap transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {v==='directory'?'👥 Directory':v==='events'?'🎉 Events':v==='jobs'?'💼 Job Board':v==='donations'?'💝 Donations':'🤝 Mentorship'}
            </button>
          ))}
        </div>

        {view==='directory' && (
          <>
            <div className="flex gap-3 mb-4">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search alumni by name, company, batch..." className="flex-1 max-w-sm px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map(a=>(
                <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center font-black text-blue-700 text-2xl mx-auto mb-3">{a.img}</div>
                  <h3 className="font-bold text-gray-900 text-sm">{a.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{a.batch}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.role}</p>
                  <p className="text-xs font-bold text-gray-700 mt-0.5">{a.company}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">📍 {a.city}</span>
                    {a.linkedin&&<span className="text-xs text-blue-600">in</span>}
                  </div>
                  {a.achievment&&<div className="mt-2 px-2 py-1 bg-yellow-50 rounded-lg text-xs text-yellow-700 font-bold">🏆 {a.achievment}</div>}
                  <button className="mt-3 w-full py-1.5 border border-gray-200 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-50">Connect</button>
                </div>
              ))}
            </div>
          </>
        )}

        {view==='events' && (
          <div className="grid grid-cols-2 gap-4">
            {EVENTS.map((e,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant={e.type==='Reunion'?'blue':e.type==='Career'?'green':e.type==='Mentorship'?'purple':'red'}>{e.type}</Badge>
                    <h3 className="font-bold text-gray-900 mt-2">{e.title}</h3>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-2xl font-black text-gray-900">{e.registered}</p>
                    <p className="text-xs text-gray-400">registered</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                  <p>📅 {e.date}</p>
                  <p>📍 {e.location}</p>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-colors">Register Now →</button>
              </div>
            ))}
            <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 text-lg mb-1">Organize an Alumni Event</h3>
                <p className="text-gray-500 text-sm">Submit an event proposal for alumni reunions, career fairs, or meetups</p>
              </div>
              <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 text-sm">+ Propose Event</button>
            </div>
          </div>
        )}

        {view==='jobs' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">{JOBS.length} open positions from alumni network</p>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500">+ Post a Job</button>
            </div>
            {JOBS.map((j,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-700 text-lg">{j.company[0]}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{j.title}</h3>
                    <p className="text-sm text-gray-500">{j.company} · {j.location}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Posted by {j.postedBy} · {j.posted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900">{j.salary}</p>
                    <Badge variant={j.type==='Full-time'?'green':'blue'}>{j.type}</Badge>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500">Apply →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view==='donations' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[{fund:'Scholarship Fund',raised:500000,goal:1000000,color:'text-blue-600 bg-blue-50'},{fund:'Library Fund',raised:250000,goal:500000,color:'text-green-600 bg-green-50'},{fund:'Sports Equipment',raised:175000,goal:300000,color:'text-purple-600 bg-purple-50'}].map(f=>(
                <div key={f.fund} className={`${f.color.split(' ')[1]} rounded-2xl p-5`}>
                  <p className={`font-bold ${f.color.split(' ')[0]} mb-2`}>{f.fund}</p>
                  <p className={`text-2xl font-black ${f.color.split(' ')[0]}`}>Rs. {(f.raised/1000).toFixed(0)}K<span className="text-sm font-normal text-gray-400">/ Rs. {(f.goal/1000).toFixed(0)}K</span></p>
                  <div className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden"><div className={`h-full rounded-full ${f.color.split(' ')[0].replace('text','bg')}`} style={{width:`${(f.raised/f.goal)*100}%`}}/></div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round((f.raised/f.goal)*100)}% of goal</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Donations</h3>
                <button onClick={()=>setDonateModal(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">+ Donate</button>
              </div>
              <div className="divide-y divide-gray-50">
                {DONATIONS.map((d,i)=>(
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center font-bold text-red-600 text-sm">{d.anonymous?'?':d.name[0]}</div>
                      <div><p className="font-semibold text-sm text-gray-900">{d.anonymous?'Anonymous Alumni':d.name}</p><p className="text-xs text-gray-400">{d.type} · {d.date}</p></div>
                    </div>
                    <p className="font-black text-gray-900 font-mono">Rs. {d.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view==='mentorship' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">🤝 Mentor Directory</h3>
              <div className="space-y-3">
                {ALUMNI.filter(a=>a.linkedin).slice(0,5).map(a=>(
                  <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm">{a.img}</div>
                      <div><p className="font-semibold text-sm text-gray-900">{a.name}</p><p className="text-xs text-gray-400">{a.role} @ {a.company}</p></div>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">Connect</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                <h3 className="font-black text-xl mb-2">Become a Mentor</h3>
                <p className="text-blue-100/80 text-sm mb-4">Give back to your alma mater by guiding current students in your field of expertise.</p>
                <button className="px-4 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50">Register as Mentor →</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">📊 Mentorship Stats</h3>
                {[{l:'Active Mentors',v:18},{l:'Students Mentored',v:64},{l:'Sessions This Month',v:34},{l:'Success Stories',v:12}].map(s=>(
                  <div key={s.l} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{s.l}</span>
                    <span className="font-black text-gray-900">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={donateModal} onClose={()=>setDonateModal(false)} title="Make a Donation">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Donation Fund</label>
            <select value={donateForm.fund} onChange={e=>setDonateForm(f=>({...f,fund:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
              {['Scholarship Fund','Library Fund','Sports Equipment','Computer Lab','General Fund'].map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount (Rs.)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['5,000','10,000','25,000','50,000'].map(a=>(
                <button key={a} onClick={()=>setDonateForm(f=>({...f,amount:a.replace(',','')}))} className={`py-2 text-sm font-bold rounded-xl border transition-all ${donateForm.amount===a.replace(',','')?'bg-blue-600 text-white border-blue-600':'border-gray-200 hover:border-blue-300'}`}>Rs.{a}</button>
              ))}
            </div>
            <input type="number" value={donateForm.amount} onChange={e=>setDonateForm(f=>({...f,amount:e.target.value}))} placeholder="Or enter custom amount" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={donateForm.anonymous} onChange={e=>setDonateForm(f=>({...f,anonymous:e.target.checked}))} className="rounded"/>
            <span className="text-sm text-gray-700">Make this donation anonymous</span>
          </label>
          <button disabled={!donateForm.amount} onClick={()=>setDonateModal(false)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50">💝 Donate Rs. {donateForm.amount||'0'}</button>
        </div>
      </Modal>
    </>
  );
}
