'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { PortalAccess } from '../partials/portal-access';
import { AdmissionForm } from '../partials/admission-form';

export function DarkTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  const accent = theme.primaryColor;
  return (
    <div style={{ minHeight: '100vh', background: '#070C14', color: '#E2E8F0' }}>
      <SchoolNav theme={{ ...theme, navStyle: 'solid' }} slug={slug} onApply={() => setShowAdmission(true)} dark />

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accent}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${accent}15`, border: `1px solid ${accent}30`, color: accent, fontSize: '0.76rem', fontWeight: 700, padding: '6px 14px', borderRadius: 100, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {theme.city} · Est. {theme.established}
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2.4rem,5vw,4rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.08 }}>
              {theme.schoolName}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 36, maxWidth: 420 }}>{theme.tagline}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAdmission(true)} style={{ padding: '13px 28px', background: accent, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 8px 24px ${accent}40` }}>
                Apply Now →
              </button>
              <a href="#portals" style={{ padding: '13px 28px', background: 'rgba(255,255,255,0.05)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                Portals →
              </a>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { icon: '🎓', val: '1,500+', label: 'Students Enrolled', color: '#059669' },
              { icon: '👨‍🏫', val: '60+', label: 'Expert Teachers', color: '#2563EB' },
              { icon: '📚', val: '15+', label: 'Programmes', color: '#7C3AED' },
              { icon: '🏆', val: '95%', label: 'Pass Rate', color: '#D97706' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: 16 }}>Shaping Tomorrow's Leaders</h2>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            {theme.schoolName} is committed to academic excellence, character development, and preparing students for the challenges of tomorrow.
          </p>
        </div>
      </section>

      {/* Portals */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <PortalAccess theme={theme} slug={slug} />
      </div>

      {/* Footer */}
      <footer style={{ background: '#0A0F1A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ color: '#334155', fontSize: '0.82rem' }}>
          © {new Date().getFullYear()} {theme.schoolName} · {theme.city} ·
          <a href="/signup" style={{ color: accent, textDecoration: 'none', marginLeft: 6 }}>Powered by MySchool</a>
        </div>
      </footer>

      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
