'use client';
import React from 'react';
import type { SchoolTheme } from '../../../types/theme';

export function SchoolFooter({ theme, slug, dark = false }: { theme: SchoolTheme; slug: string; dark?: boolean }) {
  const bg = dark ? theme.secondaryColor : theme.secondaryColor;
  return (
    <footer style={{ background: bg, color: 'rgba(255,255,255,0.8)', padding: '60px 0 32px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '0 0 14px' }}>{theme.schoolName}</h3>
            <p style={{ lineHeight: 1.8, fontSize: '0.88rem', maxWidth: 280, margin: '0 0 20px' }}>{theme.tagline}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {theme.socialLinks?.facebook && <a href={theme.socialLinks.facebook} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1rem' }}>📘</a>}
              {theme.socialLinks?.youtube  && <a href={theme.socialLinks.youtube}  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1rem' }}>📺</a>}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Quick Links</h4>
            {[['Student Portal', `/s/${slug}/portal`], ['Parent Portal', `/s/${slug}/parent`], ['Teacher Login', `/s/${slug}/teacher`], ['Admin Panel', `/s/${slug}/admin`]].map(([label, href]) => (
              <a key={label} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.86rem', marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target as any).style.color = '#fff'}
                onMouseLeave={e => (e.target as any).style.color = 'rgba(255,255,255,0.6)'}>
                {label}
              </a>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Contact</h4>
            {theme.phone   && <p style={{ fontSize: '0.86rem', margin: '0 0 8px' }}>📞 {theme.phone}</p>}
            {theme.email   && <p style={{ fontSize: '0.86rem', margin: '0 0 8px' }}>📧 {theme.email}</p>}
            {theme.address && <p style={{ fontSize: '0.86rem', margin: 0 }}>📍 {theme.address}</p>}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.78rem', margin: 0 }}>© {new Date().getFullYear()} {theme.schoolName}. All rights reserved.</p>
          <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.5 }}>Powered by MySchool App</p>
        </div>
      </div>
    </footer>
  );
}
