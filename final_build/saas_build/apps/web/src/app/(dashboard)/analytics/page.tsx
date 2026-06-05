'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { useDashboard, useFeeRevenue, useStudents, useTeachers, useClasses } from '../../../hooks/use-api';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4"><h3 className="font-bold text-gray-900">{title}</h3>{subtitle&&<p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}</div>
      {children}
    </div>
  );
}

function Bar({ label, value, max, color = '#16a34a', prefix = '', suffix = '' }: any) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1"><span className="truncate">{label}</span><span className="font-bold text-gray-700 ml-2">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span></div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} /></div>
    </div>
  );
}

function Donut({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (!total) return <p className="text-sm text-center text-gray-300 py-8">No data</p>;
  let cumPct = 0;
  const arcs = segments.map(seg => {
    const pct = (seg.value / total) * 100;
    const start = cumPct;
    cumPct += pct;
    return { ...seg, pct, start };
  });
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {arcs.map((arc, i) => (
            <circle key={i} cx="18" cy="18" r="15.9" fill="none" stroke={arc.color} strokeWidth="3.5"
              strokeDasharray={`${arc.pct} ${100 - arc.pct}`} strokeDashoffset={`${-arc.start}`} strokeLinecap="round" />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><p className="text-xl font-black text-gray-900">{total}</p></div>
      </div>
      <div className="flex-1 space-y-1.5">
        {arcs.map(arc => (
          <div key={arc.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:arc.color}}/><span className="text-xs text-gray-600">{arc.label}</span></div>
            <span className="text-xs font-bold text-gray-700">{arc.value} <span className="text-gray-400">({Math.round(arc.pct)}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: dashboard } = useDashboard('');
  const { data: revenue } = useFeeRevenue();
  const { data: studentsData } = useStudents({ limit: 200 });
  const { data: teachersData } = useTeachers({ limit: 100 });
  const { data: classes } = useClasses();

  const db = dashboard as any;
  const rev = revenue as any;
  const students: any[] = (studentsData as any)?.data ?? [];
  const teachers: any[] = (teachersData as any)?.data ?? [];
  const classList: any[] = Array.isArray(classes) ? classes : [];

  const totalStudents = (studentsData as any)?.meta?.total ?? students.length;
  const totalTeachers = (teachersData as any)?.meta?.total ?? teachers.length;
  const maleCount = students.filter((s:any)=>s.gender==='MALE').length;
  const femaleCount = students.filter((s:any)=>s.gender==='FEMALE').length;
  const collectionRate = rev?.collectionRate ?? 0;
  const attendanceRate = db?.todayAttendanceRate ?? 0;

  const classEnrollment = classList.map((c:any) => ({
    label: c.name,
    value: c.sections?.reduce((s:number,sec:any)=>s+(sec._count?.students??0),0) ?? 0,
  }));
  const maxEnroll = Math.max(1, ...classEnrollment.map(c=>c.value));

  const KPI = [
    { label: 'Total Students', value: totalStudents, change: '+12%', icon: '👩‍🎓', color: 'bg-blue-50 text-blue-700' },
    { label: 'Teachers', value: totalTeachers, change: '+3%', icon: '👨‍🏫', color: 'bg-purple-50 text-purple-700' },
    { label: "Today's Attendance", value: `${attendanceRate}%`, change: attendanceRate >= 85 ? '✅ Good' : '⚠ Low', icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Fee Collection Rate', value: `${collectionRate}%`, change: collectionRate >= 80 ? '✅ On track' : '⚠ Below target', icon: '💰', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Total Classes', value: classList.length, change: `${classList.reduce((s:number,c:any)=>s+(c.sections?.length??0),0)} sections`, icon: '🏫', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Student:Teacher Ratio', value: totalTeachers ? `${Math.round(totalStudents/totalTeachers)}:1` : 'N/A', change: 'per teacher', icon: '📊', color: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <>
      <Topbar title="Analytics" subtitle="School performance insights" />
      <div className="p-6">
        <PageHeader title="Analytics Dashboard" subtitle="Live data from your school" />

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {KPI.map(k => (
            <div key={k.label} className={`rounded-xl p-4 ${k.color.split(' ')[0]} border border-white/50`}>
              <div className="flex items-start justify-between">
                <div><p className={`text-2xl font-black ${k.color.split(' ')[1]}`}>{k.value}</p><p className="text-xs text-gray-600 font-medium mt-0.5">{k.label}</p></div>
                <span className="text-2xl">{k.icon}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{k.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Gender Distribution */}
          <div className="col-span-4">
            <Card title="Student Gender Distribution">
              <Donut segments={[
                { label: 'Male', value: maleCount, color: '#3b82f6' },
                { label: 'Female', value: femaleCount, color: '#ec4899' },
              ]} />
            </Card>
          </div>

          {/* Fee Status Breakdown */}
          <div className="col-span-4">
            <Card title="Fee Status Breakdown">
              <Donut segments={[
                { label: 'Paid', value: rev?.paid ?? 0, color: '#16a34a' },
                { label: 'Partial', value: rev?.partial ?? 0, color: '#3b82f6' },
                { label: 'Pending', value: rev?.pending ?? 0, color: '#f59e0b' },
                { label: 'Overdue', value: rev?.overdue ?? 0, color: '#ef4444' },
              ]} />
            </Card>
          </div>

          {/* Teacher Departments */}
          <div className="col-span-4">
            <Card title="Teacher Activity">
              <div className="space-y-3">
                {[
                  { label: 'Total Teachers', value: totalTeachers, icon: '👨‍🏫' },
                  { label: 'Active Teachers', value: teachers.filter((t:any)=>t.isActive!==false).length, icon: '✅' },
                  { label: 'Students per Teacher', value: totalTeachers ? Math.round(totalStudents/totalTeachers) : 0, icon: '📊' },
                  { label: 'Subjects Covered', value: classList.reduce((s:number,c:any)=>s+(c.sections?.length??0),0), icon: '📚' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600 flex items-center gap-2"><span>{s.icon}</span>{s.label}</span>
                    <span className="font-black text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Class Enrollment */}
          <div className="col-span-6">
            <Card title="Enrollment by Class" subtitle="Student count per grade">
              {classEnrollment.length === 0 ? (
                <p className="text-sm text-gray-300 text-center py-6">No classes configured</p>
              ) : (
                <div>
                  {classEnrollment.map(c => (
                    <Bar key={c.label} label={c.label} value={c.value} max={maxEnroll} suffix=" students" />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="col-span-6">
            <Card title="Financial Overview" subtitle="Fee collection summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
                  <span className="text-sm font-medium text-gray-700">Total Collected</span>
                  <span className="font-black text-green-700 text-lg">Rs. {Number(rev?.collected ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 rounded-xl p-3">
                  <span className="text-sm font-medium text-gray-700">Total Outstanding</span>
                  <span className="font-black text-red-600 text-lg">Rs. {Number(rev?.outstanding ?? 0).toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Collection Rate</span>
                    <span className="font-black text-gray-800">{collectionRate}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${collectionRate}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: 'Total Invoices', value: rev?.totalInvoices ?? 0 },
                    { label: 'Overdue', value: rev?.overdue ?? 0 },
                    { label: 'On Time', value: (rev?.paid ?? 0) + (rev?.partial ?? 0) },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-gray-50 rounded-lg p-2">
                      <p className="font-black text-gray-900">{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
