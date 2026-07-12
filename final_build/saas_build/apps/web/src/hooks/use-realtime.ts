'use client';
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export function useRealtime() {
  const { accessToken: token } = useAuthStore();
  const qc = useQueryClient();
  const connected = useRef(false);

  useEffect(() => {
    if (!token || connected.current) return;

    socket = io(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/realtime`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      connected.current = true;
      console.log('[WS] Connected:', socket?.id);
      // Start heartbeat every 60s
      const hb = setInterval(() => socket?.emit('heartbeat'), 60_000);
      socket?.on('disconnect', () => clearInterval(hb));
    });

    socket.on('disconnect', () => {
      connected.current = false;
      console.log('[WS] Disconnected');
    });

    // ── Real-time notification bell update ────────────────────────────────
    socket.on('notifications:unread_count', ({ count }: { count: number }) => {
      qc.setQueryData(['notifications:unread'], count);
    });

    socket.on('notification:new', (data: any) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      // Browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification(data.title, { body: data.body, icon: '/icon.png' });
      }
    });

    // ── Live attendance updates (for teachers viewing their own sheet) ────
    socket.on('attendance:marked', () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // ── Parent: child absent alert ─────────────────────────────────────────
    socket.on('alert:child_absent', (data: any) => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('child:absent', { detail: data }));
      }
    });

    // ── Fee payment confirmation ───────────────────────────────────────────
    socket.on('fee:payment_confirmed', () => {
      qc.invalidateQueries({ queryKey: ['fees'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // ── Exam results published ─────────────────────────────────────────────
    socket.on('exam:results_published', (data: any) => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      qc.invalidateQueries({ queryKey: ['exam-results'] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('exam:results', { detail: data }));
      }
    });

    // ── Live dashboard stats ───────────────────────────────────────────────
    socket.on('dashboard:live_stats', () => {
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // ── Announcements ──────────────────────────────────────────────────────
    socket.on('announcement:new', (data: any) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('announcement:new', { detail: data }));
      }
    });

    // ── Presence ──────────────────────────────────────────────────────────
    socket.on('presence:joined', (data: any) => {
      qc.setQueryData(['online:count'], data.onlineCount);
    });

    socket.on('presence:left', (data: any) => {
      qc.setQueryData(['online:count'], data.onlineCount);
    });

    return () => {
      socket?.disconnect();
      connected.current = false;
      socket = null;
    };
  }, [token, qc]);

  const joinSection = useCallback((sectionId: string) => {
    socket?.emit('join:section', { sectionId });
  }, []);

  const leaveSection = useCallback((sectionId: string) => {
    socket?.emit('leave:section', { sectionId });
  }, []);

  const startAttendanceSession = useCallback((sectionId: string, date: string) => {
    socket?.emit('attendance:session:start', { sectionId, date });
  }, []);

  return { joinSection, leaveSection, startAttendanceSession, isConnected: connected.current };
}
