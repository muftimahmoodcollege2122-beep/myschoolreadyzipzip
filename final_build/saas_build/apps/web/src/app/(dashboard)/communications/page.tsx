'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const CONVERSATIONS = [
  { id:1, name:'Mr. Ali Hassan', role:'Teacher', avatar:'A', lastMsg:'Please review Ahmad\'s attendance', time:'10:32 AM', unread:2, online:true },
  { id:2, name:'Parent Group — 10-A', role:'Group · 42 parents', avatar:'G', lastMsg:'Reminder: Sports Day June 20', time:'9:15 AM', unread:0, online:false },
  { id:3, name:'Mrs. Sara Khan', role:'Parent', avatar:'S', lastMsg:'Thank you for the quick response', time:'Yesterday', unread:0, online:true },
  { id:4, name:'IT Department', role:'Group · 5 members', avatar:'I', lastMsg:'Server maintenance done', time:'Yesterday', unread:0, online:false },
  { id:5, name:'Bilal Akhtar', role:'Teacher', avatar:'B', lastMsg:'Timetable change for Grade 8', time:'Jun 1', unread:1, online:false },
];

const MESSAGES: Record<number, {from:string;text:string;time:string;mine:boolean}[]> = {
  1: [
    { from:'Mr. Ali Hassan', text:'Good morning! I wanted to discuss Ahmad Ali\'s recent absence. He has missed 3 classes this week.', time:'10:28 AM', mine:false },
    { from:'Admin', text:'Thank you for flagging this. I\'ll send an SMS to his parents right away and follow up.', time:'10:30 AM', mine:true },
    { from:'Mr. Ali Hassan', text:'Please review Ahmad\'s attendance and let me know the action taken.', time:'10:32 AM', mine:false },
  ],
};

const NOTICES = [
  { title:'Annual Sports Day — June 20, 2026', audience:'All Students & Parents', channel:'SMS + App', sent:2847, date:'Jun 3', status:'DELIVERED' },
  { title:'Fee Reminder — June Deadline', audience:'Defaulters Only', channel:'SMS + Email', sent:143, date:'Jun 2', status:'DELIVERED' },
  { title:'PTM on June 13 at 10:00 AM', audience:'All Parents', channel:'WhatsApp + SMS', sent:1924, date:'Jun 1', status:'DELIVERED' },
  { title:'Grade 10 Exam Schedule', audience:'Grade 10 Only', channel:'App Notification', sent:380, date:'May 31', status:'DELIVERED' },
];

const CHANNELS = [
  { name:'WhatsApp Business', icon:'💬', status:'Connected', sent:12450, color:'bg-green-50 text-green-700 border-green-200' },
  { name:'SMS (Twilio)', icon:'📱', status:'Connected', sent:8320, color:'bg-blue-50 text-blue-700 border-blue-200' },
  { name:'Email (SendGrid)', icon:'📧', status:'Connected', sent:5180, color:'bg-purple-50 text-purple-700 border-purple-200' },
  { name:'Push Notifications', icon:'🔔', status:'Active', sent:34200, color:'bg-yellow-50 text-yellow-700 border-yellow-200' },
];

