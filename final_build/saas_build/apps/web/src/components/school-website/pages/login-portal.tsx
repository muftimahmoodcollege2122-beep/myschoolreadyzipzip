'use client';
import React, { useState, useEffect } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { ThemeProvider } from '../theme-provider';
import { SchoolFooter } from '../partials/footer';

interface Props { theme: SchoolTheme; slug: string; }

const PORTALS = [
  {
    id: 'student',
    icon: '👩‍🎓',
    title: 'Student Portal',
    desc: 'Access your timetable, attendance, grades, assignments, fee status, and learning resources.',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
    features: ['📊 Attendance Records', '🎯 Grade Cards', '📝 Assignments', '💰 Fee Status', '🎓 LMS Courses', '📢 Notices'],
    href: (slug: string) => `/learn/${slug}/login`,
  },
  {
    id: 'parent',
    icon: '👨‍👩‍👧',
    title: 'Parent Portal',
    desc: 'Monitor your child\'s progress, pay fees, view attendance, and communicate with teachers.',
    color: '#047857',
    gradient: 'linear-gradient(135deg, #047857, #065F46)',
    features: ['👧 Child Progress', '✅ Attendance', '💰 Fee Payments', '🎯 Report Cards', '📢 Notices', '🚌 Transport'],
    href: (slug: string) => `/parent/${slug}/login`,
  },
  {
    id: 'teacher',
    icon: '👨‍🏫',
    title: 'Teacher Portal',
    desc: 'Manage attendance, gradebooks, assignments, lesson plans, and communicate with students.',
    color: '#1D4ED8',
    gradient: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)',
    features: ['✅ Mark Attendance', '🎯 Gradebook', '📝 Assignments', '🗓️ Timetable', '🎓 LMS', '📢 Post Notices'],
    href: (slug: string) => `/t/${slug}/login`,
  },
];

export function LoginPortalPage({ theme, slug }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <div style={{ background: theme.bgColor, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${theme.secondaryColor} 0%, ${theme.primaryColor} 100%)`, padding: '0 24px', height: 66, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href={`/s/${slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              {theme.logoUrl
                ? <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏫</div>
              }
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{theme.schoolName}</span>
            </a>
            <a href={`/s/${slug}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Back to Website</a>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: `linear-gradient(180deg, ${theme.secondaryColor}08 0%, transparent 100%)`, padding: '52px 24px 40px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem', boxShadow: `0 12px 32px ${theme.primaryColor}40` }}>🔐</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 800, margin: '0 0 10px' }}>Choose Your Portal</h1>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>{theme.schoolName} — Select the portal that matches your role</p>
        </div>

        {/* Portal Cards */}
        <div style={{ flex: 1, padding: '0 24px 60px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {PORTALS.map(portal => (
              <a key={portal.id} href={portal.href(slug)} style={{ textDecoration: 'none', display: 'block' }}
                onMouseEnter={() => setHovered(portal.id)}
                onMouseLeave={() => setHovered(null)}>
                <div style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: hovered === portal.id ? `0 20px 48px ${portal.color}25` : 'var(--shadow)', transform: hovered === portal.id ? 'translateY(-6px)' : 'none', transition: 'all 0.3s' }}>
                  {/* Card Header */}
                  <div style={{ background: portal.gradient, padding: '32px 28px 28px' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: 16 }}>
                      {portal.icon}
                    </div>
                    <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: '0 0 8px', fontWeight: 800 }}>{portal.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>{portal.desc}</p>
                  </div>

                  {/* Features */}
                  <div style={{ padding: '20px 24px 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                      {portal.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: portal.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.78rem', color: '#4B5563' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: portal.gradient, borderRadius: 'var(--radius)', padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '0.9rem', transition: 'opacity 0.2s' }}>
                      <span>Login to {portal.title}</span>
                      <span style={{ fontSize: '1.1rem' }}>→</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Admin Link */}
          <div style={{ maxWidth: 960, margin: '24px auto 0', textAlign: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '16px 24px', display: 'inline-flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⚙️</div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, color: theme.secondaryColor, margin: '0 0 2px', fontSize: '0.9rem' }}>School Administration</p>
                <p style={{ color: '#9CA3AF', fontSize: '0.78rem', margin: 0 }}>For admin, principal, and management staff</p>
              </div>
              <a href={`/login?slug=${slug}`} style={{ background: theme.secondaryColor, color: '#fff', padding: '9px 18px', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>Admin Login</a>
            </div>
          </div>

          {/* Help */}
          <div style={{ textAlign: 'center', marginTop: 32, padding: '0 24px' }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.82rem', margin: 0 }}>
              Having trouble logging in? Contact us at{' '}
              <a href={`tel:${theme.phone}`} style={{ color: theme.primaryColor, fontWeight: 600, textDecoration: 'none' }}>{theme.phone || 'school office'}</a>
              {' '}or{' '}
              <a href={`mailto:${theme.email}`} style={{ color: theme.primaryColor, fontWeight: 600, textDecoration: 'none' }}>{theme.email || 'email us'}</a>
            </p>
          </div>
        </div>

        <SchoolFooter theme={theme} slug={slug} />
      </div>
    </ThemeProvider>
  );
}
