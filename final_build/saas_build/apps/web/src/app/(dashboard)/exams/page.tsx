'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { Topbar } from '../../../components/layout/topbar';

const EXAM_TYPES = ['QUIZ','MIDTERM','FINAL','ASSIGNMENT','PROJECT','PRACTICAL'];
const getStatusVariant = (e: any) => {
  if (e.isPublished) return 'green';
  if (new Date(e.scheduledAt) < new Date()) return 'yellow';
  return 'blue';
};
const getStatusLabel = (e: any) => {
  if (e.isPublished) return '✅ Results Published';
  if (new Date(e.scheduledAt) < new Date()) return '⏳ Pending Results';
  return '📅 Upcoming';
};

export default function ExamsPage() {
  const qc = useQueryClient();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [tab, setTab] = useState<'list'|'results'>('list');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [modal, setModal] = useState<'create'|'results'|null>(null);
  const [form, setForm] = useState({ name:'', examType:'MIDTERM', subjectId:'', scheduledAt:'', duration:'60', maxMarks:'100', passingMarks:'40', venue:'', instructions:'' });
  const [resultsData, setResultsData] = useState<Record<string, string>>({});
  const [bulkText, setBulkText] = useState('');

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams', year],
    queryFn: () => apiClient.get(`/exams?academicYear=${year}`),
  });
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: () => apiClient.get('/school-data/subjects') });
  const { data: examDetail } = useQuery({
    queryKey: ['exam-detail', selectedExam?.id],
    queryFn: () => apiClient.get(`/exams/${selectedExam?.id}`),
    enabled: !!selectedExam?.id && modal === 'results',
  });

  const createExam = useMutation({
    mutationFn: (d: any) => apiClient.post('/exams', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); setModal(null); },
  });
  const enterResults = useMutation({
    mutationFn: ({ id, results }: any) => apiClient.post(`/exams/${id}/results`, { results }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); qc.invalidateQueries({ queryKey: ['exam-detail'] }); setModal(null); alert('✅ Results published! Students and parents have been notified via SMS and in-app.'); },
  });

  const allExams = Array.isArray(exams) ? exams : (exams as any)?.data ?? [];
  const published = allExams.filter((e: any) => e.isPublished).length;
  const pending   = allExams.filter((e: any) => !e.isPublished && new Date(e.scheduledAt) < new Date()).length;
  const upcoming  = allExams.filter((e: any) => new Date(e.scheduledAt) >= new Date()).length;

  const handleSubmitResults = () => {
    if (!selectedExam) return;
    const results = Object.entries(resultsData).map(([studentId, marks]) => ({
      studentId, marksObtained: parseFloat(marks), remarks: '',
    })).filter(r => !isNaN(r.marksObtained));
    enterResults.mutate({ id: selectedExam.id, results });
  };

  const parseBulkText = () => {
    const lines = bulkText.trim().split('\n');
    const newData: Record<string, string> = { ...resultsData };
    const students: any[] = (examDetail as any)?.results || [];
    lines.forEach(line => {
      const parts = line.split(/[\t,]/);
      if (parts.length >= 2) {
        const rollOrName = parts[0].trim().toLowerCase();
        const marks = parts[parts.length - 1].trim();
        const student = students.find((r: any) =>
          r.student?.rollNumber?.toLowerCase() === rollOrName ||
          `${r.student?.user?.profile?.firstName} ${r.student?.user?.profile?.lastName}`.toLowerCase().includes(rollOrName)
        );
        if (student) newData[student.studentId] = marks;
      }
    });
    setResultsData(newData);
  };

  return (
    <>
      <Topbar title="Exams" subtitle="Schedule, manage and publish results" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Exams', value: allExams.length, color: 'bg-blue-600', icon: '📋' },
            { label: 'Upcoming', value: upcoming, color: 'bg-indigo-600', icon: '📅' },
            { label: 'Pending Results', value: pending, color: 'bg-amber-500', icon: '⏳' },
            { label: 'Results Published', value: published, color: 'bg-green-600', icon: '✅' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        <PageHeader title="Examinations" subtitle={`${allExams.length} exams in ${year}`}
          action={
            <div className="flex gap-3">
              <select value={year} onChange={e => setYear(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {[0,1,2].map(i => { const y = new Date().getFullYear()-i; return <option key={y} value={y}>{y}</option>; })}
              </select>
              <button onClick={() => setModal('create')} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">+ Schedule Exam</button>
            </div>
          }
        />

        {/* Exam List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="text-center py-16 text-gray-400">Loading exams...</div>
          ) : allExams.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-semibold">No exams scheduled</p>
              <p className="text-sm mt-1">Click "Schedule Exam" to create one</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                {['Exam','Subject','Date & Time','Marks','Duration','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {allExams.map((exam: any) => (
                  <tr key={exam.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm text-gray-900">{exam.name}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{exam.examType}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exam.subject?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">{new Date(exam.scheduledAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</p>
                      <p className="text-xs text-gray-400">{new Date(exam.scheduledAt).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono font-bold text-gray-900">{exam.maxMarks}</span>
                      <span className="text-gray-400 text-xs"> / pass {exam.passingMarks}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exam.duration} min</td>
                    <td className="px-4 py-3"><Badge variant={getStatusVariant(exam)}>{getStatusLabel(exam)}</Badge></td>
                    <td className="px-4 py-3">
                      {!exam.isPublished && new Date(exam.scheduledAt) < new Date() && (
                        <button
                          onClick={() => { setSelectedExam(exam); setResultsData({}); setBulkText(''); setModal('results'); }}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700"
                        >Enter Results</button>
                      )}
                      {exam.isPublished && (
                        <button
                          onClick={() => { setSelectedExam(exam); setModal('results'); }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100"
                        >View Results</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Exam Modal */}
      {modal === 'create' && (
        <Modal title="Schedule New Exam" onClose={() => setModal(null)}>
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Name *</label>
                <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Mid-Term Mathematics 2025" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Type</label>
                <select value={form.examType} onChange={e => setForm(f=>({...f,examType:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                <select value={form.subjectId} onChange={e => setForm(f=>({...f,subjectId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Select subject</option>
                  {(Array.isArray(subjects) ? subjects : (subjects as any)?.data ?? []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date & Time *</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f=>({...f,scheduledAt:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (minutes)</label>
                <input type="number" value={form.duration} onChange={e => setForm(f=>({...f,duration:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Marks</label>
                <input type="number" value={form.maxMarks} onChange={e => setForm(f=>({...f,maxMarks:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passing Marks</label>
                <input type="number" value={form.passingMarks} onChange={e => setForm(f=>({...f,passingMarks:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Venue</label>
                <input value={form.venue} onChange={e => setForm(f=>({...f,venue:e.target.value}))} placeholder="Exam Hall A, Room 201..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructions for Students</label>
                <textarea value={form.instructions} onChange={e => setForm(f=>({...f,instructions:e.target.value}))} rows={3} placeholder="Bring your student ID, no mobile phones..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 resize-none"/>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => createExam.mutate({ ...form, maxMarks: Number(form.maxMarks), passingMarks: Number(form.passingMarks), duration: Number(form.duration) })}
                disabled={!form.name || !form.scheduledAt || createExam.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40">
                {createExam.isPending ? 'Creating...' : 'Schedule Exam'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Enter Results Modal */}
      {modal === 'results' && selectedExam && (
        <Modal title={`Results: ${selectedExam.name}`} onClose={() => setModal(null)}>
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
              <div className="flex gap-6 text-sm">
                <div><span className="text-gray-500">Max Marks:</span> <strong>{selectedExam.maxMarks}</strong></div>
                <div><span className="text-gray-500">Passing:</span> <strong>{selectedExam.passingMarks}</strong></div>
                <div><span className="text-gray-500">Type:</span> <strong>{selectedExam.examType}</strong></div>
              </div>
            </div>

            {!selectedExam.isPublished && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bulk Import (Roll No, Marks — one per line)</label>
                <textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={"101, 85\n102, 72\n103, 91"}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-blue-400 resize-none"
                />
                <button onClick={parseBulkText} className="mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200">Parse Bulk Import</button>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Student</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Roll No</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Marks /{selectedExam.maxMarks}</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-500">Grade</th>
                </tr></thead>
                <tbody>
                  {((examDetail as any)?.results || []).map((r: any) => {
                    const marks = resultsData[r.studentId] ?? (r.marksObtained !== undefined ? String(r.marksObtained) : '');
                    const pct = marks ? (parseFloat(marks) / selectedExam.maxMarks) * 100 : 0;
                    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : marks ? 'F' : '—';
                    const gradeColor = grade === 'A+' || grade === 'A' ? 'text-green-600' : grade === 'B' ? 'text-blue-600' : grade === 'C' ? 'text-yellow-600' : grade === 'F' ? 'text-red-600' : 'text-gray-400';
                    return (
                      <tr key={r.studentId} className="border-t border-gray-50">
                        <td className="px-3 py-2 text-sm font-medium">{r.student?.user?.profile?.firstName} {r.student?.user?.profile?.lastName}</td>
                        <td className="px-3 py-2 text-sm text-gray-500 font-mono">{r.student?.rollNumber}</td>
                        <td className="px-3 py-2">
                          {selectedExam.isPublished ? (
                            <span className="font-bold text-sm">{r.marksObtained}</span>
                          ) : (
                            <input
                              type="number" min="0" max={selectedExam.maxMarks}
                              value={marks}
                              onChange={e => setResultsData(prev => ({ ...prev, [r.studentId]: e.target.value }))}
                              placeholder="0"
                              className="w-20 px-2 py-1 border border-gray-200 rounded text-sm font-mono outline-none focus:border-blue-400"
                            />
                          )}
                        </td>
                        <td className={`px-3 py-2 font-bold text-sm ${gradeColor}`}>{grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!selectedExam.isPublished && (
              <div className="mt-5 flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleSubmitResults}
                  disabled={enterResults.isPending || Object.keys(resultsData).length === 0}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-40"
                >
                  {enterResults.isPending ? 'Publishing...' : `🚀 Publish Results & Notify`}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