export default function CommunicationsPage() {
  const [view, setView] = useState<'inbox'|'broadcast'|'notices'|'channels'>('inbox');
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState(MESSAGES);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title:'', message:'', audience:'All Students', channel:'SMS' });
  const [noticeModal, setNoticeModal] = useState(false);
  const [sent, setSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [chatMessages, activeChatId]);

  const activeConv = CONVERSATIONS.find(c=>c.id===activeChatId);
  const activeMessages = chatMessages[activeChatId] ?? [];

  const sendMessage = () => {
    if (!messageText.trim()) return;
    setChatMessages(prev=>({...prev,[activeChatId]:[...(prev[activeChatId]??[]),{from:'Admin',text:messageText,time:new Date().toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'}),mine:true}]}));
    setMessageText('');
  };

  const sendBroadcast = () => {
    setSent(true);
    setTimeout(()=>{setSent(false);setBroadcastModal(false);setBroadcastForm({title:'',message:'',audience:'All Students',channel:'SMS'});},2000);
  };

  return (
    <>
      <Topbar title="Communications" subtitle="Messages, broadcasts & notifications" />
      <div className="p-6">
        <PageHeader
          title="Communication Center"
          subtitle="Messaging, announcements, WhatsApp, SMS & email — all in one place"
          action={<button onClick={()=>setBroadcastModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">📣 Send Broadcast</button>}
        />

        {/* Channel Status Row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {CHANNELS.map(ch=>(
            <div key={ch.name} className={`rounded-2xl p-4 border flex items-center gap-3 ${ch.color}`}>
              <span className="text-2xl">{ch.icon}</span>
              <div><p className="font-bold text-sm">{ch.name}</p><p className="text-xs opacity-70">{ch.sent.toLocaleString()} sent</p></div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500"/>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['inbox','broadcast','notices','channels'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {v==='inbox'?'💬 Messages':v==='broadcast'?'📣 Broadcasts':v==='notices'?'📋 Notices':'⚙️ Channels'}
            </button>
          ))}
        </div>

        {view==='inbox' && (
          <div className="flex gap-4 h-[560px]">
            {/* Conversations List */}
            <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <input placeholder="Search conversations..." className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {CONVERSATIONS.map(c=>(
                  <div key={c.id} onClick={()=>setActiveChatId(c.id)} className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors ${activeChatId===c.id?'bg-blue-50 border-r-2 border-blue-500':''}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">{c.avatar}</div>
                      {c.online&&<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className={`text-sm truncate ${c.unread?'font-bold text-gray-900':'font-medium text-gray-700'}`}>{c.name}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{c.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{c.lastMsg}</p>
                    </div>
                    {c.unread>0&&<div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">{c.unread}</div>}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100">
                <button className="w-full py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">+ New Conversation</button>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {activeConv && (
                <>
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">{activeConv.avatar}</div>
                      {activeConv.online&&<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"/>}
                    </div>
                    <div><p className="font-bold text-gray-900">{activeConv.name}</p><p className="text-xs text-gray-400">{activeConv.role} · {activeConv.online?'Online':'Offline'}</p></div>
                    <div className="ml-auto flex gap-2">
                      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">📞</button>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">🎥</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                    {activeMessages.map((m,i)=>(
                      <div key={i} className={`flex gap-3 ${m.mine?'justify-end':''}`}>
                        {!m.mine&&<div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0 mt-1">{activeConv.avatar}</div>}
                        <div className={`max-w-[70%]`}>
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.mine?'bg-blue-600 text-white rounded-tr-sm':'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'}`}>{m.text}</div>
                          <p className={`text-[10px] text-gray-400 mt-1 ${m.mine?'text-right':''}`}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef}/>
                  </div>
                  <div className="px-4 py-4 border-t border-gray-100 bg-white flex gap-3 items-end">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                      <input value={messageText} onChange={e=>setMessageText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Type a message..." className="flex-1 text-sm outline-none bg-transparent"/>
                      <div className="flex gap-1">
                        <button className="text-gray-400 hover:text-gray-600">📎</button>
                        <button className="text-gray-400 hover:text-gray-600">😊</button>
                      </div>
                    </div>
                    <button onClick={sendMessage} disabled={!messageText.trim()} className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-40 transition-colors flex-shrink-0">→</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {view==='broadcast' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[{l:'Sent Today',v:342,icon:'📤'},{l:'Delivered',v:338,icon:'✅'},{l:'Failed',v:4,icon:'❌'},{l:'Total Recipients',v:5624,icon:'👥'}].map(s=>(
                <div key={s.l} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div><p className="text-2xl font-black text-gray-900">{s.v.toLocaleString()}</p><p className="text-xs text-gray-500">{s.l}</p></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Broadcast History</h3>
                <button onClick={()=>setBroadcastModal(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">+ New Broadcast</button>
              </div>
              <div className="divide-y divide-gray-50">
                {NOTICES.map((n,i)=>(
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">👥 {n.audience}</span>
                        <span className="text-xs text-gray-400">📡 {n.channel}</span>
                        <span className="text-xs text-gray-400">📅 {n.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center"><p className="font-black text-gray-900">{n.sent.toLocaleString()}</p><p className="text-xs text-gray-400">sent</p></div>
                      <Badge variant="green">{n.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view==='notices' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Create and manage school notices and announcements</p>
              <button onClick={()=>setNoticeModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500">+ Create Notice</button>
            </div>
            {NOTICES.map((n,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{n.title}</h3>
                    <Badge variant="green">{n.status}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>👥 {n.audience}</span>
                    <span>📡 {n.channel}</span>
                    <span>📅 {n.date}</span>
                    <span className="font-bold text-gray-700">{n.sent.toLocaleString()} recipients</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-lg font-semibold hover:bg-blue-100">Resend</button>
                  <button className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Analytics</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view==='channels' && (
          <div className="grid grid-cols-2 gap-5">
            {[
              { name:'WhatsApp Business API', icon:'💬', connected:true, credits:'Unlimited', desc:'Send messages, documents, and images directly to parents\' WhatsApp numbers.',fields:['Business Phone','API Key','Business ID'] },
              { name:'SMS — Twilio', icon:'📱', connected:true, credits:'1,500 SMS', desc:'Automated SMS for attendance, fees, results, and emergency alerts.',fields:['Account SID','Auth Token','Sender Number'] },
              { name:'Email — SendGrid', icon:'📧', connected:true, credits:'10,000/mo', desc:'Professional HTML email templates for notices, invoices, and reports.',fields:['API Key','Sender Email','From Name'] },
              { name:'Push Notifications', icon:'🔔', connected:true, credits:'Unlimited', desc:'Real-time push notifications to the MySchool mobile app.',fields:['FCM Server Key','APNS Certificate'] },
              { name:'Zoom Integration', icon:'🎥', connected:false, credits:'—', desc:'Schedule and join video meetings, parent-teacher conferences, and online classes.',fields:['API Key','API Secret','Account ID'] },
              { name:'Emergency Alert', icon:'🚨', connected:true, credits:'Priority', desc:'High-priority broadcast to all parents and staff simultaneously.',fields:['Auto-configured'] },
            ].map(ch=>(
              <div key={ch.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ch.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{ch.name}</h3>
                      <p className="text-xs text-gray-400">{ch.credits} · {ch.connected?'Connected':'Not Connected'}</p>
                    </div>
                  </div>
                  <Badge variant={ch.connected?'green':'gray'}>{ch.connected?'Active':'Inactive'}</Badge>
                </div>
                <p className="text-xs text-gray-500 mb-4">{ch.desc}</p>
                <div className="space-y-2">
                  {ch.fields.map(f=>(
                    <div key={f}>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">{f}</label>
                      <input placeholder={f==='Auto-configured'?'Auto-configured':'Enter '+f} disabled={f==='Auto-configured'} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400 bg-gray-50 disabled:text-gray-400"/>
                    </div>
                  ))}
                </div>
                <button className={`mt-4 w-full py-2 text-xs font-bold rounded-xl transition-colors ${ch.connected?'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100':'bg-blue-600 text-white hover:bg-blue-500'}`}>
                  {ch.connected?'Disconnect':'Connect Channel'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal isOpen={broadcastModal} onClose={()=>setBroadcastModal(false)} title="Send Broadcast Message">
        {sent?
          <div className="text-center py-6"><p className="text-4xl mb-3">✅</p><p className="font-black text-green-700 text-xl">Broadcast Sent!</p><p className="text-gray-500 text-sm mt-1">Message delivered to all selected recipients.</p></div>
          :
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Title *</label><input value={broadcastForm.title} onChange={e=>setBroadcastForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Reminder: PTM on Friday" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message *</label><textarea value={broadcastForm.message} onChange={e=>setBroadcastForm(f=>({...f,message:e.target.value}))} rows={4} placeholder="Type your message here..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Audience</label>
                <select value={broadcastForm.audience} onChange={e=>setBroadcastForm(f=>({...f,audience:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                  {['All Students','All Parents','All Teachers','All Staff','Grade 10 Only','Fee Defaulters','Custom Group'].map(a=><option key={a}>{a}</option>)}
                </select></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Channel</label>
                <select value={broadcastForm.channel} onChange={e=>setBroadcastForm(f=>({...f,channel:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                  {['SMS','WhatsApp','Email','Push Notification','SMS + WhatsApp','All Channels'].map(c=><option key={c}>{c}</option>)}
                </select></div>
            </div>
            <button disabled={!broadcastForm.title||!broadcastForm.message} onClick={sendBroadcast} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50">📣 Send to {broadcastForm.audience}</button>
          </div>
        }
      </Modal>
    </>
  );
}
