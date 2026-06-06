'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const CERT_TYPES = [
  { id: 1, name: 'Character Certificate', icon: '📜', desc: 'Good character & conduct certificate for students', fields: ['Student Name', 'Class', 'Duration', 'Character Statement'], count: 145 },
  { id: 2, name: 'Bonafide Certificate', icon: '🎓', desc: 'Confirms student is currently enrolled', fields: ['Student Name', 'Class', 'Roll No', 'Academic Year'], count: 89 },
  { id: 3, name: 'Transfer Certificate (TC)', icon: '📋', desc: 'For students transferring to another school', fields: ['Student Name', 'Class', 'Leaving Date', 'Reason', 'Dues Clearance'], count: 23 },
  { id: 4, name: 'Mark Sheet / Result Card', icon: '📊', desc: 'Official examination result statement', fields: ['Student', 'Subjects', 'Marks', 'Grade', 'Remarks'], count: 312 },
  { id: 5, name: 'Experience Certificate', icon: '💼', desc: 'For teaching staff leaving the school', fields: ['Employee Name', 'Designation', 'Duration', 'Performance'], count: 8 },
  { id: 6, name: 'Merit Certificate', icon: '🏆', desc: 'Academic achievement recognition certificate', fields: ['Student Name', 'Achievement', 'Class', 'Position'], count: 56 },
  { id: 7, name: 'Sports Certificate', icon: '⚽', desc: 'Recognition for sports achievement', fields: ['Student Name', 'Sport', 'Achievement', 'Event'], count: 34 },
  { id: 8, name: 'Leaving Certificate', icon: '🚪', desc: 'Official school leaving document', fields: ['Student', 'Last Class', 'Date', 'Dues Clearance'], count: 12 },
  { id: 9, name: 'No Dues Certificate', icon: '✅', desc: 'Confirms all dues are cleared', fields: ['Student/Staff', 'Library', 'Fees', 'Sports'], count: 67 },
  { id: 10, name: 'Participation Certificate', icon: '🎖️', desc: 'For events, competitions, workshops', fields: ['Name', 'Event', 'Date', 'Role'], count: 234 },
  { id: 11, name: 'Award Letter', icon: '🌟', desc: 'Scholarship or bursary award letter', fields: ['Student', 'Award Type', 'Amount', 'Conditions'], count: 18 },
  { id: 12, name: 'ID Card', icon: '🪪', desc: 'Student or staff photo ID card', fields: ['Photo', 'Name', 'Class/Dept', 'ID Number'], count: 660 },
];

const ISSUED = [
  { id: 'CERT-001', type: 'Character Certificate', student: 'Ahmed Ali', class: '10-A', date: 'Jun 5, 2026', issuedBy: 'Admin', status: 'ISSUED' },
  { id: 'CERT-002', type: 'Transfer Certificate', student: 'Sara Malik', class: '8-B', date: 'Jun 3, 2026', issuedBy: 'Admin', status: 'ISSUED' },
  { id: 'CERT-003', type: 'Bonafide Certificate', student: 'Omar Hassan', class: '11-A', date: 'Jun 1, 2026', issuedBy: 'Admin', status: 'ISSUED' },
  { id: 'CERT-004', type: 'Merit Certificate', student: 'Bilal Khan', class: '9-C', date: 'May 28, 2026', issuedBy: 'Admin', status: 'ISSUED' },
  { id: 'CERT-005', type: 'No Dues Certificate', student: 'Zara Shah', class: '12-A', date: 'May 25, 2026', issuedBy: 'Admin', status: 'PENDING' },
];

