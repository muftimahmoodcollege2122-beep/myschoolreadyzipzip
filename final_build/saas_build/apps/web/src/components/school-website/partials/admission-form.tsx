'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '@/types/theme';

export function AdmissionForm({ theme, slug, onClose }: { theme: SchoolTheme; slug: string; onClose: () => void }) {
  const [form, setForm] = useState({ studentName: '', fatherName: '', phone: '', email: '', applyingClass: '', previousSchool: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1.5px solid #E4EBF0', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', marginBottom: 12 };

  const submit = async () => {
    setStatus('loading');
    try {
      await fetch('/api/v1/admissions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': slug }, body: JSON.stringify({ ...form, source: 'website' }) });
      setStatus('done');
    } catch { setStatus('error'); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 4px', fontSize: '1.3rem' }}>Apply for Admission</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.82rem', margin: 0 }}>{theme.schoolName} · {theme.city}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>✕</button>
        </div>

        {status === 'done' ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.primaryColor, marginBottom: 8 }}>Application Submitted!</h3>
            <p style={{ color: '#6B7280', lineHeight: 1.7 }}>Thank you! We'll contact you within 24-48 hours to discuss next steps.</p>
            <button className="btn-primary" style={{ marginTop: 20 }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <div><label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Student Name *</label><input placeholder="Full name" value={form.studentName} onChange={f('studentName')} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Father's Name</label><input placeholder="Father name" value={form.fatherName} onChange={f('fatherName')} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Phone *</label><input placeholder="0300-0000000" value={form.phone} onChange={f('phone')} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Email</label><input type="email" placeholder="email@example.com" value={form.email} onChange={f('email')} style={inputStyle} /></div>
            </div>
            <div><label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Applying for Class *</label>
              <select value={form.applyingClass} onChange={f('applyingClass')} style={{ ...inputStyle, background: '#fff' }}>
                <option value="">Select class...</option>
                {['Play Group','Nursery','KG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','FSc Part 1','FSc Part 2'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Previous School</label><input placeholder="Previous school name" value={form.previousSchool} onChange={f('previousSchool')} style={inputStyle} /></div>
            {status === 'error' && <p style={{ color: '#EF4444', fontSize: '0.84rem', marginBottom: 12 }}>Something went wrong. Please try again.</p>}
            <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', opacity: status === 'loading' ? 0.7 : 1 }} onClick={submit} disabled={status === 'loading' || !form.studentName || !form.phone || !form.applyingClass}>
              {status === 'loading' ? 'Submitting...' : '🚀 Submit Application'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
