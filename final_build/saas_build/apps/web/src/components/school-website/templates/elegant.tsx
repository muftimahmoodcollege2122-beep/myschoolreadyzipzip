'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { SchoolStats } from '../partials/stats';
import { AdmissionForm } from '../partials/admission-form';
import { SchoolHomeExtras } from '../partials/home-extras';

export function ElegantTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ background: theme.bgColor, minHeight: '100vh' }}>
      <SchoolNav theme={theme} slug={slug} onApply={() => setShowAdmission(true)} />

      {theme.sections?.hero !== false && (
      <section style={{ position: 'relative', padding: '120px 0 160px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.primaryColor} 50%, ${theme.bgColor} 50%)`, zIndex: 0 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,4vw,3.5rem)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.15, margin: '0 0 20px' }}>{theme.heroTitle || theme.schoolName}</h1>
            <div style={{ width: 60, height: 2, background: theme.accentColor, margin: '0 0 20px' }} />
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: 36 }}>{theme.heroSubtitle || theme.tagline}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ background: '#fff', color: theme.primaryColor }} onClick={() => setShowAdmission(true)}>{theme.heroCtaText || 'Apply for Admission'}</button>
              <a href={`/s/${slug}/login`} style={{ padding: '12px 24px', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', fontWeight: 700, textDecoration: 'none', borderRadius: 'var(--radius)' }}>Portal Login</a>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 40, boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, marginBottom: 20, fontStyle: 'italic' }}>Quick Admission</h3>
            <AdmissionFormInline theme={theme} slug={slug} />
          </div>
        </div>
      </section>
      )}

      {theme.sections?.stats !== false && <SchoolStats theme={theme} />}
      <SchoolHomeExtras theme={theme} slug={slug} />
      <SchoolFooter theme={theme} slug={slug} />
      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}

function AdmissionFormInline({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [cls, setCls] = useState(''); const [sent, setSent] = useState(false);
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid #E4EBF0', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', marginBottom: 12 };
  return sent ? <div style={{ textAlign: 'center', padding: 20 }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div><p style={{ color: theme.primaryColor, fontWeight: 700 }}>Application Received!</p><p style={{ color: '#6B7280', fontSize: '0.88rem' }}>We'll contact you within 24 hours.</p></div>
    : <><input placeholder="Student Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        <input placeholder="Parent Phone" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
        <select value={cls} onChange={e => setCls(e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
          <option value="">Select Class</option>
          {['Play Group','Nursery','KG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','FSc Part 1','FSc Part 2'].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={async () => {
          if (!name || !phone || !cls) return;
          try { await fetch(`/api/v1/admissions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': slug }, body: JSON.stringify({ studentName: name, parentPhone: phone, applyingClass: cls, source: 'website' }) }); } catch {}
          setSent(true);
        }}>Submit Application</button>
      </>;
}
