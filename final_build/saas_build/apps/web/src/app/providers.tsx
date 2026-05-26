'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } });
export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
