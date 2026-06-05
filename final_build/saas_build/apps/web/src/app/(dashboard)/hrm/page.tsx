'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useStaff } from '../../../hooks/use-api';

const LEAVES = [
  { name:'Ahmad Ali', dept:'Academic', type:'Sick Leave', from:'Jun 3', to:'Jun 4', days:2, status:'APPROVED' },
  { name:'Sara Khan', dept:'Administration', type:'Annual Leave', from:'Jun 10', to:'Jun 14', days:5, status:'PENDING' },
  { name:'Bilal Hassan', dept:'IT', type:'Emergency Leave', from:'Jun 1', to:'Jun 1', days:1, status:'APPROVED' },
  { name:'Nadia Malik', dept:'Finance', type:'Maternity Leave', from:'Jul 1', to:'Sep 30', days:90, status:'PENDING' },
];

const PAYROLL = [
  { name:'Mr. Ali Hassan', designation:'Senior Teacher', dept:'Academic', basic:45000, allowances:8000, deductions:2500, net:50500 },
  { name:'Ms. Sara Ahmed', designation:'Teacher', dept:'Academic', basic:38000, allowances:6000, deductions:2000, net:42000 },
  { name:'Ahmed Khan', designation:'Principal Secretary', dept:'Administration', basic:60000, allowances:12000, deductions:4000, net:68000 },
  { name:'Fatima Malik', designation:'Accountant', dept:'Finance', basic:42000, allowances:7000, deductions:2200, net:46800 },
  { name:'Usman Ali', designation:'IT Manager', dept:'IT', basic:55000, allowances:10000, deductions:3500, net:61500 },
];

