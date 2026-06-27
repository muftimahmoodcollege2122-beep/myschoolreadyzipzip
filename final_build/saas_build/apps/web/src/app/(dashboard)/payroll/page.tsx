'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem, useUpdateSchoolItem } from '@/hooks/use-api';

const EMPTY = { name: '', designation: '', department: '', basicSalary: '', allowances: '0', deductions: '0', month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), status: 'PENDING', bankAccount: '' };

export default function PayrollPage() {
  const [month, setMonth] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: payroll = [], isLoading } = useSchoolSection('payroll');
  const create = useCreateSchoolItem('payroll');
  const update = useUpdateSchoolItem('payroll');
  const del = useDeleteSchoolItem('payroll');

  const records: any[] = Array.isArray(payroll) ? payroll : [];
  const filtered = records.filter(r =>
    (!search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.designation?.toLowerCase().includes(search.toLowerCase())) &&
    (!month || r.month === month)
  );

  const totalPayroll = filtered.reduce((a, r) => a + getNet(r), 0);
  const paid = filtered.filter(r => r.status === 'PAID');
  const pending = filtered.filter(r => r.status !== 'PAID');

  function getNet(r: any) {
    return (Number(r.basicSalary) || 0) + (Number(r.allowances) || 0) - (Number(r.deductions) || 0);
  }

  const months = [...new Set(records.map(r => r.month))].filter(Boolean);

  const handleCreate = async () => {
    if (!form.name || !form.basicSalary) return;
    await create.mutateAsync({ ...form, basicSalary: Number(form.basicSalary), allowances: Number(form.allowances), deductions: Number(form.deductions) });
    setForm(EMPTY); setModal(false);
  };

  const markPaid = async (r: any) => {
    await update.mutateAsync({ id: r.id, status: 'PAID', paidAt: new Date().toISOString() });
  };

  return (
    <>
      <Topbar title="Payroll" subtitle="Staff salary & payroll management" />
      <div className="p-6">
        <PageHeader title="Payroll Management" subtitle={`${records.length} payroll records`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Payroll</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Payroll', value: `Rs ${(totalPayroll/1000).toFixed(0)}K`, icon: '💰', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Paid', value: paid.length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending', value: pending.length, icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Staff', value: new Set(records.map(r => r.name)).size, icon: '👥', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={month} onChange={e => setMonth(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Months</option>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {pending.length > 0 && filtered.some(r => r.status !== 'PAID') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-bold text-yellow-800 text-sm">{pending.length} salary payments pending</p>
                <p className="text-xs text-yellow-600">Total pending: Rs {pending.reduce((a, r) => a + getNet(r), 0).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={async () => { for (const r of pending) await markPaid(r); }} className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-lg">Pay All</button>
          </div>
        )}

        {isLoading ? <div className="text-center py-12 text-gray-400">Loading payroll...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">💰</p>
              <p className="font-medium">{search || month ? 'No records found' : 'No payroll records yet'}</p>
              {!search && !month && <p className="text-sm mt-1">Add staff salary records to manage payroll</p>}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Designation</th>
                  <th className="px-4 py-3 text-right">Basic</th><th className="px-4 py-3 text-right">Allow.</th>
                  <th className="px-4 py-3 text-right">Deduct.</th><th className="px-4 py-3 text-right font-bold">Net</th>
                  <th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map((r: any) => {
                    const net = getNet(r);
                    return (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                        <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.designation}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{Number(r.basicSalary||0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600">+{Number(r.allowances||0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-500">-{Number(r.deductions||0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">Rs {net.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{r.month}</td>
                        <td className="px-4 py-3"><Badge variant={r.status === 'PAID' ? 'green' : 'yellow'}>{r.status}</Badge></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {r.status !== 'PAID' && <button onClick={() => markPaid(r)} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100">Pay</button>}
                            <button onClick={() => del.mutate(r.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold text-sm">
                    <td colSpan={5} className="px-4 py-3 text-gray-600">Total</td>
                    <td className="px-4 py-3 text-right text-gray-900">Rs {totalPayroll.toLocaleString()}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Payroll Record">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Staff Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Full name" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Designation</label>
              <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Teacher" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Department</label>
              <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. Science" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Month</label>
              <input value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. June 2026" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Basic Salary *</label>
              <input type="number" value={form.basicSalary} onChange={e => setForm({ ...form, basicSalary: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Allowances</label>
              <input type="number" value={form.allowances} onChange={e => setForm({ ...form, allowances: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Deductions</label>
              <input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          {form.basicSalary && (
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Net Salary</p>
              <p className="text-xl font-bold text-green-600">Rs {((Number(form.basicSalary)||0) + (Number(form.allowances)||0) - (Number(form.deductions)||0)).toLocaleString()}</p>
            </div>
          )}
          <div><label className="text-xs text-gray-500 mb-1 block">Bank Account</label>
            <input value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Account number" /></div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Payroll Record'}
          </button>
        </div>
      </Modal>
    </>
  );
}
