'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const NAV = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard'     },
  { id: 'classes',     icon: '🏫', label: 'My Classes'    },
  { id: 'attendance',  icon: '✅', label: 'Attendance'    },
  { id: 'grades',      icon: '🎯', label: 'Grades'        },
  { id: 'assignments', icon: '📝', label: 'Assignments'   },
  { id: 'timetable',   icon: '🗓️', label: 'Timetable'    },
  { id: 'lms',         icon: '🎓', label: 'LMS / Courses' },
  { id: 'notices',     icon: '📢', label: 'Notices'       },
  { id: 'leave',       icon: '🏖️', label: 'Leave Request' },
];

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${color}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm opacity-80 mt-1">{label}</div>
    </div>
  );
}

function AttendanceView({ slug }: { slug: string }) {
  const [section, setSection] = useState('');
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const { data: students }    = useQuery({
    queryKey: ['portal-students', slug, section],
    queryFn:  () => apiClient.get(`/students?tenantSlug=${slug}&sectionId=${section}`),
    enabled:  !!section,
  });

  const studentList: any[] = (students as any)?.data || [];
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});

  const mark = (id: string, status: 'PRESENT' | 'ABSENT' | 'LATE') =>
    setAttendance(a => ({ ...a, [id]: status }));

  const submit = async () => {
    await apiClient.post('/attendance/mark-bulk', {
      sectionId: section, date,
      records: Object.entries(attendance).map(([studentId, status]) => ({ studentId, status })),
    });
    alert('Attendance saved successfully!');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mark Attendance</h2>
      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <input type="text" placeholder="Section ID" value={section} onChange={e => setSection(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
      </div>
      {studentList.length > 0 ? (
        <div className="space-y-2">
          {studentList.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-sm">
                  {s.firstName?.[0]}{s.lastName?.[0]}
                </div>
                <span className="font-medium text-gray-800">{s.firstName} {s.lastName}</span>
              </div>
              <div className="flex gap-2">
                {(['PRESENT', 'LATE', 'ABSENT'] as const).map(st => (
                  <button key={st} onClick={() => mark(s.id, st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      attendance[s.id] === st
                        ? st === 'PRESENT' ? 'bg-green-600 text-white'
                          : st === 'LATE' ? 'bg-amber-500 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>{st}</button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={submit}
            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all">
            Save Attendance
          </button>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">✅</div>
          <p>Enter a Section ID to load students</p>
        </div>
      )}
    </div>
  );
}

function GradesView({ slug }: { slug: string }) {
  const [studentId, setStudentId] = useState('');
  const { data: grades } = useQuery({
    queryKey: ['portal-grades', studentId],
    queryFn:  () => apiClient.get(`/grades/student/${studentId}`),
    enabled:  !!studentId,
  });
  const list: any[] = Array.isArray(grades) ? grades : [];
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Student Grades</h2>
      <input type="text" placeholder="Enter Student ID" value={studentId}
        onChange={e => setStudentId(e.target.value)}
        className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6 w-full max-w-sm" />
      {list.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 rounded-xl">
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">Subject</th>
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">Type</th>
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">Score</th>
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">Grade</th>
            </tr></thead>
            <tbody>
              {list.map((g: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{g.subject?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{g.type}</td>
                  <td className="px-4 py-3">{g.score}/{g.maxScore}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      g.grade === 'A' ? 'bg-green-100 text-green-700' :
                      g.grade === 'B' ? 'bg-blue-100 text-blue-700'  :
                      g.grade === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{g.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🎯</div><p>Enter a student ID to view grades</p></div>
      )}
    </div>
  );
}

function TimetableView({ slug }: { slug: string }) {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const { data: profile } = useQuery({ queryKey: ['teacher-me'], queryFn: () => apiClient.get('/teachers/me') });
  const teacherId = (profile as any)?.id;
  const { data: slots } = useQuery({
    queryKey: ['teacher-timetable', teacherId],
    queryFn:  () => apiClient.get(`/timetable/teacher/${teacherId}`),
    enabled:  !!teacherId,
  });
  const list: any[] = Array.isArray(slots) ? slots : [];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Timetable</h2>
      <div className="space-y-4">
        {DAYS.map(day => {
          const daySlots = list.filter(s => s.dayOfWeek === day);
          return (
            <div key={day} className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="font-bold text-gray-700 mb-3">{day}</p>
              {daySlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s: any, i: number) => (
                    <div key={i} className="bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 text-sm">
                      <p className="font-semibold text-teal-800">{s.subject?.name}</p>
                      <p className="text-teal-600 text-xs">{s.startTime} – {s.endTime} · {s.room}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No classes</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeaveView() {
  const [reason, setReason] = useState('');
  const [from,   setFrom]   = useState('');
  const [to,     setTo]     = useState('');
  const [sent,   setSent]   = useState(false);

  const submit = async () => {
    await apiClient.post('/hr-extended/leave-requests', { reason, fromDate: from, toDate: to, type: 'CASUAL' });
    setSent(true);
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Apply for Leave</h2>
      {sent ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-3">✅</div>
          <p className="font-bold text-gray-700">Leave request submitted!</p>
          <p className="text-sm text-gray-500 mt-1">Your admin will review it shortly.</p>
          <button onClick={() => setSent(false)} className="mt-4 text-teal-600 text-sm hover:underline">Submit another</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
              placeholder="Describe the reason for your leave…"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>
          <button onClick={submit} disabled={!from || !to || !reason}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all">
            Submit Leave Request
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeacherPortal() {
  const { slug }       = useParams<{ slug: string }>();
  const [active, setActive] = useState('dashboard');

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher-me'],
    queryFn:  () => apiClient.get('/teachers/me'),
  });

  const t = teacher as any;

  const renderContent = () => {
    switch (active) {
      case 'dashboard':   return <Dashboard teacher={t} slug={slug} onNavigate={setActive} />;
      case 'attendance':  return <AttendanceView slug={slug} />;
      case 'grades':      return <GradesView slug={slug} />;
      case 'timetable':   return <TimetableView slug={slug} />;
      case 'leave':       return <LeaveView />;
      case 'classes':     return <MyClasses teacher={t} slug={slug} />;
      case 'assignments': return <TeacherAssignments teacher={t} />;
      case 'lms':         return <TeacherLMS teacher={t} />;
      case 'notices':     return <TeacherNotices slug={slug} />;
      default:            return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-teal-900 to-teal-800 flex flex-col fixed top-0 bottom-0 left-0 z-10 shadow-xl">
        <div className="p-6 border-b border-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl">👨‍🏫</div>
            <div>
              <p className="text-white font-bold text-sm">Teacher Portal</p>
              <p className="text-teal-300 text-xs capitalize">{slug}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                active === item.id
                  ? 'bg-white text-teal-800 shadow-md'
                  : 'text-teal-100 hover:bg-teal-700'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        {!isLoading && t && (
          <div className="p-4 border-t border-teal-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-sm">
                {t.firstName?.[0]}{t.lastName?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{t.firstName} {t.lastName}</p>
                <p className="text-teal-300 text-xs truncate">{t.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 p-8">
        {renderContent()}
      </main>
    </div>
  );
}

function Dashboard({ teacher, slug, onNavigate }: { teacher: any; slug: string; onNavigate: (id: string) => void }) {
  const { data: stats } = useQuery({
    queryKey: ['teacher-dashboard', slug],
    queryFn:  () => apiClient.get(`/dashboard`),
  });
  const s = stats as any;
  const attendanceRate = s?.attendance?.rate;

  const teacherId = teacher?.id;
  const { data: slotsData } = useQuery({
    queryKey: ['teacher-timetable', teacherId],
    queryFn:  () => apiClient.get(`/timetable/teacher/${teacherId}`),
    enabled:  !!teacherId,
  });
  const allSlots: any[] = Array.isArray(slotsData) ? slotsData : (slotsData as any)?.data ?? [];
  const uniqueSections = new Set(allSlots.map((sl: any) => sl.sectionId).filter(Boolean)).size;
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySlots = allSlots.filter((sl: any) => sl.dayOfWeek === todayName).sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Welcome back, {teacher?.firstName || 'Teacher'} 👋
        </h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👩‍🎓" label="Students (School)" value={s?.totalStudents  ?? '—'} color="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard icon="🏫" label="My Classes"    value={uniqueSections || '—'} color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard icon="✅" label="Avg Attendance" value={attendanceRate !== undefined ? `${attendanceRate}%` : '—'} color="bg-gradient-to-br from-green-500 to-green-700" />
        <StatCard icon="📝" label="Upcoming Exams" value={s?.upcomingExams?.length ?? '0'} color="bg-gradient-to-br from-amber-500 to-amber-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '✅', label: 'Mark Attendance', id: 'attendance' },
              { icon: '🎯', label: 'Enter Grades',    id: 'grades'     },
              { icon: '📋', label: 'View Timetable',  id: 'timetable'  },
              { icon: '🏖️', label: 'Apply Leave',     id: 'leave'      },
            ].map(a => (
              <button key={a.id} onClick={() => onNavigate(a.id)}
                className="flex flex-col items-center gap-2 p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all text-center">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-semibold text-teal-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Today&apos;s Classes</h3>
          {todaySlots.length === 0 ? (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
              <span className="text-2xl">🗓️</span>
              <div>
                <p className="font-medium text-gray-700">No classes scheduled today</p>
                <p className="text-xs text-gray-400">Go to Timetable from the sidebar for the full week</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySlots.map((sl: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
                  <div className="min-w-14 text-center">
                    <p className="text-xs font-bold text-teal-700">{sl.startTime}</p>
                    <p className="text-xs text-teal-400">{sl.endTime}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-sm">{sl.subject?.name || 'Subject'}</p>
                    <p className="text-xs text-gray-400">{sl.room ? `Room ${sl.room}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Missing Teacher Portal Components ──────────────────────────────────────────

function MyClasses({ teacher, slug }: { teacher: any; slug: string }) {
  const { data } = useQuery({ queryKey: ['teacher-classes', teacher?.id], queryFn: () => apiClient.get(`/timetable?teacherId=${teacher?.id}`), enabled: !!teacher?.id });
  const slots: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const sections = [...new Map(slots.map(s => [s.sectionId, s.section])).entries()].map(([,v]) => v).filter(Boolean);
  return (
    <div className="p-4 space-y-4">
      <h2 className="font-black text-gray-900 text-lg">🏫 My Classes</h2>
      {sections.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🏫</div><p>No classes assigned</p></div> :
        <div className="grid grid-cols-2 gap-3">
          {sections.map((sec: any) => {
            const secSlots = slots.filter(s => s.sectionId === sec?.id);
            const subjects = [...new Set(secSlots.map(s => s.subject?.name).filter(Boolean))];
            return (
              <div key={sec?.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="font-black text-gray-900">{sec?.class?.name}</h3>
                <p className="text-sm text-gray-500">{sec?.name}</p>
                <div className="mt-2 flex flex-wrap gap-1">{subjects.map(s => <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">{s}</span>)}</div>
                <p className="text-xs text-gray-400 mt-2">{secSlots.length} period{secSlots.length!==1?'s':''}/week</p>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

function TeacherAssignments({ teacher }: { teacher: any }) {
  const [modal, setModal] = React.useState(false);
  const [form, setForm] = React.useState({ title:'', description:'', dueDate:'', sectionId:'' });
  const { data: sections } = useQuery({ queryKey:['my-sections', teacher?.id], queryFn:()=>apiClient.get(`/timetable?teacherId=${teacher?.id}`) });
  const { data, refetch } = useQuery({ queryKey:['teacher-assignments', teacher?.id], queryFn:()=>apiClient.get(`/content/assignments?teacherId=${teacher?.id}`), enabled:!!teacher?.id });
  const assignments: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const mySections = [...new Map((Array.isArray(sections)?(sections as any[]):(sections as any)?.data??[]).map((s:any)=>[s.sectionId, s.section])).entries()].map(([,v])=>v).filter(Boolean);

  const create = async () => {
    await apiClient.post('/content/assignments', { ...form, teacherId: teacher?.id });
    setModal(false); setForm({ title:'', description:'', dueDate:'', sectionId:'' }); refetch();
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-gray-900 text-lg">📝 Assignments</h2>
        <button onClick={() => setModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">+ New Assignment</button>
      </div>
      {assignments.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">📝</div><p>No assignments created yet</p></div> :
        <div className="space-y-3">
          {assignments.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div><h3 className="font-bold text-sm">{a.title}</h3><p className="text-xs text-gray-400 mt-0.5">{a.section?.class?.name} {a.section?.name}</p></div>
                <span className="text-xs text-gray-500">Due: {new Date(a.dueDate).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</span>
              </div>
              {a.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.description}</p>}
              <p className="text-xs text-blue-600 font-bold mt-2">{a.submissionCount ?? 0} submissions</p>
            </div>
          ))}
        </div>
      }
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-black text-gray-900">New Assignment</h3>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Assignment title *" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} placeholder="Description / instructions" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 resize-none"/>
            <select value={form.sectionId} onChange={e=>setForm(f=>({...f,sectionId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Select class section *</option>
              {mySections.map((s:any)=><option key={s?.id} value={s?.id}>{s?.class?.name} — {s?.name}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
            <div className="flex gap-3">
              <button onClick={()=>setModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
              <button onClick={create} disabled={!form.title||!form.sectionId||!form.dueDate} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-40">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherLMS({ teacher }: { teacher: any }) {
  const { data } = useQuery({ queryKey:['teacher-courses', teacher?.id], queryFn:()=>apiClient.get(`/content/courses?teacherId=${teacher?.id}`), enabled:!!teacher?.id });
  const courses: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  return (
    <div className="p-4 space-y-3">
      <h2 className="font-black text-gray-900 text-lg">🎓 LMS / Courses</h2>
      {courses.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🎓</div><p>No courses assigned</p></div> :
        <div className="grid grid-cols-2 gap-3">
          {courses.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-2xl mb-2">{c.icon || '📖'}</div>
              <h3 className="font-bold text-sm">{c.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{c.subject?.name}</p>
              <p className="text-xs text-blue-600 font-bold mt-2">{c.enrollmentCount ?? 0} students</p>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function TeacherNotices({ slug }: { slug: string }) {
  const { data } = useQuery({ queryKey:['teacher-notices', slug], queryFn:()=>apiClient.get(`/announcements?tenantSlug=${slug}&limit=20`) });
  const notices: any[] = (data as any)?.data ?? [];
  return (
    <div className="p-4 space-y-3">
      <h2 className="font-black text-gray-900 text-lg">📢 Notices</h2>
      {notices.length === 0 ? <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">📢</div><p>No notices</p></div> :
        <div className="space-y-3">
          {notices.map((n: any) => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 ${n.isPinned?'border-blue-200':'border-gray-100'}`}>
              {n.isPinned && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">📌 Pinned</span>}
              <h3 className="font-bold text-sm mt-1">{n.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{n.content ?? n.body}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'long'})}</p>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
