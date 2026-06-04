'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';

const PROJECTS = [
  { id:1, title:'Impact of Digital Learning on Student Performance in Rural Schools', pi:'Dr. Fatima Shah', dept:'Education Research', status:'ACTIVE', funding:'Rs. 850K', funder:'HEC Pakistan', start:'Jan 2026', end:'Dec 2026', team:4, progress:42 },
  { id:2, title:'Machine Learning for Early Dropout Prediction', pi:'Dr. Ahmed Malik', dept:'Computer Science', status:'ACTIVE', funding:'Rs. 1.2M', funder:'NRPU Grant', start:'Mar 2026', end:'Feb 2027', team:6, progress:28 },
  { id:3, title:'Bilingual Education and Cognitive Development', pi:'Prof. Sara Khan', dept:'Linguistics', status:'COMPLETED', funding:'Rs. 650K', funder:'British Council', start:'Jun 2025', end:'May 2026', team:3, progress:100 },
  { id:4, title:'Inclusive Education Practices for Special Needs Students', pi:'Dr. Bilal Hassan', dept:'Special Education', status:'PENDING_APPROVAL', funding:'Rs. 500K', funder:'UNICEF Pakistan', start:'Jul 2026', end:'Jun 2027', team:5, progress:0 },
  { id:5, title:'STEM Curriculum Redesign for 21st Century Skills', pi:'Prof. Nadia Rehman', dept:'Curriculum Studies', status:'ACTIVE', funding:'Rs. 980K', funder:'Aga Khan Foundation', start:'Feb 2026', end:'Jan 2027', team:8, progress:55 },
];

const PUBLICATIONS = [
  { title:'Digital Literacy and Academic Achievement: A Meta-Analysis', authors:'Shah, F., Malik, A.', journal:'Pakistan Journal of Education', year:2026, citations:14, doi:'10.1234/pje.2026.01', type:'Journal Article', indexed:'Scopus' },
  { title:'Dropout Prediction Using Ensemble Machine Learning Methods', authors:'Malik, A., Qureshi, Z.', journal:'IJCAI Workshop Proceedings', year:2025, citations:32, doi:'10.5678/ijcai.2025.44', type:'Conference Paper', indexed:'IEEE' },
  { title:'Bilingual Code-Switching in Karachi Schools', authors:'Khan, S., Akhtar, B.', journal:'Applied Linguistics Review', year:2026, citations:8, doi:'10.9012/alr.2026.07', type:'Journal Article', indexed:'Web of Science' },
  { title:'Universal Design for Learning in Pakistani Context', authors:'Hassan, B., Fatima, N.', journal:'International Special Education', year:2025, citations:21, doi:'10.3456/ise.2025.12', type:'Review Article', indexed:'PubMed' },
];

const THESIS = [
  { title:'Gamification Effects on Mathematics Learning in Grade 6', student:'Omar Khan', supervisor:'Dr. Fatima Shah', degree:'M.Ed', status:'SUBMITTED', year:2026 },
  { title:'Teacher Burnout and Retention in Private Schools', student:'Zara Ali', supervisor:'Prof. Sara Khan', degree:'Ph.D', status:'IN_PROGRESS', year:2026 },
  { title:'ICT Integration in Secondary Education', student:'Hamza Sheikh', supervisor:'Dr. Ahmed Malik', degree:'M.Sc', status:'APPROVED', year:2025 },
  { title:'Impact of School Leadership on Student Outcomes', student:'Noor Baig', supervisor:'Dr. Bilal Hassan', degree:'Ph.D', status:'IN_PROGRESS', year:2026 },
];

const ETHICS_REQUESTS = [
  { title:'Student Behavior Tracking via Mobile App', pi:'Dr. Ahmed Malik', status:'PENDING', submitted:'Jun 1, 2026', risk:'Medium' },
  { title:'Biometric Attendance Data Collection Study', pi:'Prof. Nadia Rehman', status:'APPROVED', submitted:'May 15, 2026', risk:'Low' },
  { title:'Mental Health Survey — Grade 9-12 Students', pi:'Dr. Bilal Hassan', status:'REQUIRES_REVISION', submitted:'May 10, 2026', risk:'High' },
];

