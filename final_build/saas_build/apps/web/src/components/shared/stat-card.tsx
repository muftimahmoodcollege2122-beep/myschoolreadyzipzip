'use client';
import React from 'react';
const C: Record<string, {bg:string;ic:string}> = {
  green:  {bg:'bg-green-50 border-green-200',  ic:'bg-green-100 text-green-700'},
  blue:   {bg:'bg-blue-50 border-blue-200',    ic:'bg-blue-100 text-blue-700'},
  yellow: {bg:'bg-yellow-50 border-yellow-200',ic:'bg-yellow-100 text-yellow-700'},
  red:    {bg:'bg-red-50 border-red-200',      ic:'bg-red-100 text-red-700'},
  purple: {bg:'bg-purple-50 border-purple-200',ic:'bg-purple-100 text-purple-700'},
};
export function StatCard({ title, value, icon, trend, color='green' }: { title:string; value:string|number; icon:string; trend?:{value:number;label:string;unit?:string}; color?:string }) {
  const c = C[color] ?? C.green;
  return (
    <div className={`${c.bg} rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{value}</p>
          {trend && <p className={`text-xs font-semibold mt-2 ${trend.value>=0?'text-green-600':'text-red-500'}`}>{trend.value>=0?'↑':'↓'} {Math.abs(trend.value)}{trend.unit ?? '%'} {trend.label}</p>}
        </div>
        <div className={`${c.ic} p-3 rounded-xl text-xl`}>{icon}</div>
      </div>
    </div>
  );
}
