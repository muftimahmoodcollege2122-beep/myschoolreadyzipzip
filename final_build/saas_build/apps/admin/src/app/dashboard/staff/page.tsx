'use client';
import React, { useState } from 'react';
import { useStaff, useCreateStaff } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { DataTable } from '../../../components/shared/data-table';
import { useToast } from '../../../components/shared/toast';

const DEPARTMENTS = ['Administration','Academic','Finance','IT','Library','Transport','Sports','Counseling','Security','Housekeeping'];
const DESIGNATIONS = ['Principal','Vice Principal','Head of Department','Senior Teacher','Teacher','Assistant Teacher','Counselor','Librarian','Accountant','IT Technician','Driver','Security Guard','Administrative Officer'];

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', employeeId: '', designation: '', department: '', joiningDate: '', salary: '' };

export default function StaffPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: staffData, isLoading } = useStaff({ search, limit: 50 });
  const createStaff = useCreateStaff();
  const { toast } = useToast();
  const [err, setErr] = React.useState('');

  const staff: any[] = (staffData as any)?.data ?? [];

  const deptCounts = staff.reduce((acc: any, s: any) => { const d = s.department ?? 'Unknown'; acc[d] = (acc[d]??0)+1; return acc; }, {});

  const handleCreate = async () => {
    setErr('');
    try {
      await createStaff.mutateAsync(form);
      setForm(EMPTY);
      setModal(false);
      toast('Staff member added successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to add staff member';
      setErr(msg);
      toast(msg, 'error');
    }
  };

  const columns = [
    { key: 'name', header: 'Employee', render: (s: any) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
          {s.user?.profile?.firstName?.[0]}{s.user?.profile?.lastName?.[0]}
        </div>
        <div><p className="font-semibold text-sm text-gray-900">{s.user?.profile?.firstName} {s.user?.profile?.lastName}</p>
          <p className="text-xs text-gray-400">{s.employeeId} · {s.user?.email}</p></div>
      </div>
    )},
    { key: 'designation', header: 'Role', render: (s: any) => <div><p className="text-sm font-medium text-gray-800">{s.designation}</p>{s.department&&<p className="text-xs text-gray-400">{s.department}</p>}</div> },
    { key: 'joined', header: 'Joined', render: (s: any) => <span className="text-xs text-gray-500">{s.joiningDate ? new Date(s.joiningDate).toLocaleDateString('en-PK') : '—'}</span> },
    { key: 'salary', header: 'Salary', render: (s: any) => s.salary ? <span className="font-mono text-sm text-gray-700">Rs. {Number(s.salary).toLocaleString()}</span> : <span className="text-gray-300">—</span> },
    { key: 'status', header: 'Status', render: (s: any) => <Badge variant={s.isActive?'green':'gray'}>{s.isActive?'Active':'Inactive'}</Badge> },
  ];

  return (
    <>
      <Topbar title="Staff" subtitle="HR management and staff records" />
      <div className="p-6">
        <PageHeader
          title="Staff Management"
          subtitle={`${staff.length} total staff members`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Staff</button>}
        />

        {/* Department breakdown */}
        {Object.keys(deptCounts).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(deptCounts).sort((a:any,b:any)=>b[1]-a[1]).map(([dept, count]: any) => (
              <div key={dept} className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                <span className="text-xs font-bold text-gray-500">{dept}</span>
                <span className="text-xs bg-green-100 text-green-700 font-black px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Staff', value: (staffData as any)?.meta?.total ?? staff.length, icon: '👥', bg: 'bg-blue-50' },
            { label: 'Academic', value: staff.filter((s:any)=>s.department==='Academic').length, icon: '📚', bg: 'bg-green-50' },
            { label: 'Departments', value: Object.keys(deptCounts).length, icon: '🏢', bg: 'bg-purple-50' },
            { label: 'Avg. Salary', value: staff.filter((s:any)=>s.salary).length ? `Rs. ${Math.round(staff.reduce((a:any,s:any)=>a+Number(s.salary??0),0)/staff.filter((s:any)=>s.salary).length).toLocaleString()}` : '—', icon: '💰', bg: 'bg-yellow-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
              <span className="text-2xl">{s.icon}</span>
              <div><p className="font-black text-gray-900 text-lg leading-tight">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff by name or designation..." className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <DataTable columns={columns} data={staff} isLoading={isLoading} emptyMessage="No staff records found" />
        </div>
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="Add Staff Member">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
              <input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
              <input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
              <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee ID</label>
              <input value={form.employeeId} onChange={e=>setForm(f=>({...f,employeeId:e.target.value}))} placeholder="e.g. EMP-001" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Designation *</label>
            <select value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Select designation</option>
              {DESIGNATIONS.map(d=><option key={d} value={d}>{d}</option>)}
            </select></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
            <select value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Select department</option>
              {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Joining Date *</label>
              <input type="date" value={form.joiningDate} onChange={e=>setForm(f=>({...f,joiningDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monthly Salary (Rs.)</label>
              <input type="number" value={form.salary} onChange={e=>setForm(f=>({...f,salary:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          <button onClick={handleCreate} disabled={createStaff.isPending||!form.firstName||!form.email||!form.designation||!form.joiningDate} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createStaff.isPending ? 'Adding...' : 'Add Staff Member'}
          </button>
        </div>
      </Modal>
    </>
  );
}
