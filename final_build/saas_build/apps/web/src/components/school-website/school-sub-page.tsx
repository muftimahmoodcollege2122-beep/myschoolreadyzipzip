'use client';
import React, { useState } from 'react';
import type { SchoolTheme } from '@/types/theme';
import { ThemeProvider } from './theme-provider';
import { SchoolNav } from './partials/nav';
import { SchoolFooter } from './partials/footer';
import { AdmissionForm } from './partials/admission-form';

interface Props {
  theme: SchoolTheme;
  slug: string;
  pageName: string;
  pageSubtitle?: string;
  children: React.ReactNode;
}

export function SchoolSubPage({ theme, slug, pageName, pageSubtitle, children }: Props) {
  const [showAdmission, setShowAdmission] = useState(false);
  return (
    <ThemeProvider theme={theme}>
      <div style={{ background: theme.bgColor, minHeight: '100vh' }}>
        <SchoolNav theme={theme} slug={slug} onApply={() => setShowAdmission(true)} />
        <div style={{
          background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
          padding: '110px 24px 52px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
            <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,3rem)', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.15 }}>{pageName}</h1>
            {pageSubtitle && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', margin: '0 0 16px', lineHeight: 1.6 }}>{pageSubtitle}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
              <a href={`/s/${slug}`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}>
                🏠 Home
              </a>
              <span style={{ opacity: 0.4 }}>›</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{pageName}</span>
            </div>
          </div>
        </div>
        {children}
        <SchoolFooter theme={theme} slug={slug} />
        {showAdmission && <AdmissionForm theme={theme} slug={slug} onClose={() => setShowAdmission(false)} />}
      </div>
    </ThemeProvider>
  );
}
