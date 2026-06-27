'use client';
import React, { useState } from 'react';
import { useClasses, useSections, useGradebook, useReportCard, useSubmitGrade, useStudents } from '@/hooks/use-api';
import { PageHeader } from '@/components/shared/page-header';
import { Topbar } from '@/components/layout/topbar';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';

const gradeColor = (pct: number) => pct >= 90 ? 'green' : pct >= 75 ? 'blue' : pct >= 60 ? 'yellow' : 'red';
const letterGrade = (pct: number) => pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';
const gradeColor2 = (g: string) => g === 'A+' || g === 'A' ? '#16a34a' : g === 'B+' || g === 'B' ? '#2563eb' : g === 'C' ? '#d97706' : '#dc2626';

function generateReportCardHTML(rcData: any): string {
  const student = rcData.student?.user?.profile;
  const name = student ? `${student.firstName} ${student.lastName}` : 'Student';
  const section = rcData.section ? `${rcData.section.class?.name} - Section ${rcData.section.name}` : '';
  const subjects: any[] = rcData.subjects ?? [];
  const rows = subjects.map((s: any) => {
    const pct = s.maxMarks ? Math.round((s.marks / s.maxMarks) * 100) : 0;
    const grade = letterGrade(pct);
    const color = gradeColor2(grade);
    return `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:500">${s.subject}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-family:monospace;font-size:14px">${s.marks}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-family:monospace;font-size:14px;color:#9ca3af">${s.maxMarks}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:14px">${pct}%</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6"><span style="background:${color}20;color:${color};padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700">${grade}</span></td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><style>
    body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#1a1a1a}
    @media print{body{margin:0;padding:0}}
    .card{max-width:720px;margin:0 auto;border:2px solid #2563eb;border-radius:14px;overflow:hidden}
    .header{background:linear-gradient(135deg,#1e40af,#2563eb);color:white;padding:24px 30px}
    .header h1{margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px}
    .header p{margin:4px 0 0;font-size:14px;opacity:.8}
    .meta{padding:18px 30px;background:#f8faff;display:flex;gap:24px;flex-wrap:wrap;border-bottom:1px solid #e5e7eb}
    .meta-item{text-align:center}
    .meta-label{font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:600}
    .meta-value{font-size:22px;font-weight:900;color:#1e3a8a;margin-top:2px}
    .body{padding:20px 30px}
    table{width:100%;border-collapse:collapse}
    thead th{background:#eff6ff;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.5px}
    .footer{background:#f9fafb;padding:14px 30px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb}
    .pass{color:#16a34a;font-weight:700}
    .fail{color:#dc2626;font-weight:700}
  </style></head>
  <body><div class="card">
    <div class="header">
      <h1>Academic Report Card</h1>
      <p>${name} · ${section} · Generated ${new Date().toLocaleDateString('en-PK')}</p>
    </div>
    <div class="meta">
      <div class="meta-item"><div class="meta-label">Total Marks</div><div class="meta-value">${rcData.totalMarksObtained ?? 0}/${rcData.totalMaxMarks ?? 0}</div></div>
      <div class="meta-item"><div class="meta-label">Percentage</div><div class="meta-value">${rcData.percentage ?? 0}%</div></div>
      <div class="meta-item"><div class="meta-label">GPA</div><div class="meta-value">${rcData.gpa ?? '—'}</div></div>
      <div class="meta-item"><div class="meta-label">Class Rank</div><div class="meta-value">${rcData.rank ? `#${rcData.rank}` : '—'}</div></div>
      <div class="meta-item"><div class="meta-label">Result</div><div class="meta-value ${(rcData.percentage ?? 0) >= 40 ? 'pass' : 'fail'}">${(rcData.percentage ?? 0) >= 40 ? 'PASS' : 'FAIL'}</div></div>
    </div>
    <div class="body">
      <table>
        <thead><tr><th>Subject</th><th>Marks</th><th>Max</th><th>%</th><th>Grade</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="footer">MySchool Management System · Official Report Card · ${new Date().toLocaleDateString('en-PK')}</div>
  </div></body></html>`;
}

function printReportCard(rcData: any) {
  const html = generateReportCardHTML(rcData);
  const win = window.open('', '_blank', 'width=800,height=700');
  if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 300); }
}

export default function GradesPage() {
  const [view, setView] = useState<'gradebook'|'report-card'>('gradebook');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [gradeModal, setGradeModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({ studentId: '', subjectName: '', marks: '', maxMarks: '100', examTitle: '' });

  const { data: classes } = useClasses();
  const { data: sections } = useSections();
  const { data: gradebook, isLoading: gbLoading } = useGradebook(selectedSection);
  const { data: reportCard, isLoading: rcLoading } = useReportCard(selectedStudent);
  const { data: students } = useStudents({ sectionId: selectedSection });
  const submitGrade = useSubmitGrade();

  const classList: any[] = Array.isArray(classes) ? classes : [];
  const sectionList: any[] = Array.isArray(sections) ? sections : [];
  const studentList: any[] = (students as any)?.data ?? [];
  const gbData: any[] = Array.isArray(gradebook) ? gradebook : [];
  const rcData: any = reportCard ?? {};

  const handleSubmitGrade = async () => {
    await submitGrade.mutateAsync({ ...gradeForm, marks: Number(gradeForm.marks), maxMarks: Number(gradeForm.maxMarks) });
    setGradeForm({ studentId: '', subjectName: '', marks: '', maxMarks: '100', examTitle: '' });
    setGradeModal(false);
  };

  const selectedStudentName = studentList.find((s: any) => s.id === selectedStudent);

  return (
    <>
      <Topbar title="Grades" subtitle="Gradebook and student performance" />
      <div className="p-6">
        <PageHeader
          title="Grades & Gradebook"
          action={
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['gradebook','report-card'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
                    {v === 'gradebook' ? 'Gradebook' : 'Report Card'}
                  </button>
                ))}
              </div>
              <button onClick={() => setGradeModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Grade</button>
            </div>
          }
        />

        {view === 'gradebook' && (
          <>
            <div className="flex gap-3 mb-6">
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px]">
                <option value="">Select Section</option>
                {sectionList.map((s: any) => <option key={s.id} value={s.id}>{s.class?.name}-{s.name}</option>)}
              </select>
            </div>
            {!selectedSection ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-gray-500 font-medium">Select a section to view the gradebook</p>
              </div>
            ) : gbLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
            ) : gbData.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">📊</p><p className="text-gray-400">No grades recorded yet for this section</p>
              </div>
            ) : (
              <>
                {/* Grade summary stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Records', value: gbData.length, color: 'text-gray-700 bg-gray-50' },
                    { label: 'A+ / A Grades', value: gbData.filter((g: any) => Math.round((g.marks/g.maxMarks)*100) >= 80).length, color: 'text-green-700 bg-green-50' },
                    { label: 'Avg Score', value: `${Math.round(gbData.reduce((s: number, g: any) => s + (g.marks/g.maxMarks)*100, 0) / gbData.length)}%`, color: 'text-blue-700 bg-blue-50' },
                    { label: 'Below 50%', value: gbData.filter((g: any) => Math.round((g.marks/g.maxMarks)*100) < 50).length, color: 'text-red-700 bg-red-50' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                      <p className="text-xl font-black">{s.value}</p>
                      <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>{['Student','Subject','Exam','Marks','%','Grade','Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {gbData.map((g: any) => {
                        const pct = Math.round((g.marks / g.maxMarks) * 100);
                        return (
                          <tr key={g.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-900">{g.student?.user?.profile?.firstName} {g.student?.user?.profile?.lastName}</p></td>
                            <td className="px-4 py-3 text-sm text-gray-600">{g.subject?.name ?? g.subjectName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{g.exam?.title ?? g.examTitle ?? '—'}</td>
                            <td className="px-4 py-3"><span className="font-mono text-sm font-bold">{g.marks}/{g.maxMarks}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-gray-500">{pct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><Badge variant={gradeColor(pct) as any}>{letterGrade(pct)}</Badge></td>
                            <td className="px-4 py-3 text-xs text-gray-400">{new Date(g.createdAt).toLocaleDateString('en-PK')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {view === 'report-card' && (
          <>
            <div className="flex gap-3 mb-6">
              <select value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setSelectedStudent(''); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px]">
                <option value="">Select Section</option>
                {sectionList.map((s: any) => <option key={s.id} value={s.id}>{s.class?.name}-{s.name}</option>)}
              </select>
              {selectedSection && (
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px]">
                  <option value="">Select Student</option>
                  {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.user?.profile?.firstName} {s.user?.profile?.lastName}</option>)}
                </select>
              )}
              {selectedStudent && !rcLoading && rcData?.subjects?.length > 0 && (
                <button
                  onClick={() => printReportCard(rcData)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 shadow-sm"
                >
                  🖨️ Print Report Card
                </button>
              )}
            </div>
            {!selectedStudent ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">📋</p><p className="text-gray-500 font-medium">Select a student to view their report card</p>
              </div>
            ) : rcLoading ? (
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
                {/* Report Card Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-xl">Academic Report Card</h3>
                      <p className="text-blue-200 text-sm mt-0.5">
                        {rcData.student?.user?.profile?.firstName} {rcData.student?.user?.profile?.lastName}
                        {rcData.section && ` · ${rcData.section.class?.name}-${rcData.section.name}`}
                      </p>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${(rcData.percentage ?? 0) >= 40 ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                      {letterGrade(rcData.percentage ?? 0)}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
                  {[
                    { label: 'Total Marks', value: `${rcData.totalMarksObtained ?? 0}/${rcData.totalMaxMarks ?? 0}` },
                    { label: 'Percentage', value: `${rcData.percentage ?? 0}%` },
                    { label: 'GPA', value: rcData.gpa ?? '—' },
                    { label: 'Rank', value: rcData.rank ? `#${rcData.rank}` : '—' },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                      <p className="text-xl font-black text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Subject grades */}
                <div className="p-6">
                  {(rcData.subjects ?? []).length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No grades recorded for this student yet</div>
                  ) : (
                    <table className="w-full">
                      <thead><tr className="border-b border-gray-100">{['Subject','Marks','Max','%','Grade','Performance'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-bold text-gray-500">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {(rcData.subjects ?? []).map((s: any) => {
                          const pct = s.maxMarks ? Math.round((s.marks / s.maxMarks) * 100) : 0;
                          return (
                            <tr key={s.subject} className="hover:bg-gray-50">
                              <td className="px-3 py-2.5 text-sm font-medium">{s.subject}</td>
                              <td className="px-3 py-2.5 font-mono text-sm font-bold">{s.marks}</td>
                              <td className="px-3 py-2.5 font-mono text-sm text-gray-400">{s.maxMarks}</td>
                              <td className="px-3 py-2.5 text-sm">{pct}%</td>
                              <td className="px-3 py-2.5"><Badge variant={gradeColor(pct) as any}>{letterGrade(pct)}</Badge></td>
                              <td className="px-3 py-2.5">
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Result footer */}
                <div className={`px-6 py-3 text-sm font-bold ${(rcData.percentage ?? 0) >= 40 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {(rcData.percentage ?? 0) >= 40 ? '✓ PASSED — Student has met the minimum passing criteria' : '✗ FAILED — Student did not meet the minimum passing criteria'}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={gradeModal} onClose={() => setGradeModal(false)} title="Submit Grade">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Select section</option>
              {sectionList.map((s: any) => <option key={s.id} value={s.id}>{s.class?.name}-{s.name}</option>)}
            </select></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student</label>
            <select value={gradeForm.studentId} onChange={e => setGradeForm(f=>({...f, studentId: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Select student</option>
              {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.user?.profile?.firstName} {s.user?.profile?.lastName}</option>)}
            </select></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
            <input value={gradeForm.subjectName} onChange={e => setGradeForm(f=>({...f, subjectName: e.target.value}))} placeholder="e.g. Mathematics" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam / Assessment</label>
            <input value={gradeForm.examTitle} onChange={e => setGradeForm(f=>({...f, examTitle: e.target.value}))} placeholder="e.g. Mid-Term 2025" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marks Obtained</label>
              <input type="number" value={gradeForm.marks} onChange={e => setGradeForm(f=>({...f, marks: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Marks</label>
              <input type="number" value={gradeForm.maxMarks} onChange={e => setGradeForm(f=>({...f, maxMarks: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          {gradeForm.marks && gradeForm.maxMarks && (
            <div className="bg-blue-50 rounded-lg p-2.5 text-sm text-blue-700 font-medium">
              Auto-grade: {letterGrade(Math.round((Number(gradeForm.marks)/Number(gradeForm.maxMarks))*100))} ({Math.round((Number(gradeForm.marks)/Number(gradeForm.maxMarks))*100)}%)
            </div>
          )}
          <button onClick={handleSubmitGrade} disabled={submitGrade.isPending || !gradeForm.studentId || !gradeForm.marks} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {submitGrade.isPending ? 'Submitting...' : 'Submit Grade'}
          </button>
        </div>
      </Modal>
    </>
  );
}
