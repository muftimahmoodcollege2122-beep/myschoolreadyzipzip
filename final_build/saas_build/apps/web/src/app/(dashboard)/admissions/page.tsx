'use client';
import React, { useState } from 'react';
import { Topbar } from '../../../components/layout/topbar';
import { PageHeader } from '../../../components/shared/page-header';
import { Badge } from '../../../components/shared/badge';
import { Modal } from '../../../components/shared/modal';
import { useStudents, useCreateStudent, useClasses, useSections, useSchoolSection, useCreateSchoolItem } from '../../../hooks/use-api';

const STATUS_COLOR: Record<string, string> = { ACTIVE: 'green', INACTIVE: 'gray', GRADUATED: 'blue', TRANSFERRED: 'yellow', EXPELLED: 'red' };
const APP_EMPTY = { studentName: '', fatherName: '', phone: '', email: '', dob: '', classApplied: '', address: '', status: 'PENDING', appliedAt: new Date().toISOString().split('T')[0] };
const STUDENT_EMPTY = { firstName: '', lastName: '', fatherName: '', dob: '', gender: 'MALE', phone: '', email: '', address: '', classId: '', sectionId: '', admissionNo: '', bloodGroup: '' };

export default function AdmissionsPage() {
  const [view, setView] = useState<'students' | 'applications'>('students');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [appModal, setAppModal] = useState(false);
  const [form, setForm] = useState(STUDENT_EMPTY);
  const [appForm, setAppForm] = useState(APP_EMPTY);
  const [selected, setSelected] = useState<any>(null);

  const { data: studentsData, isLoading: studentsLoading } = useStudents({ search, limit: 50 });
  const { data: classes = [] } = useClasses();
  const { data: sections = [] } = useSections();
  const { data: applications = [], isLoading: appLoading } = useSchoolSection('applications');
  const createStudent = useCreateStudent();
  const createApp = useCreateSchoolItem('applications');

  const students: any[] = studentsData?.data ?? [];
  const appList: any[] = Array.isArray(applications) ? applications : [];

  const filteredStudents = students.filter(s =>
    (!statusFilter || s.status === statusFilter)
  );
  const filteredApps = appList.filter(a =>
    (!search || a.studentName?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || a.status === statusFilter)
  );

  const handleCreateStudent = async () => {
    if (!form.firstName || !form.lastName) return;
    await createStudent.mutateAsync({
      firstName: form.firstName, lastName: form.lastName, dob: form.dob, gender: form.gender,
      fatherName: form.fatherName, phone: form.phone, email: form.email, address: form.address,
      classId: form.classId, sectionId: form.sectionId, admissionNo: form.admissionNo, bloodGroup: form.bloodGroup
    });
    setForm(STUDENT_EMPTY); setModal(false);
  };

  const handleCreateApp = async () => {
    if (!appForm.studentName) return;
    await createApp.mutateAsync(appForm);
    setAppForm(APP_EMPTY); setAppModal(false);
  };

  const getStudentName = (s: any) => s.user?.profile ? `${s.user.profile.firstName} ${s.user.profile.lastName}` : s.admissionNo || 'Student';

  return (
    <>
      <Topbar title="Admissions" subtitle="Student enrollment & application management" />
      <div className="p-6">
        <PageHeader title="Admissions" subtitle={`${studentsData?.meta?.total ?? 0} students enrolled`}
          action={
            <div className="flex gap-2">
              <button onClick={() => setAppModal(true)} className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">+ Application</button>
              <button onClick={() => setModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-500">+ Enroll Student</button>
            </div>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Enrolled', value: studentsData?.meta?.total ?? students.length, icon: '🎓', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: students.filter(s => s.status === 'ACTIVE').length, icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Applications', value: appList.length, icon: '📝', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Pending Apps', value: appList.filter(a => a.status === 'PENDING').length, icon: '⏳', color: 'text-yellow-600', bg: 'bg-yellow-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1"><span>{s.icon}</span><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {(['students','applications'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); setSearch(''); setStatusFilter(''); }} className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-all ${view === v ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{v}</button>
          ))}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={view === 'students' ? 'Search students...' : 'Search applications...'} className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          {view === 'students' ? (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {['', 'ACTIVE', 'INACTIVE', 'GRADUATED'].map(s => (
                <button key={s || 'all'} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${statusFilter === s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{s || 'All'}</button>
              ))}
            </div>
          ) : (
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {['', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                <button key={s || 'all'} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${statusFilter === s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{s || 'All'}</button>
              ))}
            </div>
          )}
        </div>

        {view === 'students' && (
          studentsLoading ? <div className="text-center py-12 text-gray-400">Loading students...</div>
          : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">🎓</p><p className="font-medium">{search ? 'No students found' : 'No students enrolled yet'}</p></div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left">Student</th><th className="px-4 py-3 text-left">Adm. No.</th>
                  <th className="px-4 py-3 text-left">Class</th><th className="px-4 py-3 text-left">Section</th>
                  <th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredStudents.map((s: any) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">{getStudentName(s)[0]}</div>
                          <span className="font-medium text-gray-800">{getStudentName(s)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.admissionNo}</td>
                      <td className="px-4 py-3 text-gray-500">{s.section?.class?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-500">{s.section?.name || 'N/A'}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_COLOR[s.status] as any}>{s.status}</Badge></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(s)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {view === 'applications' && (
          appLoading ? <div className="text-center py-12 text-gray-400">Loading applications...</div>
          : filteredApps.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><p className="text-4xl mb-2">📝</p><p className="font-medium">{search || statusFilter ? 'No applications found' : 'No applications yet'}</p></div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app: any) => (
                <div key={app.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{app.studentName}</p>
                      <p className="text-xs text-gray-400">Father: {app.fatherName || 'N/A'} · Class: {app.classApplied || 'N/A'} · {app.appliedAt}</p>
                      {app.phone && <p className="text-xs text-gray-400">📱 {app.phone}</p>}
                    </div>
                    <Badge variant={app.status === 'APPROVED' ? 'green' : app.status === 'REJECTED' ? 'red' : 'yellow'}>{app.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Enroll Student Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Enroll New Student">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">First Name *</label>
              <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Last Name *</label>
              <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Admission No.</label>
              <input value={form.admissionNo} onChange={e => setForm({ ...form, admissionNo: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Auto if empty" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Blood Group</label>
              <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Unknown</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
              </select></div>
          </div>
          <div><label className="text-xs text-gray-500 mb-1 block">Father's Name</label>
            <input value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Class</label>
              <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value, sectionId: '' })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select Class</option>
                {(Array.isArray(classes) ? classes : []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Section</label>
              <select value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select Section</option>
                {(Array.isArray(sections) ? sections : []).filter((s: any) => !form.classId || s.classId === form.classId).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select></div>
          </div>
          {[['phone','Phone'],['email','Email'],['address','Address']].map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label} /></div>
          ))}
          <button onClick={handleCreateStudent} disabled={createStudent.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createStudent.isPending ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </div>
      </Modal>

      {/* Application Modal */}
      <Modal isOpen={appModal} onClose={() => setAppModal(false)} title="New Admission Application">
        <div className="p-6 space-y-4">
          {[['studentName',"Student's Full Name *"],['fatherName',"Father's Name"],['phone','Phone'],['email','Email'],['classApplied','Class Applied For'],['address','Address']].map(([k,label]) => (
            <div key={k}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input value={(appForm as any)[k]} onChange={e => setAppForm({ ...appForm, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder={label.replace(' *','')} /></div>
          ))}
          <div><label className="text-xs text-gray-500 mb-1 block">Date of Application</label>
            <input type="date" value={appForm.appliedAt} onChange={e => setAppForm({ ...appForm, appliedAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
          <button onClick={handleCreateApp} disabled={createApp.isPending} className="w-full py-2 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50">
            {createApp.isPending ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </Modal>

      {/* Student Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? getStudentName(selected) : ''}>
        {selected && (
          <div className="p-6 space-y-2">
            {[
              ['Admission No', selected.admissionNo],
              ['Class', selected.section?.class?.name || 'N/A'],
              ['Section', selected.section?.name || 'N/A'],
              ['Status', selected.status],
              ['Gender', selected.gender || 'N/A'],
              ['Blood Group', selected.bloodGroup || 'N/A'],
              ['Phone', selected.user?.profile?.phone || 'N/A'],
              ['Email', selected.user?.email || 'N/A'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="font-medium text-gray-800">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
