'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { PortalAccess } from '../partials/portal-access';
import { AdmissionForm } from '../partials/admission-form';

export function GlassmorphismTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 50%, ${theme.accentColor} 100%)`, position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', right: '-15%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: `${theme.accentColor}30`, filter: 'blur(60px)', pointerEvents: 'none' }} />

      <SchoolNav theme={theme} slug={slug} onApply={() => setShowAdmission(true)} />

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px', position: 'relative' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          {theme.logoUrl && <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', marginBottom: 28, backdropFilter: 'blur(10px)' }} />}
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '6px 18px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Est. {theme.established} · {theme.city}
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(2.4rem,6vw,4.5rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.05, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
            {theme.schoolName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.15rem', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.8 }}>{theme.tagline}</p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowAdmission(true)} style={{
              padding: '14px 32px', background: 'rgba(255,255,255,0.95)', color: theme.primaryColor,
              border: 'none', borderRadius: 100, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)',
            }}>Apply for Admission</button>
            <a href="#portals" style={{
              padding: '14px 32px', background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 100, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            }}>View Portals</a>
          </div>

          {/* Glass stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginTop: 60 }}>
            {[['🎓','1,500+','Students'],['👨‍🏫','60+','Teachers'],['📚','15+','Programs'],['🏆','95%','Pass Rate']].map(([icon,val,label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>
                <div style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Access on glass bg */}
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <PortalAccess theme={theme} slug={slug} />
      </div>

      <div style={{ background: '#fff' }}>
        <SchoolFooter theme={theme} slug={slug} />
      </div>

      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
