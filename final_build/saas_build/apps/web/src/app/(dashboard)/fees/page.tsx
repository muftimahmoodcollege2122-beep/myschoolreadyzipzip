'use client';
import React, { useState } from 'react';
import { useOutstandingFees, useRecordPayment } from '../../../hooks/use-api';
import { DataTable } from '../../../components/shared/data-table';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { Topbar } from '../../../components/layout/topbar';
import type { Invoice } from '../../../types';
const SV: Record<string,string> = { PAID:'green', PENDING:'yellow', OVERDUE:'red', CANCELLED:'gray' };
export default function FeesPage() {
  const [schoolId,setSchoolId] = useState('');
  const [payModal,setPayModal] = useState<Invoice|null>(null);
  const [amount,setAmount] = useState('');
  const [method,setMethod] = useState('CASH');
  const { data:invoices, isLoading } = useOutstandingFees(schoolId);
  const pay = useRecordPayment();
  const total = (invoices??[]).reduce((s:number,i:Invoice)=>s+i.amount,0);
  const columns = [
    { key:'invoiceNumber', header:'Invoice #', render:(i:Invoice)=><span className="font-mono text-xs font-bold">{i.invoiceNumber}</span> },
    { key:'student', header:'Student', render:(i:Invoice)=><span className="font-medium text-sm">{i.student?.user?.profile?.firstName??'—'} {i.student?.user?.profile?.lastName??''}</span> },
    { key:'amount', header:'Amount', render:(i:Invoice)=><span className="font-bold">Rs. {Number(i.amount).toLocaleString()}</span> },
    { key:'dueDate', header:'Due', render:(i:Invoice)=><span className={`text-xs ${new Date(i.dueDate)<new Date()?'text-red-500 font-bold':'text-gray-400'}`}>{new Date(i.dueDate).toLocaleDateString('en-PK')}</span> },
    { key:'status', header:'Status', render:(i:Invoice)=><Badge variant={SV[i.status]}>{i.status}</Badge> },
    { key:'action', header:'', render:(i:Invoice)=>i.status!=='PAID'?<button onClick={()=>{setPayModal(i);setAmount(String(i.amount));}} className="px-3 py-1 text-xs bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">Pay</button>:null },
  ];
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if(!payModal) return; await pay.mutateAsync({ invoiceId: payModal.id, amount: parseFloat(amount), paymentMethod: method }); setPayModal(null); };
  return (
    <>
      <Topbar title="Fees" subtitle="Track collections and outstanding payments"/>
      <div className="p-6">
        <PageHeader title="Fee Management"/>
        <div className="mb-4 max-w-xs"><input value={schoolId} onChange={e=>setSchoolId(e.target.value)} placeholder="Enter School ID" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400"/></div>
        {invoices && invoices.length>0 && (
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-xs font-bold text-red-400 uppercase">Outstanding</p><p className="text-2xl font-black text-red-600 mt-1">Rs. {total.toLocaleString()}</p></div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"><p className="text-xs font-bold text-yellow-500 uppercase">Pending</p><p className="text-2xl font-black text-yellow-600 mt-1">{(invoices as Invoice[]).filter(i=>i.status==='PENDING').length}</p></div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4"><p className="text-xs font-bold text-orange-400 uppercase">Overdue</p><p className="text-2xl font-black text-orange-600 mt-1">{(invoices as Invoice[]).filter(i=>i.status==='OVERDUE').length}</p></div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <DataTable columns={columns} data={invoices??[]} isLoading={isLoading} emptyMessage={schoolId?'No outstanding fees 🎉':'Enter a school ID to load fees'}/>
        </div>
        <Modal isOpen={!!payModal} onClose={()=>setPayModal(null)} title="Record Payment">
          {payModal && <form onSubmit={submit} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm"><p className="font-semibold">{payModal.description}</p><p className="text-gray-500">Invoice #{payModal.invoiceNumber}</p></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (Rs.)</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Payment Method</label>
              <select value={method} onChange={e=>setMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400">
                <option value="CASH">Cash</option><option value="JAZZCASH">JazzCash</option><option value="EASYPAISA">EasyPaisa</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="STRIPE">Card / Stripe</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={()=>setPayModal(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={pay.isPending} className="px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">{pay.isPending?'Processing...':'Confirm Payment'}</button>
            </div>
          </form>}
        </Modal>
      </div>
    </>
  );
}
