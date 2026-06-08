'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('attendance');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['report-stats'],
    queryFn:  () => api.get('/dashboard/stats').catch(() => null),
  });

  const s = (stats as any) || {};

  const REPORTS = [
    { key: 'attendance',  label: 'Attendance Report',   icon: '✅', desc: 'Daily/monthly attendance summary by class' },
    { key: 'fees',        label: 'Fee Collection Report', icon: '💰', desc: 'Outstanding vs collected fees breakdown' },
    { key: 'results',     label: 'Academic Results',      icon: '📊', desc: 'Exam results and grade distribution' },
    { key: 'students',    label: 'Student Report',        icon: '👩‍🎓', desc: 'Enrollment, demographics and section-wise data' },
    { key: 'teachers',    label: 'Teacher Report',        icon: '👨‍🏫', desc: 'Staff summary, subjects and sections' },
  ];

  const handleExport = (format: 'pdf' | 'excel') => {
    const params = new URLSearchParams({ type: reportType, format, dateFrom, dateTo });
    window.open(`/api/v1/reports/export?${params}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm">Generate and export school data reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Students',    value: s.totalStudents,  icon: '👩‍🎓', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Teachers',    value: s.totalTeachers,  icon: '👨‍🏫', color: 'bg-teal-50 text-teal-700' },
          { label: 'Classes',     value: s.totalClasses,   icon: '🏫', color: 'bg-violet-50 text-violet-700' },
          { label: 'Present Today', value: s.presentToday, icon: '✅', color: 'bg-green-50 text-green-700' },
          { label: 'Absent Today',  value: s.absentToday,  icon: '❌', color: 'bg-red-50 text-red-700' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} rounded-2xl p-4 border border-current/10`}>
            <p className="text-2xl">{icon}</p>
            <p className="text-2xl font-black mt-1">{value ?? '—'}</p>
            <p className="text-xs font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Report Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Generate Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORTS.map(r => (
            <button key={r.key} onClick={() => setReportType(r.key)}
              className={`text-left p-4 rounded-xl border transition-all ${reportType === r.key ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-gray-100 hover:border-indigo-200'}`}>
              <p className="text-xl mb-1">{r.icon}</p>
              <p className={`text-sm font-bold ${reportType === r.key ? 'text-white' : 'text-gray-900'}`}>{r.label}</p>
              <p className={`text-xs mt-0.5 ${reportType === r.key ? 'text-indigo-200' : 'text-gray-400'}`}>{r.desc}</p>
            </button>
          ))}
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap gap-3 items-end pt-2 border-t border-gray-50">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">From Date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">To Date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => handleExport('excel')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
              📊 Export Excel
            </button>
            <button onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all">
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Usage Guide */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h3 className="font-bold text-indigo-900 mb-3">📡 Reporting API Endpoints</h3>
        <div className="space-y-2 font-mono text-xs">
          {[
            ['GET', '/api/v1/reports/attendance', 'Attendance summary by class/date'],
            ['GET', '/api/v1/reports/fees', 'Fee collection analytics'],
            ['GET', '/api/v1/reports/results', 'Academic performance report'],
            ['GET', '/api/v1/reports/export?type=attendance&format=pdf', 'Export as PDF/Excel'],
            ['GET', '/api/v1/dashboard/stats', 'Live dashboard statistics'],
          ].map(([method, endpoint, desc]) => (
            <div key={endpoint} className="flex items-center gap-3">
              <span className="bg-indigo-200 text-indigo-800 font-black px-2 py-0.5 rounded text-[10px] w-9 text-center flex-shrink-0">{method}</span>
              <span className="text-indigo-700 truncate">{endpoint}</span>
              <span className="text-indigo-400 text-[10px] hidden sm:block">· {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
