'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useCommunicationThreads, useCreateThread, useSchoolSection, useCreateSchoolItem } from '../../../hooks/use-api';

const MSG_EMPTY = { to: '', subject: '', message: '', type: 'SMS', audience: 'All Parents' };
const AUDIENCE = ['All Parents','All Students','All Staff','Class 10','Class 9','Class 8','Class 7','Specific Class','Custom'];

const TEMPLATES = [
  { id: 'fee_reminder', label: 'Fee Reminder', icon: '💰', type: 'SMS', text: 'Dear Parent, this is a reminder that the fee payment for {student_name} (Class {class}) amounting to Rs. {amount} was due on {due_date}. Please clear dues immediately. - School Management' },
  { id: 'absent_alert', label: 'Absence Alert', icon: '📋', type: 'WhatsApp', text: 'Dear Parent, your child {student_name} was absent from school today ({date}). Please inform the school office if this was expected. - School Administration' },
  { id: 'exam_schedule', label: 'Exam Schedule', icon: '📝', type: 'SMS', text: 'Important: Exams for Class {class} begin on {date}. Exam timetable has been published on the school portal. Ensure your ward is well prepared. - School' },
  { id: 'event_invite', label: 'Event Invitation', icon: '🎉', type: 'Email', text: 'Dear Parents, you are cordially invited to the Annual Prize Distribution ceremony on {date} at {time}. Venue: School Auditorium. Your presence is highly appreciated. - School' },
  { id: 'result_card', label: 'Result Notification', icon: '🏆', type: 'SMS', text: 'Dear Parent, {student_name}\'s results have been published. Marks: {marks}/{total_marks} ({percentage}%). Report card is available on the parent portal. - School' },
  { id: 'holiday_notice', label: 'Holiday Notice', icon: '🏖️', type: 'SMS', text: 'Dear Parents/Students, school will remain closed on {date} due to {reason}. Classes will resume on {resume_date}. - School Administration' },
];

const AUTOMATION_RULES = [
  { id: 'fee_auto', label: 'Fee Due Reminders', desc: 'Auto-send SMS 3 days before fee due date', channel: 'SMS', status: true },
  { id: 'absent_auto', label: 'Daily Absence Alerts', desc: 'WhatsApp alert to parents when child is marked absent', channel: 'WhatsApp', status: true },
  { id: 'result_auto', label: 'Result Notifications', desc: 'Email parents when results are published', channel: 'Email', status: false },
  { id: 'exam_auto', label: 'Exam Reminders', desc: 'SMS reminder 2 days before exam', channel: 'SMS', status: false },
  { id: 'birthday_auto', label: 'Birthday Greetings', desc: 'Auto-greet students on their birthday', channel: 'WhatsApp', status: false },
];

