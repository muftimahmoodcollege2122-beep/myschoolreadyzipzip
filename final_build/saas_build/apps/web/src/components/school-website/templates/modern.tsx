'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { SchoolStats } from '../partials/stats';
import { AdmissionForm } from '../partials/admission-form';

export function ModernTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ background: theme.bgColor, minHeight: '100vh' }}>
      <SchoolNav theme={theme} slug={slug} onApply={() => setShowAdmission(true)} />

      {/* Hero — split layout */}
      <section style={{ minHeight: '90vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', background: theme.bgColor }}>
          <div style={{ width: 60, height: 4, background: theme.primaryColor, borderRadius: 2, marginBottom: 24 }} />
          <h1 style={{ fontSize: 'clamp(2.2rem,4vw,3.8rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: theme.secondaryColor, lineHeight: 1.1, margin: '0 0 20px' }}>{theme.schoolName}</h1>
          <p style={{ fontSize: '1.1rem', color: '#4A5E6D', lineHeight: 1.8, maxWidth: 420, marginBottom: 36 }}>{theme.tagline}</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setShowAdmission(true)}>Apply Now →</button>
            <a href={`/s/${slug}/portal`} className="btn-secondary" style={{ textDecoration: 'none' }}>Student Login</a>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
            {[['Est.', theme.established], [theme.city, 'Location']].map(([label, val]) => (
              <div key={label}><p style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.primaryColor, margin: 0 }}>{val}</p><p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: 0 }}>{label}</p></div>
            ))}
          </div>
        </div>
        <div style={{ background: `linear-gradient(160deg, ${theme.primaryColor}, ${theme.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            {theme.logoUrl ? <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 140, height: 140, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', objectFit: 'cover', marginBottom: 24 }} />
              : <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', margin: '0 auto 24px' }}>🏫</div>}
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading)', margin: '0 0 8px', fontSize: '1.4rem' }}>{theme.schoolName}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>{theme.city}</p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
              {[['🎓','Students'], ['📚','Subjects'], ['🏆','Results']].map(([ic, lb]) => (
                <div key={lb} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>{ic}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', marginTop: 4 }}>{lb}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SchoolStats theme={theme} />
      <SchoolFooter theme={theme} slug={slug} />
      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
