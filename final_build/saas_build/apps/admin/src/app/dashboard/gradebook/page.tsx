'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useGradebook, useSections, useSubmitGrade, useExams } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const getGrade = (pct: number) => pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
const getGradeColor = (g: string) => g === 'A+' ? 'text-green-700 bg-green-50' : g === 'A' ? 'text-blue-700 bg-blue-50' : g === 'B' ? 'text-purple-700 bg-purple-50' : g === 'C' ? 'text-yellow-700 bg-yellow-50' : g === 'D' ? 'text-orange-700 bg-orange-50' : 'text-red-700 bg-red-50';

export default function GradebookPage() {
  const { toast } = useToast();
  const [view, setView] = useState<'gradebook' | 'summary'>('gradebook');
  const [selectedSection, setSelectedSection] = useState('');
  const [gradeModal, setGradeModal] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ marks: '', maxMarks: '100', subject: '' });

  const { data: sections = [] } = useSections();
  const { data: gradebookData, isLoading } = useGradebook(selectedSection);
  const submitGrade = useSubmitGrade();

  const entries: any[] = Array.isArray(gradebookData) ? gradebookData : [];

  const uniqueStudents = Array.from(new Map(entries.map((e: any) => [e.studentId, { id: e.studentId, name: e.studentName || e.student?.user?.profile?.firstName + ' ' + e.student?.user?.profile?.lastName }])).values());
  const uniqueSubjects = [...new Set(entries.map((e: any) => e.subject?.name || e.subjectName || 'N/A'))];

  const getStudentMarks = (studentId: string, subject: string) => {
    const e = entries.find((x: any) => x.studentId === studentId && (x.subject?.name === subject || x.subjectName === subject));
    return e ? Math.round((e.marksObtained / e.maxMarks) * 100) : null;
  };

  const getStudentAvg = (studentId: string) => {
    const studentEntries = entries.filter((e: any) => e.studentId === studentId);
    if (!studentEntries.length) return 0;
    return Math.round(studentEntries.reduce((acc: number, e: any) => acc + (e.marksObtained / e.maxMarks) * 100, 0) / studentEntries.length);
  };

  const atRisk = uniqueStudents.filter(s => getStudentAvg(s.id) < 60 && getStudentAvg(s.id) > 0);

  const handleSubmitGrade = async () => {
    if (!gradeModal || !gradeForm.marks) return;
    try {
    await submitGrade.mutateAsync({ studentId: gradeModal.studentId, examId: gradeModal.examId, subjectId: gradeModal.subjectId, marksObtained: Number(gradeForm.marks), maxMarks: Number(gradeForm.maxMarks) });
    setGradeModal(null);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  return (
    <>
      <Topbar title="Gradebook" subtitle="Comprehensive marks entry & academic performance" />
      <div className="p-6">
        <PageHeader title="Gradebook" subtitle="Academic performance tracker"
          action={
            <div className="flex gap-2">
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select Section</option>
                {sections.map((s: any) => <option key={s.id} value={s.id}>{s.class?.name} - {s.name}</option>)}
              </select>
              <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⬇ Export</button>
            </div>
          }
        />

        {atRisk.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-800 text-sm">{atRisk.length} student(s) at academic risk (below 60%)</p>
              <p className="text-xs text-red-600">{atRisk.map(s => s.name).join(', ')}</p>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['gradebook', 'summary'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
              {v === 'gradebook' ? 'Marks Grid' : 'Summary'}
            </button>
          ))}
        </div>

        {!selectedSection ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📊</p>
            <p className="font-medium">Select a section to view the gradebook</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading gradebook data...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📝</p>
            <p className="font-medium">No grades recorded yet</p>
            <p className="text-sm mt-1">Grades will appear here once entered via the Exams module</p>
          </div>
        ) : view === 'gradebook' ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Student</th>
                  {uniqueSubjects.map(s => <th key={s} className="px-3 py-3 text-center">{s.slice(0,6)}.</th>)}
                  <th className="px-4 py-3 text-center">Avg</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {uniqueStudents.map(student => {
                  const avg = getStudentAvg(student.id);
                  const grade = getGrade(avg);
                  return (
                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                      {uniqueSubjects.map(sub => {
                        const marks = getStudentMarks(student.id, sub);
                        return (
                          <td key={sub} className="px-3 py-3 text-center">
                            {marks !== null ? (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${marks >= 80 ? 'bg-green-50 text-green-700' : marks >= 60 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{marks}%</span>
                            ) : <span className="text-gray-300">-</span>}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-gray-800">{avg > 0 ? `${avg}%` : '-'}</td>
                      <td className="px-4 py-3 text-center">
                        {avg > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded ${getGradeColor(grade)}`}>{grade}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Grade Distribution</h3>
              {['A+', 'A', 'B', 'C', 'D', 'F'].map(g => {
                const count = uniqueStudents.filter(s => getGrade(getStudentAvg(s.id)) === g && getStudentAvg(s.id) > 0).length;
                return (
                  <div key={g} className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded w-8 text-center ${getGradeColor(g)}`}>{g}</span>
                    <div className="flex-1 bg-gray-100 h-3 rounded-full">
                      <div className="h-3 rounded-full bg-blue-500" style={{ width: `${uniqueStudents.length ? (count / uniqueStudents.length) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-4">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Top Performers</h3>
              {[...uniqueStudents].sort((a, b) => getStudentAvg(b.id) - getStudentAvg(a.id)).slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                    <span className="text-sm font-medium text-gray-800">{s.name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">{getStudentAvg(s.id)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