export default function ResearchPage() {
  const [view, setView] = useState<'projects'|'publications'|'thesis'|'ethics'|'funding'>('projects');
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ title:'', pi:'', dept:'', funding:'', funder:'' });

  const totalFunding = PROJECTS.reduce((a,p)=>a+parseFloat(p.funding.replace('Rs. ','').replace('K','000').replace('M','000000').replace('.','')),0);

  return (
    <>
      <Topbar title="Research" subtitle="Research projects, publications & ethics" />
      <div className="p-6">
        <PageHeader
          title="Research Management"
          subtitle={`${PROJECTS.filter(p=>p.status==='ACTIVE').length} active projects · ${PUBLICATIONS.length} publications · ${THESIS.length} theses`}
          action={<button onClick={()=>setAddModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500">+ New Research Project</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            { label:'Active Projects', value:PROJECTS.filter(p=>p.status==='ACTIVE').length, icon:'🔬', c:'from-blue-500 to-blue-600' },
            { label:'Total Funding', value:'Rs. 4.18M', icon:'💰', c:'from-green-500 to-green-600' },
            { label:'Publications', value:PUBLICATIONS.length, icon:'📄', c:'from-purple-500 to-purple-600' },
            { label:'Total Citations', value:PUBLICATIONS.reduce((a,p)=>a+p.citations,0), icon:'📊', c:'from-orange-500 to-orange-600' },
            { label:'Active Theses', value:THESIS.filter(t=>t.status==='IN_PROGRESS').length, icon:'🎓', c:'from-red-500 to-pink-500' },
          ].map(k=>(
            <div key={k.label} className={`bg-gradient-to-br ${k.c} rounded-2xl p-4 text-white`}>
              <div className="text-2xl mb-2">{k.icon}</div>
              <p className="text-2xl font-black">{k.value}</p>
              <p className="text-white/70 text-xs mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit overflow-x-auto">
          {(['projects','publications','thesis','ethics','funding'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className={`px-4 py-1.5 text-sm font-bold rounded-lg capitalize whitespace-nowrap transition-all ${view===v?'bg-white shadow text-gray-900':'text-gray-500'}`}>
              {v==='projects'?'🔬 Projects':v==='publications'?'📄 Publications':v==='thesis'?'🎓 Thesis':v==='ethics'?'⚖️ Ethics':'💰 Funding'}
            </button>
          ))}
        </div>

        {view==='projects' && (
          <div className="space-y-4">
            {PROJECTS.map(p=>(
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={p.status==='ACTIVE'?'green':p.status==='COMPLETED'?'blue':p.status==='PENDING_APPROVAL'?'yellow':'gray'}>
                        {p.status.replace('_',' ')}
                      </Badge>
                      <span className="text-xs text-gray-400">{p.dept}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 leading-tight">{p.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>👤 PI: {p.pi}</span>
                      <span>👥 Team: {p.team}</span>
                      <span>📅 {p.start} → {p.end}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-900 text-lg">{p.funding}</p>
                    <p className="text-xs text-gray-400">{p.funder}</p>
                  </div>
                </div>
                {p.status==='ACTIVE'&&(
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Progress</span><span className="font-bold text-gray-700">{p.progress}%</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.progress>=70?'bg-green-500':p.progress>=40?'bg-blue-500':'bg-yellow-500'}`} style={{width:`${p.progress}%`}}/>
                    </div>
                  </div>
                )}
                {p.status==='COMPLETED'&&(
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-2 bg-green-500 rounded-full flex-1"/>
                    <span className="text-xs font-bold text-green-600">Completed</span>
                  </div>
                )}
                {p.status==='PENDING_APPROVAL'&&(
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200">✓ Approve</button>
                    <button className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">✗ Reject</button>
                    <button className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200">View Proposal</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view==='publications' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Research Publications</h3>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100">+ Add Publication</button>
            </div>
            <div className="divide-y divide-gray-50">
              {PUBLICATIONS.map((p,i)=>(
                <div key={i} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={p.type==='Journal Article'?'blue':p.type==='Conference Paper'?'purple':'green'}>{p.type}</Badge>
                        <span className="text-xs font-bold text-gray-500">{p.indexed}</span>
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">{p.title}</h3>
                      <p className="text-xs text-gray-500">{p.authors} · <em>{p.journal}</em> · {p.year}</p>
                      <p className="text-xs text-blue-600 mt-0.5 font-mono">DOI: {p.doi}</p>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className="text-2xl font-black text-gray-900">{p.citations}</p>
                      <p className="text-xs text-gray-400">citations</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view==='thesis' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Thesis Repository</h3>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">+ Submit Thesis</button>
            </div>
            <div className="divide-y divide-gray-50">
              {THESIS.map((t,i)=>(
                <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={t.degree==='Ph.D'?'purple':'blue'}>{t.degree}</Badge>
                      <span className="text-xs text-gray-400">{t.year}</span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{t.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">👤 {t.student} · Supervisor: {t.supervisor}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={t.status==='SUBMITTED'?'green':t.status==='APPROVED'?'blue':t.status==='IN_PROGRESS'?'yellow':'gray'}>{t.status.replace('_',' ')}</Badge>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view==='ethics' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <div><p className="font-bold text-blue-800">Ethics Review Committee</p><p className="text-blue-600 text-xs">All research involving human participants must receive ethics approval before data collection.</p></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Ethics Applications</h3>
                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">+ New Application</button>
              </div>
              <div className="divide-y divide-gray-50">
                {ETHICS_REQUESTS.map((e,i)=>(
                  <div key={i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{e.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>PI: {e.pi}</span>
                        <span>Submitted: {e.submitted}</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full ${e.risk==='High'?'bg-red-100 text-red-600':e.risk==='Medium'?'bg-yellow-100 text-yellow-600':'bg-green-100 text-green-600'}`}>Risk: {e.risk}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={e.status==='APPROVED'?'green':e.status==='PENDING'?'yellow':'red'}>{e.status.replace('_',' ')}</Badge>
                      {e.status==='PENDING'&&(
                        <div className="flex gap-1">
                          <button className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200">✓</button>
                          <button className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-200">Revise</button>
                          <button className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200">✗</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view==='funding' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">💰 Funding by Source</h3>
              {[
                { funder:'HEC Pakistan', amount:850000, color:'bg-blue-500' },
                { funder:'NRPU Grant', amount:1200000, color:'bg-green-500' },
                { funder:'Aga Khan Foundation', amount:980000, color:'bg-purple-500' },
                { funder:'British Council', amount:650000, color:'bg-yellow-500' },
                { funder:'UNICEF Pakistan', amount:500000, color:'bg-red-500' },
              ].map(f=>{
                const total=4180000;
                return (
                  <div key={f.funder} className="mb-3">
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium text-gray-700">{f.funder}</span><span className="text-gray-400">Rs. {(f.amount/1000).toFixed(0)}K</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${f.color} rounded-full`} style={{width:`${(f.amount/total)*100}%`}}/></div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">📅 Upcoming Deadlines</h3>
                <div className="space-y-2">
                  {[
                    { grant:'HEC NRPU 2026', deadline:'Jun 30, 2026', amount:'Rs. 2-5M', status:'Open' },
                    { grant:'British Council Research', deadline:'Jul 15, 2026', amount:'GBP 10K-50K', status:'Open' },
                    { grant:'USAID Education Grant', deadline:'Aug 1, 2026', amount:'USD 25K-100K', status:'Open' },
                  ].map(g=>(
                    <div key={g.grant} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div><p className="font-bold text-sm text-gray-900">{g.grant}</p><p className="text-xs text-gray-400">Deadline: {g.deadline} · {g.amount}</p></div>
                      <Badge variant="green">{g.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                <h3 className="font-bold mb-1">Total Research Budget</h3>
                <p className="text-4xl font-black">Rs. 4.18M</p>
                <p className="text-blue-200/70 text-sm mt-1">Across {PROJECTS.length} projects · FY 2025-26</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={addModal} onClose={()=>setAddModal(false)} title="New Research Project">
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Title *</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Principal Investigator</label>
              <input value={form.pi} onChange={e=>setForm(f=>({...f,pi:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
              <input value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Funding Amount</label>
              <input value={form.funding} onChange={e=>setForm(f=>({...f,funding:e.target.value}))} placeholder="Rs. 500K" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Funding Source</label>
              <input value={form.funder} onChange={e=>setForm(f=>({...f,funder:e.target.value}))} placeholder="HEC, NRPU..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400"/></div>
          </div>
          <button disabled={!form.title} onClick={()=>setAddModal(false)} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50">Create Project</button>
        </div>
      </Modal>
    </>
  );
}
