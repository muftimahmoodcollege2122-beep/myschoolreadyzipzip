'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface StatCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
  bg: string;
}

async function fetchStats() {
  return apiClient.get('/dashboard');
}

export function DashboardStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const stats: StatCard[] = [
    {
      label: 'Total Students',
      value: data?.totalStudents?.toLocaleString() ?? '—',
      change: data?.studentGrowth ?? 0,
      changeLabel: 'vs last month',
      icon: '👩‍🎓',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: "Today's Attendance",
      value: data?.attendance?.rate != null ? `${data.attendance.rate}%` : '—',
      change: data?.attendanceChange ?? 0,
      changeLabel: 'vs yesterday',
      icon: '✅',
      color: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Staff',
      value: data?.totalTeachers?.toLocaleString() ?? '—',
      change: data?.staffChange ?? 0,
      changeLabel: 'vs last month',
      icon: '👨‍🏫',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
    },
    {
      label: 'Fee Collection',
      value: data?.fees?.collected != null
        ? `Rs. ${(data.fees.collected / 1000).toFixed(1)}K`
        : '—',
      change: data?.feeChange ?? 0,
      changeLabel: 'vs last month',
      icon: '💰',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <div className="flex items-center gap-1">
                <span className={`text-xs font-semibold ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? '▲' : '▼'} {Math.abs(stat.change)}%
                </span>
                <span className="text-xs text-gray-400">{stat.changeLabel}</span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
