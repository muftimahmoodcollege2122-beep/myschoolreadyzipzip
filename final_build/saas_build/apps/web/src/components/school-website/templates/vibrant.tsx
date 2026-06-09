'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { SchoolStats } from '../partials/stats';
import { AdmissionForm } from '../partials/admission-form';
import { SchoolHomeExtras } from '../partials/home-extras';

export function VibrantTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ background: theme.bgColor, minHeight: '100vh' }}>
      <SchoolNav theme={theme} slug={slug} onApply={() => setShowAdmission(true)} />

      {theme.sections?.hero !== false && (
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', textAlign: 'center', padding: '120px 24px 80px' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: `${theme.primaryColor}20`, filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: `${theme.accentColor}20`, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          {theme.logoUrl && <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 100, height: 100, borderRadius: 'var(--radius)', objectFit: 'cover', marginBottom: 24, boxShadow: 'var(--shadow)' }} />}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${theme.primaryColor}15`, border: `1.5px solid ${theme.primaryColor}30`, borderRadius: 100, padding: '6px 18px', fontSize: '0.78rem', fontWeight: 700, color: theme.primaryColor, marginBottom: 24, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.primaryColor, display: 'inline-block' }} />
            {theme.city} · Est. {theme.established}
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, lineHeight: 1.05, margin: '0 0 20px', color: theme.secondaryColor }}>{theme.heroTitle || theme.schoolName}</h1>
          <p style={{ fontSize: '1.15rem', color: '#4A5E6D', lineHeight: 1.8, marginBottom: 40 }}>{theme.heroSubtitle || theme.tagline}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }} onClick={() => setShowAdmission(true)}>🚀 {theme.heroCtaText || 'Apply Now'}</button>
            <a href={`/s/${slug}/login`} className="btn-secondary" style={{ textDecoration: 'none', fontSize: '1rem', padding: '14px 32px' }}>Portal Login</a>
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
