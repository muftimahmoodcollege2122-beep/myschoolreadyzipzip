'use client';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function OnlineIndicator() {
  const qc = useQueryClient();
  const count = qc.getQueryData<number>(['online:count']) ?? 0;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs font-semibold text-green-700">{count} online</span>
    </div>
  );
}
