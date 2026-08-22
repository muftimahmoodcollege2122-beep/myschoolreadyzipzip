'use client';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface EnrollmentChartProps {
  data: {
    daily: number;
    weekly: number;
    monthly: number;
    allTime: number;
  };
}

export default function EnrollmentChart({ data }: EnrollmentChartProps) {
  const chartData = [
    { name: 'Day', students: data.daily },
    { name: 'Week', students: data.weekly },
    { name: 'Month', students: data.monthly },
    { name: 'All', students: data.allTime },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <Tooltip />
        <Bar dataKey="students" fill="#60a5fa" />
      </BarChart>
    </ResponsiveContainer>
  );
}
