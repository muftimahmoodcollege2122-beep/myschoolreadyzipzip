'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Modal } from '@/components/shared/modal';
import { useGalleryAlbums, useCreateGalleryAlbum } from '@/hooks/use-api';

const EMPTY = { title: '', description: '', category: 'events' };
const ALBUM_EMOJIS = ['🖼️','📸','🎭','⚽','🎓','🏫','🎨','🔬','📚','🎪'];

export default function GalleryPage() {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: albums = [], isLoading } = useGalleryAlbums();
  const create = useCreateGalleryAlbum();

  const albumList: any[] = Array.isArray(albums) ? albums : [];
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleCreate = async () => {
    if (!form.title) return;
    await create.mutateAsync(form);
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Gallery" subtitle="School photo albums & media" />
      <div className="p-6">
        <PageHeader title="Photo Gallery" subtitle={`${albumList.length} albums`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Create Album</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Albums', value: albumList.length, icon: '📁', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Photos', value: albumList.reduce((a: number, al: any) => a + (al.itemCount ?? al._count?.items ?? 0), 0), icon: '📸', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Events', value: albumList.filter((a: any) => a.category === 'events').length, icon: '🎭', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'This Year', value: albumList.filter((a: any) => new Date(a.createdAt).getFullYear() === new Date().getFullYear()).length, icon: '📅', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading albums...</div>
          : albumList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📸</p>
              <p className="font-medium">No albums created yet</p>
              <p className="text-sm mt-1">Create your first photo album</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albumList.map((album: any, i: number) => (
                <div key={album.id} onClick={() => setSelected(album)} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all">
                  <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 h-36 flex items-center justify-center text-6xl">
                    {ALBUM_EMOJIS[i % ALBUM_EMOJIS.length]}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900">{album.title}</p>
                    {album.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{album.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{album.itemCount ?? album._count?.items ?? 0} photos · {formatDate(album.createdAt)}</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded capitalize">{album.category || 'general'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Album">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Album Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Sports Day 2026" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {['events','academic','sports','trips','ceremonies','general'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What is this album about?" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Creating...' : 'Create Album'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="p-6">
            <div className="text-center text-5xl mb-4">📸</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Category</span><span className="font-medium capitalize">{selected.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Photos</span><span className="font-medium">{selected.itemCount ?? selected._count?.items ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Created</span><span className="font-medium">{formatDate(selected.createdAt)}</span></div>
            </div>
            {selected.description && <p className="mt-4 text-sm text-gray-600 leading-relaxed">{selected.description}</p>}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-400">
              <p>📷 Photo upload coming soon</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
