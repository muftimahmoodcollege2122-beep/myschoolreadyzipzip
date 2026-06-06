'use client';
import React, { useState, useEffect } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const VEHICLES = [
  { id: 'BUS-001', number: 'KHI-1234', type: 'School Bus', capacity: 45, students: 42, driver: 'Mr. Arif Khan', phone: '0300-1111222', route: 'Route A — Gulshan', status: 'EN_ROUTE', lastUpdate: '2 min ago', speed: 35, fuel: 78, lat: 24.8607, lng: 67.0011, odometer: 45230, nextService: 'Jun 15, 2026' },
  { id: 'BUS-002', number: 'KHI-5678', type: 'School Bus', capacity: 40, students: 38, driver: 'Mr. Saleem Akhtar', phone: '0321-3334444', route: 'Route B — Defence', status: 'ARRIVED', lastUpdate: '5 min ago', speed: 0, fuel: 45, lat: 24.8400, lng: 66.9800, odometer: 62100, nextService: 'Aug 20, 2026' },
  { id: 'VAN-001', number: 'KHI-9012', type: 'Van', capacity: 15, students: 13, driver: 'Mr. Tariq Hussain', phone: '0311-5556666', route: 'Route C — Clifton', status: 'EN_ROUTE', lastUpdate: '1 min ago', speed: 42, fuel: 62, lat: 24.8200, lng: 66.9900, odometer: 28900, nextService: 'Jul 10, 2026' },
  { id: 'BUS-003', number: 'KHI-3456', type: 'School Bus', capacity: 50, students: 47, driver: 'Mr. Khalid Mehmood', phone: '0333-7778888', route: 'Route D — North Nazimabad', status: 'EN_ROUTE', lastUpdate: '3 min ago', speed: 28, fuel: 55, lat: 24.9100, lng: 67.0500, odometer: 78450, nextService: 'Sep 5, 2026' },
  { id: 'BUS-004', number: 'KHI-7890', type: 'School Bus', capacity: 45, students: 40, driver: 'Mr. Rafique Ali', phone: '0345-9990001', route: 'Route E — PECHS', status: 'IDLE', lastUpdate: '15 min ago', speed: 0, fuel: 90, lat: 24.8700, lng: 67.0200, odometer: 35600, nextService: 'Oct 1, 2026' },
  { id: 'VAN-002', number: 'KHI-2345', type: 'Van', capacity: 12, students: 10, driver: 'Mr. Imran Shah', phone: '0312-4445556', route: 'Route F — Bahadurabad', status: 'MAINTENANCE', lastUpdate: '2 hours ago', speed: 0, fuel: 30, lat: 24.8750, lng: 67.0100, odometer: 52300, nextService: 'Jun 7, 2026' },
];

const STATUS_COLOR: Record<string, string> = { EN_ROUTE: 'green', ARRIVED: 'blue', IDLE: 'yellow', MAINTENANCE: 'red' };
const STATUS_ICON: Record<string, string> = { EN_ROUTE: '🚌', ARRIVED: '✅', IDLE: '⏸️', MAINTENANCE: '🔧' };

