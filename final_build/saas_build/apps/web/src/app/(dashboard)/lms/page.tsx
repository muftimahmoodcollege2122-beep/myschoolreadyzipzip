'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const COURSES = [
  { id:1, title:'Mathematics Grade 10', subject:'Mathematics', teacher:'Mr. Ali Hassan', students:45, progress:72, lessons:24, assignments:8, status:'PUBLISHED', thumb:'📐' },
  { id:2, title:'Physics Fundamentals', subject:'Physics', teacher:'Ms. Sarah Ahmed', students:38, progress:55, lessons:18, assignments:6, status:'PUBLISHED', thumb:'⚛️' },
  { id:3, title:'English Literature', subject:'English', teacher:'Mr. Bilal Khan', students:52, progress:88, lessons:30, assignments:12, status:'PUBLISHED', thumb:'📖' },
  { id:4, title:'Urdu Grammar & Composition', subject:'Urdu', teacher:'Ms. Nadia Malik', students:60, progress:41, lessons:20, assignments:7, status:'DRAFT', thumb:'✍️' },
  { id:5, title:'Biology Cell Theory', subject:'Biology', teacher:'Dr. Fatima Shah', students:35, progress:65, lessons:22, assignments:9, status:'PUBLISHED', thumb:'🧬' },
  { id:6, title:'Computer Science Python', subject:'Computer', teacher:'Mr. Usman Ali', students:28, progress:33, lessons:16, assignments:5, status:'DRAFT', thumb:'💻' },
];

const QUIZ_QUESTIONS = [
  { q:'What is the value of π (pi)?', opts:['3.14159','2.71828','1.41421','1.61803'], correct:0 },
  { q:'Which formula gives the area of a circle?', opts:['2πr','πr²','πd','r²'], correct:1 },
];

