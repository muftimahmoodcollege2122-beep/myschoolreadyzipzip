'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';

const AI_FEATURES = [
  { icon: '📋', title: 'Generate Notice', desc: 'Create school announcements & circulars instantly', prompt: 'Generate a school notice for parent-teacher meeting next Friday at 10 AM.' },
  { icon: '🗓️', title: 'Create Timetable', desc: 'AI-powered weekly timetable generation', prompt: 'Create a weekly timetable for Grade 10 with subjects: Math, Physics, Chemistry, English, Urdu, Computer Science, Pakistan Studies, Biology.' },
  { icon: '📝', title: 'Create Exam Paper', desc: 'Generate exam questions for any subject', prompt: 'Create a 20-mark Mathematics exam paper for Grade 8 covering fractions, percentages, and basic algebra.' },
  { icon: '📊', title: 'Report Card', desc: 'Generate student performance summaries', prompt: 'Generate a detailed performance report card for a student with 85% attendance, A+ in Math, B in English, A in Science.' },
  { icon: '📣', title: 'SMS/Email Template', desc: 'Write fee reminders, event invites, alerts', prompt: 'Write an SMS template to remind parents that fee payment for June 2026 is due by June 15.' },
  { icon: '✅', title: 'Homework Assignment', desc: 'Generate homework tasks for any topic', prompt: 'Create a homework assignment for Grade 6 English: Reading comprehension exercise with 5 questions based on a short story.' },
  { icon: '🎯', title: 'Lesson Plan', desc: 'AI-crafted lesson plans for teachers', prompt: 'Create a detailed 45-minute lesson plan for teaching Photosynthesis to Grade 7 Biology students.' },
  { icon: '📈', title: 'Analytics Insight', desc: 'Interpret school data and suggest improvements', prompt: 'Our school has 78% attendance rate and 15% fee default rate. Provide strategic recommendations to improve both metrics.' },
];

const AI_RESPONSES: Record<string, string> = {
  'Generate a school notice for parent-teacher meeting next Friday at 10 AM.': `📋 SCHOOL NOTICE

TO ALL PARENTS & GUARDIANS

Subject: Parent-Teacher Meeting — Friday, June 13, 2026

Dear Parent/Guardian,

We cordially invite you to attend the Parent-Teacher Meeting scheduled on **Friday, June 13, 2026 at 10:00 AM** in the School Assembly Hall.

The meeting will cover:
• Academic progress review for each student
• Attendance and discipline updates  
• Upcoming examination schedule
• Fee payment status discussion

Your presence is highly encouraged to support your child's academic growth.

Please bring your child's previous report card if available.

Warm regards,  
School Administration  
MySchool Academy`,

  'Create a weekly timetable for Grade 10': `🗓️ GRADE 10 — WEEKLY TIMETABLE

| Period | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday |
|--------|---------|---------|-----------|----------|--------|---------|
| 8:00 | Math | Physics | English | Chemistry | Math | Urdu |
| 8:45 | Math | Physics | English | Chemistry | Biology | Computer |
| 9:30 | Physics | Math | Chemistry | English | Physics | Math |
| 10:15 | Break | Break | Break | Break | Break | Break |
| 11:00 | Chemistry | English | Math | Pak Studies | English | Biology |
| 11:45 | Biology | Urdu | Computer | Biology | Chemistry | Pak Studies |
| 12:30 | Urdu | Pak Studies | Urdu | Computer | Urdu | Computer |
| 1:15 | Computer | Biology | Pak Studies | Math | Pak Studies | — |

Total Weekly Hours: Math(8) · Physics(6) · English(6) · Chemistry(6) · Biology(5) · Urdu(5) · CS(4) · Pak Studies(4)`,

  default: `✅ AI Response Generated

Based on your request, here is the AI-generated content:

**Analysis Complete** — The system has processed your request and generated optimized content tailored to your school's curriculum and standards.

Key highlights:
• Content aligned with national curriculum standards
• Age-appropriate language and complexity
• Includes assessment criteria and learning objectives
• Ready to use — can be exported as PDF or Word document

Would you like me to:
1. Refine or customize this further?
2. Generate a variation with different parameters?
3. Create a printable version?

Type your follow-up instruction below. 🎯`
};

