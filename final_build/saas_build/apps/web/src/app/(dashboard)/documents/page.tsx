'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const DOCUMENTS = [
  { id: 'DOC-001', name: 'School Constitution & Charter', category: 'Legal', size: '2.4 MB', type: 'PDF', uploadedBy: 'Admin', date: 'Jan 15, 2026', access: 'ADMIN_ONLY', downloads: 12 },
  { id: 'DOC-002', name: 'Academic Policy 2025-26', category: 'Policy', size: '1.8 MB', type: 'PDF', uploadedBy: 'Admin', date: 'Apr 1, 2026', access: 'ALL_STAFF', downloads: 89 },
  { id: 'DOC-003', name: 'Student Code of Conduct', category: 'Policy', size: '890 KB', type: 'PDF', uploadedBy: 'Admin', date: 'Apr 1, 2026', access: 'PUBLIC', downloads: 245 },
  { id: 'DOC-004', name: 'Fee Structure 2025-26', category: 'Finance', size: '450 KB', type: 'PDF', uploadedBy: 'Accountant', date: 'Apr 1, 2026', access: 'PUBLIC', downloads: 312 },
  { id: 'DOC-005', name: 'Teacher Handbook', category: 'HR', size: '3.2 MB', type: 'PDF', uploadedBy: 'HR Admin', date: 'Mar 20, 2026', access: 'TEACHERS', downloads: 45 },
  { id: 'DOC-006', name: 'Emergency Evacuation Plan', category: 'Safety', size: '1.1 MB', type: 'PDF', uploadedBy: 'Admin', date: 'Feb 10, 2026', access: 'ALL_STAFF', downloads: 67 },
  { id: 'DOC-007', name: 'Annual Audit Report 2024-25', category: 'Finance', size: '4.5 MB', type: 'PDF', uploadedBy: 'Auditor', date: 'Nov 30, 2025', access: 'ADMIN_ONLY', downloads: 8 },
  { id: 'DOC-008', name: 'Curriculum Framework 2026', category: 'Academic', size: '2.9 MB', type: 'DOCX', uploadedBy: 'Principal', date: 'Mar 15, 2026', access: 'TEACHERS', downloads: 78 },
  { id: 'DOC-009', name: 'Health & Safety Manual', category: 'Safety', size: '1.6 MB', type: 'PDF', uploadedBy: 'Admin', date: 'Jan 20, 2026', access: 'ALL_STAFF', downloads: 55 },
  { id: 'DOC-010', name: 'Sports Fixtures 2026', category: 'Sports', size: '320 KB', type: 'XLSX', uploadedBy: 'Sports Coach', date: 'Apr 5, 2026', access: 'PUBLIC', downloads: 134 },
];

const ACCESS_COLOR: Record<string, string> = {
  PUBLIC: 'green', ALL_STAFF: 'blue', TEACHERS: 'purple', ADMIN_ONLY: 'red',
};

const CATEGORIES = ['All', 'Policy', 'Legal', 'Finance', 'HR', 'Academic', 'Safety', 'Sports'];

export default function DocumentsPage() {
  const [view, setView] = useState<'all' | 'upload' | 'shared'>('all');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<typeof DOCUMENTS[0] | null>(null);

  const filtered = DOCUMENTS.filter(d =>
    (category === 'All' || d.category === category) &&
    (!search || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSize = '28.6 MB';

  return (
    <>
      <Topbar title="Documents" subtitle="Centralized document management & sharing" />
      <div className="p-6">
        <PageHeader title="Document Repository" subtitle={`${DOCUMENTS.length} documents · ${totalSize} total storage`}
          action={
            <div className="flex gap-2">
              <button onClick={() => setUploadModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">⬆ Upload Document</button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Documents', value: DOCUMENTS.length, icon: '📄', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Downloads', value: DOCUMENTS.reduce((a, d) => a + d.downloads, 0), icon: '⬇', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Public Docs', value: DOCUMENTS.filter(d => d.access === 'PUBLIC').length, icon: '🌐', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Storage Used', value: totalSize, icon: '💾', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Document Grid */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Sort: Recent</option><option>Sort: Name</option><option>Sort: Size</option><option>Sort: Downloads</option>
            </select>
          </div>
          <table className="w-full">
            <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
              {['Document', 'Category', 'Type', 'Size', 'Access', 'Downloads', 'Date', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{d.type === 'PDF' ? '📕' : d.type === 'XLSX' ? '📗' : '📘'}</span>
                      <div><p className="font-medium text-gray-800 text-xs">{d.name}</p><p className="text-xs text-gray-400">{d.id} · By {d.uploadedBy}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.category}</td>
                  <td className="px-4 py-3"><span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{d.type}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{d.size}</td>
                  <td className="px-4 py-3"><Badge variant={ACCESS_COLOR[d.access] as any}>{d.access.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.downloads}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{d.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedDoc(d)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">View</button>
                      <button className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">⬇</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 text-xs text-gray-400 border-t border-gray-100">
            {filtered.length} of {DOCUMENTS.length} documents shown
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} title="Upload Document">
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 cursor-pointer">
            <p className="text-3xl mb-2">📂</p>
            <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, PNG up to 50MB</p>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Document Name</label>
            <input type="text" placeholder="Descriptive document name..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Access Level</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="PUBLIC">Public (everyone)</option>
              <option value="ALL_STAFF">All Staff</option>
              <option value="TEACHERS">Teachers only</option>
              <option value="ADMIN_ONLY">Admin only</option>
            </select>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500">Upload Document</button>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      <Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title={selectedDoc?.name || ''}>
        {selectedDoc && (
          <div className="p-6">
            <div className="border border-gray-100 rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedDoc.type === 'PDF' ? '📕' : selectedDoc.type === 'XLSX' ? '📗' : '📘'}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedDoc.name}</h3>
                  <p className="text-xs text-gray-400">{selectedDoc.type} · {selectedDoc.size}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['Category', selectedDoc.category], ['Uploaded By', selectedDoc.uploadedBy], ['Date', selectedDoc.date], ['Downloads', selectedDoc.downloads.toString()], ['Access Level', selectedDoc.access.replace('_', ' ')]].map(([k, v]) => (
                  <div key={String(k)} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="font-medium text-sm">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg">⬇ Download</button>
              <button className="flex-1 py-2 border border-gray-200 text-sm rounded-lg">🔗 Share Link</button>
              <button className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
