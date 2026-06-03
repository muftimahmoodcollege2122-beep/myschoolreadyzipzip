'use client';
import React, { useState } from 'react';
import { useStudents, useCreateStudent, useClasses, useSections } from '../../../hooks/use-api';
import { PageHeader } from '../../../components/shared/page-header';
import { Topbar } from '../../../components/layout/topbar';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { DataTable } from '../../../components/shared/data-table';

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '', gender: 'MALE', dateOfBirth: '',
  admissionNo: '', enrollmentDate: '', sectionId: '', parentName: '', parentPhone: '', parentEmail: '', address: '',
};

const PIPELINE_STAGES = ['Inquiry', 'Application', 'Verification', 'Interview', 'Approved', 'Enrolled'];
const STAGE_COLORS: Record<string, string> = {
  Inquiry: 'bg-gray-100 border-gray-300 text-gray-700',
  Application: 'bg-blue-50 border-blue-300 text-blue-700',
  Verification: 'bg-yellow-50 border-yellow-300 text-yellow-700',
  Interview: 'bg-purple-50 border-purple-300 text-purple-700',
  Approved: 'bg-green-50 border-green-300 text-green-700',
  Enrolled: 'bg-emerald-100 border-emerald-400 text-emerald-800',
};
const STAGE_HEADER_COLORS: Record<string, string> = {
  Inquiry: 'bg-gray-200 text-gray-700',
  Application: 'bg-blue-100 text-blue-700',
  Verification: 'bg-yellow-100 text-yellow-700',
  Interview: 'bg-purple-100 text-purple-700',
  Approved: 'bg-green-100 text-green-700',
  Enrolled: 'bg-emerald-200 text-emerald-800',
};

const PIPELINE_CARDS = [
  { id:1, name:'Zaid Hamid', parent:'Mr. Hamid', class:'Grade 7', stage:'Inquiry', date:'Jun 1', phone:'0300-1111111', docs:['CNIC Copy'] },
  { id:2, name:'Hira Baig', parent:'Mrs. Baig', class:'Grade 10', stage:'Application', date:'Jun 2', phone:'0311-2222222', docs:['Birth Certificate','CNIC Copy'] },
  { id:3, name:'Faisal Rehman', parent:'Mr. Rehman', class:'Grade 9', stage:'Application', date:'Jun 2', phone:'0321-3333333', docs:['Prev Report Card','CNIC Copy'] },
  { id:4, name:'Sara Qureshi', parent:'Mrs. Qureshi', class:'Grade 6', stage:'Verification', date:'May 30', phone:'0333-4444444', docs:['Birth Certificate','Medical Certificate'] },
  { id:5, name:'Ali Nawaz', parent:'Mr. Nawaz', class:'Grade 8', stage:'Interview', date:'May 28', phone:'0345-5555555', docs:['All Documents'] },
  { id:6, name:'Noor Fatima', parent:'Mrs. Fatima', class:'Grade 5', stage:'Interview', date:'May 27', phone:'0301-6666666', docs:['All Documents'] },
  { id:7, name:'Bilal Akhtar', parent:'Mr. Akhtar', class:'Grade 11', stage:'Approved', date:'May 25', phone:'0312-7777777', docs:['All Documents'] },
  { id:8, name:'Ayesha Malik', parent:'Mrs. Malik', class:'Grade 3', stage:'Approved', date:'May 24', phone:'0322-8888888', docs:['All Documents'] },
  { id:9, name:'Hamza Sheikh', parent:'Mr. Sheikh', class:'Grade 10', stage:'Enrolled', date:'May 20', phone:'0334-9999999', docs:['All Documents'] },
];

