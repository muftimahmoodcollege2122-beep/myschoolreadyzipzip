'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const ASSETS = [
  { id:'AST-001', name:'Dell Laptop', category:'Electronics', qty:45, available:38, condition:'Good', location:'Computer Lab', value:85000 },
  { id:'AST-002', name:'Projector', category:'Electronics', qty:12, available:10, condition:'Good', location:'Classrooms', value:55000 },
  { id:'AST-003', name:'Student Chair', category:'Furniture', qty:500, available:480, condition:'Good', location:'All Rooms', value:3500 },
  { id:'AST-004', name:'Whiteboard', category:'Furniture', qty:30, available:28, condition:'Fair', location:'Classrooms', value:8000 },
  { id:'AST-005', name:'Microscope', category:'Lab Equipment', qty:20, available:18, condition:'Excellent', location:'Science Lab', value:35000 },
  { id:'AST-006', name:'Printer', category:'Electronics', qty:8, available:6, condition:'Fair', location:'Admin Office', value:45000 },
  { id:'AST-007', name:'Filing Cabinet', category:'Furniture', qty:15, available:15, condition:'Good', location:'Admin Block', value:12000 },
  { id:'AST-008', name:'Scientific Calculator', category:'Instruments', qty:60, available:55, condition:'Good', location:'Math Dept', value:1800 },
];
const VENDORS = ['TechZone Pvt Ltd','Office Supplies Co','Lab Equipment Hub','Furniture World','Digital Creations'];
const PURCHASES = [
  { item:'Dell Laptop x5', vendor:'TechZone Pvt Ltd', amount:425000, date:'May 15, 2026', status:'RECEIVED', category:'Electronics' },
  { item:'Lab Equipment Kit', vendor:'Lab Equipment Hub', amount:180000, date:'May 20, 2026', status:'RECEIVED', category:'Lab Equipment' },
  { item:'Office Chairs x20', vendor:'Furniture World', amount:70000, date:'Jun 1, 2026', status:'PENDING', category:'Furniture' },
  { item:'Whiteboard x5', vendor:'Office Supplies Co', amount:40000, date:'Jun 3, 2026', status:'ORDERED', category:'Furniture' },
];

