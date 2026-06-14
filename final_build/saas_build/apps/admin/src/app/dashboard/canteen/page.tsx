'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem, useUpdateSchoolItem } from '../../../hooks/use-api';
import { useToast } from '../../../components/shared/toast';

const CATS = ['Main Course', 'Snacks', 'Beverages', 'Desserts', 'Breakfast'];
const EMPTY = { name: '', category: 'Main Course', price: '', available: true, description: '' };

export default function CanteenPage() {
  const { toast } = useToast();
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editItem, setEditItem] = useState<any>(null);

  const { data: menu = [], isLoading } = useSchoolSection('canteen');
  const create = useCreateSchoolItem('canteen');
  const update = useUpdateSchoolItem('canteen');
  const del = useDeleteSchoolItem('canteen');

  const items: any[] = Array.isArray(menu) ? menu : [];
  const filtered = items.filter(m =>
    (!catFilter || m.category === catFilter) &&
    (!search || m.name?.toLowerCase().includes(search.toLowerCase()))
  );
  const available = items.filter(m => m.available);
  const totalRevenue = items.reduce((a, m) => a + (Number(m.price) || 0), 0);

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    if (editItem) {
      try {
      await update.mutateAsync({ id: editItem.id, ...form, price: Number(form.price) });
        toast('Done successfully', 'success');
      } catch (e: any) {
        toast(e?.message || e?.error || 'Operation failed', 'error');
      }
      setEditItem(null);
    } else {
      try {
      await create.mutateAsync({ ...form, price: Number(form.price) });
    }
    setForm(EMPTY); setModal(false);
  };
        toast('Done successfully', 'success');
      } catch (e: any) {
        toast(e?.message || e?.error || 'Operation failed', 'error');
      }

  const openEdit = (item: any) => {
    setForm({ name: item.name, category: item.category, price: String(item.price), available: item.available, description: item.description || '' });
    setEditItem(item); setModal(true);
  };

  return (
    <>
      <Topbar title="Canteen" subtitle="School canteen menu management" />
      <div className="p-6">
        <PageHeader title="Canteen Management" subtitle={`${items.length} items on menu`}
          action={<button onClick={() => { setEditItem(null); setForm(EMPTY); setModal(true); }} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Item</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Menu Items', value: items.length, icon: '🍽️', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Available', value: available.length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Unavailable', value: items.length - available.length, icon: '❌', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Avg Price', value: items.length ? `Rs ${Math.round(totalRevenue / items.length)}` : 'Rs 0', icon: '💰', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {['', ...CATS].map(c => (
              <button key={c || 'all'} onClick={() => setCatFilter(c)} className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${catFilter === c ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{c || 'All'}</button>
            ))}
          </div>
        </div>
        {isLoading ? <div className="text-center py-12 text-gray-400">Loading menu...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🍽️</p>
              <p className="font-medium">{search || catFilter ? 'No items found' : 'No menu items yet'}</p>
              {!search && !catFilter && <p className="text-sm mt-1">Add your first menu item</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item: any) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                      {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                    </div>
                    <Badge variant={item.available ? 'green' : 'red'}>{item.available ? 'Available' : 'Unavailable'}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="font-bold text-green-600">Rs {Number(item.price).toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Edit</button>
                      <button onClick={() => del.mutate(item.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => { setModal(false); setEditItem(null); setForm(EMPTY); }} title={editItem ? 'Edit Menu Item' : 'Add Menu Item'}>
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Item Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chicken Biryani" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Price (Rs) *</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Optional description" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
            Item is currently available
          </label>
          <button onClick={handleSave} disabled={create.isPending || update.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending || update.isPending ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </Modal>
    </>
  );
}
