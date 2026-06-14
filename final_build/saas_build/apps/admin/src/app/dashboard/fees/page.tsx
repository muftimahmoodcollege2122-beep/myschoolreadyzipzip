'use client';
import React, { useState } from 'react';
import { useOutstandingFees, useRecordPayment, useCreateInvoice, useFeeRevenue, useStudents } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { Topbar } from '../../../components/layout/topbar';
import { useToast } from '../../../components/shared/toast';

const SV: Record<string,string> = { PAID:'green', PENDING:'yellow', OVERDUE:'red', PARTIAL:'blue', CANCELLED:'gray' };

function generateFeeSlipHTML(inv: any): string {
  const student = `${inv.student?.user?.profile?.firstName ?? ''} ${inv.student?.user?.profile?.lastName ?? ''}`.trim() || 'N/A';
  const balance = Number(inv.amount) - Number(inv.paidAmount ?? 0);
  return `
    <!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;margin:0;padding:20px;color:#1a1a1a}
      .slip{max-width:580px;margin:0 auto;border:2px solid #16a34a;border-radius:12px;overflow:hidden}
      .header{background:#16a34a;color:white;padding:20px 24px}
      .header h1{margin:0;font-size:22px;font-weight:900}
      .header p{margin:4px 0 0;font-size:13px;opacity:.85}
      .body{padding:24px}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:14px}
      .row:last-child{border:none}
      .label{color:#6b7280}
      .value{font-weight:600}
      .total-row{background:#f0fdf4;border-radius:8px;padding:12px 16px;margin-top:16px;display:flex;justify-content:space-between;align-items:center}
      .total-label{font-size:15px;font-weight:700;color:#16a34a}
      .total-value{font-size:22px;font-weight:900;color:#16a34a}
      .status-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${inv.status==='PAID'?'#dcfce7':'#fef9c3'};color:${inv.status==='PAID'?'#15803d':'#854d0e'}}
      .footer{background:#f9fafb;padding:12px 24px;font-size:11px;color:#9ca3af;text-align:center}
    </style></head>
    <body><div class="slip">
      <div class="header"><h1>Fee Payment Slip</h1><p>Invoice #${inv.invoiceNumber}</p></div>
      <div class="body">
        <div class="row"><span class="label">Student Name</span><span class="value">${student}</span></div>
        <div class="row"><span class="label">Description</span><span class="value">${inv.description}</span></div>
        <div class="row"><span class="label">Category</span><span class="value">${inv.category ?? 'TUITION'}</span></div>
        <div class="row"><span class="label">Invoice Date</span><span class="value">${new Date(inv.createdAt ?? Date.now()).toLocaleDateString('en-PK')}</span></div>
        <div class="row"><span class="label">Due Date</span><span class="value">${new Date(inv.dueDate).toLocaleDateString('en-PK')}</span></div>
        <div class="row"><span class="label">Total Amount</span><span class="value">Rs. ${Number(inv.amount).toLocaleString()}</span></div>
        <div class="row"><span class="label">Amount Paid</span><span class="value">Rs. ${Number(inv.paidAmount ?? 0).toLocaleString()}</span></div>
        <div class="row"><span class="label">Status</span><span class="status-badge">${inv.status}</span></div>
        <div class="total-row">
          <span class="total-label">Balance Due</span>
          <span class="total-value">Rs. ${balance.toLocaleString()}</span>
        </div>
      </div>
      <div class="footer">Generated on ${new Date().toLocaleString('en-PK')} · MySchool Management System</div>
    </div></body></html>
  `;
}

function printFeeSlip(inv: any) {
  const html = generateFeeSlipHTML(inv);
  const win = window.open('', '_blank', 'width=700,height=600');
  if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
}

