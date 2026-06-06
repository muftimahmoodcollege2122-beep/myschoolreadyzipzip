'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';
import { DataTable } from '../../../components/shared/data-table';

const TYPES = ['MCQ','SHORT_ANSWER','LONG_ANSWER','TRUE_FALSE','FILL_BLANK'];
const DIFFS = ['EASY','MEDIUM','HARD','VERY_HARD'];
const DC: Record<string,any> = { EASY:'green', MEDIUM:'yellow', HARD:'orange', VERY_HARD:'red' };

export default function QuestionBankPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'banks'|'questions'>('banks');
  const [bankModal, setBankModal] = useState(false);
  const [qModal, setQModal] = useState(false);
  const [paperModal, setPaperModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [qFilter, setQFilter] = useState({ type: '', difficulty: '' });
  const [bankForm, setBankForm] = useState({ name: '', description: '' });
  const [qForm, setQForm] = useState({ questionBankId: '', type: 'MCQ', text: '', marks: 1, difficulty: 'MEDIUM', correctAnswer: '', explanation: '', options: [{label:'A',text:'',isCorrect:false},{label:'B',text:'',isCorrect:false},{label:'C',text:'',isCorrect:false},{label:'D',text:'',isCorrect:false}] });
  const [paperForm, setPaperForm] = useState({ bankId: '', totalMarks: 100, questionCount: 20, difficulty: '' });
  const [paperResult, setPaperResult] = useState<any>(null);

  const { data: banks, isLoading: bl } = useQuery({ queryKey: ['qbanks'], queryFn: () => apiClient.get('/question-bank/banks') });
  const { data: questions, isLoading: ql } = useQuery({ queryKey: ['questions', selectedBank?.id, qFilter], queryFn: () => apiClient.get(`/question-bank/questions?bankId=${selectedBank?.id??''}&type=${qFilter.type}&difficulty=${qFilter.difficulty}`), enabled: tab === 'questions' });
  const createBank = useMutation({ mutationFn: (d: any) => apiClient.post('/question-bank/banks', d), onSuccess: () => { qc.invalidateQueries({queryKey:['qbanks']}); setBankModal(false); setBankForm({name:'',description:''}); } });
  const createQ = useMutation({ mutationFn: (d: any) => apiClient.post('/question-bank/questions', d), onSuccess: () => { qc.invalidateQueries({queryKey:['questions']}); setQModal(false); } });
  const deleteQ = useMutation({ mutationFn: (id: string) => apiClient.delete(`/question-bank/questions/${id}`), onSuccess: () => qc.invalidateQueries({queryKey:['questions']}) });
  const genPaper = useMutation({ mutationFn: (d: any) => apiClient.post('/question-bank/generate-paper', d) });

  const bankList: any[] = Array.isArray(banks) ? banks : [];
  const qList: any[] = Array.isArray(questions) ? questions : [];

  const bankCols = [
    { key:'name', header:'Bank', render:(b:any)=><div><p className="font-bold text-sm">{b.name}</p>{b.description&&<p className="text-xs text-gray-400">{b.description}</p>}</div> },
    { key:'count', header:'Questions', render:(b:any)=><span className="font-black text-blue-700">{b._count?.questions??0}</span> },
    { key:'act', header:'', render:(b:any)=>(
      <div className="flex gap-2">
        <button onClick={()=>{setSelectedBank(b);setTab('questions');setPaperForm(f=>({...f,bankId:b.id}));}} className="px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 rounded-lg">View Qs</button>
        <button onClick={()=>{setPaperForm(f=>({...f,bankId:b.id}));setPaperModal(true);}} className="px-3 py-1 text-xs font-bold text-green-700 bg-green-50 rounded-lg">📝 Gen Paper</button>
      </div>
    )},
  ];
  const qCols = [
    { key:'type', header:'Type', render:(q:any)=><span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">{q.type}</span> },
    { key:'text', header:'Question', render:(q:any)=><p className="text-sm max-w-xs truncate">{q.text}</p> },
    { key:'marks', header:'Marks', render:(q:any)=><span className="font-bold">{q.marks}</span> },
    { key:'diff', header:'Level', render:(q:any)=><Badge variant={DC[q.difficulty]}>{q.difficulty}</Badge> },
    { key:'del', header:'', render:(q:any)=><button onClick={()=>deleteQ.mutate(q.id)} className="text-xs text-red-500 hover:underline">Del</button> },
  ];

  return (
    <>
      <Topbar title="Question Bank" subtitle="Manage questions and generate exam papers"/>
      <div className="p-6">
        <PageHeader title="Question Bank" subtitle={`${bankList.length} banks`}
          action={<div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">{(['banks','questions'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize ${tab===t?'bg-white shadow':''}`}>{t}</button>)}</div>
            {tab==='banks'?<button onClick={()=>setBankModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">+ New Bank</button>:<button onClick={()=>setQModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg">+ Add Question</button>}
          </div>}/>

        {tab==='banks'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={bankCols} data={bankList} isLoading={bl} emptyMessage="No banks yet. Create your first question bank!"/></div>}

        {tab==='questions'&&(<>
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            {selectedBank&&<div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg">📚 {selectedBank.name}</div>}
            <select value={qFilter.type} onChange={e=>setQFilter(f=>({...f,type:e.target.value}))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option value="">All Types</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
            <select value={qFilter.difficulty} onChange={e=>setQFilter(f=>({...f,difficulty:e.target.value}))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option value="">All Levels</option>{DIFFS.map(d=><option key={d}>{d}</option>)}</select>
            <span className="ml-auto text-sm font-medium text-gray-500">{qList.length} questions · {qList.reduce((s:number,q:any)=>s+Number(q.marks),0)} marks</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={qCols} data={qList} isLoading={ql} emptyMessage="No questions found."/></div>
        </>)}

        <Modal isOpen={bankModal} onClose={()=>setBankModal(false)} title="Create Question Bank">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Name</label><input value={bankForm.name} onChange={e=>setBankForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Mathematics Grade 9" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><textarea value={bankForm.description} onChange={e=>setBankForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="flex gap-3"><button onClick={()=>setBankModal(false)} className="flex-1 py-2 text-sm border rounded-lg">Cancel</button><button onClick={()=>createBank.mutate(bankForm)} disabled={!bankForm.name||createBank.isPending} className="flex-1 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50">{createBank.isPending?'Creating...':'Create Bank'}</button></div>
          </div>
        </Modal>

        <Modal isOpen={qModal} onClose={()=>setQModal(false)} title="Add Question" size="lg">
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bank</label><select value={qForm.questionBankId} onChange={e=>setQForm(f=>({...f,questionBankId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Select bank</option>{bankList.map((b:any)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label><select value={qForm.type} onChange={e=>setQForm(f=>({...f,type:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Question</label><textarea value={qForm.text} onChange={e=>setQForm(f=>({...f,text:e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Marks</label><input type="number" value={qForm.marks} onChange={e=>setQForm(f=>({...f,marks:+e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Difficulty</label><select value={qForm.difficulty} onChange={e=>setQForm(f=>({...f,difficulty:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{DIFFS.map(d=><option key={d}>{d}</option>)}</select></div>
            </div>
            {qForm.type==='MCQ'&&<div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Options (click ✓ for correct answer)</label>{qForm.options.map((o,i)=><div key={i} className="flex items-center gap-2 mb-1"><span className="text-xs font-bold w-4">{o.label}.</span><input value={o.text} onChange={e=>{const opts=[...qForm.options];opts[i]={...opts[i],text:e.target.value};setQForm(f=>({...f,options:opts}));}} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm"/><button onClick={()=>setQForm(f=>({...f,correctAnswer:o.label,options:f.options.map((op,j)=>({...op,isCorrect:i===j}))}))} className={`px-2 py-1 text-xs font-bold rounded ${qForm.correctAnswer===o.label?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>✓</button></div>)}</div>}
            {qForm.type!=='MCQ'&&<div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Answer/Key Points</label><textarea value={qForm.correctAnswer} onChange={e=>setQForm(f=>({...f,correctAnswer:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>}
            <div className="flex gap-3 sticky bottom-0 bg-white pt-2"><button onClick={()=>setQModal(false)} className="flex-1 py-2 text-sm border rounded-lg">Cancel</button><button onClick={()=>createQ.mutate(qForm)} disabled={!qForm.text||!qForm.questionBankId||createQ.isPending} className="flex-1 py-2 text-sm bg-green-600 text-white font-bold rounded-lg disabled:opacity-50">{createQ.isPending?'Adding...':'Add Question'}</button></div>
          </div>
        </Modal>

        <Modal isOpen={paperModal} onClose={()=>{setPaperModal(false);setPaperResult(null);}} title="Generate Exam Paper" size="lg">
          {!paperResult?(<div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Questions</label><input type="number" value={paperForm.questionCount} onChange={e=>setPaperForm(f=>({...f,questionCount:+e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Difficulty</label><select value={paperForm.difficulty} onChange={e=>setPaperForm(f=>({...f,difficulty:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="">Mixed</option>{DIFFS.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            </div>
            <button onClick={async()=>{const r=await genPaper.mutateAsync(paperForm);setPaperResult(r);}} disabled={!paperForm.bankId||genPaper.isPending} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50">{genPaper.isPending?'🤖 Generating...':'🎲 Generate Paper'}</button>
          </div>):(<div>
            <div className="flex justify-between mb-3"><div><p className="font-bold">{paperResult.questionCount} Questions · {paperResult.totalMarks} Marks</p><p className="text-xs text-gray-400">Generated {new Date().toLocaleTimeString()}</p></div><button onClick={()=>setPaperResult(null)} className="text-xs text-blue-600 underline">← Redo</button></div>
            <div className="space-y-2 max-h-96 overflow-y-auto">{paperResult.questions?.map((q:any,i:number)=>(
              <div key={q.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-400">Q{i+1} · {q.type} · {q.marks}m</span><Badge variant={DC[q.difficulty]}>{q.difficulty}</Badge></div>
                <p className="text-sm">{q.text}</p>
                {q.type==='MCQ'&&q.options&&<div className="mt-1 grid grid-cols-2 gap-1">{(q.options as any[]).map((o:any)=><p key={o.label} className={`text-xs px-2 py-0.5 rounded ${o.isCorrect?'bg-green-100 text-green-700 font-bold':'text-gray-500'}`}>{o.label}. {o.text}</p>)}</div>}
              </div>
            ))}</div>
          </div>)}
        </Modal>
      </div>
    </>
  );
}
