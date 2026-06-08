'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { PortalAccess } from '../partials/portal-access';
import { AdmissionForm } from '../partials/admission-form';

export function MinimalTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111' }}>
      <SchoolNav theme={{ ...theme, navStyle: 'transparent' }} slug={slug} onApply={() => setShowAdmission(true)} />

      {/* Hero — ultra minimal */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            {theme.logoUrl && <img src={theme.logoUrl} alt="" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />}
            <div style={{ height: 1, flex: 1, background: '#E5E7EB' }} />
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{theme.city} · Est. {theme.established}</div>
          </div>

          <h1 style={{ fontSize: 'clamp(3rem,7vw,6rem)', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#0A0A0A', margin: '0 0 24px', lineHeight: 1.02, letterSpacing: '-0.03em' }}>
            {theme.schoolName}
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#6B7280', lineHeight: 1.8, maxWidth: 580, marginBottom: 40 }}>{theme.tagline}</p>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowAdmission(true)} style={{ padding: '13px 28px', background: '#0A0A0A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
              Apply for Admission →
            </button>
            <a href="#portals" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #E5E7EB', paddingBottom: 2 }}>
              Access Portals
            </a>
          </div>

          {/* Minimal stats row */}
          <div style={{ display: 'flex', gap: 48, marginTop: 64, paddingTop: 40, borderTop: '1px solid #E5E7EB' }}>
            {[['1,500+','Students'],['60+','Teachers'],['95%','Pass Rate'],['15+','Programmes']].map(([val,label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: theme.primaryColor }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ height: 1, background: '#E5E7EB' }} />

      <PortalAccess theme={theme} slug={slug} />
      <SchoolFooter theme={theme} slug={slug} />
      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
