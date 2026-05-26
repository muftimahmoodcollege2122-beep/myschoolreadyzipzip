'use client';
import React from 'react';
import type { SchoolTheme } from '../../../types/theme';

export function SchoolStats({ theme }: { theme: SchoolTheme }) {
  const stats = [
    { icon: '👩‍🎓', value: '1,500+', label: 'Students' },
    { icon: '👨‍🏫', value: '60+',    label: 'Teachers' },
    { icon: '📚', value: '15+',     label: 'Programs' },
    { icon: '🏆', value: '95%',     label: 'Pass Rate' },
  ];
  return (
    <section style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`, padding: '48px 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ color: '#fff', fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
