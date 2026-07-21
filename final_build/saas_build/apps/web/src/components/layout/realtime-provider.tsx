'use client';
import React from 'react';
import { useRealtime } from '@/hooks/use-realtime';
import { LiveAlertBanner } from '../shared/live-alert-banner';

/**
 * Drop this inside DashboardLayout.
 * Starts WS connection and mounts the live alert banner.
 * useRealtime() hook handles all event subscriptions.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtime(); // Starts socket, registers all listeners
  return (
    <>
      <LiveAlertBanner />
      {children}
    </>
  );
}
