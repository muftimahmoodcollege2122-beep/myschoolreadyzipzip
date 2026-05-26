'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';

function AnalyticsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function BarChart({ data, valueKey, labelKey, color = '#1A7F5A' }: any) {
  if (!data?.length) return <p className="text-sm text-gray-400 text-center py-6">No data available</p>;
  const max = Math.max(...data.map((d: any) => Number(d[valueKey]) || 0));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d: any, i: number) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-sm transition-all" style={{ height: `${max > 0 ? (Number(d[valueKey]) / max) * 100 : 0}%`, background: color, minHeight: '2px' }} />
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const today = new Date().toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
  const year = new Date().getFullYear();

  const { data: attData } = useQuery({ queryKey: ['analytics','attendance'], queryFn: () => apiClient.get(`/search/analytics/attendance?from=${monthAgo}&to=${today}`) });
  const { data: feeData } = useQuery({ queryKey: ['analytics','fees'], queryFn: () => apiClient.get(`/search/analytics/fees?year=${year}`) });
  const { data: enrollData } = useQuery({ queryKey: ['analytics','enrollment'], queryFn: () => apiClient.get('/search/analytics/enrollment') });

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <>
      <Topbar title="Analytics" subtitle="School performance insights" />
      <div className="p-6">
        <PageHeader title="Analytics" subtitle="Data-driven insights for your school" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <AnalyticsCard title="Attendance Rate — Last 30 Days">
            <BarChart data={attData as any[]} valueKey="rate" labelKey="date" color="#1A7F5A" />
          </AnalyticsCard>
          <AnalyticsCard title="Fee Collection — This Year">
            <BarChart
              data={((feeData as any[]) ?? []).map((d: any) => ({ ...d, monthName: MONTHS[Number(d.month)-1] }))}
              valueKey="collected" labelKey="monthName" color="#F4A623"
            />
          </AnalyticsCard>
          <AnalyticsCard title="Student Enrollment Trend">
            <BarChart data={enrollData as any[]} valueKey="new_students" labelKey="month" color="#3B82F6" />
          </AnalyticsCard>
          <AnalyticsCard title="Summary">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg Attendance', value: attData ? `${Math.round((attData as any[]).reduce((s:number,d:any)=>s+Number(d.rate),0)/Math.max(1,(attData as any[]).length))}%` : '—', color: 'text-green-600' },
                { label: 'Fees Collected', value: feeData ? `Rs. ${((feeData as any[]).reduce((s:number,d:any)=>s+Number(d.collected),0)/1000).toFixed(0)}K` : '—', color: 'text-yellow-600' },
                { label: 'Overdue Invoices', value: feeData ? (feeData as any[]).reduce((s:number,d:any)=>s+Number(d.overdue_count),0) : '—', color: 'text-red-500' },
                { label: 'New Students', value: enrollData ? (enrollData as any[]).reduce((s:number,d:any)=>s+Number(d.new_students),0) : '—', color: 'text-blue-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold">{s.label}</p>
                  <p className={`text-xl font-black mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </AnalyticsCard>
        </div>
      </div>
    </>
  );
}
