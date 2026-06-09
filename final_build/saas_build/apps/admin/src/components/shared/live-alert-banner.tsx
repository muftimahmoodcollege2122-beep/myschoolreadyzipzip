'use client';
import React, { useEffect, useState } from 'react';

interface Alert {
  id: string;
  type: 'absent' | 'exam' | 'announcement' | 'payment';
  title: string;
  message: string;
  severity?: 'high' | 'normal';
}

export function LiveAlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const onAbsent = (e: Event) => {
      const d = (e as CustomEvent).detail;
      push({ id: Date.now().toString(), type: 'absent', title: '⚠️ Absence Alert', message: d.message, severity: 'high' });
    };
    const onExam = (e: Event) => {
      const d = (e as CustomEvent).detail;
      push({ id: Date.now().toString(), type: 'exam', title: '📝 Results Published', message: `Results for "${d.examTitle}" are now available`, severity: 'normal' });
    };
    const onAnnouncement = (e: Event) => {
      const d = (e as CustomEvent).detail;
      push({ id: Date.now().toString(), type: 'announcement', title: `📢 ${d.title}`, message: d.body, severity: d.priority === 'urgent' ? 'high' : 'normal' });
    };

    window.addEventListener('child:absent', onAbsent);
    window.addEventListener('exam:results', onExam);
    window.addEventListener('announcement:new', onAnnouncement);

    return () => {
      window.removeEventListener('child:absent', onAbsent);
      window.removeEventListener('exam:results', onExam);
      window.removeEventListener('announcement:new', onAnnouncement);
    };
  }, []);

  const push = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 5));
    setTimeout(() => dismiss(alert.id), alert.severity === 'high' ? 10000 : 6000);
  };

  const dismiss = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

  if (!alerts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {alerts.map(alert => (
        <div key={alert.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-sm animate-slide-in
            ${alert.severity === 'high'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-white border-gray-200 text-gray-900'}`}>
          <div className="flex-1">
            <p className="font-bold text-sm">{alert.title}</p>
            <p className="text-xs mt-0.5 opacity-80">{alert.message}</p>
          </div>
          <button onClick={() => dismiss(alert.id)} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">✕</button>
        </div>
      ))}
    </div>
  );
}
