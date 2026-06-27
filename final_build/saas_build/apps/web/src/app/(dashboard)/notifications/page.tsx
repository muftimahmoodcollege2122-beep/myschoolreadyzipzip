'use client';
import React, { useState } from 'react';
import { useNotifications } from '@/hooks/use-api';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Topbar } from '@/components/layout/topbar';
import { apiClient } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';

const AUTOMATION_CONFIG = [
  { id: 'fee_due', label: 'Fee Due Reminder', desc: 'Send SMS to parents 3 days before fee due date', channel: 'SMS', trigger: 'Fee due date approaching', active: true },
  { id: 'absent_parent', label: 'Absence Parent Alert', desc: 'Notify parent immediately when child is marked absent', channel: 'WhatsApp', trigger: 'Student marked ABSENT', active: true },
  { id: 'result_pub', label: 'Result Published', desc: 'Email parents when exam results are published', channel: 'Email', trigger: 'Exam result published', active: false },
  { id: 'exam_remind', label: 'Exam Reminder', desc: 'SMS to students 2 days before exam', channel: 'SMS', trigger: '2 days before exam', active: true },
  { id: 'late_fee', label: 'Overdue Fee Alert', desc: 'Auto-escalate overdue fees after 7 days', channel: 'SMS', trigger: 'Fee overdue > 7 days', active: false },
  { id: 'birthday', label: 'Birthday Greetings', desc: 'WhatsApp greeting to students on their birthday', channel: 'WhatsApp', trigger: 'Student birthday', active: false },
  { id: 'low_attendance', label: 'Low Attendance Alert', desc: 'Alert when student attendance drops below 75%', channel: 'Email', trigger: 'Attendance < 75%', active: true },
  { id: 'announcement', label: 'New Announcement', desc: 'Push notification for school announcements', channel: 'Push', trigger: 'Announcement created', active: true },
];

const channelColor: Record<string, string> = {
  SMS: 'bg-blue-100 text-blue-700',
  WhatsApp: 'bg-green-100 text-green-700',
  Email: 'bg-orange-100 text-orange-700',
  Push: 'bg-purple-100 text-purple-700',
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'notifications'|'automation'>('notifications');
  const [rules, setRules] = useState(AUTOMATION_CONFIG);
  const notifs: any[] = (data as any)?.data ?? [];

  const markRead = async (id: string) => {
    await apiClient.post(`/notifications/${id}/read`, {});
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.readAt).map(n => apiClient.post(`/notifications/${n.id}/read`, {})));
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const unreadCount = notifs.filter(n => !n.readAt).length;
  const activeRules = rules.filter(r => r.active).length;

  const typeIcon: Record<string, string> = {
    FEE_REMINDER: '💰',
    ATTENDANCE_ALERT: '📋',
    EXAM_REMINDER: '📝',
    ANNOUNCEMENT: '📢',
    RESULT: '🏆',
    GENERAL: '🔔',
  };

  return (
    <>
      <Topbar title="Notifications" />
      <div className="p-6">
        <PageHeader
          title="Notifications"
          subtitle={`${unreadCount} unread`}
          action={
            <div className="flex gap-2">
              {unreadCount > 0 && tab === 'notifications' && (
                <button onClick={markAllRead} className="px-3 py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Mark All Read
                </button>
              )}
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Unread', value: unreadCount, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total', value: notifs.length, color: 'text-gray-700 bg-gray-50' },
            { label: 'Automation Rules', value: activeRules, color: 'text-green-700 bg-green-50' },
            { label: 'Channels Active', value: [...new Set(rules.filter(r=>r.active).map(r=>r.channel))].length, color: 'text-purple-700 bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button onClick={() => setTab('notifications')} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${tab === 'notifications' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
            Notifications {unreadCount > 0 && <span className="ml-1 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
          </button>
          <button onClick={() => setTab('automation')} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${tab === 'automation' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
            Automation <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">{activeRules}</span>
          </button>
        </div>

        {tab === 'notifications' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_,i) => <div key={i} className="h-16 animate-pulse bg-gray-50 m-3 rounded-lg"/>)
            ) : !notifs.length ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🔔</p>
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm mt-1 text-gray-300">Notifications appear here when events occur</p>
              </div>
            ) : notifs.map((n: any) => (
              <div
                key={n.id}
                onClick={() => !n.readAt && markRead(n.id)}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.readAt ? 'bg-blue-50/40 cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="text-xl flex-shrink-0 mt-0.5">
                  {typeIcon[n.type] ?? '🔔'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.readAt ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.readAt && <Badge variant="blue">New</Badge>}
                      <span className="text-xs text-gray-300">{new Date(n.createdAt).toLocaleString('en-PK', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                  {n.type && <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${channelColor[n.channel ?? 'Push'] ?? 'bg-gray-100 text-gray-600'}`}>{n.type.replace(/_/g,' ')}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'automation' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-blue-900 text-sm">Automated Notification Rules</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Configure when and how the system automatically sends alerts to parents, students, and staff.
                  Active rules run 24/7 in the background. Currently <strong>{activeRules} rules</strong> are active.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {rules.map(rule => (
                <div key={rule.id} className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${rule.active ? 'border-green-100' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${rule.active ? 'bg-green-50' : 'bg-gray-50'}`}>
                        {rule.channel === 'SMS' ? '📱' : rule.channel === 'WhatsApp' ? '💬' : rule.channel === 'Email' ? '📧' : '🔔'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm ${rule.active ? 'text-gray-900' : 'text-gray-400'}`}>{rule.label}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${channelColor[rule.channel] ?? 'bg-gray-100 text-gray-500'}`}>{rule.channel}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{rule.desc}</p>
                        <p className="text-xs text-gray-300 mt-0.5">Trigger: {rule.trigger}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${rule.active ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${rule.active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Channel Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-600 uppercase mb-3">Notification Channels</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'SMS Gateway', active: true, provider: 'Twilio' },
                  { name: 'WhatsApp API', active: true, provider: 'Meta Business' },
                  { name: 'Email SMTP', active: true, provider: 'SendGrid' },
                  { name: 'Push Notifications', active: false, provider: 'Firebase FCM' },
                ].map(ch => (
                  <div key={ch.name} className={`rounded-xl p-3 text-center border ${ch.active ? 'bg-green-50 border-green-100' : 'bg-gray-100 border-gray-200'}`}>
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${ch.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <p className="text-xs font-bold text-gray-700">{ch.name}</p>
                    <p className={`text-xs mt-0.5 ${ch.active ? 'text-green-600' : 'text-gray-400'}`}>{ch.active ? ch.provider : 'Not configured'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
