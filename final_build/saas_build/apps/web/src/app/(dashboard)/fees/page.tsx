'use client';
import React, { useState } from 'react';
import {
  useOutstandingFees, useCreateInvoice, useRecordPayment, useFeeRevenue, useStudents,
} from '@/hooks/use-api';
import { Topbar } from '@/components/layout/topbar';
import { Modal } from '@/components/shared/modal';
import RevenueChart from '@/components/dashboard/RevenueChart';

const EMPTY_INVOICE = { studentId: '', description: '', amount: '', dueDate: '', category: '' };
const EMPTY_PAYMENT = { invoiceId: '', amount: '', method: 'CASH', transactionRef: '', notes: '' };

const STATUS_BADGE: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-gray-100 text-gray-600',
  OVERDUE: 'bg-red-100 text-red-700',
};

export default function FeesPage() {
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [invoiceForm, setInvoiceForm] = useState(EMPTY_INVOICE);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [studentSearch, setStudentSearch] = useState('');

  const { data: invoices, isLoading } = useOutstandingFees('');
  const { data: revenue } = useFeeRevenue();
  const { data: studentsData } = useStudents({ search: studentSearch, limit: 10, isActive: true });
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();

  const invoiceList = (invoices as any[]) ?? [];
  const rev: any = revenue ?? {};
  const students = (studentsData as any)?.data ?? [];

  const totalOutstanding = invoiceList.reduce(
    (sum, inv) => sum + Math.max(0, Number(inv.amount) - Number(inv.amountPaid ?? 0)), 0
  );

  const handleCreateInvoice = async () => {
    await createInvoice.mutateAsync({
      ...invoiceForm,
      amount: Number(invoiceForm.amount),
    });
    setInvoiceModal(false);
    setInvoiceForm(EMPTY_INVOICE);
  };

  const openPayment = (invoice: any) => {
    const due = Math.max(0, Number(invoice.amount) - Number(invoice.amountPaid ?? 0));
    setPaymentForm({ ...EMPTY_PAYMENT, invoiceId: invoice.id, amount: String(due) });
    setPaymentModal(invoice);
  };

  const handleRecordPayment = async () => {
    await recordPayment.mutateAsync({ ...paymentForm, amount: Number(paymentForm.amount) });
    setPaymentModal(null);
    setPaymentForm(EMPTY_PAYMENT);
  };

  return (
    <>
      <Topbar title="Fees" subtitle="Invoices, payments & revenue"
        action={<button onClick={() => setInvoiceModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">+ New Invoice</button>} />
      <div className="page-padding space-y-5">

        {/* Stats */}
        <div className="grid-responsive-3" style={{ gap: '0.75rem' }}>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Collected</p>
            <p className="text-xl font-black text-green-600">₹{(rev.collected ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Outstanding</p>
            <p className="text-xl font-black text-red-600">₹{totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Collection Rate</p>
            <p className="text-xl font-black text-gray-900">{rev.collectionRate ?? 0}%</p>
          </div>
        </div>

        {/* Revenue chart, if breakdown available */}
        {rev.daily && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Revenue Trend</h2>
            <RevenueChart data={rev} />
          </div>
        )}

        {/* Outstanding invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700">Outstanding Invoices</h2>
          </div>
          {isLoading ? (
            <div className="text-center py-16 text-gray-400">Loading...</div>
          ) : invoiceList.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">💰</div>
              <p className="font-semibold">No outstanding invoices</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {invoiceList.map((inv: any) => {
                const due = Math.max(0, Number(inv.amount) - Number(inv.amountPaid ?? 0));
                const name = inv.student?.user?.profile
                  ? `${inv.student.user.profile.firstName ?? ''} ${inv.student.user.profile.lastName ?? ''}`.trim()
                  : inv.student?.admissionNo ?? 'Student';
                return (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-400">
                        Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'} · ₹{due.toLocaleString()} due
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_BADGE[inv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                      <button onClick={() => openPayment(inv)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">
                        Record Payment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create invoice modal */}
      {invoiceModal && (
        <Modal title="New Invoice" onClose={() => setInvoiceModal(false)}>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Student</label>
              <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search student..." className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              {students.length > 0 && (
                <div className="mt-1 border border-gray-100 rounded-xl max-h-32 overflow-y-auto">
                  {students.map((s: any) => (
                    <button key={s.id} onClick={() => { setInvoiceForm(f => ({ ...f, studentId: s.id })); setStudentSearch(`${s.firstName} ${s.lastName}`); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${invoiceForm.studentId === s.id ? 'bg-blue-50' : ''}`}>
                      {s.firstName} {s.lastName} <span className="text-gray-400">#{s.admissionNo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Description</label>
              <input value={invoiceForm.description} onChange={e => setInvoiceForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Term 1 Tuition Fee" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Amount</label>
                <input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Due Date</label>
                <input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>
            <button onClick={handleCreateInvoice} disabled={!invoiceForm.studentId || !invoiceForm.amount || createInvoice.isPending}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </Modal>
      )}

      {/* Record payment modal */}
      {paymentModal && (
        <Modal title="Record Payment" onClose={() => setPaymentModal(null)}>
          <div className="p-5 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Amount</label>
              <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Method</label>
              <select value={paymentForm.method} onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="ONLINE">Online</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Transaction Ref (optional)</label>
              <input value={paymentForm.transactionRef} onChange={e => setPaymentForm(f => ({ ...f, transactionRef: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
            </div>
            <button onClick={handleRecordPayment} disabled={!paymentForm.amount || recordPayment.isPending}
              className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">
              {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
