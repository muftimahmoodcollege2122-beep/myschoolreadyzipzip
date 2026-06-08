'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import dayjs from 'dayjs';

export default function StudentFeesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-fees'],
    queryFn:  () => api.get('/fees/mine').catch(() => []),
  });

  const fees: any[] = Array.isArray(data) ? data : (data as any)?.data || [];
  const unpaid = fees.filter(f => f.status !== 'PAID');
  const paid   = fees.filter(f => f.status === 'PAID');
  const totalDue = unpaid.reduce((a, f) => a + Number(f.amount), 0);

  const STATUS_STYLE: any = {
    PAID:    'bg-green-100 text-green-700 border-green-200',
    UNPAID:  'bg-red-100 text-red-700 border-red-200',
    OVERDUE: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Fee Status</h1>
        <p className="text-gray-500 text-sm">Your fee payment records</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-red-600">Total Due</p>
          <p className="text-xl font-black text-red-700 mt-1">Rs. {totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-green-600">Paid Records</p>
          <p className="text-2xl font-black text-green-700 mt-1">{paid.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-orange-600">Pending</p>
          <p className="text-2xl font-black text-orange-700 mt-1">{unpaid.length}</p>
        </div>
      </div>

      {totalDue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-bold text-red-700 mb-1">⚠️ Outstanding Balance</p>
          <p className="text-sm text-red-600">You have Rs. {totalDue.toLocaleString()} in unpaid fees. Please pay at the school accounts office or contact your parent to process payment.</p>
        </div>
      )}

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">All Fee Records</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {fees.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400">No fee records found.</div>
            ) : fees.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">💰</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{f.feeType} Fee</p>
                  <p className="text-xs text-gray-400">{f.description || (f.month ? `Month: ${f.month}` : dayjs(f.createdAt).format('MMMM YYYY'))}</p>
                  <p className="text-xs text-gray-400">Due: {dayjs(f.dueDate).format('MMM D, YYYY')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-gray-900">Rs. {Number(f.amount).toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[f.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
