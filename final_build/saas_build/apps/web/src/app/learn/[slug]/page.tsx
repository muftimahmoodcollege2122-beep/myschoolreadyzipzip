'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

const NAV = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard'    },
  { id: 'timetable',   icon: '🗓️', label: 'Timetable'   },
  { id: 'attendance',  icon: '✅', label: 'My Attendance' },
  { id: 'grades',      icon: '🎯', label: 'My Grades'    },
  { id: 'fees',        icon: '💰', label: 'Fee Status'   },
  { id: 'lms',         icon: '🎓', label: 'Courses'      },
  { id: 'assignments', icon: '📝', label: 'Assignments'  },
  { id: 'library',     icon: '📚', label: 'Library'      },
  { id: 'transport',   icon: '🚌', label: 'Transport'    },
  { id: 'notices',     icon: '📢', label: 'Notices'      },
];

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${color}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm opacity-80 mt-1">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}

function AttendanceSummary({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['my-attendance', studentId],
    queryFn:  () => apiClient.get(`/attendance/student/${studentId}`),
    enabled:  !!studentId,
  });
  const records: any[] = Array.isArray(data) ? data : [];
  const present = records.filter(r => r.status === 'PRESENT').length;
  const absent  = records.filter(r => r.status === 'ABSENT').length;
  const late    = records.filter(r => r.status === 'LATE').length;
  const total   = records.length;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-2xl" />;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Attendance</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-green-700">{present}</p>
          <p className="text-sm text-green-600">Present</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-red-700">{absent}</p>
          <p className="text-sm text-red-600">Absent</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-amber-700">{late}</p>
          <p className="text-sm text-amber-600">Late</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-blue-700">{pct}%</p>
          <p className="text-sm text-blue-600">Rate</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">Subject</th>
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {records.slice(0, 30).map((r: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-700">{r.subject?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                      r.status === 'LATE'    ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GradesSummary({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['my-grades', studentId],
    queryFn:  () => apiClient.get(`/grades/student/${studentId}`),
    enabled:  !!studentId,
  });
  const grades: any[] = Array.isArray(data) ? data : [];

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-2xl" />;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Grades</h2>
      {grades.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🎯</div><p>No grades recorded yet</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {grades.map((g: any, i: number) => {
            const pct = g.maxScore ? Math.round((g.score / g.maxScore) * 100) : 0;
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{g.subject?.name || 'Subject'}</p>
                    <p className="text-xs text-gray-500">{g.type} · {g.examTitle || ''}</p>
                  </div>
                  <span className={`text-lg font-black px-3 py-1 rounded-xl ${
                    g.grade === 'A' || g.grade === 'A+' ? 'bg-green-100 text-green-700' :
                    g.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                    g.grade === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{g.grade}</span>
                </div>
                <div className="mb-2 flex justify-between text-sm text-gray-500">
                  <span>Score: {g.score}/{g.maxScore}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeeStatus({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['my-fees', studentId],
    queryFn:  () => apiClient.get(`/fees/student/${studentId}`),
    enabled:  !!studentId,
  });
  const invoices: any[] = Array.isArray(data) ? data : (data as any)?.data || [];

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-2xl" />;

  const pending = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE');
  const paid    = invoices.filter(inv => inv.status === 'PAID');

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Fee Status</h2>
      {pending.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="font-bold text-red-700 mb-2">⚠️ Pending Dues</p>
          {pending.map((inv: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-red-100 last:border-0">
              <div>
                <p className="font-medium text-red-800">{inv.title || 'Fee Invoice'}</p>
                <p className="text-xs text-red-500">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</p>
              </div>
              <p className="font-black text-red-700">PKR {Number(inv.amount || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-bold text-gray-700">Payment History</p>
        </div>
        {paid.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><p>No payments recorded</p></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paid.map((inv: any, i: number) => (
              <div key={i} className="flex justify-between items-center px-5 py-4">
                <div>
                  <p className="font-medium text-gray-800">{inv.title || 'Fee Invoice'}</p>
                  <p className="text-xs text-gray-400">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">PKR {Number(inv.amount || 0).toLocaleString()}</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">PAID</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentPortal() {
  const { slug }            = useParams<{ slug: string }>();
  const [active, setActive] = useState('dashboard');

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-me'],
    queryFn:  () => apiClient.get('/students/me'),
  });
  const s = student as any;

  const renderContent = () => {
    switch (active) {
      case 'dashboard':  return <StudentDashboard student={s} slug={slug} />;
      case 'attendance': return <AttendanceSummary studentId={s?.id} />;
      case 'grades':     return <GradesSummary studentId={s?.id} />;
      case 'fees':       return <FeeStatus studentId={s?.id} />;
      default:
        return (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">{NAV.find(n => n.id === active)?.icon}</div>
              <p className="font-medium">{NAV.find(n => n.id === active)?.label} coming soon</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-gradient-to-b from-violet-900 to-violet-800 flex flex-col fixed top-0 bottom-0 left-0 z-10 shadow-xl">
        <div className="p-6 border-b border-violet-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl">👩‍🎓</div>
            <div>
              <p className="text-white font-bold text-sm">Student Portal</p>
              <p className="text-violet-300 text-xs capitalize">{slug}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                active === item.id
                  ? 'bg-white text-violet-800 shadow-md'
                  : 'text-violet-100 hover:bg-violet-700'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        {!isLoading && s && (
          <div className="p-4 border-t border-violet-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-sm">
                {s.firstName?.[0]}{s.lastName?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{s.firstName} {s.lastName}</p>
                <p className="text-violet-300 text-xs truncate">{s.rollNumber || s.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 ml-64 p-8">{renderContent()}</main>
    </div>
  );
}

function StudentDashboard({ student, slug }: { student: any; slug: string }) {
  const { data: grades }     = useQuery({ queryKey: ['my-grades',     student?.id], queryFn: () => apiClient.get(`/grades/student/${student?.id}`),     enabled: !!student?.id });
  const { data: attendance } = useQuery({ queryKey: ['my-attendance', student?.id], queryFn: () => apiClient.get(`/attendance/student/${student?.id}`), enabled: !!student?.id });
  const { data: fees }       = useQuery({ queryKey: ['my-fees',       student?.id], queryFn: () => apiClient.get(`/fees/student/${student?.id}`),       enabled: !!student?.id });

  const gradeList:     any[] = Array.isArray(grades)     ? grades     : [];
  const attendList:    any[] = Array.isArray(attendance) ? attendance : [];
  const feeList:       any[] = Array.isArray(fees)       ? fees       : (fees as any)?.data || [];
  const presentCount         = attendList.filter(r => r.status === 'PRESENT').length;
  const attPct               = attendList.length ? Math.round((presentCount / attendList.length) * 100) : 0;
  const pendingFees           = feeList.filter(f => f.status === 'PENDING' || f.status === 'OVERDUE').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Welcome, {student?.firstName || 'Student'} 👋</h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📚" label="Subjects"       value={gradeList.length || '—'} color="bg-gradient-to-br from-violet-500 to-violet-700" />
        <StatCard icon="✅" label="Attendance"     value={`${attPct}%`} sub={`${presentCount}/${attendList.length} days`} color="bg-gradient-to-br from-green-500 to-green-700" />
        <StatCard icon="🎯" label="Avg Grade"      value={gradeList.length ? gradeList[0]?.grade || '—' : '—'} color="bg-gradient-to-br from-blue-500 to-blue-700" />
        <StatCard icon="💰" label="Pending Fees"   value={pendingFees} color={pendingFees > 0 ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-slate-500 to-slate-700'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Recent Grades</h3>
          {gradeList.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><div className="text-3xl mb-2">🎯</div><p className="text-sm">No grades yet</p></div>
          ) : (
            <div className="space-y-2">
              {gradeList.slice(0, 5).map((g: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{g.subject?.name || 'Subject'}</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${
                    g.grade === 'A' || g.grade === 'A+' ? 'bg-green-100 text-green-700' :
                    g.grade === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>{g.grade} · {g.score}/{g.maxScore}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🗓️', label: 'Timetable',   id: 'timetable'  },
              { icon: '📝', label: 'Assignments',  id: 'assignments'},
              { icon: '📚', label: 'Library',      id: 'library'    },
              { icon: '🚌', label: 'Transport',    id: 'transport'  },
            ].map(a => (
              <div key={a.id}
                className="flex flex-col items-center gap-2 p-4 bg-violet-50 border border-violet-200 rounded-xl text-center cursor-pointer hover:bg-violet-100 transition-all">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-semibold text-violet-700">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