export default function LMSPage() {
  const [view, setView] = useState<'courses'|'assignments'|'quizzes'|'progress'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [createModal, setCreateModal] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number|null>(null);
  const [courseForm, setCourseForm] = useState({ title:'', subject:'', description:'' });

  return (
    <>
      <Topbar title="LMS" subtitle="Learning Management System" />
      <div className="p-6">
        <PageHeader
          title="Learning Management System"
          subtitle={`${COURSES.filter(c=>c.status==='PUBLISHED').length} active courses · ${COURSES.reduce((a,c)=>a+c.students,0)} enrolled students`}
          action={<button onClick={()=>setCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors">+ Create Course</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Courses', value: COURSES.length, icon:'📚', bg:'bg-blue-50', color:'text-blue-600' },
            { label:'Published', value: COURSES.filter(c=>c.status==='PUBLISHED').length, icon:'✅', bg:'bg-green-50', color:'text-green-600' },
            { label:'Total Lessons', value: COURSES.reduce((a,c)=>a+c.lessons,0), icon:'🎬', bg:'bg-purple-50', color:'text-purple-600' },
            { label:'Assignments', value: COURSES.reduce((a,c)=>a+c.assignments,0), icon:'📝', bg:'bg-orange-50', color:'text-orange-600' },
          ].map(s=>(
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-4`}>
              <span className="text-3xl">{s.icon}</span>
              <div><p className={`text-3xl font-black ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 mt-0.5">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['courses','assignments','quizzes','progress'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
              {v==='courses'?'📚 Courses':v==='assignments'?'📝 Assignments':v==='quizzes'?'🎯 Quizzes':'📊 Progress'}
            </button>
          ))}
        </div>

        {view === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COURSES.map(c=>(
              <div key={c.id} onClick={()=>setSelectedCourse(c)} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">{c.thumb}</div>
                  <Badge variant={c.status==='PUBLISHED'?'green':'yellow'}>{c.status}</Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-xs text-gray-400 mb-3">👨‍🏫 {c.teacher}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span>🎬 {c.lessons} lessons</span>
                  <span>📝 {c.assignments} assignments</span>
                  <span>👩‍🎓 {c.students}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5"><span className="text-gray-500">Progress</span><span className="font-bold text-gray-700">{c.progress}%</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${c.progress>=70?'bg-green-500':c.progress>=40?'bg-blue-500':'bg-yellow-500'}`} style={{width:`${c.progress}%`}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'assignments' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">All Assignments</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {COURSES.flatMap(c=>Array.from({length:Math.min(2,c.assignments)},(_, i)=>({
                course: c.title, subject: c.subject, title:`Assignment ${i+1} - ${c.subject}`, due:`Jun ${10+i+c.id}, 2026`, submissions: Math.floor(c.students*0.7), total: c.students, thumb: c.thumb
              }))).map((a,i)=>(
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">{a.thumb}</div>
                    <div><p className="font-semibold text-sm text-gray-900">{a.title}</p><p className="text-xs text-gray-400">{a.course}</p></div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center"><p className="font-bold text-gray-900">{a.submissions}/{a.total}</p><p className="text-xs text-gray-400">Submitted</p></div>
                    <div className="text-center"><p className="text-xs text-gray-500">Due</p><p className="text-xs font-bold text-gray-700">{a.due}</p></div>
                    <Badge variant={a.submissions/a.total>0.8?'green':a.submissions/a.total>0.5?'yellow':'red'}>
                      {Math.round((a.submissions/a.total)*100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'quizzes' && (
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Available Quizzes</h3>
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">+ New Quiz</button>
                </div>
                <div className="space-y-3">
                  {COURSES.slice(0,4).map(c=>(
                    <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer" onClick={()=>setQuizActive(true)}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.thumb}</span>
                        <div><p className="font-semibold text-sm">{c.subject} Quiz — Chapter {c.id}</p><p className="text-xs text-gray-400">{QUIZ_QUESTIONS.length} questions · 20 min</p></div>
                      </div>
                      <button className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200">Start →</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              {quizActive ? (
                <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-3">Q1 of {QUIZ_QUESTIONS.length}</p>
                  <p className="font-bold text-gray-900 mb-4">{QUIZ_QUESTIONS[0].q}</p>
                  <div className="space-y-2">
                    {QUIZ_QUESTIONS[0].opts.map((opt,i)=>(
                      <button key={i} onClick={()=>setQuizAnswer(i)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all ${quizAnswer===i?i===QUIZ_QUESTIONS[0].correct?'bg-green-50 border-green-500 text-green-700':'bg-red-50 border-red-400 text-red-600':'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                        <span className="font-bold mr-2">{String.fromCharCode(65+i)}.</span>{opt}
                      </button>
                    ))}
                  </div>
                  {quizAnswer!==null&&<div className={`mt-3 p-3 rounded-xl text-sm ${quizAnswer===QUIZ_QUESTIONS[0].correct?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>{quizAnswer===QUIZ_QUESTIONS[0].correct?'✅ Correct! Well done.':'❌ Incorrect. The correct answer is A.'}</div>}
                  <button onClick={()=>{setQuizActive(false);setQuizAnswer(null);}} className="mt-3 w-full py-2 border border-gray-200 text-sm text-gray-500 rounded-lg hover:bg-gray-50">Exit Quiz</button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                  <p className="text-4xl mb-3">🎯</p><p className="text-gray-500 text-sm">Select a quiz to start</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'progress' && (
          <div className="space-y-4">
            {COURSES.filter(c=>c.status==='PUBLISHED').map(c=>(
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.thumb}</span>
                    <div><p className="font-bold text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.teacher}</p></div>
                  </div>
                  <div className="text-right"><p className="text-2xl font-black text-gray-900">{c.progress}%</p><p className="text-xs text-gray-400">avg completion</p></div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${c.progress>=70?'bg-green-500':c.progress>=40?'bg-blue-500':'bg-yellow-500'}`} style={{width:`${c.progress}%`}}/>
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-400">
                  <span>{Math.round(c.students*(c.progress/100))} completed</span>
                  <span>{c.students-Math.round(c.students*(c.progress/100))} in progress</span>
                  <span className="ml-auto">{c.lessons} total lessons</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Modal isOpen={!!selectedCourse} onClose={()=>setSelectedCourse(null)} title={selectedCourse.title}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[{l:'Lessons',v:selectedCourse.lessons},{l:'Assignments',v:selectedCourse.assignments},{l:'Students',v:selectedCourse.students}].map(s=>(
                <div key={s.l} className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-2xl font-black text-gray-900">{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Completion Progress</p>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2" style={{width:`${selectedCourse.progress}%`}}>
                  <span className="text-white text-[10px] font-bold">{selectedCourse.progress}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">Lesson Overview</p>
              {Array.from({length:Math.min(5,selectedCourse.lessons)},(_, i)=>(
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i<Math.floor(selectedCourse.lessons*(selectedCourse.progress/100))&&i<5?'bg-green-100 text-green-700':'bg-gray-200 text-gray-500'}`}>{i<Math.floor(selectedCourse.lessons*(selectedCourse.progress/100))&&i<5?'✓':(i+1)}</div>
                  <p className="text-sm text-gray-700">Chapter {i+1}: {['Introduction','Core Concepts','Practice Problems','Advanced Topics','Assessment'][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Course Modal */}
      <Modal isOpen={createModal} onClose={()=>setCreateModal(false)} title="Create New Course">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course Title *</label>
            <input value={courseForm.title} onChange={e=>setCourseForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Mathematics Grade 10" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
            <select value={courseForm.subject} onChange={e=>setCourseForm(f=>({...f,subject:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
              <option value="">Select subject</option>
              {['Mathematics','Physics','Chemistry','Biology','English','Urdu','Computer Science','History'].map(s=><option key={s} value={s}>{s}</option>)}
            </select></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea value={courseForm.description} onChange={e=>setCourseForm(f=>({...f,description:e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"/></div>
          <button disabled={!courseForm.title||!courseForm.subject} onClick={()=>setCreateModal(false)} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50">Create Course</button>
        </div>
      </Modal>
    </>
  );
}
