'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem } from '@/hooks/use-api';

const EVENT_TYPE_COLOR: Record<string, string> = { exam: 'red', holiday: 'green', event: 'blue', meeting: 'purple', sports: 'orange' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const EMPTY = { title: '', date: '', endDate: '', type: 'event', description: '' };

export default function AcademicCalendarPage() {
  const [view, setView] = useState<'list' | 'upcoming'>('list');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: events = [], isLoading } = useSchoolSection('calendar');
  const create = useCreateSchoolItem('calendar');
  const del = useDeleteSchoolItem('calendar');

  const allEvents: any[] = Array.isArray(events) ? events : [];
  const now = new Date();
  const filtered = allEvents
    .filter(e => !typeFilter || e.type === typeFilter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = filtered.filter(e => new Date(e.date) >= now);
  const past = filtered.filter(e => new Date(e.date) < now);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const getDaysUntil = (d: string) => Math.ceil((new Date(d).getTime() - now.getTime()) / (1000*60*60*24));

  const handleCreate = async () => {
    if (!form.title || !form.date) return;
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Academic Calendar" subtitle="School events, exams & holidays" />
      <div className="p-6">
        <PageHeader title="Academic Calendar" subtitle={`${allEvents.length} events · ${upcoming.length} upcoming`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Event</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Events', value: allEvents.length, icon: '📅', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Upcoming', value: upcoming.length, icon: '🔜', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Exams', value: allEvents.filter(e => e.type === 'exam').length, icon: '📝', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Holidays', value: allEvents.filter(e => e.type === 'holiday').length, icon: '🎉', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['list','upcoming'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition-all ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{v === 'upcoming' ? 'Upcoming Only' : 'All Events'}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['','exam','holiday','event','meeting','sports'].map(t => (
              <button key={t || 'all'} onClick={() => setTypeFilter(t)} className={`px-3 py-1 text-xs rounded-lg font-medium capitalize transition-all ${typeFilter === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{t || 'All'}</button>
            ))}
          </div>
        </div>

        {isLoading ? <div className="text-center py-12 text-gray-400">Loading calendar...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📅</p>
              <p className="font-medium">No events added yet</p>
              <p className="text-sm mt-1">Add exams, holidays, and school events</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(view === 'upcoming' ? [{ label: 'Upcoming Events', items: upcoming }] : [
                { label: 'Upcoming', items: upcoming },
                { label: 'Past Events', items: past }
              ]).map(group => group.items.length > 0 && (
                <div key={group.label}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{group.label}</p>
                  <div className="space-y-2">
                    {group.items.map((event: any) => {
                      const daysUntil = getDaysUntil(event.date);
                      return (
                        <div key={event.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-10 rounded-full bg-${EVENT_TYPE_COLOR[event.type] || 'blue'}-400`} />
                              <div>
                                <p className="font-bold text-gray-900">{event.title}</p>
                                <p className="text-xs text-gray-400">{formatDate(event.date)}{event.endDate ? ` → ${formatDate(event.endDate)}` : ''}</p>
                                {event.description && <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium bg-${EVENT_TYPE_COLOR[event.type] || 'blue'}-50 text-${EVENT_TYPE_COLOR[event.type] || 'blue'}-600`}>{event.type}</span>
                              {daysUntil > 0 && <span className="text-xs text-gray-400">{daysUntil}d left</span>}
                              <button onClick={() => del.mutate(event.id)} className="text-xs text-red-400 hover:text-red-600 ml-1">✕</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Calendar Event">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Event Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mid-Term Exams" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Event Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {['exam','holiday','event','meeting','sports'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Start Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </Modal>
    </>
  );
}
