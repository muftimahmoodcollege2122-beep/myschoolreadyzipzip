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

export default function AdmissionsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState<any>(null);

  const { data: studentsData, isLoading } = useStudents({ search, limit: 50 });
  const { data: classes } = useClasses();
  const { data: sections } = useSections();
  const createStudent = useCreateStudent();

  const students: any[] = (studentsData as any)?.data ?? [];
  const classList: any[] = Array.isArray(classes) ? classes : [];
  const sectionList: any[] = Array.isArray(sections) ? sections : [];

  const thisYear = new Date().getFullYear();
  const recentStudents = students.filter((s: any) => new Date(s.createdAt).getFullYear() === thisYear);

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
    { key: 'dob', header: 'Date of Birth', render: (s: any) => <span className="text-xs text-gray-500">{s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-PK') : '—'}</span> },
    { key: 'enrolled', header: 'Enrolled', render: (s: any) => <span className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-PK')}</span> },
    { key: 'status', header: 'Status', render: (s: any) => <Badge variant={s.isActive?'green':'gray'}>{s.isActive?'Active':'Inactive'}</Badge> },
  ];

  return (
    <>
      <Topbar title="Admissions" subtitle="Student enrollment & admission management" />
      <div className="p-6">
        <PageHeader
          title="Admissions"
          subtitle={`${students.length} total · ${recentStudents.length} enrolled this year`}
          action={<button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ New Admission</button>}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Students', value: (studentsData as any)?.meta?.total ?? students.length, icon: '👩‍🎓', bg: 'bg-blue-50' },
            { label: 'This Year', value: recentStudents.length, icon: '📅', bg: 'bg-green-50' },
            { label: 'Male', value: students.filter((s:any)=>s.gender==='MALE').length, icon: '👦', bg: 'bg-indigo-50' },
            { label: 'Female', value: students.filter((s:any)=>s.gender==='FEMALE').length, icon: '👧', bg: 'bg-pink-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-3"><span className="text-2xl">{s.icon}</span>
                <div><p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Success notification */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <p className="text-green-800 font-medium text-sm">✅ Student admitted: <strong>{success.user?.profile?.firstName} {success.user?.profile?.lastName}</strong> — ID: {success.admissionNo}</p>
            <button onClick={() => setSuccess(null)} className="text-green-600 text-xs font-bold">Dismiss</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, admission number..." className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <DataTable columns={columns} data={students} isLoading={isLoading} emptyMessage="No students found" />
        </div>
      </div>

      {/* Multi-step Admission Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setStep(1); setForm(EMPTY_FORM); }} title="New Student Admission">
        {/* Step Indicator */}
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
                <input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
                <input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={e=>setForm(f=>({...f,dateOfBirth:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
              <textarea value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400 resize-none" /></div>
            <button onClick={()=>setStep(2)} disabled={!form.firstName||!form.lastName} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Section *</label>
              <select value={form.sectionId} onChange={e=>setForm(f=>({...f,sectionId:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">Select section</option>
                {sectionList.map((s:any)=><option key={s.id} value={s.id}>{s.class?.name} — Section {s.name}</option>)}
              </select></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admission No.</label>
              <input value={form.admissionNo} onChange={e=>setForm(f=>({...f,admissionNo:e.target.value}))} placeholder={`Auto: ADM-${Date.now()}`} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enrollment Date</label>
              <input type="date" value={form.enrollmentDate} onChange={e=>setForm(f=>({...f,enrollmentDate:e.target.value}))} defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div className="flex gap-3">
              <button onClick={()=>setStep(1)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50">← Back</button>
              <button onClick={()=>setStep(3)} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500">Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent/Guardian Name</label>
              <input value={form.parentName} onChange={e=>setForm(f=>({...f,parentName:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Phone</label>
              <input value={form.parentPhone} onChange={e=>setForm(f=>({...f,parentPhone:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parent Email</label>
              <input type="email" value={form.parentEmail} onChange={e=>setForm(f=>({...f,parentEmail:e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-400" /></div>
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-bold text-gray-700 mb-1">Summary</p>
              <p className="text-gray-600">Student: <strong>{form.firstName} {form.lastName}</strong></p>
              {form.sectionId && <p className="text-gray-600">Section: <strong>{sectionList.find(s=>s.id===form.sectionId)?.class?.name}-{sectionList.find(s=>s.id===form.sectionId)?.name}</strong></p>}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setStep(2)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50">← Back</button>
              <button onClick={handleSubmit} disabled={createStudent.isPending} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">
                {createStudent.isPending ? 'Admitting...' : '✅ Admit Student'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
