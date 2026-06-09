'use client';
import React, { useState, useEffect } from 'react';
import type { SchoolTheme } from '../../../types/theme';
import { SchoolSubPage } from '../school-sub-page';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const CATEGORIES = ['All', 'Events', 'Sports', 'Academic', 'Annual Day', 'Campus'];

const PLACEHOLDER_PHOTOS = [
  { category: 'Annual Day', title: 'Annual Prize Distribution 2024', emoji: '🏆' },
  { category: 'Sports', title: 'Cricket Championship Final', emoji: '🏏' },
  { category: 'Academic', title: 'Science Lab Session', emoji: '🔬' },
  { category: 'Events', title: 'Independence Day Celebration', emoji: '🇵🇰' },
  { category: 'Campus', title: 'Our School Building', emoji: '🏫' },
  { category: 'Sports', title: 'Football Tournament', emoji: '⚽' },
  { category: 'Academic', title: 'Robotics Club Exhibition', emoji: '🤖' },
  { category: 'Annual Day', title: 'Cultural Performance', emoji: '🎭' },
  { category: 'Events', title: 'Eid Milad-un-Nabi Program', emoji: '🌙' },
  { category: 'Campus', title: 'Computer Lab Facilities', emoji: '💻' },
  { category: 'Sports', title: 'Athletics Race Day', emoji: '🏃' },
  { category: 'Academic', title: 'Art & Craft Exhibition', emoji: '🎨' },
  { category: 'Events', title: 'Parent-Teacher Meeting', emoji: '🤝' },
  { category: 'Annual Day', title: 'Drama Performance', emoji: '🎬' },
  { category: 'Campus', title: 'Library Study Hall', emoji: '📚' },
  { category: 'Sports', title: 'Basketball Championship', emoji: '🏀' },
  { category: 'Academic', title: 'Math Olympiad Winners', emoji: '🧮' },
  { category: 'Events', title: 'Earth Day Plantation', emoji: '🌳' },
];

const VIDEOS = [
  { title: 'School Tour — Virtual Walkthrough', duration: '4:32', thumb: '🎥', desc: 'Explore our state-of-the-art campus, labs, and sports facilities.' },
  { title: 'Annual Day 2024 Highlights', duration: '12:18', thumb: '🎭', desc: 'Relive the best moments from our Annual Day celebrations.' },
  { title: 'Students\' Achievements 2024', duration: '6:45', thumb: '🏆', desc: 'Celebrating our students who made us proud at national level.' },
];

export function GalleryPage({ theme, slug }: { theme: SchoolTheme; slug: string }) {
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = filter === 'All' ? PLACEHOLDER_PHOTOS : PLACEHOLDER_PHOTOS.filter(p => p.category === filter);
  const colors = [theme.primaryColor, theme.accentColor, theme.secondaryColor, '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6'];

  return (
    <SchoolSubPage theme={theme} slug={slug} pageName="Gallery" pageSubtitle="Capturing the moments that make our school community special">

      {/* Category Filter */}
      <section style={{ background: '#fff', padding: '28px 0', borderBottom: '1px solid #F3F4F6' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9CA3AF', marginRight: 4 }}>Filter:</span>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ padding: '8px 18px', borderRadius: 100, border: `1.5px solid ${filter === cat ? theme.primaryColor : '#E5E7EB'}`, background: filter === cat ? theme.primaryColor : '#fff', color: filter === cat ? '#fff' : '#6B7280', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                {cat}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#9CA3AF' }}>{filtered.length} photos</span>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section style={{ padding: '48px 0', background: `${theme.primaryColor}05` }}>
        <div className="container">
          <div style={{ columns: '4 200px', gap: 14 }}>
            {filtered.map((photo, i) => {
              const bg = colors[i % colors.length];
              const h = [180, 220, 160, 200, 240, 170, 210][i % 7];
              return (
                <div key={i}
                  onClick={() => setLightbox(i)}
                  style={{ breakInside: 'avoid', marginBottom: 14, borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', position: 'relative', background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.25s', userSelect: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: 10 }}>{photo.emoji}</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 16px 14px', background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}>
                    <p style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700, margin: '0 0 2px', lineHeight: 1.3 }}>{photo.title}</p>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 100 }}>{photo.category}</span>
                  </div>
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🔍</div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📷</div>
              <p style={{ color: '#9CA3AF' }}>No photos in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: theme.primaryColor, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Video Highlights</span>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '10px 0 0', fontWeight: 800 }}>School in Action</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {VIDEOS.map((v, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                <div style={{ background: `linear-gradient(135deg, ${theme.secondaryColor}, ${theme.primaryColor})`, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ fontSize: '4rem' }}>{v.thumb}</div>
                  <div style={{ position: 'absolute', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>▶</div>
                  <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{v.duration}</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 6px', fontSize: '0.92rem' }}>{v.title}</h4>
                  <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', maxWidth: 600, width: '100%' }}>
            <div style={{ background: `linear-gradient(135deg, ${colors[lightbox % colors.length]}, ${colors[lightbox % colors.length]}cc)`, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' }}>
              {filtered[lightbox]?.emoji}
            </div>
            <div style={{ padding: '20px 24px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: theme.secondaryColor, margin: '0 0 8px' }}>{filtered[lightbox]?.title}</h3>
              <span style={{ background: `${theme.primaryColor}15`, color: theme.primaryColor, fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>{filtered[lightbox]?.category}</span>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setLightbox(lightbox > 0 ? lightbox - 1 : filtered.length - 1)} style={{ flex: 1, padding: '10px', background: '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← Previous</button>
                <button onClick={() => setLightbox(null)} style={{ padding: '10px 20px', background: theme.primaryColor, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>✕ Close</button>
                <button onClick={() => setLightbox(lightbox < filtered.length - 1 ? lightbox + 1 : 0)} style={{ flex: 1, padding: '10px', background: '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Next →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SchoolSubPage>
  );
}
