'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const SCHOOLS = [
  { id:1, name:'Beacon House School System', slug:'beacon', students:3200, plan:'Pro', status:'ACTIVE', revenue:'Rs. 480K', joined:'Jan 2025' },
  { id:2, name:'City Grammar School', slug:'cgs', students:1800, plan:'Growth', status:'ACTIVE', revenue:'Rs. 234K', joined:'Mar 2025' },
  { id:3, name:'Roots International', slug:'roots', students:4100, plan:'Pro', status:'ACTIVE', revenue:'Rs. 615K', joined:'Nov 2024' },
  { id:4, name:'The Educators', slug:'educators', students:950, plan:'Growth', status:'ACTIVE', revenue:'Rs. 168K', joined:'Feb 2025' },
  { id:5, name:'Happy Home School', slug:'happy', students:420, plan:'Starter', status:'TRIAL', revenue:'Rs. 0', joined:'Jun 2025' },
  { id:6, name:'Al-Huda Institute', slug:'alhuda', students:680, plan:'Starter', status:'ACTIVE', revenue:'Rs. 60K', joined:'Apr 2025' },
  { id:7, name:'DHA College', slug:'dha', students:2100, plan:'Pro', status:'SUSPENDED', revenue:'Rs. 0', joined:'Sep 2024' },
];
const PAYMENTS = [
  { school:'Beacon House', amount:'Rs. 29,999', plan:'Pro', date:'Jun 1, 2026', method:'Bank Transfer', status:'PAID' },
  { school:'Roots International', amount:'Rs. 29,999', plan:'Pro', date:'Jun 1, 2026', method:'Bank Transfer', status:'PAID' },
  { school:'City Grammar', amount:'Rs. 12,999', plan:'Growth', date:'Jun 1, 2026', method:'JazzCash', status:'PAID' },
  { school:'The Educators', amount:'Rs. 12,999', plan:'Growth', date:'May 31, 2026', method:'Stripe', status:'PAID' },
  { school:'Al-Huda Institute', amount:'Rs. 4,999', plan:'Starter', date:'May 31, 2026', method:'EasyPaisa', status:'FAILED' },
];

const NAV = [
  { icon:'🏠', label:'Dashboard', href:'/super-admin' },
  { icon:'🏫', label:'Schools', href:'#schools' },
  { icon:'💳', label:'Subscriptions', href:'#subscriptions' },
  { icon:'💰', label:'Payments', href:'#payments' },
  { icon:'🌐', label:'Domains', href:'#' },
  { icon:'👤', label:'Users', href:'#' },
  { icon:'🎧', label:'Support', href:'#' },
  { icon:'📊', label:'Analytics', href:'#' },
  { icon:'🤖', label:'AI Center', href:'#' },
  { icon:'⚙️', label:'Settings', href:'#' },
];

