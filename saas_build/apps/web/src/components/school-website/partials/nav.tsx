'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { SchoolTheme } from '../../../types/theme';

const PORTALS = [
  { label: '🎓 Student Portal',   role: 'student',  color: '#059669' },
  { label: '👨‍👩‍👧 Parent Portal',   role: 'parent',   color: '#2563EB' },
  { label: '👨‍🏫 Teacher Portal',  role: 'teacher',  color: '#7C3AED' },
  { label: '🔐 Admin Dashboard',  role: 'admin',    color: '#DC2626' },
];

export function SchoolNav({ theme, slug, onApply, dark = false }: {
  theme: SchoolTheme; slug: string; onApply: () => void; dark?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (portalRef.current && !portalRef.current.contains(e.target as Node)) setPortalOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isLight = scrolled;
  const navBg = scrolled
    ? 'rgba(255,255,255,0.97)'
    : theme.navStyle === 'transparent' ? 'transparent'
    : theme.navStyle === 'gradient' ? `linear-gradient(90deg,${theme.primaryColor},${theme.secondaryColor})`
    : dark ? theme.secondaryColor : theme.primaryColor;

  const textColor = isLight ? theme.primaryColor : '#fff';
  const textMuted  = isLight ? '#6B7280' : 'rgba(255,255,255,0.75)';

  const getPortalHref = (role: string) => {
    const links = (theme as any).portalLinks || {};
    return links[role] || `/s/${slug}/${role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : role === 'parent' ? 'parent' : 'portal'}`;
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: navBg,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 24px', height: 70, display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Logo */}
          <a href={`/s/${slug}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            {theme.logoUrl
              ? <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${isLight ? theme.primaryColor+'30' : 'rgba(255,255,255,0.35)'}` }} />
              : <div style={{ width: 42, height: 42, borderRadius: 10, background: isLight ? theme.primaryColor : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: isLight ? '#fff' : theme.primaryColor, fontSize: '1.1rem' }}>
                  {theme.schoolName?.charAt(0) || 'S'}
                </div>}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.95rem', color: textColor, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{theme.schoolName}</span>
              {theme.city && <span style={{ fontSize: '0.65rem', color: textMuted, lineHeight: 1 }}>{theme.city}</span>}
            </div>
          </a>

          {/* Nav Links */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
            {[['Home', `/s/${slug}`], ['About', '#about'], ['Academics', '#programs'], ['Admissions', '#admissions'], ['Contact', '#contact']].map(([label, href]) => (
              <a key={label} href={href} style={{
                color: textColor, textDecoration: 'none', fontSize: '0.86rem', fontWeight: 500,
                padding: '7px 13px', borderRadius: 8, transition: 'all 0.2s', opacity: 0.85,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                {label}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Portal Dropdown */}
            <div ref={portalRef} style={{ position: 'relative' }}>
              <button onClick={() => setPortalOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  background: isLight ? `${theme.primaryColor}12` : 'rgba(255,255,255,0.12)',
                  color: textColor, border: `1.5px solid ${isLight ? `${theme.primaryColor}25` : 'rgba(255,255,255,0.2)'}`,
                  fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}>
                🔐 Portals
                <span style={{ fontSize: '0.6rem', opacity: 0.7, transition: 'transform 0.2s', transform: portalOpen ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
              </button>

              {portalOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#fff', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #F0F4F8', minWidth: 220, overflow: 'hidden', zIndex: 100,
                }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F4F8' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sign in as</div>
                  </div>
                  {PORTALS.map(p => (
                    <a key={p.role} href={getPortalHref(p.role)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        textDecoration: 'none', color: '#1F2937', fontSize: '0.88rem', fontWeight: 600,
                        transition: 'all 0.15s', borderBottom: '1px solid #F9FAFB',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${p.color}08`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>
                        {p.label.split(' ')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>{p.label.slice(3)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Sign in →</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Apply Now */}
            <button onClick={onApply} style={{
              padding: '9px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', border: 'none',
              background: scrolled ? theme.primaryColor : '#fff',
              color: scrolled ? '#fff' : theme.primaryColor,
              boxShadow: scrolled ? `0 4px 14px ${theme.primaryColor}40` : 'none',
            }}>
              Apply Now
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'transparent', border: 'none', color: textColor, fontSize: '1.4rem', cursor: 'pointer', padding: 4 }}
              className="mobile-menu-btn">
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ position: 'fixed', top: 70, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setMobileOpen(false)}>
          <div style={{ background: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }} onClick={e => e.stopPropagation()}>
            {[['Home', `/s/${slug}`], ['About', '#about'], ['Academics', '#programs'], ['Admissions', '#admissions'], ['Contact', '#contact']].map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMobileOpen(false)} style={{ color: theme.primaryColor, textDecoration: 'none', fontWeight: 600, fontSize: '1rem', padding: '8px 0', borderBottom: '1px solid #F0F4F8' }}>{label}</a>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 }}>Portals</div>
              {PORTALS.map(p => (
                <a key={p.role} href={getPortalHref(p.role)} style={{ display: 'block', color: '#1F2937', textDecoration: 'none', padding: '8px 0', fontSize: '0.9rem', fontWeight: 600, borderBottom: '1px solid #F9FAFB' }}>{p.label}</a>
              ))}
            </div>
            <button onClick={onApply} style={{ marginTop: 8, padding: '12px', background: theme.primaryColor, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Apply for Admission</button>
          </div>
        </div>
      )}
    </>
  );
}
