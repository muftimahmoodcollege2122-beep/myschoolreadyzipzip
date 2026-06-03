'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const ROOMS = [
  { id:'H-101', type:'Double', floor:1, capacity:2, occupied:2, students:['Ahmed Ali','Omar Khan'], fee:8000, status:'FULL' },
  { id:'H-102', type:'Single', floor:1, capacity:1, occupied:0, students:[], fee:12000, status:'VACANT' },
  { id:'H-103', type:'Quad', floor:1, capacity:4, occupied:3, students:['Bilal Shah','Zain Malik','Hassan Ali'], fee:5500, status:'PARTIAL' },
  { id:'H-201', type:'Double', floor:2, capacity:2, occupied:2, students:['Sara Khan','Nadia Malik'], fee:8000, status:'FULL' },
  { id:'H-202', type:'Triple', floor:2, capacity:3, occupied:1, students:['Fatima Shah'], fee:7000, status:'PARTIAL' },
  { id:'H-203', type:'Single', floor:2, capacity:1, occupied:1, students:['Ayesha Rehman'], fee:12000, status:'FULL' },
  { id:'H-204', type:'Quad', floor:2, capacity:4, occupied:0, students:[], fee:5500, status:'VACANT' },
  { id:'H-301', type:'Double', floor:3, capacity:2, occupied:2, students:['Ibrahim Khan','Ali Hassan'], fee:8000, status:'FULL' },
];
const EXPENSES = [
  { desc:'Electricity Bill — May 2026', amount:45000, date:'Jun 1', category:'Utilities', status:'PAID' },
  { desc:'Water & Sewage — May 2026', amount:8000, date:'Jun 1', category:'Utilities', status:'PAID' },
  { desc:'Meals & Catering — Jun Week 1', amount:120000, date:'Jun 7', category:'Meals', status:'PENDING' },
  { desc:'Laundry Service', amount:15000, date:'Jun 5', category:'Services', status:'PAID' },
  { desc:'Maintenance — Plumbing Floor 2', amount:12000, date:'Jun 3', category:'Maintenance', status:'PAID' },
  { desc:'Security Staff Salary', amount:60000, date:'Jun 1', category:'Salaries', status:'PAID' },
];

