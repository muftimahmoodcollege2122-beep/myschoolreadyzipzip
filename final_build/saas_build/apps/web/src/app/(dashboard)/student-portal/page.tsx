'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { useAuthStore } from '@/stores/auth.store';
import { Badge } from '@/components/shared/badge';
import {
  useMyStudent,
  useStudentGrades,
  useStudentAttendance,
  useStudentFees,
  useSectionTimetable,
  useAnnouncements,
  useStudents,
} from '@/hooks/use-api';
import Link from 'next/link';

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_,i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>
      ))}
    </div>
  );
}

function Empty({ icon, title, desc, cta }: { icon:string; title:string; desc:string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="font-bold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1 mb-3">{desc}</p>
      {cta}
    </div>
  );
}

export default function StudentPortalPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'home'|'grades'|'timetable'|'fees'>('home');

  const { data: myStudent, isLoading: loadingMe } = useMyStudent();
  const studentId  = (myStudent as any)?.id;
  const enrollment = (myStudent as any)?.enrollments?.[0];
  const sectionId  = enrollment?.sectionId;
  const className  = enrollment?.section?.class?.name || '';
  const sectionName = enrollment?.section?.name || '';

  const { data: gradesRaw,     isLoading: loadingGrades }     = useStudentGrades(studentId);
  const { data: attendanceRaw, isLoading: loadingAttendance } = useStudentAttendance(studentId);
  const { data: feesRaw,       isLoading: loadingFees }       = useStudentFees(studentId);
  const { data: timetableRaw, isLoading: loadingTimetable }   = useSectionTimetable(sectionId);
  const { data: announcementsRaw } = useAnnouncements();
  const { data: studentsRaw }      = useStudents({ limit: 6 });

  const grades     = (gradesRaw as any[]) || [];
  const attendance = (attendanceRaw as any)?.records ?? [];
  const fees       = (feesRaw as any)?.invoices ?? [];
  const timetableDays = (timetableRaw as any[]) || []; // shape: [{ day, dayName, slots }]
  const notices    = (announcementsRaw as any)?.data ?? ((Array.isArray(announcementsRaw) ? announcementsRaw : []) as any[]);
  const students   = (studentsRaw as any)?.data ?? [];

  const presentCount  = attendance.filter((a:any) => a.status === 'PRESENT').length;
  const attRate       = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const pendingFees   = fees.filter((f:any) => f.status === 'PENDING' || f.status === 'OVERDUE');
  const totalPending  = pendingFees.reduce((s:number, f:any) => s + Number(f.amount || 0), 0);
  const avgScore      = grades.length > 0
    ? Math.round(grades.reduce((s:number, g:any) => s + (Number(g.score) / Number(g.maxScore)) * 100, 0) / grades.length)
    : 0;

  const firstName = (myStudent as any)?.user?.profile?.firstName || user?.email?.split('@')[0] || 'Student';
  const lastName  = (myStudent as any)?.user?.profile?.lastName  || '';
  const isAdmin   = user?.role === 'SCHOOL_ADMIN';

  const TABS = [
    { key:'home',      label:'🏠 Home' },
    { key:'grades',    label:'📊 Grades' },
    { key:'timetable', label:'📅 Timetable' },
    { key:'fees',      label:'💰 Fees' },
  ] as const;

  return (
    <>
      <Topbar title="Student Portal" subtitle="Your personal learning dashboard" />
      <div className="p-6 space-y-5">

        {/* Admin preview notice */}
        {isAdmin && !loadingMe && !myStudent && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-2xl">👀</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">Admin Preview Mode</p>
              <p className="text-amber-600 text-xs">You&apos;re viewing as admin. When students log in they see their personal data here.</p>
            </div>
          </div>
        )}

        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-green-200 text-sm">Welcome back,</p>
              {loadingMe
                ? <div className="h-8 w-48 bg-white/20 rounded-lg mt-1 animate-pulse"/>
                : <h2 className="text-2xl font-black mt-1">{firstName} {lastName}</h2>
              }
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-green-100">
                {className && <span>📚 {className}{sectionName ? ` · ${sectionName}` : ''}</span>}
                {(myStudent as any)?.rollNumber && <span>🎯 Roll #{(myStudent as any).rollNumber}</span>}
                {(myStudent as any)?.admissionNo && <span>🆔 {(myStudent as any).admissionNo}</span>}
              </div>
            </div>
            <div className="text-center shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                {grades.length > 0
                  ? <span className="text-3xl font-black">{avgScore}%</span>
                  : <span className="text-4xl">👩‍🎓</span>
                }
              </div>
              {grades.length > 0 && <p className="text-xs text-green-200 mt-1">Avg Score</p>}
            </div>
          </div>
        </div>

        {/* Stats row (only when student data exists) */}
        {myStudent && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Attendance', value: attendance.length > 0 ? `${attRate}%` : '—', icon:'✅', bg:'bg-green-50', fg:'text-green-700' },
              { label:'Subjects',   value: grades.length || '—',                          icon:'📚', bg:'bg-blue-50',   fg:'text-blue-700' },
              { label:'Avg Score',  value: grades.length > 0 ? `${avgScore}%` : '—',     icon:'📊', bg:'bg-purple-50', fg:'text-purple-700' },
              { label:'Dues',       value: pendingFees.length > 0 ? `Rs.${Math.round(totalPending/1000)}K` : 'Clear ✓', icon:'💰', bg:'bg-yellow-50', fg:'text-yellow-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <span className="text-xl">{s.icon}</span>
                <p className={`text-xl font-black mt-1 ${s.fg}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${tab === t.key ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── HOME tab ── */}
        {tab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Announcements */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">📢 Announcements</h3>
              {notices.length === 0
                ? <Empty icon="📢" title="No announcements" desc="School announcements will appear here"/>
                : (
                  <div className="space-y-2">
                    {notices.slice(0,5).map((n:any) => (
                      <div key={n.id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body || n.content || ''}</p>
                        <p className="text-xs text-blue-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>

            {/* Attendance or Student list (admin) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">
                {myStudent ? '✅ Recent Attendance' : '👩‍🎓 Enrolled Students'}
              </h3>
              {myStudent ? (
                loadingAttendance ? <Skeleton/> : attendance.length === 0
                  ? <Empty icon="📋" title="No records" desc="Attendance will appear once recorded"/>
                  : (
                    <div className="space-y-2">
                      {attendance.slice(0,8).map((a:any) => (
                        <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">{new Date(a.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</span>
                          <Badge variant={a.status==='PRESENT'?'green':a.status==='LATE'?'yellow':'red'}>{a.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )
              ) : (
                students.length === 0
                  ? <Empty icon="👩‍🎓" title="No students yet" desc="Enroll students first" cta={<Link href="/students" className="text-sm text-green-600 font-semibold">Enroll students →</Link>}/>
                  : (
                    <div className="space-y-2">
                      {students.map((s:any) => (
                        <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{s.user?.profile?.firstName} {s.user?.profile?.lastName}</p>
                            <p className="text-xs text-gray-400">{s.admissionNo || s.rollNumber || ''}</p>
                          </div>
                          <Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* ── GRADES tab ── */}
        {tab === 'grades' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {!myStudent && !loadingMe
              ? <div className="p-6"><Empty icon="📊" title="Grade portal" desc="Students see their subject-wise grades here once results are entered"/></div>
              : loadingGrades
                ? <div className="p-6"><Skeleton/></div>
                : grades.length === 0
                  ? <div className="p-6"><Empty icon="📊" title="No grades yet" desc="Grades appear once teachers submit results"/></div>
                  : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>{['Subject','Obtained','Total','%','Grade'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {grades.map((g:any) => {
                          const pct = Math.round((Number(g.score) / Number(g.maxScore)) * 100);
                          const grade = pct>=90?'A+':pct>=80?'A':pct>=70?'B+':pct>=60?'B':'C';
                          return (
                            <tr key={g.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-800">{g.classSubject?.subject?.name || g.subject || 'Subject'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{g.score}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{g.maxScore}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                                    <div className="h-full bg-green-500 rounded-full" style={{width:`${pct}%`}}/>
                                  </div>
                                  <span className="text-sm font-semibold">{pct}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3"><Badge variant={pct>=80?'green':pct>=60?'yellow':'red'}>{grade}</Badge></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )
            }
          </div>
        )}

        {/* ── TIMETABLE tab ── */}
        {tab === 'timetable' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {!sectionId && !loadingMe
              ? <Empty icon="📅" title="No class assigned" desc="Timetable appears once you're enrolled in a class"/>
              : loadingTimetable
                ? <Skeleton/>
                : timetableDays.length === 0
                  ? <Empty icon="📅" title="No timetable yet" desc="Admin hasn't set up the timetable yet" cta={<Link href="/timetable" className="text-sm text-green-600 font-semibold">Set up timetable →</Link>}/>
                  : (
                    <div className="space-y-4">
                      {timetableDays.map((d: any) => (
                        <div key={d.day}>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">{d.dayName}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {(d.slots ?? []).map((s:any) => (
                              <div key={s.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="text-center min-w-12">
                                  <p className="text-xs font-bold text-blue-700">{s.startTime}</p>
                                  <p className="text-xs text-blue-400">{s.endTime}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{s.classSubject?.subject?.name || 'Subject'}</p>
                                  <p className="text-xs text-gray-500">{s.teacher?.user?.profile?.firstName || ''}{s.room ? ` · Room ${s.room}` : ''}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
            }
          </div>
        )}

        {/* ── FEES tab ── */}
        {tab === 'fees' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {!myStudent && !loadingMe
              ? <div className="p-6"><Empty icon="💰" title="Fee portal" desc="Students see their fee invoices and payment history here"/></div>
              : loadingFees
                ? <div className="p-6"><Skeleton/></div>
                : fees.length === 0
                  ? <div className="p-6"><Empty icon="💰" title="No fees yet" desc="Fee invoices will appear here once generated" cta={<Link href="/fees" className="text-sm text-green-600 font-semibold">Manage fees →</Link>}/></div>
                  : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>{['Description','Amount','Due Date','Status'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {fees.map((f:any) => (
                          <tr key={f.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{f.feeStructure?.name || f.notes || 'Fee'}</td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-700">Rs. {Number(f.amount).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3"><Badge variant={f.status==='PAID'?'green':f.status==='OVERDUE'?'red':'yellow'}>{f.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
            }
          </div>
        )}
      </div>
    </>
  );
}