export default function AdmissionsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'pipeline'|'table'>('pipeline');
  const [cards, setCards] = useState(PIPELINE_CARDS);
  const [dragId, setDragId] = useState<number|null>(null);
  const [dragOver, setDragOver] = useState<string|null>(null);

  const { data: studentsData, isLoading } = useStudents({ search, limit: 50 });
  const { data: classes } = useClasses();
  const { data: sections } = useSections();
  const createStudent = useCreateStudent();

  const students: any[] = (studentsData as any)?.data ?? [];
  const sectionList: any[] = Array.isArray(sections) ? sections : [];

  const handleSubmit = async () => {
    const s = await createStudent.mutateAsync({
      firstName: form.firstName, lastName: form.lastName, email: form.email,
      phone: form.phone, gender: form.gender, dateOfBirth: form.dateOfBirth,
      admissionNo: form.admissionNo || `ADM-${Date.now()}`,
      enrollmentDate: form.enrollmentDate || new Date().toISOString().split('T')[0],
      sectionId: form.sectionId, parentName: form.parentName,
      parentPhone: form.parentPhone, parentEmail: form.parentEmail, address: form.address,
    });
    setSuccess(s);
    setModal(false);
    setForm(EMPTY_FORM);
    setStep(1);
  };

  // Drag & Drop handlers
  const onDragStart = (id: number) => setDragId(id);
  const onDragOver = (e: React.DragEvent, stage: string) => { e.preventDefault(); setDragOver(stage); };
  const onDrop = (stage: string) => {
    if (dragId != null) setCards(prev => prev.map(c => c.id === dragId ? { ...c, stage } : c));
    setDragId(null); setDragOver(null);
  };

  const columns = [
    { key: 'name', header: 'Student', render: (s: any) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center font-bold text-green-700 text-sm flex-shrink-0">
          {s.user?.profile?.firstName?.[0]}{s.user?.profile?.lastName?.[0]}
        </div>
        <div><p className="font-semibold text-sm text-gray-900">{s.user?.profile?.firstName} {s.user?.profile?.lastName}</p>
          <p className="text-xs text-gray-400">{s.admissionNo}</p></div>
      </div>
    )},
    { key: 'class', header: 'Class', render: (s: any) => <span className="text-sm">{s.enrollments?.[0]?.section?.class?.name ?? '—'} {s.enrollments?.[0]?.section?.name ?? ''}</span> },
    { key: 'gender', header: 'Gender', render: (s: any) => <Badge variant={s.gender==='MALE'?'blue':'pink'}>{s.gender}</Badge> },
    { key: 'enrolled', header: 'Enrolled', render: (s: any) => <span className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-PK')}</span> },
    { key: 'status', header: 'Status', render: (s: any) => <Badge variant={s.isActive?'green':'gray'}>{s.isActive?'Active':'Inactive'}</Badge> },
  ];

  return (
    <>
      <Topbar title="Admissions" subtitle="CRM pipeline & enrollment management" />
      <div className="p-6">
        <PageHeader
          title="Admissions CRM"
          subtitle={`${cards.filter(c=>c.stage==='Enrolled').length} enrolled · ${cards.filter(c=>c.stage==='Approved').length} approved · ${cards.length} total leads`}
          action={
            <div className="flex gap-2">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button onClick={()=>setViewMode('pipeline')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode==='pipeline'?'bg-white shadow text-gray-900':'text-gray-500'}`}>📋 Pipeline</button>
                <button onClick={()=>setViewMode('table')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode==='table'?'bg-white shadow text-gray-900':'text-gray-500'}`}>📄 Table</button>
              </div>
              <button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-500">+ New Admission</button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {PIPELINE_STAGES.map(stage => {
            const count = cards.filter(c => c.stage === stage).length;
            return (
              <div key={stage} className={`rounded-xl p-3 border ${STAGE_COLORS[stage]}`}>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs font-semibold mt-0.5">{stage}</p>
              </div>
            );
          })}
        </div>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-green-800 font-medium text-sm">✅ Student admitted: <strong>{success.user?.profile?.firstName} {success.user?.profile?.lastName}</strong></p>
            <button onClick={() => setSuccess(null)} className="text-green-600 text-xs font-bold">Dismiss</button>
          </div>
        )}

        {/* PIPELINE VIEW */}
        {viewMode === 'pipeline' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {PIPELINE_STAGES.map(stage => {
                const stageCards = cards.filter(c => c.stage === stage);
                return (
                  <div
                    key={stage}
                    className={`w-56 flex-shrink-0 rounded-2xl border-2 transition-all ${dragOver===stage?'border-blue-400 bg-blue-50/50':'border-transparent'}`}
                    onDragOver={e=>onDragOver(e,stage)}
                    onDrop={()=>onDrop(stage)}
                  >
                    {/* Column Header */}
                    <div className={`px-3 py-2.5 rounded-t-xl flex items-center justify-between ${STAGE_HEADER_COLORS[stage]}`}>
                      <p className="font-black text-sm">{stage}</p>
                      <span className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-xs font-black">{stageCards.length}</span>
                    </div>
                    {/* Cards */}
                    <div className="p-2 space-y-2 min-h-[200px]">
                      {stageCards.map(card => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={()=>onDragStart(card.id)}
                          className={`bg-white rounded-xl border border-gray-100 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${dragId===card.id?'opacity-50 scale-95':''}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs flex-shrink-0">{card.name[0]}</div>
                            <div className="min-w-0"><p className="font-bold text-xs text-gray-900 truncate">{card.name}</p><p className="text-[10px] text-gray-400">{card.class}</p></div>
                          </div>
                          <div className="space-y-1 text-[10px] text-gray-500">
                            <p>👤 {card.parent}</p>
                            <p>📞 {card.phone}</p>
                            <p>📅 {card.date}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {card.docs.slice(0,2).map(d=><span key={d} className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-500">{d}</span>)}
                            {card.docs.length>2&&<span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-400">+{card.docs.length-2}</span>}
                          </div>
                          {/* Quick advance button */}
                          {stage !== 'Enrolled' && (
                            <button
                              onClick={() => {
                                const nextStage = PIPELINE_STAGES[PIPELINE_STAGES.indexOf(stage)+1];
                                setCards(prev=>prev.map(c=>c.id===card.id?{...c,stage:nextStage}:c));
                              }}
                              className="mt-2 w-full py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              Advance → {PIPELINE_STAGES[PIPELINE_STAGES.indexOf(stage)+1]}
                            </button>
                          )}
                        </div>
                      ))}
                      {stageCards.length === 0 && (
                        <div className={`border-2 border-dashed rounded-xl h-16 flex items-center justify-center text-xs text-gray-300 font-medium transition-colors ${dragOver===stage?'border-blue-300 bg-blue-50/50':''}`}>
                          Drop here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <>
            <div className="mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, admission number..." className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <DataTable columns={columns} data={students} isLoading={isLoading} emptyMessage="No students found" />
            </div>
          </>
        )}
      </div>

      {/* Multi-step Admission Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setStep(1); setForm(EMPTY_FORM); }} title="New Student Admission">
        <div className="flex items-center gap-2 mb-5">
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step===s?'bg-green-600 text-white':step>s?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400'}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step>s?'bg-green-300':'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
          <div className="ml-2 text-xs text-gray-400">{step===1?'Personal Info':step===2?'Academic Placement':'Parent Info'}</div>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                <input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
                <input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                  <option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={e=>setForm(f=>({...f,dateOfBirth:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            <button onClick={()=>setStep(2)} disabled={!form.firstName||!form.lastName} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50">Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Section *</label>
              <select value={form.sectionId} onChange={e=>setForm(f=>({...f,sectionId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                <option value="">Select section</option>
                {sectionList.map((s:any)=><option key={s.id} value={s.id}>{s.class?.name} — Section {s.name}</option>)}
              </select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admission No.</label>
              <input value={form.admissionNo} onChange={e=>setForm(f=>({...f,admissionNo:e.target.value}))} placeholder={`Auto: ADM-${Date.now()}`} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enrollment Date</label>
              <input type="date" value={form.enrollmentDate} onChange={e=>setForm(f=>({...f,enrollmentDate:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            <div className="flex gap-3">
              <button onClick={()=>setStep(1)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">← Back</button>
              <button onClick={()=>setStep(3)} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500">Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent/Guardian Name</label>
              <input value={form.parentName} onChange={e=>setForm(f=>({...f,parentName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Phone</label>
              <input value={form.parentPhone} onChange={e=>setForm(f=>({...f,parentPhone:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Email</label>
              <input type="email" value={form.parentEmail} onChange={e=>setForm(f=>({...f,parentEmail:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400" /></div>
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-bold text-gray-700 mb-1">Summary</p>
              <p className="text-gray-600">Student: <strong>{form.firstName} {form.lastName}</strong></p>
              {form.sectionId && <p className="text-gray-600">Section: <strong>{sectionList.find(s=>s.id===form.sectionId)?.class?.name}-{sectionList.find(s=>s.id===form.sectionId)?.name}</strong></p>}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setStep(2)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">← Back</button>
              <button onClick={handleSubmit} disabled={createStudent.isPending} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 disabled:opacity-50">
                {createStudent.isPending ? 'Admitting...' : '✅ Admit Student'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