export default function CommunicationsPage() {
  const [tab, setTab] = useState<'inbox' | 'send' | 'logs' | 'automation'>('inbox');
  const [sendModal, setSendModal] = useState(false);
  const [form, setForm] = useState(MSG_EMPTY);
  const [selected, setSelected] = useState<any>(null);
  const [automationRules, setAutomationRules] = useState(AUTOMATION_RULES);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const { data: threads = [], isLoading: threadsLoading } = useCommunicationThreads({});
  const { data: logs = [] } = useSchoolSection('messageLogs');
  const createLog = useCreateSchoolItem('messageLogs');

  const threadList: any[] = Array.isArray(threads) ? threads : (threads as any)?.data ?? [];
  const logList: any[] = Array.isArray(logs) ? logs : [];

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setForm(f => ({ ...f, message: t.text, type: t.type, subject: t.label }));
  };

  const handleSend = async () => {
    if (!form.subject || !form.message) return;
    setIsSending(true);
    await new Promise(r => setTimeout(r, 800));
    try {
      await createLog.mutateAsync({
        ...form,
        sentAt: isScheduled && scheduledDate ? `${scheduledDate}T${scheduledTime || '09:00'}:00.000Z` : new Date().toISOString(),
        status: isScheduled ? 'SCHEDULED' : 'SENT',
      });
      setSendSuccess(true);
      setTimeout(() => { setSendSuccess(false); setSendModal(false); setForm(MSG_EMPTY); setIsScheduled(false); setScheduledDate(''); }, 1500);
    } finally {
      setIsSending(false);
    }
  };

  const toggleAutomation = (id: string) => {
    setAutomationRules(rules => rules.map(r => r.id === id ? { ...r, status: !r.status } : r));
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  const channelIcon: Record<string,string> = { SMS: '📱', Email: '📧', WhatsApp: '💬', 'Push Notification': '🔔', 'In-App': '🖥️' };

  return (
    <>
      <Topbar title="Communications" subtitle="School messaging & notifications" />
      <div className="p-6">
        <PageHeader title="Communications" subtitle={`${threadList.length} conversations`}
          action={<button onClick={() => setSendModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Send Message</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Conversations', value: threadList.length, icon: '💬', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Messages Sent', value: logList.filter((l: any) => l.status === 'SENT').length, icon: '📤', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Scheduled', value: logList.filter((l: any) => l.status === 'SCHEDULED').length, icon: '🕐', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Auto Rules Active', value: automationRules.filter(r => r.status).length, icon: '⚡', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['inbox','send','logs','automation'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${tab === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
              {v === 'inbox' ? 'Inbox' : v === 'send' ? 'Sent' : v === 'logs' ? 'All Logs' : 'Automation'}
              {v === 'automation' && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">{automationRules.filter(r => r.status).length}</span>}
            </button>
          ))}
        </div>

        {tab === 'inbox' && (
          threadsLoading ? <div className="text-center py-12 text-gray-400">Loading...</div>
          : threadList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">💬</p><p className="font-medium">No conversations yet</p></div>
          ) : (
            <div className="space-y-2">
              {threadList.map((thread: any) => (
                <div key={thread.id} onClick={() => setSelected(thread)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">💬</div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{thread.subject || 'No Subject'}</p>
                        <p className="text-xs text-gray-400">{thread.participants?.map((p: any) => p.user?.profile?.firstName || 'User').join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{formatDate(thread.lastMessageAt || thread.updatedAt)}</p>
                      {!thread.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1"></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'send' && (
          logList.filter((l: any) => l.status === 'SENT').length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">📤</p><p className="font-medium">No sent messages yet</p></div>
          ) : (
            <div className="space-y-3">
              {logList.filter((l: any) => l.status === 'SENT').map((log: any, i: number) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{channelIcon[log.type] ?? '📨'}</span>
                        <p className="font-bold text-gray-900 text-sm">{log.subject}</p>
                      </div>
                      <p className="text-xs text-gray-400 ml-7">To: {log.audience} · {log.type} · {formatDate(log.sentAt)}</p>
                    </div>
                    <Badge variant="green">SENT</Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 ml-7">{log.message}</p>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'logs' && (
          logList.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">📋</p><p className="font-medium">No message logs yet</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Subject</th><th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Audience</th><th className="px-4 py-3 text-left">Sent</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {logList.map((log: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          <span>{channelIcon[log.type] ?? '📨'}</span>
                          {log.subject}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{log.type}</td>
                      <td className="px-4 py-3 text-gray-500">{log.audience}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(log.sentAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={log.status === 'SENT' ? 'green' : log.status === 'SCHEDULED' ? 'yellow' : 'gray'}>{log.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'automation' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-blue-900 text-sm">Automated Messaging Rules</p>
                <p className="text-xs text-blue-600 mt-0.5">Configure automatic SMS, WhatsApp, and Email notifications triggered by school events. Active rules run automatically in the background.</p>
              </div>
            </div>

            <div className="space-y-3">
              {automationRules.map(rule => (
                <div key={rule.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${rule.status ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {channelIcon[rule.channel]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{rule.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{rule.desc}</p>
                        <span className={`text-xs font-medium ${rule.status ? 'text-green-600' : 'text-gray-400'}`}>
                          via {rule.channel}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAutomation(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.status ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${rule.status ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-gray-600 mb-1">Integration Status</p>
              <div className="flex justify-center gap-6 mt-3">
                {[{ name: 'SMS Gateway', status: 'Connected' }, { name: 'WhatsApp API', status: 'Configure' }, { name: 'Email SMTP', status: 'Connected' }].map(s => (
                  <div key={s.name} className="text-center">
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${s.status === 'Connected' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                    <p className="text-xs font-medium text-gray-700">{s.name}</p>
                    <p className={`text-xs ${s.status === 'Connected' ? 'text-green-600' : 'text-yellow-600'}`}>{s.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      <Modal isOpen={sendModal} onClose={() => setSendModal(false)} title="Compose Message">
        <div className="space-y-4">
          {/* Quick Templates */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Quick Templates</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => applyTemplate(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Message Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['SMS','Email','WhatsApp','Push Notification','In-App'].map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Audience</label>
              <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {AUDIENCE.map(a => <option key={a}>{a}</option>)}
              </select></div>
          </div>

          <div><label className="text-xs text-gray-500 mb-1 block">Subject *</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Message subject..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>

          <div><label className="text-xs text-gray-500 mb-1 block">Message *</label>
            <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Write your message here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <p className="text-xs text-gray-400 mt-1">{form.message.length} characters · Variables: {'{student_name}'}, {'{class}'}, {'{date}'}, {'{amount}'}</p>
          </div>

          {/* Schedule option */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setIsScheduled(v => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isScheduled ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isScheduled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs font-medium text-gray-600">Schedule for later</span>
            </div>
            {isScheduled && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><label className="text-xs text-gray-500 mb-1 block">Date</label>
                  <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Time</label>
                  <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
              </div>
            )}
          </div>

          {!isScheduled && (
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              {channelIcon[form.type] ?? '📨'} This will send a {form.type} message to {form.audience}
            </div>
          )}

          {sendSuccess ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
              <span className="text-green-600">✓</span>
              <p className="text-sm font-bold text-green-700">{isScheduled ? 'Message scheduled!' : 'Message sent successfully!'}</p>
            </div>
          ) : (
            <button onClick={handleSend} disabled={isSending || !form.subject || !form.message} className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-green-500">
              {isSending ? 'Sending...' : isScheduled ? `Schedule for ${scheduledDate} ${scheduledTime}` : `Send ${form.type}`}
            </button>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || 'Conversation'}>
        {selected && (
          <div className="p-4">
            <p className="text-sm text-gray-600">{selected.lastMessage || 'No messages yet'}</p>
            <p className="text-xs text-gray-400 mt-2">{formatDate(selected.lastMessageAt || selected.updatedAt)}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
