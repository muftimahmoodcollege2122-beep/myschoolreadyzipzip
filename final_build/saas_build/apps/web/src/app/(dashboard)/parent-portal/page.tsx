'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { useAuthStore } from '../../../stores/auth.store';
import { Badge } from '../../../components/shared/badge';

const CHILDREN = [
  { name:'Ahmad Raza', class:'Grade 10-A', rollNo:'12', photo:'A', attendance:94, grade:'A', feeStatus:'Paid', school:'MySchool Academy' },
  { name:'Zara Raza', class:'Grade 7-B', rollNo:'08', photo:'Z', attendance:98, grade:'A+', feeStatus:'Paid', school:'MySchool Academy' },
];
const SUBJECTS = [
  { name:'Mathematics', marks:87, grade:'A', teacher:'Mr. Ali Hassan' },
  { name:'English', marks:92, grade:'A+', teacher:'Mr. Bilal Khan' },
  { name:'Physics', marks:79, grade:'B+', teacher:'Ms. Sara Ahmed' },
  { name:'Chemistry', marks:75, grade:'B', teacher:'Dr. Fatima Shah' },
];
const NOTICES = [
  { title:'Parent-Teacher Meeting', date:'June 13, 2026', type:'Meeting', urgent:true },
  { title:'Annual Sports Day — June 20', date:'June 20, 2026', type:'Event', urgent:false },
  { title:'Fee Due Reminder — June 15', date:'June 5, 2026', type:'Finance', urgent:true },
  { title:'Result Cards Available', date:'May 31, 2026', type:'Academic', urgent:false },
];
const MESSAGES = [
  { from:'Mr. Ali Hassan', subject:'Ahmad needs improvement in algebra', time:'2 hrs ago', unread:true },
  { from:'Class Teacher', subject:'Attendance was low this week', time:'Yesterday', unread:true },
  { from:'School Admin', subject:'Fee receipt attached', time:'Jun 1', unread:false },
];

