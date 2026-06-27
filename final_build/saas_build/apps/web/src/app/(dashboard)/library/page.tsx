'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';

const CATS = ['General','Science','Mathematics','History','Literature','Fiction','Reference','Islamic Studies','Urdu','English'];
const EMPTY_BOOK = { title:'', author:'', isbn:'', publisher:'', category:'General', totalCopies:'1', shelfLocation:'', publishYear:'' };

export default function LibraryPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'catalog'|'issued'|'overdue'>('catalog');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [issueModal, setIssueModal] = useState<any>(null);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK);
  const [issueForm, setIssueForm] = useState({ userId:'', dueDays:'14' });
  const [alertsSent, setAlertsSent] = useState<string[]>([]);

  const { data: stats } = useQuery({ queryKey:['lib-stats'], queryFn:()=>apiClient.get('/library/stats') });
  const { data: booksData, isLoading } = useQuery({ queryKey:['books', search, category], queryFn:()=>apiClient.get(`/library/books?search=${search}&category=${category}&limit=100`) });
  const { data: issuedData } = useQuery({ queryKey:['issued'], queryFn:()=>apiClient.get('/library/issues?returned=false') });
  const { data: overdueData } = useQuery({ queryKey:['overdue'], queryFn:()=>apiClient.get('/library/issues?overdue=true') });
  const { data: studentsData } = useQuery({ queryKey:['students-list'], queryFn:()=>apiClient.get('/students?limit=500') });

  const createBook = useMutation({ mutationFn:(d:any)=>apiClient.post('/library/books',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['books']});qc.invalidateQueries({queryKey:['lib-stats']});setAddModal(false);setBookForm(EMPTY_BOOK);} });
  const issueBook  = useMutation({ mutationFn:(d:any)=>apiClient.post('/library/issue',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['issued']});qc.invalidateQueries({queryKey:['books']});setIssueModal(null);setIssueForm({userId:'',dueDays:'14'});} });
  const returnBook = useMutation({ mutationFn:(id:string)=>apiClient.post(`/library/return/${id}`,{}), onSuccess:()=>{qc.invalidateQueries({queryKey:['issued']});qc.invalidateQueries({queryKey:['overdue']});qc.invalidateQueries({queryKey:['books']});} });

  const sendOverdueAlert = async (issue: any) => {
    const name = `${issue.user?.profile?.firstName||''} ${issue.user?.profile?.lastName||''}`.trim();
    const daysOverdue = Math.floor((Date.now() - new Date(issue.dueDate).getTime()) / 86400000);
    const fine = daysOverdue * 5;
    await apiClient.post('/notifications/send-inapp', {
      userId: issue.userId,
      title: '📚 Library Book Overdue',
      body: `"${issue.book?.title}" is overdue by ${daysOverdue} day(s). Fine: Rs. ${fine}. Please return immediately.`,
    });
    setAlertsSent(prev => [...prev, issue.id]);
    alert(`✅ Alert sent to ${name}`);
  };

  const st: any = stats ?? {};
  const books: any[] = (booksData as any)?.data ?? [];
  const issued: any[] = Array.isArray(issuedData) ? issuedData : (issuedData as any)?.data ?? [];
  const overdue: any[] = Array.isArray(overdueData) ? overdueData : (overdueData as any)?.data ?? [];
  const students: any[] = (studentsData as any)?.data ?? [];

  return (
    <>
      <Topbar title="Library" subtitle="Book catalog, issue tracking and overdue alerts" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label:'Total Books',    value: st.totalBooks    ?? 0, color:'bg-blue-600',   icon:'📚' },
            { label:'Available',      value: st.available     ?? 0, color:'bg-green-600',  icon:'✅' },
            { label:'Issued',         value: st.issued        ?? issued.length, color:'bg-amber-500',  icon:'📤' },
            { label:'Overdue',        value: st.overdue       ?? overdue.length, color:'bg-red-600',    icon:'⚠️' },
            { label:'Categories',     value: st.categories    ?? CATS.length,    color:'bg-purple-600', icon:'🗂️' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-5">
          {([['catalog','📚 Catalog'],['issued','📤 Issued'],['overdue','⚠️ Overdue']] as const).map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${tab===k?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {l} {k==='overdue' && overdue.length > 0 && <span className="ml-1 px-1.5 bg-red-500 text-white text-xs rounded-full">{overdue.length}</span>}
            </button>
          ))}
          <div className="ml-auto flex gap-3">
            {tab === 'catalog' && <>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 w-48"/>
              <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">All Categories</option>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => setAddModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">+ Add Book</button>
            </>}
          </div>
        </div>

        {/* Catalog Tab */}
        {tab === 'catalog' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? <div className="text-center py-16 text-gray-400">Loading catalog...</div> :
            books.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">📚</div><p className="font-semibold">No books yet</p><p className="text-sm">Click "+ Add Book" to get started</p></div>
            ) : (
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Book','Author','Category','ISBN','Shelf','Available','Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {books.map((b:any) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-semibold text-sm">{b.title}</p>{b.publishYear && <p className="text-xs text-gray-400">{b.publishYear}</p>}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.author}</td>
                      <td className="px-4 py-3"><Badge variant="blue">{b.category}</Badge></td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{b.isbn || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.shelfLocation || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`font-black text-sm ${b.availableCopies===0?'text-red-600':'text-green-600'}`}>{b.availableCopies ?? b.totalCopies}</span>
                        <span className="text-gray-400 text-xs">/{b.totalCopies}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setIssueModal(b)} disabled={(b.availableCopies ?? b.totalCopies) === 0} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                          {(b.availableCopies ?? b.totalCopies) === 0 ? 'Unavailable' : 'Issue'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Issued Tab */}
        {tab === 'issued' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {issued.length === 0 ? <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">📤</div><p>No books currently issued</p></div> : (
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-100">
                  {['Book','Issued To','Issue Date','Due Date','Status','Action'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {issued.map((i:any) => {
                    const isOverdue = new Date(i.dueDate) < new Date();
                    const daysLeft = Math.ceil((new Date(i.dueDate).getTime() - Date.now()) / 86400000);
                    return (
                      <tr key={i.id} className={`border-b border-gray-50 hover:bg-gray-50 ${isOverdue?'bg-red-50/30':''}`}>
                        <td className="px-4 py-3"><p className="font-semibold text-sm">{i.book?.title}</p><p className="text-xs text-gray-400">{i.book?.author}</p></td>
                        <td className="px-4 py-3"><p className="text-sm font-medium">{i.user?.profile?.firstName} {i.user?.profile?.lastName}</p></td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(i.issuedAt).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</td>
                        <td className="px-4 py-3 text-sm"><span className={isOverdue?'text-red-600 font-black':'text-gray-700'}>{new Date(i.dueDate).toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</span></td>
                        <td className="px-4 py-3">
                          {isOverdue ? <Badge variant="red">⚠️ Overdue {Math.abs(daysLeft)}d</Badge> : <Badge variant="green">{daysLeft}d left</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => returnBook.mutate(i.id)} disabled={returnBook.isPending} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-40">Return</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Overdue Tab */}
        {tab === 'overdue' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {overdue.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-3">✅</div><p className="font-semibold">No overdue books</p><p className="text-sm">All books returned on time</p></div>
            ) : (
              <>
                <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-red-800">⚠️ {overdue.length} overdue books — daily SMS alerts are active (9 AM). Fine: Rs. 5/day per book.</p>
                  <button onClick={() => {
                    overdue.forEach(i => { if (!alertsSent.includes(i.id)) sendOverdueAlert(i); });
                  }} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">🔔 Alert All Now</button>
                </div>
                <table className="w-full">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">
                    {['Book','Borrower','Due Date','Days Overdue','Fine (Rs.)','Alert'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {overdue.map((i:any) => {
                      const daysOverdue = Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 86400000);
                      const fine = daysOverdue * 5;
                      return (
                        <tr key={i.id} className="border-b border-gray-50 hover:bg-red-50/20">
                          <td className="px-4 py-3"><p className="font-semibold text-sm">{i.book?.title}</p><p className="text-xs text-gray-400">{i.book?.author}</p></td>
                          <td className="px-4 py-3"><p className="text-sm font-medium">{i.user?.profile?.firstName} {i.user?.profile?.lastName}</p></td>
                          <td className="px-4 py-3 text-sm text-red-600 font-bold">{new Date(i.dueDate).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</td>
                          <td className="px-4 py-3 text-red-600 font-black text-sm">{daysOverdue} days</td>
                          <td className="px-4 py-3 text-red-700 font-black text-sm">Rs. {fine}</td>
                          <td className="px-4 py-3">
                            {alertsSent.includes(i.id) ? <span className="text-xs text-green-600 font-bold">✅ Sent</span> :
                              <button onClick={() => sendOverdueAlert(i)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">Send Alert</button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {addModal && (
        <Modal title="Add Book to Catalog" onClose={() => setAddModal(false)}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title *</label><input value={bookForm.title} onChange={e=>setBookForm(f=>({...f,title:e.target.value}))} placeholder="Book title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author *</label><input value={bookForm.author} onChange={e=>setBookForm(f=>({...f,author:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select value={bookForm.category} onChange={e=>setBookForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{CATS.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">ISBN</label><input value={bookForm.isbn} onChange={e=>setBookForm(f=>({...f,isbn:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Publisher</label><input value={bookForm.publisher} onChange={e=>setBookForm(f=>({...f,publisher:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shelf Location</label><input value={bookForm.shelfLocation} onChange={e=>setBookForm(f=>({...f,shelfLocation:e.target.value}))} placeholder="A-12" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Copies</label><input type="number" min="1" value={bookForm.totalCopies} onChange={e=>setBookForm(f=>({...f,totalCopies:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"/></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setAddModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => createBook.mutate(bookForm)} disabled={!bookForm.title||!bookForm.author||createBook.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40">{createBook.isPending?'Adding...':'📚 Add Book'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Issue Book Modal */}
      {issueModal && (
        <Modal title={`Issue: ${issueModal.title}`} onClose={() => setIssueModal(null)}>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
              <strong>{issueModal.title}</strong> by {issueModal.author} — Available: {issueModal.availableCopies ?? issueModal.totalCopies} cop{(issueModal.availableCopies ?? issueModal.totalCopies) === 1 ? 'y':'ies'}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Issue To *</label>
              <select value={issueForm.userId} onChange={e=>setIssueForm(f=>({...f,userId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select student</option>
                {students.map((s:any) => <option key={s.userId} value={s.userId}>{s.user?.profile?.firstName} {s.user?.profile?.lastName} — {s.rollNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due in (days)</label>
              <select value={issueForm.dueDays} onChange={e=>setIssueForm(f=>({...f,dueDays:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {['7','14','21','30'].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIssueModal(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => issueBook.mutate({ bookId: issueModal.id, ...issueForm, dueDays: Number(issueForm.dueDays) })} disabled={!issueForm.userId||issueBook.isPending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-40">{issueBook.isPending?'Issuing...':'📤 Issue Book'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
