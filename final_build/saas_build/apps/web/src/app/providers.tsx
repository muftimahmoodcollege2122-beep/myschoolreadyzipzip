'use client';
/**
 * Client-side providers wrapper — sets up React Query (TanStack Query) for all API calls
 * and any global state providers. Marked 'use client' so hooks work throughout the app.
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } });
export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
