'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { useAuthStore } from '../../../stores/auth.store';
import { useClasses, useSections, useExams } from '../../../hooks/use-api';
import Link from 'next/link';
import { Badge } from '../../../components/shared/badge';

const TODAY_SCHEDULE = [
  { time:'8:00 AM', class:'Grade 10-A', subject:'Mathematics', room:'Room 201', students:42 },
  { time:'9:30 AM', class:'Grade 9-B', subject:'Mathematics', room:'Room 104', students:38 },
  { time:'11:00 AM', class:'Grade 8-A', subject:'Mathematics', room:'Room 301', students:45 },
  { time:'12:30 PM', class:'Grade 10-B', subject:'Mathematics', room:'Room 201', students:40 },
];
const PENDING_TASKS = [
  { task:'Mark attendance — Grade 10-A', priority:'HIGH', due:'Today 10:00 AM' },
  { task:'Grade midterm papers — Grade 9-B', priority:'HIGH', due:'Today EOD' },
  { task:'Submit lesson plan — Week 24', priority:'MEDIUM', due:'Jun 7, 2026' },
  { task:'Parent feedback — Ahmed Ali', priority:'LOW', due:'Jun 10, 2026' },
];
const MY_STUDENTS = [
  { name:'Ahmed Ali Khan', class:'10-A', attendance:96, lastGrade:'A+', status:'Excellent' },
  { name:'Sara Fatima', class:'10-A', attendance:88, lastGrade:'A', status:'Good' },
  { name:'Omar Hassan', class:'10-B', attendance:71, lastGrade:'B+', status:'Warning' },
  { name:'Zara Malik', class:'9-B', attendance:94, lastGrade:'A+', status:'Excellent' },
  { name:'Ibrahim Shah', class:'9-B', attendance:65, lastGrade:'C', status:'At Risk' },
];

export default function TeacherPortalPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home'|'attendance'|'assignments'|'performance'>('home');
  const { data: exams } = useExams();
  const upcoming = (exams as any[])?.filter(e=>new Date(e.startDate)>=new Date()).slice(0,3)??[];

  return (
    <>
      <Topbar title="Teacher Portal" subtitle="Your personal teaching dashboard" />
      <div className="p-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Good morning,</p>
              <h1 className="text-2xl font-black mt-1">{user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Teacher'}</h1>
              <p className="text-blue-200 text-sm mt-1">You have <strong className="text-white">{TODAY_SCHEDULE.length} classes</strong> today · <strong className="text-white">{PENDING_TASKS.filter(t=>t.priority==='HIGH').length} urgent tasks</strong> pending</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black">{new Date().getDate()}</p>
              <p className="text-blue-200 text-sm">{new Date().toLocaleDateString('en-PK',{month:'long',year:'numeric'})}</p>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:"Today's Classes", value:TODAY_SCHEDULE.length, icon:'📚', bg:'bg-blue-50', c:'text-blue-600' },
            { label:'Total Students', value:165, icon:'👩‍🎓', bg:'bg-green-50', c:'text-green-600' },
            { label:'Pending Assignments', value:8, icon:'📝', bg:'bg-yellow-50', c:'text-yellow-600' },
            { label:'Unread Notices', value:3, icon:'🔔', bg:'bg-red-50', c:'text-red-600' },
          ].map(k=>(
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 flex items-center gap-3`}>
              <span className="text-2xl">{k.icon}</span>
              <div><p className={`text-3xl font-black ${k.c}`}>{k.value}</p><p className="text-xs text-gray-500">{k.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['home','attendance','assignments','performance'] as const).map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${activeTab===t?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {t==='home'?'🏠 Overview':t==='attendance'?'✅ Attendance':t==='assignments'?'📝 Assignments':'📊 Performance'}
            </button>
          ))}
        </div>

        {activeTab === 'home' && (
          <div className="grid grid-cols-3 gap-5">
            {/* Today's Schedule */}
            <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">📅 Today&apos;s Schedule</h3>
              <div className="space-y-3">
                {TODAY_SCHEDULE.map((s,i)=>(
                  <div key={i} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-center w-20 flex-shrink-0">
                      <p className="font-black text-blue-700 text-sm">{s.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{s.subject} — {s.class}</p>
                      <p className="text-xs text-gray-400">{s.room} · {s.students} students</p>
                    </div>
                    <Link href="/attendance" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">Mark ✓</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">⚡ Pending Tasks</h3>
                <div className="space-y-2">
                  {PENDING_TASKS.map((t,i)=>(
                    <div key={i} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-800 leading-tight">{t.task}</p>
                        <Badge variant={t.priority==='HIGH'?'red':t.priority==='MEDIUM'?'yellow':'gray'}>{t.priority}</Badge>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Due: {t.due}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">📝 Upcoming Exams</h3>
                {upcoming.length===0?<p className="text-sm text-gray-400">No upcoming exams</p>:(
                  <div className="space-y-2">
                    {upcoming.map((e:any,i:number)=>(
                      <div key={i} className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-xs font-bold text-gray-900">{e.title}</p>
                        <p className="text-[10px] text-gray-400">{new Date(e.startDate).toLocaleDateString('en-PK')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Quick Attendance</h3>
            <div className="flex gap-3 mb-5">
              <select className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                {TODAY_SCHEDULE.map(s=><option key={s.class}>{s.class} — {s.subject}</option>)}
              </select>
              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {MY_STUDENTS.slice(0,6).map((s,i)=>(
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700 text-xs">{s.name[0]}</div>
                    <p className="text-sm font-medium text-gray-800">{s.name.split(' ')[0]}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200">P</button>
                    <button className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">A</button>
                    <button className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-200">L</button>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/attendance" className="block w-full text-center py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 text-sm">Open Full Attendance Module →</Link>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">My Students Performance</h3></div>
              <table className="w-full">
                <thead className="bg-gray-50"><tr>{['Student','Class','Attendance','Last Grade','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {MY_STUDENTS.map((s,i)=>(
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700 text-xs">{s.name[0]}</div><p className="font-semibold text-sm">{s.name}</p></div></td>
                      <td className="px-4 py-3 text-sm text-gray-600">Grade {s.class}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.attendance>=90?'bg-green-500':s.attendance>=75?'bg-yellow-500':'bg-red-500'}`} style={{width:`${s.attendance}%`}}/></div>
                          <span className="text-xs font-bold text-gray-700">{s.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={s.lastGrade==='A+'||s.lastGrade==='A'?'green':s.lastGrade==='B+'||s.lastGrade==='B'?'blue':'yellow'}>{s.lastGrade}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={s.status==='Excellent'?'green':s.status==='Good'?'blue':s.status==='Warning'?'yellow':'red'}>{s.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="grid grid-cols-2 gap-4">
            {TODAY_SCHEDULE.map((cls,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <div><h3 className="font-bold text-gray-900">{cls.class}</h3><p className="text-xs text-gray-400">{cls.subject}</p></div>
                  <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100">+ Assignment</button>
                </div>
                <div className="space-y-2">
                  {[{t:`Chapter ${i+4} Exercise`,due:'Jun 8',sub:Math.floor(cls.students*0.7),total:cls.students},{t:`Quiz ${i+1} Preparation`,due:'Jun 12',sub:0,total:cls.students}].map((a,j)=>(
                    <div key={j} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold text-gray-800">{a.t}</p>
                        <span className="text-[10px] text-gray-400">Due {a.due}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{width:`${(a.sub/a.total)*100}%`}}/></div>
                        <span className="text-[10px] text-gray-500">{a.sub}/{a.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
