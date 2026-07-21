'use client';
export const dynamic = 'force-dynamic';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CancelledInner() {
  const params = useSearchParams();
  const plan = params.get('plan') || 'PROFESSIONAL';
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Payment Cancelled</h2>
        <p className="text-gray-500 mb-6 text-sm">No worries — your payment was not charged. You can try again anytime.</p>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-blue-800 mb-2">Other payment options:</p>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>🟢 EasyPaisa — mobile wallet</li>
            <li>🔴 JazzCash — mobile wallet</li>
            <li>🏦 Bank Transfer — any Pakistani bank</li>
          </ul>
        </div>
        <div className="space-y-3">
          <Link href={`/payment?plan=${plan}`} className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm">Try Again</Link>
          <Link href="/signup" className="block bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm">Back to Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return <Suspense fallback={null}><CancelledInner /></Suspense>;
}
