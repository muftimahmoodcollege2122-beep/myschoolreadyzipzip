'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolNav } from '../partials/nav';
import { SchoolFooter } from '../partials/footer';
import { PortalAccess } from '../partials/portal-access';
import { AdmissionForm } from '../partials/admission-form';

export function MagazineTemplate({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'var(--font-body)' }}>
      {/* Editorial top bar */}
      <div style={{ background: theme.primaryColor, color: '#fff', padding: '6px 24px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        📢 Admissions Open 2025–2026 · Apply Before Deadline
        <button onClick={() => setShowAdmission(true)} style={{ marginLeft: 16, background: '#fff', color: theme.primaryColor, border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer' }}>Apply Now</button>
      </div>

      <SchoolNav theme={{ ...theme, navStyle: 'transparent' }} slug={slug} onApply={() => setShowAdmission(true)} />

      {/* Magazine-style hero grid */}
      <section style={{ paddingTop: 80, display: 'grid', gridTemplateColumns: '2fr 1fr', minHeight: '85vh', maxWidth: 1400, margin: '0 auto', padding: '90px 24px 0' }}>
        {/* Main story */}
        <div style={{ borderRight: '2px solid #111', paddingRight: 40, paddingTop: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <div style={{ background: theme.primaryColor, color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Featured</div>
            <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>· {theme.city} · Est. {theme.established}</div>
          </div>
          <h1 style={{ fontSize: 'clamp(3rem,6vw,5rem)', fontFamily: 'var(--font-heading)', fontWeight: 900, color: '#0A0A0A', margin: '0 0 16px', lineHeight: 1.02, letterSpacing: '-0.03em' }}>
            {theme.schoolName}
          </h1>
          <div style={{ height: 3, width: 80, background: theme.primaryColor, marginBottom: 20 }} />
          <p style={{ fontSize: '1.1rem', color: '#374151', lineHeight: 1.8, maxWidth: 500, marginBottom: 32 }}>{theme.tagline}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowAdmission(true)} style={{ padding: '12px 28px', background: '#0A0A0A', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
              Enroll Now →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ paddingLeft: 32, paddingTop: 20 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', borderBottom: '2px solid #111', paddingBottom: 8, marginBottom: 20 }}>Portal Access</div>
          {[
            { icon: '🎓', title: 'Student Portal', role: 'student' },
            { icon: '👨‍👩‍👧', title: 'Parent Portal', role: 'parent' },
            { icon: '👨‍🏫', title: 'Teacher Portal', role: 'teacher' },
            { icon: '🔐', title: 'Admin Panel', role: 'admin' },
          ].map((p, i) => {
            const links = (theme as any).portalLinks || {};
            const href = links[p.role] || `/s/${slug}/${p.role === 'admin' ? 'admin' : p.role}`;
            return (
              <a key={p.role} href={href} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: `1px solid #F3F4F6`, textDecoration: 'none', color: '#111', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.paddingLeft = '6px'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.paddingLeft = '0'}>
                <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Sign in →</div>
                </div>
              </a>
            );
          })}

          <div style={{ marginTop: 28, padding: 20, background: theme.primaryColor, borderRadius: 4 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', marginBottom: 6 }}>📞 Contact Us</div>
            {theme.phone && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>{theme.phone}</div>}
            {theme.email && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', marginTop: 4 }}>{theme.email}</div>}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: '#0A0A0A', padding: '24px', marginTop: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0, justifyContent: 'space-around' }}>
          {[['1,500+','Students Enrolled'],['60+','Expert Faculty'],['15+','Academic Programmes'],['95%','Board Pass Rate']].map(([val,label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{val}</div>
              <div style={{ color: '#6B7280', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <PortalAccess theme={theme} slug={slug} />
      <SchoolFooter theme={theme} slug={slug} />
      {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
    </div>
  );
}