export default function ParentPortalPage() {
  const { user } = useAuthStore();
  const [selectedChild, setSelectedChild] = useState(0);
  const [tab, setTab] = useState<'overview'|'results'|'fees'|'messages'>('overview');
  const child = CHILDREN[selectedChild];

  return (
    <>
      <Topbar title="Parent Portal" subtitle="Monitor your child's progress" />
      <div className="p-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm">Good day,</p>
              <h1 className="text-2xl font-black mt-0.5">{user?.profile?.firstName ?? 'Parent'} {user?.profile?.lastName ?? ''}</h1>
              <p className="text-indigo-200 text-sm mt-1">You have <strong className="text-white">{CHILDREN.length} children</strong> enrolled · <strong className="text-white">{MESSAGES.filter(m=>m.unread).length} unread messages</strong></p>
            </div>
            <div className="flex gap-2">
              {CHILDREN.map((c,i)=>(
                <button key={i} onClick={()=>setSelectedChild(i)} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all ${selectedChild===i?'bg-white text-indigo-700 shadow-lg scale-110':'bg-white/20 text-white hover:bg-white/30'}`}>
                  {c.photo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Child Selector */}
        <div className="flex gap-3 mb-6">
          {CHILDREN.map((c,i)=>(
            <button key={i} onClick={()=>setSelectedChild(i)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${selectedChild===i?'border-indigo-500 bg-indigo-50':'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg ${selectedChild===i?'bg-indigo-600 text-white':'bg-gray-100 text-gray-600'}`}>{c.photo}</div>
              <div className="text-left"><p className={`font-bold text-sm ${selectedChild===i?'text-indigo-900':'text-gray-900'}`}>{c.name}</p><p className="text-xs text-gray-400">{c.class} · Roll {c.rollNo}</p></div>
            </button>
          ))}
        </div>

        {/* Child Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Attendance', value:`${child.attendance}%`, icon:'✅', ok:child.attendance>=90 },
            { label:'Overall Grade', value:child.grade, icon:'🎯', ok:true },
            { label:'Fee Status', value:child.feeStatus, icon:'💰', ok:true },
            { label:'Rank in Class', value:'#5', icon:'🏆', ok:true },
          ].map(k=>(
            <div key={k.label} className={`rounded-2xl p-4 flex items-center gap-3 ${k.ok?'bg-green-50':'bg-red-50'}`}>
              <span className="text-2xl">{k.icon}</span>
              <div><p className={`text-2xl font-black ${k.ok?'text-green-700':'text-red-600'}`}>{k.value}</p><p className="text-xs text-gray-500">{k.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['overview','results','fees','messages'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${tab===t?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {t==='overview'?'📋 Overview':t==='results'?'📊 Results':t==='fees'?'💰 Fees':'💬 Messages'}{t==='messages'&&MESSAGES.filter(m=>m.unread).length>0&&<span className="ml-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{MESSAGES.filter(m=>m.unread).length}</span>}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-5">
            {/* Notices */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">📢 School Notices</h3>
              <div className="space-y-3">
                {NOTICES.map((n,i)=>(
                  <div key={i} className={`p-3 rounded-xl border ${n.urgent?'bg-red-50 border-red-200':'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-start gap-2">
                      {n.urgent&&<span className="text-red-500 flex-shrink-0">🔴</span>}
                      <div>
                        <p className="font-bold text-sm text-gray-900">{n.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={n.type==='Meeting'?'blue':n.type==='Finance'?'yellow':n.type==='Event'?'green':'purple'}>{n.type}</Badge>
                          <span className="text-xs text-gray-400">{n.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">💬 Teacher Messages</h3>
                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100">+ New Message</button>
              </div>
              <div className="space-y-3">
                {MESSAGES.map((m,i)=>(
                  <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-colors hover:bg-gray-50 ${m.unread?'bg-blue-50 border-blue-100':'border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {m.unread&&<div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"/>}
                        <p className={`text-sm ${m.unread?'font-bold text-gray-900':'font-medium text-gray-700'}`}>{m.from}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">{m.time}</span>
                    </div>
                    <p className={`text-xs mt-1 ${m.unread?'text-gray-700':'text-gray-400'}`}>{m.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'results' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-w-2xl">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{child.name} — Academic Results</h3>
              <p className="text-xs text-gray-400">{child.class} · {child.school}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {SUBJECTS.map((s,i)=>(
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div><p className="font-semibold text-sm text-gray-900">{s.name}</p><p className="text-xs text-gray-400">{s.teacher}</p></div>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.marks>=90?'bg-green-500':s.marks>=75?'bg-blue-500':'bg-yellow-500'}`} style={{width:`${s.marks}%`}}/></div>
                        <span className="font-mono text-sm font-bold text-gray-900">{s.marks}%</span>
                      </div>
                    </div>
                    <Badge variant={s.grade==='A+'||s.grade==='A'?'green':s.grade==='B+'||s.grade==='B'?'blue':'yellow'}>{s.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-gray-50 flex items-center justify-between">
              <p className="font-bold text-gray-900">Overall Average</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-black text-gray-900">{Math.round(SUBJECTS.reduce((a,s)=>a+s.marks,0)/SUBJECTS.length)}%</p>
                <Badge variant="green">{child.grade}</Badge>
              </div>
            </div>
          </div>
        )}

        {tab === 'fees' && (
          <div className="max-w-xl">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">✅</span>
                <div><p className="font-black text-green-800 text-lg">All Fees Cleared</p><p className="text-green-600 text-sm">Next due: July 1, 2026 — Rs. 12,500</p></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Payment History — {child.name}</h3>
              <div className="divide-y divide-gray-50">
                {['June 2026','May 2026','April 2026','March 2026'].map((m,i)=>(
                  <div key={m} className="flex justify-between items-center py-3">
                    <div><p className="font-semibold text-sm">{m}</p><p className="text-xs text-gray-400">Bank Transfer · Jun {1+i}, 2026</p></div>
                    <div className="flex items-center gap-3"><p className="font-mono font-bold">Rs. 12,500</p><Badge variant="green">Paid</Badge></div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 text-sm">Pay Next Month Online →</button>
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Messages</h3>
                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">+ Write</button>
              </div>
              <div className="divide-y divide-gray-50">
                {MESSAGES.map((m,i)=>(
                  <div key={i} className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${m.unread?'bg-blue-50/50':''}`}>
                    <div className="flex items-start gap-2">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">{m.from[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between"><p className={`text-sm ${m.unread?'font-bold':'font-medium'} text-gray-900 truncate`}>{m.from}</p><span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{m.time}</span></div>
                        <p className="text-xs text-gray-500 truncate">{m.subject}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-4">New Message</h3>
              <div className="space-y-3 flex-1">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                    <option>Mr. Ali Hassan (Math Teacher)</option>
                    <option>Ms. Sara Ahmed (Physics)</option>
                    <option>Class Teacher</option>
                    <option>School Administration</option>
                  </select></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                  <input placeholder="Message subject..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
                <div className="flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message</label>
                  <textarea rows={5} placeholder="Type your message..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"/></div>
              </div>
              <button className="mt-3 w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 text-sm">Send Message →</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
