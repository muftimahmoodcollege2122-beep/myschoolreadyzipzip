'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';

const NAV = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard'        },
  { id: 'children',    icon: '👧', label: 'My Children'      },
  { id: 'attendance',  icon: '✅', label: 'Attendance'       },
  { id: 'grades',      icon: '🎯', label: 'Report Card'      },
  { id: 'fees',        icon: '💰', label: 'Fee & Payments'   },
  { id: 'timetable',   icon: '🗓️', label: 'Timetable'       },
  { id: 'notices',     icon: '📢', label: 'Notices'          },
  { id: 'transport',   icon: '🚌', label: 'Transport'        },
  { id: 'messages',    icon: '💬', label: 'Messages'         },
  { id: 'events',      icon: '🎉', label: 'Events'           },
];

function StatCard({ icon, label, value, color, alert }: { icon: string; label: string; value: string | number; color: string; alert?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 text-white relative ${color}`}>
      {alert && <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />}
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm opacity-80 mt-1">{label}</div>
    </div>
  );
}

function ChildrenView({ children }: { children: any[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Children</h2>
      {children.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👧</div>
          <p>No children linked to your account yet</p>
          <p className="text-sm mt-1">Contact the school admin to link your children</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {children.map((child: any, i: number) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-2xl font-black text-white">
                  {child.firstName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{child.firstName} {child.lastName}</p>
                  <p className="text-sm text-gray-500">{child.class?.name || 'Class N/A'} · Roll #{child.rollNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Attendance', value: `${child.attendanceRate || 0}%`, color: 'bg-green-50 text-green-700' },
                  { label: 'Grade',      value: child.latestGrade || 'N/A',     color: 'bg-blue-50 text-blue-700'   },
                  { label: 'Fees',       value: child.pendingFees ? 'Due' : 'OK', color: child.pendingFees ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700' },
                ].map(stat => (
                  <div key={stat.label} className={`rounded-xl p-3 text-center ${stat.color}`}>
                    <p className="font-black text-base">{stat.value}</p>
                    <p className="text-xs font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttendanceTracker({ children }: { children: any[] }) {
  const [selected, setSelected] = useState(children[0]?.id || '');
  const { data, isLoading } = useQuery({
    queryKey: ['parent-attendance', selected],
    queryFn:  () => apiClient.get(`/attendance/student/${selected}`),
    enabled:  !!selected,
  });
  const records: any[] = Array.isArray(data) ? data : [];
  const present = records.filter(r => r.status === 'PRESENT').length;
  const absent  = records.filter(r => r.status === 'ABSENT').length;
  const pct     = records.length ? Math.round((present / records.length) * 100) : 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Attendance Tracker</h2>
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map((c: any) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selected === c.id ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {c.firstName}
            </button>
          ))}
        </div>
      )}
      {isLoading ? (
        <div className="animate-pulse h-32 bg-gray-100 rounded-2xl" />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Present', value: present, color: 'bg-green-50 border-green-200 text-green-700' },
              { label: 'Absent',  value: absent,  color: 'bg-red-50 border-red-200 text-red-700'       },
              { label: 'Late',    value: records.filter(r => r.status === 'LATE').length, color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: 'Rate',    value: `${pct}%`, color: 'bg-blue-50 border-blue-200 text-blue-700'  },
            ].map(s => (
              <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.color}`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-sm font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Subject</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
              </tr></thead>
              <tbody>
                {records.slice(0, 20).map((r: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{r.subject?.name || '—'}</td>
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
        </>
      )}
    </div>
  );
}

function ReportCard({ children }: { children: any[] }) {
  const [selected, setSelected] = useState(children[0]?.id || '');
  const { data, isLoading } = useQuery({
    queryKey: ['parent-grades', selected],
    queryFn:  () => apiClient.get(`/grades/student/${selected}`),
    enabled:  !!selected,
  });
  const grades: any[] = Array.isArray(data) ? data : [];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Report Card</h2>
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map((c: any) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selected === c.id ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {c.firstName}
            </button>
          ))}
        </div>
      )}
      {isLoading ? (
        <div className="animate-pulse h-32 bg-gray-100 rounded-2xl" />
      ) : grades.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🎯</div><p>No grades recorded yet</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {grades.map((g: any, i: number) => {
            const pct = g.maxScore ? Math.round((g.score / g.maxScore) * 100) : 0;
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{g.subject?.name || 'Subject'}</p>
                    <p className="text-xs text-gray-400">{g.type}</p>
                  </div>
                  <span className={`font-black text-lg px-3 py-1 rounded-xl h-fit ${
                    pct >= 80 ? 'bg-green-100 text-green-700' :
                    pct >= 60 ? 'bg-blue-100 text-blue-700'  :
                    pct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>{g.grade}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{g.score} / {g.maxScore}</span><span>{pct}%</span>
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

function FeePayments({ children }: { children: any[] }) {
  const [selected, setSelected] = useState(children[0]?.id || '');
  const { data, isLoading } = useQuery({
    queryKey: ['parent-fees', selected],
    queryFn:  () => apiClient.get(`/fees/student/${selected}`),
    enabled:  !!selected,
  });
  const invoices: any[] = Array.isArray(data) ? data : (data as any)?.data || [];
  const pending = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE');
  const paid    = invoices.filter(inv => inv.status === 'PAID');
  const totalDue = pending.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Fee & Payments</h2>
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map((c: any) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selected === c.id ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              {c.firstName}
            </button>
          ))}
        </div>
      )}
      {isLoading ? (
        <div className="animate-pulse h-32 bg-gray-100 rounded-2xl" />
      ) : (
        <>
          {totalDue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-red-800">⚠️ Total Dues</p>
                  <p className="text-2xl font-black text-red-700 mt-1">PKR {totalDue.toLocaleString()}</p>
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition-all text-sm">
                  Pay Now
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {pending.map((inv: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm text-red-700 border-t border-red-100 pt-2">
                    <span>{inv.title || 'Fee'}</span>
                    <span className="font-bold">PKR {Number(inv.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-700">Payment History ({paid.length})</div>
            {paid.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No payments yet</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {paid.map((inv: any, i: number) => (
                  <div key={i} className="flex justify-between items-center px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{inv.title || 'Fee'}</p>
                      <p className="text-xs text-gray-400">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">PKR {Number(inv.amount || 0).toLocaleString()}</p>
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">PAID</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ParentPortal() {
  const { slug }            = useParams<{ slug: string }>();
  const [active, setActive] = useState('dashboard');

  const { data: students, isLoading } = useQuery({
    queryKey: ['my-children', slug],
    queryFn:  () => apiClient.get(`/students?parentPortal=true&tenantSlug=${slug}`),
  });
  const children: any[] = Array.isArray(students) ? students : (students as any)?.data || [];

  const renderContent = () => {
    switch (active) {
      case 'dashboard':  return <ParentDashboard children={children} slug={slug} />;
      case 'children':   return <ChildrenView children={children} />;
      case 'attendance': return <AttendanceTracker children={children} />;
      case 'grades':     return <ReportCard children={children} />;
      case 'fees':       return <FeePayments children={children} />;
      case 'timetable':  return <ParentTimetable children={children} />;
      case 'notices':    return <ParentNotices slug={slug} />;
      case 'transport':  return <ParentTransport children={children} />;
      case 'messages':   return <ParentMessages slug={slug} />;
      case 'events':     return <ParentEvents slug={slug} />;
      default:           return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-gradient-to-b from-rose-900 to-rose-800 flex flex-col fixed top-0 bottom-0 left-0 z-10 shadow-xl">
        <div className="p-6 border-b border-rose-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl">👨‍👩‍👧</div>
            <div>
              <p className="text-white font-bold text-sm">Parent Portal</p>
              <p className="text-rose-300 text-xs capitalize">{slug}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                active === item.id
                  ? 'bg-white text-rose-800 shadow-md'
                  : 'text-rose-100 hover:bg-rose-700'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-rose-700">
          <div className="text-rose-200 text-xs text-center">
            {children.length} child{children.length !== 1 ? 'ren' : ''} linked
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">{renderContent()}</main>
    </div>
  );
}

function ParentDashboard({ children, slug }: { children: any[]; slug: string }) {
  const { data: notices } = useQuery({
    queryKey: ['parent-notices', slug],
    queryFn:  () => apiClient.get(`/announcements?tenantSlug=${slug}`),
  });
  const noticeList: any[] = Array.isArray(notices) ? notices : (notices as any)?.data || [];

  const totalPending = children.reduce((sum, c) => sum + (c.pendingFees ? 1 : 0), 0);
  const avgAttendance = children.length
    ? Math.round(children.reduce((sum, c) => sum + (c.attendanceRate || 0), 0) / children.length)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Parent Dashboard 👨‍👩‍👧</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👧" label="Children"        value={children.length}   color="bg-gradient-to-br from-rose-500 to-rose-700" />
        <StatCard icon="✅" label="Avg Attendance"  value={`${avgAttendance}%`} color="bg-gradient-to-br from-green-500 to-green-700" />
        <StatCard icon="💰" label="Fee Alerts"      value={totalPending}      color="bg-gradient-to-br from-amber-500 to-amber-700" alert={totalPending > 0} />
        <StatCard icon="📢" label="Notices"         value={noticeList.length} color="bg-gradient-to-br from-blue-500 to-blue-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Children Summary</h3>
          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <div className="text-3xl mb-2">👧</div>
              <p>No children linked yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {children.map((child: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center font-bold text-white text-sm">
                      {child.firstName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{child.firstName} {child.lastName}</p>
                      <p className="text-xs text-gray-500">{child.class?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">{child.attendanceRate || 0}%</p>
                    <p className="text-xs text-gray-400">attendance</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Latest Notices</h3>
          {noticeList.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm"><div className="text-3xl mb-2">📢</div><p>No notices yet</p></div>
          ) : (
            <div className="space-y-3">
              {noticeList.slice(0, 4).map((n: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="text-xl flex-shrink-0">📢</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.content}</p>
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

// ── Missing Parent Portal Components ──────────────────────────────────────────

function ParentTimetable({ children }: { children: any[] }) {
  const [selectedChild, setSelectedChild] = React.useState(children[0]?.id ?? '');
  const { data } = useQuery({
    queryKey: ['parent-timetable', selectedChild],
    queryFn: () => apiClient.get(`/timetable?studentId=${selectedChild}`),
    enabled: !!selectedChild,
  });
  const slots: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const byDay: Record<number, any[]> = {};
  slots.forEach(s => { if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = []; byDay[s.dayOfWeek].push(s); });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-gray-900 text-lg">🗓️ Timetable</h2>
        {children.length > 1 && (
          <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
            {children.map((c: any) => <option key={c.id} value={c.id}>{c.user?.profile?.firstName}</option>)}
          </select>
        )}
      </div>
      {DAYS.map((day, i) => byDay[i+1]?.length ? (
        <div key={day} className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">{day}</h3>
          <div className="space-y-2">
            {byDay[i+1].sort((a, b) => a.period - b.period).map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-2 bg-rose-50 rounded-lg">
                <span className="text-xs font-black text-rose-600 w-14">{s.startTime}–{s.endTime}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{s.subject?.name}</p>
                  <p className="text-xs text-gray-400">{s.teacher?.user?.profile?.firstName} {s.teacher?.user?.profile?.lastName}{s.room ? ` · Room ${s.room}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null)}
      {slots.length === 0 && <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🗓️</div><p>No timetable available</p></div>}
    </div>
  );
}

function ParentNotices({ slug }: { slug: string }) {
  const { data } = useQuery({ queryKey: ['parent-notices', slug], queryFn: () => apiClient.get(`/announcements?tenantSlug=${slug}&limit=30`) });
  const notices: any[] = (data as any)?.data ?? [];
  return (
    <div className="p-4 space-y-3">
      <h2 className="font-black text-gray-900 text-lg">📢 Notices & Announcements</h2>
      {notices.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">📢</div><p>No notices yet</p></div>
      ) : (
        <div className="space-y-3">
          {notices.map((n: any) => (
            <div key={n.id} className={`bg-white rounded-xl border p-4 ${n.isPinned ? 'border-rose-200 bg-rose-50/20' : 'border-gray-100'}`}>
              {n.isPinned && <span className="text-xs bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">📌 Pinned</span>}
              <h3 className="font-bold text-sm text-gray-900 mt-1">{n.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{n.content ?? n.body}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParentTransport({ children }: { children: any[] }) {
  const [selectedChild, setSelectedChild] = React.useState(children[0]?.id ?? '');
  const { data } = useQuery({
    queryKey: ['parent-transport', selectedChild],
    queryFn: () => apiClient.get(`/transport/assignments?studentId=${selectedChild}`),
    enabled: !!selectedChild,
  });
  const assignments: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];
  const assignment = assignments[0];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-gray-900 text-lg">🚌 Transport</h2>
        {children.length > 1 && (
          <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
            {children.map((c: any) => <option key={c.id} value={c.id}>{c.user?.profile?.firstName}</option>)}
          </select>
        )}
      </div>
      {!assignment ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🚌</div><p>No transport assigned for this child</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-3xl">🚌</div>
            <div><h3 className="font-black text-gray-900 text-lg">{assignment.route?.name}</h3><p className="text-gray-500 text-sm">Route #{assignment.route?.routeNo}</p></div>
          </div>
          {[
            ['Vehicle No', assignment.route?.vehicleNo],
            ['Driver Name', assignment.route?.driverName],
            ['Driver Phone', assignment.route?.driverPhone],
            ['Bus Stop', assignment.stopName],
            ['Pickup Time', assignment.pickupTime],
            ['Monthly Fee', assignment.route?.fee ? `Rs. ${Number(assignment.route.fee).toLocaleString()}` : '—'],
          ].map(([k, v]) => v ? (
            <div key={k} className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-sm text-gray-500">{k}</span>
              <span className="text-sm font-bold text-gray-900">{v}</span>
            </div>
          ) : null)}
          {assignment.route?.driverPhone && (
            <a href={`tel:${assignment.route.driverPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
              📞 Call Driver
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ParentMessages({ slug }: { slug: string }) {
  const [message, setMessage] = React.useState('');
  const { data, refetch } = useQuery({ queryKey: ['parent-messages', slug], queryFn: () => apiClient.get(`/communication/threads?tenantSlug=${slug}`) });
  const threads: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  const sendMessage = async () => {
    if (!message.trim()) return;
    await apiClient.post('/communication/messages', { content: message, tenantSlug: slug });
    setMessage('');
    refetch();
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-black text-gray-900 text-lg">💬 Messages</h2>
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs text-gray-500 font-bold uppercase mb-2">Send Message to School</p>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          placeholder="Type your message to the school administration..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-rose-400 resize-none"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="mt-2 w-full py-2.5 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 disabled:opacity-40"
        >Send Message</button>
      </div>
      {threads.length === 0 ? (
        <div className="text-center py-8 text-gray-400"><div className="text-4xl mb-2">💬</div><p>No message history</p></div>
      ) : (
        <div className="space-y-3">
          {threads.map((t: any) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm">{t.subject || 'General Enquiry'}</h3>
                <span className="text-xs text-gray-400">{new Date(t.updatedAt ?? t.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.lastMessage ?? t.content}</p>
              {t.unreadCount > 0 && <span className="mt-2 inline-block px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">{t.unreadCount} new</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ParentEvents({ slug }: { slug: string }) {
  const { data } = useQuery({ queryKey: ['parent-events', slug], queryFn: () => apiClient.get(`/events?tenantSlug=${slug}&upcoming=true`) });
  const events: any[] = Array.isArray(data) ? data : (data as any)?.data ?? [];

  return (
    <div className="p-4 space-y-3">
      <h2 className="font-black text-gray-900 text-lg">🎉 School Events</h2>
      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><div className="text-4xl mb-2">🎉</div><p>No upcoming events</p></div>
      ) : (
        <div className="space-y-3">
          {events.map((ev: any) => {
            const start = new Date(ev.startAt);
            const isPast = start < new Date();
            return (
              <div key={ev.id} className={`bg-white rounded-xl border p-4 flex gap-4 ${isPast ? 'opacity-60 border-gray-100' : 'border-rose-200'}`}>
                <div className="w-14 h-14 bg-rose-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <p className="text-xl font-black text-rose-700">{start.getDate()}</p>
                  <p className="text-xs text-rose-600 font-bold">{start.toLocaleDateString('en', { month: 'short' })}</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm">{ev.title}</h3>
                  {ev.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ev.description}</p>}
                  <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                    <span>🕐 {start.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>
                    {ev.venue && <span>📍 {ev.venue}</span>}
                  </div>
                </div>
                {!isPast && <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-full h-fit">Upcoming</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
