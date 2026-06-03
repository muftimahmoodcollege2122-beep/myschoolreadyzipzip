'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { useAuthStore } from '../../../stores/auth.store';
import { Badge } from '../../../components/shared/badge';
import Link from 'next/link';

const SCHEDULE = [
  { time:'8:00',subject:'Mathematics',teacher:'Mr. Ali Hassan',room:'Room 201' },
  { time:'8:45',subject:'Physics',teacher:'Ms. Sara Ahmed',room:'Room 105' },
  { time:'9:30',subject:'English',teacher:'Mr. Bilal Khan',room:'Room 301' },
  { time:'11:15',subject:'Chemistry',teacher:'Dr. Fatima',room:'Lab 2' },
  { time:'12:00',subject:'Urdu',teacher:'Ms. Nadia',room:'Room 201' },
  { time:'12:45',subject:'Computer Science',teacher:'Mr. Usman',room:'Computer Lab' },
];
const SUBJECTS = [
  { name:'Mathematics', teacher:'Mr. Ali Hassan', marks:87, total:100, grade:'A', attendance:94 },
  { name:'Physics', teacher:'Ms. Sara Ahmed', marks:79, total:100, grade:'B+', attendance:91 },
  { name:'English', teacher:'Mr. Bilal Khan', marks:92, total:100, grade:'A+', attendance:97 },
  { name:'Chemistry', teacher:'Dr. Fatima Shah', marks:75, total:100, grade:'B', attendance:88 },
  { name:'Urdu', teacher:'Ms. Nadia Malik', marks:83, total:100, grade:'A', attendance:95 },
  { name:'Computer', teacher:'Mr. Usman Ali', marks:95, total:100, grade:'A+', attendance:100 },
];
const HOMEWORK = [
  { subject:'Mathematics', task:'Exercise 7.3 — Quadratic Equations (Qs 1-10)', due:'Tomorrow', status:'PENDING' },
  { subject:'English', task:'Write an essay: "Impact of Social Media"', due:'Jun 8', status:'PENDING' },
  { subject:'Physics', task:'Lab Report — Pendulum Experiment', due:'Jun 7', status:'SUBMITTED' },
  { subject:'Chemistry', task:'Draw & label unit cell structures', due:'Jun 10', status:'PENDING' },
];

