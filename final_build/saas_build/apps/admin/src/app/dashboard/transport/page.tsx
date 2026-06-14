'use client';
import React, { useState } from 'react';
import { useTransportRoutes, useTransportStats, useCreateRoute, useUpdateRoute, useDeleteRoute } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useToast } from '../../../components/shared/toast';

const DEFAULT_FORM = { name: '', routeNo: '', vehicleNo: '', driverName: '', driverPhone: '', capacity: '40', fee: '' };

export default function TransportPage() {
  const { data: stats } = useTransportStats();
  const { data: routesData, isLoading } = useTransportRoutes({ limit: 50 });
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();
  const [modal, setModal] = useState<null|'create'|any>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editId, setEditId] = useState<string|null>(null);
  const { toast } = useToast();
  const [err, setErr] = useState('');

  const routes: any[] = (routesData as any)?.data ?? [];

  const openCreate = () => { setForm(DEFAULT_FORM); setEditId(null); setModal('create'); };
  const openEdit = (r: any) => {
    setForm({ name: r.name, routeNo: r.routeNo, vehicleNo: r.vehicleNo??'', driverName: r.driverName??'', driverPhone: r.driverPhone??'', capacity: String(r.capacity), fee: r.fee ? String(r.fee) : '' });
    setEditId(r.id); setModal('create');
  };

  const handleSave = async () => {
    setErr('');
    try {
      if (editId) await updateRoute.mutateAsync({ id: editId, ...form });
      else await createRoute.mutateAsync(form);
      setModal(null); setEditId(null); setForm(DEFAULT_FORM);
      toast(editId ? 'Route updated successfully' : 'Route created successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to save route';
      setErr(msg);
      toast(msg, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this route?')) {
      try {
        await deleteRoute.mutateAsync(id);
        toast('Route deleted', 'success');
      } catch (e: any) {
        toast(e?.message || 'Failed to delete route', 'error');
      }
    }
  };

  const statusColor: Record<string,any> = { ACTIVE: 'green', INACTIVE: 'gray', MAINTENANCE: 'yellow' };

  return (
    <>
      <Topbar title="Transport" subtitle="School bus routes & fleet management" />
      <div className="p-6">
        <PageHeader
          title="Transport Management"
          action={<button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Route</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Routes', value: (stats as any)?.totalRoutes ?? 0, icon: '🗺️', color: 'bg-blue-50' },
            { label: 'Active Routes', value: (stats as any)?.activeRoutes ?? 0, icon: '✅', color: 'bg-green-50' },
            { label: 'Total Capacity', value: `${(stats as any)?.totalCapacity ?? 0} seats`, icon: '🚌', color: 'bg-yellow-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-5 flex items-center gap-4`}>
              <span className="text-3xl">{s.icon}</span>
              <div><p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs text-gray-500 font-medium">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Routes grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">🚌</p>
            <p className="text-gray-500 font-medium mb-2">No transport routes configured</p>
            <button onClick={openCreate} className="text-green-600 text-sm font-bold hover:underline">Add first route →</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {routes.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Route {r.routeNo}</span>
                      <Badge variant={statusColor[r.status] ?? 'gray'}>{r.status}</Badge>
                    </div>
                    <h3 className="font-bold text-gray-900 mt-1">{r.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600"><span>🚌</span><span className="font-medium">{r.vehicleNo ?? 'No vehicle assigned'}</span></div>
                  <div className="flex items-center gap-2 text-gray-600"><span>👨‍✈️</span><span>{r.driverName ?? 'No driver'} {r.driverPhone ? `· ${r.driverPhone}` : ''}</span></div>
                  <div className="flex items-center gap-2 text-gray-600"><span>💺</span><span>Capacity: <strong>{r.capacity}</strong> seats</span></div>
                  {r.fee && <div className="flex items-center gap-2 text-gray-600"><span>💰</span><span>Fee: <strong>Rs. {Number(r.fee).toLocaleString()}</strong>/month</span></div>}
                </div>
                {(r.stops as any[])?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Stops ({r.stops.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {(r.stops as any[]).map((s: any, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s.name ?? s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => { setModal(null); setEditId(null); setForm(DEFAULT_FORM); }} title={editId ? 'Edit Route' : 'Add Transport Route'}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route Name *</label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. North Campus Route" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Route No. *</label>
              <input value={form.routeNo} onChange={e => setForm(f=>({...f,routeNo:e.target.value}))} placeholder="e.g. R-01" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehicle No.</label>
              <input value={form.vehicleNo} onChange={e => setForm(f=>({...f,vehicleNo:e.target.value}))} placeholder="e.g. ABC-123" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
              <input type="number" value={form.capacity} onChange={e => setForm(f=>({...f,capacity:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Driver Name</label>
              <input value={form.driverName} onChange={e => setForm(f=>({...f,driverName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Driver Phone</label>
              <input value={form.driverPhone} onChange={e => setForm(f=>({...f,driverPhone:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monthly Fee (Rs.)</label>
              <input type="number" value={form.fee} onChange={e => setForm(f=>({...f,fee:e.target.value}))} placeholder="Optional" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          <button onClick={handleSave} disabled={createRoute.isPending||updateRoute.isPending||!form.name||!form.routeNo} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {(createRoute.isPending||updateRoute.isPending) ? 'Saving...' : editId ? 'Save Changes' : 'Create Route'}
          </button>
        </div>
      </Modal>
    </>
  );
}
