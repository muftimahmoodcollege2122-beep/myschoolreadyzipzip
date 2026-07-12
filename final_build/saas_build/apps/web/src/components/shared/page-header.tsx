'use client';
import React from 'react';
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2 flex-shrink-0">{action}</div>}
    </div>
  );
}
