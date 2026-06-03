'use client';
import React, { useState } from 'react';
import { useClasses, useSections, useGradebook, useReportCard, useSubmitGrade, useStudents } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const gradeColor = (pct: number) => pct >= 90 ? 'green' : pct >= 75 ? 'blue' : pct >= 60 ? 'yellow' : 'red';
const letterGrade = (pct: number) => pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';

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
                    {v === 'gradebook' ? '📊 Gradebook' : '📋 Report Card'}
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
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Student','Subject','Exam','Marks','Grade','Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {gbData.map((g: any) => {
                      const pct = Math.round((g.marks / g.maxMarks) * 100);
                      return (
                        <tr key={g.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-900">{g.student?.user?.profile?.firstName} {g.student?.user?.profile?.lastName}</p></td>
                          <td className="px-4 py-3 text-sm text-gray-600">{g.subject?.name ?? g.subjectName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{g.exam?.title ?? g.examTitle ?? '—'}</td>
                          <td className="px-4 py-3"><span className="font-mono text-sm font-bold">{g.marks}/{g.maxMarks}</span><span className="text-xs text-gray-400 ml-1">({pct}%)</span></td>
                          <td className="px-4 py-3"><Badge variant={gradeColor(pct) as any}>{letterGrade(pct)}</Badge></td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(g.createdAt).toLocaleDateString('en-PK')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
            </div>
            {!selectedStudent ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">📋</p><p className="text-gray-500 font-medium">Select a student to view their report card</p>
              </div>
            ) : rcLoading ? (
              <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-3xl">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="font-black text-xl text-gray-900">Report Card</h3>
                  <p className="text-gray-400 text-sm">{rcData.student?.user?.profile?.firstName} {rcData.student?.user?.profile?.lastName} · {rcData.section?.class?.name}-{rcData.section?.name}</p>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Total Marks', value: `${rcData.totalMarksObtained ?? 0}/${rcData.totalMaxMarks ?? 0}` },
                    { label: 'Percentage', value: `${rcData.percentage ?? 0}%` },
                    { label: 'GPA', value: rcData.gpa ?? '—' },
                    { label: 'Rank', value: rcData.rank ? `#${rcData.rank}` : '—' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-black text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100">{['Subject','Marks','Max','%','Grade'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-bold text-gray-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {(rcData.subjects ?? []).map((s: any) => {
                      const pct = Math.round((s.marks / s.maxMarks) * 100);
                      return (
                        <tr key={s.subject}><td className="px-3 py-2.5 text-sm font-medium">{s.subject}</td><td className="px-3 py-2.5 font-mono text-sm">{s.marks}</td><td className="px-3 py-2.5 font-mono text-sm text-gray-400">{s.maxMarks}</td><td className="px-3 py-2.5 text-sm">{pct}%</td><td className="px-3 py-2.5"><Badge variant={gradeColor(pct) as any}>{letterGrade(pct)}</Badge></td></tr>
                      );
                    })}
                  </tbody>
                </table>
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
          <button onClick={handleSubmitGrade} disabled={submitGrade.isPending || !gradeForm.studentId || !gradeForm.marks} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {submitGrade.isPending ? 'Submitting...' : 'Submit Grade'}
          </button>
        </div>
      </Modal>
    </>
  );
}
