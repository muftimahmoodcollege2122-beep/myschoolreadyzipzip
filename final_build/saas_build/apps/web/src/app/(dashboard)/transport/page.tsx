'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';

const DEFAULT_FORM = { name:'', routeNo:'', vehicleNo:'', driverName:'', driverPhone:'', capacity:'40', fee:'' };
const STATUS_COLOR: Record<string,any> = { ACTIVE:'green', INACTIVE:'gray', MAINTENANCE:'yellow' };

export default function TransportPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'routes'|'students'>('routes');
  const [modal, setModal] = useState<null|'create'|'assign'>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editId, setEditId] = useState<string|null>(null);
  const [assignForm, setAssignForm] = useState({ studentId:'', routeId:'', stopName:'', pickupTime:'' });
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const { data: stats } = useQuery({ queryKey:['transport-stats'], queryFn:()=>apiClient.get('/transport/stats') });
  const { data: routesData, isLoading } = useQuery({ queryKey:['routes'], queryFn:()=>apiClient.get('/transport/routes?limit=50') });
  const { data: studentsData } = useQuery({ queryKey:['students-all'], queryFn:()=>apiClient.get('/students?limit=500') });
  const { data: assignmentsData } = useQuery({ queryKey:['assignments'], queryFn:()=>apiClient.get('/transport/assignments') });

  const createRoute = useMutation({ mutationFn:(d:any)=>editId?apiClient.patch(`/transport/routes/${editId}`,d):apiClient.post('/transport/routes',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['routes']});qc.invalidateQueries({queryKey:['transport-stats']});setModal(null);setEditId(null);setForm(DEFAULT_FORM);} });
  const deleteRoute = useMutation({ mutationFn:(id:string)=>apiClient.delete(`/transport/routes/${id}`), onSuccess:()=>qc.invalidateQueries({queryKey:['routes']}) });
  const assignStudent = useMutation({
    mutationFn: (d:any) => apiClient.post('/transport/assign', d),
    onSuccess: async (_res, vars) => {
      qc.invalidateQueries({ queryKey:['assignments'] });
      setModal(null);
      setAssignForm({ studentId:'', routeId:'', stopName:'', pickupTime:'' });
      // Notify parent
      const student = students.find((s:any) => s.id === vars.studentId);
      const route = routes.find((r:any) => r.id === vars.routeId);
      if (student && route) {
        const name = `${student.user?.profile?.firstName||''} ${student.user?.profile?.lastName||''}`.trim();
        await apiClient.post('/notifications/broadcast', {
          title: '🚌 Transport Assigned',
          body: `Dear Parent, ${name} has been assigned to Route ${route.routeNo} (${route.name}). Driver: ${route.driverName}, Vehicle: ${route.vehicleNo}. Stop: ${vars.stopName || 'As per route'}. Pickup time: ${vars.pickupTime || 'As scheduled'}.`,
          audience: 'ALL_PARENTS', channels: ['IN_APP','SMS'],
        }).catch(() => {});
      }
    },
  });

  const routes: any[] = (routesData as any)?.data ?? [];
  const students: any[] = (studentsData as any)?.data ?? [];
  const assignments: any[] = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData as any)?.data ?? [];
  const st: any = stats ?? {};

  const openEdit = (r: any) => {
    setForm({ name:r.name, routeNo:r.routeNo, vehicleNo:r.vehicleNo??'', driverName:r.driverName??'', driverPhone:r.driverPhone??'', capacity:String(r.capacity), fee:r.fee?String(r.fee):'' });
    setEditId(r.id); setModal('create');
  };

  return (
    <>
      <Topbar title="Transport" subtitle="Bus routes, fleet management and student assignments" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Active Routes',   value: st.activeRoutes   ?? routes.filter((r:any)=>r.status==='ACTIVE').length, color:'bg-blue-600',   icon:'🛣️' },
            { label:'Total Vehicles',  value: st.totalVehicles  ?? routes.length,                                        color:'bg-green-600',  icon:'🚌' },
            { label:'Students on Bus', value: st.totalStudents  ?? assignments.length,                                    color:'bg-amber-500',  icon:'🎓' },
            { label:'In Maintenance',  value: st.maintenance    ?? routes.filter((r:any)=>r.status==='MAINTENANCE').length, color:'bg-red-600', icon:'🔧' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-5">
          {([['routes','🛣️ Routes'],['students','🎓 Student Assignments']] as const).map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab===k?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{l}</button>
          ))}
          <div className="ml-auto flex gap-3">
            {tab==='routes' && <button onClick={() => { setForm(DEFAULT_FORM); setEditId(null); setModal('create'); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">+ Add Route</button>}
            {tab==='students' && <button onClick={() => setModal('assign')} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">+ Assign Student</button>}
          </div>
        </div>

        {/* Routes Tab */}
        {tab === 'routes' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? <div className="text-center py-16 text-gray-400">Loading routes...</div> :
            routes.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🚌</div><p className="font-semibold">No routes configured</p></div>
            ) : (
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Route','Vehicle No','Driver','Contact','Capacity','Fee/Month','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {routes.map((r:any) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-gray-400">#{r.routeNo}</p></td>
                      <td className="px-4 py-3 font-mono text-sm">{r.vehicleNo || '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium">{r.driverName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{r.driverPhone || '—'}</td>
                      <td className="px-4 py-3 text-sm">{r.capacity} seats</td>
                      <td className="px-4 py-3 text-sm font-medium">{r.fee ? `Rs. ${Number(r.fee).toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_COLOR[r.status ?? 'ACTIVE']}>{r.status ?? 'ACTIVE'}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(r)} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">Edit</button>
                          <button onClick={() => { if(confirm('Delete route?')) deleteRoute.mutate(r.id); }} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-semibold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Student Assignments Tab */}
        {tab === 'students' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {assignments.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">🎓</div><p className="font-semibold">No students assigned to transport</p><p className="text-sm mt-1">Click "Assign Student" to add transport assignments</p></div>
            ) : (
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Student','Roll No','Route','Stop','Pickup Time','Parent Notified'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {assignments.map((a:any) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-sm">{a.student?.user?.profile?.firstName} {a.student?.user?.profile?.lastName}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-500">{a.student?.rollNumber}</td>
                      <td className="px-4 py-3 text-sm"><p className="font-medium">{a.route?.name}</p><p className="text-xs text-gray-400">#{a.route?.routeNo} • {a.route?.vehicleNo}</p></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{a.stopName || '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{a.pickupTime || '—'}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">✅ Yes</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Route Modal */}
      {modal === 'create' && (
        <Modal title={editId ? 'Edit Route' : 'Add New Route'} onClose={() => { setModal(null); setEditId(null); setForm(DEFAULT_FORM); }}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Gulshan Route" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route No *</label><input value={form.routeNo} onChange={e=>setForm(f=>({...f,routeNo:e.target.value}))} placeholder="R-01" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle No</label><input value={form.vehicleNo} onChange={e=>setForm(f=>({...f,vehicleNo:e.target.value}))} placeholder="KHI-1234" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Driver Name</label><input value={form.driverName} onChange={e=>setForm(f=>({...f,driverName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Driver Phone</label><input value={form.driverPhone} onChange={e=>setForm(f=>({...f,driverPhone:e.target.value}))} placeholder="03XX-XXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity (seats)</label><input type="number" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monthly Fee (Rs.)</label><input type="number" value={form.fee} onChange={e=>setForm(f=>({...f,fee:e.target.value}))} placeholder="2500" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setModal(null); setEditId(null); setForm(DEFAULT_FORM); }} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => createRoute.mutate(form)} disabled={!form.name||!form.routeNo||createRoute.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40">{createRoute.isPending ? 'Saving...' : editId ? '✅ Update Route' : '🚌 Add Route'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Student Modal */}
      {modal === 'assign' && (
        <Modal title="Assign Student to Route" onClose={() => setModal(null)}>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">Parent will be automatically notified via SMS and in-app when assignment is saved.</div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student *</label>
              <select value={assignForm.studentId} onChange={e=>setAssignForm(f=>({...f,studentId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select student</option>
                {students.map((s:any) => <option key={s.id} value={s.id}>{s.user?.profile?.firstName} {s.user?.profile?.lastName} — {s.rollNumber}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route *</label>
              <select value={assignForm.routeId} onChange={e=>setAssignForm(f=>({...f,routeId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select route</option>
                {routes.filter((r:any)=>r.status!=='MAINTENANCE').map((r:any) => <option key={r.id} value={r.id}>{r.name} — #{r.routeNo} ({r.vehicleNo})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bus Stop Name</label><input value={assignForm.stopName} onChange={e=>setAssignForm(f=>({...f,stopName:e.target.value}))} placeholder="Gulshan Chowrangi" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pickup Time</label><input type="time" value={assignForm.pickupTime} onChange={e=>setAssignForm(f=>({...f,pickupTime:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => assignStudent.mutate(assignForm)} disabled={!assignForm.studentId||!assignForm.routeId||assignStudent.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40">{assignStudent.isPending ? 'Assigning...' : '🚌 Assign & Notify Parent'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
