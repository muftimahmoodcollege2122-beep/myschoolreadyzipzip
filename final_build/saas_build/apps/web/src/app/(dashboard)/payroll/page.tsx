'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const EMPLOYEES = [
  { id: 'EMP-001', name: 'Dr. Fatima Shah', dept: 'Science', role: 'Senior Teacher', base: 85000, hra: 15000, transport: 5000, medical: 3000, grossPay: 108000, tax: 8500, eobi: 450, netPay: 99050, status: 'PAID', bankAc: '****4521' },
  { id: 'EMP-002', name: 'Mr. Ahmed Malik', dept: 'Mathematics', role: 'Teacher', base: 65000, hra: 10000, transport: 4000, medical: 2000, grossPay: 81000, tax: 5500, eobi: 450, netPay: 75050, status: 'PAID', bankAc: '****7832' },
  { id: 'EMP-003', name: 'Mrs. Sara Khan', dept: 'English', role: 'Teacher', base: 60000, hra: 9000, transport: 3000, medical: 2000, grossPay: 74000, tax: 4200, eobi: 450, netPay: 69350, status: 'PAID', bankAc: '****2241' },
  { id: 'EMP-004', name: 'Mr. Bilal Hassan', dept: 'Administration', role: 'Accountant', base: 55000, hra: 8000, transport: 3000, medical: 1500, grossPay: 67500, tax: 3800, eobi: 450, netPay: 63250, status: 'PROCESSING', bankAc: '****9901' },
  { id: 'EMP-005', name: 'Mr. Omar Qureshi', dept: 'Sports', role: 'Sports Coach', base: 45000, hra: 6000, transport: 2500, medical: 1500, grossPay: 55000, tax: 2200, eobi: 450, netPay: 52350, status: 'PAID', bankAc: '****3345' },
  { id: 'EMP-006', name: 'Mrs. Nadia Rehman', dept: 'Arts', role: 'Teacher', base: 58000, hra: 8500, transport: 3000, medical: 2000, grossPay: 71500, tax: 4000, eobi: 450, netPay: 67050, status: 'PENDING', bankAc: '****6612' },
  { id: 'EMP-007', name: 'Mr. Ibrahim Ali', dept: 'IT', role: 'IT Manager', base: 75000, hra: 12000, transport: 4000, medical: 2500, grossPay: 93500, tax: 7000, eobi: 450, netPay: 86050, status: 'PAID', bankAc: '****8823' },
  { id: 'EMP-008', name: 'Security Guard', dept: 'Operations', role: 'Security', base: 28000, hra: 4000, transport: 0, medical: 1000, grossPay: 33000, tax: 0, eobi: 450, netPay: 32550, status: 'PAID', bankAc: '****1122' },
];

const ALLOWANCES = [
  { name: 'House Rent Allowance (HRA)', rate: '15% of Basic', applies: 'All Staff', taxable: false },
  { name: 'Medical Allowance', rate: 'Rs 1,000–3,000/mo', applies: 'All Staff', taxable: false },
  { name: 'Transport Allowance', rate: 'Rs 2,000–5,000/mo', applies: 'Teaching Staff', taxable: false },
  { name: 'Performance Bonus', rate: 'Up to 20% of Basic', applies: 'Teachers', taxable: true },
  { name: 'Seniority Increment', rate: '5% yearly', applies: 'All Staff', taxable: true },
  { name: 'Hazard Allowance', rate: 'Rs 2,000/mo', applies: 'Lab Staff', taxable: false },
  { name: 'Special Duty Pay', rate: 'Rs 500/day', applies: 'As assigned', taxable: true },
];

const LOANS = [
  { employee: 'Mr. Ahmed Malik', amount: 100000, paid: 40000, remaining: 60000, monthly: 10000, interest: '0%' },
  { employee: 'Mrs. Sara Khan', amount: 50000, paid: 20000, remaining: 30000, monthly: 5000, interest: '0%' },
];

type View = 'overview' | 'payslips' | 'allowances' | 'loans' | 'eobi' | 'tax';

