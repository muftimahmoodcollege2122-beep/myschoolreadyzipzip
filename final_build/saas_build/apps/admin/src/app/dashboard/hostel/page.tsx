'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '../../../hooks/use-api';

const EMPTY_ROOM = { roomNo: '', floor: '1', type: 'Double', capacity: '2', occupied: '0', status: 'AVAILABLE' };
const EMPTY_RESIDENT = { studentName: '', rollNo: '', roomNo: '', fromDate: new Date().toISOString().split('T')[0], toDate: '', feePerMonth: '', status: 'ACTIVE' };

export default function HostelPage() {
  const [tab, setTab] = useState<'rooms' | 'residents'>('rooms');
  const [modal, setModal] = useState(false);

  const { data: rooms = [], isLoading: roomsLoading } = useSchoolSection('hostelRooms');
  const { data: residents = [], isLoading: resLoading } = useSchoolSection('hostelResidents');
  const createRoom = useCreateSchoolItem('hostelRooms');
  const createResident = useCreateSchoolItem('hostelResidents');
  const delRoom = useDeleteSchoolItem('hostelRooms');
  const delResident = useDeleteSchoolItem('hostelResidents');

  const roomList: any[] = Array.isArray(rooms) ? rooms : [];
  const residentList: any[] = Array.isArray(residents) ? residents : [];

  const [roomForm, setRoomForm] = useState(EMPTY_ROOM);
  const [residentForm, setResidentForm] = useState(EMPTY_RESIDENT);

  const totalCapacity = roomList.reduce((a, r) => a + (Number(r.capacity) || 0), 0);
  const totalOccupied = roomList.reduce((a, r) => a + (Number(r.occupied) || 0), 0);

  const handleCreateRoom = async () => {
    if (!roomForm.roomNo) return;
    await createRoom.mutateAsync({ ...roomForm, capacity: Number(roomForm.capacity), occupied: Number(roomForm.occupied) });
    setRoomForm(EMPTY_ROOM); setModal(false);
  };

  const handleCreateResident = async () => {
    if (!residentForm.studentName) return;
    await createResident.mutateAsync({ ...residentForm, feePerMonth: Number(residentForm.feePerMonth) });
    setResidentForm(EMPTY_RESIDENT); setModal(false);
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <>
      <Topbar title="Hostel" subtitle="School hostel & boarding management" />
      <div className="p-6">
        <PageHeader title="Hostel Management" subtitle={`${totalOccupied}/${totalCapacity} beds occupied`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">{tab === 'rooms' ? '+ Add Room' : '+ Add Resident'}</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Rooms', value: roomList.length, icon: '🏠', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Capacity', value: totalCapacity, icon: '🛏️', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Occupied', value: totalOccupied, icon: '👤', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Available', value: totalCapacity - totalOccupied, icon: '✅', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['rooms','residents'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${tab === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>

        {tab === 'rooms' && (
          roomsLoading ? <div className="text-center py-12 text-gray-400">Loading rooms...</div>
          : roomList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🏠</p><p className="font-medium">No rooms added yet</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomList.map((room: any) => (
                <div key={room.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Room {room.roomNo}</p>
                      <p className="text-xs text-gray-400">Floor {room.floor} · {room.type}</p>
                    </div>
                    <Badge variant={room.status === 'AVAILABLE' ? 'green' : room.status === 'FULL' ? 'red' : 'yellow'}>{room.status}</Badge>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Occupancy</span><span>{room.occupied || 0}/{room.capacity}</span></div>
                    <div className="bg-gray-100 h-2 rounded-full">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${room.capacity ? Math.min(100, ((Number(room.occupied)||0) / Number(room.capacity)) * 100) : 0}%` }} />
                    </div>
                  </div>
                  <button onClick={() => delRoom.mutate(room.id)} className="w-full py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">Remove Room</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'residents' && (
          resLoading ? <div className="text-center py-12 text-gray-400">Loading residents...</div>
          : residentList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">👤</p><p className="font-medium">No hostel residents yet</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Room</th>
                  <th className="px-4 py-3 text-left">From</th><th className="px-4 py-3 text-right">Fee/Month</th>
                  <th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Action</th>
                </tr></thead>
                <tbody>
                  {residentList.map((r: any) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.studentName}</td>
                      <td className="px-4 py-3 text-gray-500">Room {r.roomNo}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(r.fromDate)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-700">Rs {Number(r.feePerMonth||0).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={r.status === 'ACTIVE' ? 'green' : 'gray'}>{r.status}</Badge></td>
                      <td className="px-4 py-3"><button onClick={() => delResident.mutate(r.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={tab === 'rooms' ? 'Add Room' : 'Add Resident'}>
        {tab === 'rooms' ? (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Room No. *</label>
                <input value={roomForm.roomNo} onChange={e => setRoomForm({ ...roomForm, roomNo: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="e.g. 101" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Floor</label>
                <input type="number" value={roomForm.floor} onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Room Type</label>
                <select value={roomForm.type} onChange={e => setRoomForm({ ...roomForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  {['Single','Double','Triple','Dormitory'].map(t => <option key={t}>{t}</option>)}
                </select></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Capacity</label>
                <input type="number" value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select value={roomForm.status} onChange={e => setRoomForm({ ...roomForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="AVAILABLE">Available</option><option value="FULL">Full</option><option value="MAINTENANCE">Maintenance</option>
              </select></div>
            <button onClick={handleCreateRoom} disabled={createRoom.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">{createRoom.isPending ? 'Adding...' : 'Add Room'}</button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {[['studentName','Student Name *'],['rollNo','Roll No.'],['roomNo','Room No. *'],['feePerMonth','Fee Per Month (Rs)']].map(([k,label]) => (
              <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input type={k === 'feePerMonth' ? 'number' : 'text'} value={(residentForm as any)[k]} onChange={e => setResidentForm({ ...residentForm, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} /></div>
            ))}
            <div><label className="text-xs text-gray-500 mb-1 block">Check-in Date</label>
              <input type="date" value={residentForm.fromDate} onChange={e => setResidentForm({ ...residentForm, fromDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <button onClick={handleCreateResident} disabled={createResident.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">{createResident.isPending ? 'Adding...' : 'Add Resident'}</button>
          </div>
        )}
      </Modal>
    </>
  );
}
