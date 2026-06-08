'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

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
      case 'dashboard':   return <Dashboard teacher={t} slug={slug} />;
      case 'attendance':  return <AttendanceView slug={slug} />;
      case 'grades':      return <GradesView slug={slug} />;
      case 'timetable':   return <TimetableView slug={slug} />;
      case 'leave':       return <LeaveView />;
      default:
        return (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center"><div className="text-4xl mb-3">{NAV.find(n => n.id === active)?.icon}</div>
            <p className="font-medium">{NAV.find(n => n.id === active)?.label} coming soon</p></div>
          </div>
        );
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

function Dashboard({ teacher, slug }: { teacher: any; slug: string }) {
  const { data: stats } = useQuery({
    queryKey: ['teacher-dashboard', slug],
    queryFn:  () => apiClient.get(`/dashboard/stats?tenantSlug=${slug}`),
  });
  const s = stats as any;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Welcome back, {teacher?.firstName || 'Teacher'} 👋
        </h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👩‍🎓" label="My Students"   value={s?.totalStudents  || '—'} color="bg-gradient-to-br from-teal-500 to-teal-700" />
        <StatCard icon="🏫" label="My Classes"    value={s?.totalClasses   || '—'} color="bg-gradient-to-br from-indigo-500 to-indigo-700" />
        <StatCard icon="✅" label="Avg Attendance" value={s?.attendanceRate ? `${s.attendanceRate}%` : '—'} color="bg-gradient-to-br from-green-500 to-green-700" />
        <StatCard icon="📝" label="Pending Grades" value={s?.pendingGrades  || '0'} color="bg-gradient-to-br from-amber-500 to-amber-700" />
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
              <button key={a.id}
                className="flex flex-col items-center gap-2 p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all text-center">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-semibold text-teal-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Today's Classes</h3>
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
              <span className="text-2xl">🗓️</span>
              <div>
                <p className="font-medium text-gray-700">View your timetable to see today's schedule</p>
                <p className="text-xs text-gray-400">Go to Timetable from the sidebar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
