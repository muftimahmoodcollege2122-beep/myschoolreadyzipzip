'use client';
import React, { useState } from 'react';
import { useEvents, useCreateEvent, useDeleteEvent, useAnnouncements, useCreateAnnouncement } from '@/hooks/use-api';
import { apiClient } from '@/lib/api-client';
import { PageHeader } from '@/components/shared/page-header';
import { Topbar } from '@/components/layout/topbar';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';

const EVENT_EMPTY = { title: '', description: '', startAt: '', endAt: '', venue: '', isPublic: false };
const ANN_EMPTY = { title: '', content: '', isPinned: false };

export default function EventsPage() {
  const [tab, setTab] = useState<'events'|'announcements'>('events');
  const [eventModal, setEventModal] = useState(false);
  const [annModal, setAnnModal] = useState(false);
  const [eventForm, setEventForm] = useState(EVENT_EMPTY);
  const [annForm, setAnnForm] = useState(ANN_EMPTY);

  const { data: events, isLoading: evLoading } = useEvents();
  const { data: upcomingEvents } = useEvents(true);
  const { data: announcements, isLoading: annLoading } = useAnnouncements();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const createAnn = useCreateAnnouncement();

  const eventList: any[] = Array.isArray(events) ? events : [];
  const upcomingList: any[] = Array.isArray(upcomingEvents) ? upcomingEvents : [];
  const annList: any[] = (announcements as any)?.data ?? [];

  const handleCreateEvent = async () => {
    await createEvent.mutateAsync(eventForm);
    setEventForm(EVENT_EMPTY);
    setEventModal(false);
    // Notify entire school about the new event
    const date = new Date(eventForm.startAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    await apiClient.post('/notifications/broadcast', {
      title: `🎉 New Event: ${eventForm.title}`,
      body: `A new school event has been scheduled: "${eventForm.title}" on ${date}${eventForm.venue ? ` at ${eventForm.venue}` : ''}. Please mark your calendars.`,
      audience: 'ENTIRE_SCHOOL',
      channels: ['IN_APP'],
    }).catch(() => {});
  };

  const handleCreateAnn = async () => {
    await createAnn.mutateAsync(annForm);
    setAnnForm(ANN_EMPTY);
    setAnnModal(false);
    // Notify entire school about the announcement
    await apiClient.post('/notifications/broadcast', {
      title: `📢 ${annForm.isPinned ? '[Important] ' : ''}${annForm.title}`,
      body: annForm.content,
      audience: 'ENTIRE_SCHOOL',
      channels: ['IN_APP'],
    }).catch(() => {});
  };

  const eventColor = (ev: any) => {
    const now = new Date();
    const start = new Date(ev.startAt);
    const end = new Date(ev.endAt);
    if (end < now) return 'gray';
    if (start <= now && end >= now) return 'green';
    return 'blue';
  };

  const eventLabel = (ev: any) => {
    const now = new Date();
    if (new Date(ev.endAt) < now) return 'Ended';
    if (new Date(ev.startAt) <= now) return 'Ongoing';
    return 'Upcoming';
  };

  return (
    <>
      <Topbar title="Events & Announcements" subtitle="School calendar and communications" />
      <div className="p-6">
        <PageHeader
          title="Events & Announcements"
          action={
            <div className="flex gap-2">
              {tab === 'events' && <button onClick={() => setEventModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ New Event</button>}
              {tab === 'announcements' && <button onClick={() => setAnnModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Announcement</button>}
            </div>
          }
        />

        {/* Upcoming Events highlight */}
        {upcomingList.length > 0 && tab === 'events' && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-5 mb-6 text-white">
            <p className="text-xs font-bold uppercase tracking-wider opacity-75 mb-2">🔔 Next Upcoming Event</p>
            <h3 className="font-black text-xl">{upcomingList[0].title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
              <span>📅 {new Date(upcomingList[0].startAt).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</span>
              {upcomingList[0].venue && <span>📍 {upcomingList[0].venue}</span>}
              <span>{upcomingList.length} upcoming events total</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
          {(['events','announcements'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${tab===t?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {t === 'events' ? `🎉 Events (${eventList.length})` : `📢 Announcements (${annList.length})`}
            </button>
          ))}
        </div>

        {tab === 'events' && (
          evLoading ? <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          : eventList.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-5xl mb-3">🗓️</p><p className="text-gray-400">No events scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventList.map((ev: any) => (
                <div key={ev.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <p className="text-xl font-black text-green-700">{new Date(ev.startAt).getDate()}</p>
                    <p className="text-xs text-green-600 font-bold">{new Date(ev.startAt).toLocaleDateString('en',{month:'short'})}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{ev.title}</h3>
                      <Badge variant={eventColor(ev) as any}>{eventLabel(ev)}</Badge>
                      {ev.isPublic && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Public</span>}
                    </div>
                    {ev.description && <p className="text-sm text-gray-500 mt-0.5">{ev.description}</p>}
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                      <span>🕐 {new Date(ev.startAt).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})} — {new Date(ev.endAt).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})}</span>
                      {ev.venue && <span>📍 {ev.venue}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteEvent.mutate(ev.id)} className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors">🗑️</button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'announcements' && (
          annLoading ? <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          : annList.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-5xl mb-3">📢</p><p className="text-gray-400">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {annList.map((ann: any) => (
                <div key={ann.id} className={`bg-white rounded-xl border shadow-sm p-4 ${ann.isPinned ? 'border-green-200' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {ann.isPinned && <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">📌 Pinned</span>}
                        <h3 className="font-bold text-gray-900">{ann.title}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{ann.content ?? ann.body}</p>
                      <p className="text-xs text-gray-300 mt-2">
                        By {ann.author?.profile?.firstName} {ann.author?.profile?.lastName} · {new Date(ann.createdAt).toLocaleDateString('en-PK')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Create Event Modal */}
      <Modal isOpen={eventModal} onClose={() => setEventModal(false)} title="Create School Event">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title *</label>
            <input value={eventForm.title} onChange={e=>setEventForm(f=>({...f,title:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea value={eventForm.description} onChange={e=>setEventForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400 resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start *</label>
              <input type="datetime-local" value={eventForm.startAt} onChange={e=>setEventForm(f=>({...f,startAt:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">End *</label>
              <input type="datetime-local" value={eventForm.endAt} onChange={e=>setEventForm(f=>({...f,endAt:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Venue</label>
            <input value={eventForm.venue} onChange={e=>setEventForm(f=>({...f,venue:e.target.value}))} placeholder="e.g. Main Hall" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={eventForm.isPublic} onChange={e=>setEventForm(f=>({...f,isPublic:e.target.checked}))} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">Publish to school website</span>
          </label>
          <button onClick={handleCreateEvent} disabled={createEvent.isPending||!eventForm.title||!eventForm.startAt||!eventForm.endAt} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createEvent.isPending ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal isOpen={annModal} onClose={() => setAnnModal(false)} title="Create Announcement">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title *</label>
            <input value={annForm.title} onChange={e=>setAnnForm(f=>({...f,title:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content *</label>
            <textarea value={annForm.content} onChange={e=>setAnnForm(f=>({...f,content:e.target.value}))} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400 resize-none" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={annForm.isPinned} onChange={e=>setAnnForm(f=>({...f,isPinned:e.target.checked}))} className="w-4 h-4 accent-green-600" />
            <span className="text-sm text-gray-700">Pin this announcement</span>
          </label>
          <button onClick={handleCreateAnn} disabled={createAnn.isPending||!annForm.title||!annForm.content} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createAnn.isPending ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </div>
      </Modal>
    </>
  );
}
