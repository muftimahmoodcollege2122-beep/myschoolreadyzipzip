'use client';
import React, { useState } from 'react';
import { useLibraryBooks, useLibraryStats, useLibraryCategories, useBookIssues, useCreateBook, useIssueBook, useReturnBook } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { DataTable } from '../../../components/shared/data-table';
import { useToast } from '../../../components/shared/toast';

export default function LibraryPage() {
  const [tab, setTab] = useState<'catalog'|'issued'>('catalog');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [issueModal, setIssueModal] = useState<any>(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', publisher: '', category: 'General', totalCopies: '1', shelfLocation: '', publishYear: '' });
  const [issueForm, setIssueForm] = useState({ userId: '', dueDays: '14' });

  const { data: stats } = useLibraryStats();
  const { data: categories } = useLibraryCategories();
  const { data: booksData, isLoading } = useLibraryBooks({ search, category, limit: 50 });
  const { data: issuesData, isLoading: issuesLoading } = useBookIssues(false);
  const createBook = useCreateBook();
  const issueBook = useIssueBook();
  const returnBook = useReturnBook();
  const { toast } = useToast();
  const [addErr, setAddErr] = React.useState('');
  const [issueErr, setIssueErr] = React.useState('');

  const books: any[] = (booksData as any)?.data ?? [];
  const issues: any[] = (issuesData as any)?.data ?? [];
  const catList: string[] = Array.isArray(categories) ? categories : ['General', 'Science', 'Mathematics', 'History', 'Literature', 'Fiction', 'Reference'];

  const handleAddBook = async () => {
    setAddErr('');
    try {
      await createBook.mutateAsync(bookForm);
      setBookForm({ title: '', author: '', isbn: '', publisher: '', category: 'General', totalCopies: '1', shelfLocation: '', publishYear: '' });
      setAddModal(false);
      toast('Book added successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to add book';
      setAddErr(msg);
      toast(msg, 'error');
    }
  };

  const handleIssue = async () => {
    setIssueErr('');
    try {
      await issueBook.mutateAsync({ bookId: issueModal?.id, ...issueForm, dueDays: Number(issueForm.dueDays) });
      setIssueForm({ userId: '', dueDays: '14' });
      setIssueModal(null);
      toast('Book issued successfully', 'success');
    } catch (e: any) {
      const msg = e?.message || e?.error || 'Failed to issue book';
      setIssueErr(msg);
      toast(msg, 'error');
    }
  };

  const columns = [
    { key: 'title', header: 'Book', render: (b: any) => <div><p className="text-sm font-semibold text-gray-900">{b.title}</p><p className="text-xs text-gray-400">{b.author} {b.publishYear ? `· ${b.publishYear}` : ''}</p></div> },
    { key: 'category', header: 'Category', render: (b: any) => <Badge variant="blue">{b.category}</Badge> },
    { key: 'isbn', header: 'ISBN', render: (b: any) => <span className="font-mono text-xs text-gray-500">{b.isbn ?? '—'}</span> },
    { key: 'shelf', header: 'Shelf', render: (b: any) => <span className="text-sm text-gray-600">{b.shelfLocation ?? '—'}</span> },
    { key: 'copies', header: 'Copies', render: (b: any) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm"><span className={b.availableCopies === 0 ? 'text-red-600' : 'text-green-600'}>{b.availableCopies}</span>/{b.totalCopies}</span>
        {b.availableCopies === 0 && <Badge variant="red">Full</Badge>}
      </div>
    )},
    { key: 'action', header: '', render: (b: any) => (
      <button onClick={() => setIssueModal(b)} disabled={b.availableCopies === 0} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed">Issue</button>
    )},
  ];

  const issueColumns = [
    { key: 'book', header: 'Book', render: (i: any) => <div><p className="text-sm font-semibold">{i.book?.title}</p><p className="text-xs text-gray-400">{i.book?.author}</p></div> },
    { key: 'user', header: 'Issued To', render: (i: any) => <span className="text-sm">{i.user?.profile?.firstName} {i.user?.profile?.lastName}</span> },
    { key: 'issued', header: 'Issued', render: (i: any) => <span className="text-xs text-gray-500">{new Date(i.issuedAt).toLocaleDateString('en-PK')}</span> },
    { key: 'due', header: 'Due', render: (i: any) => {
      const overdue = new Date(i.dueDate) < new Date();
      return <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>{new Date(i.dueDate).toLocaleDateString('en-PK')}{overdue ? ' ⚠ Overdue' : ''}</span>;
    }},
    { key: 'fine', header: 'Fine', render: (i: any) => i.fineAmount ? <span className="text-red-600 font-mono text-sm">Rs. {i.fineAmount}</span> : <span className="text-gray-400 text-sm">—</span> },
    { key: 'action', header: '', render: (i: any) => (
      <button onClick={() => returnBook.mutate(i.id)} className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">Return</button>
    )},
  ];

  return (
    <>
      <Topbar title="Library" subtitle="Manage books, catalog & borrowing" />
      <div className="p-6">
        <PageHeader
          title="Library Management"
          action={<button onClick={() => setAddModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Book</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Books', value: (stats as any)?.totalBooks ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Available', value: (stats as any)?.availableCopies ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Issued', value: (stats as any)?.totalIssued ?? 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Overdue', value: (stats as any)?.overdue ?? 0, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white/50`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
          {(['catalog','issued'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${tab===t?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {t === 'catalog' ? '📚 Catalog' : '📤 Issued Books'}
            </button>
          ))}
        </div>

        {tab === 'catalog' && (
          <>
            <div className="flex gap-3 mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, author, ISBN..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">All Categories</option>
                {catList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <DataTable columns={columns} data={books} isLoading={isLoading} emptyMessage="No books in catalog. Add your first book!" />
            </div>
          </>
        )}

        {tab === 'issued' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <DataTable columns={issueColumns} data={issues} isLoading={issuesLoading} emptyMessage="No books currently issued" />
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Book to Catalog">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title *</label>
              <input value={bookForm.title} onChange={e => setBookForm(f=>({...f,title:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author *</label>
              <input value={bookForm.author} onChange={e => setBookForm(f=>({...f,author:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">ISBN</label>
              <input value={bookForm.isbn} onChange={e => setBookForm(f=>({...f,isbn:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Publisher</label>
              <input value={bookForm.publisher} onChange={e => setBookForm(f=>({...f,publisher:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
              <input type="number" value={bookForm.publishYear} onChange={e => setBookForm(f=>({...f,publishYear:e.target.value}))} placeholder="2024" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select value={bookForm.category} onChange={e => setBookForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {catList.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Copies</label>
              <input type="number" value={bookForm.totalCopies} onChange={e => setBookForm(f=>({...f,totalCopies:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shelf Location</label>
              <input value={bookForm.shelfLocation} onChange={e => setBookForm(f=>({...f,shelfLocation:e.target.value}))} placeholder="e.g. A-12" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          </div>
          <button onClick={handleAddBook} disabled={createBook.isPending||!bookForm.title||!bookForm.author} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {createBook.isPending ? 'Adding...' : 'Add to Catalog'}
          </button>
        </div>
      </Modal>

      {/* Issue Book Modal */}
      <Modal isOpen={!!issueModal} onClose={() => setIssueModal(null)} title={`Issue: ${issueModal?.title}`}>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">by {issueModal?.author} · {issueModal?.availableCopies} copies available</p>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">User ID (Student/Staff)</label>
            <input value={issueForm.userId} onChange={e => setIssueForm(f=>({...f,userId:e.target.value}))} placeholder="Paste user UUID" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due in (days)</label>
            <input type="number" value={issueForm.dueDays} onChange={e => setIssueForm(f=>({...f,dueDays:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
          <button onClick={handleIssue} disabled={issueBook.isPending||!issueForm.userId} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
            {issueBook.isPending ? 'Processing...' : 'Issue Book'}
          </button>
        </div>
      </Modal>
    </>
  );
}
