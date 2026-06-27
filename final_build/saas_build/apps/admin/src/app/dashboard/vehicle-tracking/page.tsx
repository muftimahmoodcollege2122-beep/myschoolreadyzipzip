'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useTransportRoutes, useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';

const EMPTY_VEHICLE = { number: '', type: 'Bus', driver: '', phone: '', capacity: '', route: '', status: 'ACTIVE' };
const EMPTY_ROUTE = { name: '', from: '', to: '', stops: '', departure: '', arrival: '', distance: '' };

export default function VehicleTrackingPage() {
  const [tab, setTab] = useState<'vehicles' | 'routes'>('vehicles');
  const [modal, setModal] = useState(false);

  const { data: apiRoutes = [], isLoading: routesLoading } = useTransportRoutes();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useSchoolSection('vehicles');
  const createVehicle = useCreateSchoolItem('vehicles');
  const delVehicle = useDeleteSchoolItem('vehicles');

  const vehicleList: any[] = Array.isArray(vehicles) ? vehicles : [];
  const apiRouteList: any[] = Array.isArray(apiRoutes) ? apiRoutes : [];

  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE);

  const handleCreateVehicle = async () => {
    if (!vehicleForm.number) return;
    await createVehicle.mutateAsync({ ...vehicleForm, capacity: Number(vehicleForm.capacity) });
    setVehicleForm(EMPTY_VEHICLE); setModal(false);
  };

  const activeVehicles = vehicleList.filter(v => v.status === 'ACTIVE');
  const totalStudents = vehicleList.reduce((a, v) => a + (Number(v.capacity) || 0), 0);

  return (
    <>
      <Topbar title="Vehicle Tracking" subtitle="School transport & fleet management" />
      <div className="p-6">
        <PageHeader title="Transport Management" subtitle={`${vehicleList.length} vehicles · ${apiRouteList.length} routes`}
          action={tab === 'vehicles' ? <button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Vehicle</button> : null}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Vehicles', value: vehicleList.length, icon: '🚌', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: activeVehicles.length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Routes', value: apiRouteList.length, icon: '🗺️', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Capacity', value: totalStudents, icon: '👤', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['vehicles','routes'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${tab === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>

        {tab === 'vehicles' && (
          vehiclesLoading ? <div className="text-center py-12 text-gray-400">Loading vehicles...</div>
          : vehicleList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🚌</p><p className="font-medium">No vehicles added yet</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicleList.map((vehicle: any) => (
                <div key={vehicle.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🚌</span>
                      <div>
                        <p className="font-bold text-gray-900">{vehicle.number}</p>
                        <p className="text-xs text-gray-500">{vehicle.type}</p>
                      </div>
                    </div>
                    <Badge variant={vehicle.status === 'ACTIVE' ? 'green' : 'red'}>{vehicle.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    {vehicle.driver && <p>👨‍✈️ {vehicle.driver}</p>}
                    {vehicle.phone && <p>📱 {vehicle.phone}</p>}
                    {vehicle.capacity && <p>👤 Capacity: {vehicle.capacity}</p>}
                    {vehicle.route && <p>🗺️ Route: {vehicle.route}</p>}
                  </div>
                  <button onClick={() => delVehicle.mutate(vehicle.id)} className="mt-3 w-full py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">Remove</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'routes' && (
          routesLoading ? <div className="text-center py-12 text-gray-400">Loading routes...</div>
          : apiRouteList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🗺️</p><p className="font-medium">No transport routes configured</p><p className="text-sm mt-1">Routes are managed by the transport admin</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiRouteList.map((route: any) => (
                <div key={route.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">Route: {route.name}</p>
                      <p className="text-xs text-gray-500">{route.startPoint} → {route.endPoint}</p>
                    </div>
                    <Badge variant={route.isActive ? 'green' : 'gray'}>{route.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    {route.distance && <p>📏 Distance: {route.distance} km</p>}
                    {route.estimatedDuration && <p>⏱️ Duration: {route.estimatedDuration} min</p>}
                    {route.stops?.length > 0 && <p>🛑 Stops: {route.stops.map((s: any) => s.name || s).join(' → ')}</p>}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Vehicle">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Vehicle Number *</label>
              <input value={vehicleForm.number} onChange={e => setVehicleForm({ ...vehicleForm, number: e.target.value })} placeholder="e.g. ABC-123" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['Bus','Mini Bus','Van','Car'].map(t => <option key={t}>{t}</option>)}
              </select></div>
          </div>
          {[['driver',"Driver's Name"],['phone','Driver Phone'],['capacity','Capacity (seats)'],['route','Route Name']].map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input type={k === 'capacity' ? 'number' : 'text'} value={(vehicleForm as any)[k]} onChange={e => setVehicleForm({ ...vehicleForm, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} /></div>
          ))}
          <div><label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select value={vehicleForm.status} onChange={e => setVehicleForm({ ...vehicleForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="ACTIVE">Active</option><option value="MAINTENANCE">Maintenance</option><option value="INACTIVE">Inactive</option>
            </select></div>
          <button onClick={handleCreateVehicle} disabled={createVehicle.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createVehicle.isPending ? 'Adding...' : 'Add Vehicle'}
          </button>
        </div>
      </Modal>
    </>
  );
}
