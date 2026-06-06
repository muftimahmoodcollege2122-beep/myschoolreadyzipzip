'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';
import { DataTable } from '../../../components/shared/data-table';

const CATS_BLOG = ['ANNOUNCEMENT','NEWS','ACHIEVEMENT','EVENT','GENERAL'];
const SV: Record<string,any> = { DRAFT:'gray', PUBLISHED:'green', ARCHIVED:'red' };

export default function BlogPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'posts'|'gallery'>('posts');
  const [createModal, setCreateModal] = useState(false);
  const [albumModal, setAlbumModal] = useState(false);
  const [viewModal, setViewModal] = useState<any>(null);
  const [form, setForm] = useState({ title:'', content:'', category:'ANNOUNCEMENT', tags:'', status:'DRAFT', isFeatured:false, metaDescription:'' });
  const [albumForm, setAlbumForm] = useState({ title:'', description:'', category:'' });
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: posts, isLoading:pl } = useQuery({ queryKey:['blog-posts',filterCat,filterStatus], queryFn:()=>apiClient.get(`/content/blog?category=${filterCat}&status=${filterStatus}`) });
  const { data: albums, isLoading:al } = useQuery({ queryKey:['gallery-albums'], queryFn:()=>apiClient.get('/content/gallery'), enabled:tab==='gallery' });

  const createPost = useMutation({ mutationFn:(d:any)=>apiClient.post('/content/blog',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['blog-posts']});setCreateModal(false);setForm({title:'',content:'',category:'ANNOUNCEMENT',tags:'',status:'DRAFT',isFeatured:false,metaDescription:''});} });
  const publishPost = useMutation({ mutationFn:(id:string)=>apiClient.put(`/content/blog/${id}/publish`,{}), onSuccess:()=>qc.invalidateQueries({queryKey:['blog-posts']}) });
  const deletePost = useMutation({ mutationFn:(id:string)=>apiClient.delete(`/content/blog/${id}`), onSuccess:()=>qc.invalidateQueries({queryKey:['blog-posts']}) });
  const createAlbum = useMutation({ mutationFn:(d:any)=>apiClient.post('/content/gallery',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['gallery-albums']});setAlbumModal(false);setAlbumForm({title:'',description:'',category:''});} });

  const postList: any[] = (posts as any)?.data ?? (Array.isArray(posts) ? posts : []);
  const albumList: any[] = Array.isArray(albums) ? albums : [];
  const totalPosts = postList.length;
  const published = postList.filter((p:any)=>p.status==='PUBLISHED').length;

  const postCols = [
    { key:'title', header:'Post', render:(p:any)=><div><div className="flex items-center gap-2"><p className="font-bold text-sm">{p.title}</p>{p.isFeatured&&<span className="px-1.5 py-0.5 text-[9px] font-black bg-yellow-100 text-yellow-700 rounded">FEATURED</span>}</div><p className="text-xs text-gray-400 mt-0.5">{p.category} · {p.views??0} views</p></div> },
    { key:'author', header:'Author', render:(_p:any)=><span className="text-sm text-gray-500">Admin</span> },
    { key:'status', header:'Status', render:(p:any)=><Badge variant={SV[p.status]}>{p.status}</Badge> },
    { key:'date', header:'Date', render:(p:any)=><span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span> },
    { key:'act', header:'', render:(p:any)=>(
      <div className="flex gap-2">
        <button onClick={()=>setViewModal(p)} className="px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded font-bold">Read</button>
        {p.status==='DRAFT'&&<button onClick={()=>publishPost.mutate(p.id)} className="px-2 py-1 text-xs text-green-700 bg-green-50 rounded font-bold">Publish</button>}
        <button onClick={()=>deletePost.mutate(p.id)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded font-bold">Del</button>
      </div>
    )},
  ];

  return (
    <>
      <Topbar title="Content & Blog" subtitle="Manage blog posts, announcements, and gallery"/>
      <div className="p-6">
        <PageHeader title="Content Management" subtitle={`${published} published · ${totalPosts} total`}
          action={<div className="flex gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg">{(['posts','gallery'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize ${tab===t?'bg-white shadow':''}`}>{t}</button>)}</div>
            {tab==='posts'&&<button onClick={()=>setCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg">+ New Post</button>}
            {tab==='gallery'&&<button onClick={()=>setAlbumModal(true)} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg">+ New Album</button>}
          </div>}/>

        {tab==='posts'&&(<>
          <div className="flex gap-3 mb-4">
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option value="">All Categories</option>{CATS_BLOG.map(c=><option key={c}>{c}</option>)}</select>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option value="">All Statuses</option>{['DRAFT','PUBLISHED','ARCHIVED'].map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm"><DataTable columns={postCols} data={postList} isLoading={pl} emptyMessage="No posts yet. Write your first post!"/></div>
        </>)}

        {tab==='gallery'&&(
          <div className="grid grid-cols-3 gap-4">
            {al?(<div className="col-span-3 flex items-center justify-center py-12"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>):albumList.length===0?(<div className="col-span-3 text-center py-12 text-gray-300">No albums yet. Create your first photo album!</div>):(
              albumList.map((a:any)=>(
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-3xl">📸</span>
                  </div>
                  <p className="font-bold text-sm text-gray-900">{a.title}</p>
                  {a.description&&<p className="text-xs text-gray-400 mt-0.5">{a.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{a._count?.items??0} photos</span>
                    <Badge variant={a.isPublic?'green':'gray'}>{a.isPublic?'Public':'Private'}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <Modal isOpen={createModal} onClose={()=>setCreateModal(false)} title="Create Blog Post" size="lg">
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Post title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">{CATS_BLOG.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label><select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Content</label><textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={8} placeholder="Write your post content here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sans"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tags (comma-separated)</label><input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="school,news,events" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Meta Description (SEO)</label><textarea value={form.metaDescription} onChange={e=>setForm(f=>({...f,metaDescription:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))} id="featured"/><label htmlFor="featured" className="text-sm text-gray-700">Mark as Featured Post ⭐</label></div>
            <div className="flex gap-2 sticky bottom-0 bg-white pt-2">
              <button onClick={()=>setCreateModal(false)} className="flex-1 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={()=>createPost.mutate({...form,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),status:'DRAFT'})} disabled={!form.title||!form.content||createPost.isPending} className="flex-1 py-2 text-sm bg-gray-600 text-white font-bold rounded-lg">Save Draft</button>
              <button onClick={()=>createPost.mutate({...form,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),status:'PUBLISHED'})} disabled={!form.title||!form.content||createPost.isPending} className="flex-1 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg">{createPost.isPending?'Publishing...':'Publish'}</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!viewModal} onClose={()=>setViewModal(null)} title={viewModal?.title??''} size="lg">
          {viewModal&&<div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Badge variant={SV[viewModal.status]}>{viewModal.status}</Badge>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">{viewModal.category}</span>
              {viewModal.isFeatured&&<span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold">⭐ Featured</span>}
            </div>
            <div className="prose prose-sm max-w-none bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewModal.content}</div>
            {viewModal.tags?.length>0&&<div className="flex gap-1.5 flex-wrap">{viewModal.tags.map((t:string)=><span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">#{t}</span>)}</div>}
            <p className="text-xs text-gray-400">Published {new Date(viewModal.createdAt).toLocaleString()} · {viewModal.views??0} views</p>
          </div>}
        </Modal>

        <Modal isOpen={albumModal} onClose={()=>setAlbumModal(false)} title="Create Gallery Album">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Album Title</label><input value={albumForm.title} onChange={e=>setAlbumForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Annual Sports Day 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><textarea value={albumForm.description} onChange={e=>setAlbumForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label><input value={albumForm.category} onChange={e=>setAlbumForm(f=>({...f,category:e.target.value}))} placeholder="Sports, Events, Academics..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>createAlbum.mutate(albumForm)} disabled={!albumForm.title||createAlbum.isPending} className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50">{createAlbum.isPending?'Creating...':'Create Album'}</button>
          </div>
        </Modal>
      </div>
    </>
  );
}
