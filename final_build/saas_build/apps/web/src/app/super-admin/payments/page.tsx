'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const METHOD_COLORS: Record<string, string> = {
  EASYPAISA:     'bg-green-100 text-green-700',
  JAZZCASH:      'bg-red-100 text-red-700',
  BANK_TRANSFER: 'bg-blue-100 text-blue-700',
  IBAN:          'bg-indigo-100 text-indigo-700',
  PAYPAL:        'bg-sky-100 text-sky-700',
};

const METHOD_ICONS: Record<string, string> = {
  EASYPAISA:     '🟢',
  JAZZCASH:      '🔴',
  BANK_TRANSFER: '🏦',
  IBAN:          '💳',
  PAYPAL:        '🌐',
};

export default function PaymentVerificationsPage() {
  const qc                       = useQueryClient();
  const [selected, setSelected]  = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-payments'],
    queryFn:  () => apiClient.get('/payments/admin/pending'),
    refetchInterval: 30_000,
  });

  const pending: any[] = Array.isArray(data) ? data : [];

  const approve = useMutation({
    mutationFn: (id: string) => apiClient.post(`/payments/admin/approve/${id}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-payments'] });
      setSelected(null);
      alert('✅ Payment approved — tenant activated!');
    },
  });

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Payment Verifications</h1>
          <p className="text-gray-500 mt-1">Review and approve manual payment submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 border border-amber-200 rounded-xl px-4 py-2 text-sm font-bold text-amber-700">
            ⏳ {pending.length} Pending
          </div>
          <button onClick={() => qc.invalidateQueries({ queryKey: ['pending-payments'] })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm transition-all">
            🔄 Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-bold text-gray-600">No pending verifications</p>
          <p className="text-sm mt-1">All payments have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pending.map((p: any) => (
            <div key={p.id}
              className={`bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md ${
                selected?.id === p.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}
              onClick={() => setSelected(selected?.id === p.id ? null : p)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{METHOD_ICONS[p.method] || '💳'}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-800">{p.schoolName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${METHOD_COLORS[p.method] || 'bg-gray-100 text-gray-700'}`}>
                        {p.method}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
                        {p.plan}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{p.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted: {p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-800">PKR {Number(p.amountPKR || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Txn: <span className="font-mono font-bold text-gray-600">{p.transactionId || '—'}</span></p>
                </div>
              </div>

              {selected?.id === p.id && (
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    {[
                      { label: 'Tenant ID',      value: p.tenantId },
                      { label: 'Order ID',        value: p.orderId  },
                      { label: 'Transaction ID',  value: p.transactionId },
                      { label: 'Payment ID',      value: p.paymentId },
                    ].map(f => (
                      <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 font-medium">{f.label}</p>
                        <p className="text-sm font-mono font-bold text-gray-700 break-all mt-0.5">{f.value || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {p.screenshotUrl && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Payment Screenshot</p>
                      <img src={p.screenshotUrl} alt="Payment proof"
                        className="max-h-48 rounded-xl border border-gray-200 object-cover" />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); approve.mutate(p.id); }}
                      disabled={approve.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all">
                      {approve.isPending ? 'Approving…' : '✅ Approve & Activate School'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                      className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all">
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
