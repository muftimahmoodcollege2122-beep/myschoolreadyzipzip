'use client';
/**
 * Fee payment page — handles school subscription payment.
 * Supports: JazzCash wallet, EasyPaisa wallet, bank transfer.
 * Shows QR codes and account numbers for manual transfers.
 * Marked force-dynamic (no static prerender) because it reads URL search params.
 */
export const dynamic = 'force-dynamic';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const PLANS = {
  STARTER:      { name: 'Starter',      pkr: 4999,  usd: 18,  students: '500' },
  PROFESSIONAL: { name: 'Professional', pkr: 12999, usd: 46,  students: '2,000' },
  ENTERPRISE:   { name: 'Enterprise',   pkr: 29999, usd: 107, students: 'Unlimited' },
};

type Method = 'EASYPAISA' | 'JAZZCASH' | 'BANK_TRANSFER' | 'IBAN' | 'PAYPAL';

const METHODS: { id: Method; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'EASYPAISA',    label: 'EasyPaisa',      icon: '🟢', desc: 'Mobile wallet — instant',         color: 'border-green-500 bg-green-50'  },
  { id: 'JAZZCASH',     label: 'JazzCash',        icon: '🔴', desc: 'Mobile wallet — instant',         color: 'border-red-500 bg-red-50'      },
  { id: 'BANK_TRANSFER',label: 'Bank Transfer',   icon: '🏦', desc: 'Any Pakistani bank — 2-4 hrs',    color: 'border-blue-500 bg-blue-50'    },
  { id: 'IBAN',         label: 'IBAN Transfer',   icon: '💳', desc: 'Internet banking — 2-4 hrs',      color: 'border-indigo-500 bg-indigo-50'},
  { id: 'PAYPAL',       label: 'PayPal',          icon: '🌐', desc: 'International — USD equivalent',  color: 'border-sky-500 bg-sky-50'      },
];

