'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useLmsCourses, useCreateLmsCourse, useUpdateLmsCourse, useDeleteLmsCourse } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const QUIZ_QUESTIONS = [
  { q:'What is the value of π (pi)?', opts:['3.14159','2.71828','1.41421','1.61803'], correct:0 },
  { q:'Which formula gives the area of a circle?', opts:['2πr','πr²','πd','r²'], correct:1 },
];

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Urdu','Computer Science','History','Geography','Islamiyat'];
const INIT_FORM = { title:'', subject:'', description:'' };

export default function LMSPage() {
  const { toast } = useToast();
  const [view, setView] = useState<'courses'|'quizzes'|'progress'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [createModal, setCreateModal] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number|null>(null);
  const [courseForm, setCourseForm] = useState(INIT_FORM);
  const [formErr, setFormErr] = useState('');
  const [publishing, setPublishing] = useState<string|null>(null);

  const { data: lmsData, isLoading } = useLmsCourses();
  const createCourse = useCreateLmsCourse();
  const updateCourse = useUpdateLmsCourse();
  const deleteCourse = useDeleteLmsCourse();

  const courses: any[] = (lmsData as any)?.courses ?? [];
  const published = courses.filter((c:any) => c.status === 'PUBLISHED');

  const handleCreate = async () => {
    setFormErr('');
    if (!courseForm.title || !courseForm.subject) { setFormErr('Title and subject are required.'); return; }
    try {
      await createCourse.mutateAsync(courseForm);
      setCreateModal(false);
      setCourseForm(INIT_FORM);
    } catch (e: any) {
      setFormErr(e?.response?.data?.message ?? 'Failed to create course.');
    }
  };

  const togglePublish = async (c: any) => {
    setPublishing(c.id);
    try {
      await updateCourse.mutateAsync({ id: c.id, status: c.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' });
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
    await deleteCourse.mutateAsync(id);
    if (selectedCourse?.id === id) setSelectedCourse(null);
      toast('Done successfully', 'success');
    } catch (e: any) {
      toast(e?.message || e?.error || 'Operation failed', 'error');
    }
  };

  return (
    <>
      <Topbar title="LMS" subtitle="Learning Management System" />
      <div className="p-6">
        <PageHeader
          title="Learning Management System"
          subtitle={isLoading ? 'Loading…' : `${published.length} active courses · ${courses.length} total`}
          action={<button onClick={()=>setCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-colors">+ Create Course</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Courses', value: courses.length, icon:'📚', bg:'bg-blue-50', color:'text-blue-600' },
            { label:'Published', value: published.length, icon:'✅', bg:'bg-green-50', color:'text-green-600' },
            { label:'Drafts', value: courses.filter((c:any)=>c.status==='DRAFT').length, icon:'📝', bg:'bg-yellow-50', color:'text-yellow-600' },
            { label:'Total Lessons', value: courses.reduce((a:number,c:any)=>a+(c.lessons||0),0), icon:'🎬', bg:'bg-purple-50', color:'text-purple-600' },
          ].map(s=>(
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-4`}>
              <span className="text-3xl">{s.icon}</span>
              <div><p className={`text-3xl font-black ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500 mt-0.5">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* View Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['courses','quizzes','progress'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
              {v==='courses'?'📚 Courses':v==='quizzes'?'🎯 Quizzes':'📊 Progress'}
            </button>
          ))}
        </div>

        {view === 'courses' && (
          isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_,i)=><div key={i} className="bg-white rounded-2xl border border-gray-100 h-48 animate-pulse"/>)}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <p className="text-5xl mb-4">📚</p>
              <p className="font-bold text-gray-900 mb-2">No courses yet</p>
              <p className="text-sm text-gray-400 mb-5">Create your first course to get started with the LMS.</p>
              <button onClick={()=>setCreateModal(true)} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">+ Create Course</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c:any)=>(
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl cursor-pointer" onClick={()=>setSelectedCourse(c)}>{c.thumb || '📚'}</div>
                    <Badge variant={c.status==='PUBLISHED'?'green':'yellow'}>{c.status}</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600" onClick={()=>setSelectedCourse(c)}>{c.title}</h3>
                  <p className="text-xs text-gray-400 mb-1">📖 {c.subject}</p>
                  {c.teacher && <p className="text-xs text-gray-400 mb-3">👨‍🏫 {c.teacher}</p>}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span>🎬 {c.lessons||0} lessons</span>
                    <span>📝 {c.assignments||0} assignments</span>
                    <span>👩‍🎓 {c.students||0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={()=>togglePublish(c)}
                      disabled={publishing===c.id}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-60 ${c.status==='PUBLISHED'?'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100':'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}
                    >
                      {publishing===c.id ? '…' : c.status==='PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={()=>handleDelete(c.id)} className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {view === 'quizzes' && (
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Available Quizzes</h3>
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">+ New Quiz</button>
                </div>
                {courses.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Create courses first to add quizzes.</div>
                ) : (
                  <div className="space-y-3">
                    {courses.slice(0,4).map((c:any)=>(
                      <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer" onClick={()=>setQuizActive(true)}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{c.thumb||'📚'}</span>
                          <div><p className="font-semibold text-sm">{c.subject} Quiz</p><p className="text-xs text-gray-400">{QUIZ_QUESTIONS.length} questions · 20 min</p></div>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200">Start →</button>
                      </div>
                    ))}
                  </div>
                )}
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
          published.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-gray-500 text-sm">No published courses yet. Publish a course to track progress.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {published.map((c:any)=>(
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.thumb||'📚'}</span>
                      <div><p className="font-bold text-gray-900">{c.title}</p><p className="text-xs text-gray-400">{c.subject}{c.teacher?` · ${c.teacher}`:''}</p></div>
                    </div>
                    <div className="text-right"><p className="text-2xl font-black text-gray-900">{c.progress||0}%</p><p className="text-xs text-gray-400">avg completion</p></div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${(c.progress||0)>=70?'bg-green-500':(c.progress||0)>=40?'bg-blue-500':'bg-yellow-500'}`} style={{width:`${c.progress||0}%`}}/>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-400">
                    <span>{c.students||0} enrolled</span>
                    <span className="ml-auto">{c.lessons||0} lessons</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Modal isOpen={!!selectedCourse} onClose={()=>setSelectedCourse(null)} title={selectedCourse.title}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[{l:'Lessons',v:selectedCourse.lessons||0},{l:'Assignments',v:selectedCourse.assignments||0},{l:'Students',v:selectedCourse.students||0}].map(s=>(
                <div key={s.l} className="bg-gray-50 rounded-xl p-3 text-center"><p className="text-2xl font-black text-gray-900">{s.v}</p><p className="text-xs text-gray-400">{s.l}</p></div>
              ))}
            </div>
            {selectedCourse.description && <p className="text-sm text-gray-600">{selectedCourse.description}</p>}
            <div className="flex gap-2">
              <button
                onClick={()=>{togglePublish(selectedCourse);setSelectedCourse(null);}}
                className={`flex-1 py-2 text-sm font-bold rounded-xl ${selectedCourse.status==='PUBLISHED'?'bg-yellow-50 text-yellow-700 border border-yellow-200':'bg-green-50 text-green-700 border border-green-200'}`}
              >
                {selectedCourse.status==='PUBLISHED'?'Unpublish Course':'Publish Course'}
              </button>
              <button onClick={()=>handleDelete(selectedCourse.id)} className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50">Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Course Modal */}
      <Modal isOpen={createModal} onClose={()=>{setCreateModal(false);setCourseForm(INIT_FORM);setFormErr('');}} title="Create New Course">
        <div className="space-y-3">
          {formErr && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-600">{formErr}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course Title *</label>
            <input value={courseForm.title} onChange={e=>setCourseForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Mathematics Grade 10" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
            <select value={courseForm.subject} onChange={e=>setCourseForm(f=>({...f,subject:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-blue-400">
              <option value="">Select subject</option>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <textarea value={courseForm.description} onChange={e=>setCourseForm(f=>({...f,description:e.target.value}))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none"/>
          </div>
          <button
            disabled={createCourse.isPending || !courseForm.title || !courseForm.subject}
            onClick={handleCreate}
            className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {createCourse.isPending ? 'Creating…' : 'Create Course'}
          </button>
        </div>
      </Modal>
    </>
  );
}