export default function SuperAdminPage() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [search, setSearch] = useState('');

  const filtered = SCHOOLS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const totalRevenue = SCHOOLS.filter(s=>s.status==='ACTIVE').length * 15000;

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><span className="text-white font-black">M</span></div>
            <div><p className="text-white font-bold text-sm">MySchool</p><p className="text-slate-500 text-[10px]">SUPER ADMIN</p></div>
          </div>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map(n=>(
            <button key={n.label} onClick={()=>setActiveNav(n.label)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${activeNav===n.label?'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500':'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <Link href="/login" className="block text-center py-2 text-xs font-semibold text-slate-500 hover:text-white transition-colors">← Back to School Portal</Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Topbar */}
        <div className="sticky top-0 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 h-14 flex items-center justify-between z-10">
          <h1 className="text-white font-bold">Super Admin — Platform Overview</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-full font-medium">SUPER ADMIN</span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">S</div>
          </div>
        </div>

        <div className="p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label:'Total Schools', value: SCHOOLS.length, sub:`${SCHOOLS.filter(s=>s.status==='ACTIVE').length} active`, icon:'🏫', color:'from-blue-600 to-blue-700' },
              { label:'Active Students', value:'12,450', sub:'+234 this month', icon:'👩‍🎓', color:'from-green-600 to-green-700' },
              { label:'Monthly Revenue', value:'Rs. 1.56M', sub:'+12% vs last month', icon:'💰', color:'from-purple-600 to-purple-700' },
              { label:'Active Staff', value:'1,842', sub:'across all schools', icon:'👥', color:'from-orange-600 to-orange-700' },
            ].map(k=>(
              <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-5 text-white`}>
                <div className="flex items-start justify-between mb-3"><span className="text-2xl">{k.icon}</span><span className="text-white/60 text-xs bg-white/10 px-2 py-0.5 rounded-full">↑</span></div>
                <p className="text-3xl font-black">{k.value}</p>
                <p className="text-white/70 text-xs mt-1">{k.label}</p>
                <p className="text-white/50 text-[10px] mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-5 mb-6">
            {/* Revenue Chart */}
            <div className="col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div><h3 className="text-white font-bold">Revenue Growth</h3><p className="text-slate-500 text-xs">Monthly recurring revenue (MRR)</p></div>
                <select className="bg-slate-800 border border-slate-700 text-slate-400 text-xs px-2 py-1 rounded-lg">
                  <option>Last 12 months</option>
                </select>
              </div>
              <div className="flex items-end gap-2 h-40 mb-2">
                {[820,940,890,1050,1120,1180,1250,1320,1410,1480,1520,1560].map((v,i)=>(
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-slate-500 text-[9px]">{i===11?`${v}K`:''}</span>
                    <div className={`w-full rounded-t-md transition-all ${i===11?'bg-blue-500':'bg-blue-500/40 hover:bg-blue-500/60'}`} style={{height:`${(v/1600)*100}%`}}/>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-slate-600 text-[10px]">
                {['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'].map(m=><span key={m}>{m}</span>)}
              </div>
            </div>

            {/* School Distribution */}
            <div className="col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Plan Distribution</h3>
              <div className="space-y-3">
                {[
                  { plan:'Pro', count:3, pct:43, color:'bg-blue-500' },
                  { plan:'Growth', count:2, pct:29, color:'bg-green-500' },
                  { plan:'Starter', count:2, pct:28, color:'bg-yellow-500' },
                ].map(p=>(
                  <div key={p.plan}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{p.plan}</span>
                      <span className="text-slate-500">{p.count} schools ({p.pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full`} style={{width:`${p.pct}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-2">Status breakdown</p>
                {[{s:'Active',c:5,color:'text-green-400'},{s:'Trial',c:1,color:'text-yellow-400'},{s:'Suspended',c:1,color:'text-red-400'}].map(x=>(
                  <div key={x.s} className="flex justify-between text-xs py-1"><span className="text-slate-400">{x.s}</span><span className={`font-bold ${x.color}`}>{x.c}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* Schools Table */}
          <div id="schools" className="bg-slate-900 border border-slate-800 rounded-2xl mb-6">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div><h3 className="text-white font-bold">Schools</h3><p className="text-slate-500 text-xs">{SCHOOLS.length} registered schools</p></div>
              <div className="flex gap-3">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schools..." className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-2 rounded-xl outline-none focus:border-blue-500 placeholder-slate-500 w-56" />
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">+ Add School</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['School','Students','Plan','Revenue','Joined','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map(s=>(
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">{s.name[0]}</div>
                          <div><p className="text-white text-sm font-medium">{s.name}</p><p className="text-slate-500 text-xs">{s.slug}.myschool.pk</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm font-mono">{s.students.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${s.plan==='Pro'?'bg-purple-500/20 text-purple-400':s.plan==='Growth'?'bg-blue-500/20 text-blue-400':'bg-slate-700 text-slate-400'}`}>{s.plan}</span></td>
                      <td className="px-4 py-3 text-slate-300 text-sm font-mono">{s.revenue}/mo</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.joined}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${s.status==='ACTIVE'?'bg-green-500/20 text-green-400':s.status==='TRIAL'?'bg-yellow-500/20 text-yellow-400':'bg-red-500/20 text-red-400'}`}>{s.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded-lg transition-colors">View</button>
                          <button className="text-xs text-slate-400 hover:text-white px-2 py-1 hover:bg-slate-700 rounded-lg transition-colors">Login As</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments */}
          <div id="payments" className="bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-white font-bold">Latest Payments</h3>
              <p className="text-slate-500 text-xs">Recent subscription transactions</p>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-slate-800">{['School','Amount','Plan','Date','Method','Status'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-800/50">
                {PAYMENTS.map((p,i)=>(
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 text-sm">{p.school}</td>
                    <td className="px-4 py-3 text-white font-mono text-sm font-bold">{p.amount}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{p.plan}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.date}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.method}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status==='PAID'?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
