'use client';
import React from 'react';
import { useDashboard } from '../../../hooks/use-api';
import { StatCard } from '../../../components/shared/stat-card';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import Link from 'next/link';
export default function DashboardPage() {
  const { data, isLoading } = useDashboard('default');
  return (
    <>
      <Topbar title="Dashboard" subtitle="Welcome back — here's your school overview"/>
      <div className="p-6">
        <PageHeader title="School Overview" subtitle="Real-time snapshot"/>
        {isLoading ? (
          <div className="grid grid-cols-4 gap-5 mb-6">{[...Array(4)].map((_,i)=><div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard title="Total Students" value={data?.totalStudents??0} icon="👩‍🎓" color="blue" trend={{ value: 5, label: 'this month' }}/>
            <StatCard title="Today's Attendance" value={`${data?.attendance.rate??0}%`} icon="✅" color="green"/>
            <StatCard title="Outstanding Fees" value={`Rs. ${((data?.fees.outstanding??0)/1000).toFixed(0)}K`} icon="💰" color="yellow"/>
            <StatCard title="Total Teachers" value={data?.totalTeachers??0} icon="👨‍🏫" color="purple"/>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Today's Attendance</h3>
            <div className="space-y-3">
              {[{label:'Present',val:data?.attendance.present??0,color:'bg-green-500'},{label:'Absent',val:data?.attendance.absent??0,color:'bg-red-400'}].map(r=>(
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${r.color}`}/><span className="text-sm text-gray-600">{r.label}</span></div>
                  <span className="font-bold text-gray-900">{r.val}</span>
                </div>
              ))}
              {data && data.attendance.total > 0 && (
                <div className="mt-3"><div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"><div className="bg-green-500 h-full rounded-full" style={{width:`${data.attendance.rate}%`}}/></div><p className="text-xs text-gray-400 mt-1">{data.attendance.rate}% rate</p></div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-900">Upcoming Exams</h3><Link href="/exams" className="text-xs text-green-600 font-semibold hover:underline">View all →</Link></div>
            {!data?.upcomingExams?.length ? <p className="text-sm text-gray-400 text-center py-6">No upcoming exams</p> : (
              <div className="space-y-2">
                {data.upcomingExams.map(e=>(
                  <div key={e.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-black text-sm leading-none">{new Date(e.startDate).getDate()}</span>
                      <span className="text-blue-500 text-xs">{new Date(e.startDate).toLocaleString('en',{month:'short'})}</span>
                    </div>
                    <div><p className="text-sm font-semibold text-gray-800">{e.title}</p><p className="text-xs text-gray-400">{e.section.class.name}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[{href:'/students',icon:'👩‍🎓',label:'Add Student'},{href:'/attendance',icon:'✅',label:'Attendance'},{href:'/fees',icon:'💰',label:'Collect Fee'},{href:'/exams',icon:'📝',label:'New Exam'}].map(a=>(
                <Link key={a.href} href={a.href} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-green-50 hover:border-green-200 border border-transparent transition-all text-center">
                  <span className="text-2xl">{a.icon}</span><span className="text-xs font-semibold text-gray-600">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
