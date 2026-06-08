'use client';
import React from 'react';
import type { SchoolTheme } from '../../../types/theme';

const PORTALS = [
  {
    role: 'student',
    icon: '🎓',
    title: 'Student Portal',
    desc: 'View grades, timetable, attendance, assignments, and fee status.',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    role: 'parent',
    icon: '👨‍👩‍👧',
    title: 'Parent Portal',
    desc: "Track your child's progress, attendance alerts, and pay fees online.",
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    role: 'teacher',
    icon: '👨‍🏫',
    title: 'Teacher Portal',
    desc: 'Mark attendance, enter grades, manage timetable and lesson plans.',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
  {
    role: 'admin',
    icon: '🔐',
    title: 'Admin Dashboard',
    desc: 'Full school management — students, staff, fees, reports, and settings.',
    color: '#DC2626',
    bg: '#FFF1F2',
    border: '#FECDD3',
  },
];

export function PortalAccess({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const getHref = (role: string) => {
    const links = (theme as any).portalLinks || {};
    return links[role] || `/s/${slug}/${role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : role === 'parent' ? 'parent' : 'portal'}`;
  };

  return (
    <section id="portals" style={{ padding: '80px 0', background: '#F8FAFC' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${theme.primaryColor}12`, color: theme.primaryColor, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: 100, marginBottom: 16 }}>
            🔐 Portal Access
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#0F2137', margin: '0 0 14px', lineHeight: 1.15 }}>
            One School. Four Portals.
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Every member of our school community has their own dedicated portal — secure, fast, and mobile-friendly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 20 }}>
          {PORTALS.map(portal => (
            <a key={portal.role} href={getHref(portal.role)} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: '#fff', borderRadius: 18, border: `1.5px solid ${portal.border}`,
                padding: 28, height: '100%', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${portal.color}20`;
                  (e.currentTarget as HTMLElement).style.borderColor = portal.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = portal.border;
                }}>

                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${portal.color}08`, borderRadius: '0 18px 0 80px' }} />

                <div style={{ width: 52, height: 52, borderRadius: 14, background: portal.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 18, border: `1.5px solid ${portal.border}` }}>
                  {portal.icon}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#0F2137', margin: '0 0 10px', lineHeight: 1.2 }}>
                  {portal.title}
                </h3>
                <p style={{ color: '#6B7280', fontSize: '0.84rem', lineHeight: 1.7, margin: '0 0 20px' }}>
                  {portal.desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: portal.color, fontWeight: 700, fontSize: '0.84rem' }}>
                  Sign In
                  <span style={{ fontSize: '1rem', transition: 'transform 0.2s' }}>→</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
            🔒 Secure login · 📱 Mobile friendly · ⚡ Real-time updates
          </p>
        </div>
      </div>
    </section>
  );
}