export default function InventoryPage() {
  const [view, setView] = useState<'assets'|'purchases'|'vendors'|'analytics'>('assets');
  const [search, setSearch] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name:'', category:'Electronics', qty:'', location:'', value:'' });
  const [category, setCategory] = useState('');

  const categories = [...new Set(ASSETS.map(a=>a.category))];
  const filtered = ASSETS.filter(a=>
    (!search||a.name.toLowerCase().includes(search.toLowerCase())||a.id.toLowerCase().includes(search.toLowerCase())) &&
    (!category||a.category===category)
  );
  const totalValue = ASSETS.reduce((a,i)=>a+i.value*i.qty,0);

  return (
    <>
      <Topbar title="Inventory" subtitle="Asset & stock management" />
      <div className="p-6">
        <PageHeader
          title="Inventory Management"
          subtitle={`${ASSETS.length} asset types · ${ASSETS.reduce((a,i)=>a+i.qty,0)} total items`}
          action={<button onClick={()=>setAddModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500">+ Add Asset</button>}
        />

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Assets', value:ASSETS.reduce((a,i)=>a+i.qty,0).toLocaleString(), icon:'📦', bg:'bg-blue-50', c:'text-blue-600' },
            { label:'Available', value:ASSETS.reduce((a,i)=>a+i.available,0).toLocaleString(), icon:'✅', bg:'bg-green-50', c:'text-green-600' },
            { label:'In Use', value:(ASSETS.reduce((a,i)=>a+i.qty,0)-ASSETS.reduce((a,i)=>a+i.available,0)).toLocaleString(), icon:'🔄', bg:'bg-yellow-50', c:'text-yellow-600' },
            { label:'Total Value', value:`Rs. ${(totalValue/1000000).toFixed(1)}M`, icon:'💰', bg:'bg-purple-50', c:'text-purple-600' },
          ].map(k=>(
            <div key={k.label} className={`${k.bg} rounded-2xl p-4 flex items-center gap-3`}>
              <span className="text-3xl">{k.icon}</span>
              <div><p className={`text-3xl font-black ${k.c}`}>{k.value}</p><p className="text-xs text-gray-500">{k.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
          {(['assets','purchases','vendors','analytics'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {v==='assets'?'📦 Assets':v==='purchases'?'🛒 Purchases':v==='vendors'?'🏪 Vendors':'📊 Analytics'}
            </button>
          ))}
        </div>

        {view === 'assets' && (
          <>
            <div className="flex gap-3 mb-4">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or ID..." className="flex-1 max-w-sm px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/>
              <select value={category} onChange={e=>setCategory(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                <option value="">All Categories</option>
                {categories.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['ID','Asset','Category','Total','Available','Condition','Location','Unit Value'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(a=>(
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{a.id}</td>
                      <td className="px-4 py-3 font-semibold text-sm text-gray-900">{a.name}</td>
                      <td className="px-4 py-3"><Badge variant="blue">{a.category}</Badge></td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">{a.qty}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm font-bold ${a.available/a.qty<0.5?'text-red-600':a.available/a.qty<0.8?'text-yellow-600':'text-green-600'}`}>{a.available}</span>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${a.available/a.qty<0.5?'bg-red-500':a.available/a.qty<0.8?'bg-yellow-500':'bg-green-500'}`} style={{width:`${(a.available/a.qty)*100}%`}}/></div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={a.condition==='Excellent'?'green':a.condition==='Good'?'blue':'yellow'}>{a.condition}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{a.location}</td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-700">Rs. {a.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'purchases' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Purchase Orders</h3>
                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100">+ New Purchase Order</button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['Item','Vendor','Amount','Date','Category','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {PURCHASES.map((p,i)=>(
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-sm text-gray-900">{p.item}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.vendor}</td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-gray-900">Rs. {p.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.date}</td>
                      <td className="px-4 py-3"><Badge variant="blue">{p.category}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={p.status==='RECEIVED'?'green':p.status==='ORDERED'?'blue':'yellow'}>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'vendors' && (
          <div className="grid grid-cols-2 gap-4">
            {VENDORS.map((v,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-700 text-xl">{v[0]}</div>
                  <Badge variant="green">Active</Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{v}</h3>
                <div className="space-y-1.5 text-xs text-gray-400 mt-3">
                  <p>📦 {PURCHASES.filter(p=>p.vendor===v).length} orders</p>
                  <p>💰 Rs. {PURCHASES.filter(p=>p.vendor===v).reduce((a,p)=>a+p.amount,0).toLocaleString()} total</p>
                  <p>📧 vendor{i+1}@example.com</p>
                  <p>📞 +92-21-{1000000+i*111111}</p>
                </div>
                <button className="mt-4 w-full py-1.5 border border-gray-200 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-50">View Orders →</button>
              </div>
            ))}
          </div>
        )}

        {view === 'analytics' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Category Breakdown</h3>
              {categories.map(cat=>{
                const items = ASSETS.filter(a=>a.category===cat);
                const val = items.reduce((a,i)=>a+i.value*i.qty,0);
                const pct = Math.round((val/totalValue)*100);
                return (
                  <div key={cat} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="text-gray-400">Rs. {(val/1000).toFixed(0)}K ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Asset Utilization</h3>
              {ASSETS.map(a=>{
                const util = Math.round(((a.qty-a.available)/a.qty)*100);
                return (
                  <div key={a.id} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{a.name}</span>
                      <span className="text-gray-400">{util}% in use</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${util>80?'bg-red-500':util>50?'bg-yellow-500':'bg-green-500'}`} style={{width:`${util}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={addModal} onClose={()=>setAddModal(false)} title="Add Asset">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Asset Name *</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                {['Electronics','Furniture','Lab Equipment','Instruments','Sports','Other'].map(c=><option key={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity *</label>
              <input type="number" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
              <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Value (Rs.)</label>
              <input type="number" value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"/></div>
          </div>
          <button disabled={!form.name||!form.qty} onClick={()=>setAddModal(false)} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50">Add Asset</button>
        </div>
      </Modal>
    </>
  );
}