type Message = { role: 'user'|'assistant'; content: string; time: string };

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hello! I\'m your AI School Assistant. I can help you generate notices, timetables, exam papers, report cards, lesson plans, and much more. What would you like to create today?', time: new Date().toLocaleTimeString('en-PK', {hour:'2-digit',minute:'2-digit'}) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string|null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text, time: new Date().toLocaleTimeString('en-PK', {hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const key = Object.keys(AI_RESPONSES).find(k => text.toLowerCase().includes(k.split(' ').slice(0,4).join(' ').toLowerCase()));
    const response = key ? AI_RESPONSES[key] : AI_RESPONSES.default;
    const aiMsg: Message = { role: 'assistant', content: response, time: new Date().toLocaleTimeString('en-PK', {hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const useFeature = (f: typeof AI_FEATURES[0]) => {
    setActiveFeature(f.title);
    sendMessage(f.prompt);
  };

  return (
    <>
      <Topbar title="AI Assistant" subtitle="AI-powered school management tools" />
      <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
        <PageHeader title="AI Command Center" subtitle="Generate notices, timetables, exams, reports & more with AI" />

        <div className="flex gap-5 flex-1 min-h-0">
          {/* Feature Shortcuts */}
          <div className="w-72 flex-shrink-0 overflow-y-auto">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">AI Capabilities</p>
            <div className="space-y-1.5">
              {AI_FEATURES.map(f => (
                <button
                  key={f.title}
                  onClick={() => useFeature(f)}
                  className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm ${activeFeature===f.title?'bg-blue-50 border-blue-200':'bg-white border-gray-100 hover:border-blue-200'}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl flex-shrink-0">{f.icon}</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{f.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5 leading-tight">{f.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white">
              <p className="text-xs font-black uppercase tracking-wide mb-1">🤖 Powered by GPT-4</p>
              <p className="text-xs text-white/70">Unlimited AI generations included in your plan</p>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm min-h-0">
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black">🤖</div>
              <div><p className="font-bold text-gray-900 text-sm">MySchool AI</p><p className="text-xs text-green-500 font-medium">● Online</p></div>
              <div className="ml-auto flex gap-2">
                <button onClick={()=>setMessages([{role:'assistant',content:'Chat cleared! How can I help you?',time:new Date().toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'})}])} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">Clear Chat</button>
                <button className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 font-semibold">Export PDF</button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role==='user'?'justify-end':''}`}>
                  {m.role==='assistant'&&<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0 mt-1">🤖</div>}
                  <div className={`max-w-[80%] ${m.role==='user'?'order-first':''}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role==='user'?'bg-blue-600 text-white rounded-tr-sm':'bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                      {m.content}
                    </div>
                    <p className={`text-[10px] text-gray-300 mt-1 ${m.role==='user'?'text-right':''}`}>{m.time}</p>
                  </div>
                  {m.role==='user'&&<div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0 mt-1">A</div>}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0">🤖</div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}/><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}/></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Quick Prompts */}
            <div className="px-5 py-2 border-t border-gray-50 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
              {['Write a notice','Create timetable','Generate exam','Homework task'].map(p=>(
                <button key={p} onClick={()=>sendMessage(p)} className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full whitespace-nowrap hover:bg-blue-100 transition-colors border border-blue-100">{p}</button>
              ))}
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage(input))}
                placeholder="Ask AI to generate notices, timetables, exam papers, reports..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"
              />
              <button
                onClick={()=>sendMessage(input)}
                disabled={!input.trim()||loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              >
                {loading?'...':'Send →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