export default function HostelPage() {
  const [view, setView] = useState<'rooms'|'students'|'expenses'|'maintenance'>('rooms');
  const [addModal, setAddModal] = useState(false);
  const [floor, setFloor] = useState('');

  const floors = [...new Set(ROOMS.map(r=>r.floor))];
  const filtered = floor ? ROOMS.filter(r=>r.floor===Number(floor)) : ROOMS;
  const totalOccupied = ROOMS.reduce((a,r)=>a+r.occupied,0);
  const totalCapacity = ROOMS.reduce((a,r)=>a+r.capacity,0);
  const totalFee = ROOMS.filter(r=>r.occupied>0).reduce((a,r)=>a+r.fee*r.occupied,0);

  return (
    <>
      <Topbar title="Hostel" subtitle="Hostel management system" />
      <div className="p-6">
        <PageHeader
          title="Hostel Management"
          subtitle={`${ROOMS.length} rooms · ${totalOccupied}/${totalCapacity} occupancy`}
          action={<button onClick={()=>setAddModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500">+ Allocate Room</button>}
        />

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Rooms', value:ROOMS.length, icon:'🏠', bg:'bg-blue-50 text-blue-600' },
            { label:'Occupancy Rate', value:`${Math.round((totalOccupied/totalCapacity)*100)}%`, icon:'👥', bg:'bg-green-50 text-green-600' },
            { label:'Vacant Rooms', value:ROOMS.filter(r=>r.status==='VACANT').length, icon:'🔓', bg:'bg-yellow-50 text-yellow-600' },
            { label:'Monthly Revenue', value:`Rs. ${(totalFee/1000).toFixed(0)}K`, icon:'💰', bg:'bg-purple-50 text-purple-600' },
          ].map(k=>(
            <div key={k.label} className={`${k.bg.split(' ')[0]} rounded-2xl p-4 flex items-center gap-3`}>
              <span className="text-3xl">{k.icon}</span>
              <div><p className={`text-3xl font-black ${k.bg.split(' ')[1]}`}>{k.value}</p><p className="text-xs text-gray-500">{k.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['rooms','students','expenses','maintenance'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {v==='rooms'?'🏠 Rooms':v==='students'?'👩‍🎓 Students':v==='expenses'?'💰 Expenses':'🔧 Maintenance'}
            </button>
          ))}
        </div>

        {view === 'rooms' && (
          <>
            <div className="flex gap-3 mb-4">
              <select value={floor} onChange={e=>setFloor(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                <option value="">All Floors</option>
                {floors.map(f=><option key={f} value={f}>Floor {f}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.map(r=>(
                <div key={r.id} className={`bg-white rounded-2xl border-2 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer ${r.status==='FULL'?'border-green-200':r.status==='VACANT'?'border-gray-200':'border-yellow-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-black text-gray-900 text-lg">{r.id}</p>
                      <p className="text-xs text-gray-400">Floor {r.floor} · {r.type}</p>
                    </div>
                    <Badge variant={r.status==='FULL'?'green':r.status==='VACANT'?'gray':'yellow'}>{r.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1 my-2">
                    {Array.from({length:r.capacity},(_, i)=>(
                      <div key={i} className={`flex-1 h-6 rounded-md flex items-center justify-center text-xs font-bold ${i<r.occupied?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>
                        {i<r.occupied?'👤':'—'}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{r.occupied}/{r.capacity} occupied</p>
                  <p className="text-xs font-bold text-gray-700 mt-1">Rs. {r.fee.toLocaleString()}/mo/bed</p>
                  {r.students.length>0&&(
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {r.students.map((s,i)=><p key={i} className="text-xs text-gray-500 truncate">• {s}</p>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'students' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">Hostel Students</h3></div>
            <div className="divide-y divide-gray-50">
              {ROOMS.flatMap(r=>r.students.map(s=>({name:s,room:r.id,type:r.type,fee:r.fee,floor:r.floor}))).map((s,i)=>(
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center font-bold text-green-700 text-sm">{s.name[0]}</div>
                    <div><p className="font-semibold text-sm text-gray-900">{s.name}</p><p className="text-xs text-gray-400">Floor {s.floor} · {s.type}</p></div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center"><p className="font-bold text-gray-900 text-sm">{s.room}</p><p className="text-xs text-gray-400">Room</p></div>
                    <div className="text-center"><p className="font-mono text-sm font-bold text-gray-900">Rs. {s.fee.toLocaleString()}</p><p className="text-xs text-gray-400">/month</p></div>
                    <Badge variant="green">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'expenses' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {['Utilities','Meals','Maintenance'].map(cat=>{
                const total=EXPENSES.filter(e=>e.category===cat).reduce((a,e)=>a+e.amount,0);
                return <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"><p className="text-xs text-gray-500 uppercase font-bold">{cat}</p><p className="text-2xl font-black text-gray-900 mt-1">Rs. {total.toLocaleString()}</p></div>;
              })}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between">
                <h3 className="font-bold text-gray-900">Monthly Expenses</h3>
                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">+ Add Expense</button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50"><tr>{['Description','Category','Date','Amount','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {EXPENSES.map((e,i)=>(
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.desc}</td>
                      <td className="px-4 py-3"><Badge variant="blue">{e.category}</Badge></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{e.date}</td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-gray-900">Rs. {e.amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={e.status==='PAID'?'green':'yellow'}>{e.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'maintenance' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { title:'Plumbing Issue — Floor 2', room:'H-201, H-202', priority:'HIGH', status:'IN PROGRESS', date:'Jun 3, 2026', worker:'Ali Plumber' },
              { title:'AC Servicing — Floor 1', room:'All F1 Rooms', priority:'MEDIUM', status:'SCHEDULED', date:'Jun 10, 2026', worker:'CoolTech Services' },
              { title:'Painting — Corridor', room:'Floor 3', priority:'LOW', status:'PENDING', date:'Jun 15, 2026', worker:'TBD' },
              { title:'Electrical Wiring Check', room:'H-301, H-302', priority:'HIGH', status:'COMPLETED', date:'Jun 1, 2026', worker:'Volt Electric Co' },
            ].map((m,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">{m.title}</h3>
                  <Badge variant={m.priority==='HIGH'?'red':m.priority==='MEDIUM'?'yellow':'blue'}>{m.priority}</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <p>🏠 {m.room}</p>
                  <p>👷 {m.worker}</p>
                  <p>📅 {m.date}</p>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <Badge variant={m.status==='COMPLETED'?'green':m.status==='IN PROGRESS'?'blue':'yellow'}>{m.status}</Badge>
                  <button className="text-xs text-gray-400 hover:text-blue-600">Update →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={addModal} onClose={()=>setAddModal(false)} title="Allocate Room">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student Name *</label>
            <input placeholder="Search student..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Room *</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
              <option value="">Select available room</option>
              {ROOMS.filter(r=>r.status!=='FULL').map(r=><option key={r.id} value={r.id}>{r.id} — Floor {r.floor} · {r.type} ({r.capacity-r.occupied} beds available) — Rs. {r.fee.toLocaleString()}/mo</option>)}
            </select></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Move-in Date</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
          <button onClick={()=>setAddModal(false)} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500">Allocate Room</button>
        </div>
      </Modal>
    </>
  );
}
