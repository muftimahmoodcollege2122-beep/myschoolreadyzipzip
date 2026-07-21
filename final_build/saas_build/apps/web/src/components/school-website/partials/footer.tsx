'use client';
import React from 'react';
import type { SchoolTheme } from '@/types/theme';

export function SchoolFooter({ theme, slug, dark = false }: { theme: SchoolTheme; slug: string; dark?: boolean }) {
  const bg = theme.secondaryColor;
  return (
    <footer style={{ background: bg, color: 'rgba(255,255,255,0.75)', padding: '64px 0 28px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: 40, marginBottom: 52 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              {theme.logoUrl
                ? <img src={theme.logoUrl} alt={theme.schoolName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                : <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏫</div>
              }
              <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>{theme.schoolName}</h3>
            </div>
            <p style={{ lineHeight: 1.8, fontSize: '0.85rem', maxWidth: 260, margin: '0 0 20px' }}>{theme.tagline}</p>
            {(theme.phone || theme.email || theme.address) && (
              <div style={{ marginBottom: 20 }}>
                {theme.phone   && <p style={{ fontSize: '0.82rem', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}><span>📞</span>{theme.phone}</p>}
                {theme.email   && <p style={{ fontSize: '0.82rem', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}><span>✉️</span>{theme.email}</p>}
                {theme.address && <p style={{ fontSize: '0.82rem', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 6 }}><span>📍</span>{theme.address}</p>}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {theme.socialLinks?.facebook  && <a href={theme.socialLinks.facebook}  target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1rem', transition: 'background 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.2)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}>📘</a>}
              {theme.socialLinks?.instagram && <a href={theme.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1rem', transition: 'background 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.2)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}>📸</a>}
              {theme.socialLinks?.youtube   && <a href={theme.socialLinks.youtube}   target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1rem', transition: 'background 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.2)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}>📺</a>}
              {theme.socialLinks?.twitter   && <a href={theme.socialLinks.twitter}   target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: '1rem', transition: 'background 0.2s' }} onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.2)')} onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.1)')}>🐦</a>}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 16px' }}>School</h4>
            {[
              ['About Us',   `/s/${slug}/about`],
              ['Academics',  `/s/${slug}/academics`],
              ['Admissions', `/s/${slug}/admissions`],
              ['Gallery',    `/s/${slug}/gallery`],
              ['Contact',    `/s/${slug}/contact`],
            ].map(([l, h]) => (
              <a key={l} href={h} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.84rem', marginBottom: 9, transition: 'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#fff')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.55)')}>{l}</a>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 16px' }}>Resources</h4>
            {[
              ['News & Notices', `/s/${slug}/news`],
              ['Exam Results',   `/s/${slug}/results`],
              ['Fee Structure',  `/s/${slug}/fees`],
            ].map(([l, h]) => (
              <a key={l} href={h} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.84rem', marginBottom: 9, transition: 'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#fff')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.55)')}>{l}</a>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 16px' }}>Portals</h4>
            {[
              ['Student Portal', `/learn/${slug}`],
              ['Parent Portal',  `/parent/${slug}`],
              ['Teacher Portal', `/t/${slug}`],
              ['Portal Login',   `/s/${slug}/login`],
            ].map(([l, h]) => (
              <a key={l} href={h} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '0.84rem', marginBottom: 9, transition: 'color 0.2s' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#fff')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.55)')}>{l}</a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: '0.76rem', margin: 0 }}>© {new Date().getFullYear()} {theme.schoolName}. Est. {theme.established}. {theme.city}.</p>
          <p style={{ fontSize: '0.76rem', margin: 0, opacity: 0.4 }}>Powered by <strong style={{ opacity: 0.7 }}>MySchool</strong></p>
        </div>
      </div>
    </footer>
  );
}
