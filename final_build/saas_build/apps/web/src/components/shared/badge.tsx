'use client';
import React from 'react';
const V: Record<string,string> = { green:'bg-green-100 text-green-700 border-green-200', red:'bg-red-100 text-red-700 border-red-200', yellow:'bg-yellow-100 text-yellow-700 border-yellow-200', blue:'bg-blue-100 text-blue-700 border-blue-200', purple:'bg-purple-100 text-purple-700 border-purple-200', gray:'bg-gray-100 text-gray-500 border-gray-200' };
export function Badge({ children, variant='gray' }: { children: React.ReactNode; variant?: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${V[variant]??V.gray}`}>{children}</span>;
}
