'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../lib/api-client';
import { Topbar } from '../../../../components/layout/topbar';

type BlockType = 'hero' | 'text' | 'image' | 'gallery' | 'cta' | 'team' | 'faq' | 'stats';

interface PageBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  order: number;
}

interface WebPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  status: 'published' | 'draft';
  blocks: PageBlock[];
  updatedAt: string;
}

const BLOCK_TYPES: { type: BlockType; icon: string; label: string; desc: string }[] = [
  { type: 'hero',    icon: '🎯', label: 'Hero Banner', desc: 'Full-width header with title and CTA' },
  { type: 'text',    icon: '📝', label: 'Text Block',  desc: 'Rich text paragraph or article' },
  { type: 'image',   icon: '🖼️', label: 'Image',       desc: 'Single image with caption' },
  { type: 'gallery', icon: '📸', label: 'Gallery',     desc: 'Image grid or slider' },
  { type: 'stats',   icon: '📊', label: 'Stats',       desc: 'Key numbers and achievements' },
  { type: 'team',    icon: '👥', label: 'Team/Staff',  desc: 'Staff profiles grid' },
  { type: 'faq',     icon: '❓', label: 'FAQ',         desc: 'Frequently asked questions' },
  { type: 'cta',     icon: '🚀', label: 'Call To Action', desc: 'Button with headline' },
];

