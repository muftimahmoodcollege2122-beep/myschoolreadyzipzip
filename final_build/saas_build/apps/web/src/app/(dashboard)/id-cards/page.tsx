'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const CARD_TYPES = [
  { id: 'student', label: 'Student ID Card', icon: '👩‍🎓', count: 660, color: 'from-blue-600 to-blue-800' },
  { id: 'teacher', label: 'Teacher ID Card', icon: '👨‍🏫', count: 45, color: 'from-green-600 to-green-800' },
  { id: 'staff', label: 'Staff ID Card', icon: '👤', count: 28, color: 'from-purple-600 to-purple-800' },
  { id: 'visitor', label: 'Visitor Pass', icon: '🏷️', count: 0, color: 'from-gray-500 to-gray-700' },
];

const STUDENTS_SAMPLE = [
  { id: 'S-2026-001', name: 'Ahmed Ali', class: '10-A', rollNo: '1001', dob: '2009-03-15', bloodGroup: 'B+', phone: '0300-1234567', address: 'Gulshan-e-Iqbal, Karachi' },
  { id: 'S-2026-002', name: 'Sara Khan', class: '8-B', rollNo: '802', dob: '2011-07-22', bloodGroup: 'O+', phone: '0321-9876543', address: 'Defence, Karachi' },
  { id: 'S-2026-003', name: 'Omar Hassan', class: '6-C', rollNo: '603', dob: '2013-11-05', bloodGroup: 'A+', phone: '0311-5556666', address: 'Clifton, Karachi' },
];

