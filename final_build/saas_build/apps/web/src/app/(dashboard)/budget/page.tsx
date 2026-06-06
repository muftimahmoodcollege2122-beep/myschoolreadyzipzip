'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';
import { DataTable } from '../../../components/shared/data-table';

const CATS = ['SALARY','UTILITIES','MAINTENANCE','SUPPLIES','TRANSPORT','EVENTS','MARKETING','OTHER'];
const PERIOD = Array.from({length:12},(_,i)=>`${new Date().getFullYear()}-${String(i+1).padStart(2,'0')}`);

export default function BudgetPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'dashboard'|'expenses'|'cashbook'|'budget'>('dashboard');
  const [expModal, setExpModal] = useState(false);
  const [cashModal, setCashModal] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const month = new Date().toISOString().slice(0,7);
  const year = new Date().getFullYear().toString();
  const [expForm, setExpForm] = useState({ category:'SALARY', description:'', amount:'', vendor:'', expenseDate:new Date().toISOString().split('T')[0] });
  const [cashForm, setCashForm] = useState({ type:'INCOME', category:'FEE', description:'', amount:'', entryDate:new Date().toISOString().split('T')[0] });
  const [budgetForm, setBudgetForm] = useState({ category:'SALARY', period:month, allocated:'' });

  const { data: dashboard } = useQuery({ queryKey:['fin-dashboard'], queryFn:()=>apiClient.get('/finance/dashboard') });
  const { data: expenses, isLoading:el } = useQuery({ queryKey:['expenses',month], queryFn:()=>apiClient.get(`/finance/expenses?from=${month}-01&to=${month}-31`), enabled:tab==='expenses' });
  const { data: cashbook } = useQuery({ queryKey:['cashbook',month], queryFn:()=>apiClient.get(`/finance/cashbook?from=${month}-01&to=${month}-31`), enabled:tab==='cashbook' });
  const { data: budgets } = useQuery({ queryKey:['budgets',month], queryFn:()=>apiClient.get(`/finance/budgets?period=${month}`), enabled:tab==='budget' });
  const { data: incomeVsExpense } = useQuery({ queryKey:['income-vs-expense',year], queryFn:()=>apiClient.get(`/finance/income-vs-expense?year=${year}`), enabled:tab==='dashboard' });

  const createExp = useMutation({ mutationFn:(d:any)=>apiClient.post('/finance/expenses',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['expenses']});setExpModal(false);} });
  const approveExp = useMutation({ mutationFn:(id:string)=>apiClient.put(`/finance/expenses/${id}/approve`,{}), onSuccess:()=>qc.invalidateQueries({queryKey:['expenses']}) });
  const createCash = useMutation({ mutationFn:(d:any)=>apiClient.post('/finance/cashbook',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['cashbook']});setCashModal(false);} });
  const setBudget = useMutation({ mutationFn:(d:any)=>apiClient.post('/finance/budgets',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['budgets']});setBudgetModal(false);} });

  const db = dashboard as any;
  const expList: any[] = Array.isArray(expenses) ? expenses : [];
  const cash: any = cashbook || {};
  const budgetList: any[] = Array.isArray(budgets) ? budgets : [];
  const iVe: any[] = Array.isArray(incomeVsExpense) ? incomeVsExpense : [];
  const maxBar = Math.max(1,...iVe.map((m:any)=>Math.max(m.income,m.expense)));

  const expCols = [
    { key:'desc', header:'Expense', render:(e:any)=><div><p className="font-semibold text-sm">{e.description}</p><p className="text-xs text-gray-400">{e.vendor||e.category}</p></div> },
    { key:'amount', header:'Amount', render:(e:any)=><span className="font-bold text-sm">Rs. {Number(e.amount).toLocaleString()}</span> },
    { key:'date', header:'Date', render:(e:any)=><span className="text-xs text-gray-500">{new Date(e.expenseDate).toLocaleDateString()}</span> },
    { key:'status', header:'Status', render:(e:any)=><Badge variant={e.status==='APPROVED'?'green':e.status==='REJECTED'?'red':'yellow'}>{e.status}</Badge> },
    { key:'act', header:'', render:(e:any)=>e.status==='PENDING'&&<button onClick={()=>approveExp.mutate(e.id)} className="px-3 py-1 text-xs font-bold text-green-700 bg-green-50 rounded-lg">Approve</button> },
  ];

  const totalBudgeted = budgetList.reduce((s:number,b:any)=>s+Number(b.allocated),0);
  const totalSpent = budgetList.reduce((s:number,b:any)=>s+Number(b.spent),0);

  return (
    <>
      <Topbar title="Finance & Budget" subtitle="Track expenses, cashbook, and budgets"/>
      <div className="p-6">
        <PageHeader title="Financial Management" subtitle={`${month}`}
          action={<div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">{(['dashboard','expenses','cashbook','budget'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize ${tab===t?'bg-white shadow':''}`}>{t}</button>)}</div>
            {tab==='expenses'&&<button onClick={()=>setExpModal(true)} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg">+ Add Expense</button>}
            {tab==='cashbook'&&<button onClick={()=>setCashModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">+ Add Entry</button>}
            {tab==='budget'&&<button onClick={()=>setBudgetModal(true)} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg">+ Set Budget</button>}
          </div>}/>

        {tab==='dashboard'&&(
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label:'Fee Collected', value:`Rs. ${Number(db?.fees?.collected??0).toLocaleString()}`, color:'bg-green-50 text-green-700' },
                { label:'Outstanding', value:`Rs. ${Number(db?.fees?.outstanding??0).toLocaleString()}`, color:'bg-red-50 text-red-700' },
                { label:'Month Expenses', value:`Rs. ${Number(db?.expenses?.total??0).toLocaleString()}`, color:'bg-orange-50 text-orange-700' },
                { label:'Cash Balance', value:`Rs. ${Number((db?.cashbook?.income??0)-(db?.cashbook?.expense??0)).toLocaleString()}`, color:'bg-blue-50 text-blue-700' },
              ].map(s=>(
                <div key={s.label} className={`${s.color.split(' ')[0]} rounded-xl p-4 border border-white`}>
                  <p className={`text-2xl font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Income vs Expenses — {year}</h3>
              <div className="space-y-2">
                {iVe.slice(0,6).map((m:any)=>(
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-16 font-medium">{m.month.slice(5)}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2"><div className="h-2 bg-green-100 rounded-full flex-1"><div className="h-2 bg-green-500 rounded-full" style={{width:`${(m.income/maxBar)*100}%`}}/></div><span className="text-xs text-green-700 font-bold w-20 text-right">{Number(m.income).toLocaleString()}</span></div>
                      <div className="flex items-center gap-2"><div className="h-2 bg-red-100 rounded-full flex-1"><div className="h-2 bg-red-500 rounded-full" style={{width:`${(m.expense/maxBar)*100}%`}}/></div><span className="text-xs text-red-700 font-bold w-20 text-right">{Number(m.expense).toLocaleString()}</span></div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-2 border-t border-gray-50"><div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-green-500 rounded-full"/><span className="text-xs text-gray-500">Income</span></div><div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-red-500 rounded-full"/><span className="text-xs text-gray-500">Expense</span></div></div>
              </div>
            </div>
          </div>
        )}

        {tab==='expenses'&&<div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={expCols} data={expList} isLoading={el} emptyMessage="No expenses recorded this month"/></div>}

        {tab==='cashbook'&&(
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[{label:'Income',value:cash.income??0,color:'text-green-700'},{label:'Expense',value:cash.expense??0,color:'text-red-700'},{label:'Balance',value:(cash.income??0)-(cash.expense??0),color:'text-blue-700'}].map(s=>(
                <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center"><p className={`text-xl font-black ${s.color}`}>Rs. {Number(s.value).toLocaleString()}</p><p className="text-xs text-gray-400 mt-0.5">{s.label}</p></div>
              ))}
            </div>
            <div className="divide-y divide-gray-50">{(cash.entries||[]).map((e:any)=>(
              <div key={e.id} className="flex items-center justify-between py-3">
                <div><p className="font-semibold text-sm">{e.description}</p><p className="text-xs text-gray-400">{e.category} · {new Date(e.entryDate).toLocaleDateString()}</p></div>
                <span className={`font-black text-sm ${e.type==='INCOME'?'text-green-600':'text-red-600'}`}>{e.type==='INCOME'?'+':'-'}Rs. {Number(e.amount).toLocaleString()}</span>
              </div>
            ))}</div>
            {!cash.entries?.length&&<p className="text-center text-gray-300 py-8">No entries for this month</p>}
          </div>
        )}

        {tab==='budget'&&(
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[{label:'Total Budgeted',value:totalBudgeted,color:'text-purple-700'},{label:'Total Spent',value:totalSpent,color:'text-red-600'},{label:'Remaining',value:totalBudgeted-totalSpent,color:'text-green-700'}].map(s=>(
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4"><p className={`text-2xl font-black ${s.color}`}>Rs. {Number(s.value).toLocaleString()}</p><p className="text-xs text-gray-400 mt-0.5">{s.label}</p></div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              {budgetList.length===0?<p className="text-center text-gray-300 py-8">No budgets set for this month</p>:budgetList.map((b:any)=>{const pct=Number(b.allocated)>0?(Number(b.spent)/Number(b.allocated))*100:0;return(
                <div key={b.id} className="mb-4">
                  <div className="flex justify-between items-center mb-1"><span className="text-sm font-bold text-gray-900">{b.category}</span><span className="text-sm text-gray-500">Rs. {Number(b.spent).toLocaleString()} / Rs. {Number(b.allocated).toLocaleString()}</span></div>
                  <div className="h-2.5 bg-gray-100 rounded-full"><div className={`h-2.5 rounded-full transition-all ${pct>=90?'bg-red-500':pct>=70?'bg-yellow-500':'bg-green-500'}`} style={{width:`${Math.min(100,pct)}%`}}/></div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{Math.round(pct)}% utilized</p>
                </div>
              );})}
            </div>
          </div>
        )}

        <Modal isOpen={expModal} onClose={()=>setExpModal(false)} title="Add Expense">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label><select value={expForm.category} onChange={e=>setExpForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><input value={expForm.description} onChange={e=>setExpForm(f=>({...f,description:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (Rs.)</label><input type="number" value={expForm.amount} onChange={e=>setExpForm(f=>({...f,amount:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label><input type="date" value={expForm.expenseDate} onChange={e=>setExpForm(f=>({...f,expenseDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Vendor (optional)</label><input value={expForm.vendor} onChange={e=>setExpForm(f=>({...f,vendor:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>createExp.mutate(expForm)} disabled={!expForm.description||!expForm.amount||createExp.isPending} className="w-full py-2.5 bg-red-600 text-white font-bold rounded-lg disabled:opacity-50">{createExp.isPending?'Adding...':'Add Expense'}</button>
          </div>
        </Modal>
        <Modal isOpen={cashModal} onClose={()=>setCashModal(false)} title="Add Cashbook Entry">
          <div className="space-y-3">
            <div className="flex gap-2">{['INCOME','EXPENSE'].map(t=><button key={t} onClick={()=>setCashForm(f=>({...f,type:t}))} className={`flex-1 py-2 text-sm font-bold rounded-lg border ${cashForm.type===t?(t==='INCOME'?'bg-green-600 text-white border-green-600':'bg-red-600 text-white border-red-600'):'border-gray-200'}`}>{t}</button>)}</div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><input value={cashForm.description} onChange={e=>setCashForm(f=>({...f,description:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount</label><input type="number" value={cashForm.amount} onChange={e=>setCashForm(f=>({...f,amount:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Date</label><input type="date" value={cashForm.entryDate} onChange={e=>setCashForm(f=>({...f,entryDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            </div>
            <button onClick={()=>createCash.mutate(cashForm)} disabled={!cashForm.description||!cashForm.amount||createCash.isPending} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50">{createCash.isPending?'Adding...':'Add Entry'}</button>
          </div>
        </Modal>
        <Modal isOpen={budgetModal} onClose={()=>setBudgetModal(false)} title="Set Monthly Budget">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label><select value={budgetForm.category} onChange={e=>setBudgetForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Period (YYYY-MM)</label><select value={budgetForm.period} onChange={e=>setBudgetForm(f=>({...f,period:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{PERIOD.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Allocated Amount (Rs.)</label><input type="number" value={budgetForm.allocated} onChange={e=>setBudgetForm(f=>({...f,allocated:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>setBudget.mutate(budgetForm)} disabled={!budgetForm.allocated||setBudget.isPending} className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50">{setBudget.isPending?'Setting...':'Set Budget'}</button>
          </div>
        </Modal>
      </div>
    </>
  );
}
