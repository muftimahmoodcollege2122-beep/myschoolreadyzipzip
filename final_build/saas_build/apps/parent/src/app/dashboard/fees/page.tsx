'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import { useParentAuth } from '../../../stores/auth.store';
import dayjs from 'dayjs';

export default function ParentFeesPage() {
  const { children: storedChildren } = useParentAuth();
  const [activeChild, setActiveChild] = useState(0);

  const { data: children } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  () => api.get('/parents/my-children').catch(() => storedChildren || []),
  });

  const childList = Array.isArray(children) ? children as any[] : storedChildren;
  const child = childList?.[activeChild];

  const { data, isLoading } = useQuery({
    queryKey: ['child-fees', child?.id],
    queryFn:  () => child?.id ? api.get(`/fees/student/${child.id}`).catch(() => []) : Promise.resolve([]),
    enabled: !!child?.id,
  });

  const fees: any[] = Array.isArray(data) ? data : (data as any)?.fees || [];
  const unpaid = fees.filter(f => f.status !== 'PAID');
  const paid   = fees.filter(f => f.status === 'PAID');
  const totalDue = unpaid.reduce((a, f) => a + Number(f.amount), 0);

  const STATUS_STYLE: any = {
    PAID:    'bg-green-100 text-green-700',
    UNPAID:  'bg-red-100 text-red-700',
    OVERDUE: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Fee Management</h1>
        <p className="text-gray-500 text-sm">Track and monitor school fees</p>
      </div>

      {childList?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {childList.map((c: any, i: number) => (
            <button key={i} onClick={() => setActiveChild(i)}
              className={`px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap ${
                activeChild === i ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}>{c.name}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-red-600">Total Due</p>
          <p className="text-lg font-black text-red-700 mt-1">Rs. {totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-green-600">Paid</p>
          <p className="text-2xl font-black text-green-700 mt-1">{paid.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-xs font-semibold text-orange-600">Pending</p>
          <p className="text-2xl font-black text-orange-700 mt-1">{unpaid.length}</p>
        </div>
      </div>

      {totalDue > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <p className="font-bold text-rose-700 mb-1">⚠️ Outstanding Fee Balance</p>
          <p className="text-sm text-rose-600">Rs. {totalDue.toLocaleString()} is pending for {child?.name}. Please visit the school accounts office to make payment.</p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl font-semibold">Pay via JazzCash</span>
            <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl font-semibold">Pay via EasyPaisa</span>
            <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl font-semibold">Bank Transfer</span>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-center py-10 text-gray-400">Loading…</p> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Fee Records — {child?.name}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {fees.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400">No fee records.</div>
            ) : fees.map((f: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-lg">💰</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{f.feeType} Fee</p>
                  <p className="text-xs text-gray-400">{f.description || dayjs(f.createdAt).format('MMMM YYYY')}</p>
                  <p className="text-xs text-gray-400">Due: {dayjs(f.dueDate).format('MMM D, YYYY')}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">Rs. {Number(f.amount).toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[f.status] || 'bg-gray-100 text-gray-600'}`}>{f.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
