'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const MENU_ITEMS = [
  { id: 1, name: 'Chicken Sandwich', category: 'Snacks', price: 120, stock: 45, sold: 23, calories: 380, isAvailable: true, image: '🥪' },
  { id: 2, name: 'Vegetable Soup', category: 'Hot Meals', price: 80, stock: 30, sold: 18, calories: 150, isAvailable: true, image: '🍲' },
  { id: 3, name: 'Biryani (Half)', category: 'Hot Meals', price: 200, stock: 50, sold: 35, calories: 620, isAvailable: true, image: '🍛' },
  { id: 4, name: 'Milk Pack (250ml)', category: 'Drinks', price: 70, stock: 100, sold: 62, calories: 180, isAvailable: true, image: '🥛' },
  { id: 5, name: 'Fresh Juice', category: 'Drinks', price: 100, stock: 40, sold: 28, calories: 120, isAvailable: true, image: '🧃' },
  { id: 6, name: 'Samosa (2pcs)', category: 'Snacks', price: 60, stock: 80, sold: 55, calories: 240, isAvailable: true, image: '🥟' },
  { id: 7, name: 'Daal Rice Combo', category: 'Hot Meals', price: 150, stock: 40, sold: 29, calories: 480, isAvailable: false, image: '🍱' },
  { id: 8, name: 'Fruit Chaat', category: 'Healthy', price: 90, stock: 25, sold: 15, calories: 110, isAvailable: true, image: '🍎' },
  { id: 9, name: 'Cheese Paratha', category: 'Snacks', price: 100, stock: 35, sold: 42, calories: 350, isAvailable: true, image: '🫓' },
  { id: 10, name: 'Water Bottle', category: 'Drinks', price: 30, stock: 200, sold: 88, calories: 0, isAvailable: true, image: '💧' },
];

const TRANSACTIONS = [
  { id: 'TXN-001', student: 'Ahmed Ali', class: '10-A', items: 'Biryani + Juice', total: 300, time: '12:32 PM', method: 'Card', date: 'Jun 6, 2026' },
  { id: 'TXN-002', student: 'Sara Khan', class: '8-B', items: 'Sandwich + Milk', total: 190, time: '12:15 PM', method: 'Cash', date: 'Jun 6, 2026' },
  { id: 'TXN-003', student: 'Omar Hassan', class: '6-C', items: 'Samosa + Water', total: 90, time: '10:45 AM', method: 'Card', date: 'Jun 6, 2026' },
  { id: 'TXN-004', student: 'Bilal Qureshi', class: '9-B', items: 'Paratha + Tea', total: 130, time: '8:30 AM', method: 'Cash', date: 'Jun 6, 2026' },
  { id: 'TXN-005', student: 'Fatima Shah', class: '12-A', items: 'Fruit Chaat + Juice', total: 190, time: '1:05 PM', method: 'Card', date: 'Jun 6, 2026' },
];

const CATEGORIES = ['All', 'Hot Meals', 'Snacks', 'Drinks', 'Healthy'];

