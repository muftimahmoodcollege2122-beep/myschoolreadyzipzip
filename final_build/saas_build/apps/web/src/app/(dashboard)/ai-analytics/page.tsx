'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Topbar } from '../../../components/layout/topbar';

export default function AiAnalyticsPage() {
  const [alertsSent, setAlertsSent] = useState<string[]>([]);

  const { data: dashboard, isLoading: dashLoading } = useQuery({ queryKey:['ai-dashboard'], queryFn:()=>apiClient.get('/ai-analytics/dashboard') });
  const { data: dropoutRisk, isLoading: riskLoading } = useQuery({ queryKey:['dropout-risk'], queryFn:()=>apiClient.get('/ai-analytics/dropout-risk') });
  const { data: attAnalytics } = useQuery({ queryKey:['att-analytics'], queryFn:()=>apiClient.get('/ai-analytics/attendance') });
  const { data: feeAnalytics } = useQuery({ queryKey:['fee-analytics'], queryFn:()=>apiClient.get('/ai-analytics/fees') });

  const sendParentAlert = async (studentId: string, studentName: string) => {
    try {
      await apiClient.post('/notifications/broadcast', {
        schoolId: '', title: '⚠️ Academic Alert',
        body: `Dear Parent, our system has flagged ${studentName} as at risk due to low attendance and/or outstanding fees. Please contact the school immediately.`,
        audience: 'ALL_PARENTS', channels: ['IN_APP', 'SMS'],
      });
      setAlertsSent(prev => [...prev, studentId]);
    } catch(e) { alert('Alert failed'); }
  };

  const dash: any = dashboard ?? {};
  const risk: any[] = Array.isArray(dropoutRisk) ? dropoutRisk : [];
  const att: any = attAnalytics ?? {};
  const fees: any = feeAnalytics ?? {};
  const highRisk = risk.filter(r => r.riskLevel === 'HIGH');
  const medRisk  = risk.filter(r => r.riskLevel === 'MEDIUM');

  return (
    <>
      <Topbar title="AI Analytics" subtitle="Predictive insights — dropout risk, performance trends, fee analytics" />
      <div className="p-6 space-y-6">

        {/* School Score Dashboard */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label:'Overall Score',    value: `${dash.kpis?.overall ?? 0}%`,         color:'bg-gradient-to-br from-blue-600 to-indigo-700', text:'text-white', big:true },
            { label:'Attendance',       value: `${dash.kpis?.engagement ?? 0}%`,       color:'bg-green-600', text:'text-white' },
            { label:'Fee Collection',   value: `${dash.kpis?.financial ?? 0}%`,        color:'bg-amber-500', text:'text-white' },
            { label:'Academic',         value: `${dash.kpis?.academic ?? 0}%`,         color:'bg-purple-600', text:'text-white' },
            { label:'High Risk Students', value: highRisk.length,                       color:'bg-red-600', text:'text-white' },
          ].map(s=>(
            <div key={s.label} className={`${s.color} rounded-2xl p-5 ${s.text}`}>
              <div className={`font-black ${s.big ? 'text-4xl' : 'text-2xl'}`}>{s.value}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dropout Risk */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="font-black text-gray-900">🎯 AI Dropout Risk Monitor</h3>
              <p className="text-sm text-gray-500 mt-0.5">Students flagged based on attendance, fee defaults and grade trends</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">{highRisk.length} HIGH</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{medRisk.length} MEDIUM</span>
            </div>
          </div>
          {riskLoading ? (
            <div className="text-center py-10 text-gray-400">Analyzing student data...</div>
          ) : risk.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-semibold">No at-risk students detected</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="bg-gray-50">
                {['Student','Admission No','Attendance','Overdue Fees','Risk Score','Risk Level','AI Recommendations','Action'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {risk.map((r:any)=>(
                  <tr key={r.student.id} className={`border-t border-gray-50 hover:bg-gray-50 ${r.riskLevel==='HIGH'?'bg-red-50/30':''}`}>
                    <td className="px-4 py-3 font-semibold text-sm">{r.student.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{r.student.admissionNo}</td>
                    <td className="px-4 py-3 text-sm"><span className={r.attendanceRate<75?'text-red-600 font-black':'text-gray-600 font-medium'}>{r.attendanceRate}%</span></td>
                    <td className="px-4 py-3 text-sm"><span className={r.overdueInvoices>0?'text-red-600 font-black':'text-green-600 font-medium'}>{r.overdueInvoices} invoice{r.overdueInvoices!==1?'s':''}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${r.riskScore>=70?'bg-red-500':r.riskScore>=40?'bg-amber-400':'bg-green-500'}`} style={{width:`${r.riskScore}%`}}/>
                        </div>
                        <span className="text-xs font-black">{r.riskScore}/100</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-black ${r.riskLevel==='HIGH'?'bg-red-100 text-red-700':r.riskLevel==='MEDIUM'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}`}>{r.riskLevel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {r.recommendations?.slice(0,2).map((rec:string,i:number)=><li key={i}>• {rec}</li>)}
                      </ul>
                    </td>
                    <td className="px-4 py-3">
                      {alertsSent.includes(r.student.id) ? (
                        <span className="text-xs text-green-600 font-bold">✅ Alert Sent</span>
                      ) : (
                        <button onClick={()=>sendParentAlert(r.student.id, r.student.name)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">Alert Parent</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Attendance Analytics */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 mb-4">📅 Attendance Analytics</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:'Overall Rate', value:`${att.overallRate ?? 0}%`, color: att.overallRate >= 85 ? 'text-green-600':'text-red-600' },
                { label:'Total Records', value: att.totalRecords ?? 0, color:'text-gray-900' },
              ].map(s=>(
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-bold uppercase">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            {att.byStatus && Object.entries(att.byStatus).map(([status, count]:any)=>(
              <div key={status} className="flex items-center gap-3 mb-2">
                <span className="text-xs text-gray-500 w-20">{status}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${status==='PRESENT'?'bg-green-500':status==='ABSENT'?'bg-red-500':status==='LATE'?'bg-amber-500':'bg-blue-500'}`}
                    style={{width:`${Math.min(100,(count/(att.totalRecords||1))*100)}%`}}/>
                </div>
                <span className="text-xs font-bold w-10 text-right">{count}</span>
              </div>
            ))}
            <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${(att.overallRate??0) >= 85 ? 'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>
              {(att.overallRate??0) >= 85 ? '✅ Attendance meeting 85% target' : `⚠️ Attendance ${85-(att.overallRate??0)}% below target — enable daily SMS alerts`}
            </div>
          </div>

          {/* Fee Analytics */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-black text-gray-900 mb-4">💰 Fee Analytics</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:'Collection Rate', value:`${fees.collectionRate ?? 0}%`, color: (fees.collectionRate??0) >= 70 ? 'text-green-600':'text-red-600' },
                { label:'Outstanding',     value:`Rs. ${Number(fees.outstanding??0).toLocaleString()}`, color:'text-red-600' },
              ].map(s=>(
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-bold uppercase">{s.label}</p>
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            {fees.byStatus && Object.entries(fees.byStatus).map(([status, data]:any)=>(
              <div key={status} className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-600 font-medium">{status}</span>
                <div className="text-right">
                  <span className="font-bold">{data.count} invoices</span>
                  <span className="text-gray-400 ml-2">Rs. {Number(data.amount??0).toLocaleString()}</span>
                </div>
              </div>
            ))}
            <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${(fees.collectionRate??0) >= 70 ? 'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>
              {(fees.collectionRate??0) >= 70 ? '✅ Good collection rate' : '⚠️ Fee collection below 70% — automated SMS reminders are active'}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h3 className="font-black text-xl mb-4">🤖 AI Recommendations for Your School</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon:'📱', title:'Enable Daily SMS', desc:'Parents respond 3x faster to SMS than in-app. Absence alerts are auto-running.' },
              { icon:'📊', title:'Weekly Progress Reports', desc:`Send weekly summaries to ${(risk.filter((r:any)=>r.riskLevel!=='LOW').length)} at-risk student parents.` },
              { icon:'💰', title:'Fee Collection', desc:`${fees.overdueTrend ?? 0} overdue invoices. Automated daily reminders are active at 8 AM.` },
              { icon:'🎯', title:'Dropout Prevention', desc:`${highRisk.length} students need immediate parent meeting. Click "Alert Parent" to notify them now.` },
            ].map((r,i)=>(
              <div key={i} className="flex gap-3 bg-white/10 rounded-xl p-4">
                <span className="text-2xl">{r.icon}</span>
                <div><p className="font-bold text-sm">{r.title}</p><p className="text-xs opacity-80 mt-0.5">{r.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
