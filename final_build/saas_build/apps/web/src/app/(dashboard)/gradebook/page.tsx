'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Urdu', 'Biology', 'Computer', 'Pakistan Studies'];

const STUDENTS_DATA = [
  { id: 'S001', name: 'Ahmed Ali', rollNo: '01', marks: [88, 92, 78, 85, 79, 90, 95, 82], attendance: 95 },
  { id: 'S002', name: 'Sara Khan', rollNo: '02', marks: [95, 88, 92, 91, 88, 94, 90, 87], attendance: 98 },
  { id: 'S003', name: 'Omar Hassan', rollNo: '03', marks: [72, 68, 75, 80, 70, 65, 88, 76], attendance: 82 },
  { id: 'S004', name: 'Bilal Qureshi', rollNo: '04', marks: [45, 52, 48, 65, 58, 50, 72, 60], attendance: 75 },
  { id: 'S005', name: 'Fatima Shah', rollNo: '05', marks: [91, 87, 89, 93, 86, 92, 88, 90], attendance: 97 },
  { id: 'S006', name: 'Ibrahim Ali', rollNo: '06', marks: [78, 82, 80, 75, 83, 77, 85, 80], attendance: 90 },
  { id: 'S007', name: 'Nadia Rehman', rollNo: '07', marks: [85, 79, 83, 88, 81, 86, 80, 84], attendance: 94 },
  { id: 'S008', name: 'Kamran Shah', rollNo: '08', marks: [60, 65, 58, 70, 62, 55, 75, 68], attendance: 78 },
];

const MAX_MARKS = 100;

const getGrade = (marks: number) => {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A+': return 'text-green-700 bg-green-50';
    case 'A': return 'text-blue-700 bg-blue-50';
    case 'B': return 'text-purple-700 bg-purple-50';
    case 'C': return 'text-yellow-700 bg-yellow-50';
    case 'D': return 'text-orange-700 bg-orange-50';
    default: return 'text-red-700 bg-red-50';
  }
};