export default function FeesPage() {
  const [payModal, setPayModal] = useState<any>(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [tab, setTab] = useState<'outstanding'|'defaulters'|'revenue'>('outstanding');
  const [invForm, setInvForm] = useState({ studentId: '', description: '', amount: '', dueDate: '', category: 'TUITION' });
  const [reminderForm, setReminderForm] = useState({ channel: 'SMS', message: 'Dear parent, your fee payment of Rs. {amount} for {description} is overdue. Please clear the dues at the earliest. - School Management' });
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const { data: invoices, isLoading } = useOutstandingFees('');
  const { data: revenue } = useFeeRevenue();
  const { data: studentsData } = useStudents({ limit: 100 });
  const pay = useRecordPayment();
  const createInvoice = useCreateInvoice();
  const { toast } = useToast();
  const [payErr, setPayErr] = React.useState('');
  const [invErr, setInvErr] = React.useState('');

  const inv: any[] = Array.isArray(invoices) ? invoices : [];
  const rev = revenue as any;
  const students: any[] = (studentsData as any)?.data ?? [];

  const totalOutstanding = inv.reduce((s: number, i: any) => s + (i.amount - (i.paidAmount ?? 0)), 0);
  const pendingCount = inv.filter((i: any) => i.status === 'PENDING').length;
  const overdueCount = inv.filter((i: any) => i.status === 'OVERDUE').length;
  const partialCount = inv.filter((i: any) => i.status === 'PARTIAL').length;

  const defaulters = inv.filter((i: any) => i.status === 'OVERDUE' || (i.status === 'PENDING' && new Date(i.dueDate) < new Date()));
  const defaulterStudents = Array.from(
    defaulters.reduce((map: Map<string, any>, inv: any) => {
      const sid = inv.studentId || inv.student?.id;
      if (!sid) return map;
      const existing = map.get(sid);
      if (existing) {
        existing.totalDue += Number(inv.amount) - Number(inv.paidAmount ?? 0);
        existing.invoiceCount++;
      } else {
        map.set(sid, {
          id: sid,
          name: `${inv.student?.user?.profile?.firstName ?? '—'} ${inv.student?.user?.profile?.lastName ?? ''}`.trim(),
          class: inv.student?.enrollments?.[0]?.section?.class?.name ?? '—',
          totalDue: Number(inv.amount) - Number(inv.paidAmount ?? 0),
          invoiceCount: 1,
          oldestDue: inv.dueDate,
          status: inv.status,
        });
      }
      return map;
    }, new Map<string, any>())
  ).map(([, v]) => v).sort((a: any, b: any) => b.totalDue - a.totalDue);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    setPayErr('');
    try {
      await pay.mutateAsync({ invoiceId: payModal.id, amount: parseFloat(amount), paymentMethod: method });
      setPayModal(null);
      setAmount('');
      toast('Payment recorded successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to record payment';
      setPayErr(msg);
      toast(msg, 'error');
    }
  };

  const submitInvoice = async () => {
    setInvErr('');
    try {
      await createInvoice.mutateAsync({ ...invForm, amount: parseFloat(invForm.amount) });
      setInvForm({ studentId: '', description: '', amount: '', dueDate: '', category: 'TUITION' });
      setInvoiceModal(false);
      toast('Invoice created successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to create invoice';
      setInvErr(msg);
      toast(msg, 'error');
    }
  };

  const sendReminders = async () => {
    setIsSendingReminders(true);
    await new Promise(r => setTimeout(r, 1200));
    setReminderSent(new Set(defaulterStudents.map((d: any) => d.id)));
    setIsSendingReminders(false);
    setReminderModal(false);
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
    { key: 'actions', header: '', render: (i: any) => (
      <div className="flex gap-1">
        <button onClick={() => printFeeSlip(i)} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 font-medium rounded-lg hover:bg-gray-200" title="Print Fee Slip">
          🖨️
        </button>
        {i.status !== 'PAID' && i.status !== 'CANCELLED' && (
          <button onClick={() => { setPayModal(i); setAmount(String(i.amount - (i.paidAmount ?? 0))); }}
            className="px-3 py-1.5 text-xs bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">
            Record Payment
          </button>
        )}
      </div>
    )},
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
                {(['outstanding','defaulters','revenue'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${tab===t?'bg-white shadow text-gray-900':'text-gray-500'}`}>
                    {t === 'outstanding' ? 'Outstanding' : t === 'defaulters' ? `Defaulters ${defaulters.length > 0 ? `(${defaulterStudents.length})` : ''}` : 'Revenue'}
                  </button>
                ))}
              </div>
              {tab === 'defaulters' && defaulterStudents.length > 0 && (
                <button onClick={() => setReminderModal(true)} className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-400">
                  Send Reminders ({defaulterStudents.length})
                </button>
              )}
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
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 relative">
            <p className="text-xs font-bold text-orange-500 uppercase">Defaulters</p>
            <p className="text-2xl font-black text-orange-600 mt-1">{defaulterStudents.length}</p>
            {defaulterStudents.length > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </div>
        </div>

        {/* Outstanding Tab */}
        {tab === 'outstanding' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <DataTable columns={columns} data={inv} isLoading={isLoading} emptyMessage="No outstanding fees" />
          </div>
        )}

        {/* Defaulters Tab */}
        {tab === 'defaulters' && (
          <div>
            {defaulterStudents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <p className="text-5xl mb-3">🎉</p>
                <p className="text-gray-500 font-medium">No defaulters! All fees are up to date.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <p className="text-sm font-bold text-red-600">{defaulterStudents.length} students with overdue fees · Total Due: Rs. {defaulterStudents.reduce((s: number, d: any) => s + d.totalDue, 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-red-50 border-b border-red-100">
                      <tr>
                        {['Student', 'Class', 'Invoices', 'Total Due', 'Oldest Due', 'Reminder', 'Action'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-red-600 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {defaulterStudents.map((d: any) => (
                        <tr key={d.id} className="hover:bg-red-50/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                                {d.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{d.class}</td>
                          <td className="px-4 py-3"><span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 rounded-full text-xs font-bold">{d.invoiceCount}</span></td>
                          <td className="px-4 py-3"><p className="font-bold text-red-600 text-sm">Rs. {d.totalDue.toLocaleString()}</p></td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(d.oldestDue).toLocaleDateString('en-PK')}</td>
                          <td className="px-4 py-3">
                            {reminderSent.has(d.id)
                              ? <span className="text-xs text-green-600 font-medium">✓ Sent</span>
                              : <span className="text-xs text-gray-400">Pending</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setReminderSent(prev => new Set([...prev, d.id]));
                              }}
                              className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200"
                            >
                              {reminderSent.has(d.id) ? 'Resend' : 'Remind'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Revenue Tab */}
        {tab === 'revenue' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Revenue Overview</h3>
              <button
                onClick={() => {
                  const data = { title: 'Fee Revenue Report', generatedAt: new Date().toISOString(), data: rev };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `fee-revenue-${new Date().toISOString().split('T')[0]}.json`; a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
              >
                Export JSON
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Total Collected', value: `Rs. ${Number(rev?.collected??0).toLocaleString()}`, color: 'text-green-700 bg-green-50' },
                { label: 'Total Outstanding', value: `Rs. ${Number(rev?.outstanding??0).toLocaleString()}`, color: 'text-red-600 bg-red-50' },
                { label: 'Collection Rate', value: `${rev?.collectionRate ?? 0}%`, color: 'text-blue-600 bg-blue-50' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Payment method breakdown */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">Payment Methods</p>
              {[
                { label: 'Cash', pct: 60, color: 'bg-green-500' },
                { label: 'Bank Transfer', pct: 25, color: 'bg-blue-500' },
                { label: 'JazzCash / EasyPaisa', pct: 10, color: 'bg-purple-500' },
                { label: 'Card / Stripe', pct: 5, color: 'bg-orange-500' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 w-36 truncate">{m.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{m.pct}%</span>
                </div>
              ))}
            </div>

            <div className="space-y-0">
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
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                A digital receipt / fee slip will be available after payment is recorded.
              </div>
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
            <div className="bg-blue-50 rounded-lg p-2.5 text-xs text-blue-700">
              A fee slip can be printed from the invoice list after creation.
            </div>
            <button onClick={submitInvoice} disabled={createInvoice.isPending||!invForm.studentId||!invForm.amount||!invForm.dueDate} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </Modal>

        {/* Automated Reminder Modal */}
        <Modal isOpen={reminderModal} onClose={() => setReminderModal(false)} title="Send Automated Reminders">
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <p className="text-sm font-bold text-orange-800">Sending to {defaulterStudents.length} defaulters</p>
              <p className="text-xs text-orange-600 mt-0.5">Total outstanding: Rs. {defaulterStudents.reduce((s: number, d: any) => s + d.totalDue, 0).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reminder Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ v: 'SMS', icon: '📱' }, { v: 'WhatsApp', icon: '💬' }, { v: 'Email', icon: '📧' }].map(c => (
                  <button key={c.v} onClick={() => setReminderForm(f => ({ ...f, channel: c.v }))}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${reminderForm.channel === c.v ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span>{c.icon}</span>{c.v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Template</label>
              <textarea rows={4} value={reminderForm.message} onChange={e => setReminderForm(f => ({ ...f, message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
              <p className="text-xs text-gray-400 mt-1">Variables: {'{amount}'}, {'{description}'}, {'{student_name}'}, {'{due_date}'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Sending via</p>
                <p className="text-sm font-bold text-gray-800">{reminderForm.channel}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Recipients</p>
                <p className="text-sm font-bold text-gray-800">{defaulterStudents.length} parents</p>
              </div>
            </div>
            <button onClick={sendReminders} disabled={isSendingReminders}
              className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-400 disabled:opacity-50">
              {isSendingReminders ? 'Sending...' : `Send ${reminderForm.channel} Reminders`}
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