export default function VehicleTrackingPage() {
  const [selected, setSelected] = useState<typeof VEHICLES[0] | null>(null);
  const [view, setView] = useState<'live' | 'fleet' | 'routes' | 'maintenance'>('live');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const enRoute = VEHICLES.filter(v => v.status === 'EN_ROUTE').length;
  const totalStudents = VEHICLES.filter(v => v.status !== 'MAINTENANCE').reduce((a, v) => a + v.students, 0);

  return (
    <>
      <Topbar title="Vehicle Tracking" subtitle="Real-time fleet monitoring & route management" />
      <div className="p-6">
        <PageHeader title="Live Vehicle Tracking" subtitle={`${enRoute} buses en route · ${totalStudents} students in transit`}
          action={
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Tracking Active
              </div>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Vehicles', value: VEHICLES.length, icon: '🚌', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'En Route', value: enRoute, icon: '▶️', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Students in Transit', value: totalStudents, icon: '👩‍🎓', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'In Maintenance', value: VEHICLES.filter(v => v.status === 'MAINTENANCE').length, icon: '🔧', color: 'text-red-600', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['live', 'fleet', 'routes', 'maintenance'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'live' ? '🔴 Live Map' : v === 'fleet' ? 'Fleet' : v === 'routes' ? 'Routes' : 'Maintenance'}
            </button>
          ))}
        </div>

        {/* Live View */}
        {view === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulated Map */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-96 relative" style={{ background: 'linear-gradient(135deg, #e8f4e8, #d4edda)' }}>
                {/* Grid pattern to simulate map */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c8e6c9" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Simulated roads */}
                  <line x1="0" y1="192" x2="800" y2="192" stroke="#b0bec5" strokeWidth="4" />
                  <line x1="0" y1="288" x2="800" y2="288" stroke="#b0bec5" strokeWidth="4" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#b0bec5" strokeWidth="4" />
                  <line x1="500" y1="0" x2="500" y2="400" stroke="#b0bec5" strokeWidth="3" />
                  {/* School marker */}
                  <circle cx="350" cy="200" r="12" fill="#1e40af" />
                  <text x="350" y="205" textAnchor="middle" fill="white" fontSize="10">🏫</text>
                </svg>
                {/* Vehicle markers */}
                {VEHICLES.filter(v => v.status !== 'MAINTENANCE').map((v, i) => {
                  const x = 100 + (i * 120) % 600;
                  const y = 80 + Math.sin(i * 1.2) * 60 + (tick % 5) * 2;
                  return (
                    <div key={v.id} onClick={() => setSelected(v)} style={{ position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)', cursor: 'pointer' }}
                      className={`transition-all ${selected?.id === v.id ? 'scale-125' : 'hover:scale-110'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 ${v.status === 'EN_ROUTE' ? 'bg-green-500 border-green-600' : v.status === 'ARRIVED' ? 'bg-blue-500 border-blue-600' : 'bg-yellow-400 border-yellow-500'}`}>
                        🚌
                      </div>
                      {selected?.id === v.id && (
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-2 w-40 z-10 text-xs">
                          <p className="font-bold text-gray-800">{v.id}</p>
                          <p className="text-gray-500">{v.route}</p>
                          <p className="text-green-600">{v.speed} km/h</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="absolute top-2 left-2 bg-white rounded-lg px-2 py-1 text-xs text-gray-500 shadow">
                  🔴 Live · Updated {tick * 5}s ago
                </div>
              </div>
            </div>

            {/* Vehicle List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-auto max-h-96">
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-600">ALL VEHICLES</p>
              </div>
              {VEHICLES.map(v => (
                <div key={v.id} onClick={() => setSelected(v)}
                  className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-all ${selected?.id === v.id ? 'bg-green-50 border-green-100' : ''}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{STATUS_ICON[v.status]}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{v.id}</p>
                        <p className="text-xs text-gray-400">{v.number}</p>
                      </div>
                    </div>
                    <Badge variant={STATUS_COLOR[v.status] as any}>{v.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{v.route}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>👤 {v.students}/{v.capacity}</span>
                    {v.status === 'EN_ROUTE' && <span>⚡ {v.speed} km/h</span>}
                    <span>⛽ {v.fuel}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fleet View */}
        {view === 'fleet' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Vehicle', 'Number', 'Type', 'Driver', 'Route', 'Students', 'Fuel', 'Odometer', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {VEHICLES.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{v.id}</td>
                    <td className="px-4 py-3 text-gray-600">{v.number}</td>
                    <td className="px-4 py-3 text-gray-500">{v.type}</td>
                    <td className="px-4 py-3"><p className="text-xs font-medium">{v.driver}</p><p className="text-xs text-gray-400">{v.phone}</p></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{v.route}</td>
                    <td className="px-4 py-3 font-bold">{v.students}/{v.capacity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-12 bg-gray-100 h-2 rounded-full"><div className={`h-2 rounded-full ${v.fuel > 60 ? 'bg-green-500' : v.fuel > 30 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${v.fuel}%` }} /></div>
                        <span className="text-xs">{v.fuel}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{v.odometer.toLocaleString()} km</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_COLOR[v.status] as any}>{v.status.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(v)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Track</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Routes View */}
        {view === 'routes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VEHICLES.map(v => (
              <div key={v.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚌</span>
                    <div><p className="font-bold text-sm text-gray-800">{v.route}</p><p className="text-xs text-gray-400">{v.id} · {v.number}</p></div>
                  </div>
                  <Badge variant={STATUS_COLOR[v.status] as any}>{v.status.replace('_', ' ')}</Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  <p>👤 Driver: {v.driver}</p>
                  <p>📱 {v.phone}</p>
                  <p>👩‍🎓 {v.students} students assigned</p>
                  <p>⏱️ Last update: {v.lastUpdate}</p>
                </div>
                {/* Simulated stops */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600">Route Stops:</p>
                  {['School Pickup (7:15 AM)', 'Stop 1 — Main Blvd', 'Stop 2 — Market Rd', 'Stop 3 — Residential', 'Terminal Drop-off'].map((stop, i, arr) => (
                    <div key={stop} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i === 0 ? 'bg-blue-500' : i === arr.length - 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Maintenance */}
        {view === 'maintenance' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Maintenance Schedule</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Vehicle', 'Number', 'Odometer', 'Next Service', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {VEHICLES.map(v => {
                  const overdue = v.status === 'MAINTENANCE';
                  const soon = v.nextService && new Date(v.nextService) < new Date(Date.now() + 14 * 24 * 3600 * 1000);
                  return (
                    <tr key={v.id} className={`border-b border-gray-50 hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 font-bold text-xs">{v.id}</td>
                      <td className="px-4 py-3 text-gray-600">{v.number}</td>
                      <td className="px-4 py-3 text-gray-500">{v.odometer.toLocaleString()} km</td>
                      <td className="px-4 py-3"><p className={`font-medium ${overdue ? 'text-red-600' : soon ? 'text-orange-600' : 'text-gray-700'}`}>{v.nextService}</p></td>
                      <td className="px-4 py-3"><Badge variant={overdue ? 'red' : soon ? 'yellow' : 'green'}>{overdue ? 'In Service' : soon ? 'Due Soon' : 'OK'}</Badge></td>
                      <td className="px-4 py-3">
                        <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Schedule</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.id} — ${selected.number}` : ''}>
        {selected && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{STATUS_ICON[selected.status]}</span>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selected.route}</h3>
                <p className="text-sm text-gray-500">{selected.type} · Capacity: {selected.capacity}</p>
              </div>
              <Badge variant={STATUS_COLOR[selected.status] as any}>{selected.status.replace('_', ' ')}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              {[['Driver', selected.driver], ['Contact', selected.phone], ['Students', `${selected.students}/${selected.capacity}`], ['Speed', `${selected.speed} km/h`], ['Fuel', `${selected.fuel}%`], ['Last Update', selected.lastUpdate]].map(([k, v]) => (
                <div key={String(k)} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{k}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg">📱 Call Driver</button>
              <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">📍 Track Live</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