export default function CanteenPage() {
  const [view, setView] = useState<'menu' | 'orders' | 'reports' | 'stock'>('menu');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<{ item: typeof MENU_ITEMS[0]; qty: number }[]>([]);
  const [orderModal, setOrderModal] = useState(false);
  const [addItemModal, setAddItemModal] = useState(false);

  const filtered = MENU_ITEMS.filter(m => category === 'All' || m.category === category);
  const todayRevenue = TRANSACTIONS.reduce((a, t) => a + t.total, 0);
  const totalSold = MENU_ITEMS.reduce((a, m) => a + m.sold, 0);

  const addToCart = (item: typeof MENU_ITEMS[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  };
  const cartTotal = cart.reduce((a, c) => a + c.item.price * c.qty, 0);

  return (
    <>
      <Topbar title="Canteen & Store" subtitle="Food menu, orders & revenue tracking" />
      <div className="p-6">
        <PageHeader title="School Canteen" subtitle="Menu management & daily operations"
          action={
            <div className="flex gap-2">
              <button onClick={() => setOrderModal(true)} className={`px-3 py-2 border text-sm rounded-lg hover:bg-gray-50 ${cart.length > 0 ? 'border-green-300 text-green-600 bg-green-50' : 'border-gray-200'}`}>
                🛒 Cart ({cart.length})
              </button>
              <button onClick={() => setAddItemModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Add Item</button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today's Revenue", value: `Rs ${todayRevenue.toLocaleString()}`, icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Items Sold Today', value: totalSold, icon: '🍽️', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Menu Items', value: MENU_ITEMS.filter(m => m.isAvailable).length, icon: '✅', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Transactions Today', value: TRANSACTIONS.length, icon: '🧾', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          {(['menu', 'orders', 'reports', 'stock'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all capitalize ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v}
            </button>
          ))}
        </div>

        {/* Menu */}
        {view === 'menu' && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${category === c ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(item => (
                <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${!item.isAvailable ? 'opacity-60 border-gray-100' : 'border-gray-100 hover:border-green-300 hover:shadow-md'}`}>
                  <div className="text-3xl mb-2">{item.image}</div>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-sm text-gray-800">{item.name}</h3>
                    {!item.isAvailable && <Badge variant="red">Sold Out</Badge>}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{item.category} · {item.calories} kcal</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">Rs {item.price}</span>
                    <button onClick={() => item.isAvailable && addToCart(item)} className={`text-xs px-3 py-1.5 rounded-lg ${item.isAvailable ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                      {cart.find(c => c.item.id === item.id) ? `+${cart.find(c => c.item.id === item.id)?.qty}` : 'Add'}
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs text-gray-400">
                    <span>Stock: {item.stock}</span><span>·</span><span>Sold: {item.sold}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {view === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-600">Today's transactions — Jun 6, 2026</p>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['TXN #', 'Student', 'Items', 'Total', 'Payment', 'Time'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {TRANSACTIONS.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{t.id}</td>
                    <td className="px-4 py-3"><p className="font-medium">{t.student}</p><p className="text-xs text-gray-400">{t.class}</p></td>
                    <td className="px-4 py-3 text-gray-600">{t.items}</td>
                    <td className="px-4 py-3 font-bold text-green-600">Rs {t.total}</td>
                    <td className="px-4 py-3"><Badge variant={t.method === 'Card' ? 'blue' : 'green'}>{t.method}</Badge></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{t.time}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr><td colSpan={3} className="px-4 py-3 font-bold text-sm">TOTAL TODAY</td>
                  <td className="px-4 py-3 font-bold text-green-600">Rs {todayRevenue.toLocaleString()}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Reports */}
        {view === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Top Selling Items</h3>
              {[...MENU_ITEMS].sort((a, b) => b.sold - a.sold).slice(0, 5).map((item, i) => (
                <div key={item.id} className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-gray-300 w-5">{i + 1}</span>
                  <span className="text-xl">{item.image}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.name}</p>
                    <div className="bg-gray-100 h-1.5 rounded-full mt-1"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(item.sold / 88) * 100}%` }} /></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{item.sold} sold</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Weekly Revenue</h3>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => {
                const rev = [3200, 4100, 3800, 4500, 5200, 2100][i];
                return (
                  <div key={d} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500 w-8">{d}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(rev / 5200) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-16">Rs {(rev / 1000).toFixed(1)}K</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock */}
        {view === 'stock' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">Inventory levels for all canteen items</p>
              <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg">Update Stock</button>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                {['Item', 'Category', 'Current Stock', 'Sold Today', 'Reorder Level', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {MENU_ITEMS.map(m => {
                  const lvl = m.stock <= 15 ? 'LOW' : m.stock <= 30 ? 'MEDIUM' : 'GOOD';
                  return (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span>{m.image}</span><span className="font-medium">{m.name}</span></div></td>
                      <td className="px-4 py-3 text-gray-500">{m.category}</td>
                      <td className="px-4 py-3 font-bold">{m.stock}</td>
                      <td className="px-4 py-3 text-gray-500">{m.sold}</td>
                      <td className="px-4 py-3 text-gray-400">20</td>
                      <td className="px-4 py-3"><Badge variant={lvl === 'LOW' ? 'red' : lvl === 'MEDIUM' ? 'yellow' : 'green'}>{lvl}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cart / Order Modal */}
      <Modal isOpen={orderModal} onClose={() => setOrderModal(false)} title="New Order">
        <div className="p-6">
          <div><label className="text-xs text-gray-500 mb-1 block">Student</label>
            <input type="text" placeholder="Search student..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-4" />
          </div>
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No items in cart. Go to Menu to add items.</p>
          ) : (
            <div>
              {cart.map(c => (
                <div key={c.item.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div className="flex items-center gap-2"><span>{c.item.image}</span><span className="text-sm">{c.item.name}</span></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCart(prev => prev.map(p => p.item.id === c.item.id ? { ...p, qty: Math.max(0, p.qty - 1) } : p).filter(p => p.qty > 0))} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs">−</button>
                    <span className="text-sm font-bold w-4 text-center">{c.qty}</span>
                    <button onClick={() => addToCart(c.item)} className="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-xs text-green-600">+</button>
                    <span className="text-sm font-bold text-green-600 w-16 text-right">Rs {c.item.price * c.qty}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm border-t border-gray-200 pt-2 mt-2">
                <span>Total</span><span className="text-green-600">Rs {cartTotal}</span>
              </div>
              <div className="mt-4"><label className="text-xs text-gray-500 mb-1 block">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Cash</option><option>Student Card</option><option>Digital Wallet</option>
                </select>
              </div>
              <button className="mt-4 w-full py-2 bg-green-600 text-white text-sm rounded-lg">Place Order</button>
            </div>
          )}
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={addItemModal} onClose={() => setAddItemModal(false)} title="Add Menu Item">
        <div className="p-6 space-y-4">
          <div><label className="text-xs text-gray-500 mb-1 block">Item Name</label>
            <input type="text" placeholder="e.g. Chicken Roll" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option>Hot Meals</option><option>Snacks</option><option>Drinks</option><option>Healthy</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Price (Rs)</label>
              <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Initial Stock</label>
              <input type="number" placeholder="50" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Calories</label>
              <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <button className="w-full py-2 bg-green-600 text-white text-sm rounded-lg">Add to Menu</button>
        </div>
      </Modal>
    </>
  );
}
