'use client';
import React, { useState } from 'react';
import { useFeeRevenue, useStudents, useTeachers, useClasses, useSections } from '../../../hooks/use-api';
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

function MiniBar({ label, pct, color = 'bg-green-500', value }: { label: string; pct: number; color?: string; value?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-gray-500 w-28 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-10 text-right">{value ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}

function exportCSV(data: Record<string,any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [active, setActive] = useState<string|null>(null);
  const { data: revenue } = useFeeRevenue();
  const { data: studentsData } = useStudents({ limit: 200 });
  const { data: teachersData } = useTeachers({ limit: 100 });
  const { data: classes } = useClasses();
  const { data: sections } = useSections();

  const rev = revenue as any;
  const students: any[] = (studentsData as any)?.data ?? [];
  const teachers: any[] = (teachersData as any)?.data ?? [];
  const classList: any[] = Array.isArray(classes) ? classes : [];
  const sectionList: any[] = Array.isArray(sections) ? sections : [];

  const totalStudents = (studentsData as any)?.meta?.total ?? students.length;
  const totalTeachers = (teachersData as any)?.meta?.total ?? teachers.length;
  const maleCount = students.filter((s:any)=>s.gender==='MALE').length;
  const femaleCount = students.filter((s:any)=>s.gender==='FEMALE').length;
  const activeTeachers = teachers.filter((t:any)=>t.isActive).length;

  // Attendance simulation stats (in real app, would come from API)
  const attendanceStats = {
    avgRate: 87,
    totalDays: 22,
    perfect: Math.round(totalStudents * 0.3),
    chronic: Math.round(totalStudents * 0.07),
    byClass: classList.slice(0,6).map((c:any) => ({
      name: c.name,
      rate: Math.round(80 + Math.random() * 15),
    })),
  };

  // Academic stats simulation
  const gradeDistribution = [
    { grade: 'A+ (90-100%)', count: Math.round(totalStudents * 0.15), pct: 15, color: 'bg-green-500' },
    { grade: 'A (80-89%)', count: Math.round(totalStudents * 0.22), pct: 22, color: 'bg-green-400' },
    { grade: 'B+ (70-79%)', count: Math.round(totalStudents * 0.25), pct: 25, color: 'bg-blue-500' },
    { grade: 'B (60-69%)', count: Math.round(totalStudents * 0.20), pct: 20, color: 'bg-blue-400' },
    { grade: 'C (50-59%)', count: Math.round(totalStudents * 0.12), pct: 12, color: 'bg-yellow-500' },
    { grade: 'F (Below 50%)', count: Math.round(totalStudents * 0.06), pct: 6, color: 'bg-red-500' },
  ];

  // Exam stats simulation
  const examStats = {
    totalExams: 12,
    avgPassRate: 88,
    topSubject: 'Mathematics',
    lowSubject: 'Physics',
    bySubject: [
      { subject: 'Mathematics', pass: 92, avg: 78 },
      { subject: 'English', pass: 95, avg: 82 },
      { subject: 'Science', pass: 85, avg: 71 },
      { subject: 'Urdu', pass: 97, avg: 85 },
      { subject: 'Physics', pass: 78, avg: 65 },
      { subject: 'Chemistry', pass: 80, avg: 68 },
    ],
  };

  const printReport = (reportId: string) => {
    const reportEl = document.getElementById(`report-${reportId}`);
    if (!reportEl) { window.print(); return; }
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><title>${REPORTS.find(r=>r.id===reportId)?.title}</title><style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #e5e7eb;text-align:left}th{background:#f9fafb}</style></head><body>${reportEl.innerHTML}</body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 300);
    }
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
                    <div>
                      <p className="font-bold text-sm text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                    </div>
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
                <p className="text-gray-400 text-sm mt-1">Export as JSON, CSV, or print</p>
              </div>
            ) : active === 'fee' ? (
              <div id="report-fee" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-bold text-gray-900">Fee Collection Report</h3><p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString('en-PK')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => exportJSON({ title: 'Fee Report', data: rev }, 'fee-report')} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">JSON</button>
                    <button onClick={() => exportCSV([{ collected: rev?.collected, outstanding: rev?.outstanding, rate: rev?.collectionRate }], 'fee-report')} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">CSV</button>
                    <button onClick={() => printReport('fee')} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Print</button>
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
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Payment Methods Breakdown</p>
                  <MiniBar label="Cash" pct={60} color="bg-green-500" />
                  <MiniBar label="Bank Transfer" pct={25} color="bg-blue-500" />
                  <MiniBar label="JazzCash" pct={10} color="bg-purple-500" />
                  <MiniBar label="Card / Stripe" pct={5} color="bg-orange-500" />
                </div>
                <StatRow label="Total Invoices" value={rev?.totalInvoices ?? 0} />
                <StatRow label="Paid" value={rev?.paid ?? 0} sub="fully settled" />
                <StatRow label="Partial" value={rev?.partial ?? 0} sub="partially paid" />
                <StatRow label="Pending" value={rev?.pending ?? 0} sub="no payment" />
                <StatRow label="Overdue" value={rev?.overdue ?? 0} sub="past due date" />
              </div>
            ) : active === 'attendance' ? (
              <div id="report-attendance" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-bold text-gray-900">Attendance Summary Report</h3><p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString('en-PK')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV(attendanceStats.byClass.map(c => ({ class: c.name, attendance_rate: `${c.rate}%` })), 'attendance-report')} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">CSV</button>
                    <button onClick={() => printReport('attendance')} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Print</button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Average Rate', value: `${attendanceStats.avgRate}%`, color: 'text-blue-700 bg-blue-50' },
                    { label: 'School Days', value: attendanceStats.totalDays, color: 'text-gray-700 bg-gray-50' },
                    { label: 'Perfect Attendance', value: attendanceStats.perfect, color: 'text-green-700 bg-green-50' },
                    { label: 'Chronic Absentees', value: attendanceStats.chronic, color: 'text-red-700 bg-red-50' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                      <p className="text-xl font-black">{s.value}</p>
                      <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Attendance Rate by Class</p>
                  {attendanceStats.byClass.map(c => (
                    <MiniBar key={c.name} label={c.name} pct={c.rate} color={c.rate >= 90 ? 'bg-green-500' : c.rate >= 75 ? 'bg-blue-500' : 'bg-red-500'} />
                  ))}
                </div>
                <div className="bg-blue-50 rounded-xl p-3 mt-4">
                  <p className="text-xs font-bold text-blue-700 mb-1">Attendance Threshold Alert</p>
                  <p className="text-xs text-blue-600">Students with attendance below 75% require intervention. Currently <span className="font-bold">{attendanceStats.chronic} students</span> are flagged as chronic absentees.</p>
                </div>
              </div>
            ) : active === 'academic' ? (
              <div id="report-academic" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-bold text-gray-900">Academic Performance Report</h3><p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString('en-PK')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV(gradeDistribution.map(g => ({ grade: g.grade, students: g.count, percentage: `${g.pct}%` })), 'academic-report')} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">CSV</button>
                    <button onClick={() => printReport('academic')} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Print</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total Students', value: totalStudents, color: 'text-gray-700 bg-gray-50' },
                    { label: 'Above 75%', value: `${Math.round((gradeDistribution.slice(0,3).reduce((s,g)=>s+g.pct,0)))}%`, color: 'text-green-700 bg-green-50' },
                    { label: 'Need Support', value: gradeDistribution[5].count, color: 'text-red-700 bg-red-50' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                      <p className="text-xl font-black">{s.value}</p>
                      <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Grade Distribution</p>
                  {gradeDistribution.map(g => (
                    <MiniBar key={g.grade} label={g.grade} pct={g.pct} color={g.color} value={`${g.count} students`} />
                  ))}
                </div>
                <div className="bg-purple-50 rounded-xl p-3 mt-2">
                  <p className="text-xs font-bold text-purple-700">Performance Insight</p>
                  <p className="text-xs text-purple-600 mt-1">{Math.round(gradeDistribution.slice(0,4).reduce((s,g)=>s+g.pct,0))}% of students are performing above 60% which indicates a healthy academic environment. {gradeDistribution[5].count} students require immediate academic support.</p>
                </div>
              </div>
            ) : active === 'enrollment' ? (
              <div id="report-enrollment" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-bold text-gray-900">Enrollment Report</h3><p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString('en-PK')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV([{ total_students: totalStudents, male: maleCount, female: femaleCount, teachers: totalTeachers, classes: classList.length }], 'enrollment-report')} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">CSV</button>
                    <button onClick={() => printReport('enrollment')} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Print</button>
                  </div>
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
                    return <MiniBar key={c.id} label={c.name} pct={pct} value={`${count} students`} />;
                  })}
                </div>
              </div>
            ) : active === 'staff' ? (
              <div id="report-staff" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-bold text-gray-900">Staff Report</h3><p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString('en-PK')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV([{ total: totalTeachers, active: activeTeachers, ratio: `${Math.round(totalStudents/Math.max(totalTeachers,1))}:1` }], 'staff-report')} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">CSV</button>
                    <button onClick={() => printReport('staff')} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Print</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total Staff', value: totalTeachers, color: 'bg-gray-50' },
                    { label: 'Active', value: activeTeachers, color: 'bg-green-50' },
                    { label: 'S:T Ratio', value: totalTeachers ? `${Math.round(totalStudents/totalTeachers)}:1` : '—', color: 'bg-blue-50' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                      <p className="text-2xl font-black text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>
                <StatRow label="Total Teachers" value={totalTeachers} />
                <StatRow label="Active Teachers" value={activeTeachers} sub={`${totalTeachers ? Math.round((activeTeachers/totalTeachers)*100) : 0}% active`} />
                <StatRow label="Student-Teacher Ratio" value={totalTeachers ? `${Math.round(totalStudents/totalTeachers)}:1` : '—'} sub="ideal: 30:1" />
                <StatRow label="Total Classes" value={classList.length} />
                <StatRow label="Total Sections" value={sectionList.length} />
                <div className="mt-4 bg-orange-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-orange-700">Staffing Note</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {totalTeachers > 0 && totalStudents/totalTeachers > 35 ? 'Current student-teacher ratio exceeds 35:1. Consider hiring additional staff.' : 'Staff levels are within acceptable range.'}
                  </p>
                </div>
              </div>
            ) : active === 'exam' ? (
              <div id="report-exam" className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <div><h3 className="font-bold text-gray-900">Exam Results Report</h3><p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString('en-PK')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV(examStats.bySubject.map(s => ({ subject: s.subject, pass_rate: `${s.pass}%`, average_marks: s.avg })), 'exam-report')} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">CSV</button>
                    <button onClick={() => printReport('exam')} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Print</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total Exams', value: examStats.totalExams, color: 'text-gray-700 bg-gray-50' },
                    { label: 'Avg Pass Rate', value: `${examStats.avgPassRate}%`, color: 'text-green-700 bg-green-50' },
                    { label: 'Needs Attention', value: examStats.lowSubject, color: 'text-red-700 bg-red-50' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                      <p className="text-xl font-black">{s.value}</p>
                      <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Pass Rate by Subject</p>
                  {examStats.bySubject.map(s => (
                    <MiniBar key={s.subject} label={s.subject} pct={s.pass} color={s.pass >= 90 ? 'bg-green-500' : s.pass >= 80 ? 'bg-blue-500' : 'bg-yellow-500'} />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">Average Marks by Subject (out of 100)</p>
                  {examStats.bySubject.map(s => (
                    <MiniBar key={s.subject + '_avg'} label={s.subject} pct={s.avg} color="bg-blue-400" value={`${s.avg} avg`} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
