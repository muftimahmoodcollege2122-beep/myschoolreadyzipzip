'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { useAuthStore } from '@/stores/auth.store';
import { Badge } from '@/components/shared/badge';
import {
  useMyTeacher,
  useTeacherSchedule,
  useTeacherTimetable,
  useTeachers,
  useExams,
  useAnnouncements,
  useStudents,
  useAttendance,
  useMarkAttendance,
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

export default function TeacherPortalPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'home'|'schedule'|'students'|'attendance'|'exams'>('home');
  const [attSectionId, setAttSectionId] = useState('');
  const [attDate, setAttDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, string>>({});

  const { data: myTeacher, isLoading: loadingMe } = useMyTeacher();
  const teacherId = (myTeacher as any)?.id;

  const { data: scheduleRaw,  isLoading: loadingSchedule }  = useTeacherSchedule(teacherId);
  const { data: timetableRaw, isLoading: loadingTimetable } = useTeacherTimetable(teacherId);
  const { data: teachersRaw }   = useTeachers({ limit: 10 });
  const { data: examsRaw }      = useExams();
  const { data: studentsRaw }   = useStudents({ limit: 10 });
  const { data: announcementsRaw } = useAnnouncements();

  const schedule     = (scheduleRaw as any[]) || [];
  const timetable    = (timetableRaw as any[]) || [];
  const teachers     = (teachersRaw as any)?.data ?? [];
  const exams        = (examsRaw as any)?.data ?? (Array.isArray(examsRaw) ? examsRaw : []);
  const students     = (studentsRaw as any)?.data ?? [];
  const notices      = (announcementsRaw as any)?.data ?? (Array.isArray(announcementsRaw) ? announcementsRaw : []);

  const slots = timetable.length > 0 ? timetable : schedule;

  const dept        = (myTeacher as any)?.department?.name || '';
  const employeeId  = (myTeacher as any)?.employeeId || '';
  const firstName   = (myTeacher as any)?.user?.profile?.firstName || user?.email?.split('@')[0] || 'Teacher';
  const lastName    = (myTeacher as any)?.user?.profile?.lastName  || '';
  const isAdmin     = user?.role === 'SCHOOL_ADMIN';

  const uniqueSubjects = Array.from(new Set(slots.map((s:any) => s.classSubject?.subject?.name).filter(Boolean)));
  const uniqueSections = Array.from(new Set(slots.map((s:any) => s.section ? `${s.section?.class?.name || ''}${s.section?.name || ''}` : null).filter(Boolean)));

  // Sections this teacher actually teaches, deduped by id, for the attendance picker
  const teacherSections = Array.from(
    new Map(slots.filter((s:any) => s.section?.id).map((s:any) => [s.section.id, s.section])).values()
  ) as any[];

  const { data: sectionStudentsRaw, isLoading: loadingSectionStudents } = useStudents(
    attSectionId ? { sectionId: attSectionId, limit: 200, isActive: true } : { limit: 0 }
  );
  const sectionStudents = (sectionStudentsRaw as any)?.data ?? [];
  const { data: existingAtt } = useAttendance(attSectionId, attDate);
  const markAttendance = useMarkAttendance();

  React.useEffect(() => {
    if (Array.isArray(existingAtt)) {
      const m: Record<string, string> = {};
      existingAtt.forEach((r: any) => { m[r.studentId] = r.status; });
      setMarks(m);
    } else {
      setMarks({});
    }
  }, [existingAtt, attSectionId, attDate]);

  const handleSaveAttendance = () => {
    if (!attSectionId) return;
    const records = sectionStudents.map((s: any) => ({
      studentId: s.id,
      status: marks[s.id] ?? 'PRESENT',
      date: attDate,
    }));
    markAttendance.mutate({ sectionId: attSectionId, records });
  };

  const TABS = [
    { key:'home',       label:'🏠 Home' },
    { key:'schedule',   label:'📅 Schedule' },
    { key:'students',   label:'👩‍🎓 Students' },
    { key:'attendance', label:'✅ Attendance' },
    { key:'exams',      label:'📝 Exams' },
  ] as const;

  return (
    <>
      <Topbar title="Teacher Portal" subtitle="Your teaching dashboard" />
      <div className="p-6 space-y-5">

        {/* Admin notice */}
        {isAdmin && !loadingMe && !myTeacher && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <span className="text-2xl">👀</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">Admin Preview Mode</p>
              <p className="text-amber-600 text-xs">Teachers see their personal schedule and class info when they log in.</p>
            </div>
          </div>
        )}

        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm">Good day,</p>
              {loadingMe
                ? <div className="h-8 w-48 bg-white/20 rounded-lg mt-1 animate-pulse"/>
                : <h2 className="text-2xl font-black mt-1">{ myTeacher ? `${firstName} ${lastName}` : 'Teaching Staff'}</h2>
              }
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-100">
                {dept        && <span>🏫 {dept}</span>}
                {employeeId  && <span>🆔 {employeeId}</span>}
                {uniqueSubjects.length > 0 && <span>📚 {uniqueSubjects.slice(0,3).join(', ')}</span>}
              </div>
            </div>
            <div className="text-center shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-4xl">👨‍🏫</span>
              </div>
              {myTeacher && <p className="text-xs text-blue-200 mt-1">{uniqueSections.length} class{uniqueSections.length !== 1 ? 'es' : ''}</p>}
            </div>
          </div>
        </div>

        {/* Stats row */}
        {myTeacher ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Subjects',  value: uniqueSubjects.length || '—', icon:'📚', bg:'bg-blue-50',   fg:'text-blue-700' },
              { label:'Sections',  value: uniqueSections.length || '—', icon:'🏫', bg:'bg-indigo-50', fg:'text-indigo-700' },
              { label:'Periods',   value: slots.length || '—',          icon:'📅', bg:'bg-purple-50', fg:'text-purple-700' },
              { label:'Exams',     value: exams.length || '—',          icon:'📝', bg:'bg-green-50',  fg:'text-green-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <span className="text-xl">{s.icon}</span>
                <p className={`text-xl font-black mt-1 ${s.fg}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Teachers',  value: teachers.length || '—', icon:'👩‍🏫', bg:'bg-blue-50',   fg:'text-blue-700' },
              { label:'Students',  value: students.length || '—', icon:'👩‍🎓', bg:'bg-green-50',  fg:'text-green-700' },
              { label:'Exams',     value: exams.length   || '—', icon:'📝', bg:'bg-purple-50', fg:'text-purple-700' },
              { label:'Notices',   value: notices.length || '—', icon:'📢', bg:'bg-yellow-50', fg:'text-yellow-700' },
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
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${tab === t.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
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
                ? <Empty icon="📢" title="No announcements" desc="School-wide announcements appear here"/>
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

            {/* Today's schedule or teacher list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">
                {myTeacher ? "📅 Today's Classes" : '👩‍🏫 Teaching Staff'}
              </h3>
              {myTeacher ? (
                loadingSchedule ? <Skeleton/> : slots.length === 0
                  ? <Empty icon="📅" title="No classes today" desc="Your schedule will appear here"/>
                  : (
                    <div className="space-y-2">
                      {slots.slice(0,6).map((s:any) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                          <div className="min-w-14 text-center">
                            <p className="text-xs font-bold text-indigo-700">{s.startTime}</p>
                            <p className="text-xs text-indigo-400">{s.endTime}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{s.classSubject?.subject?.name || 'Subject'}</p>
                            <p className="text-xs text-gray-500">{s.section?.class?.name || ''}{s.section?.name || ''}{s.room ? ` · Room ${s.room}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              ) : (
                teachers.length === 0
                  ? <Empty icon="👩‍🏫" title="No teachers yet" desc="Add teachers to the school" cta={<Link href="/teachers" className="text-sm text-blue-600 font-semibold">Add teachers →</Link>}/>
                  : (
                    <div className="space-y-2">
                      {teachers.map((t:any) => (
                        <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{t.user?.profile?.firstName} {t.user?.profile?.lastName}</p>
                            <p className="text-xs text-gray-400">{t.department?.name || t.employeeId || ''}</p>
                          </div>
                          <Badge variant={t.isActive ? 'green' : 'red'}>{t.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* ── SCHEDULE tab ── */}
        {tab === 'schedule' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            {!teacherId && !loadingMe
              ? <Empty icon="📅" title="Teacher schedule" desc="Teachers see their full weekly timetable here"/>
              : (loadingSchedule || loadingTimetable)
                ? <Skeleton/>
                : slots.length === 0
                  ? <Empty icon="📅" title="No schedule yet" desc="Timetable will appear once set up" cta={<Link href="/timetable" className="text-sm text-blue-600 font-semibold">Set up timetable →</Link>}/>
                  : (
                    <div className="space-y-4">
                      {[1,2,3,4,5,6].map(day => {
                        const daySlots = slots.filter((s:any) => s.dayOfWeek === day);
                        if (!daySlots.length) return null;
                        return (
                          <div key={day}>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">{['Mon','Tue','Wed','Thu','Fri','Sat'][day-1]}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {daySlots.map((s:any) => (
                                <div key={s.id} className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                  <div className="min-w-12 text-center">
                                    <p className="text-xs font-bold text-indigo-700">{s.startTime}</p>
                                    <p className="text-xs text-indigo-400">{s.endTime}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-800">{s.classSubject?.subject?.name || 'Subject'}</p>
                                    <p className="text-xs text-gray-500">{s.section?.class?.name || ''}{s.section?.name || ''}{s.room ? ` · ${s.room}` : ''}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
            }
          </div>
        )}

        {/* ── STUDENTS tab ── */}
        {tab === 'students' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {students.length === 0
              ? <div className="p-6"><Empty icon="👩‍🎓" title="No students yet" desc="Enroll students to manage them here" cta={<Link href="/students" className="text-sm text-blue-600 font-semibold">Enroll students →</Link>}/></div>
              : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{['Student','Admission No','Class','Status'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.map((s:any) => {
                      const enroll = s.enrollments?.[0];
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-800">{s.user?.profile?.firstName} {s.user?.profile?.lastName}</p>
                            <p className="text-xs text-gray-400">{s.user?.email || ''}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.admissionNo || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{enroll ? `${enroll.section?.class?.name || ''}${enroll.section?.name || ''}` : '—'}</td>
                          <td className="px-4 py-3"><Badge variant={s.isActive ? 'green' : 'red'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* ── ATTENDANCE tab ── */}
        {tab === 'attendance' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
              <select value={attSectionId} onChange={e => setAttSectionId(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400">
                <option value="">Select your class</option>
                {teacherSections.map((s:any) => (
                  <option key={s.id} value={s.id}>{s.class?.name || ''}{s.name || ''}</option>
                ))}
              </select>
              <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            </div>

            {!attSectionId ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <Empty icon="✅" title="Mark attendance" desc="Pick one of your classes above to mark today's attendance" />
              </div>
            ) : loadingSectionStudents ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"><Skeleton/></div>
            ) : sectionStudents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <Empty icon="👩‍🎓" title="No students" desc="This section has no enrolled students" />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {sectionStudents.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-400">Roll #{s.rollNumber ?? '—'}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {['PRESENT','ABSENT','LATE','EXCUSED'].map(st => (
                          <button key={st} onClick={() => setMarks(prev => ({ ...prev, [s.id]: st }))}
                            className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                              marks[s.id] === st
                                ? st === 'PRESENT' ? 'bg-green-600 text-white' : st === 'ABSENT' ? 'bg-red-600 text-white' : st === 'LATE' ? 'bg-amber-500 text-white' : 'bg-gray-400 text-white'
                                : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                            }`}
                            title={st}>
                            {st[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button onClick={handleSaveAttendance} disabled={markAttendance.isPending}
                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                    {markAttendance.isPending ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── EXAMS tab ── */}
        {tab === 'exams' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {exams.length === 0
              ? <div className="p-6"><Empty icon="📝" title="No exams scheduled" desc="Exams will appear here once created" cta={<Link href="/exams" className="text-sm text-blue-600 font-semibold">Manage exams →</Link>}/></div>
              : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>{['Exam','Start Date','End Date','Status'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {exams.map((e:any) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">{e.name || e.title || 'Exam'}</p>
                          <p className="text-xs text-gray-400">{e.examType || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{e.startDate ? new Date(e.startDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{e.endDate ? new Date(e.endDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3"><Badge variant={e.status==='COMPLETED'?'green':e.status==='ONGOING'?'blue':'yellow'}>{e.status || 'Scheduled'}</Badge></td>
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