export default function IDCardsPage() {
  const [selectedType, setSelectedType] = useState('student');
  const [previewStudent, setPreviewStudent] = useState<typeof STUDENTS_SAMPLE[0] | null>(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [cardStyle, setCardStyle] = useState<'classic' | 'modern' | 'minimal'>('modern');

  const styles = {
    classic: 'bg-gradient-to-br from-blue-800 to-blue-600',
    modern: 'bg-gradient-to-br from-gray-900 to-gray-700',
    minimal: 'bg-white border-2 border-gray-800',
  };

  return (
    <>
      <Topbar title="ID Cards" subtitle="Generate student & staff identity cards" />
      <div className="p-6">
        <PageHeader title="ID Card Generator" subtitle="Design, print & issue school ID cards"
          action={
            <div className="flex gap-2">
              <button onClick={() => setBulkModal(true)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">⬇ Bulk Print</button>
              <button onClick={() => setPreviewStudent(STUDENTS_SAMPLE[0])} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Generate Card</button>
            </div>
          }
        />

        {/* Card Types */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {CARD_TYPES.map(ct => (
            <button key={ct.id} onClick={() => setSelectedType(ct.id)}
              className={`rounded-xl p-4 text-left transition-all ${selectedType === ct.id ? 'ring-2 ring-green-500 shadow-md' : 'hover:shadow-md'}`}
              style={{ background: `linear-gradient(135deg, ${ct.id === 'student' ? '#1e40af, #1d4ed8' : ct.id === 'teacher' ? '#166534, #15803d' : ct.id === 'staff' ? '#6b21a8, #7e22ce' : '#374151, #4b5563'})` }}>
              <span className="text-2xl block mb-2">{ct.icon}</span>
              <p className="text-sm font-bold text-white">{ct.label}</p>
              <p className="text-xs text-white/70">{ct.count} issued</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Settings */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Card Design Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Card Style</label>
                  <div className="flex gap-2">
                    {(['classic', 'modern', 'minimal'] as const).map(s => (
                      <button key={s} onClick={() => setCardStyle(s)}
                        className={`flex-1 py-2 text-sm rounded-lg border capitalize transition-all ${cardStyle === s ? 'border-green-500 text-green-600 bg-green-50' : 'border-gray-200 text-gray-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Include Fields</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Photo', 'Name', 'Class/Dept', 'Roll/ID No.', 'Blood Group', 'Phone', 'Address', 'QR Code', 'Barcode', 'Emergency Contact'].map(f => (
                      <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked={['Photo', 'Name', 'Class/Dept', 'Roll/ID No.', 'Blood Group', 'QR Code'].includes(f)} />
                        {f}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Academic Year</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>2025–2026</option><option>2026–2027</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
                  <input type="date" defaultValue="2026-12-31" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">Generate For</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Select Students</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>All Students (660)</option>
                    <option>Class 10 (120 students)</option>
                    <option>Class 9 (135 students)</option>
                    <option>New Admissions Only</option>
                    <option>Expired Cards Only</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBulkModal(true)} className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500">Generate All</button>
                  <button onClick={() => setPreviewStudent(STUDENTS_SAMPLE[0])} className="flex-1 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">Preview Sample</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Card Preview</h3>
              {/* ID Card Preview */}
              <div className="flex justify-center mb-4">
                <div className={`w-72 h-44 rounded-2xl p-4 relative overflow-hidden shadow-xl ${cardStyle === 'minimal' ? 'bg-white border-2 border-gray-800' : cardStyle === 'modern' ? 'bg-gradient-to-br from-gray-900 to-gray-700' : 'bg-gradient-to-br from-blue-800 to-blue-600'}`}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/2" />
                  <div className="flex items-start gap-3 h-full">
                    {/* Photo */}
                    <div className={`w-16 h-20 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl ${cardStyle === 'minimal' ? 'bg-gray-100' : 'bg-white/20'}`}>
                      👤
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold mb-0.5 ${cardStyle === 'minimal' ? 'text-blue-800' : 'text-white/70'}`}>MYSCHOOL</div>
                      <div className={`text-sm font-bold truncate ${cardStyle === 'minimal' ? 'text-gray-900' : 'text-white'}`}>Ahmed Ali</div>
                      <div className={`text-xs ${cardStyle === 'minimal' ? 'text-gray-600' : 'text-white/70'}`}>Class 10-A</div>
                      <div className={`text-xs mt-1 font-mono ${cardStyle === 'minimal' ? 'text-gray-500' : 'text-white/60'}`}>ID: S-2026-001</div>
                      <div className={`text-xs ${cardStyle === 'minimal' ? 'text-red-600' : 'text-red-300'}`}>Blood: B+</div>
                      <div className={`text-xs mt-1 ${cardStyle === 'minimal' ? 'text-gray-400' : 'text-white/50'}`}>Valid: Dec 2026</div>
                    </div>
                    {/* QR */}
                    <div className={`w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-xl self-end ${cardStyle === 'minimal' ? 'bg-gray-100' : 'bg-white/20'}`}>
                      ▦
                    </div>
                  </div>
                </div>
              </div>
              {/* Back Side */}
              <div className="flex justify-center">
                <div className={`w-72 h-44 rounded-2xl p-4 relative overflow-hidden shadow-xl ${cardStyle === 'minimal' ? 'bg-gray-50 border-2 border-gray-800' : cardStyle === 'modern' ? 'bg-gradient-to-br from-gray-800 to-gray-600' : 'bg-gradient-to-br from-blue-700 to-blue-500'}`}>
                  <div className={`text-xs font-bold mb-2 ${cardStyle === 'minimal' ? 'text-gray-700' : 'text-white/70'}`}>EMERGENCY CONTACT</div>
                  <div className={`text-sm mb-3 ${cardStyle === 'minimal' ? 'text-gray-800' : 'text-white'}`}>0300-1234567</div>
                  <div className={`text-xs mb-1 ${cardStyle === 'minimal' ? 'text-gray-600' : 'text-white/70'}`}>📍 Gulshan-e-Iqbal, Karachi</div>
                  <div className={`text-xs ${cardStyle === 'minimal' ? 'text-gray-400' : 'text-white/50'}`}>If found, please return to MySchool</div>
                  <div className={`text-xs mt-1 ${cardStyle === 'minimal' ? 'text-gray-400' : 'text-white/50'}`}>📞 021-12345678</div>
                  <div className="absolute bottom-4 right-4">
                    <div className={`text-xs font-mono ${cardStyle === 'minimal' ? 'text-gray-300' : 'text-white/30'}`}>||||||||||||</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg">🖨 Print</button>
                <button className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg">⬇ PDF</button>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
          <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Quick Generate by Student</h3></div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
              {['ID', 'Name', 'Class', 'Roll No.', 'Blood Group', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {STUDENTS_SAMPLE.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.id}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.class}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.rollNo}</td>
                  <td className="px-4 py-3"><Badge variant="red">{s.bloodGroup}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="green">Issued</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setPreviewStudent(s)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Preview</button>
                      <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">Print</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Print Modal */}
      <Modal isOpen={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Print ID Cards">
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <p className="font-bold text-blue-800">Ready to generate 660 student ID cards</p>
            <p className="text-blue-600">This will create a printable PDF with all ID cards</p>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Print Size</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>CR80 Standard (85.6 × 54mm)</option>
              <option>A4 Sheet (4 cards per page)</option>
              <option>A4 Sheet (6 cards per page)</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Sort By</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>Class then Name (A-Z)</option>
              <option>Student ID</option>
              <option>Name A-Z</option>
            </select>
          </div>
          <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500">⬇ Generate PDF</button>
        </div>
      </Modal>
    </>
  );
}