export default function PayrollPage() {
  const [view, setView] = useState<View>('overview');
  const [month] = useState('June 2026');
  const [search, setSearch] = useState('');
  const [runModal, setRunModal] = useState(false);
  const [slipModal, setSlipModal] = useState<typeof EMPLOYEES[0] | null>(null);

  const totalGross = EMPLOYEES.reduce((a, e) => a + e.grossPay, 0);
  const totalNet = EMPLOYEES.reduce((a, e) => a + e.netPay, 0);
  const totalTax = EMPLOYEES.reduce((a, e) => a + e.tax, 0);
  const totalEOBI = EMPLOYEES.reduce((a, e) => a + e.eobi, 0);

  const filtered = EMPLOYEES.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Payroll" subtitle="Staff salary management & processing" />
      <div className="p-6">
        <PageHeader title="Payroll Management" subtitle={`Pay period: ${month}`}
          action={
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⬇ Export</button>
              <button onClick={() => setRunModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">▶ Run Payroll</button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Gross Payroll', value: `Rs ${(totalGross / 1000).toFixed(0)}K`, sub: `${EMPLOYEES.length} employees`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Net Payout', value: `Rs ${(totalNet / 1000).toFixed(0)}K`, sub: 'After deductions', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Income Tax (WHT)', value: `Rs ${(totalTax / 1000).toFixed(0)}K`, sub: 'To FBR', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'EOBI Contribution', value: `Rs ${(totalEOBI / 1000).toFixed(1)}K`, sub: 'Employer + Employee', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
          {(['overview', 'payslips', 'allowances', 'loans', 'eobi', 'tax'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'eobi' ? 'EOBI' : v === 'tax' ? 'Tax / FBR' : v}
            </button>
          ))}
        </div>

        {/* Overview */}
        {view === 'overview' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-64" />
              <div className="flex gap-2">
                <Badge variant="green">{EMPLOYEES.filter(e => e.status === 'PAID').length} Paid</Badge>
                <Badge variant="yellow">{EMPLOYEES.filter(e => e.status !== 'PAID').length} Pending</Badge>
              </div>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                {['Employee', 'Department', 'Role', 'Basic', 'Gross Pay', 'Tax', 'EOBI', 'Net Pay', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">{e.name[0]}</div>
                        <div><p className="font-medium text-gray-800 text-xs">{e.name}</p><p className="text-xs text-gray-400">{e.id}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.dept}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{e.role}</td>
                    <td className="px-4 py-3 font-mono text-xs">Rs {e.base.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-xs">Rs {e.grossPay.toLocaleString()}</td>
                    <td className="px-4 py-3 text-orange-600 text-xs">-Rs {e.tax.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">-Rs {e.eobi}</td>
                    <td className="px-4 py-3 font-bold text-green-600 text-xs">Rs {e.netPay.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={e.status === 'PAID' ? 'green' : e.status === 'PROCESSING' ? 'blue' : 'yellow'}>{e.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSlipModal(e)} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">Payslip</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr className="text-xs font-bold text-gray-800">
                  <td colSpan={4} className="px-4 py-3">TOTAL ({EMPLOYEES.length} employees)</td>
                  <td className="px-4 py-3">Rs {totalGross.toLocaleString()}</td>
                  <td className="px-4 py-3 text-orange-600">-Rs {totalTax.toLocaleString()}</td>
                  <td className="px-4 py-3">-Rs {totalEOBI}</td>
                  <td className="px-4 py-3 text-green-600">Rs {totalNet.toLocaleString()}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Payslips */}
        {view === 'payslips' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EMPLOYEES.map(e => (
              <div key={e.id} onClick={() => setSlipModal(e)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">{e.name[0]}</div>
                  <div><p className="font-bold text-sm text-gray-800">{e.name}</p><p className="text-xs text-gray-400">{e.role} · {e.dept}</p></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Gross Pay</span><span className="font-medium">Rs {e.grossPay.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Deductions</span><span className="text-red-500">-Rs {(e.tax + e.eobi).toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1 mt-1"><span>Net Pay</span><span className="text-green-600">Rs {e.netPay.toLocaleString()}</span></div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={e.status === 'PAID' ? 'green' : 'yellow'}>{e.status}</Badge>
                  <span className="text-xs text-gray-400">{e.bankAc}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Allowances */}
        {view === 'allowances' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-800">Allowance & Benefit Structure</p>
              <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">+ Add Allowance</button>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Allowance', 'Rate/Amount', 'Applies To', 'Taxable', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {ALLOWANCES.map(a => (
                  <tr key={a.name} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 font-medium text-gray-800">{a.name}</td>
                    <td className="px-4 py-3 text-gray-600">{a.rate}</td>
                    <td className="px-4 py-3 text-gray-500">{a.applies}</td>
                    <td className="px-4 py-3"><Badge variant={a.taxable ? 'orange' : 'green'}>{a.taxable ? 'Taxable' : 'Tax-Free'}</Badge></td>
                    <td className="px-4 py-3"><button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Loans */}
        {view === 'loans' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Staff Loans</h3>
                <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg">+ New Loan</button>
              </div>
              {LOANS.map(l => (
                <div key={l.employee} className="border border-gray-100 rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-800">{l.employee}</p>
                    <Badge variant="blue">Active</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div><p className="text-xs text-gray-400">Loan Amount</p><p className="font-bold">Rs {l.amount.toLocaleString()}</p></div>
                    <div><p className="text-xs text-gray-400">Paid</p><p className="font-bold text-green-600">Rs {l.paid.toLocaleString()}</p></div>
                    <div><p className="text-xs text-gray-400">Remaining</p><p className="font-bold text-orange-600">Rs {l.remaining.toLocaleString()}</p></div>
                    <div><p className="text-xs text-gray-400">Monthly Deduction</p><p className="font-bold">Rs {l.monthly.toLocaleString()}</p></div>
                  </div>
                  <div className="mt-3 bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(l.paid / l.amount) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round((l.paid / l.amount) * 100)}% repaid · {Math.round(l.remaining / l.monthly)} months remaining</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EOBI */}
        {view === 'eobi' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-2">EOBI (Employee Old-age Benefits) Register</h3>
            <p className="text-sm text-gray-500 mb-6">Employee: Rs 450/mo | Employer: Rs 900/mo per employee</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Employee Contribution</p>
                <p className="text-xl font-bold text-blue-600">Rs {(EMPLOYEES.length * 450).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{EMPLOYEES.length} × Rs 450</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Employer Contribution</p>
                <p className="text-xl font-bold text-green-600">Rs {(EMPLOYEES.length * 900).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{EMPLOYEES.length} × Rs 900</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Total Monthly</p>
                <p className="text-xl font-bold text-purple-600">Rs {(EMPLOYEES.length * 1350).toLocaleString()}</p>
                <p className="text-xs text-gray-400">To EOBI authority</p>
              </div>
            </div>
            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
              <thead><tr className="bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">EOBI #</th>
                <th className="px-4 py-3 text-left">Employee Share</th>
                <th className="px-4 py-3 text-left">Employer Share</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr></thead>
              <tbody>
                {EMPLOYEES.slice(0, 5).map((e, i) => (
                  <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">EOBI-{2024000 + i}</td>
                    <td className="px-4 py-3">Rs 450</td>
                    <td className="px-4 py-3">Rs 900</td>
                    <td className="px-4 py-3"><Badge variant="green">Enrolled</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tax */}
        {view === 'tax' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-2">Income Tax (Withholding) — FBR Statement</h3>
            <p className="text-sm text-gray-500 mb-6">Monthly WHT deductions per Finance Act 2025</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Tax Slabs (FY 2025-26)</h4>
                {[
                  { range: 'Up to Rs 600K/yr', rate: '0%' },
                  { range: 'Rs 600K – 1.2M', rate: '2.5%' },
                  { range: 'Rs 1.2M – 2.4M', rate: '12.5%' },
                  { range: 'Rs 2.4M – 3.6M', rate: '22.5%' },
                  { range: 'Rs 3.6M – 6M', rate: '27.5%' },
                  { range: 'Above Rs 6M', rate: '35%' },
                ].map(s => (
                  <div key={s.range} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-600">{s.range}</span>
                    <span className="font-bold text-orange-600">{s.rate}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Monthly WHT Summary</h4>
                {EMPLOYEES.filter(e => e.tax > 0).map(e => (
                  <div key={e.id} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-600">{e.name}</span>
                    <span className="font-bold text-orange-600">Rs {e.tax.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-sm mt-2">
                  <span>Total WHT (June)</span>
                  <span className="text-orange-600">Rs {totalTax.toLocaleString()}</span>
                </div>
                <button className="mt-4 w-full py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-500">Submit FBR Return</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Run Payroll Modal */}
      <Modal isOpen={runModal} onClose={() => setRunModal(false)} title="Run Payroll — June 2026">
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-bold mb-1">⚠️ Payroll Summary</p>
            <p>Total Net Payout: <strong>Rs {totalNet.toLocaleString()}</strong></p>
            <p>Employees: <strong>{EMPLOYEES.length}</strong></p>
            <p>WHT to FBR: <strong>Rs {totalTax.toLocaleString()}</strong></p>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Payment Method</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Bank Transfer (Bulk)</option><option>Individual Bank Transfer</option><option>Cash</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Payment Date</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" defaultValue="2026-06-30" />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">✅ Confirm & Process</button>
            <button onClick={() => setRunModal(false)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Payslip Modal */}
      <Modal isOpen={!!slipModal} onClose={() => setSlipModal(null)} title="Pay Slip">
        {slipModal && (
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div><h3 className="font-bold text-lg text-gray-900">MySchool</h3><p className="text-xs text-gray-400">Pay Slip for {month}</p></div>
                <div className="text-right"><p className="font-bold text-sm">{slipModal.name}</p><p className="text-xs text-gray-400">{slipModal.role} · {slipModal.dept}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="font-bold text-gray-700 mb-2">Earnings</p>
                  {[['Basic Salary', slipModal.base], ['HRA', slipModal.hra], ['Transport', slipModal.transport], ['Medical', slipModal.medical]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-600">{k}</span><span>Rs {Number(v).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 font-bold mt-1"><span>Gross Pay</span><span className="text-green-600">Rs {slipModal.grossPay.toLocaleString()}</span></div>
                </div>
                <div>
                  <p className="font-bold text-gray-700 mb-2">Deductions</p>
                  {[['Income Tax (WHT)', slipModal.tax], ['EOBI', slipModal.eobi]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-600">{k}</span><span className="text-red-500">-Rs {Number(v).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 font-bold mt-1"><span>Total Deductions</span><span className="text-red-500">-Rs {(slipModal.tax + slipModal.eobi).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">NET PAY</span>
                <span className="text-xl font-bold text-green-600">Rs {slipModal.netPay.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">Bank A/C: {slipModal.bankAc} · Paid via Bank Transfer</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg">🖨 Print</button>
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">📧 Email</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
