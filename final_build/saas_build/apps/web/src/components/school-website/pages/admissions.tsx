'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { SchoolSubPage } from '../school-sub-page';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const CLASSES = ['Play Group', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'FSc Part 1', 'FSc Part 2'];

export function AdmissionsPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [form, setForm] = useState({ studentName: '', fatherName: '', motherName: '', dob: '', gender: '', phone: '', email: '', address: '', applyingClass: '', previousSchool: '', previousGrade: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'primary' | 'middle' | 'secondary' | 'higher'>('primary');

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/v1/admissions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': slug }, body: JSON.stringify({ ...form, source: 'website' }) });
      setStatus(res.ok ? 'done' : 'error');
    } catch { setStatus('error'); }
  };

  const inputCls: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', background: '#fff', transition: 'border-color 0.2s' };
  const labelCls: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 };

  const steps = [
    { n: '01', title: 'Fill Application', desc: 'Complete the online admission form below with accurate information.' },
    { n: '02', title: 'Submit Documents', desc: 'Visit the school with original documents: B-Form, previous result cards, photos.' },
    { n: '03', title: 'Entrance Test', desc: 'Appear for the short entrance assessment (waived for nursery/KG).' },
    { n: '04', title: 'Fee Submission', desc: 'Pay the admission fee and first month dues to confirm your seat.' },
    { n: '05', title: 'Welcome!', desc: 'Collect your uniform, books list, and ID card. Classes begin!' },
  ];

  const feeStructure = {
    primary:   { label: 'Primary (Play Group – Class 5)',   admission: '5,000', monthly: '2,500–3,500', annual: '2,000' },
    middle:    { label: 'Middle (Class 6 – Class 8)',        admission: '6,000', monthly: '3,500–4,500', annual: '2,500' },
    secondary: { label: 'Secondary (Class 9 – 10)',          admission: '8,000', monthly: '4,500–5,500', annual: '3,000' },
    higher:    { label: 'Higher Secondary (FSc Part 1 & 2)', admission: '10,000', monthly: '5,500–6,500', annual: '3,500' },
  };

  const requirements = ['Original Birth Certificate / B-Form (NADRA)', 'Previous School Leaving Certificate', 'Last Annual / Result Card (attested copy)', 'Latest Passport Size Photographs (4)', 'Parent/Guardian CNIC copy', 'Character Certificate from previous institution'];

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="Admissions" pageSubtitle={`Join the ${theme.schoolName} family — applications open for academic year ${new Date().getFullYear() + 1}`}>

      {/* How to Apply */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Admission Process</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>How to Apply — 5 Easy Steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20, position: 'relative' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '28px 20px', position: 'relative' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 24px ${theme.primaryColor}30` }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>{s.n}</span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 8px', fontSize: '0.95rem' }}>{s.title}</h4>
                <p style={{ color: '#6B7280', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 46, right: -12, fontSize: '1.2rem', color: `${theme.primaryColor}60` }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements + Fee Side by Side */}
      <section className="section-padding" style={{ background: `${theme.primaryColor}07` }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Requirements */}
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 20px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📋</span>
              Documents Required
            </h3>
            {requirements.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < requirements.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${theme.primaryColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: theme.primaryColor, fontSize: '0.7rem' }}>✓</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#374151', lineHeight: 1.5 }}>{r}</p>
              </div>
            ))}
          </div>

          {/* Fee Structure */}
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 20px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>💰</span>
              Fee Structure (Rs.)
            </h3>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {(['primary','middle','secondary','higher'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${activeTab === tab ? theme.primaryColor : '#E5E7EB'}`, background: activeTab === tab ? theme.primaryColor : '#fff', color: activeTab === tab ? '#fff' : '#6B7280', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ background: `${theme.primaryColor}08`, borderRadius: 10, padding: 16 }}>
              <p style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.8rem', margin: '0 0 14px' }}>{feeStructure[activeTab].label}</p>
              {[
                ['Admission Fee (one-time)', feeStructure[activeTab].admission],
                ['Monthly Tuition Fee',      feeStructure[activeTab].monthly],
                ['Annual Charges',           feeStructure[activeTab].annual],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '0.84rem', color: '#4B5563' }}>{l}</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: theme.secondaryColor }}>Rs. {v}</span>
                </div>
              ))}
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '12px 0 0' }}>* Fees may vary. Contact admissions office for exact details.</p>
            </div>
            <a href={`/s/${slug}/fees`} style={{ display: 'block', textAlign: 'center', marginTop: 16, color: theme.primaryColor, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>View Complete Fee Structure →</a>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section style={{ background: '#fff', padding: '40px 0' }}>
        <div className="container">
          <div style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, borderRadius: 'var(--radius)', padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20 }}>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Forms Available From</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>1 January {new Date().getFullYear() + 1}</p>
            </div>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Last Date to Apply</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>28 February {new Date().getFullYear() + 1}</p>
            </div>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Entrance Test</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>5 March {new Date().getFullYear() + 1}</p>
            </div>
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Classes Begin</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0 }}>1 April {new Date().getFullYear() + 1}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Form */}
      <section className="section-padding" style={{ background: `${theme.primaryColor}07` }} id="apply">
        <div className="container" style={{ maxWidth: 780 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Apply Online</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>Online Admission Form</h2>
          </div>

          {status === 'done' ? (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px' }}>✅</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 12px' }}>Application Submitted!</h3>
              <p style={{ color: '#6B7280', margin: '0 0 24px' }}>Thank you for applying to {theme.schoolName}. We will contact you within 2-3 working days regarding the next steps.</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.82rem', margin: 0 }}>For inquiries: {theme.phone || theme.email || 'contact the school office'}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="card" style={{ padding: 36 }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 20px', fontSize: '1rem', paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>Student Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[['Student Full Name','studentName','text',true],['Father\'s Name','fatherName','text',true],['Mother\'s Name','motherName','text',false],['Date of Birth','dob','date',true]].map(([l,k,t,req]) => (
                  <div key={k as string}>
                    <label style={labelCls}>{l as string}{req && <span style={{ color: '#EF4444' }}> *</span>}</label>
                    <input type={t as string} value={(form as any)[k as string]} onChange={f(k as string)} required={req as boolean} style={inputCls}
                      onFocus={e => (e.target.style.borderColor = theme.primaryColor)}
                      onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                ))}
                <div>
                  <label style={labelCls}>Gender <span style={{ color: '#EF4444' }}>*</span></label>
                  <select value={form.gender} onChange={f('gender')} required style={inputCls}
                    onFocus={e => (e.target.style.borderColor = theme.primaryColor)}
                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={labelCls}>Applying for Class <span style={{ color: '#EF4444' }}>*</span></label>
                  <select value={form.applyingClass} onChange={f('applyingClass')} required style={inputCls}
                    onFocus={e => (e.target.style.borderColor = theme.primaryColor)}
                    onBlur={e => (e.target.style.borderColor = '#E5E7EB')}>
                    <option value="">Select Class</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 20px', fontSize: '1rem', paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>Contact Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[['Phone Number','phone','tel',true],['Email Address','email','email',false],['Previous School','previousSchool','text',false],['Last Grade / Result','previousGrade','text',false]].map(([l,k,t,req]) => (
                  <div key={k as string}>
                    <label style={labelCls}>{l as string}{req && <span style={{ color: '#EF4444' }}> *</span>}</label>
                    <input type={t as string} value={(form as any)[k as string]} onChange={f(k as string)} required={req as boolean} style={inputCls}
                      onFocus={e => (e.target.style.borderColor = theme.primaryColor)}
                      onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelCls}>Home Address</label>
                <textarea value={form.address} onChange={f('address')} rows={2} style={{ ...inputCls, resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = theme.primaryColor)}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              </div>

              {status === 'error' && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                  <p style={{ color: '#DC2626', fontSize: '0.84rem', margin: 0 }}>Something went wrong. Please try again or contact the school directly.</p>
                </div>
              )}

              <button type="submit" disabled={status === 'loading'}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', opacity: status === 'loading' ? 0.7 : 1 }}>
                {status === 'loading' ? '⏳ Submitting Application...' : '🎓 Submit Application'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', margin: '12px 0 0' }}>
                By submitting, you agree to be contacted by {theme.schoolName} admissions team.
              </p>
            </form>
          )}

          {/* Download Prospectus */}
          <div style={{ marginTop: 20, textAlign: 'center', padding: '20px 24px', background: '#fff', borderRadius: 'var(--radius)', border: `2px dashed ${theme.primaryColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: 700, color: theme.secondaryColor, margin: '0 0 2px', fontSize: '0.95rem' }}>📄 School Prospectus</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.78rem', margin: 0 }}>Complete information about programs, fees, and facilities</p>
            </div>
            <button className="btn-primary" style={{ fontSize: '0.82rem', padding: '10px 20px' }}>Download PDF</button>
          </div>
        </div>
      </section>
    </SchoolSubPage>
  );
}