export default function StudentPortalPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'home'|'grades'|'homework'|'fees'>('home');
  const avgMarks = Math.round(SUBJECTS.reduce((a,s)=>a+(s.marks/s.total)*100,0)/SUBJECTS.length);

  return (
    <>
      <Topbar title="Student Portal" subtitle="Your personal learning dashboard" />
      <div className="p-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-black mt-1">{user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Student'}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-green-100">📚 Grade 10-A</span>
                <span className="text-sm text-green-100">🎯 Roll No. 12</span>
                <span className="text-sm text-green-100">📊 {avgMarks}% avg</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-4xl font-black">{avgMarks}%</span>
              </div>
              <p className="text-green-200 text-xs mt-1">Overall Score</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Attendance', value:'94%', icon:'✅', bg:'bg-green-50', c:'text-green-600', sub:'This month' },
            { label:'Avg Grade', value:`${avgMarks}%`, icon:'🎯', bg:'bg-blue-50', c:'text-blue-600', sub:'All subjects' },
            { label:'Homework Due', value:HOMEWORK.filter(h=>h.status==='PENDING').length, icon:'📝', bg:'bg-yellow-50', c:'text-yellow-600', sub:'Pending tasks' },
            { label:'Fee Status', value:'Paid', icon:'💰', bg:'bg-purple-50', c:'text-purple-600', sub:'June 2026' },
          ].map(k=>(
            <div key={k.label} className={`${k.bg} rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span className="text-xl">{k.icon}</span><p className={`text-2xl font-black ${k.c}`}>{k.value}</p></div>
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="text-[10px] text-gray-400">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['home','grades','homework','fees'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${tab===t?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {t==='home'?'🏠 Home':t==='grades'?'📊 Grades':t==='homework'?'📝 Homework':'💰 Fees'}
            </button>
          ))}
        </div>

        {tab === 'home' && (
          <div className="grid grid-cols-2 gap-5">
            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">📅 Today&apos;s Schedule</h3>
              <div className="space-y-2">
                {SCHEDULE.map((s,i)=>{
                  const now = new Date();
                  const [h,m] = s.time.split(':').map(Number);
                  const isPast = h < now.getHours() || (h===now.getHours()&&m<now.getMinutes());
                  const isCurrent = h===now.getHours();
                  return (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isCurrent?'bg-green-50 border-green-200':isPast?'opacity-50 bg-gray-50 border-gray-100':'bg-white border-gray-100'}`}>
                      <div className="w-14 text-center flex-shrink-0">
                        <p className={`font-black text-xs ${isCurrent?'text-green-700':isPast?'text-gray-400':'text-gray-700'}`}>{s.time}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">{s.subject}</p>
                        <p className="text-xs text-gray-400">{s.teacher} · {s.room}</p>
                      </div>
                      {isCurrent&&<Badge variant="green">Now</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming & Notices */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">📝 Pending Homework</h3>
                <div className="space-y-2">
                  {HOMEWORK.filter(h=>h.status==='PENDING').map((h,i)=>(
                    <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                      <span className="text-yellow-500 text-lg mt-0.5">📌</span>
                      <div><p className="text-xs font-bold text-gray-900">{h.subject}</p><p className="text-xs text-gray-500 mt-0.5">{h.task}</p><p className="text-[10px] text-red-500 mt-1 font-bold">Due: {h.due}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">🔔 School Notices</h3>
                <div className="space-y-2">
                  {['📋 Annual sports day on June 20 — All students to participate','📢 Fee submission deadline: June 15, 2026','🏆 Science fair registration open till June 10'].map((n,i)=>(
                    <p key={i} className="text-xs text-gray-600 p-2 bg-blue-50 rounded-lg">{n}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'grades' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-gray-900">Academic Performance</h3></div>
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Subject','Teacher','Marks','Grade','Attendance','Progress'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {SUBJECTS.map((s,i)=>(
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-sm text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.teacher}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-gray-900">{s.marks}/{s.total}</td>
                    <td className="px-4 py-3"><Badge variant={s.grade==='A+'||s.grade==='A'?'green':s.grade==='B+'||s.grade==='B'?'blue':'yellow'}>{s.grade}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.attendance>=90?'bg-green-500':s.attendance>=75?'bg-yellow-500':'bg-red-500'}`} style={{width:`${s.attendance}%`}}/></div>
                        <span className="text-xs text-gray-600">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(s.marks/s.total)>=0.8?'bg-green-500':(s.marks/s.total)>=0.6?'bg-blue-500':'bg-yellow-500'}`} style={{width:`${(s.marks/s.total)*100}%`}}/></div>
                        <span className="text-xs font-bold text-gray-700">{Math.round((s.marks/s.total)*100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'homework' && (
          <div className="space-y-3">
            {HOMEWORK.map((h,i)=>(
              <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${h.status==='SUBMITTED'?'border-green-200 bg-green-50/30':'border-gray-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${h.status==='SUBMITTED'?'bg-green-100':'bg-yellow-100'}`}>{h.status==='SUBMITTED'?'✅':'📝'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><p className="font-bold text-sm text-gray-900">{h.subject}</p><Badge variant={h.status==='SUBMITTED'?'green':'yellow'}>{h.status}</Badge></div>
                  <p className="text-sm text-gray-600">{h.task}</p>
                  <p className="text-xs text-gray-400 mt-1">Due: {h.due}</p>
                </div>
                {h.status==='PENDING'&&<button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 flex-shrink-0">Submit →</button>}
              </div>
            ))}
          </div>
        )}

        {tab === 'fees' && (
          <div className="max-w-2xl">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4 flex items-center gap-4">
              <span className="text-4xl">✅</span>
              <div><p className="font-black text-green-800 text-lg">June 2026 Fee Paid</p><p className="text-green-600 text-sm">Rs. 12,500 paid on June 1, 2026 via Bank Transfer</p></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Fee History</h3>
              <div className="divide-y divide-gray-50">
                {['June 2026','May 2026','April 2026','March 2026'].map((m,i)=>(
                  <div key={m} className="flex justify-between items-center py-3">
                    <div><p className="font-semibold text-sm text-gray-900">{m}</p><p className="text-xs text-gray-400">Tuition + Transport</p></div>
                    <div className="text-right"><p className="font-mono font-bold text-gray-900">Rs. 12,500</p><Badge variant="green">Paid</Badge></div>
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
