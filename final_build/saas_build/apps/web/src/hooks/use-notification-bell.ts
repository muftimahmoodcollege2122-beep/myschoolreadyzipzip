'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNotifications } from './use-api';

export function useNotificationBell() {
  const qc = useQueryClient();
  const { data } = useNotifications();
  const [unread, setUnread] = useState(0);

  // From TanStack Query cache (updated by WS)
  const cachedCount = qc.getQueryData<number>(['notifications:unread']);

  useEffect(() => {
    const count = cachedCount ?? (data as any)?.data?.filter((n: any) => !n.readAt).length ?? 0;
    setUnread(count);
  }, [cachedCount, data]);

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return { unread };
}
