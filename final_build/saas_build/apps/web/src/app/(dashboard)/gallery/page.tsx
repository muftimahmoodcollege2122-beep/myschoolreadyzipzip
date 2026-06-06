'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Modal } from '../../../components/shared/modal';
import { Badge } from '../../../components/shared/badge';

export default function GalleryPage() {
  const qc = useQueryClient();
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [albumModal, setAlbumModal] = useState(false);
  const [albumForm, setAlbumForm] = useState({ title:'', description:'', category:'' });

  const { data: albums, isLoading } = useQuery({ queryKey:['gallery-albums'], queryFn:()=>apiClient.get('/content/gallery') });
  const { data: albumItems } = useQuery({ queryKey:['album-items', selectedAlbum?.id], queryFn:()=>apiClient.get(`/content/gallery/${selectedAlbum?.id}/items`), enabled:!!selectedAlbum?.id });

  const createAlbum = useMutation({ mutationFn:(d:any)=>apiClient.post('/content/gallery',d), onSuccess:()=>{qc.invalidateQueries({queryKey:['gallery-albums']});setAlbumModal(false);setAlbumForm({title:'',description:'',category:''}); } });
  const deleteAlbum = useMutation({ mutationFn:(id:string)=>apiClient.delete(`/content/gallery/${id}`), onSuccess:()=>qc.invalidateQueries({queryKey:['gallery-albums']}) });

  const albumList: any[] = Array.isArray(albums) ? albums : [];
  const items: any[] = Array.isArray(albumItems) ? albumItems : [];
  const COLORS = ['from-purple-100 to-pink-100','from-blue-100 to-indigo-100','from-green-100 to-teal-100','from-orange-100 to-yellow-100','from-red-100 to-pink-100','from-cyan-100 to-blue-100'];

  return (
    <>
      <Topbar title="Photo Gallery" subtitle="Manage school albums and photos"/>
      <div className="p-6">
        <PageHeader title="Photo Gallery" subtitle={`${albumList.length} albums`}
          action={<button onClick={()=>setAlbumModal(true)} className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg">+ Create Album</button>}/>

        {!selectedAlbum ? (
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/></div>
            ) : albumList.length === 0 ? (
              <div className="text-center py-16 text-gray-300">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-lg font-bold">No Albums Yet</p>
                <p className="text-sm">Create your first photo album to get started</p>
                <button onClick={()=>setAlbumModal(true)} className="mt-4 px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl">+ Create Album</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {albumList.map((a:any,i:number)=>(
                  <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer" onClick={()=>setSelectedAlbum(a)}>
                    <div className={`h-40 bg-gradient-to-br ${COLORS[i%COLORS.length]} flex items-center justify-center relative`}>
                      <span className="text-5xl opacity-70">📷</span>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={e=>{e.stopPropagation();if(confirm('Delete album?'))deleteAlbum.mutate(a.id);}} className="p-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">✕</button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-900">{a.title}</p>
                      {a.description&&<p className="text-xs text-gray-400 mt-0.5">{a.description}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{a._count?.items??0} photos</span>
                        <div className="flex items-center gap-1.5">
                          {a.category&&<span className="text-xs text-gray-400">{a.category}</span>}
                          <Badge variant={a.isPublic?'green':'gray'}>{a.isPublic?'Public':'Private'}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <button onClick={()=>setSelectedAlbum(null)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">← Back</button>
              <div><h2 className="font-bold text-gray-900">{selectedAlbum.title}</h2>{selectedAlbum.description&&<p className="text-xs text-gray-400">{selectedAlbum.description}</p>}</div>
              <Badge variant={selectedAlbum.isPublic?'green':'gray'} className="ml-auto">{selectedAlbum.isPublic?'Public':'Private'}</Badge>
            </div>
            {items.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="text-5xl mb-3">🖼️</div>
                <p className="font-bold text-gray-400">No photos in this album</p>
                <p className="text-xs text-gray-300 mt-1">Upload photos via the API or media management</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {items.map((item:any)=>(
                  <div key={item.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
                    {item.url ? <img src={item.url} alt={item.caption??''} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>}
                    {item.caption&&<div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">{item.caption}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Modal isOpen={albumModal} onClose={()=>setAlbumModal(false)} title="Create Gallery Album">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Album Title</label><input value={albumForm.title} onChange={e=>setAlbumForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Science Fair 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label><textarea value={albumForm.description} onChange={e=>setAlbumForm(f=>({...f,description:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label><input value={albumForm.category} onChange={e=>setAlbumForm(f=>({...f,category:e.target.value}))} placeholder="Sports, Events, Academic..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"/></div>
            <button onClick={()=>createAlbum.mutate(albumForm)} disabled={!albumForm.title||createAlbum.isPending} className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50">{createAlbum.isPending?'Creating...':'Create Album'}</button>
          </div>
        </Modal>
      </div>
    </>
  );
}