export default function GradebookPage() {
  const [view, setView] = useState<'gradebook' | 'summary' | 'report'>('gradebook');
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [editModal, setEditModal] = useState<{ student: typeof STUDENTS_DATA[0]; subIdx: number } | null>(null);
  const [editMark, setEditMark] = useState('');

  const getAvg = (marks: number[]) => Math.round(marks.reduce((a, b) => a + b, 0) / marks.length);
  const getRank = (studentId: string) => {
    const sorted = [...STUDENTS_DATA].sort((a, b) => getAvg(b.marks) - getAvg(a.marks));
    return sorted.findIndex(s => s.id === studentId) + 1;
  };

  const classAvg = (subIdx: number) => Math.round(STUDENTS_DATA.reduce((a, s) => a + s.marks[subIdx], 0) / STUDENTS_DATA.length);
  const topStudent = [...STUDENTS_DATA].sort((a, b) => getAvg(b.marks) - getAvg(a.marks))[0];
  const atRisk = STUDENTS_DATA.filter(s => getAvg(s.marks) < 60);

  return (
    <>
      <Topbar title="Gradebook" subtitle="Comprehensive marks entry & academic performance" />
      <div className="p-6">
        <PageHeader title="Gradebook — Class 10-A" subtitle="Mid-Term Examination Results 2026"
          action={
            <div className="flex gap-2">
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['10-A', '10-B', '9-A', '9-B', '8-A', '8-B'].map(c => <option key={c}>{c}</option>)}
              </select>
              <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⬇ Export</button>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">📤 Publish Results</button>
            </div>
          }
        />

        {/* Alert: At Risk */}
        {atRisk.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-800 text-sm">{atRisk.length} student(s) at academic risk</p>
              <p className="text-xs text-red-600">{atRisk.map(s => s.name).join(', ')} — Average below 60%</p>
            </div>
            <button className="ml-auto text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg">Notify Parents</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['gradebook', 'summary', 'report'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'gradebook' ? 'Marks Entry' : v === 'summary' ? 'Class Summary' : 'Report Cards'}
            </button>
          ))}
        </div>

        {/* Gradebook Table */}
        {view === 'gradebook' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-50">#</th>
                  <th className="px-4 py-3 text-left sticky left-8 bg-gray-50">Student</th>
                  {SUBJECTS.map(s => <th key={s} className="px-3 py-3 text-center">{s.slice(0, 4)}.</th>)}
                  <th className="px-4 py-3 text-center">Avg</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3 text-center">Att%</th>
                </tr>
                <tr className="text-xs text-blue-500 bg-blue-50 border-b border-gray-100">
                  <td colSpan={2} className="px-4 py-2 font-bold">Class Average</td>
                  {SUBJECTS.map((_, i) => <td key={i} className="px-3 py-2 text-center font-bold">{classAvg(i)}</td>)}
                  <td colSpan={4}></td>
                </tr>
              </thead>
              <tbody>
                {STUDENTS_DATA.map((s, si) => {
                  const avg = getAvg(s.marks);
                  const grade = getGrade(avg);
                  const rank = getRank(s.id);
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.rollNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                      {s.marks.map((m, mi) => (
                        <td key={mi} className="px-3 py-3 text-center">
                          <button onClick={() => { setEditModal({ student: s, subIdx: mi }); setEditMark(String(m)); }}
                            className={`w-10 h-7 rounded text-xs font-bold cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all ${m >= 80 ? 'bg-green-50 text-green-700' : m >= 60 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                            {m}
                          </button>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-bold text-gray-800">{avg}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getGradeColor(grade)}`}>{grade}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-500">#{rank}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={s.attendance >= 90 ? 'green' : s.attendance >= 75 ? 'yellow' : 'red'}>{s.attendance}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {view === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Grade Distribution</h3>
              {['A+', 'A', 'B', 'C', 'D', 'F'].map(g => {
                const count = STUDENTS_DATA.filter(s => getGrade(getAvg(s.marks)) === g).length;
                return (
                  <div key={g} className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded w-8 text-center ${getGradeColor(g)}`}>{g}</span>
                    <div className="flex-1 bg-gray-100 h-3 rounded-full">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(count / STUDENTS_DATA.length) * 100}%`, background: g === 'A+' ? '#16a34a' : g === 'A' ? '#2563eb' : g === 'B' ? '#9333ea' : g === 'C' ? '#d97706' : g === 'D' ? '#ea580c' : '#dc2626' }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-4">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Subject Performance</h3>
              {SUBJECTS.map((s, i) => {
                const avg = classAvg(i);
                return (
                  <div key={s} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500 w-20 truncate">{s}</span>
                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${avg}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-8">{avg}%</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Top Performers</h3>
              {[...STUDENTS_DATA].sort((a, b) => getAvg(b.marks) - getAvg(a.marks)).slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-400'}`}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <span className="text-sm font-medium text-gray-800">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-600">{getAvg(s.marks)}%</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getGradeColor(getGrade(getAvg(s.marks)))}`}>{getGrade(getAvg(s.marks))}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">At-Risk Students</h3>
              {atRisk.length === 0 ? (
                <p className="text-center text-gray-400 py-6">✅ No students at risk</p>
              ) : atRisk.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><p className="text-sm font-medium text-red-700">{s.name}</p><p className="text-xs text-gray-400">{s.attendance}% attendance</p></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-600">{getAvg(s.marks)}%</span>
                    <button className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded">Notify</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Cards */}
        {view === 'report' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STUDENTS_DATA.map(s => {
              const avg = getAvg(s.marks);
              const grade = getGrade(avg);
              const rank = getRank(s.id);
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">Roll #{s.rollNo} · Class {selectedClass}</p>
                    </div>
                    <div className={`text-lg font-black px-3 py-1 rounded-lg ${getGradeColor(grade)}`}>{grade}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                    <div className="text-center bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-400">Average</p><p className="font-bold text-green-600">{avg}%</p></div>
                    <div className="text-center bg-blue-50 rounded-lg p-2"><p className="text-xs text-gray-400">Rank</p><p className="font-bold text-blue-600">#{rank}</p></div>
                    <div className="text-center bg-purple-50 rounded-lg p-2"><p className="text-xs text-gray-400">Attendance</p><p className="font-bold text-purple-600">{s.attendance}%</p></div>
                  </div>
                  <div className="space-y-1">
                    {SUBJECTS.map((sub, i) => (
                      <div key={sub} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 w-28">{sub}</span>
                        <div className="flex-1 mx-2 bg-gray-100 h-1.5 rounded-full">
                          <div className={`h-1.5 rounded-full ${s.marks[i] >= 80 ? 'bg-green-500' : s.marks[i] >= 60 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${s.marks[i]}%` }} />
                        </div>
                        <span className="font-bold text-gray-700 w-6">{s.marks[i]}</span>
                        <span className={`ml-1 text-xs font-bold w-6 text-right ${getGradeColor(getGrade(s.marks[i])).split(' ')[0]}`}>{getGrade(s.marks[i])}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100">🖨 Print</button>
                    <button className="flex-1 py-1.5 bg-green-50 text-green-600 text-xs rounded-lg hover:bg-green-100">📧 Email</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Mark Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Marks">
        {editModal && (
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-bold text-gray-800">{editModal.student.name}</p>
              <p className="text-xs text-gray-500">{SUBJECTS[editModal.subIdx]}</p>
              <p className="text-xs text-gray-400">Current marks: {editModal.student.marks[editModal.subIdx]}/{MAX_MARKS}</p>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">New Marks (out of {MAX_MARKS})</label>
              <input type="number" min="0" max={MAX_MARKS} value={editMark} onChange={e => setEditMark(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center text-xl font-bold" />
            </div>
            {editMark && <p className="text-center text-sm"><span className={`font-bold px-3 py-1 rounded ${getGradeColor(getGrade(Number(editMark)))}`}>Grade: {getGrade(Number(editMark))}</span></p>}
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">Save Marks</button>
              <button onClick={() => setEditModal(null)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
