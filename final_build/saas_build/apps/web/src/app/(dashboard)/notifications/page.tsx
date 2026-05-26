'use client';
import React from 'react';
import { useNotifications } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Topbar } from '../../../components/layout/topbar';
import { apiClient } from '../../../lib/api-client';
import { useQueryClient } from '@tanstack/react-query';
export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const qc = useQueryClient();
  const notifs: any[] = (data as any)?.data ?? [];
  const markRead = async (id: string) => { await apiClient.post(`/notifications/${id}/read`, {}); qc.invalidateQueries({ queryKey: ['notifications'] }); };
  return (
    <>
      <Topbar title="Notifications"/>
      <div className="p-6">
        <PageHeader title="Notifications" subtitle={`${notifs.filter(n=>!n.readAt).length} unread`}/>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {isLoading ? [...Array(5)].map((_,i)=><div key={i} className="h-16 animate-pulse bg-gray-50 m-3 rounded-lg"/>)
            : !notifs.length ? <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">🔔</p><p className="font-medium">No notifications yet</p></div>
            : notifs.map((n:any)=>(
              <div key={n.id} onClick={()=>!n.readAt&&markRead(n.id)} className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.readAt?'bg-green-50/50 cursor-pointer hover:bg-green-50':'hover:bg-gray-50'}`}>
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{background:n.readAt?'#d1d5db':'#22c55e'}}/>
                <div className="flex-1"><p className={`text-sm ${!n.readAt?'font-bold text-gray-900':'text-gray-600'}`}>{n.title}</p><p className="text-xs text-gray-400 mt-0.5">{n.body}</p><p className="text-xs text-gray-300 mt-1">{new Date(n.createdAt).toLocaleString('en-PK')}</p></div>
                {!n.readAt && <Badge variant="green">New</Badge>}
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}
