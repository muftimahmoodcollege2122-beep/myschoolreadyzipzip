'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useBudgets, useExpenses, useCreateBudget, useCreateExpense } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const CATEGORIES = ['Salaries','Utilities','Maintenance','Equipment','Stationery','Events','Transport','Food','Other'];
const CAT_COLOR: Record<string, string> = { Salaries: 'bg-blue-500', Utilities: 'bg-yellow-500', Maintenance: 'bg-red-500', Equipment: 'bg-purple-500', Stationery: 'bg-green-500', Events: 'bg-pink-500', Transport: 'bg-orange-500', Food: 'bg-teal-500', Other: 'bg-gray-500' };
const EXPENSE_EMPTY = { title: '', category: 'Stationery', amount: '', description: '', date: new Date().toISOString().split('T')[0], vendor: '', status: 'APPROVED' };
const BUDGET_EMPTY = { title: '', category: 'Other', amount: '', fiscalYear: new Date().getFullYear(), description: '' };

export default function BudgetPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'overview' | 'expenses' | 'budgets'>('overview');
  const [expenseModal, setExpenseModal] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState(EXPENSE_EMPTY);
  const [budgetForm, setBudgetForm] = useState(BUDGET_EMPTY);

  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses({ limit: 50 });
  const createBudget = useCreateBudget();
  const createExpense = useCreateExpense();

  const budgetList: any[] = Array.isArray(budgets) ? budgets : [];
  const expenseList: any[] = Array.isArray(expenses) ? expenses : (expenses as any)?.data ?? [];

  const totalBudget = budgetList.reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const totalExpenses = expenseList.reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const balance = totalBudget - totalExpenses;
  const utilization = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

  const expensesByCategory = CATEGORIES.map(cat => ({
    cat,
    total: expenseList.filter(e => e.category === cat).reduce((a, e) => a + (Number(e.amount) || 0), 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  const handleCreateExpense = async () => {
    if (!expenseForm.title || !expenseForm.amount) return;
    try {
    await createExpense.mutateAsync({ ...expenseForm, amount: Number(expenseForm.amount) });
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
    setExpenseForm(EXPENSE_EMPTY); setExpenseModal(false);
  };

  const handleCreateBudget = async () => {
    if (!budgetForm.title || !budgetForm.amount) return;
    try {
    await createBudget.mutateAsync({ ...budgetForm, amount: Number(budgetForm.amount) });
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
    setBudgetForm(BUDGET_EMPTY); setBudgetModal(false);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

  return (
    <>
      <Topbar title="Budget" subtitle="School financial management" />
      <div className="p-6">
        <PageHeader title="Budget & Finance" subtitle="Track budgets, expenses & financial overview"
          action={
            <div className="flex gap-2">
              <button onClick={() => setExpenseModal(true)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">+ Add Expense</button>
              <button onClick={() => setBudgetModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Budget</button>
            </div>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Budget', value: `Rs ${(totalBudget/1000).toFixed(0)}K`, icon: '💼', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Spent', value: `Rs ${(totalExpenses/1000).toFixed(0)}K`, icon: '💸', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Balance', value: `Rs ${(balance/1000).toFixed(0)}K`, icon: balance >= 0 ? '✅' : '⚠️', color: balance >= 0 ? 'text-green-600' : 'text-red-600', bg: balance >= 0 ? 'bg-green-50' : 'bg-red-50' },
            { label: 'Utilization', value: `${utilization}%`, icon: '📊', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['overview','expenses','budgets'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${tab === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-2">Budget Utilization</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-gray-100 h-4 rounded-full">
                  <div className={`h-4 rounded-full transition-all ${utilization > 90 ? 'bg-red-500' : utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, utilization)}%` }} />
                </div>
                <span className={`font-bold text-sm ${utilization > 90 ? 'text-red-600' : utilization > 75 ? 'text-yellow-600' : 'text-green-600'}`}>{utilization}%</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 rounded-lg p-3"><p className="text-gray-400">Budget</p><p className="font-bold text-blue-600">Rs {totalBudget.toLocaleString()}</p></div>
                <div className="bg-red-50 rounded-lg p-3"><p className="text-gray-400">Spent</p><p className="font-bold text-red-600">Rs {totalExpenses.toLocaleString()}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Expenses by Category</h3>
              {expensesByCategory.length === 0 ? (
                <p className="text-center text-gray-400 py-6">No expense data yet</p>
              ) : expensesByCategory.slice(0, 6).map(({ cat, total }) => (
                <div key={cat} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-500 w-20 truncate">{cat}</span>
                  <div className="flex-1 bg-gray-100 h-2.5 rounded-full">
                    <div className={`h-2.5 rounded-full ${CAT_COLOR[cat] || 'bg-gray-400'}`} style={{ width: `${totalExpenses > 0 ? (total/totalExpenses)*100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-20 text-right">Rs {(total/1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'expenses' && (
          expensesLoading ? <div className="text-center py-12 text-gray-400">Loading expenses...</div>
          : expenseList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">💸</p><p className="font-medium">No expenses recorded yet</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {expenseList.map((e: any) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-800">{e.title}</td>
                      <td className="px-4 py-3 text-gray-500">{e.category}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(e.date || e.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-500">{e.vendor || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">Rs {Number(e.amount||0).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={e.status === 'APPROVED' ? 'green' : e.status === 'REJECTED' ? 'red' : 'yellow'}>{e.status || 'PENDING'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'budgets' && (
          budgetsLoading ? <div className="text-center py-12 text-gray-400">Loading budgets...</div>
          : budgetList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">💼</p><p className="font-medium">No budgets allocated yet</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetList.map((b: any) => (
                <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{b.title}</p>
                      <p className="text-xs text-gray-400">{b.category} · FY {b.fiscalYear}</p>
                    </div>
                    <p className="font-bold text-blue-600">Rs {Number(b.amount||0).toLocaleString()}</p>
                  </div>
                  {b.description && <p className="text-xs text-gray-500">{b.description}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal isOpen={expenseModal} onClose={() => setExpenseModal(false)} title="Add Expense">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Title *</label>
            <input value={expenseForm.title} onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })} placeholder="Expense description" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Amount (Rs) *</label>
              <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Date</label>
              <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Vendor</label>
              <input value={expenseForm.vendor} onChange={e => setExpenseForm({ ...expenseForm, vendor: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Vendor name" /></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={2} value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <button onClick={handleCreateExpense} disabled={createExpense.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createExpense.isPending ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={budgetModal} onClose={() => setBudgetModal(false)} title="Add Budget Allocation">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Budget Title *</label>
            <input value={budgetForm.title} onChange={e => setBudgetForm({ ...budgetForm, title: e.target.value })} placeholder="e.g. Annual IT Budget" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={budgetForm.category} onChange={e => setBudgetForm({ ...budgetForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Amount (Rs) *</label>
              <input type="number" value={budgetForm.amount} onChange={e => setBudgetForm({ ...budgetForm, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" /></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Fiscal Year</label>
            <input type="number" value={budgetForm.fiscalYear} onChange={e => setBudgetForm({ ...budgetForm, fiscalYear: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={2} value={budgetForm.description} onChange={e => setBudgetForm({ ...budgetForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <button onClick={handleCreateBudget} disabled={createBudget.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createBudget.isPending ? 'Adding...' : 'Add Budget'}
          </button>
        </div>
      </Modal>
    </>
  );
}
