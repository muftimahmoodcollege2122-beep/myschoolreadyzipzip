'use client';
import React, { useState, useEffect } from 'react';
import type { SchoolTheme } from '../../../types/theme';

export function SchoolNav({ theme, slug, onApply, dark = false }: { theme: SchoolTheme; slug: string; onApply: () => void; dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const navBg = scrolled ? '#fff' : theme.navStyle === 'transparent' ? 'transparent' : theme.navStyle === 'gradient' ? `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})` : dark ? theme.secondaryColor : theme.primaryColor;
  const textColor = (!scrolled && (theme.navStyle === 'gradient' || dark || theme.navStyle === 'solid')) ? '#fff' : theme.primaryColor;

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: navBg, boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.3s', padding: '0 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={`/s/${slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {theme.logoUrl && <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }} />}
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: textColor, letterSpacing: '-0.02em' }}>{theme.schoolName}</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[['Home', `/s/${slug}`], ['About', `#about`], ['Admissions', `#admissions`], ['Contact', `#contact`]].map(([label, href]) => (
            <a key={label} href={href} style={{ color: textColor, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, padding: '8px 14px', borderRadius: 8, transition: 'all 0.2s', opacity: 0.85 }}
              onMouseEnter={e => { (e.target as any).style.opacity = '1'; (e.target as any).style.background = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { (e.target as any).style.opacity = '0.85'; (e.target as any).style.background = 'transparent'; }}>
              {label}
            </a>
          ))}
          <button onClick={onApply} style={{ marginLeft: 8, padding: '9px 20px', background: scrolled ? theme.primaryColor : '#fff', color: scrolled ? '#fff' : theme.primaryColor, border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            Apply Now
          </button>
        </div>
      </div>
    </nav>
  );
}
