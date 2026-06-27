'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useBlogPosts, useCreateBlogPost, usePublishBlogPost } from '@/hooks/use-api';

const CAT_COLOR: Record<string, string> = { news: 'blue', academic: 'purple', sports: 'green', events: 'orange', announcements: 'yellow' };
const EMPTY = { title: '', content: '', category: 'news', excerpt: '' };

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data, isLoading } = useBlogPosts({ search, category: cat });
  const create = useCreateBlogPost();
  const publish = usePublishBlogPost();

  const posts: any[] = data?.data ?? (Array.isArray(data) ? data : []);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Blog" subtitle="School news & articles" />
      <div className="p-6">
        <PageHeader title="School Blog" subtitle={`${posts.length} articles`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Write Article</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Articles', value: posts.length, icon: '📰', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Published', value: posts.filter((p: any) => p.status === 'PUBLISHED').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Drafts', value: posts.filter((p: any) => p.status === 'DRAFT').length, icon: '✏️', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'This Month', value: posts.filter((p: any) => new Date(p.createdAt) > new Date(Date.now() - 30*864e5)).length, icon: '📅', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['', 'news', 'academic', 'sports', 'events'].map(c => (
              <button key={c || 'all'} onClick={() => setCat(c)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all capitalize ${cat === c ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{c || 'All'}</button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading articles...</div>
          : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📰</p>
              <p className="font-medium">{search ? 'No articles found' : 'No blog articles yet'}</p>
              {!search && <p className="text-sm mt-1">Write your first school article</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center text-4xl">📰</div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium bg-${CAT_COLOR[post.category] || 'gray'}-50 text-${CAT_COLOR[post.category] || 'gray'}-600`}>{post.category}</span>
                      <Badge variant={post.status === 'PUBLISHED' ? 'green' : 'yellow'}>{post.status}</Badge>
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{post.title}</p>
                    {post.excerpt && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
                      <div className="flex gap-1">
                        <button onClick={() => setSelected(post)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Read</button>
                        {post.status === 'DRAFT' && (
                          <button onClick={() => publish.mutate(post.id)} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100">Publish</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Write Article">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Article title..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {['news','academic','sports','events','announcements'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Excerpt</label>
            <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Content *</label>
            <textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your article content here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded capitalize">{selected.category}</span>
              <Badge variant={selected.status === 'PUBLISHED' ? 'green' : 'yellow'}>{selected.status}</Badge>
              <span className="text-xs text-gray-400">{formatDate(selected.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