export default function CertificatesPage() {
  const [view, setView] = useState<'types' | 'issued' | 'generate'>('types');
  const [selectedType, setSelectedType] = useState<typeof CERT_TYPES[0] | null>(null);
  const [generateModal, setGenerateModal] = useState(false);
  const [previewModal, setPreviewModal] = useState<typeof ISSUED[0] | null>(null);
  const [form, setForm] = useState({ student: '', class: '', reason: '', date: '' });
  const [search, setSearch] = useState('');

  const filtered = ISSUED.filter(c => !search || c.student.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Topbar title="Certificates" subtitle="Generate & manage official school documents" />
      <div className="p-6">
        <PageHeader title="Certificate Management" subtitle={`${CERT_TYPES.reduce((a, c) => a + c.count, 0)} certificates issued this year`}
          action={
            <button onClick={() => setGenerateModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">
              + Generate Certificate
            </button>
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['types', 'issued', 'generate'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v === 'types' ? 'Certificate Types' : v === 'issued' ? 'Issued Log' : 'Bulk Generate'}
            </button>
          ))}
        </div>

        {/* Types */}
        {view === 'types' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CERT_TYPES.map(ct => (
              <div key={ct.id} onClick={() => { setSelectedType(ct); setGenerateModal(true); }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:border-green-300 hover:shadow-md transition-all">
                <div className="text-2xl mb-2">{ct.icon}</div>
                <h3 className="font-bold text-sm text-gray-800 mb-1">{ct.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{ct.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-bold">{ct.count} issued</span>
                  <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100">Generate →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Issued */}
        {view === 'issued' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex gap-3">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or type..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⬇ Export</button>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Cert #', 'Type', 'Student', 'Class', 'Date', 'Issued By', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.type}</td>
                    <td className="px-4 py-3">{c.student}</td>
                    <td className="px-4 py-3 text-gray-500">{c.class}</td>
                    <td className="px-4 py-3 text-gray-500">{c.date}</td>
                    <td className="px-4 py-3 text-gray-500">{c.issuedBy}</td>
                    <td className="px-4 py-3"><Badge variant={c.status === 'ISSUED' ? 'green' : 'yellow'}>{c.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setPreviewModal(c)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Preview</button>
                        <button className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">🖨</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bulk Generate */}
        {view === 'generate' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Bulk Certificate Generation</h3>
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 mb-1 block">Certificate Type</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    {CERT_TYPES.map(ct => <option key={ct.id}>{ct.name}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">For</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>All Students</option><option>By Class</option><option>Selected Students</option>
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Class (if applicable)</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>All Classes</option><option>Class 10</option><option>Class 12</option>
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">Date of Issue</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">Generate All</button>
                  <button className="px-4 py-2 border border-gray-200 text-sm rounded-lg">Preview</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Certificate Templates</h3>
              {['Classic (Navy & Gold)', 'Modern (Green)', 'Minimal (Black & White)', 'Decorative (Maroon)'].map(t => (
                <div key={t} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg mb-2 hover:border-green-300 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded" />
                    <span className="text-sm text-gray-700">{t}</span>
                  </div>
                  <button className="text-xs text-blue-600">Use</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <Modal isOpen={generateModal} onClose={() => { setGenerateModal(false); setSelectedType(null); }} title={selectedType ? `Generate: ${selectedType.name}` : 'Generate Certificate'}>
        <div className="p-6 space-y-4">
          {!selectedType && (
            <div><label className="text-xs text-gray-500 mb-1 block">Certificate Type</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" onChange={e => setSelectedType(CERT_TYPES.find(ct => ct.name === e.target.value) || null)}>
                <option value="">Select type...</option>
                {CERT_TYPES.map(ct => <option key={ct.id}>{ct.name}</option>)}
              </select>
            </div>
          )}
          <div><label className="text-xs text-gray-500 mb-1 block">Student Name</label>
            <input type="text" placeholder="Search student..." value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Class</label>
            <input type="text" placeholder="e.g. Class 10-A" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Date of Issue</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Additional Notes (optional)</label>
            <textarea rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Any special notes..." />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">Generate & Print</button>
            <button className="px-4 py-2 border border-gray-200 text-sm rounded-lg">Preview PDF</button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={!!previewModal} onClose={() => setPreviewModal(null)} title="Certificate Preview">
        {previewModal && (
          <div className="p-6">
            <div className="border-4 border-yellow-400 rounded-2xl p-8 text-center bg-gradient-to-b from-white to-yellow-50">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">MySchool</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{previewModal.type}</h2>
              <p className="text-sm text-gray-600 mb-2">This is to certify that</p>
              <p className="text-xl font-bold text-gray-900 mb-2">{previewModal.student}</p>
              <p className="text-sm text-gray-600 mb-2">of {previewModal.class} has demonstrated good character and conduct during their enrollment at this institution.</p>
              <p className="text-sm text-gray-400 mt-6">Date: {previewModal.date}</p>
              <div className="mt-8 flex justify-between px-8">
                <div className="text-center"><div className="border-t border-gray-400 w-24 mx-auto pt-1"><p className="text-xs text-gray-500">Class Teacher</p></div></div>
                <div className="text-center"><div className="border-t border-gray-400 w-24 mx-auto pt-1"><p className="text-xs text-gray-500">Principal</p></div></div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg">🖨 Print</button>
              <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">⬇ Download PDF</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
