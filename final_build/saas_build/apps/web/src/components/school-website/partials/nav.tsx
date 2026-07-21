'use client';
import React, { useState, useEffect } from 'react';
import type { SchoolTheme } from '@/types/theme';

const NAV_LINKS = (slug: string) => [
  { label: 'Home',       href: `/s/${slug}` },
  { label: 'About',      href: `/s/${slug}/about` },
  { label: 'Admissions', href: `/s/${slug}/admissions` },
  { label: 'Academics',  href: `/s/${slug}/academics` },
  { label: 'News',       href: `/s/${slug}/news` },
  { label: 'Gallery',    href: `/s/${slug}/gallery` },
  { label: 'Contact',    href: `/s/${slug}/contact` },
];

export function SchoolNav({ theme, slug, onApply, dark = false }: {
  theme: SchoolTheme; slug: string; onApply: () => void; dark?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navBg = scrolled
    ? '#fff'
    : theme.navStyle === 'transparent' ? 'transparent'
    : theme.navStyle === 'gradient' ? `linear-gradient(90deg,${theme.primaryColor},${theme.secondaryColor})`
    : dark ? theme.secondaryColor : theme.primaryColor;

  const tc = (!scrolled && (theme.navStyle === 'gradient' || dark || theme.navStyle !== 'transparent')) ? '#fff' : theme.primaryColor;

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: navBg, boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.10)' : 'none', transition: 'all 0.3s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 66, display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href={`/s/${slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0, marginRight: 8 }}>
            {theme.logoUrl
              ? <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.35)' }} />
              : <div style={{ width: 36, height: 36, borderRadius: 8, background: scrolled ? theme.primaryColor : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏫</div>
            }
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.98rem', color: tc, letterSpacing: '-0.01em', maxWidth: 160, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{theme.schoolName}</span>
          </a>

          <div id="school-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {NAV_LINKS(slug).map(({ label, href }) => (
              <a key={label} href={href}
                style={{ color: tc, textDecoration: 'none', fontSize: '0.81rem', fontWeight: 600, padding: '7px 9px', borderRadius: 7, transition: 'all 0.2s', opacity: 0.87, whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = scrolled ? `${theme.primaryColor}14` : 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.87'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <a href={`/s/${slug}/login`} id="school-login-btn"
              style={{ color: tc, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, padding: '7px 13px', borderRadius: 8, border: `1.5px solid ${scrolled ? theme.primaryColor + '45' : 'rgba(255,255,255,0.4)'}`, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = scrolled ? `${theme.primaryColor}14` : 'rgba(255,255,255,0.16)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              Login
            </a>
            <button onClick={onApply}
              style={{ padding: '8px 16px', background: scrolled ? theme.primaryColor : '#fff', color: scrolled ? '#fff' : theme.primaryColor, border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              Apply Now
            </button>
            <button id="school-hamburger" onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: tc, fontSize: '1.35rem', padding: '4px', lineHeight: 1, display: 'none' }}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{ position: 'fixed', top: 66, left: 0, right: 0, zIndex: 999, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px 0 16px', maxHeight: 'calc(100vh - 66px)', overflowY: 'auto' }}>
          {NAV_LINKS(slug).map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '12px 24px', color: theme.secondaryColor, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #F9FAFB' }}
              onMouseEnter={e => (e.currentTarget.style.background = `${theme.primaryColor}0f`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {label}
            </a>
          ))}
          <div style={{ padding: '14px 24px 0', display: 'flex', gap: 10 }}>
            <a href={`/s/${slug}/login`} style={{ flex: 1, textAlign: 'center', padding: '10px', border: `2px solid ${theme.primaryColor}`, borderRadius: 'var(--radius)', color: theme.primaryColor, fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}>Login</a>
            <button onClick={() => { setMobileOpen(false); onApply(); }} style={{ flex: 1, padding: '10px', background: theme.primaryColor, color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Apply Now</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          #school-desktop-nav { display: none !important; }
          #school-login-btn   { display: none !important; }
          #school-hamburger   { display: flex !important; }
        }
      `}</style>
    </>
  );
}
