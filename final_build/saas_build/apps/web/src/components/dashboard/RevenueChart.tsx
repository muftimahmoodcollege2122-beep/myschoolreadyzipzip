'use client';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenuePeriod {
  total_invoices: number;
  total_revenue: number;
}

interface RevenueChartProps {
  data: {
    daily: RevenuePeriod;
    weekly: RevenuePeriod;
    monthly: RevenuePeriod;
    allTime: RevenuePeriod;
  };
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = [
    { name: 'Day', ...data.daily },
    { name: 'Week', ...data.weekly },
    { name: 'Month', ...data.monthly },
    { name: 'All', ...data.allTime },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <Tooltip />
        <Bar dataKey="total_invoices" stackId="a" fill="#9ca3af" name="Invoices" />
        <Bar dataKey="total_revenue" stackId="a" fill="#60a5fa" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
}
