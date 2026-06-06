'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const HEALTH_RECORDS = [
  { id: 'MED-001', student: 'Ahmed Ali', class: '10-A', dob: '2009-03-15', bloodGroup: 'B+', allergies: ['Penicillin', 'Peanuts'], conditions: ['Mild Asthma'], emergencyContact: '0300-1234567', lastCheckup: 'Jan 2026', height: '5\'4"', weight: '58kg', vision: '6/6', bmi: 'Normal' },
  { id: 'MED-002', student: 'Sara Khan', class: '8-B', dob: '2011-07-22', bloodGroup: 'O+', allergies: ['Dust'], conditions: [], emergencyContact: '0321-9876543', lastCheckup: 'Feb 2026', height: '5\'1"', weight: '48kg', vision: '6/9', bmi: 'Normal' },
  { id: 'MED-003', student: 'Omar Hassan', class: '6-C', dob: '2013-11-05', bloodGroup: 'A+', allergies: [], conditions: ['Diabetes Type 1'], emergencyContact: '0311-5556666', lastCheckup: 'Mar 2026', height: '4\'8"', weight: '38kg', vision: '6/6', bmi: 'Underweight' },
  { id: 'MED-004', student: 'Bilal Qureshi', class: '9-B', dob: '2010-05-18', bloodGroup: 'AB-', allergies: ['Sulfa drugs'], conditions: ['Epilepsy'], emergencyContact: '0333-2223334', lastCheckup: 'Jan 2026', height: '5\'6"', weight: '65kg', vision: '6/12', bmi: 'Normal' },
  { id: 'MED-005', student: 'Fatima Shah', class: '12-A', dob: '2008-09-30', bloodGroup: 'B-', allergies: [], conditions: [], emergencyContact: '0345-7778889', lastCheckup: 'Apr 2026', height: '5\'2"', weight: '52kg', vision: '6/6', bmi: 'Normal' },
];

const INCIDENTS = [
  { id: 'MI-001', student: 'Ahmed Ali', class: '10-A', date: 'Jun 5, 2026', time: '10:30 AM', type: 'Asthma Attack', action: 'Inhaler given, parent notified', attendedBy: 'School Nurse', status: 'RESOLVED' },
  { id: 'MI-002', student: 'Zara Malik', class: '7-B', date: 'Jun 3, 2026', time: '1:15 PM', type: 'Fainting', action: 'Rest, glucose given, parent called', attendedBy: 'School Nurse', status: 'RESOLVED' },
  { id: 'MI-003', student: 'Ibrahim Shah', class: '9-A', date: 'Jun 1, 2026', time: '11:00 AM', type: 'Minor Injury (Sports)', action: 'First aid — bandage applied', attendedBy: 'P.E. Teacher', status: 'RESOLVED' },
  { id: 'MI-004', student: 'Omar Hassan', class: '6-C', date: 'Jun 6, 2026', time: '8:45 AM', type: 'Blood Sugar Low', action: 'Glucose monitoring, snack given', attendedBy: 'School Nurse', status: 'MONITORING' },
];

const MEDICINE_STOCK = [
  { name: 'Panadol Tablets', qty: 200, unit: 'tablets', expiry: 'Dec 2026', status: 'OK' },
  { name: 'Antiseptic Liquid', qty: 5, unit: 'bottles', expiry: 'Aug 2026', status: 'LOW' },
  { name: 'Bandages (roll)', qty: 30, unit: 'rolls', expiry: 'N/A', status: 'OK' },
  { name: 'Thermometer (digital)', qty: 3, unit: 'pieces', expiry: 'N/A', status: 'OK' },
  { name: 'Glucose Tablets', qty: 50, unit: 'tablets', expiry: 'Mar 2027', status: 'OK' },
  { name: 'Antacid Tablets', qty: 10, unit: 'strips', expiry: 'Sep 2026', status: 'LOW' },
  { name: 'ORS Packets', qty: 25, unit: 'packets', expiry: 'Jun 2027', status: 'OK' },
];

