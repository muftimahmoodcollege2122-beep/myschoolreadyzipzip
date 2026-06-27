'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { useAuthStore } from '@/stores/auth.store';
import { Badge } from '@/components/shared/badge';
import {
  useStudents,
  useStudentGrades,
  useStudentAttendance,
  useStudentFees,
  useAnnouncements,
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

function ChildDetail({ student }: { student: any }) {
  const [tab, setTab] = useState<'attendance'|'grades'|'fees'>('attendance');
  const sid = student?.id;
  const { data: gradesRaw,     isLoading: loadingG } = useStudentGrades(sid);
  const { data: attendanceRaw, isLoading: loadingA } = useStudentAttendance(sid);
  const { data: feesRaw,       isLoading: loadingF } = useStudentFees(sid);

  const grades     = (gradesRaw as any[]) || [];
  const attendance = (attendanceRaw as any[]) || [];
  const fees       = (feesRaw as any[]) || [];
  const presentCount = attendance.filter((a:any) => a.status === 'PRESENT').length;
  const attRate      = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const avgScore     = grades.length > 0 ? Math.round(grades.reduce((s:number,g:any)=>s+(g.marksObtained/g.totalMarks)*100,0)/grades.length) : 0;
  const pendingFees  = fees.filter((f:any) => f.status === 'PENDING' || f.status === 'OVERDUE');
  const totalPending = pendingFees.reduce((s:number,f:any)=>s+Number(f.amount||0),0);

  const enrollment = student?.enrollments?.[0];
  const className  = enrollment?.section?.class?.name || '';
  const sectionName = enrollment?.section?.name || '';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Child header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black">{student.user?.profile?.firstName} {student.user?.profile?.lastName}</h3>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-violet-200">
              {className && <span>📚 {className}{sectionName ? ` · ${sectionName}` : ''}</span>}
              {student.rollNumber && <span>🎯 Roll #{student.rollNumber}</span>}
              {student.admissionNo && <span>🆔 {student.admissionNo}</span>}
            </div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">👦</div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label:'Attendance', value: attendance.length > 0 ? `${attRate}%` : '—' },
            { label:'Avg Score',  value: grades.length > 0 ? `${avgScore}%` : '—' },
            { label:'Due Fees',   value: pendingFees.length > 0 ? `Rs.${Math.round(totalPending/1000)}K` : 'Clear ✓' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-lg p-2 text-center">
              <p className="font-black text-white">{s.value}</p>
              <p className="text-xs text-violet-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Child tab bar */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        {[
          { key:'attendance', label:'✅ Attendance' },
          { key:'grades',     label:'📊 Grades' },
          { key:'fees',       label:'💰 Fees' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-semibold transition-all ${tab === t.key ? 'bg-white border-b-2 border-violet-600 text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === 'attendance' && (
          loadingA ? <Skeleton/> : attendance.length === 0
            ? <Empty icon="📋" title="No records" desc="Attendance will appear once recorded"/>
            : (
              <div className="space-y-2">
                {attendance.slice(0,10).map((a:any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{new Date(a.date).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</span>
                    <Badge label={a.status} color={a.status==='PRESENT'?'green':a.status==='LATE'?'yellow':'red'} size="sm"/>
                  </div>
                ))}
              </div>
            )
        )}

        {tab === 'grades' && (
          loadingG ? <Skeleton/> : grades.length === 0
            ? <Empty icon="📊" title="No grades yet" desc="Grades appear once teachers submit results"/>
            : (
              <div className="space-y-2">
                {grades.map((g:any) => {
                  const pct = Math.round((g.marksObtained / g.totalMarks) * 100);
                  return (
                    <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{g.classSubject?.subject?.name || 'Subject'}</p>
                        <p className="text-xs text-gray-400">{g.marksObtained}/{g.totalMarks}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full bg-violet-500 rounded-full" style={{width:`${pct}%`}}/>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        )}

        {tab === 'fees' && (
          loadingF ? <Skeleton/> : fees.length === 0
            ? <Empty icon="💰" title="No fees yet" desc="Fee invoices will appear here once generated"/>
            : (
              <div className="space-y-2">
                {fees.map((f:any) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{f.description || f.feeType || 'Fee'}</p>
                      <p className="text-xs text-gray-400">Due: {f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">Rs. {Number(f.amount).toLocaleString()}</p>
                      <Badge label={f.status} color={f.status==='PAID'?'green':f.status==='OVERDUE'?'red':'yellow'} size="sm"/>
                    </div>
                  </div>
                ))}
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default function ParentPortalPage() {
  const { user } = useAuthStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string|null>(null);

  const { data: studentsRaw, isLoading: loadingStudents } = useStudents({ limit: 20 });
  const { data: announcementsRaw } = useAnnouncements();

  const students = (studentsRaw as any)?.data ?? [];
  const notices  = (announcementsRaw as any)?.data ?? (Array.isArray(announcementsRaw) ? announcementsRaw : []);

  const isAdmin = user?.role === 'SCHOOL_ADMIN';

  const selectedStudent = students.find((s:any) => s.id === selectedStudentId) || students[0] || null;

  return (
    <>
      <Topbar title="Parent Portal" subtitle="Monitor your child's progress" />
      <div className="p-6 space-y-5">

        {/* Admin notice */}
        {isAdmin && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-2xl">👀</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">Admin Preview</p>
              <p className="text-amber-600 text-xs">Parents see their children's grades, attendance and fees here. You're viewing all students as admin.</p>
            </div>
          </div>
        )}

        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-sm">Parent Portal</p>
              <h2 className="text-2xl font-black mt-1">{user?.email?.split('@')[0] || 'Parent'}</h2>
              <p className="text-violet-200 text-sm mt-1">
                {students.length > 0
                  ? `Monitoring ${students.length} student${students.length !== 1 ? 's' : ''}`
                  : 'No students enrolled yet'}
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">👨‍👩‍👦</div>
          </div>
        </div>

        {/* Quick stats */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label:'Students',     value: students.length,                 icon:'👩‍🎓', bg:'bg-violet-50', fg:'text-violet-700' },
              { label:'Announcements',value: notices.length,                  icon:'📢', bg:'bg-blue-50',   fg:'text-blue-700' },
              { label:'School',       value: 'Active',                        icon:'🏫', bg:'bg-green-50',  fg:'text-green-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <span className="text-xl">{s.icon}</span>
                <p className={`text-xl font-black mt-1 ${s.fg}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Student selector */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-3">👩‍🎓 Students</h3>
            {loadingStudents
              ? <Skeleton/>
              : students.length === 0
                ? <Empty icon="👩‍🎓" title="No students yet" desc="Enroll students to track them here" cta={<Link href="/students" className="text-sm text-violet-600 font-semibold">Enroll students →</Link>}/>
                : (
                  <div className="space-y-2">
                    {students.map((s:any) => {
                      const enroll = s.enrollments?.[0];
                      const isSelected = (selectedStudent?.id || students[0]?.id) === s.id;
                      return (
                        <button key={s.id} onClick={() => setSelectedStudentId(s.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected ? 'border-violet-300 bg-violet-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                          <p className={`text-sm font-semibold ${isSelected ? 'text-violet-800' : 'text-gray-800'}`}>
                            {s.user?.profile?.firstName} {s.user?.profile?.lastName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {enroll ? `${enroll.section?.class?.name || ''}${enroll.section?.name || ''}` : s.admissionNo || 'No class'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )
            }

            {/* Announcements */}
            {notices.length > 0 && (
              <div className="mt-5">
                <h4 className="font-bold text-gray-700 text-sm mb-2">📢 Latest Notice</h4>
                {notices.slice(0,2).map((n:any) => (
                  <div key={n.id} className="p-3 bg-blue-50 rounded-lg mb-2">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body || n.content || ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Child detail */}
          <div className="lg:col-span-2">
            {selectedStudent
              ? <ChildDetail student={selectedStudent}/>
              : loadingStudents
                ? <div className="bg-white rounded-xl border border-gray-100 p-6"><Skeleton/></div>
                : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <Empty icon="👈" title="Select a student" desc="Pick a student from the left panel to view their details"/>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </>
  );
}
