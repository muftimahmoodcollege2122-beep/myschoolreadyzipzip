'use client';
import React, { useState } from 'react';
import { useFeeRevenue, useStudents, useTeachers, useClasses } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';

type ReportType = { id: string; title: string; icon: string; desc: string; color: string };
const REPORTS: ReportType[] = [
  { id: 'fee', title: 'Fee Collection Report', icon: '💰', desc: 'Revenue, outstanding dues, payment methods breakdown', color: 'bg-green-50 border-green-200' },
  { id: 'attendance', title: 'Attendance Summary', icon: '✅', desc: 'Daily, weekly, monthly attendance statistics by class', color: 'bg-blue-50 border-blue-200' },
  { id: 'academic', title: 'Academic Performance', icon: '📊', desc: 'Grade distributions, class averages, top performers', color: 'bg-purple-50 border-purple-200' },
  { id: 'enrollment', title: 'Enrollment Report', icon: '👩‍🎓', desc: 'Student registration, gender ratio, class-wise enrollment', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'staff', title: 'Staff Report', icon: '👥', desc: 'Staff roster, salary breakdown, department summary', color: 'bg-orange-50 border-orange-200' },
  { id: 'exam', title: 'Exam Results Report', icon: '📝', desc: 'Pass/fail rates, subject performance, comparison charts', color: 'bg-red-50 border-red-200' },
];

function StatRow({ label, value, sub }: { label: string; value: string|number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-right"><p className="text-sm font-bold text-gray-900">{value}</p>{sub&&<p className="text-xs text-gray-400">{sub}</p>}</div>
    </div>
  );
}

function MiniBar({ label, pct, color = 'bg-green-500' }: { label: string; pct: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-gray-500 w-24 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

export default function ReportsPage() {
  const [active, setActive] = useState<string|null>(null);
  const { data: revenue } = useFeeRevenue();
  const { data: studentsData } = useStudents({ limit: 200 });
  const { data: teachersData } = useTeachers({ limit: 100 });
  const { data: classes } = useClasses();

  const rev = revenue as any;
  const students: any[] = (studentsData as any)?.data ?? [];
  const teachers: any[] = (teachersData as any)?.data ?? [];
  const classList: any[] = Array.isArray(classes) ? classes : [];

  const totalStudents = (studentsData as any)?.meta?.total ?? students.length;
  const totalTeachers = (teachersData as any)?.meta?.total ?? teachers.length;
  const maleCount = students.filter((s:any)=>s.gender==='MALE').length;
  const femaleCount = students.filter((s:any)=>s.gender==='FEMALE').length;

  const handleExport = (reportId: string) => {
    const data: any = {
      fee: { title: 'Fee Collection Report', data: rev },
      enrollment: { title: 'Enrollment Report', data: { total: totalStudents, male: maleCount, female: femaleCount } },
    };
    const blob = new Blob([JSON.stringify(data[reportId] ?? {}, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${reportId}-report-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Topbar title="Reports" subtitle="Analytics, insights & data exports" />
      <div className="p-6">
        <PageHeader title="Reports & Analytics" subtitle="Generate and download school reports" />

        <div className="grid grid-cols-12 gap-6">
          {/* Report List */}
          <div className="col-span-4">
            <div className="space-y-2">
              {REPORTS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setActive(active === r.id ? null : r.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${active===r.id ? r.color + ' shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div><p className="font-bold text-sm text-gray-900">{r.title}</p><p className="text-xs text-gray-400 mt-0.5">{r.desc}</p></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Report Preview */}
          <div className="col-span-8">
            {!active ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                <p className="text-5xl mb-3">📊</p>
                <p className="text-gray-500 font-medium">Select a report from the left to preview it</p>
                <p className="text-gray-400 text-sm mt-1">You can then export it as JSON or print</p>
              </div>
            ) : active === 'fee' ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-bold text-gray-900">Fee Collection Report</h3><p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString('en-PK')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleExport('fee')} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">Export JSON</button>
                    <button onClick={() => window.print()} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">🖨️ Print</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total Revenue', value: `Rs. ${Number(rev?.collected??0).toLocaleString()}`, color: 'text-green-700 bg-green-50' },
                    { label: 'Outstanding', value: `Rs. ${Number(rev?.outstanding??0).toLocaleString()}`, color: 'text-red-700 bg-red-50' },
                    { label: 'Collection Rate', value: `${rev?.collectionRate ?? 0}%`, color: 'text-blue-700 bg-blue-50' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                      <p className="text-xl font-black">{s.value}</p><p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Payment Methods</p>
                  {['CASH','BANK_TRANSFER','ONLINE'].map((m, i) => <MiniBar key={m} label={m.replace('_',' ')} pct={[65,25,10][i]} color={['bg-green-500','bg-blue-500','bg-purple-500'][i]} />)}
                </div>
                <div className="mb-2">
                  <StatRow label="Total Invoices" value={rev?.totalInvoices ?? 0} />
                  <StatRow label="Paid" value={rev?.paid ?? 0} sub="fully settled" />
                  <StatRow label="Partial" value={rev?.partial ?? 0} sub="partially paid" />
                  <StatRow label="Pending" value={rev?.pending ?? 0} sub="no payment" />
                  <StatRow label="Overdue" value={rev?.overdue ?? 0} sub="past due date" />
                </div>
              </div>
            ) : active === 'enrollment' ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900">Enrollment Report</h3>
                  <button onClick={() => handleExport('enrollment')} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg">Export JSON</button>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total Students', value: totalStudents },
                    { label: 'Total Teachers', value: totalTeachers },
                    { label: 'Total Classes', value: classList.length },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Gender Distribution</p>
                  <MiniBar label="Male" pct={totalStudents ? (maleCount/totalStudents)*100 : 0} color="bg-blue-500" />
                  <MiniBar label="Female" pct={totalStudents ? (femaleCount/totalStudents)*100 : 0} color="bg-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Enrollment by Class</p>
                  {classList.slice(0,6).map((c:any) => {
                    const count = c.sections?.reduce((s:number,sec:any)=>s+(sec._count?.students??0),0) ?? 0;
                    const pct = totalStudents ? (count/totalStudents)*100 : 0;
                    return <MiniBar key={c.id} label={c.name} pct={pct} />;
                  })}
                </div>
              </div>
            ) : active === 'staff' ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Staff Report</h3>
                <StatRow label="Total Teachers" value={totalTeachers} />
                <StatRow label="Active" value={teachers.filter((t:any)=>t.isActive).length} />
                <StatRow label="Student-Teacher Ratio" value={totalTeachers ? `${Math.round(totalStudents/totalTeachers)}:1` : '—'} />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-5xl mb-3">{REPORTS.find(r=>r.id===active)?.icon}</p>
                <h3 className="font-bold text-gray-900 mb-2">{REPORTS.find(r=>r.id===active)?.title}</h3>
                <p className="text-gray-400 text-sm">This report will display here with live data from your school</p>
                <button onClick={() => window.print()} className="mt-4 px-4 py-2 border border-gray-200 text-sm font-bold rounded-lg hover:bg-gray-50">🖨️ Print Preview</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
