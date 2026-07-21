'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenantsList, usePlatformSummary, useImpersonateTenant, useSuspendTenant, useReactivateTenant } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';

const NAV = [
  { icon:'🏠', label:'Dashboard', href:'/super-admin' },
  { icon:'🏫', label:'Schools', href:'#schools' },
  { icon:'💳', label:'Subscriptions', href:'#subscriptions' },
  { icon:'💰', label:'Payments', href:'/super-admin/payments' },
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
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);

  const { data: tenantsData, isLoading: tenantsLoading } = useTenantsList();
  const { data: summary, isLoading: summaryLoading } = usePlatformSummary();
  const impersonate = useImpersonateTenant();
  const suspend = useSuspendTenant();
  const reactivate = useReactivateTenant();
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const schools = (tenantsData as any[]) || [];
  const filtered = schools.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const s = (summary as any) || {};

  const loginAs = (tenantId: string) => {
    setPendingActionId(tenantId);
    impersonate.mutate(tenantId, {
      onSuccess: (res: any) => { setAuth(res.user, res.accessToken, res.refreshToken); router.push('/dashboard'); },
      onSettled: () => setPendingActionId(null),
    });
  };
  const toggleSuspend = (t: any) => {
    setPendingActionId(t.id);
    const mut = t.status === 'SUSPENDED' ? reactivate : suspend;
    mut.mutate(t.id, { onSettled: () => setPendingActionId(null) });
  };

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
            n.href.startsWith('#') ? (
              <button key={n.label} onClick={()=>setActiveNav(n.label)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${activeNav===n.label?'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500':'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                <span>{n.icon}</span><span>{n.label}</span>
              </button>
            ) : (
              <Link key={n.label} href={n.href} onClick={()=>setActiveNav(n.label)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${activeNav===n.label?'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500':'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                <span>{n.icon}</span><span>{n.label}</span>
              </Link>
            )
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
            {summaryLoading ? [...Array(4)].map((_,i)=><div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"/>) : [
              { label:'Total Schools', value: s.totalSchools ?? 0, sub:`${s.byStatus?.ACTIVE ?? 0} active`, icon:'🏫', color:'from-blue-600 to-blue-700' },
              { label:'Active Students', value: (s.totalStudents ?? 0).toLocaleString(), sub:'across all schools', icon:'👩‍🎓', color:'from-green-600 to-green-700' },
              { label:'Monthly Revenue (est.)', value:`Rs. ${((s.totalRevenue ?? 0)/1000).toFixed(0)}K`, sub:'based on plan list price', icon:'💰', color:'from-purple-600 to-purple-700' },
              { label:'Active Staff', value: (s.activeStaff ?? 0).toLocaleString(), sub:'across all schools', icon:'👥', color:'from-orange-600 to-orange-700' },
            ].map(k=>(
              <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-5 text-white`}>
                <div className="flex items-start justify-between mb-3"><span className="text-2xl">{k.icon}</span></div>
                <p className="text-3xl font-black">{k.value}</p>
                <p className="text-white/70 text-xs mt-1">{k.label}</p>
                <p className="text-white/50 text-[10px] mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-5 mb-6">
            {/* Plan Distribution — real, no fabricated revenue-growth chart (no historical MRR data source yet) */}
            <div className="col-span-12 lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Plan Distribution</h3>
              {summaryLoading ? <div className="h-32 bg-slate-800 rounded-xl animate-pulse"/> : (
                <div className="space-y-3">
                  {Object.entries(s.byTier || {}).map(([plan, count]: [string, any])=>{
                    const pct = s.totalSchools ? Math.round((count / s.totalSchools) * 100) : 0;
                    const color = plan==='PRO'?'bg-blue-500':plan==='GROWTH'?'bg-green-500':plan==='ENTERPRISE'?'bg-purple-500':'bg-yellow-500';
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{plan}</span><span className="text-slate-500">{count} schools ({pct}%)</span></div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{width:`${pct}%`}}/></div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-2">Status breakdown</p>
                {Object.entries(s.byStatus || {}).map(([status, count]: [string, any])=>(
                  <div key={status} className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">{status}</span>
                    <span className={`font-bold ${status==='ACTIVE'?'text-green-400':status==='TRIAL'?'text-yellow-400':'text-red-400'}`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schools Table */}
          <div id="schools" className="bg-slate-900 border border-slate-800 rounded-2xl mb-6">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div><h3 className="text-white font-bold">Schools</h3><p className="text-slate-500 text-xs">{schools.length} registered schools</p></div>
              <div className="flex gap-3">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schools..." className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-2 rounded-xl outline-none focus:border-blue-500 placeholder-slate-500 w-56" />
              </div>
            </div>
            <div className="overflow-x-auto">
              {tenantsLoading ? <div className="p-6 space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse"/>)}</div> : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    {['School','Students','Plan','Revenue','Joined','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map(t=>(
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">{t.name[0]}</div>
                          <div><p className="text-white text-sm font-medium">{t.name}</p><p className="text-slate-500 text-xs">{t.slug}.myschool.pk</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm font-mono">{t.students.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.tier==='PRO'?'bg-purple-500/20 text-purple-400':t.tier==='GROWTH'?'bg-blue-500/20 text-blue-400':'bg-slate-700 text-slate-400'}`}>{t.tier}</span></td>
                      <td className="px-4 py-3 text-slate-300 text-sm font-mono">Rs. {t.mrr.toLocaleString()}/mo</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.status==='ACTIVE'?'bg-green-500/20 text-green-400':t.status==='TRIAL'?'bg-yellow-500/20 text-yellow-400':'bg-red-500/20 text-red-400'}`}>{t.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={()=>loginAs(t.id)} disabled={pendingActionId===t.id} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50">
                            {pendingActionId===t.id && impersonate.isPending ? '…' : 'Login As'}
                          </button>
                          <button onClick={()=>toggleSuspend(t)} disabled={pendingActionId===t.id} className="text-xs text-slate-400 hover:text-white px-2 py-1 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
                            {t.status==='SUSPENDED' ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
