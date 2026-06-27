'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useQuestionBanks, useQuestions, useCreateQuestionBank, useCreateQuestion, useSubjects } from '@/hooks/use-api';

const DIFFICULTY_COLOR: Record<string, string> = { EASY: 'green', MEDIUM: 'yellow', HARD: 'red' };
const TYPE_ICON: Record<string, string> = { MCQ: '🔘', SHORT: '✏️', LONG: '📝', TRUE_FALSE: '✅' };

export default function QuestionBankPage() {
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [bankModal, setBankModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [bankForm, setBankForm] = useState({ name: '', subjectId: '', description: '' });
  const [qForm, setQForm] = useState({ question: '', type: 'MCQ', difficulty: 'MEDIUM', options: ['','','',''], correctAnswer: '', marks: '1', explanation: '' });

  const { data: banks = [], isLoading: banksLoading } = useQuestionBanks();
  const { data: questions = [], isLoading: questionsLoading } = useQuestions({ bankId: selectedBank?.id });
  const { data: subjects = [] } = useSubjects();
  const createBank = useCreateQuestionBank();
  const createQuestion = useCreateQuestion();

  const bankList: any[] = Array.isArray(banks) ? banks : [];
  const questionList: any[] = Array.isArray(questions) ? questions : [];

  const handleCreateBank = async () => {
    if (!bankForm.name) return;
    await createBank.mutateAsync(bankForm);
    setBankForm({ name: '', subjectId: '', description: '' }); setBankModal(false);
  };

  const handleCreateQuestion = async () => {
    if (!qForm.question || !selectedBank) return;
    await createQuestion.mutateAsync({ ...qForm, bankId: selectedBank.id, marks: Number(qForm.marks), options: qForm.type === 'MCQ' || qForm.type === 'TRUE_FALSE' ? qForm.options.filter(Boolean) : [] });
    setQForm({ question: '', type: 'MCQ', difficulty: 'MEDIUM', options: ['','','',''], correctAnswer: '', marks: '1', explanation: '' });
    setQuestionModal(false);
  };

  return (
    <>
      <Topbar title="Question Bank" subtitle="Exam question repository" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Banks sidebar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Question Banks</h2>
              <button onClick={() => setBankModal(true)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg">+ New Bank</button>
            </div>
            {banksLoading ? <div className="text-center py-8 text-gray-400">Loading...</div>
              : bankList.length === 0 ? (
                <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">🗂️</p><p className="text-sm">No question banks yet</p></div>
              ) : bankList.map((bank: any) => (
                <div key={bank.id} onClick={() => setSelectedBank(bank)}
                  className={`p-4 rounded-xl border cursor-pointer mb-2 transition-all ${selectedBank?.id === bank.id ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <p className="font-bold text-sm text-gray-800">{bank.name}</p>
                  {bank.subject?.name && <p className="text-xs text-gray-400 mt-0.5">{bank.subject.name}</p>}
                  <p className="text-xs text-gray-400 mt-1">{bank.questionCount ?? 0} questions</p>
                </div>
              ))}
          </div>

          {/* Questions area */}
          <div className="md:col-span-2">
            {!selectedBank ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-2">📚</p>
                <p className="font-medium">Select a question bank to view questions</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedBank.name}</h2>
                    <p className="text-xs text-gray-400">{questionList.length} questions</p>
                  </div>
                  <button onClick={() => setQuestionModal(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">+ Add Question</button>
                </div>
                {questionsLoading ? <div className="text-center py-8 text-gray-400">Loading questions...</div>
                  : questionList.length === 0 ? (
                    <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">❓</p><p className="font-medium">No questions in this bank yet</p></div>
                  ) : (
                    <div className="space-y-3">
                      {questionList.map((q: any, i: number) => (
                        <div key={q.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 text-xs font-mono mt-0.5">Q{i+1}</span>
                              <p className="text-sm font-medium text-gray-800">{q.question}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <Badge variant={DIFFICULTY_COLOR[q.difficulty] as any}>{q.difficulty}</Badge>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{TYPE_ICON[q.type]} {q.type}</span>
                            </div>
                          </div>
                          {q.options?.length > 0 && (
                            <div className="ml-6 grid grid-cols-2 gap-1 mt-2">
                              {q.options.map((opt: string, oi: number) => (
                                <div key={oi} className={`text-xs px-2 py-1 rounded ${opt === q.correctAnswer ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-500'}`}>
                                  {String.fromCharCode(65+oi)}. {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.correctAnswer && q.type !== 'MCQ' && (
                            <p className="ml-6 mt-1 text-xs text-green-600">✓ {q.correctAnswer}</p>
                          )}
                          <p className="ml-6 mt-1 text-xs text-gray-400">{q.marks} mark{q.marks !== 1 ? 's' : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={bankModal} onClose={() => setBankModal(false)} title="Create Question Bank">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Bank Name *</label>
            <input value={bankForm.name} onChange={e => setBankForm({ ...bankForm, name: e.target.value })} placeholder="e.g. Physics Mid-Term 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Subject</label>
            <select value={bankForm.subjectId} onChange={e => setBankForm({ ...bankForm, subjectId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Select Subject</option>
              {(Array.isArray(subjects) ? subjects : []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={2} value={bankForm.description} onChange={e => setBankForm({ ...bankForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreateBank} disabled={createBank.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createBank.isPending ? 'Creating...' : 'Create Bank'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={questionModal} onClose={() => setQuestionModal(false)} title="Add Question">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Question *</label>
            <textarea rows={3} value={qForm.question} onChange={e => setQForm({ ...qForm, question: e.target.value })} placeholder="Enter the question..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={qForm.type} onChange={e => setQForm({ ...qForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['MCQ','SHORT','LONG','TRUE_FALSE'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
              <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['EASY','MEDIUM','HARD'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Marks</label>
              <input type="number" min="1" value={qForm.marks} onChange={e => setQForm({ ...qForm, marks: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          {(qForm.type === 'MCQ') && (
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Options</label>
              {qForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 w-4">{String.fromCharCode(65+i)}.</span>
                  <input value={opt} onChange={e => { const o=[...qForm.options]; o[i]=e.target.value; setQForm({...qForm,options:o}); }} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" placeholder={`Option ${String.fromCharCode(65+i)}`} />
                </div>
              ))}
            </div>
          )}
          <div><label className="text-xs text-gray-500 mb-1 block">Correct Answer</label>
            {qForm.type === 'MCQ' ? (
              <select value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select correct option</option>
                {qForm.options.filter(Boolean).map((opt, i) => <option key={i} value={opt}>{String.fromCharCode(65+i)}. {opt}</option>)}
              </select>
            ) : qForm.type === 'TRUE_FALSE' ? (
              <select value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select</option><option value="True">True</option><option value="False">False</option>
              </select>
            ) : (
              <input value={qForm.correctAnswer} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value })} placeholder="Model answer..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            )}
          </div>
          <button onClick={handleCreateQuestion} disabled={createQuestion.isPending} className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createQuestion.isPending ? 'Adding...' : 'Add Question'}
          </button>
        </div>
      </Modal>
    </>
  );
}
