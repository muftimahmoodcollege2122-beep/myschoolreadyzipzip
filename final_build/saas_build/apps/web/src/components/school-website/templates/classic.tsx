'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { SchoolStats } from '../partials/stats';
import { SchoolFeatures } from '../partials/features';
import { AdmissionForm } from '../partials/admission-form';
import { SchoolHomeExtras } from '../partials/home-extras';

export function ClassicTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ background: theme.bgColor, minHeight: '100vh' }}>
      <SchoolNav theme={theme} slug={slug} onApply={() => setShowAdmission(true)} />

      {theme.sections?.hero !== false && (
      <section style={{ background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`, padding: '120px 0 80px', textAlign: 'center' }}>
        <div className="container">
          {theme.logoUrl && <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 90, height: 90, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.4)', marginBottom: 24, objectFit: 'cover' }} />}
          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3.5rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1 }}>{theme.heroTitle || theme.schoolName}</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.15rem', maxWidth: 600, margin: '0 auto 32px' }}>{theme.heroSubtitle || theme.tagline}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ background: '#fff', color: theme.primaryColor }} onClick={() => setShowAdmission(true)}>{theme.heroCtaText || 'Apply for Admission'}</button>
            <a href={`/s/${slug}/login`} style={{ padding: '12px 28px', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 'var(--radius)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Portal Login</a>
          </div>
        </div>
      </section>
      )}

      {theme.sections?.stats !== false && <SchoolStats theme={theme} />}
      <SchoolFeatures theme={theme} />

      {theme.sections?.about !== false && (
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 40, alignItems: 'center' }} data-responsive-2col>
          <div>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About Us</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontFamily: 'var(--font-heading)', margin: '12px 0 20px', color: theme.secondaryColor }}>Shaping Tomorrow's Leaders Since {theme.established}</h2>
            <p style={{ color: '#4A5E6D', lineHeight: 1.8, marginBottom: 16 }}>
              {theme.aboutText || `${theme.schoolName} is dedicated to providing world-class education in ${theme.city}. Our experienced faculty and modern facilities ensure every student reaches their full potential.`}
            </p>
            {theme.principalName && <p style={{ color: '#4A5E6D', lineHeight: 1.8 }}>Our principal, <strong>{theme.principalName}</strong>, leads a team committed to academic excellence and character development.</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setShowAdmission(true)}>{theme.heroCtaText || 'Enroll Today'}</button>
              <a href={`/s/${slug}/about`} className="btn-secondary" style={{ textDecoration: 'none' }}>Learn More</a>
            </div>
          </div>
          <div style={{ background: `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.accentColor}15)`, borderRadius: 'var(--radius)', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: 16 }}>🎓</div>
            <p style={{ color: theme.primaryColor, fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>Est. {theme.established}</p>
            <p style={{ color: '#6B7280', marginTop: 8 }}>{theme.city}</p>
          </div>
        </div>
      </section>
      )}

      <SchoolHomeExtras theme={theme} slug={slug} />
      <SchoolFooter theme={theme} slug={slug} />
      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