export default function MedicalPage() {
  const [view, setView] = useState<'records' | 'incidents' | 'stock' | 'reports'>('records');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<typeof HEALTH_RECORDS[0] | null>(null);
  const [addIncidentModal, setAddIncidentModal] = useState(false);

  const filtered = HEALTH_RECORDS.filter(r => !search || r.student.toLowerCase().includes(search.toLowerCase()) || r.class.toLowerCase().includes(search.toLowerCase()));
  const criticalConditions = HEALTH_RECORDS.filter(r => r.conditions.length > 0).length;

  return (
    <>
      <Topbar title="Medical Records" subtitle="Student health management & school clinic" />
      <div className="p-6">
        <PageHeader title="School Medical Center" subtitle="Health records, incidents & first aid management"
          action={
            <div className="flex gap-2">
              <button onClick={() => setAddIncidentModal(true)} className="px-3 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50">🚨 Record Incident</button>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Record</button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Health Records', value: HEALTH_RECORDS.length, icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Special Conditions', value: criticalConditions, icon: '⚠️', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Incidents (Jun)', value: INCIDENTS.length, icon: '🏥', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Pending Checkups', value: 12, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Alert: Special Conditions */}
        {criticalConditions > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-orange-800 text-sm">{criticalConditions} students have special medical conditions</p>
              <p className="text-xs text-orange-600">Ensure staff are aware: Asthma, Diabetes, Epilepsy cases are in the system</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['records', 'incidents', 'stock', 'reports'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'stock' ? 'Medicine Stock' : v === 'reports' ? 'Health Reports' : v}
            </button>
          ))}
        </div>

        {/* Health Records */}
        {view === 'records' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Student', 'Blood Group', 'Allergies', 'Medical Conditions', 'Last Checkup', 'BMI', 'Emergency Contact', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3"><p className="font-medium">{r.student}</p><p className="text-xs text-gray-400">{r.class}</p></td>
                    <td className="px-4 py-3"><Badge variant="blue">{r.bloodGroup}</Badge></td>
                    <td className="px-4 py-3">
                      {r.allergies.length === 0 ? <span className="text-xs text-gray-400">None</span> : r.allergies.map(a => <span key={a} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded mr-1">{a}</span>)}
                    </td>
                    <td className="px-4 py-3">
                      {r.conditions.length === 0 ? <span className="text-xs text-gray-400">None</span> : r.conditions.map(c => <span key={c} className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded mr-1">{c}</span>)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.lastCheckup}</td>
                    <td className="px-4 py-3"><Badge variant={r.bmi === 'Normal' ? 'green' : 'yellow'}>{r.bmi}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.emergencyContact}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedRecord(r)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Full Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Incidents */}
        {view === 'incidents' && (
          <div className="space-y-3">
            {INCIDENTS.map(i => (
              <div key={i.id} className={`bg-white rounded-xl border shadow-sm p-4 ${i.status === 'MONITORING' ? 'border-orange-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{i.type.includes('Asthma') ? '😮‍💨' : i.type.includes('Faint') ? '💫' : i.type.includes('Injury') ? '🤕' : '🩺'}</span>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{i.type}</p>
                      <p className="text-xs text-gray-400">{i.student} — {i.class}</p>
                    </div>
                  </div>
                  <Badge variant={i.status === 'RESOLVED' ? 'green' : 'orange'}>{i.status}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">Action: {i.action}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>📅 {i.date} at {i.time}</span>
                  <span>👤 {i.attendedBy}</span>
                  <span className="text-xs font-mono text-gray-300">{i.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medicine Stock */}
        {view === 'stock' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">School clinic medicine & supply inventory</p>
              <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg">+ Add Item</button>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Medicine/Supply', 'Quantity', 'Unit', 'Expiry Date', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {MEDICINE_STOCK.map(m => (
                  <tr key={m.name} className={`border-b border-gray-50 hover:bg-gray-50 text-sm ${m.status === 'LOW' ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 font-bold">{m.qty}</td>
                    <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                    <td className="px-4 py-3 text-gray-400">{m.expiry}</td>
                    <td className="px-4 py-3"><Badge variant={m.status === 'OK' ? 'green' : 'red'}>{m.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Restock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports */}
        {view === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Blood Group Distribution</h3>
              {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg, i) => {
                const cnt = [120, 95, 85, 45, 30, 22, 18, 12][i];
                return (
                  <div key={bg} className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold w-8 text-red-600">{bg}</span>
                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full"><div className="bg-red-400 h-2.5 rounded-full" style={{ width: `${(cnt / 120) * 100}%` }} /></div>
                    <span className="text-xs text-gray-500 w-8">{cnt}</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Health Condition Summary</h3>
              {[
                { condition: 'No special conditions', count: 487, color: 'bg-green-500' },
                { condition: 'Asthma', count: 23, color: 'bg-blue-400' },
                { condition: 'Allergies', count: 45, color: 'bg-yellow-400' },
                { condition: 'Diabetes', count: 8, color: 'bg-orange-400' },
                { condition: 'Epilepsy', count: 4, color: 'bg-red-400' },
                { condition: 'Other', count: 12, color: 'bg-gray-400' },
              ].map(c => (
                <div key={c.condition} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-600 flex-1">{c.condition}</span>
                  <div className="w-24 bg-gray-100 h-2 rounded-full"><div className={`${c.color} h-2 rounded-full`} style={{ width: `${(c.count / 487) * 100}%` }} /></div>
                  <span className="text-xs font-bold text-gray-600 w-8">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Student Health Profile">
        {selectedRecord && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">🩺</div>
              <div><h3 className="font-bold text-lg text-gray-900">{selectedRecord.student}</h3><p className="text-sm text-gray-500">{selectedRecord.class} · DOB: {selectedRecord.dob}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Blood Group', selectedRecord.bloodGroup],
                ['Height', selectedRecord.height],
                ['Weight', selectedRecord.weight],
                ['BMI', selectedRecord.bmi],
                ['Vision', selectedRecord.vision],
                ['Last Checkup', selectedRecord.lastCheckup],
              ].map(([k, v]) => (
                <div key={String(k)} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{k}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
            </div>
            {selectedRecord.allergies.length > 0 && (
              <div className="mt-3 bg-red-50 rounded-lg p-3">
                <p className="text-xs font-bold text-red-700 mb-1">⚠️ Allergies</p>
                <p className="text-sm text-red-600">{selectedRecord.allergies.join(', ')}</p>
              </div>
            )}
            {selectedRecord.conditions.length > 0 && (
              <div className="mt-3 bg-orange-50 rounded-lg p-3">
                <p className="text-xs font-bold text-orange-700 mb-1">⚠️ Medical Conditions</p>
                <p className="text-sm text-orange-600">{selectedRecord.conditions.join(', ')}</p>
              </div>
            )}
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Emergency Contact</p>
              <p className="font-medium text-sm">{selectedRecord.emergencyContact}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Incident Modal */}
      <Modal isOpen={addIncidentModal} onClose={() => setAddIncidentModal(false)} title="Record Medical Incident">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Student</label>
            <input type="text" placeholder="Search student..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Incident Type</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Minor Injury</option><option>Asthma Attack</option><option>Fainting</option><option>Headache</option>
              <option>Vomiting</option><option>Blood Sugar Issue</option><option>Allergic Reaction</option><option>Other</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Action Taken</label>
            <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Describe first aid / treatment given..." />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" />Parent/guardian notified</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" />Student sent home</label>
          <button className="w-full py-2 bg-red-600 text-white text-sm rounded-lg">Record Incident</button>
        </div>
      </Modal>
    </>
  );
}
