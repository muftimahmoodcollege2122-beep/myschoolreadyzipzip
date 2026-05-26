'use client';
import React from 'react';
import type { SchoolTheme } from '../../../types/theme';

export function SchoolFeatures({ theme }: { theme: SchoolTheme }) {
  const features = [
    { icon: '🎓', title: 'Academic Excellence', desc: 'Rigorous curriculum with experienced faculty delivering outstanding results.' },
    { icon: '🔬', title: 'Modern Facilities', desc: 'State-of-the-art labs, library, and smart classrooms for every student.' },
    { icon: '🏃', title: 'Sports & Activities', desc: 'Comprehensive sports programs and co-curricular activities for holistic development.' },
    { icon: '💻', title: 'Digital Learning', desc: 'Online portals, digital resources, and technology-integrated teaching methods.' },
    { icon: '🤝', title: 'Parent Partnership', desc: 'Regular PTMs, real-time updates, and open communication channels.' },
    { icon: '🌟', title: 'Character Building', desc: 'Strong values, discipline, and leadership skills developed alongside academics.' },
  ];
  return (
    <section className="section-padding" style={{ background: theme.bgColor }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Why Choose Us</span>
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '12px 0 0' }}>Everything Your Child Needs</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: 28, transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-4px)'; (e.currentTarget as any).style.boxShadow = `0 12px 32px ${theme.primaryColor}20`; }}
              onMouseLeave={e => { (e.currentTarget as any).style.transform = 'none'; (e.currentTarget as any).style.boxShadow = 'var(--shadow)'; }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--radius)', background: `${theme.primaryColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 10px', fontSize: '1.05rem' }}>{f.title}</h3>
              <p style={{ color: '#6B7280', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
