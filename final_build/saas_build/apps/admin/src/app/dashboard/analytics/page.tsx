'use client';
import React, { useState } from 'react';
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

const TEACHER_PERFORMANCE = [
  { name: 'Ms. Fatima Malik',    dept: 'Science',     subjects: 3, sections: 4, passRate: 94, avgMarks: 78, attendance: 98, lessonCompletion: 92, students: 120 },
  { name: 'Mr. Imran Ahmed',     dept: 'Mathematics', subjects: 2, sections: 3, passRate: 88, avgMarks: 74, attendance: 95, lessonCompletion: 85, students: 90 },
  { name: 'Ms. Zara Khan',       dept: 'English',     subjects: 2, sections: 4, passRate: 91, avgMarks: 80, attendance: 100, lessonCompletion: 97, students: 118 },
  { name: 'Mr. Rehman Tariq',    dept: 'Social Std',  subjects: 2, sections: 3, passRate: 82, avgMarks: 68, attendance: 90, lessonCompletion: 78, students: 87 },
  { name: 'Ms. Aisha Siddiqui', dept: 'Computer',    subjects: 1, sections: 5, passRate: 96, avgMarks: 85, attendance: 97, lessonCompletion: 100, students: 145 },
  { name: 'Mr. Bilal Hassan',    dept: 'Islamiyat',   subjects: 1, sections: 6, passRate: 99, avgMarks: 88, attendance: 99, lessonCompletion: 95, students: 172 },
  { name: 'Ms. Hira Baig',       dept: 'Urdu',        subjects: 2, sections: 4, passRate: 87, avgMarks: 72, attendance: 93, lessonCompletion: 82, students: 115 },
];

function perfScore(t: typeof TEACHER_PERFORMANCE[0]) {
  return Math.round((t.passRate * 0.35) + (t.avgMarks * 0.25) + (t.attendance * 0.25) + (t.lessonCompletion * 0.15));
}

