'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { SchoolStats } from '../partials/stats';
import { AdmissionForm } from '../partials/admission-form';

export function BoldTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ background: theme.secondaryColor, minHeight: '100vh' }}>
      <SchoolNav theme={theme} slug={slug} onApply={() => setShowAdmission(true)} dark />

      {theme.sections?.hero !== false && (
      <section style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${theme.secondaryColor} 0%, ${theme.primaryColor} 100%)`, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: theme.accentColor, color: '#fff', padding: '6px 18px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
            Est. {theme.established} · {theme.city}
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(3rem,8vw,7rem)', fontFamily: 'var(--font-heading)', fontWeight: 900, lineHeight: 0.95, margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{theme.heroTitle || theme.schoolName}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: 500, marginBottom: 40, lineHeight: 1.7 }}>{theme.heroSubtitle || theme.tagline}</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ background: theme.accentColor, fontSize: '1rem', padding: '16px 36px' }} onClick={() => setShowAdmission(true)}>{theme.heroCtaText ? theme.heroCtaText.toUpperCase() : 'APPLY NOW'}</button>
            <a href={`/s/${slug}/portal`} style={{ padding: '16px 36px', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', fontWeight: 800, textDecoration: 'none', fontSize: '1rem', letterSpacing: '0.05em' }}>STUDENT PORTAL</a>
          </div>
        </div>
      </section>
      )}

      {theme.sections?.stats !== false && (
      <section style={{ background: theme.bgColor }}>
        <SchoolStats theme={theme} />
      </section>
      )}
      <SchoolFooter theme={theme} slug={slug} dark />
      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
