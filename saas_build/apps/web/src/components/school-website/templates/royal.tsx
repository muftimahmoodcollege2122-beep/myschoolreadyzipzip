'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { PortalAccess } from '../partials/portal-access';
import { AdmissionForm } from '../partials/admission-form';

export function RoyalTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  const gold = '#C9A227';
  const navy = theme.secondaryColor || '#1E3A5F';
  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F0' }}>
      <SchoolNav theme={{ ...theme, navStyle: 'solid' }} slug={slug} onApply={() => setShowAdmission(true)} dark />

      {/* Royal hero */}
      <section style={{ background: `linear-gradient(180deg, ${navy} 0%, #0F2137 100%)`, padding: '130px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 60px, ${gold}08 60px, ${gold}08 61px)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Crest area */}
          <div style={{ width: 2, height: 40, background: gold, margin: '0 auto 20px', opacity: 0.6 }} />
          <div style={{ display: 'inline-block', border: `2px solid ${gold}60`, borderRadius: '50%', padding: 4, marginBottom: 24 }}>
            {theme.logoUrl
              ? <img src={theme.logoUrl} alt="" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: 90, height: 90, borderRadius: '50%', background: `${gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>👑</div>}
          </div>
          <div style={{ color: gold, fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>Est. {theme.established} · {theme.city}</div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2.4rem,5vw,4rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {theme.schoolName}
          </h1>
          <div style={{ width: 80, height: 2, background: `linear-gradient(90deg,transparent,${gold},transparent)`, margin: '0 auto 20px' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.8 }}>{theme.tagline}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowAdmission(true)} style={{ padding: '13px 32px', background: `linear-gradient(135deg,${gold},#E8C547)`, color: '#0F2137', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}>
              Apply for Admission
            </button>
            <a href="#portals" style={{ padding: '13px 28px', border: `1.5px solid ${gold}50`, color: gold, borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              Portal Access →
            </a>
          </div>
        </div>
      </section>

      {/* Gold stats bar */}
      <div style={{ background: gold, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[['1,500+','Students'],['60+','Faculty'],['15+','Programmes'],['95%','Pass Rate']].map(([val,label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#0F2137', fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{val}</div>
              <div style={{ color: '#0F2137', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, opacity: 0.7 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <PortalAccess theme={theme} slug={slug} />
      <SchoolFooter theme={theme} slug={slug} dark />
      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
