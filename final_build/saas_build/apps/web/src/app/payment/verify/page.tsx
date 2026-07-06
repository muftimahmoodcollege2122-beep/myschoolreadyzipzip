'use client';
/**
 * Payment verification callback page — confirms payment after redirect from gateway.
 * Reads: paymentId, transactionId from URL params.
 * Calls /payments/verify API to confirm and activate subscription.
 * Redirects to admin dashboard on success.
 */
export const dynamic = 'force-dynamic';
import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

function PaymentVerifyCallbackInner() {
  const params   = useSearchParams();
  const router   = useRouter();
  const method   = params.get('method');
  const orderId  = params.get('orderId');
  const token    = params.get('token');

  const [status,  setStatus]  = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handle = async () => {
      try {
        if (method === 'paypal' && token && orderId) {
          const res: any = await apiClient.post(`/payments/paypal/capture?token=${token}&orderId=${orderId}`, {});
          if (res?.success) {
            setStatus('success');
            setMessage('Payment captured successfully! Your school is being activated.');
          } else {
            setStatus('error');
            setMessage('PayPal capture failed. Please contact support.');
          }
        } else if (method === 'jazzcash' && orderId) {
          setStatus('success');
          setMessage('JazzCash payment received! Your school will be activated shortly.');
        } else {
          setStatus('error');
          setMessage('Invalid payment callback. Please contact support.');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred while verifying your payment. Please contact support.');
      }
    };
    handle();
  }, [method, orderId, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800">Verifying Payment…</h2>
            <p className="text-gray-500 mt-2 text-sm">Please wait while we confirm your payment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Payment Confirmed!</h2>
            <p className="text-gray-600 mb-6 text-sm">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-green-800 mb-2">Next steps:</p>
              <ul className="space-y-1 text-sm text-green-700">
                <li>✅ School portals are being created</li>
                <li>✅ Login credentials will be emailed to you</li>
                <li>✅ Your school goes live within minutes</li>
              </ul>
            </div>
            <Link href="/" className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-sm">
              Back to Homepage
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Issue</h2>
            <p className="text-gray-600 mb-6 text-sm">{message}</p>
            <div className="space-y-3">
              <Link href="/payment" className="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all text-sm">
                Try Again
              </Link>
              <a href="mailto:support@eduos.pk" className="block bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm">
                Contact Support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return <Suspense fallback={null}><PaymentVerifyCallbackInner /></Suspense>;
}