function BlockEditor({ block, onChange, onDelete }: { block: PageBlock; onChange: (b: PageBlock) => void; onDelete: () => void }) {
  const set = (k: string, v: any) => onChange({ ...block, content: { ...block.content, [k]: v } });

  const renderFields = () => {
    switch (block.type) {
      case 'hero': return (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-gray-500 uppercase">Headline</label><input value={block.content.headline || ''} onChange={e => set('headline', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Subheadline</label><input value={block.content.subheadline || ''} onChange={e => set('subheadline', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Button Text</label><input value={block.content.ctaText || ''} onChange={e => set('ctaText', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Button Link</label><input value={block.content.ctaHref || ''} onChange={e => set('ctaHref', e.target.value)} placeholder="/admissions" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div className="col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Background Image URL</label><input value={block.content.bgImage || ''} onChange={e => set('bgImage', e.target.value)} placeholder="https://..." className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
        </div>
      );
      case 'text': return (
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Heading (optional)</label>
          <input value={block.content.heading || ''} onChange={e => set('heading', e.target.value)} className="w-full mt-1 mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <label className="text-xs font-bold text-gray-500 uppercase">Content</label>
          <textarea rows={5} value={block.content.body || ''} onChange={e => set('body', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
        </div>
      );
      case 'image': return (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="text-xs font-bold text-gray-500 uppercase">Image URL</label><input value={block.content.src || ''} onChange={e => set('src', e.target.value)} placeholder="https://..." className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Caption</label><input value={block.content.caption || ''} onChange={e => set('caption', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Alt Text</label><input value={block.content.alt || ''} onChange={e => set('alt', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
        </div>
      );
      case 'cta': return (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-bold text-gray-500 uppercase">Headline</label><input value={block.content.headline || ''} onChange={e => set('headline', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Subtext</label><input value={block.content.subtext || ''} onChange={e => set('subtext', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Button Label</label><input value={block.content.btnLabel || ''} onChange={e => set('btnLabel', e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
          <div><label className="text-xs font-bold text-gray-500 uppercase">Button Link</label><input value={block.content.btnHref || ''} onChange={e => set('btnHref', e.target.value)} placeholder="/contact" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" /></div>
        </div>
      );
      case 'stats': return (
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(n => (
            <div key={n}>
              <label className="text-xs font-bold text-gray-500 uppercase">Stat {n}</label>
              <input value={block.content[`stat${n}Value`] || ''} onChange={e => set(`stat${n}Value`, e.target.value)} placeholder="500+" className="w-full mt-1 mb-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input value={block.content[`stat${n}Label`] || ''} onChange={e => set(`stat${n}Label`, e.target.value)} placeholder="Students" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
        </div>
      );
      default: return (
        <div className="text-sm text-gray-400 text-center py-4">Block editor for "{block.type}" — configure in upcoming update</div>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">{BLOCK_TYPES.find(b => b.type === block.type)?.icon}</span>
          <span className="font-semibold text-sm text-gray-800">{BLOCK_TYPES.find(b => b.type === block.type)?.label}</span>
        </div>
        <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center text-xs transition-colors">✕</button>
      </div>
      <div className="p-4">{renderFields()}</div>
    </div>
  );
}

export default function PagesBuilderPage() {
  const qc = useQueryClient();
  const [pages, setPages] = useState<WebPage[]>([]);
  const [activePage, setActivePage] = useState<string>('home');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [showNewPage, setShowNewPage] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['web-pages'],
    queryFn: () => apiClient.get('/themes/pages'),
    staleTime: 60000,
  });

  useEffect(() => {
    if (data) setPages(data as WebPage[]);
  }, [data]);

  const mut = useMutation({
    mutationFn: (page: WebPage) => apiClient.put('/themes/pages', page),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); qc.invalidateQueries({ queryKey: ['web-pages'] }); },
  });

  const page = pages.find(p => p.slug === activePage);

  const updatePage = (patch: Partial<WebPage>) =>
    setPages(ps => ps.map(p => p.slug === activePage ? { ...p, ...patch } : p));

  const addBlock = (type: BlockType) => {
    const block: PageBlock = { id: crypto.randomUUID(), type, content: {}, order: (page?.blocks || []).length };
    updatePage({ blocks: [...(page?.blocks || []), block] });
    setShowAddBlock(false);
  };

  const updateBlock = (id: string, b: PageBlock) =>
    updatePage({ blocks: page!.blocks.map(bl => bl.id === id ? b : bl) });

  const deleteBlock = (id: string) =>
    updatePage({ blocks: page!.blocks.filter(bl => bl.id !== id) });

  const moveBlock = (idx: number, dir: 'up' | 'down') => {
    if (!page) return;
    const arr = [...page.blocks];
    const to = dir === 'up' ? idx - 1 : idx + 1;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    updatePage({ blocks: arr.map((b, i) => ({ ...b, order: i })) });
  };

  const addNewPage = () => {
    if (!newPageTitle.trim()) return;
    const slug = newPageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const newPage: WebPage = { slug, title: newPageTitle, metaTitle: '', metaDesc: '', status: 'draft', blocks: [], updatedAt: new Date().toISOString() };
    setPages(p => [...p, newPage]);
    setActivePage(slug);
    setNewPageTitle('');
    setShowNewPage(false);
  };

  const savePage = () => { if (page) mut.mutate(page); };

  return (
    <>
      <Topbar title="Page Builder" subtitle="Build and edit all school website pages" />
      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Pages</p>
            {isLoading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : pages.map(p => (
              <button key={p.slug} onClick={() => setActivePage(p.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors flex items-center justify-between ${activePage === p.slug ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                <span>{p.title}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${activePage === p.slug ? 'bg-white/20 text-white' : p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {p.status === 'published' ? '●' : '○'}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 py-3">
            {showNewPage ? (
              <div>
                <input value={newPageTitle} onChange={e => setNewPageTitle(e.target.value)} placeholder="Page name"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400" autoFocus />
                <div className="flex gap-1">
                  <button onClick={addNewPage} className="flex-1 px-2 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">Add</button>
                  <button onClick={() => setShowNewPage(false)} className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewPage(true)} className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition-colors">+ New Page</button>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {page ? (
            <>
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="font-black text-gray-900">{page.title}</h2>
                  <select value={page.status} onChange={e => updatePage({ status: e.target.value as 'published' | 'draft' })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowAddBlock(true)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors">
                    + Add Block
                  </button>
                  <button onClick={savePage}
                    className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700">
                    {mut.isPending ? 'Saving…' : saved ? '✅ Saved!' : 'Save Page'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <div className="grid grid-cols-2 gap-4 mb-4 bg-white rounded-xl border border-gray-100 p-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">SEO Title</label>
                    <input value={page.metaTitle} onChange={e => updatePage({ metaTitle: e.target.value })} placeholder={page.title}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Meta Description</label>
                    <input value={page.metaDesc} onChange={e => updatePage({ metaDesc: e.target.value })} placeholder="Short page description for search engines"
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>

                {page.blocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-4xl mb-3">🧩</p>
                    <p className="font-bold text-gray-700">No blocks yet</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Add blocks to build your page layout</p>
                    <button onClick={() => setShowAddBlock(true)}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700">+ Add First Block</button>
                  </div>
                ) : (
                  page.blocks.sort((a, b) => a.order - b.order).map((block, idx) => (
                    <div key={block.id} className="relative group">
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                        <button onClick={() => moveBlock(idx, 'up')} disabled={idx === 0}
                          className="w-6 h-6 bg-white border border-gray-200 rounded text-xs disabled:opacity-30 hover:bg-gray-100">↑</button>
                        <button onClick={() => moveBlock(idx, 'down')} disabled={idx === page.blocks.length - 1}
                          className="w-6 h-6 bg-white border border-gray-200 rounded text-xs disabled:opacity-30 hover:bg-gray-100">↓</button>
                      </div>
                      <BlockEditor block={block} onChange={b => updateBlock(block.id, b)} onDelete={() => deleteBlock(block.id)} />
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">Select a page</div>
          )}
        </main>
      </div>

      {showAddBlock && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-gray-900">Add a Block</h3>
              <button onClick={() => setShowAddBlock(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BLOCK_TYPES.map(b => (
                <button key={b.type} onClick={() => addBlock(b.type)}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700">{b.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
