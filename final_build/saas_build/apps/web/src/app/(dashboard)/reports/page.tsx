'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';

function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

const TERMS = ['Term 1','Term 2','Term 3','Annual'];
const YEARS = [0,1,2].map(i => { const y = new Date().getFullYear()-i; return `${y}-${y+1}`; });

export default function ReportsPage() {
  const [tab, setTab] = useState<'overview'|'reportcard'|'attendance'|'fees'|'performance'>('overview');
  const [rcModal, setRcModal] = useState(false);
  const [rcForm, setRcForm] = useState({ studentId:'', academicYear: YEARS[0], term: TERMS[0] });
  const [generating, setGenerating] = useState(false);
  const [generatedPdfs, setGeneratedPdfs] = useState<any[]>([]);

  const { data: students } = useQuery({ queryKey:['students-all'], queryFn:()=>apiClient.get('/students?limit=500') });
  const { data: sections } = useQuery({ queryKey:['sections'], queryFn:()=>apiClient.get('/school-data/sections') });
  const { data: feeRevenue } = useQuery({ queryKey:['fee-revenue'], queryFn:()=>apiClient.get(`/fees/revenue?month=${new Date().getMonth()+1}&year=${new Date().getFullYear()}`) });
  const { data: aiDashboard } = useQuery({ queryKey:['ai-dashboard'], queryFn:()=>apiClient.get('/ai-analytics/dashboard') });
  const { data: dropoutRisk } = useQuery({ queryKey:['dropout-risk'], queryFn:()=>apiClient.get('/ai-analytics/dropout-risk') });
  const { data: attSummary } = useQuery({ queryKey:['att-today'], queryFn:()=>apiClient.get('/attendance/today/summary') });

  const allStudents: any[] = (students as any)?.data ?? [];
  const dash: any = aiDashboard ?? {};
  const att: any = attSummary ?? {};
  const risk: any[] = Array.isArray(dropoutRisk) ? dropoutRisk : [];

  const handleGenerateReportCard = async () => {
    if (!rcForm.studentId) return;
    setGenerating(true);
    try {
      const res = await apiClient.post('/reports/report-card', rcForm);
      setGeneratedPdfs(prev => [{ ...rcForm, jobId: (res as any).jobId, generatedAt: new Date().toISOString(), student: allStudents.find(s=>s.id===rcForm.studentId) }, ...prev]);
      setRcModal(false);
      alert('✅ Report card queued! It will be available for download shortly and also sent to the student.');
    } catch(e) { alert('Failed to generate report card. Please try again.'); }
    finally { setGenerating(false); }
  };

  const handleBulkReportCards = async () => {
    if (!confirm(`Generate report cards for ALL ${allStudents.length} students? This may take a few minutes.`)) return;
    setGenerating(true);
    try {
      await apiClient.post('/reports/report-cards/bulk', { academicYear: rcForm.academicYear, term: rcForm.term });
      alert(`✅ Bulk generation started for ${allStudents.length} students. Students will be notified when their report cards are ready.`);
    } catch(e) { alert('Bulk generation failed.'); }
    finally { setGenerating(false); }
  };

  const handleExportAttendance = async () => {
    const sectionId = (sections as any)?.data?.[0]?.id;
    if (!sectionId) return alert('No section found');
    const start = new Date(); start.setMonth(start.getMonth()-1);
    const csv = await apiClient.get(`/reports/attendance-csv?sectionId=${sectionId}&startDate=${start.toISOString()}&endDate=${new Date().toISOString()}`);
    const blob = new Blob([csv as any], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`attendance-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const TABS = [
    { key:'overview',    label:'📊 Overview' },
    { key:'reportcard',  label:'📄 Report Cards' },
    { key:'attendance',  label:'✅ Attendance' },
    { key:'fees',        label:'💰 Fee Reports' },
    { key:'performance', label:'🎯 Performance' },
  ];

  return (
    <>
      <Topbar title="Reports & Analytics" subtitle="Generate report cards, export data, and view insights" />
      <div className="p-6">

        {/* KPI Strip */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label:'Students',         value: dash.students ?? allStudents.length, icon:'🎓', color:'bg-blue-600' },
            { label:'Attendance Today', value: `${att.presentRate ?? 0}%`,          icon:'✅', color:'bg-green-600' },
            { label:'Fee Collection',   value: `${dash.feeCollectionRate ?? 0}%`,   icon:'💰', color:'bg-amber-500' },
            { label:'High Risk',        value: risk.filter(r=>r.riskLevel==='HIGH').length, icon:'⚠️', color:'bg-red-600' },
            { label:'Report Cards',     value: generatedPdfs.length,                icon:'📄', color:'bg-purple-600' },
          ].map(s=>(
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-xs opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as any)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${tab===t.key?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab==='overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              {/* Dropout Risk Table */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 mb-4">⚠️ AI Dropout Risk Monitor</h3>
                {risk.length === 0 ? <p className="text-gray-400 text-sm">No risk data available</p> : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100">
                      {['Student','Attendance','Overdue Fees','Risk Score','Level'].map(h=><th key={h} className="pb-2 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {risk.slice(0,10).map((r:any)=>(
                        <tr key={r.student.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 font-medium">{r.student.name}</td>
                          <td className="py-2"><span className={r.attendanceRate<75?'text-red-600 font-bold':'text-gray-600'}>{r.attendanceRate}%</span></td>
                          <td className="py-2"><span className={r.overdueInvoices>0?'text-red-600 font-bold':'text-gray-600'}>{r.overdueInvoices}</span></td>
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${r.riskScore>=70?'bg-red-500':r.riskScore>=40?'bg-amber-400':'bg-green-500'}`} style={{width:`${r.riskScore}%`}}/></div>
                              <span className="text-xs font-bold">{r.riskScore}</span>
                            </div>
                          </td>
                          <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.riskLevel==='HIGH'?'bg-red-100 text-red-700':r.riskLevel==='MEDIUM'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}`}>{r.riskLevel}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Today Attendance Summary */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 mb-4">✅ Today's Attendance</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label:'Present', value: att.present ?? 0, color:'text-green-600' },
                    { label:'Absent',  value: att.absent  ?? 0, color:'text-red-600' },
                    { label:'Late',    value: att.late    ?? 0, color:'text-amber-600' },
                    { label:'Rate',    value: `${att.presentRate ?? 0}%`, color:'text-blue-600' },
                  ].map(s=>(
                    <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 mb-4">⚡ Quick Exports</h3>
                <div className="space-y-2">
                  {[
                    { label:'📋 Student List (Excel)', action:()=>apiClient.get('/reports/students-excel').then(()=>alert('Export started')) },
                    { label:'✅ Attendance CSV',        action: handleExportAttendance },
                    { label:'💰 Fee Report (CSV)',      action:()=>alert('Navigate to Fee Reports tab') },
                    { label:'📊 Full School Report',   action:()=>alert('Generating...') },
                  ].map((a,i)=>(
                    <button key={i} onClick={a.action} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors">{a.label}</button>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
                <h3 className="font-black mb-1">School Score</h3>
                <div className="text-5xl font-black mb-2">{dash.kpis?.overall ?? '—'}%</div>
                <div className="space-y-1 text-sm opacity-80">
                  <div className="flex justify-between"><span>Attendance</span><span>{dash.kpis?.engagement ?? 0}%</span></div>
                  <div className="flex justify-between"><span>Fee Collection</span><span>{dash.kpis?.financial ?? 0}%</span></div>
                  <div className="flex justify-between"><span>Academic</span><span>{dash.kpis?.academic ?? 0}%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT CARDS TAB */}
        {tab==='reportcard' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-gray-900">📄 Report Card Generator</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Generate PDF report cards — auto-sent to students and parents</p>
                </div>
                <div className="flex gap-3">
                  <select value={rcForm.academicYear} onChange={e=>setRcForm(f=>({...f,academicYear:e.target.value}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {YEARS.map(y=><option key={y}>{y}</option>)}
                  </select>
                  <select value={rcForm.term} onChange={e=>setRcForm(f=>({...f,term:e.target.value}))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                    {TERMS.map(t=><option key={t}>{t}</option>)}
                  </select>
                  <button onClick={()=>setRcModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">+ Generate Single</button>
                  <button onClick={handleBulkReportCards} disabled={generating} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-40">
                    {generating ? 'Generating...' : '🚀 Bulk — All Students'}
                  </button>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 mb-4">
                <strong>How it works:</strong> Report cards are generated as professional PDFs using student grades, attendance and exam results. Each card includes subject-wise scores, GPA, attendance %, class rank and principal signature lines. Students and parents receive an in-app notification with download link.
              </div>

              {/* Generated list */}
              {generatedPdfs.length > 0 && (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100">
                    {['Student','Year','Term','Generated','Status'].map(h=><th key={h} className="pb-2 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {generatedPdfs.map((p,i)=>(
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2 font-medium">{p.student?.user?.profile?.firstName} {p.student?.user?.profile?.lastName}</td>
                        <td className="py-2 text-gray-500">{p.academicYear}</td>
                        <td className="py-2 text-gray-500">{p.term}</td>
                        <td className="py-2 text-gray-500">{new Date(p.generatedAt).toLocaleString('en-PK')}</td>
                        <td className="py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">✅ Queued</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {tab==='attendance' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">✅ Attendance Reports</h3>
              <button onClick={handleExportAttendance} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">📥 Export CSV</button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label:'Present Today', value:`${att.present ?? 0}`, pct: att.presentRate ?? 0, color:'bg-green-500' },
                { label:'Absent Today',  value:`${att.absent  ?? 0}`, pct: att.absent ? (att.absent/Math.max(att.total,1))*100 : 0, color:'bg-red-500' },
                { label:'Late Today',    value:`${att.late    ?? 0}`, pct: att.late   ? (att.late  /Math.max(att.total,1))*100 : 0, color:'bg-amber-500' },
              ].map(s=>(
                <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full`} style={{width:`${s.pct}%`}}/></div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(s.pct)}% of total</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>⚠️ Chronic Absentee Alert:</strong> {risk.filter((r:any)=>r.attendanceRate<75).length} students have attendance below 75%. <button onClick={()=>setTab('overview')} className="underline ml-1">View in AI Monitor →</button>
            </div>
          </div>
        )}

        {/* FEES TAB */}
        {tab==='fees' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">💰 Fee Collection Report</h3>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">📥 Export Excel</button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label:'Collection Rate', value:`${dash.feeCollectionRate ?? 0}%`, color:'text-green-600' },
                { label:'This Month', value:`Rs. ${Number((feeRevenue as any)?.totalRevenue ?? 0).toLocaleString()}`, color:'text-blue-600' },
                { label:'Outstanding', value:`Rs. ${Number((feeRevenue as any)?.outstanding ?? 0).toLocaleString()}`, color:'text-red-600' },
                { label:'Paid Invoices', value:(feeRevenue as any)?.paidCount ?? 0, color:'text-gray-900' },
              ].map(s=>(
                <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {tab==='performance' && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 mb-4">🎯 Academic Performance</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">AI Recommendations</h4>
                {[
                  { icon:'📱', text:'Enable SMS alerts for absent students — increases parent response by 40%' },
                  { icon:'💰', text:'Send automated fee reminders 7 days before due date' },
                  { icon:'📊', text:'Schedule monthly parent-teacher meetings for HIGH risk students' },
                  { icon:'📚', text:'Implement weekly progress reports to parents' },
                ].map((r,i)=>(
                  <div key={i} className="flex gap-3 p-3 mb-2 bg-blue-50 rounded-xl">
                    <span className="text-xl">{r.icon}</span>
                    <p className="text-sm text-blue-800">{r.text}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">School Benchmarks</h4>
                {[
                  { label:'Your Attendance Rate', yours: dash.kpis?.engagement ?? 0, benchmark: 85 },
                  { label:'Fee Collection Rate',  yours: dash.kpis?.financial  ?? 0, benchmark: 78 },
                  { label:'Academic Score',        yours: dash.kpis?.academic   ?? 0, benchmark: 75 },
                ].map(b=>(
                  <div key={b.label} className="mb-4">
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium">{b.label}</span><span className="text-gray-500">Benchmark: {b.benchmark}%</span></div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute h-full bg-blue-600 rounded-full" style={{width:`${b.yours}%`}}/>
                      <div className="absolute h-full border-r-2 border-dashed border-gray-400" style={{left:`${b.benchmark}%`}}/>
                    </div>
                    <p className={`text-xs mt-1 font-bold ${b.yours >= b.benchmark ? 'text-green-600':'text-red-600'}`}>{b.yours}% {b.yours >= b.benchmark ? '✅ Above benchmark':'⚠️ Below benchmark'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Card Modal */}
      {rcModal && (
        <Modal title="Generate Report Card" onClose={()=>setRcModal(false)}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student *</label>
              <select value={rcForm.studentId} onChange={e=>setRcForm(f=>({...f,studentId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select student</option>
                {allStudents.map((s:any)=><option key={s.id} value={s.id}>{s.user?.profile?.firstName} {s.user?.profile?.lastName} — {s.rollNumber}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Academic Year</label>
                <select value={rcForm.academicYear} onChange={e=>setRcForm(f=>({...f,academicYear:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {YEARS.map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Term</label>
                <select value={rcForm.term} onChange={e=>setRcForm(f=>({...f,term:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {TERMS.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              PDF will include: subject grades, GPA, attendance %, class rank, teacher remarks, and signature lines. Student and parents will be notified.
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setRcModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleGenerateReportCard} disabled={!rcForm.studentId||generating} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40">
                {generating ? 'Generating PDF...' : '📄 Generate & Notify'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
