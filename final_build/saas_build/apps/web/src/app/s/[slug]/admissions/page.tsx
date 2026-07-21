'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';

const CLASSES = ['Nursery','KG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
const GENDERS = ['Male','Female','Other'];

const steps = ['Student Info','Parent Info','Documents','Review'];

export default function PublicAdmissionPage() {
  const { slug } = useParams();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName:'', lastName:'', dateOfBirth:'', gender:'Male', email:'', phone:'',
    applyingForClass:'Class 1', previousSchool:'', address:'', nationality:'Pakistani', religion:'',
    parentName:'', parentPhone:'', parentEmail:'', relationship:'Father',
    notes:'',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/students/admissions/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-school-slug': slug as string },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.applicationId) { setAppId(data.applicationId); setSubmitted(true); }
    } catch (e) { alert('Submission failed. Please try again.'); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Application Submitted!</h1>
        <p className="text-gray-600 mb-4">Your application has been received successfully.</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-xs text-green-700 font-bold uppercase mb-1">Application ID</p>
          <p className="font-mono font-black text-green-800 text-lg">{appId}</p>
        </div>
        <p className="text-sm text-gray-500">Please save this ID for tracking. You will receive an SMS on <strong>{form.parentPhone}</strong> with updates.</p>
      </div>
    </div>
  );

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50";
  const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Online Admission Form</h1>
          <p className="text-gray-500 mt-2">Fill in the details to apply for admission</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">{i < step ? '✓' : i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* Step 0 — Student Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-900 mb-4">Student Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>First Name *</label><input value={form.firstName} onChange={e=>update('firstName',e.target.value)} placeholder="Ahmed" className={inputCls}/></div>
                <div><label className={labelCls}>Last Name *</label><input value={form.lastName} onChange={e=>update('lastName',e.target.value)} placeholder="Khan" className={inputCls}/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Date of Birth *</label><input type="date" value={form.dateOfBirth} onChange={e=>update('dateOfBirth',e.target.value)} className={inputCls}/></div>
                <div><label className={labelCls}>Gender *</label>
                  <select value={form.gender} onChange={e=>update('gender',e.target.value)} className={inputCls + ' bg-white'}>
                    {GENDERS.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelCls}>Applying for Class *</label>
                <select value={form.applyingForClass} onChange={e=>update('applyingForClass',e.target.value)} className={inputCls + ' bg-white'}>
                  {CLASSES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Previous School</label><input value={form.previousSchool} onChange={e=>update('previousSchool',e.target.value)} placeholder="Name of previous school (if any)" className={inputCls}/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Nationality</label><input value={form.nationality} onChange={e=>update('nationality',e.target.value)} className={inputCls}/></div>
                <div><label className={labelCls}>Religion</label><input value={form.religion} onChange={e=>update('religion',e.target.value)} placeholder="Optional" className={inputCls}/></div>
              </div>
              <div><label className={labelCls}>Home Address *</label><textarea value={form.address} onChange={e=>update('address',e.target.value)} rows={2} placeholder="Street, City" className={inputCls + ' resize-none'}/></div>
            </div>
          )}

          {/* Step 1 — Parent Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-900 mb-4">Parent / Guardian Information</h2>
              <div><label className={labelCls}>Parent / Guardian Name *</label><input value={form.parentName} onChange={e=>update('parentName',e.target.value)} placeholder="Muhammad Ali" className={inputCls}/></div>
              <div><label className={labelCls}>Relationship</label>
                <select value={form.relationship} onChange={e=>update('relationship',e.target.value)} className={inputCls + ' bg-white'}>
                  {['Father','Mother','Guardian','Other'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Phone Number * (SMS alerts will be sent here)</label><input type="tel" value={form.parentPhone} onChange={e=>update('parentPhone',e.target.value)} placeholder="03XX-XXXXXXX" className={inputCls}/></div>
              <div><label className={labelCls}>Email Address *</label><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="parent@email.com" className={inputCls}/></div>
              <div><label className={labelCls}>Student Email (for portal login)</label><input type="email" value={form.parentEmail} onChange={e=>update('parentEmail',e.target.value)} placeholder="student@email.com" className={inputCls}/></div>
            </div>
          )}

          {/* Step 2 — Documents */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-900 mb-4">Documents Checklist</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                Please bring the following documents when you visit the school for enrollment:
              </div>
              {[
                'Birth Certificate (original + copy)',
                'School Leaving Certificate (if applicable)',
                'Previous Academic Result Card',
                'CNIC / B-Form of student',
                'Parent/Guardian CNIC copy',
                '2 passport-size photographs of student',
              ].map((doc, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                  <span className="text-sm text-gray-700 font-medium">{doc}</span>
                </div>
              ))}
              <div>
                <label className={labelCls}>Additional Notes / Special Requirements</label>
                <textarea value={form.notes} onChange={e=>update('notes',e.target.value)} rows={3} placeholder="Any medical conditions, special needs, or other information..." className={inputCls + ' resize-none'}/>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-gray-900 mb-4">Review & Submit</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Student Name', `${form.firstName} ${form.lastName}`],
                  ['Date of Birth', form.dateOfBirth],
                  ['Gender', form.gender],
                  ['Applying for', form.applyingForClass],
                  ['Previous School', form.previousSchool || '—'],
                  ['Address', form.address],
                  ['Parent Name', form.parentName],
                  ['Parent Phone', form.parentPhone],
                  ['Email', form.email],
                  ['Nationality', form.nationality],
                ].map(([k,v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 font-bold uppercase">{k}</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                By submitting, you confirm all information provided is accurate. You will receive an SMS confirmation on <strong>{form.parentPhone}</strong>.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50">← Back</button>
            )}
            {step < 3 ? (
              <button
                onClick={()=>setStep(s=>s+1)}
                disabled={step===0 && (!form.firstName||!form.lastName||!form.dateOfBirth||!form.address)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40"
              >Next →</button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !form.parentName || !form.parentPhone || !form.email}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-40"
              >{loading ? 'Submitting...' : '🚀 Submit Application'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