export default function HRMPage() {
  const [view, setView] = useState<'employees'|'payroll'|'leaves'|'performance'>('employees');
  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type:'Annual Leave', from:'', to:'', reason:'' });
  const { data: staffData, isLoading } = useStaff({ limit: 50 });
  const staff: any[] = (staffData as any)?.data ?? [];

  const totalPayroll = PAYROLL.reduce((a,p)=>a+p.net,0);

  return (
    <>
      <Topbar title="HR Management" subtitle="Human Resources & Payroll" />
      <div className="p-6">
        <PageHeader
          title="HR Management"
          subtitle="Staff records, payroll, leaves & performance"
          action={<button onClick={()=>setLeaveModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500">+ Apply Leave</button>}
        />

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Employees', value: ((staffData as any)?.meta?.total ?? staff.length) || 24, icon:'👥', bg:'from-blue-500 to-blue-600' },
            { label:'On Leave Today', value: LEAVES.filter(l=>l.status==='APPROVED').length, icon:'🏖️', bg:'from-yellow-500 to-orange-500' },
            { label:'Monthly Payroll', value:`Rs. ${(totalPayroll/1000).toFixed(0)}K`, icon:'💰', bg:'from-green-500 to-green-600' },
            { label:'Pending Leaves', value: LEAVES.filter(l=>l.status==='PENDING').length, icon:'📋', bg:'from-purple-500 to-purple-600' },
          ].map(k=>(
            <div key={k.label} className={`bg-gradient-to-br ${k.bg} rounded-2xl p-5 text-white`}>
              <div className="text-3xl mb-2">{k.icon}</div>
              <p className="text-3xl font-black">{k.value}</p>
              <p className="text-white/70 text-xs mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['employees','payroll','leaves','performance'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {v==='employees'?'👥 Employees':v==='payroll'?'💰 Payroll':v==='leaves'?'🏖️ Leaves':'⭐ Performance'}
            </button>
          ))}
        </div>

        {view === 'employees' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Employee Directory</h3>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100">Export CSV</button>
            </div>
            {isLoading ? (
              <div className="p-6 space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
            ) : staff.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {staff.slice(0,10).map((s:any,i)=>(
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">{s.user?.profile?.firstName?.[0]||'S'}{s.user?.profile?.lastName?.[0]||'T'}</div>
                      <div><p className="font-semibold text-sm text-gray-900">{s.user?.profile?.firstName} {s.user?.profile?.lastName}</p><p className="text-xs text-gray-400">{s.designation} · {s.department}</p></div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400 text-xs">{s.employeeId||'EMP-00'+i}</span>
                      {s.salary&&<span className="font-mono text-sm font-bold text-gray-700">Rs. {Number(s.salary).toLocaleString()}</span>}
                      <Badge variant={s.isActive?'green':'gray'}>{s.isActive?'Active':'Inactive'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-gray-400">No employees found. Add staff from the Staff module.</p>
              </div>
            )}
          </div>
        )}

        {view === 'payroll' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label:'Total Payroll', value:`Rs. ${totalPayroll.toLocaleString()}`, icon:'💰', color:'text-green-600 bg-green-50' },
                { label:'Total Basic', value:`Rs. ${PAYROLL.reduce((a,p)=>a+p.basic,0).toLocaleString()}`, icon:'📊', color:'text-blue-600 bg-blue-50' },
                { label:'Total Deductions', value:`Rs. ${PAYROLL.reduce((a,p)=>a+p.deductions,0).toLocaleString()}`, icon:'➖', color:'text-red-600 bg-red-50' },
              ].map(s=>(
                <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
                  <p className="text-2xl font-black">{s.value}</p><p className="text-sm font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">June 2026 Payroll</h3>
                <button className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">Generate Payslips</button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['Employee','Designation','Basic','Allowances','Deductions','Net Pay','Action'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {PAYROLL.map((p,i)=>(
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3"><p className="font-semibold text-sm text-gray-900">{p.name}</p><p className="text-xs text-gray-400">{p.dept}</p></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.designation}</td>
                      <td className="px-4 py-3 font-mono text-sm">Rs. {p.basic.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-sm text-green-600">+Rs. {p.allowances.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-sm text-red-500">-Rs. {p.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-sm font-black text-gray-900">Rs. {p.net.toLocaleString()}</td>
                      <td className="px-4 py-3"><button className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Payslip</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-3 font-bold text-gray-900 text-sm" colSpan={2}>Total ({PAYROLL.length} employees)</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold">Rs. {PAYROLL.reduce((a,p)=>a+p.basic,0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-green-600">+Rs. {PAYROLL.reduce((a,p)=>a+p.allowances,0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-red-500">-Rs. {PAYROLL.reduce((a,p)=>a+p.deductions,0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-sm font-black text-gray-900 text-base">Rs. {totalPayroll.toLocaleString()}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {view === 'leaves' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[{l:'Annual Leave',used:5,total:20,c:'bg-blue-50 text-blue-700'},{l:'Sick Leave',used:2,total:10,c:'bg-red-50 text-red-700'},{l:'Emergency Leave',used:1,total:5,c:'bg-orange-50 text-orange-700'}].map(t=>(
                <div key={t.l} className={`${t.c} rounded-2xl p-4`}>
                  <p className="font-bold">{t.l}</p>
                  <p className="text-3xl font-black mt-2">{t.used}<span className="text-lg font-normal opacity-60">/{t.total}</span></p>
                  <div className="h-2 bg-current/20 rounded-full mt-2 overflow-hidden"><div className="h-full bg-current rounded-full" style={{width:`${(t.used/t.total)*100}%`}}/></div>
                  <p className="text-xs mt-1 opacity-60">days used</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Leave Requests</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {LEAVES.map((l,i)=>(
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm">{l.name[0]}</div>
                      <div><p className="font-semibold text-sm">{l.name}</p><p className="text-xs text-gray-400">{l.dept} · {l.type}</p></div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center"><p className="text-xs text-gray-500">Period</p><p className="text-xs font-bold">{l.from} — {l.to}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Days</p><p className="text-sm font-black text-gray-900">{l.days}</p></div>
                      <Badge variant={l.status==='APPROVED'?'green':'yellow'}>{l.status}</Badge>
                      {l.status==='PENDING'&&(
                        <div className="flex gap-1">
                          <button className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200">✓</button>
                          <button className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">✗</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'performance' && (
          <div className="grid grid-cols-2 gap-4">
            {PAYROLL.map((e,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700">{e.name[0]}</div>
                    <div><p className="font-bold text-gray-900 text-sm">{e.name}</p><p className="text-xs text-gray-400">{e.designation}</p></div>
                  </div>
                  <div className="flex">{[1,2,3,4,5].map(s=><span key={s} className={s<=Math.floor(3+Math.random()*2)?'text-yellow-400':'text-gray-200'}>★</span>)}</div>
                </div>
                <div className="space-y-2">
                  {[{l:'Attendance',v:94+Math.floor(Math.random()*6)},{l:'Performance',v:75+Math.floor(Math.random()*20)},{l:'Student Feedback',v:80+Math.floor(Math.random()*15)}].map(m=>(
                    <div key={m.l}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">{m.l}</span><span className="font-bold text-gray-700">{m.v}%</span></div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${m.v>=90?'bg-green-500':m.v>=75?'bg-blue-500':'bg-yellow-500'}`} style={{width:`${m.v}%`}}/></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={leaveModal} onClose={()=>setLeaveModal(false)} title="Apply for Leave">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Leave Type</label>
            <select value={leaveForm.type} onChange={e=>setLeaveForm(f=>({...f,type:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
              {['Annual Leave','Sick Leave','Emergency Leave','Maternity Leave','Paternity Leave'].map(t=><option key={t}>{t}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">From</label>
              <input type="date" value={leaveForm.from} onChange={e=>setLeaveForm(f=>({...f,from:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
              <input type="date" value={leaveForm.to} onChange={e=>setLeaveForm(f=>({...f,to:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason</label>
            <textarea value={leaveForm.reason} onChange={e=>setLeaveForm(f=>({...f,reason:e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 resize-none"/></div>
          <button disabled={!leaveForm.from||!leaveForm.to} onClick={()=>setLeaveModal(false)} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50">Submit Request</button>
        </div>
      </Modal>
    </>
  );
}