export default function AnalyticsPage() {
  const [analyticsTab, setAnalyticsTab] = useState<'overview' | 'teachers'>('overview');
  const [teacherSort, setTeacherSort] = useState<'score' | 'passRate' | 'attendance' | 'students'>('score');

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

  const sortedTeachers = [...TEACHER_PERFORMANCE].sort((a, b) => {
    if (teacherSort === 'score') return perfScore(b) - perfScore(a);
    if (teacherSort === 'passRate') return b.passRate - a.passRate;
    if (teacherSort === 'attendance') return b.attendance - a.attendance;
    return b.students - a.students;
  });

  const avgPassRate = Math.round(TEACHER_PERFORMANCE.reduce((s, t) => s + t.passRate, 0) / TEACHER_PERFORMANCE.length);
  const avgAttendance = Math.round(TEACHER_PERFORMANCE.reduce((s, t) => s + t.attendance, 0) / TEACHER_PERFORMANCE.length);
  const avgLesson = Math.round(TEACHER_PERFORMANCE.reduce((s, t) => s + t.lessonCompletion, 0) / TEACHER_PERFORMANCE.length);
  const topTeacher = [...TEACHER_PERFORMANCE].sort((a, b) => perfScore(b) - perfScore(a))[0];
  const bottomTeacher = [...TEACHER_PERFORMANCE].sort((a, b) => perfScore(a) - perfScore(b))[0];

  return (
    <>
      <Topbar title="Analytics" subtitle="School performance insights" />
      <div className="p-6">
        <PageHeader title="Analytics Dashboard" subtitle="Live data from your school"
          action={
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setAnalyticsTab('overview')} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${analyticsTab === 'overview' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>Overview</button>
              <button onClick={() => setAnalyticsTab('teachers')} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${analyticsTab === 'teachers' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>Teacher Performance</button>
            </div>
          }
        />

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

        {analyticsTab === 'overview' && (
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

            {/* Teacher Activity */}
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
        )}

        {analyticsTab === 'teachers' && (
          <div className="space-y-5">
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg. Pass Rate', value: `${avgPassRate}%`, icon: '🎯', bg: 'bg-green-50', fg: 'text-green-700', sub: 'Across all teachers' },
                { label: 'Avg. Attendance', value: `${avgAttendance}%`, icon: '📋', bg: 'bg-blue-50', fg: 'text-blue-700', sub: 'Teacher punctuality' },
                { label: 'Lesson Completion', value: `${avgLesson}%`, icon: '📚', bg: 'bg-purple-50', fg: 'text-purple-700', sub: 'Curriculum coverage' },
                { label: 'Top Performer', value: topTeacher.name.split(' ')[1], icon: '🏆', bg: 'bg-yellow-50', fg: 'text-yellow-700', sub: `Score: ${perfScore(topTeacher)}` },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-2xl font-black ${s.fg}`}>{s.value}</p>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">{s.label}</p>
                    </div>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Performance table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <h3 className="font-bold text-gray-900">Teacher Performance Analytics</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Composite score = Pass Rate (35%) + Avg Marks (25%) + Attendance (25%) + Lesson Completion (15%)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Sort by:</span>
                  <select value={teacherSort} onChange={e => setTeacherSort(e.target.value as any)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none">
                    <option value="score">Composite Score</option>
                    <option value="passRate">Pass Rate</option>
                    <option value="attendance">Attendance</option>
                    <option value="students">Students</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Rank', 'Teacher', 'Department', 'Students', 'Pass Rate', 'Avg Marks', 'Attendance', 'Lesson %', 'Score'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedTeachers.map((t, idx) => {
                      const score = perfScore(t);
                      const isTop = idx === 0 && teacherSort === 'score';
                      const isBottom = idx === sortedTeachers.length - 1 && teacherSort === 'score';
                      return (
                        <tr key={t.name} className={`hover:bg-gray-50 ${isTop ? 'bg-yellow-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-black ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-300'}`}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-gray-900">{t.name}</p>
                            {isTop && <span className="text-xs text-yellow-600 font-medium">Top Performer</span>}
                            {isBottom && <span className="text-xs text-red-500 font-medium">Needs Support</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{t.dept}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">{t.students}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${t.passRate}%`, background: t.passRate >= 90 ? '#16a34a' : t.passRate >= 75 ? '#3b82f6' : '#ef4444' }} />
                              </div>
                              <span className={`text-xs font-bold ${t.passRate >= 90 ? 'text-green-600' : t.passRate >= 75 ? 'text-blue-600' : 'text-red-500'}`}>{t.passRate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${t.avgMarks >= 80 ? 'text-green-600' : t.avgMarks >= 65 ? 'text-blue-600' : 'text-red-500'}`}>{t.avgMarks}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-blue-400" style={{ width: `${t.attendance}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${t.attendance >= 95 ? 'text-green-600' : t.attendance >= 85 ? 'text-yellow-600' : 'text-red-500'}`}>{t.attendance}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-purple-400" style={{ width: `${t.lessonCompletion}%` }} />
                              </div>
                              <span className="text-xs font-bold text-purple-600">{t.lessonCompletion}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${score >= 90 ? 'bg-green-100 text-green-700' : score >= 80 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {score}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance charts row */}
            <div className="grid grid-cols-2 gap-5">
              <Card title="Pass Rate by Teacher" subtitle="Student exam outcomes">
                {sortedTeachers.map(t => (
                  <Bar key={t.name} label={t.name.split(' ').slice(1).join(' ')} value={t.passRate} max={100} suffix="%" color={t.passRate >= 90 ? '#16a34a' : t.passRate >= 80 ? '#3b82f6' : '#f59e0b'} />
                ))}
              </Card>
              <Card title="Lesson Plan Completion" subtitle="Curriculum coverage rate">
                {sortedTeachers.map(t => (
                  <Bar key={t.name} label={t.name.split(' ').slice(1).join(' ')} value={t.lessonCompletion} max={100} suffix="%" color="#7c3aed" />
                ))}
              </Card>
            </div>

            {/* Attention needed */}
            {TEACHER_PERFORMANCE.some(t => t.passRate < 85 || t.attendance < 92) && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="font-bold text-amber-900 text-sm mb-3">Attention Required</p>
                <div className="space-y-2">
                  {TEACHER_PERFORMANCE.filter(t => t.passRate < 85 || t.attendance < 92).map(t => (
                    <div key={t.name} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-100">
                      <span className="text-xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{t.name}</p>
                        <div className="flex gap-3 mt-0.5">
                          {t.passRate < 85 && <span className="text-xs text-red-600">Pass rate: {t.passRate}% (target: 85%)</span>}
                          {t.attendance < 92 && <span className="text-xs text-orange-600">Attendance: {t.attendance}% (target: 92%)</span>}
                        </div>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-bold">Score: {perfScore(t)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

