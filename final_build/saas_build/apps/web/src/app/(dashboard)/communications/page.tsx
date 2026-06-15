'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';

const AUDIENCES = [
  { value: 'ALL_PARENTS',   label: '👨‍👩‍👧 All Parents',    desc: 'Send to all parent accounts' },
  { value: 'ALL_STUDENTS',  label: '🎓 All Students',   desc: 'Send to all student accounts' },
  { value: 'ALL_TEACHERS',  label: '👩‍🏫 All Teachers',   desc: 'Send to all teaching staff' },
  { value: 'ALL_STAFF',     label: '👥 All Staff',       desc: 'Teachers + admin staff' },
  { value: 'ENTIRE_SCHOOL', label: '🏫 Entire School',  desc: 'Everyone — parents, students, teachers' },
];
const CHANNELS = [
  { value: 'IN_APP', label: '🔔 In-App',    desc: 'Push to dashboard' },
  { value: 'SMS',    label: '📱 SMS',       desc: 'Text message (charges may apply)' },
  { value: 'EMAIL',  label: '📧 Email',     desc: 'Email to registered address' },
];
const TEMPLATES = [
  { title: 'School Closed Tomorrow', body: 'Dear Parents, please be informed that the school will remain closed tomorrow due to [reason]. Classes will resume on [date]. Thank you for your understanding.' },
  { title: 'Fee Reminder', body: 'Dear Parent, this is a reminder that the fee for [month] is due by [date]. Please pay on time to avoid late charges. Contact accounts for any queries.' },
  { title: 'Exam Schedule', body: 'Dear Students and Parents, the examination schedule has been published. Please login to your portal to view the timetable. Best of luck to all students!' },
  { title: 'Result Announcement', body: 'Dear Parents, results for [exam name] have been published. Please login to the parent portal to view your child\'s report card.' },
  { title: 'Event Reminder', body: 'Dear Parents, reminder that [event name] is scheduled for [date] at [time]. Please ensure your child attends in [dress code/required items].' },
  { title: 'Holiday Notice', body: 'Dear Parents, the school will observe [holiday] on [date]. Classes will resume on [next school day]. Wishing you a happy [holiday].' },
];

export default function CommunicationsPage() {
  const qc = useQueryClient();
  const [audience, setAudience] = useState('ALL_PARENTS');
  const [channels, setChannels] = useState<string[]>(['IN_APP']);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState<any[]>([]);
  const [tab, setTab] = useState<'compose'|'history'>('compose');

  const { data: schoolData } = useQuery({ queryKey:['school-data'], queryFn:()=>apiClient.get('/school-data') });
  const schoolId = (schoolData as any)?.school?.id;

  const broadcast = useMutation({
    mutationFn: () => apiClient.post('/notifications/broadcast', { schoolId, title, body, audience, channels }),
    onSuccess: (res: any) => {
      setSent(prev => [{ id: Date.now(), title, body, audience, channels, sentAt: new Date().toISOString(), recipientCount: res.count ?? '?' }, ...prev]);
      setTitle(''); setBody('');
      alert(`✅ Message sent to ${res.count ?? 'all'} recipients!`);
    },
  });

  const toggleChannel = (c: string) => setChannels(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev,c]);

  return (
    <>
      <Topbar title="Communications" subtitle="Send announcements and alerts to your school community" />
      <div className="p-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Messages Today',  value: sent.length, color:'bg-blue-600',   icon:'📤' },
            { label:'Total Recipients',value: sent.reduce((a,s)=>a+(s.recipientCount||0),0), color:'bg-green-600',  icon:'👥' },
            { label:'SMS Sent',        value: sent.filter(s=>s.channels?.includes('SMS')).length, color:'bg-purple-600', icon:'📱' },
            { label:'Channels Active', value: channels.length, color:'bg-amber-500',  icon:'📡' },
          ].map(s=>(
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          {(['compose','history'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${tab===t?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{t==='compose'?'✍️ Compose':'📋 Sent History'}</button>
          ))}
        </div>

        {tab==='compose' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Compose Panel */}
            <div className="col-span-2 space-y-5">
              {/* Audience */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 mb-3">1. Select Audience</h3>
                <div className="grid grid-cols-1 gap-2">
                  {AUDIENCES.map(a=>(
                    <button key={a.value} onClick={()=>setAudience(a.value)} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${audience===a.value?'border-blue-500 bg-blue-50':'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                      <span className="text-xl">{a.label.split(' ')[0]}</span>
                      <div>
                        <p className={`text-sm font-bold ${audience===a.value?'text-blue-700':'text-gray-900'}`}>{a.label.slice(2)}</p>
                        <p className="text-xs text-gray-500">{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 mb-3">2. Delivery Channels</h3>
                <div className="grid grid-cols-3 gap-3">
                  {CHANNELS.map(c=>(
                    <button key={c.value} onClick={()=>toggleChannel(c.value)} className={`p-3 rounded-xl border-2 transition-all text-left ${channels.includes(c.value)?'border-blue-500 bg-blue-50':'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                      <p className="text-xl mb-1">{c.label.split(' ')[0]}</p>
                      <p className={`text-sm font-bold ${channels.includes(c.value)?'text-blue-700':'text-gray-900'}`}>{c.label.slice(2)}</p>
                      <p className="text-xs text-gray-500">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 mb-3">3. Write Message</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject / Title *</label>
                    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. School Closed Tomorrow" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Body *</label>
                    <textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} placeholder="Type your message here..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"/>
                    <p className="text-xs text-gray-400 mt-1">{body.length} characters {channels.includes('SMS') && body.length > 160 ? `(${Math.ceil(body.length/160)} SMS parts)` : ''}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={()=>broadcast.mutate()}
                disabled={!title||!body||channels.length===0||broadcast.isPending}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-base hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >{broadcast.isPending ? '📤 Sending...' : `🚀 Send to ${AUDIENCES.find(a=>a.value===audience)?.label}`}</button>
            </div>

            {/* Templates Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-black text-gray-900 mb-3">📋 Quick Templates</h3>
                <div className="space-y-2">
                  {TEMPLATES.map((t,i)=>(
                    <button key={i} onClick={()=>{setTitle(t.title);setBody(t.body)}} className="w-full p-3 bg-gray-50 hover:bg-blue-50 rounded-xl text-left transition-colors">
                      <p className="text-sm font-bold text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.body}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {(title || body) && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-black text-gray-900 mb-3">👁️ Preview</h3>
                  <div className="bg-gray-900 rounded-xl p-4 text-white text-sm">
                    <p className="font-bold text-yellow-400 mb-1">{title || 'No title'}</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{body || 'No message'}</p>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {channels.map(c=><span key={c} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">{c}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='history' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {sent.length===0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-semibold">No messages sent yet</p>
                <p className="text-sm mt-1">Sent messages will appear here</p>
              </div>
            ) : (
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Title','Audience','Channels','Recipients','Sent At'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sent.map(s=>(
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-semibold text-sm">{s.title}</p><p className="text-xs text-gray-400 line-clamp-1">{s.body}</p></td>
                      <td className="px-4 py-3 text-sm">{AUDIENCES.find(a=>a.value===s.audience)?.label}</td>
                      <td className="px-4 py-3"><div className="flex gap-1">{s.channels.map((c:string)=><span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">{c}</span>)}</div></td>
                      <td className="px-4 py-3 text-sm font-bold text-green-700">{s.recipientCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.sentAt).toLocaleString('en-PK')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  );
}
