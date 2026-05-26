'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, GraduationCap, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface StatCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

async function fetchDashboardStats() {
  const { data } = await apiClient.get('/dashboard/stats');
  return data;
}

export function DashboardStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 min
    refetchInterval: 5 * 60 * 1000,
  });

  const stats: StatCard[] = [
    {
      label: 'Total Students',
      value: data?.totalStudents?.toLocaleString() ?? '—',
      change: data?.studentGrowth ?? 0,
      changeLabel: 'vs last month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: "Today's Attendance",
      value: data?.attendanceRate ? `${data.attendanceRate}%` : '—',
      change: data?.attendanceChange ?? 0,
      changeLabel: 'vs yesterday',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Total Staff',
      value: data?.totalStaff?.toLocaleString() ?? '—',
      change: data?.staffChange ?? 0,
      changeLabel: 'vs last month',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Fee Collection',
      value: data?.feeCollected ? `$${(data.feeCollected / 1000).toFixed(1)}K` : '—',
      change: data?.feeChange ?? 0,
      changeLabel: 'vs last month',
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? <span className="animate-pulse">···</span> : stat.value}
                </p>
                <div className="flex items-center gap-1">
                  {stat.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>
                  <span className="text-xs text-gray-400">{stat.changeLabel}</span>
                </div>
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bgColor)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
