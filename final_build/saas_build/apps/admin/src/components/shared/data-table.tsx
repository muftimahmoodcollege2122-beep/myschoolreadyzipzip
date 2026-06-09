'use client';
import React from 'react';
interface Column<T> { key: string; header: string; render?: (row: T) => React.ReactNode; className?: string; }
interface Props<T> { columns: Column<T>[]; data: T[]; isLoading?: boolean; emptyMessage?: string; onRowClick?: (row: T) => void; }
export function DataTable<T extends Record<string,any>>({ columns, data, isLoading, emptyMessage='No records found', onRowClick }: Props<T>) {
  if (isLoading) return <div className="p-4 space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"/>)}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead><tr className="border-b border-gray-100">{columns.map(c=><th key={c.key} className={`px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider ${c.className??''}`}>{c.header}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-50">
          {data.length===0?<tr><td colSpan={columns.length} className="px-4 py-14 text-center text-gray-400 text-sm">{emptyMessage}</td></tr>
            :data.map((row,i)=>(
              <tr key={i} onClick={()=>onRowClick?.(row)} className={`hover:bg-gray-50 transition-colors ${onRowClick?'cursor-pointer':''}`}>
                {columns.map(c=><td key={c.key} className={`px-4 py-3 text-sm text-gray-700 ${c.className??''}`}>{c.render?c.render(row):String(row[c.key]??'—')}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
