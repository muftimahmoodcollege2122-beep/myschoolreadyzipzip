'use client';
import React, { useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/shared/badge';
import { Modal } from '@/components/shared/modal';
import { useSchoolSection, useCreateSchoolItem, useDeleteSchoolItem, useUpdateSchoolItem } from '@/hooks/use-api';

const CATS = ['Furniture','Electronics','Stationery','Sports Equipment','Lab Equipment','Books','Cleaning','Other'];
const EMPTY = { name: '', category: 'Furniture', quantity: '', minStock: '', unitCost: '', location: '', condition: 'Good', supplier: '' };

export default function InventoryPage() {
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: inventory = [], isLoading } = useSchoolSection('inventory');
  const create = useCreateSchoolItem('inventory');
  const del = useDeleteSchoolItem('inventory');

  const items: any[] = Array.isArray(inventory) ? inventory : [];
  const filtered = items.filter(i =>
    (!catFilter || i.category === catFilter) &&
    (!search || i.name?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalValue = items.reduce((a, i) => a + (Number(i.quantity) || 0) * (Number(i.unitCost) || 0), 0);
  const lowStock = items.filter(i => Number(i.quantity) <= Number(i.minStock || 5) && Number(i.quantity) > 0);
  const outOfStock = items.filter(i => Number(i.quantity) === 0);

  const handleCreate = async () => {
    if (!form.name) return;
    await create.mutateAsync({ ...form, quantity: Number(form.quantity), minStock: Number(form.minStock || 5), unitCost: Number(form.unitCost) });
    setForm(EMPTY); setModal(false);
  };

  return (
    <>
      <Topbar title="Inventory" subtitle="School inventory & stock management" />
      <div className="p-6">
        <PageHeader title="Inventory Management" subtitle={`${items.length} items tracked`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Item</button>}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Items', value: items.length, icon: '📦', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Value', value: `Rs ${(totalValue/1000).toFixed(0)}K`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Low Stock', value: lowStock.length, icon: '⚠️', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Out of Stock', value: outOfStock.length, icon: '❌', color: 'text-red-600', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {lowStock.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-yellow-800 text-sm">{lowStock.length} items are running low on stock</p>
              <p className="text-xs text-yellow-600">{lowStock.map(i => i.name).join(', ')}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {['', ...CATS].map(c => (
              <button key={c || 'all'} onClick={() => setCatFilter(c)} className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${catFilter === c ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{c || 'All'}</button>
            ))}
          </div>
        </div>

        {isLoading ? <div className="text-center py-12 text-gray-400">Loading inventory...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📦</p>
              <p className="font-medium">{search || catFilter ? 'No items found' : 'No inventory items yet'}</p>
              {!search && !catFilter && <p className="text-sm mt-1">Start tracking your school inventory</p>}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Item</th><th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Unit Cost</th>
                  <th className="px-4 py-3 text-right">Total Value</th><th className="px-4 py-3 text-left">Condition</th>
                  <th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Action</th>
                </tr></thead>
                <tbody>
                  {filtered.map((item: any) => {
                    const qty = Number(item.quantity) || 0;
                    const minStock = Number(item.minStock) || 5;
                    const isLow = qty <= minStock && qty > 0;
                    const isOut = qty === 0;
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-gray-500">{item.category}</td>
                        <td className={`px-4 py-3 text-right font-bold ${isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-gray-800'}`}>{qty}</td>
                        <td className="px-4 py-3 text-right text-gray-600">Rs {Number(item.unitCost||0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-600">Rs {(qty * Number(item.unitCost||0)).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{item.condition}</td>
                        <td className="px-4 py-3"><Badge variant={isOut ? 'red' : isLow ? 'yellow' : 'green'}>{isOut ? 'Out' : isLow ? 'Low' : 'OK'}</Badge></td>
                        <td className="px-4 py-3"><button onClick={() => del.mutate(item.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Inventory Item">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Item Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Whiteboard Marker" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Condition</label>
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                {['New','Good','Fair','Poor'].map(c => <option key={c}>{c}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Min Stock</label>
              <input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Unit Cost (Rs)</label>
              <input type="number" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          {[['location','Storage Location'],['supplier','Supplier']].map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} /></div>
          ))}
          <button onClick={handleCreate} disabled={create.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {create.isPending ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </Modal>
    </>
  );
}
