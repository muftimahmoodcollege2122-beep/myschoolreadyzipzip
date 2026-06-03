'use client';
import React, { useState } from 'react';
import { useOutstandingFees, useRecordPayment, useCreateInvoice, useFeeRevenue, useStudents } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { Topbar } from '../../../components/layout/topbar';

const SV: Record<string,string> = { PAID:'green', PENDING:'yellow', OVERDUE:'red', PARTIAL:'blue', CANCELLED:'gray' };

export default function FeesPage() {
  const [payModal, setPayModal] = useState<any>(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [tab, setTab] = useState<'outstanding'|'revenue'>('outstanding');
  const [invForm, setInvForm] = useState({ studentId: '', description: '', amount: '', dueDate: '', category: 'TUITION' });

  const { data: invoices, isLoading } = useOutstandingFees('');
  const { data: revenue } = useFeeRevenue();
  const { data: studentsData } = useStudents({ limit: 100 });
  const pay = useRecordPayment();
  const createInvoice = useCreateInvoice();

  const inv: any[] = Array.isArray(invoices) ? invoices : [];
  const rev = revenue as any;
  const students: any[] = (studentsData as any)?.data ?? [];

  const totalOutstanding = inv.reduce((s: number, i: any) => s + (i.amount - (i.paidAmount ?? 0)), 0);
  const pendingCount = inv.filter((i: any) => i.status === 'PENDING').length;
  const overdueCount = inv.filter((i: any) => i.status === 'OVERDUE').length;
  const partialCount = inv.filter((i: any) => i.status === 'PARTIAL').length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    await pay.mutateAsync({ invoiceId: payModal.id, amount: parseFloat(amount), paymentMethod: method });
    setPayModal(null);
    setAmount('');
  };

  const submitInvoice = async () => {
    await createInvoice.mutateAsync({ ...invForm, amount: parseFloat(invForm.amount) });
    setInvForm({ studentId: '', description: '', amount: '', dueDate: '', category: 'TUITION' });
    setInvoiceModal(false);
  };

  const columns = [
    { key: 'inv', header: 'Invoice', render: (i: any) => (
      <div><p className="font-mono text-xs font-bold text-gray-700">{i.invoiceNumber}</p><p className="text-xs text-gray-400">{i.description}</p></div>
    )},
    { key: 'student', header: 'Student', render: (i: any) => (
      <span className="text-sm font-medium">{i.student?.user?.profile?.firstName ?? '—'} {i.student?.user?.profile?.lastName ?? ''}</span>
    )},
    { key: 'amount', header: 'Amount', render: (i: any) => (
      <div>
        <p className="font-bold text-sm">Rs. {Number(i.amount).toLocaleString()}</p>
        {i.paidAmount > 0 && <p className="text-xs text-green-600">Paid: Rs. {Number(i.paidAmount).toLocaleString()}</p>}
      </div>
    )},
    { key: 'due', header: 'Due Date', render: (i: any) => (
      <span className={`text-xs font-medium ${new Date(i.dueDate) < new Date() && i.status !== 'PAID' ? 'text-red-500' : 'text-gray-500'}`}>
        {new Date(i.dueDate).toLocaleDateString('en-PK')}
      </span>
    )},
    { key: 'status', header: 'Status', render: (i: any) => <Badge variant={SV[i.status] as any}>{i.status}</Badge> },
    { key: 'action', header: '', render: (i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED' ? (
      <button onClick={() => { setPayModal(i); setAmount(String(i.amount - (i.paidAmount ?? 0))); }}
        className="px-3 py-1.5 text-xs bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">
        Record Payment
      </button>
    ) : null },
  ];

  return (
    <>
      <Topbar title="Fees" subtitle="Track collections and outstanding payments" />
      <div className="p-6">
        <PageHeader
          title="Fee Management"
          action={
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['outstanding','revenue'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${tab===t?'bg-white shadow text-gray-900':'text-gray-500'}`}>
                    {t === 'outstanding' ? '💳 Outstanding' : '📊 Revenue'}
                  </button>
                ))}
              </div>
              <button onClick={() => setInvoiceModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Create Invoice</button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs font-bold text-green-600 uppercase">Collected</p>
            <p className="text-2xl font-black text-green-700 mt-1">Rs. {Number(rev?.collected ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-xs font-bold text-red-500 uppercase">Outstanding</p>
            <p className="text-2xl font-black text-red-600 mt-1">Rs. {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <p className="text-xs font-bold text-yellow-500 uppercase">Pending Invoices</p>
            <p className="text-2xl font-black text-yellow-600 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <p className="text-xs font-bold text-orange-500 uppercase">Overdue</p>
            <p className="text-2xl font-black text-orange-600 mt-1">{overdueCount}</p>
          </div>
        </div>

        {tab === 'outstanding' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <DataTable columns={columns} data={inv} isLoading={isLoading} emptyMessage="No outstanding fees 🎉" />
          </div>
        )}

        {tab === 'revenue' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Revenue Overview</h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Total Collected', value: `Rs. ${Number(rev?.collected??0).toLocaleString()}`, color: 'text-green-700' },
                { label: 'Total Outstanding', value: `Rs. ${Number(rev?.outstanding??0).toLocaleString()}`, color: 'text-red-600' },
                { label: 'Collection Rate', value: `${rev?.collectionRate ?? 0}%`, color: 'text-blue-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { label: 'Total Invoices', value: rev?.totalInvoices ?? inv.length },
                { label: 'Fully Paid', value: rev?.paid ?? inv.filter((i:any)=>i.status==='PAID').length },
                { label: 'Partial Payment', value: rev?.partial ?? partialCount },
                { label: 'Pending', value: rev?.pending ?? pendingCount },
                { label: 'Overdue', value: rev?.overdue ?? overdueCount },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">{r.label}</span>
                  <span className="font-bold text-gray-900">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Modal */}
        <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Payment">
          {payModal && (
            <form onSubmit={submit} className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-sm text-gray-900">{payModal.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">Invoice #{payModal.invoiceNumber}</p>
                <p className="text-xs text-gray-500 mt-1">Total: Rs. {Number(payModal.amount).toLocaleString()} · Paid: Rs. {Number(payModal.paidAmount??0).toLocaleString()}</p>
              </div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (Rs.)</label>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Payment Method</label>
                <select value={method} onChange={e=>setMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="CASH">Cash</option>
                  <option value="JAZZCASH">JazzCash</option>
                  <option value="EASYPAISA">EasyPaisa</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="STRIPE">Card / Stripe</option>
                </select></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setPayModal(null)} className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={pay.isPending} className="flex-1 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">{pay.isPending ? 'Processing...' : 'Confirm Payment'}</button>
              </div>
            </form>
          )}
        </Modal>

        {/* Create Invoice Modal */}
        <Modal isOpen={invoiceModal} onClose={() => setInvoiceModal(false)} title="Create Invoice">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student</label>
              <select value={invForm.studentId} onChange={e=>setInvForm(f=>({...f,studentId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select student</option>
                {students.map((s:any)=><option key={s.id} value={s.id}>{s.user?.profile?.firstName} {s.user?.profile?.lastName}</option>)}
              </select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
              <input value={invForm.description} onChange={e=>setInvForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Monthly Tuition Fee - June" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (Rs.)</label>
                <input type="number" value={invForm.amount} onChange={e=>setInvForm(f=>({...f,amount:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                <input type="date" value={invForm.dueDate} onChange={e=>setInvForm(f=>({...f,dueDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select value={invForm.category} onChange={e=>setInvForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {['TUITION','ADMISSION','EXAM','TRANSPORT','LIBRARY','SPORTS','HOSTEL','OTHER'].map(c=><option key={c} value={c}>{c}</option>)}
              </select></div>
            <button onClick={submitInvoice} disabled={createInvoice.isPending||!invForm.studentId||!invForm.amount||!invForm.dueDate} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