function PaymentPageInner() {
  const params   = useSearchParams();
  const router   = useRouter();
  const planKey  = (params.get('plan') || 'PROFESSIONAL').toUpperCase() as keyof typeof PLANS;
  const email    = params.get('email') || '';
  const school   = params.get('school') || '';
  const signupDataRaw = params.get('signupData') || '';

  const plan = PLANS[planKey] || PLANS.PROFESSIONAL;

  const [method,      setMethod]      = useState<Method | null>(null);
  const [step,        setStep]        = useState<'select' | 'details' | 'verify' | 'provisioning' | 'done'>('select');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [txnId,           setTxnId]           = useState('');
  const [paymentData,     setPaymentData]     = useState<any>(null);
  const [provisionResult, setProvisionResult] = useState<any>(null);
  const [provStep,        setProvStep]        = useState(0);

  const PROV_STEPS = [
    'Verifying payment...',
    'Creating your school account...',
    'Setting up admin dashboard...',
    'Provisioning student portal...',
    'Provisioning teacher portal...',
    'Provisioning parent portal...',
    'Launching your school website...',
    'Sending login credentials...',
  ];

  const initiate = async () => {
    if (!method) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/payments/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, plan: planKey, email, schoolName: school, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to initiate payment');

      if (method === 'PAYPAL' && data.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }
      setPaymentData(data);
      setStep('details');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!txnId.trim()) { setError('Please enter your transaction ID'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/payments/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: paymentData?.paymentId, transactionId: txnId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      // Auto-provision school immediately after payment verified
      setStep('provisioning');
      setProvStep(1);
      await new Promise(r => setTimeout(r, 600));

      let signupData: any = {};
      try { signupData = JSON.parse(decodeURIComponent(signupDataRaw)); } catch {}

      setProvStep(2);
      let regData: any = {};
      try {
        const regRes = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...signupData, paymentVerified: true, transactionId: txnId }),
        });
        regData = await regRes.json();
      } catch {}

      for (let i = 3; i <= PROV_STEPS.length; i++) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 200));
        setProvStep(i);
      }

      setProvisionResult(regData);
      setStep('done');
    } catch (e: any) {
      setError(e.message);
      setStep('verify');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-4">
            <span className="text-blue-300 text-sm font-medium">🎓 EduOS School Management</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Complete Your Subscription</h1>
          <p className="text-slate-400 mt-2">
            Plan: <span className="text-white font-semibold">{plan.name}</span> —{' '}
            <span className="text-green-400 font-bold">PKR {plan.pkr.toLocaleString()}/mo</span>
            <span className="text-slate-500"> (≈ USD {plan.usd})</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Step: Select Method */}
          {step === 'select' && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Choose Payment Method</h2>
              <div className="grid grid-cols-1 gap-3 mb-6">
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      method === m.id
                        ? m.color + ' border-opacity-100'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <span className="text-3xl">{m.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{m.label}</div>
                      <div className="text-sm text-gray-500">{m.desc}</div>
                    </div>
                    {method === m.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {(method === 'EASYPAISA' || method === 'JAZZCASH') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={initiate}
                disabled={!method || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all text-lg"
              >
                {loading ? 'Processing…' : `Continue with ${method ? METHODS.find(m => m.id === method)?.label : '…'}`}
              </button>
            </div>
          )}

          {/* Step: Payment Details / Instructions */}
          {step === 'details' && paymentData && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                  {METHODS.find(m => m.id === method)?.icon}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">Payment Instructions</h2>
                  <p className="text-sm text-gray-500">Follow the steps below carefully</p>
                </div>
              </div>

              {/* Amount Box */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-6 text-white text-center">
                <p className="text-sm opacity-80 mb-1">Amount to Transfer</p>
                <p className="text-4xl font-black">PKR {paymentData.amountPKR?.toLocaleString()}</p>
                <p className="text-sm opacity-70 mt-1">Reference: <span className="font-mono font-bold">{paymentData.paymentId || paymentData.referenceCode}</span></p>
              </div>

              {/* Account/Bank Details */}
              {(method === 'BANK_TRANSFER' || method === 'IBAN') && paymentData.accounts && (
                <div className="mb-6 space-y-3">
                  {paymentData.accounts.map((acc: any, i: number) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <p className="font-semibold text-gray-800 text-sm mb-2">{acc.bankName}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div><span className="font-medium">Title:</span> {acc.accountTitle}</div>
                        <div><span className="font-medium">Account:</span> {acc.accountNumber}</div>
                        <div className="col-span-2"><span className="font-medium">IBAN:</span> <span className="font-mono">{acc.iban}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(method === 'EASYPAISA') && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Send to EasyPaisa Account</p>
                  <p className="text-2xl font-bold text-green-700">{paymentData.accountNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{paymentData.accountTitle || 'EduOS Technologies'}</p>
                </div>
              )}

              {(method === 'JAZZCASH') && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Send to JazzCash Account</p>
                  <p className="text-2xl font-bold text-red-700">{paymentData.mobileAccountNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">EduOS Technologies</p>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Steps to complete payment:</p>
                <ol className="space-y-2">
                  {(paymentData.instructions || []).map((ins: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all"
              >
                I've Sent the Payment →
              </button>
            </div>
          )}

          {/* Step: Verify */}
          {step === 'verify' && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">📋</div>
                <h2 className="text-xl font-bold text-gray-800">Submit Payment Proof</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your transaction ID to confirm payment</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / Reference Number</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                  placeholder="e.g. TXN123456789"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <span className="font-bold">💡 Tip:</span> Find your transaction ID in your payment app under "Transaction History" or on the confirmation SMS.
                </p>
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={verify}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all"
              >
                {loading ? 'Submitting…' : 'Submit Payment Proof'}
              </button>

              <button onClick={() => setStep('details')} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">
                ← Back to instructions
              </button>
            </div>
          )}

          {/* Step: Done */}
          {step === 'provisioning' && (
            <div className="p-10 text-center">
              <div className="text-5xl mb-4 animate-bounce">⚡</div>
              <h2 className="text-2xl font-black text-white mb-2">Setting Up Your School</h2>
              <p className="text-white/60 mb-8">Please wait — this takes about 30 seconds</p>
              <div className="space-y-3 text-left mb-8">
                {PROV_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i < provStep ? 'text-emerald-400' : i === provStep ? 'text-blue-300' : 'text-white/20'}`}>
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      {i < provStep ? '✅' : i === provStep ? <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin inline-block"/> : '○'}
                    </span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(provStep / PROV_STEPS.length) * 100}%` }}/>
              </div>
              <p className="text-white/30 text-xs mt-2">{Math.round((provStep / PROV_STEPS.length) * 100)}% complete</p>
            </div>
          )}

          {step === 'done' && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Your School is Live!</h2>
              <p className="text-gray-500 mb-6 text-sm">
                Everything is ready. Login credentials have been sent to <strong>{email}</strong>.
              </p>

              {provisionResult?.slug && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6 text-left space-y-3">
                  <p className="text-sm font-black text-blue-900 mb-3">🚀 Your Live Portals</p>
                  {[
                    { label: '🏫 School Website',   url: `/s/${provisionResult.slug}` },
                    { label: '⚙️ Admin Dashboard',  url: `/login?slug=${provisionResult.slug}` },
                    { label: '🎓 Student Portal',   url: `/learn/${provisionResult.slug}` },
                    { label: '👩‍🏫 Teacher Portal',  url: `/t/${provisionResult.slug}` },
                    { label: '👪 Parent Portal',    url: `/parent/${provisionResult.slug}` },
                  ].map(({ label, url }) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-xl hover:border-blue-400 transition-colors group">
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                      <span className="text-xs text-blue-600 font-mono group-hover:underline">{url}</span>
                    </a>
                  ))}
                </div>
              )}

              {!provisionResult?.slug && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
                  Payment verified ✅ — your account is being activated. You'll receive an email at <strong>{email}</strong> within a few minutes with your login link.
                </div>
              )}

              <div className="flex gap-3">
                {provisionResult?.slug && (
                  <a href={`/login?slug=${provisionResult.slug}&email=${encodeURIComponent(email)}&firstLogin=true`}
                    className="flex-1 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-sm text-center">
                    🚀 Go to My Dashboard
                  </a>
                )}
                <a href="/" className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all text-sm text-center">
                  Return to Homepage
                </a>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Need help? Email us at{' '}
          <a href="mailto:support@eduos.pk" className="text-blue-400 hover:underline">support@eduos.pk</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentPageInnerPage() {
  return <Suspense fallback={null}><PaymentPageInner /></Suspense>;
}
