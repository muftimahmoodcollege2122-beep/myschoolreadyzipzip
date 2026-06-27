'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useStaff, useLessonPlans, useSubstitutions, useCreateLessonPlan, useCreateSubstitution, useSchoolSection, useCreateSchoolItem } from '@/hooks/use-api';

const TABS = ['Overview', 'Leave Requests', 'Lesson Plans', 'Substitutions', 'Payroll'];
const LEAVE_EMPTY = { staffName: '', department: '', leaveType: 'Sick Leave', fromDate: '', toDate: '', reason: '' };

export default function HrmPage() {
  const [tab, setTab] = useState(0);
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState(LEAVE_EMPTY);

  const { data: staffData, isLoading: staffLoading } = useStaff({ limit: 50 });
  const { data: lessonPlans = [], isLoading: lpLoading } = useLessonPlans({});
  const { data: substitutions = [], isLoading: subLoading } = useSubstitutions();
  const { data: leaveRequests = [] } = useSchoolSection('leaveRequests');
  const { data: payrollData = [] } = useSchoolSection('payroll');
  const createLeave = useCreateSchoolItem('leaveRequests');
  const createLP = useCreateLessonPlan();
  const createSub = useCreateSubstitution();

  const staff: any[] = staffData?.data ?? [];
  const plans: any[] = Array.isArray(lessonPlans) ? lessonPlans : [];
  const subs: any[] = Array.isArray(substitutions) ? substitutions : [];
  const leaves: any[] = Array.isArray(leaveRequests) ? leaveRequests : [];
  const payroll: any[] = Array.isArray(payrollData) ? payrollData : [];

  const totalPayroll = payroll.reduce((a: number, p: any) => a + (Number(p.net) || 0), 0);

  const handleCreateLeave = async () => {
    if (!leaveForm.staffName || !leaveForm.fromDate) return;
    const days = Math.ceil((new Date(leaveForm.toDate || leaveForm.fromDate).getTime() - new Date(leaveForm.fromDate).getTime()) / (1000*60*60*24)) + 1;
    await createLeave.mutateAsync({ ...leaveForm, days, status: 'PENDING' });
    setLeaveForm(LEAVE_EMPTY); setLeaveModal(false);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

  return (
    <>
      <Topbar title="HR Management" subtitle="Staff management, leaves & payroll" />
      <div className="p-6">
        <PageHeader title="Human Resources" subtitle="Manage staff records, leaves, and payroll" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Staff', value: staffData?.meta?.total ?? staff.length, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'On Leave', value: leaves.filter((l: any) => l.status === 'APPROVED').length, icon: '🏖️', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Lesson Plans', value: plans.length, icon: '📋', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Monthly Payroll', value: `Rs ${(totalPayroll/1000).toFixed(0)}K`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`px-4 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${tab === i ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{t}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {staffLoading ? <div className="text-center py-12 text-gray-400">Loading staff...</div>
              : staff.length === 0 ? <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">👥</p><p>No staff records. Add staff from the Staff module.</p></div>
              : (
                <table className="w-full">
                  <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Designation</th>
                    <th className="px-4 py-3 text-left">Department</th><th className="px-4 py-3 text-left">Joined</th><th className="px-4 py-3 text-left">Status</th>
                  </tr></thead>
                  <tbody>
                    {staff.slice(0, 20).map((s: any) => {
                      const name = s.user?.profile ? `${s.user.profile.firstName} ${s.user.profile.lastName}` : 'Staff Member';
                      return (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                          <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
                          <td className="px-4 py-3 text-gray-500">{s.designation || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-500">{s.department || 'N/A'}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{s.joiningDate ? formatDate(s.joiningDate) : 'N/A'}</td>
                          <td className="px-4 py-3"><Badge variant={s.isActive ? 'green' : 'gray'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
          </div>
        )}

        {/* Leave Requests */}
        {tab === 1 && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => setLeaveModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Request Leave</button>
            </div>
            {leaves.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🏖️</p><p className="font-medium">No leave requests yet</p></div>
            ) : (
              <div className="space-y-3">
                {leaves.map((l: any) => (
                  <div key={l.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{l.staffName}</p>
                        <p className="text-xs text-gray-400">{l.department} · {l.leaveType} · {l.days} day(s)</p>
                        <p className="text-xs text-gray-400">{formatDate(l.fromDate)} → {formatDate(l.toDate || l.fromDate)}</p>
                      </div>
                      <Badge variant={l.status === 'APPROVED' ? 'green' : l.status === 'REJECTED' ? 'red' : 'yellow'}>{l.status}</Badge>
                    </div>
                    {l.reason && <p className="text-xs text-gray-500 mt-2">{l.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Lesson Plans */}
        {tab === 2 && (
          lpLoading ? <div className="text-center py-12 text-gray-400">Loading...</div>
          : plans.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">📋</p><p className="font-medium">No lesson plans yet</p><p className="text-sm mt-1">Teachers can create lesson plans from the Lesson Plans module</p></div>
          ) : (
            <div className="space-y-3">
              {plans.map((p: any) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.subject?.name || 'N/A'} · Week: {p.week || 'N/A'}</p>
                    </div>
                    <Badge variant={p.status === 'APPROVED' ? 'green' : p.status === 'SUBMITTED' ? 'blue' : 'gray'}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Substitutions */}
        {tab === 3 && (
          subLoading ? <div className="text-center py-12 text-gray-400">Loading...</div>
          : subs.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🔄</p><p className="font-medium">No substitutions recorded</p></div>
          ) : (
            <div className="space-y-3">
              {subs.map((s: any) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{s.absentTeacher?.user?.profile?.firstName || 'Teacher'} → {s.substituteTeacher?.user?.profile?.firstName || 'Substitute'}</p>
                      <p className="text-xs text-gray-400">{s.date ? formatDate(s.date) : 'N/A'} · {s.section?.name || 'N/A'}</p>
                    </div>
                    <Badge variant={s.status === 'COMPLETED' ? 'green' : 'yellow'}>{s.status || 'PENDING'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Payroll */}
        {tab === 4 && (
          payroll.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">💰</p><p className="font-medium">No payroll records</p><p className="text-sm mt-1">Payroll records are managed from staff salary settings</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Designation</th>
                  <th className="px-4 py-3 text-right">Basic</th><th className="px-4 py-3 text-right">Allowances</th>
                  <th className="px-4 py-3 text-right">Deductions</th><th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {payroll.map((p: any) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.designation}</td>
                      <td className="px-4 py-3 text-right text-gray-600">Rs {(p.basicSalary||0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-green-600">+{(p.allowances||0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-500">-{(p.deductions||0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">Rs {(p.net||0).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={p.status === 'PAID' ? 'green' : 'yellow'}>{p.status || 'PENDING'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <Modal isOpen={leaveModal} onClose={() => setLeaveModal(false)} title="Leave Request">
        <div className="p-6 space-y-4">
          {([['staffName','Staff Name *'],['department','Department'],['reason','Reason']]).map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input value={(leaveForm as any)[k]} onChange={e => setLeaveForm({ ...leaveForm, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} />
            </div>
          ))}
          <div><label className="text-xs text-gray-500 mb-1 block">Leave Type</label>
            <select value={leaveForm.leaveType} onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {['Sick Leave','Annual Leave','Emergency Leave','Maternity Leave','Study Leave'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">From Date *</label>
              <input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">To Date</label>
              <input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <button onClick={handleCreateLeave} disabled={createLeave.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createLeave.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </Modal>
    </>
  );
}
